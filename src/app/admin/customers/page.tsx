"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

type Customer = { id: string; name: string; phone: string; source: string; segment: string; orders: number; spent: number; consent: boolean };
const seed: Customer[] = [];
const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function AdminCustomersPage() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>(seed);
  useEffect(() => {
    createSupabaseBrowserClient().from("customers").select("id,full_name,phone,source,total_orders,total_spent,marketing_consent").order("created_at", { ascending: false }).then(({ data }) => setCustomers((data ?? []).map((customer) => ({ id: customer.id, name: customer.full_name, phone: customer.phone ?? "-", source: customer.source, segment: Number(customer.total_orders) >= 5 ? "VIP" : Number(customer.total_orders) > 1 ? "Active" : "New", orders: Number(customer.total_orders), spent: Number(customer.total_spent), consent: customer.marketing_consent }))));
  }, []);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState(() => searchParams.get("segment") ?? "All segments");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const filtered = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.source}`.toLowerCase().includes(query.toLowerCase()) && (segment === "All segments" || customer.segment === segment)), [customers, query, segment]);

  return <div className="admin-dashboard saas-dashboard saas-crm-page"><header className="saas-heading"><div><p className="saas-eyebrow">Customer database</p><h1>Customers <span>✦</span></h1><p>Kelola profil customer, segmentasi, dan sumber akuisisi dalam satu tempat.</p></div></header>
    <section className="saas-panel saas-crm-table"><div className="saas-panel-head"><div><span className="saas-label">Customer database</span><h2>All customers</h2></div><span className="saas-product-count">{filtered.length} profiles</span></div><div className="saas-crm-toolbar"><label className="saas-search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, WhatsApp, or source" /></label><select value={segment} onChange={(event) => setSegment(event.target.value)}><option>All segments</option><option>New</option><option>Active</option><option>VIP</option><option>Inactive</option></select></div><div className="saas-table-scroll"><table className="saas-data-table"><thead><tr><th>Customer / No. WhatsApp</th><th>Source</th><th>Segment</th><th>Orders</th><th>Lifetime value</th><th>Consent</th><th /></tr></thead><tbody>{filtered.map((customer) => <tr key={customer.id} className="saas-customer-row" onClick={() => setSelectedCustomer(customer)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedCustomer(customer); }}><td><strong>{customer.name}</strong><small>{customer.phone}</small></td><td>{customer.source}</td><td><span className={`saas-status-pill segment-${customer.segment.toLowerCase()}`}>{customer.segment}</span></td><td>{customer.orders}</td><td>{money(customer.spent)}</td><td>{customer.consent ? "Yes" : "No"}</td><td /></tr>)}</tbody></table></div></section>
    {selectedCustomer && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCustomer(null); }}><section className="admin-modal saas-customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title"><header><div><span className="saas-label">Customer profile</span><h2 id="customer-detail-title">{selectedCustomer.name}</h2></div><button className="admin-row-action" onClick={() => setSelectedCustomer(null)} aria-label="Close customer details"><X size={16} /></button></header><div className="saas-customer-profile"><div className="saas-customer-avatar">{selectedCustomer.name.charAt(0)}</div><div><strong>{selectedCustomer.phone}</strong><span>{selectedCustomer.source} · {selectedCustomer.segment}</span></div></div><dl className="saas-customer-details"><div><dt>Customer ID</dt><dd>{selectedCustomer.id}</dd></div><div><dt>No. WhatsApp</dt><dd>{selectedCustomer.phone}</dd><dt>Source</dt><dd>{selectedCustomer.source}</dd></div><div><dt>Segment</dt><dd><span className={`saas-status-pill segment-${selectedCustomer.segment.toLowerCase()}`}>{selectedCustomer.segment}</span></dd></div><div><dt>Total orders</dt><dd>{selectedCustomer.orders}</dd></div><div><dt>Lifetime value</dt><dd>{money(selectedCustomer.spent)}</dd></div><div><dt>Marketing consent</dt><dd>{selectedCustomer.consent ? "Yes" : "No"}</dd></div></dl></section></div>}
  </div>;
}
