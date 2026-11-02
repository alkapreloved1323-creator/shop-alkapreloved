"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, CircleDollarSign, Package, Search, ShoppingBag, Users } from "lucide-react";

const orders = [
  { id: "ALK-20260925-2841", customer: "Nadia Putri", item: "Linen Oversized Shirt", total: "Rp 185.000", status: "Paid", date: "25 Sep 2026" },
  { id: "ALK-20260924-1830", customer: "Raka Adi", item: "Everyday Leather Tote", total: "Rp 320.000", status: "Processing", date: "24 Sep 2026" },
  { id: "ALK-20260923-9072", customer: "Maya Sari", item: "Soft Tailored Trousers", total: "Rp 240.000", status: "Shipped", date: "23 Sep 2026" },
  { id: "ALK-20260922-4418", customer: "Dimas Kurnia", item: "Cotton Day Dress", total: "Rp 275.000", status: "Pending", date: "22 Sep 2026" },
];

const inventory = [
  { name: "Linen Oversized Shirt", category: "Tops", stock: 2, price: "Rp 185.000" },
  { name: "Everyday Leather Tote", category: "Accessories", stock: 1, price: "Rp 320.000" },
  { name: "Soft Tailored Trousers", category: "Bottoms", stock: 1, price: "Rp 240.000" },
];

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filteredOrders = useMemo(() => orders.filter((order) => (filter === "All" || order.status === filter) && `${order.id} ${order.customer} ${order.item}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return <div className="admin-dashboard"><header className="admin-page-heading"><div><p className="admin-kicker">Friday, 25 September 2026</p><h1>Good morning, Alka.</h1><p>Here is what is happening with your store today.</p></div><span className="admin-demo-label">Demo overview</span></header><section className="admin-stat-grid"><article className="admin-stat-card admin-stat-highlight"><div className="admin-stat-icon"><CircleDollarSign size={18} /></div><span>Revenue this month</span><strong>Rp 4.820.000</strong><small><b>+18.4%</b> from last month</small></article><article className="admin-stat-card"><div className="admin-stat-icon"><ShoppingBag size={18} /></div><span>Total orders</span><strong>24</strong><small><b>+6</b> this month</small></article><article className="admin-stat-card"><div className="admin-stat-icon"><Package size={18} /></div><span>Active pieces</span><strong>38</strong><small>4 low in stock</small></article><article className="admin-stat-card"><div className="admin-stat-icon"><Users size={18} /></div><span>Customers</span><strong>19</strong><small><b>+12%</b> returning</small></article></section><div className="admin-content-grid"><section className="admin-panel admin-orders-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Activity</p><h2>Recent orders</h2></div><button className="admin-link-button">View all <ArrowUpRight size={14} /></button></div><div className="admin-table-tools"><div className="admin-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders" aria-label="Search orders" /></div><label className="admin-filter"><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter orders"><option>All</option><option>Paid</option><option>Processing</option><option>Shipped</option><option>Pending</option></select><ChevronDown size={13} /></label></div><div className="admin-order-list">{filteredOrders.map((order) => <div className="admin-order-row" key={order.id}><div className="admin-order-main"><strong>{order.id}</strong><span>{order.customer} · {order.item}</span></div><span className={`admin-status status-${order.status.toLowerCase()}`}>{order.status}</span><strong className="admin-order-total">{order.total}</strong><time>{order.date}</time></div>)}</div></section><aside className="admin-panel admin-inventory-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Stock watch</p><h2>Inventory</h2></div><button className="admin-icon-action" aria-label="Add product">+</button></div><div className="admin-inventory-list">{inventory.map((item) => <div className="admin-inventory-row" key={item.name}><div><strong>{item.name}</strong><span>{item.category} · {item.price}</span></div><b className={item.stock < 2 ? "stock-low" : ""}>{item.stock} left</b></div>)}</div><button className="admin-secondary-button">Manage inventory <ArrowUpRight size={14} /></button></aside></div><section className="admin-quick-actions"><div><p className="admin-kicker">Quick actions</p><h2>Keep things moving.</h2></div><button>Add new piece <ArrowUpRight size={15} /></button><button>Review pending orders <ArrowUpRight size={15} /></button><button>View storefront <ArrowUpRight size={15} /></button></section></div>;
}
