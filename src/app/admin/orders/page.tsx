"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowUpRight, Bell, CheckCircle2, Clock3, Search, Save, ShoppingBag, Truck } from "lucide-react";

type ProcessStep = { label: string; detail: string; completed: boolean; date?: string };
type Order = { id: string; customer: string; email: string; phone: string; item: string; total: number; payment: string; status: string; courier: string; tracking: string; date: string; history: ProcessStep[] };
const defaultHistory = (status: string): ProcessStep[] => [
  { label: "Order dibuat", detail: "Pesanan diterima sistem", completed: true },
  { label: "Packing", detail: "Menunggu tim menyiapkan pesanan", completed: ["packed", "shipped", "delivered", "completed"].includes(status) },
  { label: "Diserahkan ke kurir", detail: "Menunggu nomor resi", completed: ["shipped", "delivered", "completed"].includes(status) },
  { label: "Dalam perjalanan", detail: "Paket sedang dikirim", completed: ["shipped", "delivered", "completed"].includes(status) },
  { label: "Telah sampai", detail: "Pesanan diterima customer", completed: ["delivered", "completed"].includes(status) },
];
const initialOrders: Order[] = [];
const statuses = ["pending_payment", "payment_confirmed", "processing", "packed", "shipped", "delivered", "completed", "cancelled"];
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  useEffect(() => {
    const loadOrders = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.from("orders").select("id,order_number,customer_name,email,phone,subtotal,shipping_cost,total,payment_status,order_status,shipping_provider,tracking_number,created_at,order_items(product_id,product_name,quantity)").order("created_at", { ascending: false });
      if (error) { setNotice(`Pesanan gagal dimuat: ${error.message}`); return; }
      setOrders((data ?? []).map((order) => ({ id: order.order_number, customer: order.customer_name, email: order.email, phone: order.phone, item: Array.isArray(order.order_items) ? order.order_items.map((item) => item.product_name).join(", ") : "-", total: Number(order.total), payment: order.payment_status, status: order.order_status, courier: order.shipping_provider ?? "-", tracking: order.tracking_number ?? "", date: new Date(order.created_at).toLocaleDateString("id-ID"), history: defaultHistory(order.order_status) })));
    };
    loadOrders().catch(() => setNotice("Pesanan gagal dimuat dari Supabase."));
  }, []);
  const visible = useMemo(() => orders.filter((o) => (filter === "all" || o.status === filter) && `${o.id} ${o.customer} ${o.email} ${o.phone}`.toLowerCase().includes(query.toLowerCase())), [orders, query, filter]);
  const update = (id: string, changes: Partial<Order>) => setOrders((list) => list.map((o) => o.id === id ? { ...o, ...changes } : o));
  const saveOrder = async (order: Order): Promise<boolean> => {
    const supabase = createSupabaseBrowserClient();
    const previous = orders.find((item) => item.id === order.id);
    const currentResult = await supabase.from("orders").select("id,order_status,order_items(product_id,quantity)").eq("order_number", order.id).single();
    if (currentResult.error || !currentResult.data) { setNotice(`Pesanan gagal diverifikasi: ${currentResult.error?.message ?? "order tidak ditemukan"}`); return false; }
    const wasConfirmed = currentResult.data.order_status === "payment_confirmed";
    const { error } = await supabase.from("orders").update({ order_status: order.status, payment_status: order.payment, shipping_provider: order.courier, tracking_number: order.tracking }).eq("order_number", order.id);
    if (error) { setNotice(`Pesanan gagal disimpan: ${error.message}`); return false; }
    if (order.status === "payment_confirmed" && !wasConfirmed) {
      for (const item of currentResult.data.order_items ?? []) {
        const product = await supabase.from("products").select("stock").eq("id", item.product_id).single();
        if (product.error || !product.data) { setNotice(`Stok gagal diperbarui: ${product.error?.message ?? "produk tidak ditemukan"}`); return false; }
        const nextStock = Math.max(0, Number(product.data.stock) - Number(item.quantity));
        const stockUpdate = await supabase.from("products").update({ stock: nextStock }).eq("id", item.product_id);
        if (stockUpdate.error) { setNotice(`Stok gagal diperbarui: ${stockUpdate.error.message}`); return false; }
      }
    }
    setNotice("Perubahan pesanan tersimpan ke Supabase.");
    window.setTimeout(() => setNotice(""), 3000);
    return true;
  };
  const updateHistory = (id: string, index: number, completed: boolean) => setOrders((list) => list.map((o) => o.id === id ? { ...o, history: o.history.map((step, stepIndex) => stepIndex === index ? { ...step, completed, date: completed ? new Date().toLocaleString("id-ID") : undefined } : step) } : o));
  const save = (order: Order) => { void saveOrder(order); };
  const paidCount = orders.filter((order) => order.payment === "paid").length;
  const pendingCount = orders.filter((order) => order.status === "pending_payment").length;
  const shippedCount = orders.filter((order) => order.status === "shipped").length;
  const ordersToProcess = orders.filter((order) => ["payment_confirmed", "processing", "packed"].includes(order.status));
  const selectedHistory = selectedOrder?.history ?? (selectedOrder ? defaultHistory(selectedOrder.status) : []);

  return <div className="admin-dashboard saas-dashboard saas-orders-page"><header className="saas-heading"><div><p className="saas-eyebrow">Order management</p><h1>Pesanan <span>✦</span></h1><p>Monitor order flow, pembayaran, dan pengiriman dalam satu workspace.</p></div><div className="saas-heading-actions"><button className="saas-icon-button" aria-label="Order notifications"><Bell size={18} /><i /></button><button className="saas-date-button">This month <Clock3 size={15} /></button></div></header>
    {notice && <p className="saas-notice" role="status">{notice}</p>}
    <section className="saas-order-metrics"><article className="saas-order-metric saas-order-metric-dark"><div><span>Total orders</span><CheckCircle2 size={18} /></div><strong>{orders.length}</strong><small><b>{paidCount} paid</b> this period</small></article><article className="saas-order-metric"><div><span>Orders to process</span><ShoppingBag size={18} /></div><strong>{ordersToProcess.length}</strong><small><b>Needs action</b> from your team</small></article><article className="saas-order-metric"><div><span>Awaiting payment</span><Clock3 size={18} /></div><strong>{pendingCount}</strong><small><b className="saas-warning">Needs attention</b> today</small></article><article className="saas-order-metric"><div><span>In delivery</span><Truck size={18} /></div><strong>{shippedCount}</strong><small><b>On track</b> shipments</small></article></section>
    <section className="saas-panel saas-orders-workspace"><div className="saas-panel-head"><div><span className="saas-label">Live activity</span><h2>All orders</h2></div><span className="saas-product-count">{visible.length} results</span></div><div className="saas-product-tools"><div className="saas-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, customer, email..." aria-label="Cari pesanan" /></div><select className="saas-product-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter status"><option value="all">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></div><div className="saas-order-table-wrap"><table className="saas-order-table"><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{visible.map((o) => <tr key={o.id} tabIndex={0} onClick={() => setSelectedOrder(o)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedOrder(o); }}><td><strong>{o.id}</strong><small>{o.payment}</small></td><td><strong>{o.customer}</strong><small>{o.email}</small></td><td>{o.item}</td><td><b>{money(o.total)}</b></td><td><em className={`saas-status status-${o.status}`}>{o.status.replaceAll("_", " ")}</em></td><td>{o.date}</td></tr>)}</tbody></table>{visible.length === 0 && <p className="admin-empty">No orders match your search.</p>}</div><div className="saas-order-detail-list">{visible.map((o) => <article className="saas-order-card" key={o.id}><div className="saas-order-card-head"><div><span className="saas-order-id">{o.id}</span><strong>{o.customer}</strong><small>{o.email} · {o.phone}</small></div><div className="saas-order-card-total"><strong>{money(o.total)}</strong><span>{o.date}</span></div></div><div className="saas-order-item"><span className="saas-product-avatar">{o.item.slice(0, 1)}</span><div><strong>{o.item}</strong><span>Order item · {o.payment === "paid" ? "Payment received" : "Payment pending"}</span></div><em className={`saas-status status-${o.status}`}>{o.status.replaceAll("_", " ")}</em></div><div className="saas-order-fields"><label>Status<select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label><label>Payment<select value={o.payment} onChange={(e) => update(o.id, { payment: e.target.value })}><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label><label>Courier<input value={o.courier} onChange={(e) => update(o.id, { courier: e.target.value })} placeholder="JNE / J&T" /></label><label>Tracking number<input value={o.tracking} onChange={(e) => update(o.id, { tracking: e.target.value })} placeholder="Enter tracking number" /></label><button className="saas-primary-button" onClick={() => save(selectedOrder!)}><Save size={14} /> Save</button></div></article>)}{visible.length === 0 && <p className="admin-empty">No orders match your search.</p>}</div></section>
    {selectedOrder && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}><section className="admin-modal saas-order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title"><header><div><span className="saas-label">Order detail</span><h2 id="order-detail-title">{selectedOrder.id}</h2></div><button className="admin-row-action" onClick={() => setSelectedOrder(null)} aria-label="Close order detail">×</button></header><div className="saas-detail-summary"><div><span>Customer</span><strong>{selectedOrder.customer}</strong><small>{selectedOrder.email} · {selectedOrder.phone}</small></div><div><span>Total amount</span><strong>{money(selectedOrder.total)}</strong><small>{selectedOrder.date}</small></div></div><div className="saas-detail-grid"><div><span>Product</span><strong>{selectedOrder.item}</strong></div><div><span>Order status</span><select value={selectedOrder.status} onChange={(event) => { update(selectedOrder.id, { status: event.target.value, history: defaultHistory(event.target.value) }); setSelectedOrder({ ...selectedOrder, status: event.target.value, history: defaultHistory(event.target.value) }); }}><option value="payment_confirmed">Payment confirmed</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></div><div><span>Payment</span><strong>{selectedOrder.payment}</strong></div><div><span>Courier</span><input value={selectedOrder.courier} onChange={(event) => { update(selectedOrder.id, { courier: event.target.value }); setSelectedOrder({ ...selectedOrder, courier: event.target.value }); }} placeholder="JNE / J&T" /></div><div><span>Tracking number</span><input value={selectedOrder.tracking} onChange={(event) => { update(selectedOrder.id, { tracking: event.target.value }); setSelectedOrder({ ...selectedOrder, tracking: event.target.value }); }} placeholder="Enter tracking number" /></div></div><div className="saas-process-history"><div className="saas-detail-section-heading"><div><span className="saas-label">Fulfillment timeline</span><strong>Riwayat proses order</strong></div><span>{selectedHistory.filter((step) => step.completed).length}/{selectedHistory.length} done</span></div><div className="saas-process-table" role="table" aria-label="Riwayat proses order"><div className="saas-process-table-head" role="row"><span>Order timeline</span></div>{selectedHistory.map((step, index) => <label className={`saas-process-step ${step.completed ? "is-complete" : ""}`} key={step.label}><input type="checkbox" checked={step.completed} onChange={(event) => { updateHistory(selectedOrder.id, index, event.target.checked); setSelectedOrder({ ...selectedOrder, history: selectedHistory.map((item, itemIndex) => itemIndex === index ? { ...item, completed: event.target.checked, date: event.target.checked ? new Date().toLocaleString("id-ID") : undefined } : item) }); }} /><span className="saas-process-number">{step.completed ? "✓" : index + 1}</span><span className="saas-process-copy"><strong>{step.label}</strong><small>{step.detail}{step.date ? ` · ${step.date}` : ""}</small></span><span className="saas-process-state">{step.completed ? "Selesai" : "Belum"}</span></label>)}</div></div><footer><button type="button" className="admin-secondary-button" onClick={() => setSelectedOrder(null)}>Close</button><button type="button" className="saas-primary-button" onClick={async () => { if (await saveOrder(selectedOrder!)) setSelectedOrder(null); }}><Save size={14} /> Save changes</button></footer></section></div>}
    <section className="saas-insight"><div className="saas-insight-icon"><Truck size={18} /></div><div><span className="saas-label">Shipping overview</span><strong>{shippedCount} orders are currently in delivery</strong><p>Keep tracking numbers updated so customers can follow their orders in real time.</p></div><ArrowUpRight size={26} /></section>
  </div>;
}
