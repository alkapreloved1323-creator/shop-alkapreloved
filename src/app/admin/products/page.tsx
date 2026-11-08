"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Archive, X, ImagePlus, Video, Trash2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProductMedia = { id: string; file?: File; url: string; kind: "image" | "video"; remoteUrl?: string; publicId?: string };
type Consignor = { id: string; name: string; phone: string | null; city: string | null };
type CategoryOption = { id: string; name: string; slug: string; parent_id: string | null };
type ProductRow = { id: string; name: string; description: string; category: string; categoryIds: string[]; parentCategoryIds: string[]; price: number; stock: number; weight: number; is_consignment: boolean; consignor_id: string | null; consignment_percent: number; consignor_name?: string; product_images?: Array<{ id: string; public_url: string; storage_path: string; sort_order?: number }>; status: "active" | "draft" | "sold" | "archived"; condition: string };
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const initialProducts: ProductRow[] = [];
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => value.toLocaleString("id-ID");
const parseNumber = (value: string) => Number(value.replace(/\./g, "").replace(",", ".")) || 0;

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
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [consignorSuggestionsOpen, setConsignorSuggestionsOpen] = useState(false);
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.from("consignors").select("id,name,phone,city").order("name").then(({ data }) => setConsignors((data ?? []) as Consignor[]));
    supabase.from("categories").select("id,name,slug,parent_id").order("name").then(({ data }) => setCategories((data ?? []) as CategoryOption[]));
  }, []);
  useEffect(() => {
    const loadProducts = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("products").select("id,name,description,price,stock,weight,is_consignment,consignor_id,consignment_percent,status,condition,category:categories(name),consignor:consignors(name),product_images(id,public_url,storage_path,sort_order),product_categories(category_id)").order("created_at", { ascending: false });
      if (data) {
        setProducts(data.map((item) => { const categoryIds = (item.product_categories ?? []).map((category) => category.category_id); const parentCategoryIds = categories.filter((category) => category.parent_id === null && categoryIds.includes(category.id)).map((category) => category.id); return { id: item.id, name: item.name, description: item.description ?? "", category: Array.isArray(item.category) ? (item.category[0] as { name?: string } | undefined)?.name ?? "Uncategorized" : (item.category as { name?: string } | null)?.name ?? "Uncategorized", categoryIds, parentCategoryIds, price: Number(item.price), stock: item.stock, weight: Number(item.weight ?? 0), is_consignment: Boolean(item.is_consignment), consignor_id: item.consignor_id ?? null, consignment_percent: Number(item.consignment_percent ?? 0), consignor_name: Array.isArray(item.consignor) ? (item.consignor[0] as { name?: string } | undefined)?.name : (item.consignor as { name?: string } | null)?.name, status: item.status, condition: item.condition.replace("_", " "),         product_images: item.product_images ?? [] }; }));
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
    if (!signatureResponse.ok) {
      const details = await signatureResponse.json().catch(() => null) as { error?: string } | null;
      throw new Error(details?.error ?? "Cloudinary belum siap.");
    }
    const { cloudName, apiKey, timestamp, signature, folder } = await signatureResponse.json();
    const resourceType = item.kind === "video" ? "video" : "image";
    const body = new FormData();
    if (!item.file) throw new Error("Media tersimpan tidak dapat di-upload ulang.");
    body.append("file", item.file);
    body.append("api_key", apiKey);
    body.append("timestamp", String(timestamp));
    body.append("signature", signature);
    body.append("folder", folder);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body });
    if (!response.ok) {
      const details = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      throw new Error(details?.error?.message ?? "Upload media ke Cloudinary gagal.");
    }
    const result = await response.json();
    return { url: result.secure_url as string, publicId: result.public_id as string };
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const supabase = createSupabaseBrowserClient();
    try {
      const selectedCategoryIds = [...new Set([...editing.parentCategoryIds, ...editing.categoryIds])];
      const legacyCategoryId = selectedCategoryIds[0] ?? null;
      const payload = { name: editing.name, slug: slugify(editing.name), description: editing.description, category_id: legacyCategoryId, price: editing.price, stock: editing.stock, weight: editing.weight, is_consignment: editing.is_consignment, consignor_id: editing.is_consignment ? editing.consignor_id : null, consignment_percent: editing.is_consignment ? editing.consignment_percent : 0, status: editing.status, condition: editing.condition.toLowerCase() === "new" ? "like_new" : editing.condition.toLowerCase().replace(/ /g, "_") };
      const result = isUuid(editing.id) ? await supabase.from("products").update(payload).eq("id", editing.id).select("id").single() : await supabase.from("products").insert(payload).select("id").single();
      if (result.error || !result.data) throw new Error(`Produk gagal disimpan ke Supabase: ${result.error?.message ?? "data tidak dikembalikan"}`);
      const productId = result.data.id;
      const { error: categoryLinkError } = await supabase.from("product_categories").delete().eq("product_id", productId);
      if (categoryLinkError) throw new Error(`Kategori produk gagal diperbarui: ${categoryLinkError.message}`);
      if (selectedCategoryIds.length) {
        const { error: categoryInsertError } = await supabase.from("product_categories").insert(selectedCategoryIds.map((category_id) => ({ product_id: productId, category_id })));
        if (categoryInsertError) throw new Error(`Kategori produk gagal disimpan: ${categoryInsertError.message}`);
      }
      const uploaded = await Promise.all(media.filter((mediaItem) => mediaItem.file && !mediaItem.remoteUrl).map(async (mediaItem) => ({ mediaItem, cloudinary: await uploadMedia(mediaItem) }))); await Promise.all(media.filter((mediaItem) => mediaItem.file && !mediaItem.remoteUrl).map(async (mediaItem) => ({ mediaItem, cloudinary: await uploadMedia(mediaItem) })));
      if (uploaded.length) {
        const nextSortOrder = media.filter((mediaItem) => mediaItem.remoteUrl).length;
        const { error: mediaError } = await supabase.from("product_images").insert(uploaded.map(({ cloudinary }, index) => ({ product_id: productId, storage_path: cloudinary.publicId, public_url: cloudinary.url, sort_order: nextSortOrder + index })));
        if (mediaError) throw mediaError;
      }
      if (isUuid(productId)) {
        const { error: orderError } = await supabase.from("product_images").upsert(media.filter((mediaItem) => mediaItem.remoteUrl).map((mediaItem, index) => ({ id: mediaItem.id, product_id: productId, storage_path: mediaItem.publicId ?? "", public_url: mediaItem.remoteUrl ?? mediaItem.url, sort_order: index })), { onConflict: "id" });
        if (orderError) throw orderError;
      }
      const saved = { ...editing, id: productId };
      setProducts((current) => current.some((p) => p.id === saved.id) ? current.map((p) => p.id === saved.id ? saved : p) : [...current, saved]);
      setMedia([]);
      setEditing(null);
      setNotice("Produk dan media tersimpan di Supabase/Cloudinary.");
      window.setTimeout(() => setNotice(""), 3000);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Produk gagal disimpan.");
    }
  };
  const newProduct = () => { setMedia([]); setEditing({ id: `produk-${Date.now()}`, name: "", description: "", category: "Tops", categoryIds: [], parentCategoryIds: [], price: 1000, stock: 0, weight: 0, is_consignment: false, consignor_id: null, consignment_percent: 0, status: "draft", condition: "Good", product_images: [] }); };
  const openEditProduct = (product: ProductRow) => {
    setEditing(product);
    setMedia([...(product.product_images ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((image) => ({ id: image.id, url: image.public_url, remoteUrl: image.public_url, publicId: image.storage_path, kind: image.public_url.match(/\.(mp4|webm|mov)(?:\?|$)/i) ? "video" : "image" })));
  };
  const reorderMedia = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setMedia((current) => {
      const fromIndex = current.findIndex((item) => item.id === fromId);
      const toIndex = current.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };
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
      {viewMode === "table" ? <div className="saas-product-table-wrap"><table className="saas-product-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Condition</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((p) => <tr key={p.id}><td><div className="saas-product-name"><span className="saas-product-avatar">{p.name.slice(0, 1)}</span><strong>{p.name}<small>/{p.id}</small><small className="saas-product-description">{p.description}</small></strong></div></td><td>{p.category}</td><td><b>{money(p.price)}</b></td><td><span className={p.stock <= 2 ? "saas-stock-alert" : ""}>{p.stock} units</span></td><td>{p.condition}</td><td><span className={`saas-status status-${p.status}`}>{p.status}</span></td><td><button className="saas-table-action" onClick={() => openEditProduct(p)} aria-label={`Edit ${p.name}`}><Pencil size={14} /></button><button className="saas-table-action" onClick={() => setProducts((list) => list.map((item) => item.id === p.id ? { ...item, status: "archived" } : item))} aria-label={`Archive ${p.name}`}><Archive size={14} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="admin-empty">No products match your search.</p>}</div> : <div className="saas-product-card-grid">{filtered.map((p) => <article className="saas-product-card" key={p.id}><div className="saas-product-card-visual"><span>{p.name.slice(0, 1)}</span><em className={`saas-status status-${p.status}`}>{p.status}</em></div><div className="saas-product-card-body"><div className="saas-product-card-title"><div><span className="saas-label">{p.category}</span><h3>{p.name}</h3></div><strong>{money(p.price)}</strong></div><p>{p.description}</p><div className="saas-product-card-meta"><span>{p.condition}</span><b className={p.stock <= 2 ? "saas-stock-alert" : ""}>{p.stock} units in stock</b></div><div className="saas-product-card-actions"><button className="saas-table-action" onClick={() => openEditProduct(p)} aria-label={`Edit ${p.name}`}><Pencil size={14} /> Edit</button><button className="saas-table-action" onClick={() => setProducts((list) => list.map((item) => item.id === p.id ? { ...item, status: "archived" } : item))} aria-label={`Archive ${p.name}`}><Archive size={14} /> Archive</button></div></div></article>)}</div>}
    </section>
    {editing && <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setEditing(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><header><h2 id="product-modal-title">{products.some((p) => p.id === editing.id) ? "Edit produk" : "Tambah produk"}</h2><button className="admin-row-action" onClick={() => setEditing(null)} aria-label="Tutup"><X size={18} /></button></header><form onSubmit={save}><div className="saas-media-upload"><div className="saas-media-upload-head"><div><span className="saas-label">Product media</span><strong>Foto & video produk</strong><p>Upload lebih dari satu file untuk menampilkan koleksi produk.</p></div><span>{media.length} file</span></div><div className="saas-media-actions"><label className="saas-upload-button"><ImagePlus size={15} /> Upload photos<input type="file" accept="image/*" multiple onChange={(event) => addMedia(event, "image")} /></label><label className="saas-upload-button saas-upload-video"><Video size={15} /> Upload videos<input type="file" accept="video/*" multiple onChange={(event) => addMedia(event, "video")} /></label></div>{media.length > 0 && <div className="saas-media-grid">{media.map((item) => <div className="saas-media-item" key={item.id} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.id); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorderMedia(event.dataTransfer.getData("text/plain"), item.id); }}><div className="saas-media-drag-handle" aria-label="Geser untuk mengatur urutan" title="Geser untuk mengatur urutan">⠿</div>{item.kind === "image" ? <img src={item.url} alt={item.file?.name ?? "Foto produk"} /> : <video src={item.url} muted controls preload="metadata" /> }<button type="button" onClick={() => removeMedia(item.id)} aria-label={`Remove ${item.file?.name ?? "media"}`}><Trash2 size={13} /></button><small>{item.file?.name ?? "Media tersimpan"}</small></div>)}</div>}</div><label>Nama produk<input required minLength={3} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label><label>Deskripsi produk<textarea className="saas-description-field" required minLength={10} rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Jelaskan bahan, ukuran, detail kondisi, dan keunikan produk..." /></label><div className="admin-form-row"><fieldset className="product-category-picker"><legend>Kategori induk</legend><div className="product-category-options">{categories.filter((category) => category.parent_id === null).map((category) => <label key={category.id}><input type="checkbox" checked={editing.parentCategoryIds.includes(category.id)} onChange={(event) => setEditing({ ...editing, parentCategoryIds: event.target.checked ? [...editing.parentCategoryIds, category.id] : editing.parentCategoryIds.filter((id) => id !== category.id) })} />{category.name}</label>)}</div></fieldset><fieldset className="product-category-picker"><legend>Kategori detail</legend><div className="product-category-options">{categories.filter((category) => category.parent_id !== null || !["Men", "Women", "Fashion", "Shoes", "Bags", "Accessories", "Footwear", "Outerwear", "Vintage"].includes(category.name)).map((category) => <label key={category.id}><input type="checkbox" checked={editing.categoryIds.includes(category.id)} onChange={(event) => setEditing({ ...editing, categoryIds: event.target.checked ? [...editing.categoryIds, category.id] : editing.categoryIds.filter((id) => id !== category.id) })} />{category.name}</label>)}</div></fieldset><label>Kondisi<select value={editing.condition} onChange={(e) => setEditing({ ...editing, condition: e.target.value })}>{["New", "Like new", "Very good", "Good", "Fair", "Poor"].map((c) => <option key={c}>{c}</option>)}</select></label></div><div className="admin-form-row"><label>Harga (Rp)<input type="text" inputMode="numeric" minLength={1} required value={formatNumber(editing.price)} onChange={(e) => setEditing({ ...editing, price: parseNumber(e.target.value) })} /></label><label>Berat (gram)<input type="text" inputMode="numeric" required value={editing.weight ? formatNumber(editing.weight) : ""} onChange={(e) => setEditing({ ...editing, weight: parseNumber(e.target.value) })} placeholder="Contoh: 500" /></label><label>Stok<input type="text" inputMode="numeric" required value={formatNumber(editing.stock)} onChange={(e) => setEditing({ ...editing, stock: parseNumber(e.target.value) })} /></label></div><label className="product-consignment-check"><input type="checkbox" checked={editing.is_consignment} onChange={(event) => setEditing({ ...editing, is_consignment: event.target.checked })} /> Produk titipan</label>{editing.is_consignment && <div className="product-consignment-fields"><label className="consignor-autocomplete">Data penitip<div className="consignor-input-wrap"><input value={editing.consignor_name ?? ""} onFocus={() => setConsignorSuggestionsOpen(true)} onChange={(event) => { const value = event.target.value; const match = consignors.find((consignor) => consignor.name.toLowerCase() === value.toLowerCase()); setEditing({ ...editing, consignor_name: value, consignor_id: match?.id ?? null }); setConsignorSuggestionsOpen(true); }} placeholder="Cari nama penitip..." required />{consignorSuggestionsOpen && <div className="consignor-suggestions" role="listbox">{consignors.filter((consignor) => (editing.consignor_name ?? "").trim() === "" || consignor.name.toLowerCase().includes((editing.consignor_name ?? "").toLowerCase())).map((consignor) => <button type="button" key={consignor.id} role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => { setEditing({ ...editing, consignor_name: consignor.name, consignor_id: consignor.id }); setConsignorSuggestionsOpen(false); }}><strong>{consignor.name}</strong><small>{consignor.city ?? consignor.phone ?? "Data penitip"}</small></button>)}{consignors.filter((consignor) => (editing.consignor_name ?? "").trim() === "" || consignor.name.toLowerCase().includes((editing.consignor_name ?? "").toLowerCase())).length === 0 && <span className="consignor-suggestions-empty">Data penitip tidak ditemukan</span>}</div>}</div></label><label>Bagi hasil penitip (%)<input type="text" inputMode="decimal" value={editing.consignment_percent === 0 ? "0" : String(editing.consignment_percent).replace(".", ",")} onChange={(event) => setEditing({ ...editing, consignment_percent: parseNumber(event.target.value) })} required /></label></div>}<label>Status<select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ProductRow["status"] })}><option value="draft">Draft</option><option value="active">Aktif</option><option value="sold">Terjual</option><option value="archived">Arsip</option></select></label><footer><button type="button" className="admin-secondary-button" onClick={() => setEditing(null)}>Batal</button><button type="submit" className="admin-primary-button">Simpan produk</button></footer></form></section></div>}
  </div>;
}
