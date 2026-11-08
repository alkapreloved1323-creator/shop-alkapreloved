-- Support multiple parent and detail categories per product.
alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete cascade;

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (product_id, category_id)
);

create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists product_categories_category_idx on public.product_categories(category_id);

insert into public.categories (name, slug)
values
  ('Men', 'men'),
  ('Women', 'women'),
  ('Fashion', 'fashion'),
  ('Shoes', 'shoes'),
  ('Bags', 'bags'),
  ('Accessories', 'accessories'),
  ('Footwear', 'footwear'),
  ('Outerwear', 'outerwear'),
  ('Vintage', 'vintage')
on conflict (slug) do nothing;

insert into public.product_categories (product_id, category_id)
select p.id, p.category_id from public.products p
where p.category_id is not null
on conflict do nothing;

alter table public.product_categories enable row level security;
create policy "Public can read product categories" on public.product_categories for select to anon, authenticated using (true);
create policy "Admin staff manage product categories" on public.product_categories for all to authenticated using (public.is_admin_or_staff()) with check (public.is_admin_or_staff());
