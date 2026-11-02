"use client";

import { useMemo, useState } from "react";
import { Search, Save } from "lucide-react";

type Order = { id: string; customer: string; email: string; phone: string; item: string; total: number; payment: string; status: string; courier: string; tracking: string; date: string };
const initialOrders: Order[] = [
  { id: "ALK-20261101-2841", customer: "Nadia Putri", email: "nadia@example.com", phone: "081234567890", item: "Linen Oversized Shirt", total: 185000, payment: "paid", status: "payment_confirmed", courier: "JNE", tracking: "", date: "1 Nov 2026" },
  { id: "ALK-20261031-1830", customer: "Raka Adi", email: "raka@example.com", phone: "081298765432", item: "Everyday Leather Tote", total: 320000, payment: "paid", status: "processing", courier: "J&T", tracking: "", date: "31 Okt 2026" },
  { id: "ALK-20261030-9072", customer: "Maya Sari", email: "maya@example.com", phone: "081345678901", item: "Soft Tailored Trousers", total: 240000, payment: "paid", status: "shipped", courier: "SiCepat", tracking: "SC123456789", date: "30 Okt 2026" },
  { id: "ALK-20261029-4418", customer: "Dimas Kurnia", email: "dimas@example.com", phone: "081223344556", item: "Cotton Day Dress", total: 275000, payment: "pending", status: "pending_payment", courier: "JNE", tracking: "", date: "29 Okt 2026" },
];
const statuses = ["pending_payment", "payment_confirmed", "processing", "packed", "shipped", "delivered", "completed", "cancelled"];
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => orders.filter((o) => (filter === "all" || o.status === filter) && `${o.id} ${o.customer} ${o.email} ${o.phone}`.toLowerCase().includes(query.toLowerCase())), [orders, query, filter]);
  const update = (id: string, changes: Partial<Order>) => setOrders((list) => list.map((o) => o.id === id ? { ...o, ...changes } : o));
  const save = () => { setNotice("Perubahan pesanan tersimpan di sesi ini."); window.setTimeout(() => setNotice(""), 3000); };
  return <div className="admin-dashboard"><header className="admin-page-heading"><div><p className="admin-kicker">Operasional toko</p><h1>Pesanan</h1><p>Perbarui status pembayaran, proses, dan nomor resi untuk tracking pelanggan.</p></div></header>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    <section className="admin-panel"><div className="admin-table-tools"><div className="admin-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nomor pesanan, nama, email..." aria-label="Cari pesanan" /></div><label className="admin-filter"><select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter status"><option value="all">Semua status</option>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label></div>
      <div className="admin-order-manage-list">{visible.map((o) => <article className="admin-order-manage-card" key={o.id}><div className="admin-order-manage-head"><div><strong>{o.id}</strong><span>{o.customer} · {o.email} · {o.phone}</span><small>{o.item} · {o.date}</small></div><strong>{money(o.total)}</strong></div><div className="admin-order-fields"><label>Status pesanan<select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label><label>Status pembayaran<select value={o.payment} onChange={(e) => update(o.id, { payment: e.target.value })}><option value="pending">Menunggu</option><option value="paid">Dibayar</option><option value="failed">Gagal</option><option value="refunded">Refund</option></select></label><label>Kurir<input value={o.courier} onChange={(e) => update(o.id, { courier: e.target.value })} placeholder="JNE / J&T" /></label><label>Nomor resi<input value={o.tracking} onChange={(e) => update(o.id, { tracking: e.target.value })} placeholder="Masukkan nomor resi" /></label><button className="admin-primary-button" onClick={save}><Save size={15} /> Simpan</button></div></article>)}{visible.length === 0 && <p className="admin-empty">Tidak ada pesanan yang cocok.</p>}</div>
    </section>
  </div>;
}
