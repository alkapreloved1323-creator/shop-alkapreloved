"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Clock3, UsersRound, CalendarDays } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Sale = { id: string; product_name: string; sold_at: string; sale_price: number; owner_payout: number; store_earnings: number; payout_status: "pending" | "paid" };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function FinanceRecapPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState<"this" | "previous2" | "previous3" | "custom">("this");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  useEffect(() => { const supabase = createSupabaseBrowserClient(); supabase.from("sold_products").select("id,product_name,sold_at,sale_price,owner_payout,store_earnings,payout_status").order("sold_at", { ascending: false }).then(({ data }) => setSales((data ?? []) as Sale[])); }, []);
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
  const recap = useMemo(() => filteredSales.reduce((result, sale) => ({ sales: result.sales + sale.sale_price, store: result.store + sale.store_earnings, consignor: result.consignor + sale.owner_payout, pending: result.pending + (sale.payout_status === "pending" ? sale.owner_payout : 0) }), { sales: 0, store: 0, consignor: 0, pending: 0 }), [filteredSales]);
  return <div className="admin-dashboard saas-dashboard saas-finance-page"><header className="saas-heading"><div><p className="saas-eyebrow">Financial recap</p><h1>Rekap keuangan <span>✦</span></h1><p>Ringkasan performa penjualan dan kewajiban pencairan penitip.</p></div><div className="saas-heading-actions"><div className="saas-period-picker"><button className="saas-date-button" onClick={() => setPeriodOpen((open) => !open)} aria-expanded={periodOpen} aria-haspopup="listbox"><CalendarDays size={15} />{period === "this" ? "Bulan ini" : period === "previous2" ? "2 bulan lalu" : period === "previous3" ? "3 bulan lalu" : "Custom rentang"}</button>{periodOpen && <div className="saas-period-menu" role="listbox" aria-label="Filter periode rekap keuangan"><button className={period === "this" ? "is-selected" : ""} onClick={() => { setPeriod("this"); setPeriodOpen(false); }} role="option" aria-selected={period === "this"}>Bulan ini</button><button className={period === "previous2" ? "is-selected" : ""} onClick={() => { setPeriod("previous2"); setPeriodOpen(false); }} role="option" aria-selected={period === "previous2"}>2 bulan lalu</button><button className={period === "previous3" ? "is-selected" : ""} onClick={() => { setPeriod("previous3"); setPeriodOpen(false); }} role="option" aria-selected={period === "previous3"}>3 bulan lalu</button><button className={period === "custom" ? "is-selected" : ""} onClick={() => { setPeriod("custom"); setPeriodOpen(false); }} role="option" aria-selected={period === "custom"}>Custom rentang</button>{period === "custom" && <div className="saas-custom-period-fields"><label>Dari<input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} aria-label="Tanggal mulai" /></label><label>Sampai<input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} aria-label="Tanggal akhir" /></label></div>}</div>}</div></div></header><section className="saas-metric-grid"><article className="saas-metric-card saas-metric-dark"><div className="saas-metric-top"><span>Total penjualan</span><CircleDollarSign size={19} /></div><strong>{money(recap.sales)}</strong><small>{filteredSales.length} transaksi</small></article><article className="saas-metric-card"><div className="saas-metric-top"><span>Hasil toko</span><UsersRound size={19} /></div><strong>{money(recap.store)}</strong><small>Pendapatan bersih toko</small></article><article className="saas-metric-card"><div className="saas-metric-top"><span>Hak penitip</span><Clock3 size={19} /></div><strong>{money(recap.consignor)}</strong><small>{money(recap.pending)} belum dicairkan</small></article></section><section className="saas-panel saas-finance-table-panel"><div className="saas-panel-head"><div><span className="saas-label">Transaction recap</span><h2>Rincian transaksi</h2></div></div><div className="saas-table-scroll"><table className="saas-data-table"><thead><tr><th>Produk</th><th>Tanggal</th><th>Harga jual</th><th>Hasil toko</th><th>Hak penitip</th><th>Status</th></tr></thead><tbody>{filteredSales.map((sale) => <tr key={sale.id}><td>{sale.product_name}</td><td>{new Date(sale.sold_at).toLocaleDateString("id-ID")}</td><td>{money(sale.sale_price)}</td><td>{money(sale.store_earnings)}</td><td>{money(sale.owner_payout)}</td><td>{sale.payout_status === "paid" ? "Sudah dicairkan" : "Belum dicairkan"}</td></tr>)}</tbody></table>{!filteredSales.length && <p className="admin-empty">Belum ada transaksi pada bulan ini.</p>}</div></section></div>;
}
