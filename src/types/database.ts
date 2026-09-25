// ============================================================
// Database Types — mirrors the Supabase PostgreSQL schema
// This file should be updated when running: supabase gen types
// ============================================================

export type ProductStatus = "draft" | "active" | "sold" | "archived";
export type ProductCondition =
  | "like_new"
  | "very_good"
  | "good"
  | "fair"
  | "poor";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded";

export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

// ─── Database Row Types ──────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  condition: ProductCondition;
  stock: number;
  weight: number | null; // grams
  length: number | null; // cm
  width: number | null;  // cm
  height: number | null; // cm
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_provider: string | null;
  shipping_service: string | null;
  tracking_number: string | null;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  // Snapshot of product data at time of order
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  transaction_id: string | null;
  payment_method: string | null;
  amount: number;
  status: PaymentStatus;
  raw_response: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  courier: string;
  service: string;
  tracking_number: string | null;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Joined / Extended Types ─────────────────────────────────

export interface ProductWithImages extends Product {
  product_images: ProductImage[];
  category: Category | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface OrderFull extends Order {
  order_items: OrderItem[];
  payments: Payment[];
  shipments: Shipment[];
}
