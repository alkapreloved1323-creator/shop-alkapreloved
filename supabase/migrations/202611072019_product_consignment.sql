-- Add consignment metadata to products for the product form.
alter table public.products add column if not exists is_consignment boolean not null default false;
alter table public.products add column if not exists consignor_id uuid references public.consignors(id) on delete set null;
alter table public.products add column if not exists consignment_percent numeric(5,2) check (consignment_percent is null or (consignment_percent >= 0 and consignment_percent <= 100));

notify pgrst, 'reload schema';
