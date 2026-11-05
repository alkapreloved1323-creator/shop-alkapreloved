"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";

const orders = [
  { id: "ALK-20261101-2841", customer: "Nadia Putri", item: "Linen Oversized Shirt", total: "Rp 185.000", status: "Paid", date: "1 Nov 2026" },
  { id: "ALK-20261031-1830", customer: "Raka Adi", item: "Everyday Leather Tote", total: "Rp 320.000", status: "Processing", date: "31 Okt 2026" },
  { id: "ALK-20261030-9072", customer: "Maya Sari", item: "Soft Tailored Trousers", total: "Rp 240.000", status: "Shipped", date: "30 Okt 2026" },
  { id: "ALK-20261029-4418", customer: "Dimas Kurnia", item: "Cotton Day Dress", total: "Rp 275.000", status: "Pending", date: "29 Okt 2026" },
];

const inventory = [
  { name: "Linen Oversized Shirt", category: "Tops", stock: 2, price: "Rp 185.000" },
  { name: "Everyday Leather Tote", category: "Accessories", stock: 1, price: "Rp 320.000" },
  { name: "Soft Tailored Trousers", category: "Bottoms", stock: 1, price: "Rp 240.000" },
];

const monthData = {
  thisMonth: { label: "This month", revenue: "Rp 4.820.000", orders: 24, products: 38, customers: 19, chart: [42, 55, 48, 68, 61, 78, 72, 88, 73, 91, 82, 96], sales: "Rp 12.6 jt", growth: "+24.8%" },
  lastMonth: { label: "Last month", revenue: "Rp 4.065.000", orders: 18, products: 34, customers: 17, chart: [35, 44, 52, 45, 58, 63, 57, 69, 66, 74, 70, 78], sales: "Rp 10.1 jt", growth: "+16.2%" },
  twoMonthsAgo: { label: "2 months ago", revenue: "Rp 3.610.000", orders: 16, products: 31, customers: 14, chart: [28, 38, 35, 49, 43, 51, 47, 60, 55, 64, 58, 68], sales: "Rp 8.9 jt", growth: "+11.4%" },
} as const;
const cityData = {
  last30: { label: "Last 30 days", range: "07 Oct–05 Nov 2026", total: 227, cities: [
    { city: "Jakarta Selatan", customers: 86, share: 38, tone: "indigo" },
    { city: "Bandung", customers: 54, share: 24, tone: "orange" },
    { city: "Surabaya", customers: 37, share: 16, tone: "teal" },
    { city: "Tangerang", customers: 28, share: 12, tone: "violet" },
    { city: "Kota lainnya", customers: 22, share: 10, tone: "gray" },
  ] },
  last90: { label: "Last 90 days", range: "08 Aug–05 Nov 2026", total: 418, cities: [
    { city: "Jakarta Selatan", customers: 148, share: 35, tone: "indigo" },
    { city: "Bandung", customers: 104, share: 25, tone: "orange" },
    { city: "Surabaya", customers: 72, share: 17, tone: "teal" },
    { city: "Tangerang", customers: 50, share: 12, tone: "violet" },
    { city: "Kota lainnya", customers: 44, share: 11, tone: "gray" },
  ] },
  thisYear: { label: "This year", range: "01 Jan–05 Nov 2026", total: 672, cities: [
    { city: "Jakarta Selatan", customers: 236, share: 35, tone: "indigo" },
    { city: "Bandung", customers: 167, share: 25, tone: "orange" },
    { city: "Surabaya", customers: 118, share: 18, tone: "teal" },
    { city: "Tangerang", customers: 79, share: 12, tone: "violet" },
    { city: "Kota lainnya", customers: 72, share: 10, tone: "gray" },
  ] },
} as const;

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<keyof typeof monthData>("thisMonth");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [orderFilterOpen, setOrderFilterOpen] = useState(false);
  const [cityPeriod, setCityPeriod] = useState<keyof typeof cityData>("last30");
  const [cityPeriodOpen, setCityPeriodOpen] = useState(false);
  const selectedMonth = monthData[period];
  const selectedCityPeriod = cityData[cityPeriod];
  const cityPeriodOptions: Array<{ key: keyof typeof cityData; label: string }> = [
    { key: "last30", label: "Last 30 days" },
    { key: "last90", label: "Last 90 days" },
    { key: "thisYear", label: "This year" },
  ];
  const orderFilterOptions = [
    { value: "All", label: "All orders" },
    { value: "Paid", label: "Paid" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Pending", label: "Pending" },
  ];
  const selectedOrderFilter = orderFilterOptions.find((option) => option.value === filter)?.label ?? "All orders";
  const periodOptions: Array<{ key: keyof typeof monthData; label: string }> = [
    { key: "thisMonth", label: "This month" },
    { key: "lastMonth", label: "Last month" },
    { key: "twoMonthsAgo", label: "2 months ago" },
  ];
  const filteredOrders = useMemo(() => orders.filter((order) => (filter === "All" || order.status === filter) && `${order.id} ${order.customer} ${order.item}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);

  return (
    <div className="admin-dashboard saas-dashboard">
      <header className="saas-heading">
        <div><p className="saas-eyebrow">Thursday, November 05, 2026</p><h1>Good morning, Alka <span>✦</span></h1><p>Here&apos;s what&apos;s happening with your store today.</p></div>
        <div className="saas-heading-actions"><button className="saas-icon-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="saas-period-picker"><button className="saas-date-button" onClick={() => setPeriodOpen((open) => !open)} aria-expanded={periodOpen} aria-haspopup="listbox">{selectedMonth.label} <ChevronDown size={15} /></button>{periodOpen && <div className="saas-period-menu" role="listbox" aria-label="Filter month">{periodOptions.map((option) => <button key={option.key} className={option.key === period ? "is-selected" : ""} onClick={() => { setPeriod(option.key); setPeriodOpen(false); }} role="option" aria-selected={option.key === period}>{option.label}<span>{option.key === "thisMonth" ? "01–30 Nov 2026" : option.key === "lastMonth" ? "01–31 Oct 2026" : "01–30 Sep 2026"}</span></button>)}</div>}</div><Link href="/admin/products" className="saas-primary-button">+ Add product</Link></div>
      </header>

      <section className="saas-metric-grid">
        <article className="saas-metric-card saas-metric-dark"><div className="saas-metric-top"><span>Total revenue</span><CircleDollarSign size={19} /></div><strong>{selectedMonth.revenue}</strong><small><b><ArrowUpRight size={12} />18.4%</b> vs last month</small></article>
        <article className="saas-metric-card"><div className="saas-metric-top"><span>Total orders</span><ShoppingBag size={19} /></div><strong>{selectedMonth.orders}</strong><small><b><ArrowUpRight size={12} />6</b> new this month</small></article>
        <article className="saas-metric-card"><div className="saas-metric-top"><span>Active products</span><Package size={19} /></div><strong>{selectedMonth.products}</strong><small><b className="saas-warning"><ArrowDownRight size={12} />4</b> low in stock</small></article>
        <article className="saas-metric-card"><div className="saas-metric-top"><span>Returning customers</span><Users size={19} /></div><strong>{selectedMonth.customers}</strong><small><b><ArrowUpRight size={12} />12%</b> engagement</small></article>
      </section>

      <div className="saas-main-grid">
        <section className="saas-panel saas-revenue-panel"><div className="saas-panel-head"><div><span className="saas-label">Revenue overview</span><h2>Sales performance</h2></div><button className="saas-more-button">Export report <ArrowUpRight size={14} /></button></div><div className="saas-chart-summary"><strong>{selectedMonth.sales}</strong><span><b>{selectedMonth.growth}</b> from last period</span></div><div className="saas-chart" aria-label="Sales performance chart">{selectedMonth.chart.map((height, index) => <div className="saas-chart-column" key={index}><i style={{ height: `${height}%` }} /><span>{["Dec 1", "Dec 5", "Dec 9", "Dec 13", "Dec 17", "Dec 21", "Dec 25", "Dec 29", "Jan 2", "Jan 6", "Jan 10", "Jan 14"][index]}</span></div>)}</div></section>
        <section className="saas-panel saas-channel-panel"><div className="saas-panel-head"><div><span className="saas-label">Acquisition</span><h2>Sales channels</h2></div><button className="saas-kebab" aria-label="More sales channel options">•••</button></div><div className="saas-donut-wrap"><div className="saas-donut"><strong>24</strong><span>orders</span></div><div className="saas-legend"><p><i className="legend-indigo" />Instagram <b>42%</b></p><p><i className="legend-orange" />Website <b>35%</b></p><p><i className="legend-gray" />Referrals <b>23%</b></p></div></div></section>
      </div>

      <div className="saas-lower-grid"><section className="saas-panel saas-orders-panel"><div className="saas-panel-head"><div><span className="saas-label">Live activity</span><h2>Recent orders</h2></div><Link href="/admin/orders" className="saas-more-button">View all <ArrowUpRight size={14} /></Link></div><div className="saas-table-tools"><div className="saas-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." aria-label="Search orders" /></div><div className="saas-order-filter"><button className="saas-filter-button" onClick={() => setOrderFilterOpen((open) => !open)} aria-expanded={orderFilterOpen} aria-haspopup="listbox">{selectedOrderFilter}<ChevronDown size={14} /></button>{orderFilterOpen && <div className="saas-period-menu saas-order-filter-menu" role="listbox" aria-label="Filter orders">{orderFilterOptions.map((option) => <button key={option.value} className={option.value === filter ? "is-selected" : ""} onClick={() => { setFilter(option.value); setOrderFilterOpen(false); }} role="option" aria-selected={option.value === filter}>{option.label}</button>)}</div>}</div></div><div className="saas-order-table"><div className="saas-table-head"><span>Order</span><span>Customer</span><span>Amount</span><span>Status</span></div>{filteredOrders.map((order) => <div className="saas-table-row" key={order.id}><strong>{order.id}<small>{order.date}</small></strong><span>{order.customer}<small>{order.item}</small></span><b>{order.total}</b><em className={`saas-status status-${order.status.toLowerCase()}`}>{order.status}</em></div>)}</div></section><aside className="saas-panel saas-inventory-panel"><div className="saas-panel-head"><div><span className="saas-label">Inventory</span><h2>Low stock</h2></div><Link href="/admin/products" className="saas-kebab" aria-label="Manage inventory">•••</Link></div>{inventory.map((item) => <div className="saas-stock-row" key={item.name}><div><strong>{item.name}</strong><span>{item.category} · {item.price}</span></div><b>{item.stock} left</b><div className="saas-stock-bar"><i style={{ width: `${item.stock * 28}%` }} /></div></div>)}<Link href="/admin/products" className="saas-outline-button">Manage inventory <ArrowUpRight size={14} /></Link></aside></div>
      <section className="saas-city-panel saas-panel"><div className="saas-panel-head"><div><span className="saas-label">Customer geography</span><h2>Asal kota customer</h2></div><div className="saas-period-picker"><button className="saas-date-button saas-city-period" onClick={() => setCityPeriodOpen((open) => !open)} aria-expanded={cityPeriodOpen} aria-haspopup="listbox">{selectedCityPeriod.label} <ChevronDown size={14} /></button>{cityPeriodOpen && <div className="saas-period-menu saas-city-period-menu" role="listbox" aria-label="Filter customer geography">{cityPeriodOptions.map((option) => <button key={option.key} className={option.key === cityPeriod ? "is-selected" : ""} onClick={() => { setCityPeriod(option.key); setCityPeriodOpen(false); }} role="option" aria-selected={option.key === cityPeriod}>{option.label}<span>{cityData[option.key].range}</span></button>)}</div>}</div></div><div className="saas-city-content"><div className="saas-city-map"><MapPin size={28} /><strong>{selectedCityPeriod.total}</strong><span>total customers</span><small>Data berdasarkan alamat pengiriman</small></div><div className="saas-city-list">{selectedCityPeriod.cities.map((item) => <div className="saas-city-row" key={item.city}><div className="saas-city-name"><i className={`city-dot city-${item.tone}`} /><strong>{item.city}</strong><span>{item.customers} customer</span></div><div className="saas-city-track"><i style={{ width: `${item.share}%` }} /></div><b>{item.share}%</b></div>)}</div></div></section>
      <section className="saas-insight"><div className="saas-insight-icon"><Sparkles size={18} /></div><div><span className="saas-label">Smart insight</span><strong>Your best sales day is Friday</strong><p>Orders are 32% higher than your weekly average. Consider scheduling your next promotion on Thursday evening.</p></div><BarChart3 size={28} /></section>
    </div>
  );
}
