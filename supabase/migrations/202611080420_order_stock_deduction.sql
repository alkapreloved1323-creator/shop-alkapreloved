alter table public.orders add column if not exists stock_deducted boolean not null default false;
