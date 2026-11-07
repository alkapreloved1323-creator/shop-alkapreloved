alter table public.customers drop constraint if exists customers_email_key;
alter table public.customers drop column if exists email;
create unique index if not exists customers_phone_unique_idx on public.customers(phone) where phone is not null;
