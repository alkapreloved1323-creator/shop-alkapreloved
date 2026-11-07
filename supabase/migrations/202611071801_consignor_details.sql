-- Additional consignor contact and payout details.
alter table public.consignors add column if not exists address text;
alter table public.consignors add column if not exists city text;
alter table public.consignors add column if not exists bank_name text;
alter table public.consignors add column if not exists bank_account_name text;
alter table public.consignors add column if not exists bank_account_number text;
