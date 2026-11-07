import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KauppaFooter, KauppaNavbar, ProductCard, type Product } from "@/components/storefront";
import { ProductDetailClient } from "@/components/product-detail-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DetailMedia = { url: string; kind: "image" | "video" };
export type DetailProduct = { name: string; slug: string; category: string; price: string; condition: string; description: string; size: string; weight: number | null; stock: number; media: DetailMedia[] };
const demo: DetailProduct[] = [
  { name: "Linen Oversized Shirt", slug: "linen-oversized-shirt", category: "Tops", price: "Rp 185.000", condition: "Very good", description: "A relaxed linen shirt with an easy, lived-in feel. Light, breathable, and ready to become the piece you reach for on warm days.", size: "M", weight: 280, stock: 2, media: [{ url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=90", kind: "image" }, { url: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90", kind: "image" }] },
  { name: "Everyday Leather Tote", slug: "everyday-leather-tote", category: "Accessories", price: "Rp 320.000", condition: "Good", description: "A softly structured leather tote with plenty of room for the everyday essentials. Characterful patina, sturdy handles.", size: "One size", weight: 650, stock: 1, media: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa-89d128fa?auto=format&fit=crop&w=1200&q=90", kind: "image" }, { url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=90", kind: "image" }] },
  { name: "Soft Tailored Trousers", slug: "soft-tailored-trousers", category: "Bottoms", price: "Rp 240.000", condition: "Like new", description: "An elegant, softly tailored pair with a comfortable high waist and a fluid straight leg.", size: "S", weight: 420, stock: 1, media: [{ url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=90", kind: "image" }, { url: "https://images.unsplash.com/photo-1506629905607-d9c297d7f5e4?auto=format&fit=crop&w=1200&q=90", kind: "image" }] },
];
async function getProduct(slug: string): Promise<DetailProduct | null> { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key || url.includes("your-project") || key.includes("your-anon")) return demo.find((item) => item.slug === slug) ?? null; try { const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.from("products").select("name,slug,price,condition,description,stock,weight,category:categories(name),product_images(public_url,sort_order)").eq("slug", slug).eq("status", "active").maybeSingle(); if (error || !data) return null; const category = Array.isArray(data.category) ? data.category[0] : data.category; const images = [...(data.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((item) => item.public_url); return { name: data.name, slug: data.slug, category: category?.name ?? "Uncategorized", price: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(data.price)), condition: data.condition.replace("_", " "), description: data.description ?? "A thoughtfully chosen preloved piece, ready for its next chapter.", size: "One size", weight: data.weight, stock: data.stock, media: images.length ? images.map((url) => ({ url, kind: /\.(mp4|webm|mov)(?:\?|$)/i.test(url) ? "video" : "image" as const })) : demo[0].media }; } catch { return null; } }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const product = await getProduct((await params).slug); const image = product?.media.find((item) => item.kind === "image")?.url ?? product?.media[0]?.url; return { title: product?.name ?? "Product not found", description: product?.description ?? "Discover curated preloved pieces at AlkaPreloved.", openGraph: { title: product?.name, description: product?.description, type: "website", images: image ? [{ url: image, alt: product?.name }] : undefined }, twitter: { card: "summary_large_image", title: product?.name, description: product?.description, images: image ? [image] : undefined } }; }
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const supabase = await createSupabaseServerClient();
  const { data: relatedData } = await supabase.from("products").select("name,slug,price,condition,stock,category:categories(name),product_images(public_url,sort_order)").eq("status", "active").gt("stock", 0).neq("slug", product.slug);
  const seed = Date.now();
  const related = (relatedData ?? []).sort((a, b) => {
    const score = (value: string) => { let hash = seed; for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) | 0; return Math.abs(hash); };
    return score(a.slug) - score(b.slug);
  }).slice(0, 3).map((item): Product => {
    const category = Array.isArray(item.category) ? item.category[0] : item.category;
    const firstMedia = [...(item.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.public_url;
    const image = firstMedia && /\\.(mp4|webm|mov)(?:\\?|$)/i.test(firstMedia) ? firstMedia.replace("/video/upload/", "/video/upload/so_0/").replace(/\\.(mp4|webm|mov)(?:\\?.*)?$/i, ".jpg") : firstMedia;
    return { name: item.name, slug: item.slug, category: category?.name ?? "Uncategorized", price: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(item.price)), condition: item.condition.replace("_", " "), size: "One size", image: image ?? "/crop-products.png" };
  });
  return <main className="kauppa-page"><KauppaNavbar /><div className="kauppa-container product-detail-page"><ProductDetailClient product={product} /><section className="related-products"><p className="eyebrow">Keep exploring</p><h2>You may also like</h2><div className="product-grid">{related.map((item) => <ProductCard key={item.slug} product={item} />)}</div></section></div><KauppaFooter /></main>;
}
