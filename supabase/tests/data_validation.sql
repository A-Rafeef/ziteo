-- Exercise the database boundary directly, bypassing TypeScript validators.
begin;
select '1..1';
create function pg_temp.assert_true(ok boolean,message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Assertion failed: %',message; end if; end $$;
grant execute on function pg_temp.assert_true(boolean,text) to authenticated;
insert into auth.users(id,email) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc','validation@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-8ccc-cccccccccccc',true);
insert into public.stores(id,owner_id,slug,data) values('cccccccc-0000-4000-8000-000000000001','cccccccc-cccc-4ccc-8ccc-cccccccccccc','validation-store','{"name":"Validation","draftDesign":{},"liveDesign":{}}');
select pg_temp.assert_true((select jsonb_typeof(data->'draftDesign'->'sections')='array' from public.stores),'omitted design fields materialize safe defaults');
insert into public.products(id,short_id,store_id,data) values('cccccccc-1111-4111-8111-111111111111','validproduct','cccccccc-0000-4000-8000-000000000001','{"name":"Valid","price":100,"images":["https://example.invalid/a.jpg"],"stock":"in_stock"}');
select pg_temp.assert_true((select data->'variants'='[]'::jsonb and data->'variantGroups'='[]'::jsonb from public.products),'omitted option arrays materialize safe defaults');
do $$ declare patch jsonb; rejected boolean; begin
 for patch in select value from jsonb_array_elements('[
 {"price":1.001},{"price":"100"},{"salePrice":100},{"salePrice":-1},{"salePrice":1.001},
 {"stock":null},{"stock":"available"},{"images":[123]},
 {"images":["javascript:alert(1)"]},{"images":["https://example.invalid/a.jpg","https://example.invalid/a.jpg"]},
 {"images":["/api/images/dddddddd-0000-4000-8000-000000000001/dddddddd-1111-4111-8111-111111111111.jpg"]},
 {"variants":null},{"variants":{}},{"variantGroups":{}},
 {"variantGroups":[{"name":"Size","values":["S","S"],"affectsPrice":false}],"variants":[]},
 {"variantGroups":[{"name":"Size","values":["S"],"affectsPrice":false}],"variants":[]},
 {"variantGroups":[{"name":"Size","values":["S"],"affectsPrice":false}],"variants":[{"id":"x","options":{"Size":"L"},"price":100,"salePrice":null,"stock":"in_stock"}]}
 ]'::jsonb) loop
  rejected:=false;
  begin update public.products set data=data||patch where id='cccccccc-1111-4111-8111-111111111111';
  exception when check_violation then rejected:=true; end;
  if not rejected then raise exception 'Malformed product accepted: %',patch; end if;
 end loop;
end $$;
do $$ declare patch jsonb; rejected boolean; begin
 for patch in select value from jsonb_array_elements('[
 {"name":null},{"hideOutOfStock":"false"},{"logo":"javascript:alert(1)"},
 {"draftDesign":{"sections":null}},{"draftDesign":{"columns":2.5}},
 {"draftDesign":{"showDiscount":"yes"}},{"draftDesign":{"accent":"red"}},
 {"draftDesign":{"sections":["navbar","products","products","footer"]}},
 {"draftDesign":{"heroImage":"javascript:alert(1)"}},
 {"liveDesign":{"heroImage":"/api/images/dddddddd-0000-4000-8000-000000000001/dddddddd-1111-4111-8111-111111111111.jpg"}}
 ]'::jsonb) loop
  rejected:=false;
  begin update public.stores set data=data||patch where id='cccccccc-0000-4000-8000-000000000001';
  exception when check_violation or invalid_parameter_value then rejected:=true; end;
  if not rejected then raise exception 'Malformed store accepted: %',patch; end if;
 end loop;
end $$;
update public.products set data=data||'{"variantGroups":[{"name":"Size","values":["S"],"affectsPrice":false}],"variants":[{"id":"x","options":{"Size":"S"},"price":100,"salePrice":null,"stock":"out_of_stock"}]}' where id='cccccccc-1111-4111-8111-111111111111';
select pg_temp.assert_true((select data->>'stock'='out_of_stock' from public.products),'variant availability determines product stock');
reset role;
select 'ok 1 - Direct Data API validates product and website JSON and supplies safe defaults';
rollback;
