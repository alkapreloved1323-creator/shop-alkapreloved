-- ============================================================
-- AlkaPreloved — Phase 2 Database Foundation
-- Migration: 001_initial_schema.sql
-- ============================================================

create extension if not exists "pgcrypto";

do $$ begin create type public.product_condition as enum ('like_new', 'very_good', 'good', 'fair', 'poor'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_status as enum ('draft', 'active', 'sold', 'archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending_payment', 'payment_confirmed', 'processing', 'packed', 'shipped', 'delivered', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), description text,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 3 and 200), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text, price bigint not null check (price >= 0), condition public.product_condition not null,
  stock integer not null default 0 check (stock >= 0), weight integer check (weight is null or weight > 0),
  length numeric(10,2) check (length is null or length >= 0), width numeric(10,2) check (width is null or width >= 0), height numeric(10,2) check (height is null or height >= 0),
  status public.product_status not null default 'draft', created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique, public_url text not null, sort_order integer not null default 0 check (sort_order >= 0), created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique check (order_number ~ '^ALK-[0-9]{8}-[0-9]{4}$'),
  customer_name text not null check (char_length(customer_name) between 2 and 100), phone text not null check (char_length(phone) between 8 and 20), email text not null check (char_length(email) <= 255),
  address text not null, province text not null, city text not null, district text not null, postal_code text not null check (postal_code ~ '^[0-9]{5}$'),
  subtotal bigint not null check (subtotal >= 0), shipping_cost bigint not null default 0 check (shipping_cost >= 0), total bigint not null check (total = subtotal + shipping_cost),
  shipping_provider text, shipping_service text, tracking_number text, payment_status public.payment_status not null default 'pending', order_status public.order_status not null default 'pending_payment',
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null, price bigint not null check (price >= 0), quantity integer not null check (quantity > 0), subtotal bigint not null check (subtotal = price * quantity), created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict, provider text not null, transaction_id text, payment_method text,
  amount bigint not null check (amount >= 0), status public.payment_status not null default 'pending', raw_response jsonb, paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()), unique (provider, transaction_id)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id) on delete restrict, courier text not null, service text not null,
  tracking_number text, status text not null default 'pending', shipped_at timestamptz, delivered_at timestamptz, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null, event_id text not null, event_type text, payload jsonb not null, processed_at timestamptz, created_at timestamptz not null default timezone('utc', now()), unique (provider, event_id)
);

create index if not exists products_active_idx on public.products(status) where status = 'active';
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_price_idx on public.products(price);
create index if not exists products_created_idx on public.products(created_at desc);
create index if not exists product_images_product_idx on public.product_images(product_id, sort_order);
create index if not exists orders_status_idx on public.orders(order_status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payments_order_idx on public.payments(order_id);
create index if not exists shipments_tracking_idx on public.shipments(tracking_number);

DO $$ DECLARE t text; BEGIN FOR t IN SELECT unnest(ARRAY['categories','products','orders','payments','shipments']) LOOP EXECUTE format('drop trigger if exists %I_set_updated_at on public.%I', t, t); EXECUTE format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t); END LOOP; END $$;

create or replace function public.is_admin_or_staff() returns boolean language sql stable security definer set search_path = public as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'), false); $$;
revoke all on function public.is_admin_or_staff() from public; grant execute on function public.is_admin_or_staff() to authenticated;

create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer) returns boolean language plpgsql security definer set search_path = public as $$ declare updated_count integer; begin if p_quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if; update public.products set stock = stock - p_quantity, status = case when stock - p_quantity = 0 then 'sold'::public.product_status else status end, updated_at = timezone('utc', now()) where id = p_product_id and status = 'active' and stock >= p_quantity; get diagnostics updated_count = row_count; return updated_count = 1; end; $$;
create or replace function public.increment_stock(p_product_id uuid, p_quantity integer) returns boolean language plpgsql security definer set search_path = public as $$ declare updated_count integer; begin if p_quantity <= 0 then raise exception 'Quantity must be greater than zero'; end if; update public.products set stock = stock + p_quantity, status = case when status = 'sold' then 'active'::public.product_status else status end, updated_at = timezone('utc', now()) where id = p_product_id; get diagnostics updated_count = row_count; return updated_count = 1; end; $$;
revoke all on function public.decrement_stock(uuid, integer) from public; revoke all on function public.increment_stock(uuid, integer) from public; grant execute on function public.decrement_stock(uuid, integer) to service_role; grant execute on function public.increment_stock(uuid, integer) to service_role;

alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.product_images enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.payments enable row level security; alter table public.shipments enable row level security; alter table public.payment_webhook_events enable row level security;

create policy "Public can read active categories" on public.categories for select using (true);
create policy "Public can read active products" on public.products for select using (status = 'active');
create policy "Public can read active product images" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
create policy "Admin staff manage categories" on public.categories for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage products" on public.products for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage product images" on public.product_images for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage orders" on public.orders for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage order items" on public.order_items for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage payments" on public.payments for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage shipments" on public.shipments for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff read webhook events" on public.payment_webhook_events for select to authenticated using (public.is_admin_or_staff());

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do update set public = excluded.public;
create policy "Public can view product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin staff upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin_or_staff());
create policy "Admin staff update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin_or_staff()) with check (bucket_id = 'product-images' and public.is_admin_or_staff());
create policy "Admin staff delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin_or_staff());
