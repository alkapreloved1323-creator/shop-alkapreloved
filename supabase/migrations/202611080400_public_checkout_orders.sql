alter table public.orders add column if not exists discount bigint not null default 0 check (discount >= 0);
alter table public.orders drop constraint if exists orders_total_check;
alter table public.orders add constraint orders_total_check check (total = subtotal - discount + shipping_cost and total >= 0);
create policy "Public can create orders" on public.orders for insert to anon, authenticated with check (true);
create policy "Public can create order items" on public.order_items for insert to anon, authenticated with check (exists (select 1 from public.orders o where o.id = order_id));
