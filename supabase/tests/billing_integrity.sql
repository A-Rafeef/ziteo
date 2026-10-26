-- Real PostgreSQL ledger and privilege checks; all provider events are simulations.
begin;
select '1..1';
create function pg_temp.billing_assert(ok boolean,message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Billing assertion failed: %',message; end if; end $$;
grant execute on function pg_temp.billing_assert(boolean,text) to authenticated,service_role;
insert into auth.users(id,email) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc','billing@example.invalid');
insert into public.stores(id,owner_id,slug,data) values('cccccccc-0000-4000-8000-000000000001','cccccccc-cccc-4ccc-8ccc-cccccccccccc','billing-fixture',jsonb_build_object(
 'name','Billing fixture','whatsapp','919876543210','description','','address','','contactEmail','','logo','','hideOutOfStock',false,'sample',false,
 'draftDesign','{"accent":"#264A3A","template":"editorial","heroTitle":"Hello","heroSubtitle":"","heroImage":"","columns":3,"cardStyle":"clean","imageRatio":"portrait","showDiscount":true,"sections":["navbar","hero","products","footer"],"aboutText":"","bannerText":"","textContent":"","alignment":"left"}'::jsonb,
 'liveDesign','{"accent":"#264A3A","template":"editorial","heroTitle":"Hello","heroSubtitle":"","heroImage":"","columns":3,"cardStyle":"clean","imageRatio":"portrait","showDiscount":true,"sections":["navbar","hero","products","footer"],"aboutText":"","bannerText":"","textContent":"","alignment":"left"}'::jsonb));
insert into public.store_verifications(store_id,phone) values('cccccccc-0000-4000-8000-000000000001','919876543210');

set local role authenticated;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
do $$ begin
 begin perform public.reserve_subscription('cccccccc-cccc-4ccc-8ccc-cccccccccccc','cccccccc-0000-4000-8000-000000000001','monthly',9900,1,'Seller','billing@example.invalid','919876543210','sandbox');
 exception when insufficient_privilege then return; end;
 raise exception 'Client could reserve arbitrary paid plan';
end $$;
do $$ begin
 begin insert into public.billing_events(environment,event_key,provider_subscription_id,event_type,event_time) values('production',repeat('1',64),'forged','SUBSCRIPTION_PAYMENT_SUCCESS',now());
 exception when insufficient_privilege then return; end;
 raise exception 'Client forged billing event';
end $$;
do $$ begin
 begin insert into public.billing_payments(subscription_id,store_id,environment,provider_payment_id,amount_minor,currency,period_start,period_end) values(gen_random_uuid(),'cccccccc-0000-4000-8000-000000000001','production','forged',1,'INR',now(),now()+interval '1 year');
 exception when insufficient_privilege then return; end;
 raise exception 'Client forged paid entitlement';
end $$;
reset role;
set local role service_role;
do $$ declare b jsonb; production jsonb; e jsonb; from_date timestamptz; end_date timestamptz; begin
 b:=public.reserve_subscription('cccccccc-cccc-4ccc-8ccc-cccccccccccc','cccccccc-0000-4000-8000-000000000001','monthly',9900,1,'Seller','billing@example.invalid','919876543210','sandbox');
 production:=public.reserve_subscription('cccccccc-cccc-4ccc-8ccc-cccccccccccc','cccccccc-0000-4000-8000-000000000001','monthly',9900,1,'Seller','billing@example.invalid','919876543210','production');
 perform pg_temp.billing_assert(b->>'id'<>production->>'id','sandbox and production reservations are isolated');
 perform public.complete_subscription_creation((b->>'id')::uuid,'first-session');
 perform public.complete_subscription_creation((b->>'id')::uuid,'duplicate-session');
 perform pg_temp.billing_assert((select session_id='first-session' and api_state='ready' from public.billing_subscriptions where id=(b->>'id')::uuid),'retry cannot overwrite a saved checkout session');
 -- Simulate renewals across historical calendar periods in one test transaction.
 update public.billing_subscriptions set created_at=now()-interval '1 year' where id=(b->>'id')::uuid;
 from_date:=date_trunc('month',now())-interval '1 month';
 e:=jsonb_build_object('type','SUBSCRIPTION_PAYMENT_SUCCESS','event_time',now(),'subscription_id',b->>'provider_id','payment_id','renewal-1','payment_type','CHARGE','payment_status','SUCCESS','amount_minor',9900,'currency','INR','period_start',from_date);
 perform public.record_cashfree_event('sandbox',md5('charge1')||md5('charge1'),e);
 perform pg_temp.billing_assert((select period_end=from_date+interval '1 month' from public.billing_payments where provider_payment_id='renewal-1'),'calendar month entitlement is exact');
 perform public.record_cashfree_event('sandbox',md5('same-payment-new-event')||md5('same-payment-new-event'),e);
 perform pg_temp.billing_assert((select count(*)=1 from public.billing_payments),'same payment with another delivery body never extends access');
 from_date:=now()-interval '1 day'; end_date:=from_date+interval '1 month';
 e:=jsonb_set(jsonb_set(e,'{payment_id}','"renewal-2"'),'{period_start}',to_jsonb(from_date));
 perform public.record_cashfree_event('sandbox',md5('charge2')||md5('charge2'),e);
 perform pg_temp.billing_assert((select count(*)=2 from public.billing_payments),'successive scheduled renewals create distinct periods');
 perform pg_temp.billing_assert((select max(period_end)=end_date from public.billing_payments where not refunded and period_start<=now()),'most recent paid renewal determines current access');
 e:=jsonb_set(jsonb_set(e,'{payment_id}','"bad-currency"'),'{currency}','"USD"');
 perform pg_temp.billing_assert(public.record_cashfree_event('sandbox',md5('bad-currency')||md5('bad-currency'),e)='payment_mismatch','currency mismatch fails closed');
 e:=jsonb_set(jsonb_set(e,'{payment_id}','"missing-schedule"'),'{currency}','"INR"')-'period_start';
 perform pg_temp.billing_assert(public.record_cashfree_event('sandbox',md5('missing-schedule')||md5('missing-schedule'),e)='payment_mismatch','missing charge schedule fails closed');
 e:=jsonb_set(e,'{period_start}',to_jsonb(from_date));
 perform pg_temp.billing_assert(public.record_cashfree_event('production',md5('wrong-env')||md5('wrong-env'),e)='unknown_subscription','sandbox event cannot grant production access');
 perform pg_temp.billing_assert((select count(*)=0 from public.billing_payments where environment='production'),'production has no paid period from sandbox');
 -- A late failure and mandate cancellation do not erase a successfully paid period.
 e:=jsonb_build_object('type','SUBSCRIPTION_PAYMENT_FAILED','event_time',now(),'subscription_id',b->>'provider_id','payment_id','renewal-2','payment_type','CHARGE','payment_status','FAILED');
 perform public.record_cashfree_event('sandbox',md5('late-failure')||md5('late-failure'),e);
 e:=jsonb_build_object('type','SUBSCRIPTION_STATUS_CHANGED','event_time',now(),'subscription_id',b->>'provider_id','subscription_status','CANCELLED');
 perform public.record_cashfree_event('sandbox',md5('cancel')||md5('cancel'),e);
 perform pg_temp.billing_assert((select max(period_end)=end_date from public.billing_payments where not refunded and period_start<=now()),'cancellation/failure retains an already-paid period');
 -- The documented refund payload has no subscription_id. Partial refunds must not overrevoke.
 e:=jsonb_build_object('type','SUBSCRIPTION_REFUND_STATUS','event_time',now(),'payment_id','renewal-1','refund_status','SUCCESS','refund_id','partial-1','refund_amount_minor',900);
 perform public.record_cashfree_event('sandbox',md5('partial1')||md5('partial1'),e);
 perform public.record_cashfree_event('sandbox',md5('partial1-delivery2')||md5('partial1-delivery2'),e);
 perform pg_temp.billing_assert((select not refunded from public.billing_payments where provider_payment_id='renewal-1'),'partial refund retains the paid period');
 perform pg_temp.billing_assert((select sum(amount_minor)=900 from public.billing_refunds where provider_payment_id='renewal-1'),'repeated refund ID is counted once');
 e:=jsonb_set(jsonb_set(e,'{refund_id}','"partial-2"'),'{refund_amount_minor}','9000');
 perform public.record_cashfree_event('sandbox',md5('partial2')||md5('partial2'),e);
 perform pg_temp.billing_assert((select refunded from public.billing_payments where provider_payment_id='renewal-1'),'cumulative full refund removes only the covered period');
 perform pg_temp.billing_assert((select not refunded and period_end=end_date from public.billing_payments where provider_payment_id='renewal-2'),'refund of an earlier renewal preserves a later paid renewal');
 -- Refund-before-charge ordering must behave exactly like charge-before-refund.
 e:=jsonb_build_object('type','SUBSCRIPTION_REFUND_STATUS','event_time',now(),'payment_id','reordered-charge','refund_status','SUCCESS','refund_id','before-charge','refund_amount_minor',9900);
 perform public.record_cashfree_event('sandbox',md5('before-charge')||md5('before-charge'),e);
 e:=jsonb_build_object('type','SUBSCRIPTION_PAYMENT_SUCCESS','event_time',now(),'subscription_id',b->>'provider_id','payment_id','reordered-charge','payment_type','CHARGE','payment_status','SUCCESS','amount_minor',9900,'currency','INR','period_start',from_date);
 perform public.record_cashfree_event('sandbox',md5('reordered-charge')||md5('reordered-charge'),e);
 perform pg_temp.billing_assert((select refunded from public.billing_payments where provider_payment_id='reordered-charge'),'earlier refund tombstone prevents resurrecting paid access');
end $$;
reset role;
select 'ok 1 - Renewal periods, environment isolation, refunds, retries and billing grants';
rollback;
