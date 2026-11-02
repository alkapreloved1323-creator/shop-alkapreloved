"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Archive, X } from "lucide-react";

type ProductRow = { id: string; name: string; category: string; price: number; stock: number; status: "active" | "draft" | "sold" | "archived"; condition: string };
const initialProducts: ProductRow[] = [
  { id: "linen-oversized-shirt", name: "Linen Oversized Shirt", category: "Tops", price: 185000, stock: 2, status: "active", condition: "Very good" },
  { id: "everyday-leather-tote", name: "Everyday Leather Tote", category: "Accessories", price: 320000, stock: 1, status: "active", condition: "Good" },
  { id: "soft-tailored-trousers", name: "Soft Tailored Trousers", category: "Bottoms", price: 240000, stock: 1, status: "active", condition: "Like new" },
  { id: "cotton-day-dress", name: "Cotton Day Dress", category: "Dresses", price: 275000, stock: 3, status: "active", condition: "Very good" },
];
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => products.filter((p) => (status === "all" || p.status === status) && `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [products, query, status]);
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setProducts((current) => current.some((p) => p.id === editing.id) ? current.map((p) => p.id === editing.id ? editing : p) : [...current, editing]);
    setEditing(null);
    setNotice("Perubahan produk tersimpan di sesi ini.");
    window.setTimeout(() => setNotice(""), 3000);
  };
  const newProduct = () => setEditing({ id: `produk-${Date.now()}`, name: "", category: "Tops", price: 1000, stock: 0, status: "draft", condition: "Good" });

  return <div className="admin-dashboard"><header className="admin-page-heading"><div><p className="admin-kicker">Katalog toko</p><h1>Produk</h1><p>Kelola koleksi, harga, kondisi, dan ketersediaan produk.</p></div><button className="admin-primary-button" onClick={newProduct}><Plus size={16} /> Tambah produk</button></header>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    <section className="admin-panel"><div className="admin-table-tools"><div className="admin-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk..." aria-label="Cari produk" /></div><label className="admin-filter"><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status"><option value="all">Semua status</option><option value="active">Aktif</option><option value="draft">Draft</option><option value="sold">Terjual</option><option value="archived">Arsip</option></select></label></div>
      <div className="admin-data-table-wrap"><table className="admin-data-table"><thead><tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Kondisi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{filtered.map((p) => <tr key={p.id}><td><strong>{p.name}</strong><small>/{p.id}</small></td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td><td>{p.condition}</td><td><span className={`admin-status status-${p.status}`}>{p.status}</span></td><td><button className="admin-row-action" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil size={15} /></button><button className="admin-row-action" onClick={() => setProducts((list) => list.map((item) => item.id === p.id ? { ...item, status: "archived" } : item))} aria-label={`Arsipkan ${p.name}`}><Archive size={15} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="admin-empty">Tidak ada produk yang cocok.</p>}</div>
    </section>
    {editing && <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><header><h2 id="product-modal-title">{products.some((p) => p.id === editing.id) ? "Edit produk" : "Tambah produk"}</h2><button className="admin-row-action" onClick={() => setEditing(null)} aria-label="Tutup"><X size={18} /></button></header><form onSubmit={save}><label>Nama produk<input required minLength={3} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label><div className="admin-form-row"><label>Kategori<select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>{["Tops", "Bottoms", "Dresses", "Accessories", "Footwear", "Outerwear", "Vintage"].map((c) => <option key={c}>{c}</option>)}</select></label><label>Kondisi<select value={editing.condition} onChange={(e) => setEditing({ ...editing, condition: e.target.value })}>{["Like new", "Very good", "Good", "Fair", "Poor"].map((c) => <option key={c}>{c}</option>)}</select></label></div><div className="admin-form-row"><label>Harga (Rp)<input type="number" min={1000} required value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></label><label>Stok<input type="number" min={0} required value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label></div><label>Status<select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ProductRow["status"] })}><option value="draft">Draft</option><option value="active">Aktif</option><option value="sold">Terjual</option><option value="archived">Arsip</option></select></label><footer><button type="button" className="admin-secondary-button" onClick={() => setEditing(null)}>Batal</button><button type="submit" className="admin-primary-button">Simpan produk</button></footer></form></section></div>}
  </div>;
}
