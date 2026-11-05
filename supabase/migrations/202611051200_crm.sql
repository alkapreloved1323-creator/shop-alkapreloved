-- AlkaPreloved CRM and customer acquisition tracking
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 255),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text,
  total_orders integer not null default 0 check (total_orders >= 0),
  total_spent bigint not null default 0 check (total_spent >= 0),
  last_order_at timestamptz,
  source text not null default 'direct' check (source in ('direct', 'instagram', 'facebook', 'google', 'tiktok', 'referral', 'whatsapp', 'marketplace', 'other')),
  source_detail text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referral_code text,
  marketing_consent boolean not null default false,
  consented_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  note text not null check (char_length(note) between 1 and 2000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists customers_source_idx on public.customers(source);
create index if not exists customers_campaign_idx on public.customers(utm_campaign);
create index if not exists customers_last_order_idx on public.customers(last_order_at desc);
create index if not exists customer_notes_customer_idx on public.customer_notes(customer_id, created_at desc);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.customer_notes enable row level security;

create policy "Admin staff manage customers" on public.customers for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create policy "Admin staff manage customer notes" on public.customer_notes for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());

-- Public checkout capture is intentionally handled by a server-side service-role route.
-- Do not expose customer rows or insert permissions to the anon client.
