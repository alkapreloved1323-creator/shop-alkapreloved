"use client";

import { UsersRound, Megaphone, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Customer = { id: string; name: string; phone: string; source: string; segment: string; orders: number; spent: number; consent: boolean; note: string };
const seed: Customer[] = [];
const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function AdminCrmPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(seed);
  useEffect(() => {
    createSupabaseBrowserClient().from("customers").select("id,full_name,phone,source,total_orders,total_spent,marketing_consent").order("created_at", { ascending: false }).then(({ data }) => setCustomers((data ?? []).map((customer) => ({ id: customer.id, name: customer.full_name, phone: customer.phone ?? "-", source: customer.source, segment: Number(customer.total_orders) >= 5 ? "VIP" : Number(customer.total_orders) > 1 ? "Active" : "New", orders: Number(customer.total_orders), spent: Number(customer.total_spent), consent: customer.marketing_consent, note: "" }))));
  }, []);
  const totalSpent = customers.reduce((sum, customer) => sum + customer.spent, 0);
  const sourceCounts = customers.reduce<Record<string, number>>((counts, customer) => ({ ...counts, [customer.source]: (counts[customer.source] ?? 0) + 1 }), {});
  const topSource = Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";
  return <div className="admin-dashboard saas-dashboard saas-crm-page"><header className="saas-heading"><div><p className="saas-eyebrow">Customer relationship management</p><h1>CRM overview <span>✦</span></h1><p>Pahami dari mana customer datang, campaign mana yang menghasilkan order, dan audience mana yang siap diaktifkan kembali.</p></div><button className="saas-outline-button saas-crm-view-button" onClick={() => router.push("/admin/customers")}>View customers <ArrowUpRight size={14} /></button></header>
    <section className="saas-promo-metrics"><article className="saas-promo-metric saas-promo-metric-dark"><span>Total customers</span><strong>{customers.length}</strong><small><b>{customers.filter((customer) => customer.consent).length}</b> marketing consent</small></article><article className="saas-promo-metric"><span>Customer value</span><strong>{money(totalSpent)}</strong><small>Lifetime spend tracked</small></article><article className="saas-promo-metric"><span>Active customers</span><strong>{customers.filter((customer) => customer.segment === "Active" || customer.segment === "VIP").length}</strong><small><b>VIP + repeat</b> segments</small></article><article className="saas-promo-metric"><span>Top acquisition</span><strong>{topSource}</strong><small>Based on captured source</small></article></section>
    <div className="saas-crm-grid"><section className="saas-panel saas-crm-sources"><div className="saas-panel-head"><div><span className="saas-label">Acquisition intelligence</span><h2>Customer sources</h2></div><Megaphone size={18} /></div><div className="saas-source-chart"><div className="saas-source-donut" style={{ background: `conic-gradient(#5967d9 0 25%, #e09a63 25% 50%, #4baf8a 50% 75%, #d5b15b 75% 100%)` }}><div><strong>{customers.length}</strong><span>customers</span></div></div><div className="saas-source-breakdown">{Object.entries(sourceCounts).map(([source, count]) => <div className="saas-source-row" key={source}><div><strong>{source}</strong><small>{Math.round(count / customers.length * 100)}% of customers</small></div><div className="saas-source-bar"><i style={{ width: `${count / customers.length * 100}%` }} /></div><b>{count}</b></div>)}</div></div></section><section className="saas-panel saas-crm-segments"><div className="saas-panel-head"><div><span className="saas-label">Audience health</span><h2>Segments</h2></div><UsersRound size={18} /></div>{["New", "Active", "VIP", "Inactive"].map((item) => <button className={`saas-segment-chip segment-${item.toLowerCase()}`} key={item} onClick={() => router.push(`/admin/customers?segment=${item}`)}><span>{item}</span><strong>{customers.filter((customer) => customer.segment === item).length}</strong></button>)}<button className="saas-segment-reset" onClick={() => router.push("/admin/customers")}>View all customer data</button></section></div>
  </div>;
}
