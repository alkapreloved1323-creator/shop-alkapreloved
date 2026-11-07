alter table public.promotions add column if not exists max_discount numeric check (max_discount is null or max_discount > 0);
