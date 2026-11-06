"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Archive, X, ImagePlus, Video, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProductMedia = { id: string; file: File; url: string; kind: "image" | "video"; remoteUrl?: string; publicId?: string };
type ProductRow = { id: string; name: string; description: string; category: string; price: number; stock: number; status: "active" | "draft" | "sold" | "archived"; condition: string };
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const initialProducts: ProductRow[] = [];
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [notice, setNotice] = useState("");
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [media, setMedia] = useState<ProductMedia[]>([]);
  useEffect(() => {
    const loadProducts = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("products").select("id,name,description,price,stock,status,condition,category:categories(name)").order("created_at", { ascending: false });
      if (data) {
        setProducts(data.map((item) => ({ id: item.id, name: item.name, description: item.description ?? "", category: Array.isArray(item.category) ? (item.category[0] as { name?: string } | undefined)?.name ?? "Uncategorized" : (item.category as { name?: string } | null)?.name ?? "Uncategorized", price: Number(item.price), stock: item.stock, status: item.status, condition: item.condition.replace("_", " ") })));
      }
    };
    loadProducts().catch(() => undefined);
  }, []);
  const filtered = useMemo(() => products.filter((p) => (status === "all" || p.status === status) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query.toLowerCase())), [products, query, status]);
  const activeCount = products.filter((product) => product.status === "active").length;
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 2).length;
  const inventoryValue = products.reduce((total, product) => total + product.price * product.stock, 0);
  const uploadMedia = async (item: ProductMedia) => {
    const signatureResponse = await fetch("/api/cloudinary/signature", { method: "POST" });
    if (!signatureResponse.ok) throw new Error("Cloudinary belum siap.");
    const { cloudName, apiKey, timestamp, signature } = await signatureResponse.json();
    const resourceType = item.kind === "video" ? "video" : "image";
    const body = new FormData();
    body.append("file", item.file);
    body.append("api_key", apiKey);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);
    body.append("folder", "alkapreloved/products");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body });
    if (!response.ok) throw new Error("Upload media ke Cloudinary gagal.");
    const result = await response.json();
    return { url: result.secure_url as string, publicId: result.public_id as string };
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const supabase = createSupabaseBrowserClient();
    try {
      const categorySlug = slugify(editing.category);
      let categoryId: string | null = null;
      const categoryResult = await supabase.from("categories").upsert({ name: editing.category, slug: categorySlug }, { onConflict: "slug" }).select("id").single();
      if (!categoryResult.error) categoryId = categoryResult.data.id;
      const payload = { name: editing.name, slug: slugify(editing.name), description: editing.description, category_id: categoryId, price: editing.price, stock: editing.stock, status: editing.status, condition: editing.condition.toLowerCase().replace(/ /g, "_") };
      const result = isUuid(editing.id) ? await supabase.from("products").update(payload).eq("id", editing.id).select("id").single() : await supabase.from("products").insert(payload).select("id").single();
      if (result.error || !result.data) throw new Error("Produk gagal disimpan ke Supabase.");
      const productId = result.data.id;
      const uploaded = await Promise.all(media.filter((mediaItem) => !mediaItem.remoteUrl).map(async (mediaItem) => ({ mediaItem, cloudinary: await uploadMedia(mediaItem) })));
      if (uploaded.length) {
        const { error: mediaError } = await supabase.from("product_images").insert(uploaded.map(({ cloudinary }, index) => ({ product_id: productId, storage_path: cloudinary.publicId, public_url: cloudinary.url, sort_order: index })));
        if (mediaError) throw mediaError;
      }
      const saved = { ...editing, id: productId };
      setProducts((current) => current.some((p) => p.id === saved.id) ? current.map((p) => p.id === saved.id ? saved : p) : [...current, saved]);
      setEditing(null);
      setNotice("Produk dan media tersimpan di Supabase/Cloudinary.");
      window.setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Produk gagal disimpan.");
    }
  };
  const newProduct = () => { setMedia([]); setEditing({ id: `produk-${Date.now()}`, name: "", description: "", category: "Tops", price: 1000, stock: 0, status: "draft", condition: "Good" }); };
  const addMedia = (event: React.ChangeEvent<HTMLInputElement>, kind: ProductMedia["kind"]) => {
    const files = Array.from(event.target.files ?? []).filter((file) => kind === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/"));
    setMedia((current) => [...current, ...files.map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, url: URL.createObjectURL(file), kind }))]);
    event.target.value = "";
  };
  const removeMedia = async (id: string) => {
    const item = media.find((entry) => entry.id === id);
    if (!item) return;
    if (item.remoteUrl) {
      const publicId = item.remoteUrl.split("/upload/")[1]?.split(".")[0];
      if (publicId) await fetch("/api/cloudinary/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicId, resourceType: item.kind }) });
    }
    URL.revokeObjectURL(item.url);
    setMedia((current) => current.filter((entry) => entry.id !== id));
  };
  useEffect(() => () => media.forEach((item) => URL.revokeObjectURL(item.url)), [media]);

  return <div className="admin-dashboard saas-dashboard saas-products-page"><header className="saas-heading"><div><p className="saas-eyebrow">Product management</p><h1>Produk <span>✦</span></h1><p>Kelola katalog, stok, dan performa koleksi dalam satu tempat.</p></div><div className="saas-heading-actions"><div className="saas-product-menu-wrap"><button className="saas-icon-button" aria-label="Product notifications" onClick={() => setNotificationsOpen((open) => !open)} aria-expanded={notificationsOpen}>⌁</button>{notificationsOpen && <div className="saas-product-popover"><strong>Catalog alerts</strong><p>{lowStockCount} products need restocking.</p><button onClick={() => { setStatus("active"); setNotificationsOpen(false); }}>View active inventory</button></div>}</div><div className="saas-product-menu-wrap"><button className="saas-date-button" onClick={() => setCatalogMenuOpen((open) => !open)} aria-expanded={catalogMenuOpen} aria-haspopup="listbox"><span>Catalog overview</span><span className="saas-catalog-chevron">⌄</span></button>{catalogMenuOpen && <div className="saas-product-popover saas-catalog-popover" role="listbox" aria-label="Catalog view"><button onClick={() => { setStatus("all"); setCatalogMenuOpen(false); }}>All products <small>Full catalog</small></button><button onClick={() => { setStatus("active"); setCatalogMenuOpen(false); }}>Active inventory <small>Published products</small></button><button onClick={() => { setStatus("draft"); setCatalogMenuOpen(false); }}>Draft products <small>Needs review</small></button></div>}</div><button className="saas-primary-button" onClick={newProduct}><Plus size={15} /> Add product</button></div></header>
    {notice && <p className="saas-notice" role="status">{notice}</p>}
    <section className="saas-product-metrics"><article className="saas-product-metric"><span>Total products</span><strong>{products.length}</strong><small><b>{activeCount} active</b> in catalog</small></article><article className="saas-product-metric"><span>Inventory value</span><strong>{money(inventoryValue)}</strong><small>No comparison data</small></article><article className="saas-product-metric"><span>Low stock alerts</span><strong>{lowStockCount}</strong><small><b className="saas-warning">Needs attention</b> today</small></article><article className="saas-product-metric saas-product-metric-dark"><span>Sell-through rate</span><strong>0%</strong><small>No sales data</small></article></section>
    <section className="saas-panel saas-products-panel"><div className="saas-panel-head"><div><span className="saas-label">Catalog workspace</span><h2>All products</h2></div><div className="saas-catalog-tools"><span className="saas-product-count">{filtered.length} results</span><div className="saas-view-toggle" role="group" aria-label="Catalog view"><button className={viewMode === "table" ? "is-active" : ""} onClick={() => setViewMode("table")} aria-label="Table view" aria-pressed={viewMode === "table"}>Table</button><button className={viewMode === "cards" ? "is-active" : ""} onClick={() => setViewMode("cards")} aria-label="Card view" aria-pressed={viewMode === "cards"}>Cards</button></div></div></div><div className="saas-product-tools"><div className="saas-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." aria-label="Search products" /></div><select className="saas-product-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter product status"><option value="all">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="sold">Sold</option><option value="archived">Archived</option></select></div>
      {viewMode === "table" ? <div className="saas-product-table-wrap"><table className="saas-product-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Condition</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((p) => <tr key={p.id}><td><div className="saas-product-name"><span className="saas-product-avatar">{p.name.slice(0, 1)}</span><strong>{p.name}<small>/{p.id}</small><small className="saas-product-description">{p.description}</small></strong></div></td><td>{p.category}</td><td><b>{money(p.price)}</b></td><td><span className={p.stock <= 2 ? "saas-stock-alert" : ""}>{p.stock} units</span></td><td>{p.condition}</td><td><span className={`saas-status status-${p.status}`}>{p.status}</span></td><td><button className="saas-table-action" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil size={14} /></button><button className="saas-table-action" onClick={() => setProducts((list) => list.map((item) => item.id === p.id ? { ...item, status: "archived" } : item))} aria-label={`Archive ${p.name}`}><Archive size={14} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="admin-empty">No products match your search.</p>}</div> : <div className="saas-product-card-grid">{filtered.map((p) => <article className="saas-product-card" key={p.id}><div className="saas-product-card-visual"><span>{p.name.slice(0, 1)}</span><em className={`saas-status status-${p.status}`}>{p.status}</em></div><div className="saas-product-card-body"><div className="saas-product-card-title"><div><span className="saas-label">{p.category}</span><h3>{p.name}</h3></div><strong>{money(p.price)}</strong></div><p>{p.description}</p><div className="saas-product-card-meta"><span>{p.condition}</span><b className={p.stock <= 2 ? "saas-stock-alert" : ""}>{p.stock} units in stock</b></div><div className="saas-product-card-actions"><button className="saas-table-action" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil size={14} /> Edit</button><button className="saas-table-action" onClick={() => setProducts((list) => list.map((item) => item.id === p.id ? { ...item, status: "archived" } : item))} aria-label={`Archive ${p.name}`}><Archive size={14} /> Archive</button></div></div></article>)}</div>}
    </section>
    {editing && <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><header><h2 id="product-modal-title">{products.some((p) => p.id === editing.id) ? "Edit produk" : "Tambah produk"}</h2><button className="admin-row-action" onClick={() => setEditing(null)} aria-label="Tutup"><X size={18} /></button></header><form onSubmit={save}><div className="saas-media-upload"><div className="saas-media-upload-head"><div><span className="saas-label">Product media</span><strong>Foto & video produk</strong><p>Upload lebih dari satu file untuk menampilkan koleksi produk.</p></div><span>{media.length} file</span></div><div className="saas-media-actions"><label className="saas-upload-button"><ImagePlus size={15} /> Upload photos<input type="file" accept="image/*" multiple onChange={(event) => addMedia(event, "image")} /></label><label className="saas-upload-button saas-upload-video"><Video size={15} /> Upload videos<input type="file" accept="video/*" multiple onChange={(event) => addMedia(event, "video")} /></label></div>{media.length > 0 && <div className="saas-media-grid">{media.map((item) => <div className="saas-media-item" key={item.id}>{item.kind === "image" ? <img src={item.url} alt={item.file.name} /> : <video src={item.url} muted controls preload="metadata" /> }<button type="button" onClick={() => removeMedia(item.id)} aria-label={`Remove ${item.file.name}`}><Trash2 size={13} /></button><small>{item.file.name}</small></div>)}</div>}</div><label>Nama produk<input required minLength={3} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label><label>Deskripsi produk<textarea className="saas-description-field" required minLength={10} rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Jelaskan bahan, ukuran, detail kondisi, dan keunikan produk..." /></label><div className="admin-form-row"><label>Kategori<select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>{["Tops", "Bottoms", "Dresses", "Accessories", "Footwear", "Outerwear", "Vintage"].map((c) => <option key={c}>{c}</option>)}</select></label><label>Kondisi<select value={editing.condition} onChange={(e) => setEditing({ ...editing, condition: e.target.value })}>{["New", "Like new", "Very good", "Good", "Fair", "Poor"].map((c) => <option key={c}>{c}</option>)}</select></label></div><div className="admin-form-row"><label>Harga (Rp)<input type="number" min={1000} required value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></label><label>Stok<input type="number" min={0} required value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label></div><label>Status<select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ProductRow["status"] })}><option value="draft">Draft</option><option value="active">Aktif</option><option value="sold">Terjual</option><option value="archived">Arsip</option></select></label><footer><button type="button" className="admin-secondary-button" onClick={() => setEditing(null)}>Batal</button><button type="submit" className="admin-primary-button">Simpan produk</button></footer></form></section></div>}
  </div>;
}
