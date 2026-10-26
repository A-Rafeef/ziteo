-- Ziteo baseline. Existing D1 records require an explicit audited import; this
-- creates a fresh Postgres schema and does not rewrite the original application.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  published boolean not null default false,
  revision bigint not null default 0,
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  short_id text not null unique check (short_id ~ '^[a-zA-Z0-9_-]{6,64}$'),
  store_id uuid not null references public.stores(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  check ((status = 'archived') = (archived_at is not null))
);
create index products_store_created_idx on public.products(store_id,created_at desc);
create index products_active_idx on public.products(store_id) where status <> 'archived';
create index products_search_idx on public.products using gin(to_tsvector('simple', coalesce(data->>'name','') || ' ' || coalesce(data->>'description','')));

-- Public snapshots contain no owner identity, private website drafts, verification
-- records, archived products or billing fields. Neither client role can write them.
create table public.storefronts (
  store_id uuid primary key references public.stores(id) on delete cascade,
  slug text not null unique,
  data jsonb not null
);
create index storefronts_product_lookup_idx on public.storefronts using gin(data jsonb_path_ops);
create table public.daily_metrics (
  store_id uuid not null references public.stores(id) on delete cascade,
  date date not null default current_date,
  store_views bigint not null default 0,
  product_views bigint not null default 0,
  whatsapp_clicks bigint not null default 0,
  primary key(store_id,date)
);
create table public.store_verifications (
  store_id uuid primary key references public.stores(id) on delete cascade,
  phone text not null,
  verified_at timestamptz not null default now()
);
create table public.verification_challenges (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  phone text not null,
  provider_session_id text,
  attempts integer not null default 0 check (attempts between 0 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  consumed_at timestamptz
);
create index verification_store_created_idx on public.verification_challenges(store_id,created_at desc);
create index verification_user_idx on public.verification_challenges(user_id);
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  object_key text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 5242880),
  created_at timestamptz not null default now()
);
create index media_store_idx on public.media_assets(store_id);

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.storefronts enable row level security;
alter table public.daily_metrics enable row level security;
alter table public.store_verifications enable row level security;
alter table public.verification_challenges enable row level security;
alter table public.media_assets enable row level security;
revoke all on public.stores,public.products,public.storefronts,public.daily_metrics,public.store_verifications,public.verification_challenges,public.media_assets from anon,authenticated;
grant select on public.stores,public.products,public.daily_metrics,public.media_assets to authenticated;
grant insert on public.media_assets to authenticated;
grant insert(id,owner_id,slug,data) on public.stores to authenticated;
grant update(slug,data,published) on public.stores to authenticated;
grant insert,update,delete on public.products to authenticated;
grant select on public.storefronts to anon,authenticated;
grant all on public.stores,public.products,public.storefronts,public.daily_metrics,public.store_verifications,public.verification_challenges,public.media_assets to service_role;

create policy stores_owner_read on public.stores for select to authenticated using (owner_id = (select auth.uid()));
create policy stores_owner_insert on public.stores for insert to authenticated with check (owner_id = (select auth.uid()));
create policy stores_owner_update on public.stores for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy products_owner on public.products for all to authenticated
  using (exists(select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid())))
  with check (exists(select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid())));
create policy storefronts_public_read on public.storefronts for select to anon,authenticated using (true);
create policy metrics_owner_read on public.daily_metrics for select to authenticated using (exists(select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid())));
create policy media_owner_read on public.media_assets for select to authenticated using (exists(select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid())));
create policy media_owner_insert on public.media_assets for insert to authenticated with check (
  object_key like store_id::text || '/%' and
  exists(select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid()))
);

create function private.valid_image_url(p_url text,p_store uuid) returns boolean language sql immutable security invoker set search_path='' as $$
 select length(p_url) between 1 and 2000 and (
   p_url ~ '^https://[^[:space:]/@]+([/?#][^[:space:]]*)?$'
   or p_url ~ ('^/api/images/'||p_store::text||'/[0-9a-f-]{36}\.(jpg|png|webp)$')
 );
$$;
revoke all on function private.valid_image_url(text,uuid) from public,anon,authenticated;

create function private.validate_product_data(p_data jsonb,p_store uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 v_name text; v_description text; v_price numeric; v_sale numeric; v_stock text;
 v_images jsonb; v_groups jsonb; v_variants jsonb; normalized_groups jsonb:='[]'; normalized_variants jsonb:='[]';
 g jsonb; v jsonb; image jsonb; option_value jsonb; g_name text; g_values jsonb; normalized_values jsonb;
 seen_names text[]:='{}'; seen_values text[]; seen_images text[]:='{}'; seen_combinations text[]:='{}'; seen_ids text[]:='{}';
 combinations integer:=1; variant_price numeric; variant_sale numeric; variant_id text; variant_stock text; combination text; options jsonb;
 normalized_options jsonb; chosen text; image_source text;
 v_show_discount boolean:=true; v_sample boolean:=false;
begin
 if jsonb_typeof(p_data) is distinct from 'object' then raise exception 'Product must be an object' using errcode='23514'; end if;
 if jsonb_typeof(p_data->'name') is distinct from 'string' then raise exception 'Product name is required' using errcode='23514'; end if;
 v_name:=btrim(p_data->>'name');
 if length(v_name) not between 1 and 160 then raise exception 'Product name must have 1-160 characters' using errcode='23514'; end if;
 if p_data ? 'description' and jsonb_typeof(p_data->'description') is distinct from 'string' then raise exception 'Product description must be text' using errcode='23514'; end if;
 v_description:=coalesce(p_data->>'description','');
 if length(v_description)>10000 then raise exception 'Product description is too long' using errcode='23514'; end if;
 if jsonb_typeof(p_data->'price') is distinct from 'number' then raise exception 'Invalid product price' using errcode='23514'; end if;
 v_price:=(p_data->>'price')::numeric;
 if v_price<=0 or v_price>100000000 or round(v_price,2)<>v_price then raise exception 'Invalid product price' using errcode='23514'; end if;
 if p_data->'salePrice' is not null and p_data->'salePrice'<>'null'::jsonb then
   if jsonb_typeof(p_data->'salePrice') is distinct from 'number' then raise exception 'Invalid sale price' using errcode='23514'; end if;
   v_sale:=(p_data->>'salePrice')::numeric;
   if v_sale<=0 or v_sale>=v_price or round(v_sale,2)<>v_sale then raise exception 'Invalid sale price' using errcode='23514'; end if;
 end if;
 v_stock:=p_data->>'stock';
 if v_stock is null or v_stock not in ('in_stock','out_of_stock') then raise exception 'Invalid stock status' using errcode='23514'; end if;
 v_images:=p_data->'images';
 if jsonb_typeof(v_images) is distinct from 'array' then raise exception 'Product images are required' using errcode='23514'; end if;
 if jsonb_array_length(v_images) not between 1 and 5 then raise exception 'A product needs 1-5 images' using errcode='23514'; end if;
 for image in select value from jsonb_array_elements(v_images) loop
   if jsonb_typeof(image)<>'string' then raise exception 'Image URLs must be text' using errcode='23514'; end if;
   image_source:=image#>>'{}';
   if not private.valid_image_url(image_source,p_store) then raise exception 'Use an HTTPS image URL or an image owned by this store' using errcode='23514'; end if;
   if image_source=any(seen_images) then raise exception 'Remove duplicate product images' using errcode='23514'; end if;
   seen_images:=array_append(seen_images,image_source);
 end loop;
 if p_data ? 'showDiscount' then
   if jsonb_typeof(p_data->'showDiscount') is distinct from 'boolean' then raise exception 'Invalid discount display setting' using errcode='23514'; end if;
   v_show_discount:=(p_data->>'showDiscount')::boolean;
 end if;
 if p_data ? 'sample' then
   if jsonb_typeof(p_data->'sample') is distinct from 'boolean' then raise exception 'Invalid sample setting' using errcode='23514'; end if;
   v_sample:=(p_data->>'sample')::boolean;
 end if;
 v_groups:=coalesce(p_data->'variantGroups','[]'); v_variants:=coalesce(p_data->'variants','[]');
 if jsonb_typeof(v_groups) is distinct from 'array' or jsonb_typeof(v_variants) is distinct from 'array' then raise exception 'Product options and variants must be arrays' using errcode='23514'; end if;
 if jsonb_array_length(v_groups)>4 or jsonb_array_length(v_variants)>100 then raise exception 'Too many product options or variants' using errcode='23514'; end if;
 for g in select value from jsonb_array_elements(v_groups) loop
   if jsonb_typeof(g) is distinct from 'object' or jsonb_typeof(g->'name') is distinct from 'string' then raise exception 'Invalid option group' using errcode='23514'; end if;
   g_name:=btrim(g->>'name');
   if length(g_name) not between 1 and 60 or lower(g_name)=any(seen_names) then raise exception 'Option group names must be unique and have 1-60 characters' using errcode='23514'; end if;
   seen_names:=array_append(seen_names,lower(g_name));
   g_values:=g->'values';
   if jsonb_typeof(g_values) is distinct from 'array' then raise exception 'Option values must be an array' using errcode='23514'; end if;
   if jsonb_array_length(g_values) not between 1 and 100 then raise exception 'Every option group needs 1-100 values' using errcode='23514'; end if;
   combinations:=combinations*jsonb_array_length(g_values);
   if combinations>100 then raise exception 'Use no more than 100 variant combinations' using errcode='23514'; end if;
   seen_values:='{}'; normalized_values:='[]';
   for option_value in select value from jsonb_array_elements(g_values) loop
     if jsonb_typeof(option_value)<>'string' then raise exception 'Option values must be text' using errcode='23514'; end if;
     chosen:=btrim(option_value#>>'{}');
     if length(chosen) not between 1 and 60 or lower(chosen)=any(seen_values) then raise exception 'Option values must be unique and have 1-60 characters' using errcode='23514'; end if;
     seen_values:=array_append(seen_values,lower(chosen));
     normalized_values:=normalized_values||jsonb_build_array(chosen);
   end loop;
   if g ? 'affectsPrice' and jsonb_typeof(g->'affectsPrice') is distinct from 'boolean' then raise exception 'Invalid option price setting' using errcode='23514'; end if;
   normalized_groups:=normalized_groups||jsonb_build_array(jsonb_build_object('name',g_name,'values',normalized_values,'affectsPrice',coalesce((g->>'affectsPrice')::boolean,false)));
 end loop;
 if (jsonb_array_length(v_groups)=0 and jsonb_array_length(v_variants)<>0)
   or (jsonb_array_length(v_groups)>0 and jsonb_array_length(v_variants)<>combinations) then raise exception 'Generate every option combination exactly once' using errcode='23514'; end if;
 for v in select value from jsonb_array_elements(v_variants) loop
   if jsonb_typeof(v) is distinct from 'object' then raise exception 'Invalid variant' using errcode='23514'; end if;
   options:=v->'options'; normalized_options:='{}';
   if jsonb_typeof(options) is distinct from 'object' then raise exception 'Variant options must be an object' using errcode='23514'; end if;
   if (select count(*) from jsonb_object_keys(options))<>jsonb_array_length(normalized_groups) then raise exception 'Every variant needs every option group' using errcode='23514'; end if;
   for g in select value from jsonb_array_elements(normalized_groups) loop
     g_name:=g->>'name'; chosen:=options->>g_name;
     if jsonb_typeof(options->g_name) is distinct from 'string' or not ((g->'values') ? chosen) then raise exception 'Invalid variant option value' using errcode='23514'; end if;
     normalized_options:=normalized_options||jsonb_build_object(g_name,chosen);
   end loop;
   combination:=normalized_options::text;
   if combination=any(seen_combinations) then raise exception 'Variant combinations must be unique' using errcode='23514'; end if;
   seen_combinations:=array_append(seen_combinations,combination);
   if jsonb_typeof(v->'id') is distinct from 'string' or length(v->>'id') not between 1 and 100 then raise exception 'Invalid variant identifier' using errcode='23514'; end if;
   variant_id:=v->>'id';
   if variant_id=any(seen_ids) then raise exception 'Variant identifiers must be unique' using errcode='23514'; end if;
   seen_ids:=array_append(seen_ids,variant_id);
   if jsonb_typeof(v->'price') is distinct from 'number' then raise exception 'Invalid variant price' using errcode='23514'; end if;
   variant_price:=(v->>'price')::numeric;
   if variant_price<=0 or variant_price>100000000 or round(variant_price,2)<>variant_price then raise exception 'Invalid variant price' using errcode='23514'; end if;
   variant_sale:=null;
   if v->'salePrice' is not null and v->'salePrice'<>'null'::jsonb then
     if jsonb_typeof(v->'salePrice') is distinct from 'number' then raise exception 'Invalid variant sale price' using errcode='23514'; end if;
     variant_sale:=(v->>'salePrice')::numeric;
     if variant_sale<=0 or variant_sale>=variant_price or round(variant_sale,2)<>variant_sale then raise exception 'Invalid variant sale price' using errcode='23514'; end if;
   end if;
   variant_stock:=v->>'stock';
   if variant_stock is null or variant_stock not in ('in_stock','out_of_stock') then raise exception 'Invalid variant stock' using errcode='23514'; end if;
   normalized_variants:=normalized_variants||jsonb_build_array(jsonb_build_object('id',variant_id,'options',normalized_options,'price',variant_price,'salePrice',variant_sale,'stock',variant_stock));
 end loop;
 if jsonb_array_length(normalized_variants)>0 then
   v_stock:=case when exists(select 1 from jsonb_array_elements(normalized_variants) item where item->>'stock'='in_stock') then 'in_stock' else 'out_of_stock' end;
 end if;
 return jsonb_build_object('name',v_name,'description',v_description,'price',v_price,'salePrice',v_sale,'images',v_images,'stock',v_stock,
   'showDiscount',v_show_discount,'variantGroups',normalized_groups,'variants',normalized_variants,'sample',v_sample);
end $$;
revoke all on function private.validate_product_data(jsonb,uuid) from public,anon,authenticated;

create or replace function private.validate_design(p_design jsonb,p_store uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v jsonb;
  v_result jsonb;
  v_key text;
  v_limit integer;
  v_value jsonb;
  v_sections jsonb;
  v_section_count integer;
  v_unique_count integer;
  v_defaults constant jsonb := $json${
    "accent":"#264A3A","template":"editorial",
    "heroTitle":"Everyday things.\nExtraordinary living.",
    "heroSubtitle":"Thoughtfully chosen pieces for the way you live. Discover a little something to make every day feel special.",
    "heroImage":"https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=85",
    "columns":3,"cardStyle":"clean","imageRatio":"portrait","showDiscount":true,
    "sections":["navbar","hero","products","about","footer"],
    "aboutText":"We believe the things you surround yourself with should be as considered as the life you’re building. Meet our edit of beautiful, useful pieces — made for the everyday.",
    "bannerText":"Thoughtful finds. Made for everyday.","textContent":"Good design belongs in everyday life.","alignment":"left"
  }$json$::jsonb;
begin
  if p_design is null or jsonb_typeof(p_design) <> 'object' then
    raise exception using errcode='22023',message='Website design must be an object.';
  end if;
  v := v_defaults || p_design;
  foreach v_key in array array['accent','template','cardStyle','imageRatio','alignment'] loop
    if jsonb_typeof(v->v_key) <> 'string' then
      raise exception using errcode='22023',message='Website design options must be text.';
    end if;
  end loop;
  if v->>'accent' !~ '^#[0-9a-fA-F]{6}$' then
    raise exception using errcode='22023',message='Choose a valid six-digit accent color.';
  end if;
  if v->>'template' not in ('minimal','editorial','bold')
    or v->>'cardStyle' not in ('clean','soft','bordered')
    or v->>'imageRatio' not in ('square','portrait')
    or v->>'alignment' not in ('left','center') then
    raise exception using errcode='22023',message='Choose supported website design options.';
  end if;
  if jsonb_typeof(v->'columns') <> 'number' then
    raise exception using errcode='22023',message='Product columns must be between 1 and 4.';
  end if;
  if (v->>'columns')::numeric not in (1,2,3,4) then
    raise exception using errcode='22023',message='Product columns must be between 1 and 4.';
  end if;
  if jsonb_typeof(v->'showDiscount') <> 'boolean' then
    raise exception using errcode='22023',message='Discount visibility must be a boolean.';
  end if;
  for v_key,v_limit in
    select key,value::text::integer from jsonb_each('{"heroTitle":200,"heroSubtitle":1000,"aboutText":5000,"bannerText":500,"textContent":5000}'::jsonb)
  loop
    if v->v_key = 'null'::jsonb then
      v := jsonb_set(v,array[v_key],to_jsonb(''::text));
    elsif jsonb_typeof(v->v_key) <> 'string' then
      raise exception using errcode='22023',message='Website content must be text.';
    end if;
    v := jsonb_set(v,array[v_key],to_jsonb(btrim(v->>v_key)));
    if char_length(v->>v_key) > v_limit then
      raise exception using errcode='22023',message='Website content exceeds its character limit.';
    end if;
  end loop;
  if v->'heroImage' = 'null'::jsonb then
    v := jsonb_set(v,'{heroImage}',to_jsonb(''::text));
  end if;
  if jsonb_typeof(v->'heroImage') <> 'string' then
    raise exception using errcode='22023',message='Hero image must be a URL.';
  end if;
  if v->>'heroImage' <> '' and not private.valid_image_url(v->>'heroImage',p_store) then
    raise exception using errcode='22023',message='Choose an HTTPS image or one owned by this store.';
  end if;
  v_sections := v->'sections';
  if jsonb_typeof(v_sections) <> 'array' then
    raise exception using errcode='22023',message='Website sections must be an array.';
  end if;
  v_section_count := jsonb_array_length(v_sections);
  if v_section_count < 3 or v_section_count > 8 then
    raise exception using errcode='22023',message='Choose supported, unique website sections.';
  end if;
  for v_value in select value from jsonb_array_elements(v_sections) loop
    if jsonb_typeof(v_value) <> 'string' or v_value #>> '{}' not in ('navbar','hero','products','about','banner','text','contact','footer') then
      raise exception using errcode='22023',message='Choose supported website sections.';
    end if;
  end loop;
  select count(distinct value) into v_unique_count from jsonb_array_elements(v_sections);
  if v_unique_count <> v_section_count or not v_sections @> '["navbar","products","footer"]'::jsonb
    or v_sections->>0 <> 'navbar' or v_sections->>(v_section_count-1) <> 'footer' then
    raise exception using errcode='22023',message='Keep unique sections, navigation first, products included, and footer last.';
  end if;
  if p_design ? 'sectionTemplates' then
    if jsonb_typeof(p_design->'sectionTemplates') <> 'object' then
      raise exception using errcode='22023',message='Section templates must be an object.';
    end if;
    for v_key,v_value in select key,value from jsonb_each(p_design->'sectionTemplates') loop
      if v_key not in ('navbar','hero','products','about','banner','text','contact','footer','product-detail')
        or jsonb_typeof(v_value) <> 'string' or v_value #>> '{}' not in ('minimal','editorial','bold') then
        raise exception using errcode='22023',message='Choose supported section templates.';
      end if;
    end loop;
  end if;
  -- Rebuild from the allowlist so arbitrary JSON fields cannot reach public clients.
  v_result := jsonb_build_object(
    'accent',v->'accent','template',v->'template','heroTitle',v->'heroTitle',
    'heroSubtitle',v->'heroSubtitle','heroImage',v->'heroImage',
    'columns',(v->>'columns')::integer,'cardStyle',v->'cardStyle',
    'imageRatio',v->'imageRatio','showDiscount',v->'showDiscount',
    'sections',v_sections,'aboutText',v->'aboutText','bannerText',v->'bannerText',
    'textContent',v->'textContent','alignment',v->'alignment'
  );
  if p_design ? 'sectionTemplates' then
    v_result := v_result || jsonb_build_object('sectionTemplates',p_design->'sectionTemplates');
  end if;
  return v_result;
end;
$function$;

revoke all on function private.validate_design(jsonb,uuid) from public,anon,authenticated;

create function private.validate_store_data(p_data jsonb,p_store uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare k text; v jsonb; v_name text; max_length integer;
begin
 if jsonb_typeof(p_data) is distinct from 'object' then raise exception 'Store data must be an object' using errcode='23514'; end if;
 v:='{"whatsapp":"","description":"","address":"","contactEmail":"","logo":"","hideOutOfStock":false,"sample":false,"designCustomized":false}'::jsonb||p_data;
 for k,max_length in select key,value::text::integer from jsonb_each('{"name":120,"whatsapp":30,"description":2000,"address":1000,"contactEmail":254,"logo":2000}'::jsonb) loop
  if jsonb_typeof(v->k) is distinct from 'string' then raise exception 'Store details must be text' using errcode='23514'; end if;
  if length(v->>k)>max_length then raise exception 'Store detail exceeds its character limit' using errcode='23514'; end if;
 end loop;
 v_name:=btrim(v->>'name');
 if v_name='' then raise exception 'Store name is required' using errcode='23514'; end if;
 foreach k in array array['hideOutOfStock','sample','designCustomized'] loop
  if jsonb_typeof(v->k) is distinct from 'boolean' then raise exception 'Store preferences must be true or false' using errcode='23514'; end if;
 end loop;
 if v->>'contactEmail'<>'' and v->>'contactEmail' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Invalid contact email' using errcode='23514'; end if;
 if v->>'logo'<>'' and not private.valid_image_url(v->>'logo',p_store) then raise exception 'Invalid logo image URL' using errcode='23514'; end if;
 return jsonb_build_object('name',v_name,'whatsapp',v->'whatsapp','description',v->'description','address',v->'address',
   'contactEmail',v->'contactEmail','logo',v->'logo','hideOutOfStock',v->'hideOutOfStock','sample',v->'sample',
   'designCustomized',v->'designCustomized','draftDesign',private.validate_design(v->'draftDesign',p_store),
   'liveDesign',private.validate_design(v->'liveDesign',p_store),'publishedAt',coalesce(v->'publishedAt','null'::jsonb));
end $$;
revoke all on function private.validate_store_data(jsonb,uuid) from public,anon,authenticated;

create function private.check_store() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_phone text := coalesce(new.data->>'whatsapp','');
begin
  new.data := private.validate_store_data(new.data,new.id);
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.owner_id <> old.owner_id then raise exception 'Store ownership is immutable' using errcode='23514'; end if;
    if old.data->>'publishedAt' is not null and new.slug <> old.slug then raise exception 'Published store address is locked' using errcode='23514'; end if;
    new.revision := old.revision + 1;
    new.data := jsonb_set(new.data,'{publishedAt}',coalesce(old.data->'publishedAt','null'::jsonb));
    if v_phone is distinct from old.data->>'whatsapp' then
      delete from public.store_verifications where store_id=new.id;
      update public.verification_challenges set consumed_at=now() where store_id=new.id and consumed_at is null;
      new.published := false;
    end if;
  else
    if new.published then raise exception 'New stores must start unpublished' using errcode='23514'; end if;
    new.data := jsonb_set(new.data,'{publishedAt}','null'::jsonb);
  end if;
  if v_phone <> '' and v_phone !~ '^[1-9][0-9]{9,14}$' then raise exception 'Invalid WhatsApp number' using errcode='23514'; end if;
  if length(coalesce(new.data->>'name','')) not between 1 and 120 then raise exception 'Store name is required' using errcode='23514'; end if;
  if jsonb_typeof(new.data->'draftDesign') is distinct from 'object' or jsonb_typeof(new.data->'liveDesign') is distinct from 'object' then raise exception 'Store designs are required' using errcode='23514'; end if;
  if new.published then
    if not exists(select 1 from public.store_verifications v where v.store_id=new.id and v.phone=v_phone) then
      raise exception 'Verify your WhatsApp number before publishing' using errcode='23514';
    end if;
    if not exists(select 1 from public.products p where p.store_id=new.id and p.status='published' and (not coalesce((new.data->>'hideOutOfStock')::boolean,false) or p.data->>'stock'='in_stock')) then
      raise exception 'Publish at least one visible product before publishing your store' using errcode='23514';
    end if;
    if tg_op='INSERT' or not old.published or new.data->'liveDesign' is distinct from old.data->'liveDesign' then
      new.data := jsonb_set(new.data,'{liveDesign}',new.data->'draftDesign');
    end if;
    if new.data->>'publishedAt' is null then new.data := jsonb_set(new.data,'{publishedAt}',to_jsonb(now())); end if;
  end if;
  new.data := (new.data - 'phoneVerified') || jsonb_build_object('id',new.id,'slug',new.slug,'published',new.published);
  return new;
end $$;
revoke all on function private.check_store() from public,anon,authenticated;
create trigger stores_check before insert or update on public.stores for each row execute function private.check_store();

create function private.check_product() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='UPDATE' then
    if new.id <> old.id or new.short_id <> old.short_id or new.store_id <> old.store_id then raise exception 'Product identity is immutable' using errcode='23514'; end if;
    if old.status='archived' and new.status<>'archived' and old.archived_at <= now()-interval '7 days' then raise exception 'Product recovery window expired' using errcode='23514'; end if;
    new.created_at := old.created_at;
  else
    new.created_at := now();
  end if;
  -- Every insertion/restoration serializes on its store row. This also protects
  -- direct REST writes and native apps, not just the web handler.
  perform 1 from public.stores where id=new.store_id for update;
  if new.status<>'archived' and (tg_op='INSERT' or old.status='archived') then
    if (select count(*) from public.products where store_id=new.store_id and status<>'archived' and id<>new.id) >= 50 then
      raise exception 'Your free plan includes 50 active products' using errcode='23514';
    end if;
  end if;
  new.data := private.validate_product_data(new.data,new.store_id);
  if new.status='archived' then
    if tg_op='UPDATE' and old.status='archived' then new.archived_at := old.archived_at;
    else new.archived_at := now(); end if;
  else new.archived_at := null; end if;
  new.data := new.data || jsonb_build_object('id',new.id,'shortId',new.short_id,'status',new.status,'createdAt',new.created_at,'archivedAt',new.archived_at);
  return new;
end $$;
revoke all on function private.check_product() from public,anon,authenticated;
create trigger products_check before insert or update on public.products for each row execute function private.check_product();

create function private.refresh_storefront(p_store uuid) returns void language plpgsql security definer set search_path = '' as $$
declare s public.stores; visible jsonb; safe_store jsonb;
begin
  select * into s from public.stores where id=p_store for update;
  if not found or not s.published then delete from public.storefronts where store_id=p_store; return; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'shortId',p.short_id,'name',p.data->'name','description',p.data->'description',
    'price',p.data->'price','salePrice',p.data->'salePrice','images',p.data->'images',
    'status',p.status,'stock',p.data->'stock','showDiscount',p.data->'showDiscount',
    'variantGroups',p.data->'variantGroups','variants',p.data->'variants',
    'createdAt',p.created_at,'archivedAt',null,'sample',coalesce(p.data->'sample','false'::jsonb)
  ) order by p.created_at desc,p.id),'[]'::jsonb) into visible
  from public.products p where p.store_id=p_store and p.status='published'
    and (not coalesce((s.data->>'hideOutOfStock')::boolean,false) or p.data->>'stock'='in_stock');
  safe_store := jsonb_build_object('id',s.id,'slug',s.slug,'name',s.data->'name',
    'whatsapp',s.data->'whatsapp','description',s.data->'description','address',s.data->'address',
    'contactEmail',s.data->'contactEmail','logo',s.data->'logo','published',true,
    'hideOutOfStock',s.data->'hideOutOfStock','draftDesign',s.data->'liveDesign','liveDesign',s.data->'liveDesign',
    'sample',coalesce(s.data->'sample','false'::jsonb),'publishedAt',s.data->'publishedAt');
  insert into public.storefronts(store_id,slug,data) values(s.id,s.slug,jsonb_build_object('store',safe_store,'products',visible))
    on conflict(store_id) do update set slug=excluded.slug,data=excluded.data;
end $$;
revoke all on function private.refresh_storefront(uuid) from public,anon,authenticated;
create function private.storefront_trigger() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name='stores' then perform private.refresh_storefront(new.id);
  elsif tg_op='DELETE' then perform private.refresh_storefront(old.store_id);
  else perform private.refresh_storefront(new.store_id); end if;
  return null;
end $$;
revoke all on function private.storefront_trigger() from public,anon,authenticated;
create trigger stores_snapshot after insert or update on public.stores for each row execute function private.storefront_trigger();
create trigger products_snapshot after insert or update or delete on public.products for each row execute function private.storefront_trigger();

create function public.save_store(p_store uuid,p_revision bigint,p_data jsonb,p_slug text,p_published boolean)
returns setof public.stores language sql security invoker set search_path = '' as $$
  update public.stores set data=p_data,slug=p_slug,published=p_published
  where id=p_store and revision=p_revision and owner_id=(select auth.uid()) returning *;
$$;
revoke all on function public.save_store(uuid,bigint,jsonb,text,boolean) from public,anon;
grant execute on function public.save_store(uuid,bigint,jsonb,text,boolean) to authenticated;

create function private.is_store_phone_verified(p_store_id uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.stores s join public.store_verifications v on v.store_id=s.id
  where s.id=p_store_id and s.owner_id=(select auth.uid()) and v.phone=s.data->>'whatsapp');
$$;
revoke all on function private.is_store_phone_verified(uuid) from public,anon;
grant execute on function private.is_store_phone_verified(uuid) to authenticated;
create function public.is_store_phone_verified(p_store_id uuid) returns boolean language sql stable security invoker set search_path = '' as $$
 select private.is_store_phone_verified(p_store_id);
$$;
revoke all on function public.is_store_phone_verified(uuid) from public,anon;
grant execute on function public.is_store_phone_verified(uuid) to authenticated;

-- These four endpoints are service-role only. Each checks the authenticated owner
-- supplied by the server; clients cannot create their own verified-phone records.
create function public.reserve_phone_verification(p_owner uuid,p_store uuid) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare s public.stores; challenge uuid;
begin
 select * into s from public.stores where id=p_store and owner_id=p_owner for update;
 if not found then raise exception 'Store not found' using errcode='42501'; end if;
 if coalesce(s.data->>'whatsapp','') !~ '^[1-9][0-9]{9,14}$' then raise exception 'Add a valid WhatsApp number in store settings' using errcode='23514'; end if;
 if exists(select 1 from public.verification_challenges where store_id=p_store and created_at>now()-interval '60 seconds') then raise exception 'Wait 60 seconds before requesting another code' using errcode='P0001'; end if;
 if (select count(*) from public.verification_challenges where store_id=p_store and created_at>now()-interval '1 hour') >= 5 then raise exception 'Phone verification limit reached; try again later' using errcode='P0001'; end if;
 update public.verification_challenges set consumed_at=now() where store_id=p_store and consumed_at is null;
 insert into public.verification_challenges(store_id,user_id,phone) values(p_store,p_owner,s.data->>'whatsapp') returning id into challenge;
 return jsonb_build_object('challenge_id',challenge,'phone',s.data->>'whatsapp');
end $$;
create function public.attach_phone_session(p_challenge uuid,p_session text) returns void language plpgsql security invoker set search_path = '' as $$
begin
 if length(p_session) not between 1 and 200 then raise exception 'Invalid verification session'; end if;
 update public.verification_challenges set provider_session_id=p_session where id=p_challenge and consumed_at is null and expires_at>now() and provider_session_id is null;
 if not found then raise exception 'Verification challenge expired'; end if;
end $$;
create function public.claim_phone_attempt(p_owner uuid,p_store uuid,p_challenge uuid) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare s public.stores; c public.verification_challenges;
begin
 select * into s from public.stores where id=p_store and owner_id=p_owner for update;
 if not found then raise exception 'Store not found' using errcode='42501'; end if;
 update public.verification_challenges set attempts=attempts+1
  where id=p_challenge and store_id=p_store and user_id=p_owner and phone=s.data->>'whatsapp'
    and consumed_at is null and expires_at>now() and attempts<5 and provider_session_id is not null returning * into c;
 if not found then raise exception 'Code expired or attempt limit reached' using errcode='P0001'; end if;
 return jsonb_build_object('session_id',c.provider_session_id,'phone',c.phone);
end $$;
create function public.confirm_phone_verification(p_owner uuid,p_store uuid,p_challenge uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare s public.stores; c public.verification_challenges;
begin
 select * into s from public.stores where id=p_store and owner_id=p_owner for update;
 if not found then raise exception 'Store not found' using errcode='42501'; end if;
 update public.verification_challenges set consumed_at=now()
 where id=p_challenge and store_id=p_store and user_id=p_owner and phone=s.data->>'whatsapp'
  and consumed_at is null and expires_at>now() and attempts between 1 and 5 and provider_session_id is not null returning * into c;
 if not found then raise exception 'Verification challenge expired' using errcode='P0001'; end if;
 insert into public.store_verifications(store_id,phone) values(p_store,c.phone)
 on conflict(store_id) do update set phone=excluded.phone,verified_at=now();
end $$;
revoke all on function public.reserve_phone_verification(uuid,uuid),public.attach_phone_session(uuid,text),public.claim_phone_attempt(uuid,uuid,uuid),public.confirm_phone_verification(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.reserve_phone_verification(uuid,uuid),public.attach_phone_session(uuid,text),public.claim_phone_attempt(uuid,uuid,uuid),public.confirm_phone_verification(uuid,uuid,uuid) to service_role;

-- Authoritative seller metrics live in Postgres. The server can call this after
-- applying request controls; the browser never receives a metrics write grant.
create function public.record_store_event(p_store uuid,p_type text,p_product uuid default null,p_owner uuid default null) returns boolean language plpgsql security invoker set search_path = '' as $$
declare s public.stores;
begin
 select * into s from public.stores where id=p_store and published;
 if not found then raise exception 'Store unavailable' using errcode='P0001'; end if;
 if s.owner_id=p_owner then return false; end if;
 if p_type not in ('store_view','product_view','whatsapp_click') then raise exception 'Unsupported event'; end if;
 if p_type='product_view' and p_product is null then raise exception 'Product required'; end if;
 if p_product is not null and not exists(select 1 from public.products where id=p_product and store_id=p_store and status='published'
    and (not coalesce((s.data->>'hideOutOfStock')::boolean,false) or data->>'stock'='in_stock')) then raise exception 'Product unavailable'; end if;
 insert into public.daily_metrics(store_id,date,store_views,product_views,whatsapp_clicks)
 values(p_store,(now() at time zone 'UTC')::date,(p_type='store_view')::integer,(p_type='product_view')::integer,(p_type='whatsapp_click')::integer)
 on conflict(store_id,date) do update set store_views=daily_metrics.store_views+excluded.store_views,
  product_views=daily_metrics.product_views+excluded.product_views,whatsapp_clicks=daily_metrics.whatsapp_clicks+excluded.whatsapp_clicks;
 return true;
end $$;
revoke all on function public.record_store_event(uuid,text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.record_store_event(uuid,text,uuid,uuid) to service_role;




-- Billing migration fragment: appended to the CLI-created baseline migration.
-- Sandbox and production ledgers are separate. Only production ledger rows may gate paid product features.
create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  environment text not null check (environment in ('sandbox','production')),
  provider_id text not null unique,
  idempotency_key uuid not null unique default gen_random_uuid(),
  plan_id text not null,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  period_months integer not null check (period_months in (1,12)),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  status text not null default 'INITIALIZED',
  api_state text not null default 'pending' check (api_state in ('pending','ready')),
  session_id text,
  last_event_at timestamptz,
  created_at timestamptz not null default now()
);
create index billing_subscriptions_owner_idx on public.billing_subscriptions(owner_id);
create index billing_subscriptions_store_idx on public.billing_subscriptions(store_id,environment,created_at desc);
create table public.billing_events (
  environment text not null check (environment in ('sandbox','production')),
  event_key text not null,
  provider_subscription_id text,
  event_type text not null,
  event_time timestamptz not null,
  outcome text not null default 'received',
  created_at timestamptz not null default now(),
  primary key(environment,event_key)
);
create table public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.billing_subscriptions(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  environment text not null check (environment in ('sandbox','production')),
  provider_payment_id text not null,
  amount_minor integer not null check(amount_minor > 0),
  currency text not null check(currency='INR'),
  period_start timestamptz not null,
  period_end timestamptz not null,
  refunded boolean not null default false,
  created_at timestamptz not null default now(),
  unique(environment,provider_payment_id),
  check(period_end > period_start)
);
create index billing_payments_subscription_idx on public.billing_payments(subscription_id);
create index billing_payments_store_idx on public.billing_payments(store_id,environment,period_end desc);
-- Distinct successful refunds accumulate, including refunds arriving before the charge.
create table public.billing_refunds (
  environment text not null check (environment in ('sandbox','production')),
  provider_refund_id text not null,
  provider_payment_id text not null,
  amount_minor integer not null check(amount_minor > 0),
  created_at timestamptz not null default now(),
  primary key(environment,provider_refund_id)
);
create index billing_refunds_payment_idx on public.billing_refunds(environment,provider_payment_id);
alter table public.billing_subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_refunds enable row level security;
revoke all on public.billing_subscriptions,public.billing_events,public.billing_payments,public.billing_refunds from anon,authenticated;
grant select on public.billing_subscriptions,public.billing_payments to authenticated;
grant all on public.billing_subscriptions,public.billing_events,public.billing_payments,public.billing_refunds to service_role;
create policy billing_subscriptions_owner_read on public.billing_subscriptions for select to authenticated
  using(owner_id=(select auth.uid()) and exists(select 1 from public.stores s where s.id=store_id and s.owner_id=(select auth.uid())));
create policy billing_payments_owner_read on public.billing_payments for select to authenticated
  using(exists(select 1 from public.stores s where s.id=store_id and s.owner_id=(select auth.uid())));

create function public.reserve_subscription(p_owner uuid,p_store uuid,p_plan_id text,p_amount_minor integer,p_period_months integer,p_customer_name text,p_customer_email text,p_customer_phone text,p_environment text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.stores; b public.billing_subscriptions; normalized_phone text;
begin
  select * into s from public.stores where id=p_store and owner_id=p_owner for update;
  if not found then raise exception 'Store not found'; end if;
  if p_environment not in ('sandbox','production') or p_plan_id is null or length(p_plan_id) not between 1 and 250 or p_amount_minor <= 0 or p_period_months not in (1,12) then raise exception 'Invalid billing plan'; end if;
  normalized_phone:=regexp_replace(coalesce(s.data->>'whatsapp',''),'[^0-9]','','g');
  if length(normalized_phone)=10 then normalized_phone:='91'||normalized_phone; end if;
  if normalized_phone !~ '^91[6-9][0-9]{9}$' or normalized_phone<>p_customer_phone or not exists(select 1 from public.store_verifications v where v.store_id=p_store and v.phone=s.data->>'whatsapp' and v.verified_at is not null) then raise exception 'Verify store phone first'; end if;
  if p_customer_name is null or length(p_customer_name) not between 1 and 100 or p_customer_email is null or length(p_customer_email)>320 then raise exception 'Invalid customer'; end if;
  select * into b from public.billing_subscriptions where store_id=p_store and environment=p_environment
    and status not in ('CANCELLED','CUSTOMER_CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED') order by created_at desc limit 1;
  if found then
    if b.plan_id<>p_plan_id or b.amount_minor<>p_amount_minor or b.period_months<>p_period_months then raise exception 'Existing subscription requires review before changing plan'; end if;
    return to_jsonb(b);
  end if;
  insert into public.billing_subscriptions(store_id,owner_id,environment,provider_id,plan_id,amount_minor,period_months,customer_name,customer_email,customer_phone)
    values(p_store,p_owner,p_environment,'ziteo_'||replace(gen_random_uuid()::text,'-',''),p_plan_id,p_amount_minor,p_period_months,p_customer_name,p_customer_email,p_customer_phone) returning * into b;
  return to_jsonb(b);
end $$;

create function public.complete_subscription_creation(p_id uuid,p_session_id text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_session_id is null or length(p_session_id) not between 1 and 10000 then raise exception 'Missing subscription session'; end if;
  update public.billing_subscriptions set session_id=coalesce(session_id,p_session_id),api_state='ready' where id=p_id;
  if not found then raise exception 'Unknown subscription'; end if;
end $$;

create function public.record_cashfree_event(p_environment text,p_event_key text,p_event jsonb)
returns text language plpgsql security invoker set search_path='' as $$
declare b public.billing_subscriptions; event_at timestamptz; period_from timestamptz; event_type text; payment_id text; v_outcome text:='ignored';
begin
  if p_environment not in ('sandbox','production') or p_event_key !~ '^[0-9a-f]{64}$' then raise exception 'Invalid event'; end if;
  event_at:=(p_event->>'event_time')::timestamptz;
  event_type:=p_event->>'type';
  payment_id:=p_event->>'payment_id';
  insert into public.billing_events(environment,event_key,provider_subscription_id,event_type,event_time)
    values(p_environment,p_event_key,p_event->>'subscription_id',event_type,event_at) on conflict do nothing;
  if not found then return 'duplicate'; end if;
  -- Cashfree's documented refund event contains cf_payment_id and cf_refund_id,
  -- but need not contain a subscription ID. Keep a tombstone even before payment delivery.
  if event_type='SUBSCRIPTION_REFUND_STATUS' then
    if p_event->>'refund_status'='SUCCESS' and payment_id is not null and length(payment_id)>0
      and p_event->>'refund_id' is not null and (p_event->>'refund_amount_minor')::bigint > 0 then
      -- Serialize refunds and charge events for the same external payment.
      perform pg_advisory_xact_lock(hashtextextended(p_environment||':'||payment_id,0));
      insert into public.billing_refunds(environment,provider_refund_id,provider_payment_id,amount_minor)
        values(p_environment,p_event->>'refund_id',payment_id,(p_event->>'refund_amount_minor')::integer) on conflict do nothing;
      update public.billing_payments p set refunded=true where p.environment=p_environment and p.provider_payment_id=payment_id
        and (select coalesce(sum(r.amount_minor),0) from public.billing_refunds r where r.environment=p_environment and r.provider_payment_id=payment_id)>=p.amount_minor;
      v_outcome:='refund';
    else v_outcome:='refund_mismatch'; end if;
    update public.billing_events set outcome=v_outcome where environment=p_environment and event_key=p_event_key;
    return v_outcome;
  end if;
  select * into b from public.billing_subscriptions where provider_id=p_event->>'subscription_id' and environment=p_environment for update;
  if not found then
    update public.billing_events set outcome='unknown_subscription' where environment=p_environment and event_key=p_event_key;
    return 'unknown_subscription';
  end if;
  if event_type='SUBSCRIPTION_STATUS_CHANGED' then
    if p_event->>'subscription_status' in ('INITIALIZED','BANK_APPROVAL_PENDING','ACTIVE','ON_HOLD','PAUSED','COMPLETED','CUSTOMER_CANCELLED','CUSTOMER_PAUSED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED','CANCELLED') then
      update public.billing_subscriptions set status=p_event->>'subscription_status',last_event_at=event_at
        where id=b.id and (last_event_at is null or last_event_at<event_at);
      v_outcome:='lifecycle';
    end if;
  elsif event_type='SUBSCRIPTION_PAYMENT_SUCCESS' and p_event->>'payment_type'='CHARGE' and p_event->>'payment_status'='SUCCESS' then
    if payment_id is null or length(payment_id)=0 or (p_event->>'amount_minor')::bigint is distinct from b.amount_minor::bigint or p_event->>'currency' is distinct from b.currency or p_event->>'period_start' is null then
      v_outcome:='payment_mismatch';
    else
      period_from:=(p_event->>'period_start')::timestamptz;
      -- Reject clearly malformed future/backdated periods for operations review. Event delivery order is irrelevant.
      if period_from>event_at+interval '7 days' or period_from<b.created_at-interval '7 days' then
        v_outcome:='period_mismatch';
      else
        perform pg_advisory_xact_lock(hashtextextended(p_environment||':'||payment_id,0));
        insert into public.billing_payments(subscription_id,store_id,environment,provider_payment_id,amount_minor,currency,period_start,period_end,refunded)
          values(b.id,b.store_id,p_environment,payment_id,b.amount_minor,b.currency,period_from,period_from+make_interval(months=>b.period_months),
            (select coalesce(sum(r.amount_minor),0)>=b.amount_minor from public.billing_refunds r where r.environment=p_environment and r.provider_payment_id=payment_id))
          on conflict(environment,provider_payment_id) do nothing;
        v_outcome:='charge';
      end if;
    end if;
  end if;
  update public.billing_events set outcome=v_outcome where environment=p_environment and event_key=p_event_key;
  return v_outcome;
end $$;

revoke execute on function public.reserve_subscription(uuid,uuid,text,integer,integer,text,text,text,text) from public,anon,authenticated;
revoke execute on function public.complete_subscription_creation(uuid,text) from public,anon,authenticated;
revoke execute on function public.record_cashfree_event(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_subscription(uuid,uuid,text,integer,integer,text,text,text,text) to service_role;
grant execute on function public.complete_subscription_creation(uuid,text) to service_role;
grant execute on function public.record_cashfree_event(text,text,jsonb) to service_role;
