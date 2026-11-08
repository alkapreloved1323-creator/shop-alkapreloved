"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleDollarSign, PackageCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Sale = { id: string; product_name: string; sold_at: string; sale_price: number; consignment_percent: number; owner_payout: number; store_earnings: number; payout_status: "pending" | "paid"; sold: true };
type ConsignorProduct = { id: string; name: string; price: number; consignment_percent: number | null; status: string; created_at: string; sold: false };
type Consignor = { id: string; name: string; phone: string | null; email: string | null; notes: string | null };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function ConsignorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [consignor, setConsignor] = useState<Consignor | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<ConsignorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => { params.then(({ id: value }) => setId(value)); }, [params]);
  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = async () => {
      const supabase = createSupabaseBrowserClient();
      const [consignorResult, salesResult, productsResult] = await Promise.all([supabase.from("consignors").select("id,name,phone,email,notes").eq("id", id).single(), supabase.from("sold_products").select("id,product_name,sold_at,sale_price,consignment_percent,owner_payout,store_earnings,payout_status").eq("consignor_id", id).order("sold_at", { ascending: false }), supabase.from("products").select("id,name,price,consignment_percent,status,created_at").eq("consignor_id", id).order("created_at", { ascending: false })]);
      if (!active) return;
      setConsignor(consignorResult.data as Consignor | null); setSales((salesResult.data ?? []).map((sale) => ({ ...sale, sold: true })) as Sale[]); setProducts((productsResult.data ?? []).map((product) => ({ ...product, price: Number(product.price), consignment_percent: product.consignment_percent === null ? null : Number(product.consignment_percent), sold: false })) as ConsignorProduct[]); setLoading(false);
    };
    load().catch(() => setLoading(false));
    return () => { active = false; };
  }, [id]);
  const markAsPaid = async (sale: Sale) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("sold_products").update({ payout_status: "paid", paid_at: new Date().toISOString() }).eq("id", sale.id);
    if (error) { setNotice(`Status pencairan gagal diperbarui: ${error.message}`); return; }
    setSales((current) => current.map((item) => item.id === sale.id ? { ...item, payout_status: "paid" } : item));
    setNotice("Status pencairan berhasil diperbarui.");
  };

  const productRows = useMemo(() => [...sales, ...products].sort((a, b) => new Date(a.sold ? a.sold_at : a.created_at).getTime() - new Date(b.sold ? b.sold_at : b.created_at).getTime()), [sales, products]);
  const summary = useMemo(() => sales.reduce((result, sale) => ({ sold: result.sold + sale.sale_price, payout: result.payout + sale.owner_payout, pending: result.pending + (sale.payout_status === "pending" ? sale.owner_payout : 0) }), { sold: 0, payout: 0, pending: 0 }), [sales]);
  if (loading) return <main className="admin-dashboard saas-dashboard"><p className="admin-empty">Memuat data penitip...</p></main>;
  if (!consignor) return <main className="admin-dashboard saas-dashboard"><p className="admin-empty">Data penitip tidak ditemukan.</p></main>;
  return <div className="admin-dashboard saas-dashboard saas-finance-page">{notice && <p className="saas-notice" role="status">{notice}</p>}<Link href="/admin/finance" className="saas-more-button"><ArrowLeft size={14} /> Kembali ke keuangan</Link><header className="saas-heading saas-consignor-heading"><div><p className="saas-eyebrow">Consignor profile</p><h1>{consignor.name} <span>✦</span></h1><p>{consignor.phone ?? ""}{consignor.phone && consignor.email ? " · " : ""}{consignor.email ?? "Kontak belum diisi"}</p></div></header><section className="saas-metric-grid"><article className="saas-metric-card saas-metric-dark"><div className="saas-metric-top"><span>Total nilai terjual</span><CircleDollarSign size={19} /></div><strong>{money(summary.sold)}</strong><small>{sales.length} produk</small></article><article className="saas-metric-card"><div className="saas-metric-top"><span>Total hak penitip</span><PackageCheck size={19} /></div><strong>{money(summary.payout)}</strong><small>{money(summary.pending)} belum dicairkan</small></article></section><section className="saas-panel saas-finance-table-panel"><div className="saas-panel-head"><div><span className="saas-label">Product history</span><h2>Produk penitip</h2></div></div><div className="saas-table-scroll"><table className="saas-data-table"><thead><tr><th>Produk</th><th>Harga jual</th><th>Bagi hasil</th><th>Hak penitip</th><th>Status terjual</th><th>Pencairan</th></tr></thead><tbody>{productRows.map((product) => product.sold ? <tr key={`sale-${product.id}`}><td><strong>{product.product_name}</strong><small>{new Date(product.sold_at).toLocaleDateString("id-ID")}</small></td><td>{money(product.sale_price)}</td><td>{product.consignment_percent}%</td><td>{money(product.owner_payout)}</td><td><span className="saas-status-pill segment-active">Terjual</span></td><td><span className={`saas-status-pill ${product.payout_status === "paid" ? "segment-active" : "segment-inactive"}`}>{product.payout_status === "paid" ? "Sudah dicairkan" : "Belum dicairkan"}</span>{product.payout_status === "pending" && <button type="button" className="saas-payout-button" onClick={() => void markAsPaid(product)}>Tandai sudah dicairkan</button>}</td></tr> : <tr key={`product-${product.id}`}><td><strong>{product.name}</strong><small>{new Date(product.created_at).toLocaleDateString("id-ID")}</small></td><td>{money(product.price)}</td><td>{product.consignment_percent ?? 0}%</td><td>-</td><td><span className="saas-status-pill segment-inactive">Belum terjual</span></td><td>-</td></tr>)}</tbody></table>{!productRows.length && <p className="admin-empty">Belum ada produk untuk penitip ini.</p>}</div></section></div>;
}
