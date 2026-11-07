"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowUpRight, CirclePercent, Gift, Package, Plus, Trash2 } from "lucide-react";

type PromoType = "percent" | "amount" | "bundle";
type Promo = { id: string; title: string; code: string; type: PromoType; discount: number; maxDiscount: number | null; bundleItems: string[]; starts: string; ends: string; active: boolean };
const initial: Promo[] = [];

const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>(initial);
  const [form, setForm] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string; category: string; price: number; condition: string; stock: number }>>([]);
  const supabase = createSupabaseBrowserClient();
  useEffect(() => {
    supabase.from("promotions").select("id,title,code,type,discount,max_discount,starts_on,ends_on,active").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) { setNotice(`Promo gagal dimuat: ${error.message}`); return; }
      setPromos((data ?? []).map((promo) => ({ id: promo.id, title: promo.title, code: promo.code, type: promo.type as PromoType, discount: Number(promo.discount), maxDiscount: promo.max_discount == null ? null : Number(promo.max_discount), bundleItems: [], starts: promo.starts_on, ends: promo.ends_on, active: promo.active })));
    });
  }, []);
  const [notice, setNotice] = useState("");
  const [type, setType] = useState<PromoType>("percent");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState("");
  useEffect(() => {
    const loadProducts = async () => {
      const query = await supabase.from("products").select("id,name,price,stock,condition,category:categories(name)").gt("stock", 0).order("created_at", { ascending: false });
      if (query.error) {
        setNotice(`Produk gagal dimuat: ${query.error.message}`);
        return;
      }
      setProducts((query.data ?? []).map((item) => {
        const category = Array.isArray(item.category) ? item.category[0] : item.category;
        return { id: item.id, name: item.name, price: Number(item.price), stock: Number(item.stock), condition: String(item.condition ?? "").replace("_", " "), category: category?.name ?? "Uncategorized" };
      }));
    };
    loadProducts().catch(() => setNotice("Produk gagal dimuat dari Supabase."));
  }, []);
  const activeCount = promos.filter((promo) => promo.active).length;
  const bundleCount = promos.filter((promo) => promo.type === "bundle").length;
  const filteredPromos = useMemo(() => promos, [promos]);
  const filteredProducts = useMemo(() => products.filter((product) => `${product.name} ${product.category} ${product.condition}`.toLowerCase().includes(productQuery.toLowerCase())), [productQuery]);
  const addPromo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const promo = { title: String(data.get("title")), code: String(data.get("code")).toUpperCase(), discount: Number(data.get("discount")), maxDiscount: type === "percent" && data.get("maxDiscount") ? Number(data.get("maxDiscount")) : null, type, starts_on: String(data.get("starts")), ends_on: String(data.get("ends")), active: true };
    supabase.from("promotions").insert({ title: promo.title, code: promo.code, discount: promo.discount, max_discount: promo.maxDiscount, type: promo.type, starts_on: promo.starts_on, ends_on: promo.ends_on, active: promo.active }).select("id").single().then(({ data: saved, error }) => {
      if (error || !saved) { setNotice(`Promo gagal disimpan: ${error?.message ?? "data tidak dikembalikan"}`); return; }
      setPromos((list) => [{ ...promo, id: saved.id, bundleItems: type === "bundle" ? products.filter((product) => selectedProducts.includes(product.id)).map((product) => product.name) : [], starts: promo.starts_on, ends: promo.ends_on }, ...list]);
      setForm(false); setType("percent"); setSelectedProducts([]); setProductQuery(""); setNotice("Promo berhasil disimpan ke Supabase."); window.setTimeout(() => setNotice(""), 3000);
    });
    return;
  };
  return <div className="admin-dashboard saas-dashboard saas-promos-page"><header className="saas-heading"><div><p className="saas-eyebrow">Promotion management</p><h1>Promo <span>✦</span></h1><p>Bangun penawaran yang fleksibel untuk meningkatkan conversion dan repeat order.</p></div><div className="saas-heading-actions"><button className="saas-icon-button" aria-label="Promotion overview"><Gift size={18} /></button><button className="saas-primary-button" onClick={() => setForm((open) => !open)}><Plus size={15} /> Create promotion</button></div></header>
    {notice && <p className="saas-notice" role="status">{notice}</p>}
    <section className="saas-promo-metrics"><article className="saas-promo-metric saas-promo-metric-dark"><span>Active promotions</span><strong>{activeCount}</strong><small><b>+2</b> this month</small></article><article className="saas-promo-metric"><span>Redemption rate</span><strong>0%</strong><small>No redemption data</small></article><article className="saas-promo-metric"><span>Bundle campaigns</span><strong>{bundleCount}</strong><small><b>High intent</b> offers</small></article><article className="saas-promo-metric"><span>Discount value</span><strong>Rp 0</strong><small>No discount data</small></article></section>
    {form && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setForm(false); }}><section className="admin-modal saas-promo-modal" role="dialog" aria-modal="true" aria-labelledby="promo-modal-title"><header><div><span className="saas-label">Promotion builder</span><h2 id="promo-modal-title">Create a promotion</h2></div><button type="button" className="admin-row-action" onClick={() => setForm(false)} aria-label="Close promotion form">×</button></header><form onSubmit={addPromo}><div className="saas-promo-type-grid"><label className={type === "percent" ? "is-selected" : ""}><input type="radio" checked={type === "percent"} onChange={() => setType("percent")} /><CirclePercent size={19} /><strong>Percentage</strong><small>Potongan berdasarkan persen</small></label><label className={type === "amount" ? "is-selected" : ""}><input type="radio" checked={type === "amount"} onChange={() => setType("amount")} /><Package size={19} /><strong>Nominal</strong><small>Potongan harga tetap</small></label><label className={type === "bundle" ? "is-selected" : ""}><input type="radio" checked={type === "bundle"} onChange={() => setType("bundle")} /><Gift size={19} /><strong>Product bundle</strong><small>Bundling dengan harga khusus</small></label></div><div className="saas-promo-form-grid"><label>Nama promo<input name="title" required placeholder="Contoh: Weekend essentials" /></label><label>Kode promo<input name="code" required placeholder="WEEKEND20" /></label><label>{type === "percent" ? "Diskon (%)" : type === "amount" ? "Potongan (Rp)" : "Harga bundle (Rp)"}<input name="discount" type="number" min="1" max={type === "percent" ? "100" : undefined} required /></label>{type === "percent" && <label>Batas maksimal diskon (Rp)<input name="maxDiscount" type="number" min="1" placeholder="Contoh: 100000" /><small className="saas-promo-form-hint">Kosongkan jika tidak ada batas maksimal.</small></label>}<label>Mulai<input name="starts" type="date" required /></label><label>Berakhir<input name="ends" type="date" required /></label>{type === "bundle" && <div className="saas-bundle-products"><span>Produk dalam bundle</span><input className="saas-product-search" value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Cari produk, kategori, atau kondisi" aria-label="Cari produk dalam bundle" /><div className="saas-product-table-wrap"><table className="saas-product-table"><thead><tr><th>Pilih</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Condition</th><th>Stok</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={(event) => setSelectedProducts((current) => event.target.checked ? [...current, product.id] : current.filter((item) => item !== product.id))} aria-label={`Pilih ${product.name}`} /></td><td>{product.name}</td><td>{product.category}</td><td>{money(product.price)}</td><td>{product.condition}</td><td>{product.stock}</td></tr>)}</tbody></table>{filteredProducts.length === 0 && <p className="saas-product-empty">Produk tidak ditemukan.</p>}</div></div>}</div><div className="saas-promo-form-actions"><button type="button" className="saas-secondary-button" onClick={() => setForm(false)}>Cancel</button><button className="saas-primary-button" type="submit">Save promotion <ArrowUpRight size={14} /></button></div></form></section></div>}
    <section className="saas-panel saas-promo-workspace"><div className="saas-panel-head"><div><span className="saas-label">Campaign workspace</span><h2>All promotions</h2></div><span className="saas-product-count">{filteredPromos.length} campaigns</span></div><div className="saas-promo-grid">{filteredPromos.map((promo) => <article className="saas-promo-card" key={promo.id}><div className={`saas-promo-card-visual promo-type-${promo.type}`}><span>{promo.type === "percent" ? "%" : promo.type === "amount" ? "Rp" : "✦"}</span><em>{promo.active ? "Active" : "Paused"}</em></div><div className="saas-promo-card-body"><div className="saas-promo-card-head"><div><span className="saas-label">{promo.type === "bundle" ? "Product bundle" : promo.type === "percent" ? "Percentage off" : "Fixed amount"}</span><h3>{promo.title}</h3></div><button className="saas-table-action" aria-label={`Delete ${promo.title}`} onClick={() => setPromos((list) => list.filter((item) => item.id !== promo.id))}><Trash2 size={14} /></button></div><strong className="saas-promo-value">{promo.type === "percent" ? `${promo.discount}%` : money(promo.discount)} <small>{promo.type === "bundle" ? "bundle price" : "discount"}</small></strong>{promo.type === "percent" && promo.maxDiscount && <small className="saas-promo-cap">Maks. {money(promo.maxDiscount)}</small>}<p className="saas-promo-code">{promo.code}</p>{promo.type === "bundle" && <p className="saas-bundle-summary">{promo.bundleItems.join(" + ")}</p>}<p className="saas-promo-dates">{promo.starts} — {promo.ends}</p><button className="saas-outline-button" onClick={() => setPromos((list) => list.map((item) => item.id === promo.id ? { ...item, active: !item.active } : item))}>{promo.active ? "Pause promotion" : "Activate promotion"}</button></div></article>)}</div></section>
    <p className="admin-info-note">Promo aktif tersimpan di Supabase dan dapat digunakan sebagai kupon checkout.</p>
  </div>;
}
