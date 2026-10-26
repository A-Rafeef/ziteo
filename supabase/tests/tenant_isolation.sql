-- Plain TAP output lets `supabase test db` run this without installing pgTAP.
-- All fixtures and provider simulations are rolled back, including Auth users.
begin;
select '1..1';
create function pg_temp.assert_true(ok boolean,message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Assertion failed: %',message; end if; end $$;
grant execute on function pg_temp.assert_true(boolean,text) to anon,authenticated,service_role;
insert into auth.users(id,email) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','rls-a@example.invalid'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','rls-b@example.invalid');
insert into public.stores(id,owner_id,slug,data) values
('aaaaaaaa-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','test-seller-a','{"name":"Seller A","whatsapp":"919876543210","description":"A","address":"","contactEmail":"","logo":"","hideOutOfStock":false,"draftDesign":{"heroTitle":"PUBLISH ME"},"liveDesign":{"heroTitle":"OLD"},"sample":false}'),
('bbbbbbbb-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','test-seller-b','{"name":"Seller B","whatsapp":"919876543211","draftDesign":{},"liveDesign":{}}');
insert into public.products(id,short_id,store_id,status,data) values
('aaaaaaaa-1111-4111-8111-111111111111','productA1','aaaaaaaa-0000-4000-8000-000000000001','published','{"name":"Public product","price":100,"images":["https://example.invalid/a.jpg"],"stock":"in_stock","variantGroups":[],"variants":[]}'),
('aaaaaaaa-2222-4222-8222-222222222222','draftA22','aaaaaaaa-0000-4000-8000-000000000001','draft','{"name":"PRIVATE PRODUCT","price":100,"images":["https://example.invalid/private.jpg"],"stock":"in_stock"}'),
('bbbbbbbb-1111-4111-8111-111111111111','productB1','bbbbbbbb-0000-4000-8000-000000000001','draft','{"name":"Seller B private","price":100,"images":["https://example.invalid/b.jpg"],"stock":"in_stock"}');

set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select pg_temp.assert_true((select count(*)=1 from public.stores),'seller A sees only own store');
select pg_temp.assert_true((select count(*)=2 from public.products),'seller A sees only own products');
select pg_temp.assert_true(not public.is_store_phone_verified('aaaaaaaa-0000-4000-8000-000000000001'),'new phone is unverified');
with changed as (update public.stores set data=data||'{"name":"attacker"}' where id='bbbbbbbb-0000-4000-8000-000000000001' returning id)
select pg_temp.assert_true((select count(*)=0 from changed),'cross-tenant update denied');
with changed as (delete from public.products where id='bbbbbbbb-1111-4111-8111-111111111111' returning id)
select pg_temp.assert_true((select count(*)=0 from changed),'cross-tenant delete denied');
do $$ begin
 begin insert into public.products(short_id,store_id,data) values('intruder','bbbbbbbb-0000-4000-8000-000000000001','{"name":"attack","price":100,"images":["https://example.invalid/x.jpg"],"stock":"in_stock"}');
 exception when insufficient_privilege then return; end;
 raise exception 'Cross-tenant insert was allowed';
end $$;
do $$ begin
 begin update public.stores set published=true where id='aaaaaaaa-0000-4000-8000-000000000001';
 exception when check_violation then return; end;
 raise exception 'Unverified direct publish was allowed';
end $$;
do $$ begin
 begin insert into public.store_verifications(store_id,phone) values('aaaaaaaa-0000-4000-8000-000000000001','919876543210');
 exception when insufficient_privilege then return; end;
 raise exception 'Client forged phone verification';
end $$;
do $$ begin
 begin perform public.reserve_phone_verification('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001');
 exception when insufficient_privilege then return; end;
 raise exception 'Client called service-only phone function';
end $$;
do $$ begin
 begin update public.products set store_id='bbbbbbbb-0000-4000-8000-000000000001' where id='aaaaaaaa-1111-4111-8111-111111111111';
 exception when check_violation or insufficient_privilege then return; end;
 raise exception 'Product tenant reassignment was allowed';
end $$;
do $$ begin
 begin insert into public.media_assets(store_id,object_key,mime_type,byte_size) values('bbbbbbbb-0000-4000-8000-000000000001','bbbbbbbb-0000-4000-8000-000000000001/x.jpg','image/jpeg',100);
 exception when insufficient_privilege then return; end;
 raise exception 'Cross-tenant media insert was allowed';
end $$;

reset role;
set local role service_role;
do $$ declare c jsonb; begin
 c := public.reserve_phone_verification('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001');
 perform set_config('ziteo_test.challenge',c->>'challenge_id',true);
 perform public.attach_phone_session((c->>'challenge_id')::uuid,'test-provider-session');
end $$;
do $$ begin
 begin perform public.reserve_phone_verification('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001');
 exception when raise_exception then return; end;
 raise exception 'Phone cooldown did not apply';
end $$;
do $$ begin
 for attempt in 1..5 loop perform public.claim_phone_attempt('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001',current_setting('ziteo_test.challenge')::uuid); end loop;
 begin perform public.claim_phone_attempt('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001',current_setting('ziteo_test.challenge')::uuid);
 exception when raise_exception then return; end;
 raise exception 'Sixth verification attempt was allowed';
end $$;
-- The fifth successful provider attempt remains confirmable; it consumes the challenge.
select public.confirm_phone_verification('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001',current_setting('ziteo_test.challenge')::uuid);
do $$ begin
 begin perform public.confirm_phone_verification('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001',current_setting('ziteo_test.challenge')::uuid);
 exception when raise_exception then return; end;
 raise exception 'Consumed verification challenge was reused';
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
select pg_temp.assert_true(public.is_store_phone_verified('aaaaaaaa-0000-4000-8000-000000000001'),'verified phone visible to owner');
update public.stores set published=true where id='aaaaaaaa-0000-4000-8000-000000000001';
update public.stores set data=jsonb_set(data,'{draftDesign}','{"heroTitle":"PRIVATE DESIGN"}') where id='aaaaaaaa-0000-4000-8000-000000000001';
select pg_temp.assert_true((select data->'store'->'liveDesign'->>'heroTitle'='PUBLISH ME' from public.storefronts where slug='test-seller-a'),'saving draft does not publish it');
select pg_temp.assert_true((select count(*)=0 from public.save_store('aaaaaaaa-0000-4000-8000-000000000001',0,'{}','test-seller-a',true)),'stale store revision cannot overwrite changes');

-- Both plans use the same database invariant; clients cannot bypass a product cap.
insert into public.products(id,short_id,store_id,data)
select md5('cap'||g)::uuid,'cap-product-'||g,'aaaaaaaa-0000-4000-8000-000000000001','{"name":"Cap fixture","price":1,"images":["https://example.invalid/c.jpg"],"stock":"in_stock"}'::jsonb from generate_series(1,48) g;
select pg_temp.assert_true((select count(*)=50 from public.products),'50 active products permitted');
do $$ begin
 begin insert into public.products(short_id,store_id,data) values('cap-product-51','aaaaaaaa-0000-4000-8000-000000000001','{"name":"Cap fixture","price":1,"images":["https://example.invalid/c.jpg"],"stock":"in_stock"}');
 exception when check_violation then return; end;
 raise exception 'Product cap bypassed';
end $$;
update public.products set status='archived' where short_id='cap-product-1';
update public.products set archived_at=now()+interval '1 year' where short_id='cap-product-1';
select pg_temp.assert_true((select archived_at=now() from public.products where short_id='cap-product-1'),'clients cannot extend the product recovery window');
insert into public.products(short_id,store_id,data) values('replacement','aaaaaaaa-0000-4000-8000-000000000001','{"name":"Replacement","price":1,"images":["https://example.invalid/c.jpg"],"stock":"in_stock"}');
do $$ begin
 begin update public.products set status='draft' where short_id='cap-product-1';
 exception when check_violation then return; end;
 raise exception 'Restore bypassed product cap';
end $$;

reset role;
set local role anon;
select pg_temp.assert_true((select count(*)=1 from public.storefronts),'anonymous sees only published storefront');
select pg_temp.assert_true((select jsonb_array_length(data->'products')=1 from public.storefronts),'public snapshot excludes draft and archived products');
select pg_temp.assert_true((select data::text not like '%PRIVATE DESIGN%' and data::text not like '%PRIVATE PRODUCT%' and not (data->'store' ? 'owner_id') and not (data->'store' ? 'phoneVerified') from public.storefronts),'snapshot excludes drafts and internal fields');
do $$ begin
 begin perform * from public.stores;
 exception when insufficient_privilege then return; end;
 raise exception 'Anonymous private store read allowed';
end $$;
do $$ begin
 begin perform * from public.products;
 exception when insufficient_privilege then return; end;
 raise exception 'Anonymous private product read allowed';
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select pg_temp.assert_true(not public.is_store_phone_verified('aaaaaaaa-0000-4000-8000-000000000001'),'another seller cannot inspect verification state');
select pg_temp.assert_true((select count(*)=1 from public.stores),'seller B sees only own store');

reset role;
set local role service_role;
do $$ declare b jsonb; again jsonb; e jsonb; result text; begin
 b:=public.reserve_subscription('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001','monthly',9900,1,'Test Seller','rls-a@example.invalid','919876543210','sandbox');
 again:=public.reserve_subscription('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-0000-4000-8000-000000000001','monthly',9900,1,'Test Seller','rls-a@example.invalid','919876543210','sandbox');
 perform pg_temp.assert_true(b->>'id'=again->>'id','retry reuses pending subscription');
 e:=jsonb_build_object('type','SUBSCRIPTION_PAYMENT_SUCCESS','event_time',now(),'subscription_id',b->>'provider_id','payment_id','test-auth','payment_type','AUTH','payment_status','SUCCESS','amount_minor',9900,'currency','INR','period_start',now());
 result:=public.record_cashfree_event('sandbox',repeat('a',64),e);
 perform pg_temp.assert_true(result='ignored' and not exists(select 1 from public.billing_payments),'mandate authorization does not grant Premium');
 e:=jsonb_set(jsonb_set(e,'{payment_type}','"CHARGE"'),'{payment_id}','"charge-1"');
 result:=public.record_cashfree_event('sandbox',repeat('b',64),e);
 perform pg_temp.assert_true(result='charge' and (select count(*)=1 from public.billing_payments),'successful matching charge grants paid period');
 result:=public.record_cashfree_event('sandbox',repeat('b',64),e);
 perform pg_temp.assert_true(result='duplicate' and (select count(*)=1 from public.billing_payments),'duplicate webhook is idempotent');
 e:=jsonb_set(jsonb_set(e,'{amount_minor}','1'),'{payment_id}','"bad-amount"');
 result:=public.record_cashfree_event('sandbox',repeat('c',64),e);
 perform pg_temp.assert_true(result='payment_mismatch' and (select count(*)=1 from public.billing_payments),'wrong payment amount cannot grant entitlement');
 e:=jsonb_build_object('type','SUBSCRIPTION_REFUND_STATUS','event_time',now(),'payment_id','late-charge','refund_status','SUCCESS','refund_id','early-refund','refund_amount_minor',9900);
 perform public.record_cashfree_event('sandbox',repeat('d',64),e);
 e:=jsonb_build_object('type','SUBSCRIPTION_PAYMENT_SUCCESS','event_time',now(),'subscription_id',b->>'provider_id','payment_id','late-charge','payment_type','CHARGE','payment_status','SUCCESS','amount_minor',9900,'currency','INR','period_start',now());
 perform public.record_cashfree_event('sandbox',repeat('e',64),e);
 perform pg_temp.assert_true((select refunded from public.billing_payments where provider_payment_id='late-charge'),'refund arriving before charge cannot restore entitlement');
 e:=jsonb_build_object('type','SUBSCRIPTION_STATUS_CHANGED','event_time',now(),'subscription_id',b->>'provider_id','subscription_status','CANCELLED');
 perform public.record_cashfree_event('sandbox',repeat('f',64),e);
 e:=jsonb_set(jsonb_set(e,'{event_time}',to_jsonb(now()-interval '1 day')),'{subscription_status}','"ACTIVE"');
 perform public.record_cashfree_event('sandbox',repeat('0',64),e);
 perform pg_temp.assert_true((select status='CANCELLED' from public.billing_subscriptions where id=(b->>'id')::uuid),'stale lifecycle event cannot overwrite newer status');
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
select pg_temp.assert_true((select count(*)=0 from public.billing_subscriptions),'billing tenant isolation');
do $$ begin
 begin perform public.record_cashfree_event('sandbox',repeat('1',64),'{}');
 exception when insufficient_privilege then return; end;
 raise exception 'Seller forged billing webhook';
end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
update public.stores set data=jsonb_set(data,'{whatsapp}','"919876543219"') where id='aaaaaaaa-0000-4000-8000-000000000001';
select pg_temp.assert_true(not public.is_store_phone_verified('aaaaaaaa-0000-4000-8000-000000000001'),'phone change invalidates verification');
select pg_temp.assert_true((select not published from public.stores),'phone change unpublishes store');
select pg_temp.assert_true((select count(*)=0 from public.storefronts),'unpublished snapshot removed');
reset role;
select 'ok 1 - Tenant isolation, public projections, publish verification, product caps, and billing integrity';
rollback;
