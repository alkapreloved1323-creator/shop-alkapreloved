-- Keep finance records synchronized with paid/confirmed orders.
alter table public.sold_products add column if not exists order_item_id uuid references public.order_items(id) on delete set null;

drop index if exists public.sold_products_order_item_unique_idx;
create unique index if not exists sold_products_order_item_unique_idx
  on public.sold_products(order_item_id);

create or replace function public.sync_sold_products_for_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.payment_status = 'paid'::public.payment_status
     or new.order_status in ('payment_confirmed', 'processing', 'packed', 'shipped', 'delivered', 'completed') then
    insert into public.sold_products (
      order_item_id, product_id, product_name, sold_at, sale_price,
      consignment_percent, consignor_id, consignor_name, owner_payout, store_earnings
    )
    select
      oi.id,
      oi.product_id,
      oi.product_name,
      coalesce(new.updated_at, new.created_at),
      oi.subtotal,
      coalesce(p.consignment_percent, 0),
      p.consignor_id,
      c.name,
      round(oi.subtotal * coalesce(p.consignment_percent, 0) / 100),
      oi.subtotal - round(oi.subtotal * coalesce(p.consignment_percent, 0) / 100)
    from public.order_items oi
    join public.products p on p.id = oi.product_id
    left join public.consignors c on c.id = p.consignor_id
    where oi.order_id = new.id
    on conflict (order_item_id) do update set
      product_id = excluded.product_id,
      product_name = excluded.product_name,
      sale_price = excluded.sale_price,
      consignment_percent = excluded.consignment_percent,
      consignor_id = excluded.consignor_id,
      consignor_name = excluded.consignor_name,
      owner_payout = excluded.owner_payout,
      store_earnings = excluded.store_earnings,
      updated_at = timezone('utc', now());
  end if;
  return new;
end;
$$;

revoke all on function public.sync_sold_products_for_order() from public;
grant execute on function public.sync_sold_products_for_order() to anon, authenticated;

drop trigger if exists orders_sync_sold_products on public.orders;
create trigger orders_sync_sold_products
after insert or update of payment_status, order_status on public.orders
for each row execute function public.sync_sold_products_for_order();

-- Backfill orders that were already paid or moved past payment confirmation.
insert into public.sold_products (
  order_item_id, product_id, product_name, sold_at, sale_price,
  consignment_percent, consignor_id, consignor_name, owner_payout, store_earnings
)
select
  oi.id,
  oi.product_id,
  oi.product_name,
  coalesce(o.updated_at, o.created_at),
  oi.subtotal,
  coalesce(p.consignment_percent, 0),
  p.consignor_id,
  c.name,
  round(oi.subtotal * coalesce(p.consignment_percent, 0) / 100),
  oi.subtotal - round(oi.subtotal * coalesce(p.consignment_percent, 0) / 100)
from public.orders o
join public.order_items oi on oi.order_id = o.id
join public.products p on p.id = oi.product_id
left join public.consignors c on c.id = p.consignor_id
where o.payment_status = 'paid'::public.payment_status
   or o.order_status in ('payment_confirmed', 'processing', 'packed', 'shipped', 'delivered', 'completed')
on conflict (order_item_id) do nothing;
