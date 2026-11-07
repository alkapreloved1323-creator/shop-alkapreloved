"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Search, ChevronDown, Package, Sparkles, Shirt, Watch, Footprints } from "lucide-react";
import { KauppaNavbar, KauppaFooter, KauppaProductCard, type Product } from "@/components/storefront";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const iconCategories = [
  { label: "Fashion", icon: <Shirt size={28} strokeWidth={1.5} />, color: "#FFEDD5" },
  { label: "Accessories", icon: <Watch size={28} strokeWidth={1.5} />, color: "#DCFCE7" },
  { label: "Footwear", icon: <Footprints size={28} strokeWidth={1.5} />, color: "#FED7AA" },
  { label: "Outerwear", icon: <Package size={28} strokeWidth={1.5} />, color: "#E0E7FF" },
  { label: "Vintage", icon: <Sparkles size={28} strokeWidth={1.5} />, color: "#D1FAE5" },
];

const services = [
  { title: "Personal Styling", desc: "Book a free session", stars: 4, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80", gradient: "from-indigo-500 to-indigo-700" },
  { title: "Wardrobe Audit", desc: "Find what to keep", stars: 4, image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80", gradient: "from-orange-600 to-orange-800" },
  { title: "Gift Curation", desc: "The perfect preloved gift", stars: 4, image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=600&q=80", gradient: "from-orange-500 to-orange-700" },
];

export default function HomePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const mediaPreview = (url: string) => {
    if (!/\.(mp4|webm|mov)(?:\?|$)/i.test(url)) return url;
    return url.replace("/video/upload/", "/video/upload/so_0/").replace(/\.(mp4|webm|mov)(?:\?.*)?$/i, ".jpg");
  };

  useEffect(() => {
    const loadProducts = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.from("products").select("id,name,slug,price,condition,category:categories(name),product_images(public_url,sort_order)").eq("status", "active").gt("stock", 0).order("created_at", { ascending: false }).limit(20);
      if (!data) return;
      const products = data.map((product) => {
        const category = Array.isArray(product.category) ? product.category[0] : product.category;
        const firstMedia = Array.isArray(product.product_images) ? [...product.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] : undefined;
        const image = firstMedia?.public_url;
        return { name: product.name, slug: product.slug, category: (category as { name?: string } | null)?.name ?? "Fashion", price: `Rp ${Number(product.price).toLocaleString("id-ID")}`, priceValue: Number(product.price), condition: product.condition.replace("_", " "), size: "-", image: image ? mediaPreview(image) : "/crop-products.png" };
      });
      setNewProducts(products.slice(0, 6));
      const daySeed = Math.floor(Date.now() / 86400000);
      const shuffled = [...products].sort((a, b) => {
        const score = (value: string) => { let hash = daySeed; for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) | 0; return Math.abs(hash); };
        return score(a.slug) - score(b.slug);
      });
      setRecommendedProducts(shuffled.slice(0, 6));
    };
    loadProducts().catch(() => undefined);
  }, []);

  return (
    <div className="kauppa-page">
      <KauppaNavbar />

      {/* Search Banner */}
      <section className="kauppa-search-banner">
        <div className="kauppa-container">
          <div className="kauppa-search-bar">
            <Search size={18} className="kauppa-search-icon" />
            <input
              type="text"
              placeholder="Search preloved fashion, bags, shoes..."
              className="kauppa-search-input"
              readOnly
              onClick={() => { window.location.href = "/shop"; }}
            />
            <div className="kauppa-search-divider" />
            <button className="kauppa-search-filter">
              <span>Category</span>
              <ChevronDown size={14} />
            </button>
            <div className="kauppa-search-divider" />
            <button className="kauppa-search-filter">
              <span>All Sizes</span>
              <ChevronDown size={14} />
            </button>
            <button className="kauppa-search-btn" onClick={() => { window.location.href = "/shop"; }}>
              <Search size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Category Icons */}
      <section className="kauppa-cats-section">
        <div className="kauppa-container">
          <div className="kauppa-cat-row">
            {iconCategories.map((cat) => (
              <Link href="/shop" key={cat.label} className="kauppa-cat-item">
                <div className="kauppa-cat-icon" style={{ background: cat.color }}>
                  {cat.icon}
                </div>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products — Newly Arrived */}
      <section className="kauppa-section">
        <div className="kauppa-container">
          <div className="kauppa-section-header">
            <h2 className="kauppa-section-title">Newly Arrived</h2>
            <Link href="/shop" className="kauppa-view-all-btn">View All <ArrowRight size={14} /></Link>
          </div>
          {newProducts.length ? <div className="kauppa-product-grid">{newProducts.map((product) => <KauppaProductCard key={product.slug} product={product} />)}</div> : <div className="kauppa-empty-products">Belum ada produk yang tersedia.</div>}
        </div>
      </section>

      {/* Products you may like */}
      <section className="kauppa-section kauppa-bg-gray">
        <div className="kauppa-container">
          <div className="kauppa-section-header">
            <h2 className="kauppa-section-title">Products you may like</h2>
            <Link href="/shop" className="kauppa-view-all-btn dark">View All <ArrowRight size={14} /></Link>
          </div>
          {recommendedProducts.length ? <div className="kauppa-product-grid-6">{recommendedProducts.map((product) => <KauppaProductCard key={product.slug} product={product} compact />)}</div> : <div className="kauppa-empty-products">Belum ada rekomendasi produk.</div>}
        </div>
      </section>

      {/* Recommended Services */}
      <section className="kauppa-section kauppa-bg-gray">
        <div className="kauppa-container">
          <div className="kauppa-section-header">
            <h2 className="kauppa-section-title">Recommended Services</h2>
            <Link href="/shop" className="kauppa-view-all-btn dark">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="kauppa-services-grid">
            {services.map((s) => (
              <div key={s.title} className="kauppa-service-card">
                <Image src={s.image} alt={s.title} fill sizes="400px" className="kauppa-service-img" />
                <div className="kauppa-service-overlay" />
                <div className="kauppa-service-content">
                  <h3 className="kauppa-service-title">{s.title}</h3>
                  <div className="kauppa-service-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={11} fill={i <= s.stars ? "white" : "none"} stroke="white" />
                    ))}
                    <span>{s.desc}</span>
                  </div>
                  <Link href="/shop" className="kauppa-service-btn">Know More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <KauppaFooter />
    </div>
  );
}