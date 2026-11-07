create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text not null unique,
  type text not null check (type in ('percent', 'amount', 'bundle')),
  discount numeric not null check (discount > 0),
  max_discount numeric check (max_discount is null or max_discount > 0),
  starts_on date not null,
  ends_on date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint promotions_dates_check check (ends_on >= starts_on)
);

alter table public.promotions enable row level security;
create policy "Public can read active promotions" on public.promotions for select using (active = true and current_date between starts_on and ends_on);
create policy "Admin staff manage promotions" on public.promotions for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
create index if not exists promotions_active_dates_idx on public.promotions (active, starts_on, ends_on);
