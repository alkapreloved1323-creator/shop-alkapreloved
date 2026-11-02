"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  CircleDollarSign,
  Package,
  Search,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";

const orders = [
  { id: "ALK-20261101-2841", customer: "Nadia Putri", item: "Linen Oversized Shirt", total: "Rp 185.000", status: "Paid", date: "1 Nov 2026" },
  { id: "ALK-20261031-1830", customer: "Raka Adi", item: "Everyday Leather Tote", total: "Rp 320.000", status: "Processing", date: "31 Okt 2026" },
  { id: "ALK-20261030-9072", customer: "Maya Sari", item: "Soft Tailored Trousers", total: "Rp 240.000", status: "Shipped", date: "30 Okt 2026" },
  { id: "ALK-20261029-4418", customer: "Dimas Kurnia", item: "Cotton Day Dress", total: "Rp 275.000", status: "Pending", date: "29 Okt 2026" },
  { id: "ALK-20261028-7751", customer: "Siti Aisyah", item: "Classic Canvas Sneakers", total: "Rp 195.000", status: "Delivered", date: "28 Okt 2026" },
];

const inventory = [
  { name: "Linen Oversized Shirt", slug: "linen-oversized-shirt", category: "Tops", stock: 2, price: "Rp 185.000" },
  { name: "Everyday Leather Tote", slug: "everyday-leather-tote", category: "Accessories", stock: 1, price: "Rp 320.000" },
  { name: "Soft Tailored Trousers", slug: "soft-tailored-trousers", category: "Bottoms", stock: 1, price: "Rp 240.000" },
  { name: "Cotton Day Dress", slug: "cotton-day-dress", category: "Dresses", stock: 3, price: "Rp 275.000" },
];

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (filter === "All" || order.status === filter) &&
          `${order.id} ${order.customer} ${order.item}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query],
  );

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="admin-dashboard">
      <header className="admin-page-heading">
        <div>
          <p className="admin-kicker">{dateStr}</p>
          <h1>Dashboard</h1>
          <p>Ringkasan toko AlkaPreloved hari ini.</p>
        </div>
      </header>

      {/* Stats */}
      <section className="admin-stat-grid">
        <article className="admin-stat-card admin-stat-highlight">
          <div className="admin-stat-icon">
            <CircleDollarSign size={18} />
          </div>
          <span>Pendapatan bulan ini</span>
          <strong>Rp 4.820.000</strong>
          <small>
            <b>+18.4%</b> dari bulan lalu
          </small>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <ShoppingBag size={18} />
          </div>
          <span>Total pesanan</span>
          <strong>24</strong>
          <small>
            <b>+6</b> bulan ini
          </small>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Package size={18} />
          </div>
          <span>Produk aktif</span>
          <strong>38</strong>
          <small>4 stok menipis</small>
        </article>
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={18} />
          </div>
          <span>Pelanggan</span>
          <strong>19</strong>
          <small>
            <b>+12%</b> pelanggan kembali
          </small>
        </article>
      </section>

      {/* Content grid */}
      <div className="admin-content-grid">
        {/* Recent orders */}
        <section className="admin-panel admin-orders-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Aktivitas</p>
              <h2>Pesanan terbaru</h2>
            </div>
            <Link href="/admin/orders" className="admin-link-button">
              Lihat semua <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="admin-table-tools">
            <div className="admin-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari pesanan..."
                aria-label="Cari pesanan"
              />
            </div>
            <label className="admin-filter">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter pesanan"
              >
                <option value="All">Semua</option>
                <option value="Paid">Dibayar</option>
                <option value="Processing">Diproses</option>
                <option value="Shipped">Dikirim</option>
                <option value="Delivered">Diterima</option>
                <option value="Pending">Menunggu</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </div>
          <div className="admin-order-list">
            {filteredOrders.map((order) => (
              <div className="admin-order-row" key={order.id}>
                <div className="admin-order-main">
                  <strong>{order.id}</strong>
                  <span>
                    {order.customer} · {order.item}
                  </span>
                </div>
                <span
                  className={`admin-status status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
                <strong className="admin-order-total">{order.total}</strong>
                <time>{order.date}</time>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory sidebar */}
        <aside className="admin-panel admin-inventory-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Stok</p>
              <h2>Inventaris</h2>
            </div>
            <Link href="/admin/products" className="admin-icon-action" aria-label="Tambah produk">+</Link>
          </div>
          <div className="admin-inventory-list">
            {inventory.map((item) => (
              <div className="admin-inventory-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.category} · {item.price}
                  </span>
                </div>
                <b className={item.stock < 2 ? "stock-low" : ""}>
                  {item.stock} tersisa
                </b>
              </div>
            ))}
          </div>
          <Link href="/admin/products" className="admin-secondary-button">
            Kelola inventaris <ArrowUpRight size={14} />
          </Link>
        </aside>
      </div>

      {/* Quick actions */}
      <section className="admin-quick-actions">
        <div>
          <p className="admin-kicker">Aksi cepat</p>
          <h2>Atur tokomu.</h2>
        </div>
        <Link href="/admin/products">
          Tambah produk baru <ArrowUpRight size={15} />
        </Link>
        <Link href="/admin/orders">
          Cek pesanan pending <ArrowUpRight size={15} />
        </Link>
        <Link href="/admin/promos">
          Kelola promo <TrendingUp size={15} />
        </Link>
      </section>
    </div>
  );
}
