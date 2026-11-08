"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDollarSign, Clock3, UsersRound, CalendarDays } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Sale = { id: string; product_name: string; sold_at: string; sale_price: number; consignment_percent: number; consignor_name: string | null; owner_payout: number; store_earnings: number; payout_status: "pending" | "paid" };
type Consignor = { id: string; name: string; phone: string | null; email: string | null };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));

export default function AdminFinancePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"this" | "previous2" | "previous3" | "custom">("this");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createSupabaseBrowserClient();
      const [salesResult, consignorsResult] = await Promise.all([
        supabase.from("sold_products").select("id,product_name,sold_at,sale_price,consignment_percent,consignor_name,owner_payout,store_earnings,payout_status").order("sold_at", { ascending: false }),
        supabase.from("consignors").select("id,name,phone,email").order("name"),
      ]);
      if (!active) return;
      if (salesResult.error || consignorsResult.error) setError("Data keuangan belum tersedia. Jalankan migration Supabase terlebih dahulu.");
      else { setSales((salesResult.data ?? []) as Sale[]); setConsignors((consignorsResult.data ?? []) as Consignor[]); }
      setLoading(false);
    };
    load().catch(() => { if (active) { setError("Gagal memuat data keuangan."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const markAsPaid = async (sale: Sale) => {
    if (sale.payout_status === "paid") return;
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.from("sold_products").update({ payout_status: "paid", paid_at: new Date().toISOString() }).eq("id", sale.id);
    if (updateError) { setError(`Status pencairan gagal diperbarui: ${updateError.message}`); return; }
    setSales((current) => current.map((item) => item.id === sale.id ? { ...item, payout_status: "paid" } : item));
  };

  const filteredSales = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    if (period === "previous2") { start.setMonth(start.getMonth() - 2); end.setMonth(end.getMonth() - 1); }
    if (period === "previous3") { start.setMonth(start.getMonth() - 3); end.setMonth(end.getMonth() - 2); }
    if (period === "custom") {
      const from = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
      const to = customTo ? new Date(`${customTo}T23:59:59.999`) : null;
      return sales.filter((sale) => { const soldAt = new Date(sale.sold_at); return (!from || soldAt >= from) && (!to || soldAt <= to); });
    }
    return sales.filter((sale) => { const soldAt = new Date(sale.sold_at); return soldAt >= start && soldAt < end; });
  }, [sales, period, customFrom, customTo]);
  const recap = useMemo(() => filteredSales.reduce((result, sale) => ({ total: result.total + sale.sale_price, earnings: result.earnings + sale.store_earnings, payout: result.payout + sale.owner_payout, pending: result.pending + (sale.payout_status === "pending" ? sale.owner_payout : 0) }), { total: 0, earnings: 0, payout: 0, pending: 0 }), [filteredSales]);

  return <div className="admin-dashboard saas-dashboard saas-finance-page">
    <header className="saas-heading"><div><p className="saas-eyebrow">Finance workspace</p><h1>Keuangan <span>✦</span></h1><p>Kelola penjualan, bagi hasil penitip, dan pencairan dalam satu tempat.</p></div><div className="saas-heading-actions"><div className="saas-period-picker"><button className="saas-date-button" onClick={() => setPeriodOpen((open) => !open)} aria-expanded={periodOpen} aria-haspopup="listbox"><CalendarDays size={15} />{period === "this" ? "Bulan ini" : period === "previous2" ? "2 bulan lalu" : period === "previous3" ? "3 bulan lalu" : "Custom rentang"}</button>{periodOpen && <div className="saas-period-menu" role="listbox" aria-label="Filter periode produk terjual"><button className={period === "this" ? "is-selected" : ""} onClick={() => { setPeriod("this"); setPeriodOpen(false); }} role="option" aria-selected={period === "this"}>Bulan ini</button><button className={period === "previous2" ? "is-selected" : ""} onClick={() => { setPeriod("previous2"); setPeriodOpen(false); }} role="option" aria-selected={period === "previous2"}>2 bulan lalu</button><button className={period === "previous3" ? "is-selected" : ""} onClick={() => { setPeriod("previous3"); setPeriodOpen(false); }} role="option" aria-selected={period === "previous3"}>3 bulan lalu</button><button className={period === "custom" ? "is-selected" : ""} onClick={() => { setPeriod("custom"); setPeriodOpen(false); }} role="option" aria-selected={period === "custom"}>Custom rentang</button>{period === "custom" && <div className="saas-custom-period-fields"><label>Dari<input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} aria-label="Tanggal mulai" /></label><label>Sampai<input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} aria-label="Tanggal akhir" /></label></div>}</div>}</div></div></header>
    {error && <p className="admin-login-error" role="alert">{error}</p>}
    <section className="saas-metric-grid saas-finance-metrics"><article className="saas-metric-card saas-metric-dark"><div className="saas-metric-top"><span>Total penjualan</span><CircleDollarSign size={19} /></div><strong>{money(recap.total)}</strong><small>{filteredSales.length} produk terjual</small></article><article className="saas-metric-card"><div className="saas-metric-top"><span>Hasil kamu</span><CheckCircle2 size={19} /></div><strong>{money(recap.earnings)}</strong><small>Margin toko</small></article><article className="saas-metric-card"><div className="saas-metric-top"><span>Diterima penitip</span><UsersRound size={19} /></div><strong>{money(recap.payout)}</strong><small>{money(recap.pending)} belum dicairkan</small></article><article className="saas-metric-card"><div className="saas-metric-top"><span>Status pencairan</span><Clock3 size={19} /></div><strong>{filteredSales.filter((sale) => sale.payout_status === "paid").length}/{filteredSales.length}</strong><small>produk sudah dicairkan</small></article></section>
    <section className="saas-panel saas-finance-table-panel"><div className="saas-panel-head"><div><span className="saas-label">Sold products</span><h2>Produk terjual</h2></div><span className="saas-product-count">{filteredSales.length} records</span></div>{loading ? <p className="admin-empty">Memuat data keuangan...</p> : <div className="saas-table-scroll"><table className="saas-data-table"><thead><tr><th>Produk / tanggal</th><th>Harga</th><th>Bagi hasil</th><th>Penitip</th><th>Hasil kamu</th><th>Penitip menerima</th><th>Status</th></tr></thead><tbody>{filteredSales.map((sale) => <tr key={sale.id}><td><strong>{sale.product_name}</strong><small>{date(sale.sold_at)}</small></td><td>{money(sale.sale_price)}</td><td>{sale.consignment_percent}%</td><td>{sale.consignor_name ?? "Milik toko"}</td><td>{money(sale.store_earnings)}</td><td>{money(sale.owner_payout)}</td><td><span className={`saas-status-pill ${sale.payout_status === "paid" ? "segment-active" : "segment-inactive"}`}>{sale.payout_status === "paid" ? "Sudah dicairkan" : "Belum dicairkan"}</span>{sale.payout_status === "pending" && <button type="button" className="saas-payout-button" onClick={() => void markAsPaid(sale)}>Tandai sudah dicairkan</button>}</td></tr>)}</tbody></table>{!filteredSales.length && <p className="admin-empty">Belum ada data produk terjual pada bulan ini.</p>}</div>}</section>
    <section className="saas-panel saas-finance-consignors"><div className="saas-panel-head"><div><span className="saas-label">Consignor database</span><h2>Data penitip</h2></div><UsersRound size={20} /></div>{consignors.length ? <div className="saas-finance-consignor-grid">{consignors.map((consignor) => <Link className="saas-finance-consignor-card" href={`/admin/finance/consignors/${consignor.id}`} key={consignor.id}><span className="saas-customer-avatar">{consignor.name.charAt(0)}</span><span><strong>{consignor.name}</strong><small>{consignor.phone ?? consignor.email ?? "Kontak belum diisi"}</small><small>{filteredSales.filter((sale) => sale.consignor_name === consignor.name).length} produk tercatat</small></span><ArrowUpRight size={15} /></Link>)}</div> : <p className="admin-empty">Belum ada data penitip.</p>}</section>
  </div>;
}
