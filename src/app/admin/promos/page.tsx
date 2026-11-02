"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Promo = { id: number; title: string; code: string; discount: number; type: "percent" | "amount"; starts: string; ends: string; active: boolean };
const initial: Promo[] = [
  { id: 1, title: "Vintage Weekend", code: "VINTAGE15", discount: 15, type: "percent", starts: "2026-11-01", ends: "2026-11-30", active: true },
  { id: 2, title: "New customer welcome", code: "WELCOME25000", discount: 25000, type: "amount", starts: "2026-10-01", ends: "2026-12-31", active: true },
];

export default function AdminPromosPage() {
  const [promos, setPromos] = useState(initial);
  const [form, setForm] = useState(false);
  const [notice, setNotice] = useState("");
  const addPromo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPromos((list) => [...list, { id: Date.now(), title: String(data.get("title")), code: String(data.get("code")).toUpperCase(), discount: Number(data.get("discount")), type: data.get("type") as Promo["type"], starts: String(data.get("starts")), ends: String(data.get("ends")), active: true }]);
    setForm(false);
    setNotice("Promo ditambahkan di sesi ini.");
    window.setTimeout(() => setNotice(""), 3000);
  };
  return <div className="admin-dashboard"><header className="admin-page-heading"><div><p className="admin-kicker">Merchandising</p><h1>Promo</h1><p>Kelola kode promo dan penawaran yang ditampilkan pada halaman promo.</p></div><button className="admin-primary-button" onClick={() => setForm(!form)}><Plus size={16} /> Buat promo</button></header>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {form && <section className="admin-panel admin-promo-form-panel"><h2>Promo baru</h2><form className="admin-promo-form" onSubmit={addPromo}><label>Nama promo<input name="title" required /></label><label>Kode promo<input name="code" required /></label><label>Diskon<input name="discount" type="number" min="1" required /></label><label>Tipe<select name="type"><option value="percent">Persen (%)</option><option value="amount">Nominal (Rp)</option></select></label><label>Mulai<input name="starts" type="date" required /></label><label>Berakhir<input name="ends" type="date" required /></label><button className="admin-primary-button" type="submit">Simpan promo</button></form></section>}
    <section className="admin-promo-grid">{promos.map((promo) => <article className="admin-panel admin-promo-card" key={promo.id}><div className="admin-promo-card-top"><span className="admin-promo-tag">{promo.active ? "Aktif" : "Nonaktif"}</span><button className="admin-row-action" aria-label={`Hapus promo ${promo.title}`} onClick={() => setPromos((list) => list.filter((p) => p.id !== promo.id))}><Trash2 size={15} /></button></div><p className="admin-kicker">{promo.title}</p><h2>{promo.code}</h2><strong>{promo.type === "percent" ? `${promo.discount}%` : `Rp ${promo.discount.toLocaleString("id-ID")}`} <small>diskon</small></strong><p>Berlaku {promo.starts} — {promo.ends}</p><button className="admin-secondary-button" onClick={() => setPromos((list) => list.map((p) => p.id === promo.id ? { ...p, active: !p.active } : p))}>{promo.active ? "Nonaktifkan" : "Aktifkan"}</button></article>)}</section>
    <p className="admin-info-note">Catatan: daftar promo ini saat ini disimpan di sesi browser dan belum tersambung ke database atau halaman promo publik.</p>
  </div>;
}
