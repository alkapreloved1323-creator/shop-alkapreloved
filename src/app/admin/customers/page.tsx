"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, UserRound, Plus, X } from "lucide-react";

type Customer = { id: string; name: string; email: string; source: string; segment: string; orders: number; spent: number; consent: boolean; note: string };
const seed: Customer[] = [
  { id: "1", name: "Alya Rahma", email: "alya@example.com", source: "Instagram", segment: "VIP", orders: 8, spent: 4260000, consent: true, note: "Suka koleksi linen dan warna earth tone." },
  { id: "2", name: "Dimas Pratama", email: "dimas@example.com", source: "Google", segment: "Active", orders: 3, spent: 1280000, consent: true, note: "Follow up untuk drop sneakers." },
  { id: "3", name: "Nadia Putri", email: "nadia@example.com", source: "Referral", segment: "New", orders: 1, spent: 320000, consent: false, note: "" },
  { id: "4", name: "Raka Wijaya", email: "raka@example.com", source: "TikTok", segment: "Inactive", orders: 2, spent: 780000, consent: true, note: "Belum order lagi sejak 90 hari." },
];
const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function AdminCustomersPage() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState(seed);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState(() => searchParams.get("segment") ?? "All segments");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [note, setNote] = useState("");
  const filtered = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.email} ${customer.source}`.toLowerCase().includes(query.toLowerCase()) && (segment === "All segments" || customer.segment === segment)), [customers, query, segment]);
  const addNote = () => { if (!selected || !note.trim()) return; setCustomers((list) => list.map((customer) => customer.id === selected.id ? { ...customer, note: note.trim() } : customer)); setSelected(null); setNote(""); };

  return <div className="admin-dashboard saas-dashboard saas-crm-page"><header className="saas-heading"><div><p className="saas-eyebrow">Customer database</p><h1>Customers <span>✦</span></h1><p>Kelola profil customer, segmentasi, sumber akuisisi, dan catatan interaksi dalam satu tempat.</p></div><button className="saas-primary-button" onClick={() => setSelected({ id: "new", name: "", email: "", source: "Direct", segment: "New", orders: 0, spent: 0, consent: false, note: "" })}><Plus size={15} /> Add customer note</button></header>
    <section className="saas-panel saas-crm-table"><div className="saas-panel-head"><div><span className="saas-label">Customer database</span><h2>All customers</h2></div><span className="saas-product-count">{filtered.length} profiles</span></div><div className="saas-crm-toolbar"><label className="saas-search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or source" /></label><select value={segment} onChange={(event) => setSegment(event.target.value)}><option>All segments</option><option>New</option><option>Active</option><option>VIP</option><option>Inactive</option></select></div><div className="saas-table-scroll"><table className="saas-data-table"><thead><tr><th>Customer</th><th>Source</th><th>Segment</th><th>Orders</th><th>Lifetime value</th><th>Consent</th><th /></tr></thead><tbody>{filtered.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong><small>{customer.email}</small></td><td>{customer.source}</td><td><span className={`saas-status-pill segment-${customer.segment.toLowerCase()}`}>{customer.segment}</span></td><td>{customer.orders}</td><td>{money(customer.spent)}</td><td>{customer.consent ? "Yes" : "No"}</td><td><button className="saas-table-action" onClick={() => { setSelected(customer); setNote(customer.note); }} aria-label={`Add note for ${customer.name}`}><UserRound size={14} /></button></td></tr>)}</tbody></table></div></section>
    {selected && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="admin-modal saas-crm-note-modal" role="dialog" aria-modal="true" aria-labelledby="crm-note-title"><header><div><span className="saas-label">Customer interaction</span><h2 id="crm-note-title">{selected.name ? `Note for ${selected.name}` : "Add customer note"}</h2></div><button className="admin-row-action" onClick={() => setSelected(null)} aria-label="Close note form"><X size={16} /></button></header>{selected.name ? <p className="saas-crm-note-meta">{selected.email} · {selected.source} · {selected.segment}</p> : <p className="saas-crm-note-meta">Pilih customer dari database untuk menambahkan catatan.</p>}<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tulis konteks, preferensi, atau follow-up customer..." rows={5} /><div className="saas-promo-form-actions"><button className="saas-secondary-button" onClick={() => setSelected(null)}>Cancel</button><button className="saas-primary-button" onClick={addNote}>Save note</button></div></section></div>}
  </div>;
}
