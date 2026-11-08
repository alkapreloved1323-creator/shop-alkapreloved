import type { Metadata } from "next";
import { KauppaFooter, KauppaNavbar, type Product } from "@/components/storefront";
import { CatalogClient } from "@/components/catalog-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Shop — AlkaPreloved", description: "Browse our curated collection of preloved fashion, accessories, and everyday pieces." };

const demoProducts: Product[] = [
  { name: "Linen Oversized Shirt", slug: "linen-oversized-shirt", category: "Tops", price: "Rp 185.000", priceValue: 185000, condition: "Very good", size: "M", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85", badge: "Just in", stock: 10, createdAt: "2026-09-25" },
  { name: "Everyday Leather Tote", slug: "everyday-leather-tote", category: "Accessories", price: "Rp 320.000", priceValue: 320000, condition: "Good", size: "One size", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85", stock: 10, createdAt: "2026-09-24" },
  { name: "Soft Tailored Trousers", slug: "soft-tailored-trousers", category: "Bottoms", price: "Rp 240.000", priceValue: 240000, condition: "Like new", size: "S", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85", stock: 10, createdAt: "2026-09-23" },
  { name: "Cotton Day Dress", slug: "cotton-day-dress", category: "Dresses", price: "Rp 275.000", priceValue: 275000, condition: "Very good", size: "M", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85", stock: 10, createdAt: "2026-09-22" },
];

async function getCatalogProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your-project") || key.includes("your-anon")) return demoProducts;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select("id,name,slug,price,condition,stock,created_at,category:categories(name),product_images(public_url,sort_order)").eq("status", "active").order("created_at", { ascending: false });
    if (error || !data) return demoProducts;
    return data.map((item) => { const category = Array.isArray(item.category) ? item.category[0] : item.category; const images = [...(item.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order); const priceValue = Number(item.price); const firstMedia = images[0]?.public_url; const preview = firstMedia && /\.(mp4|webm|mov)(?:\?|$)/i.test(firstMedia) ? firstMedia.replace("/video/upload/", "/video/upload/so_0/").replace(/\.(mp4|webm|mov)(?:\?.*)?$/i, ".jpg") : firstMedia; return { name: item.name, slug: item.slug, category: category?.name ?? "Uncategorized", price: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(priceValue), priceValue, condition: item.condition.replace("_", " "), size: "One size", image: preview ?? demoProducts[0].image, badge: item.stock > 0 && item.stock < 2 ? "Almost gone" : undefined, stock: Number(item.stock), createdAt: item.created_at }; });
  } catch { return demoProducts; }
}

export default async function ShopPage() { const products = await getCatalogProducts(); return <main className="kauppa-page"><KauppaNavbar /><section className="shop-hero"><div className="kauppa-container"><p className="eyebrow">The collection</p><h1>Pieces with<br /><em>a past.</em></h1><p>Wearable, well-loved, and ready for their next chapter.</p></div></section><section className="kauppa-container shop-content"><CatalogClient products={products} /></section><KauppaFooter /></main>; }
