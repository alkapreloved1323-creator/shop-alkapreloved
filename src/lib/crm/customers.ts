import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type CustomerProfile = {
  id: string;
  name: string;
  phone: string;
  source: string;
  orders: number;
  spent: number;
  consent: boolean;
};

type CustomerRow = {
  id: string;
  full_name: string;
  phone: string | null;
  source: string;
  total_orders: number;
  total_spent: number;
  marketing_consent: boolean;
};

type OrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
};

export async function loadCustomerProfiles(): Promise<CustomerProfile[]> {
  const supabase = createSupabaseBrowserClient();
  const [customersResult, ordersResult] = await Promise.all([
    supabase.from("customers").select("id,full_name,phone,source,total_orders,total_spent,marketing_consent").order("created_at", { ascending: false }),
    supabase.from("orders").select("id,customer_name,phone,total").order("created_at", { ascending: false }),
  ]);

  const customers = (customersResult.data ?? []) as CustomerRow[];
  const orders = (ordersResult.data ?? []) as OrderRow[];
  const byPhone = new Map<string, CustomerProfile>();

  for (const customer of customers) {
    const phone = customer.phone ?? "-";
    byPhone.set(phone, {
      id: customer.id,
      name: customer.full_name,
      phone,
      source: customer.source || "direct",
      orders: Number(customer.total_orders) || 0,
      spent: Number(customer.total_spent) || 0,
      consent: Boolean(customer.marketing_consent),
    });
  }

  // Orders are the source of truth when CRM capture was skipped during checkout.
  for (const order of orders) {
    const existing = byPhone.get(order.phone);
    if (existing) {
      existing.orders += 1;
      existing.spent += Number(order.total) || 0;
      continue;
    }
    byPhone.set(order.phone, {
      id: `order-customer-${order.phone}`,
      name: order.customer_name,
      phone: order.phone,
      source: "direct",
      orders: 1,
      spent: Number(order.total) || 0,
      consent: false,
    });
  }

  return [...byPhone.values()];
}
