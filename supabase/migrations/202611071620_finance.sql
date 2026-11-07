-- Finance and consignment records for the admin dashboard.
create table if not exists public.consignors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text,
  email text,
  address text,
  city text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.products add column if not exists is_consignment boolean not null default false;
alter table public.products add column if not exists consignor_id uuid references public.consignors(id) on delete set null;
alter table public.products add column if not exists consignment_percent numeric(5,2) check (consignment_percent is null or (consignment_percent >= 0 and consignment_percent <= 100));

create table if not exists public.sold_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sold_at timestamptz not null default timezone('utc', now()),
  sale_price bigint not null check (sale_price >= 0),
  consignment_percent numeric(5,2) not null default 0 check (consignment_percent >= 0 and consignment_percent <= 100),
  consignor_id uuid references public.consignors(id) on delete set null,
  consignor_name text,
  owner_payout bigint not null default 0 check (owner_payout >= 0),
  store_earnings bigint not null default 0 check (store_earnings >= 0),
  payout_status text not null default 'pending' check (payout_status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sold_products_sold_at_idx on public.sold_products(sold_at desc);
create index if not exists sold_products_consignor_idx on public.sold_products(consignor_id);

drop trigger if exists consignors_set_updated_at on public.consignors;
create trigger consignors_set_updated_at before update on public.consignors for each row execute function public.set_updated_at();
drop trigger if exists sold_products_set_updated_at on public.sold_products;
create trigger sold_products_set_updated_at before update on public.sold_products for each row execute function public.set_updated_at();

alter table public.consignors enable row level security;
alter table public.sold_products enable row level security;
create policy "Admin staff manage consignors" on public.consignors for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage sold products" on public.sold_products for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
