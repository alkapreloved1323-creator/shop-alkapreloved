"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Search, ChevronDown, Package, Sparkles, Shirt, Watch, Footprints } from "lucide-react";
import { KauppaNavbar, KauppaFooter, KauppaProductCard, type Product } from "@/components/storefront";

const featuredProducts: Product[] = [
  { name: "Linen Oversized Shirt", slug: "linen-oversized-shirt", category: "Tops", price: "Rp 185.000", condition: "Very good", size: "M", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80", badge: "Just in", rating: 4.5, reviews: 231 },
  { name: "Everyday Leather Tote", slug: "everyday-leather-tote", category: "Accessories", price: "Rp 320.000", condition: "Good", size: "One size", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", rating: 4.2, reviews: 104 },
  { name: "Soft Tailored Trousers", slug: "soft-tailored-trousers", category: "Bottoms", price: "Rp 240.000", condition: "Like new", size: "S", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80", rating: 4.8, reviews: 502 },
  { name: "Vintage Denim Jacket", slug: "vintage-denim-jacket", category: "Outerwear", price: "Rp 410.000", condition: "Good", size: "L", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=600&q=80", rating: 4.6, reviews: 88 },
  { name: "Silk Midi Dress", slug: "silk-midi-dress", category: "Dresses", price: "Rp 290.000", condition: "Like new", size: "M", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", rating: 4.3, reviews: 175, badge: "Popular" },
  { name: "Classic Canvas Sneakers", slug: "classic-canvas-sneakers", category: "Footwear", price: "Rp 195.000", condition: "Very good", size: "39", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", rating: 4.7, reviews: 344 },
];

const mayLikeProducts: Product[] = [
  { name: "Knit Cardigan Cream", slug: "knit-cardigan-cream", category: "Tops", price: "Rp 220.000", condition: "Good", size: "M", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80", rating: 4.4, reviews: 94 },
  { name: "Pleated Midi Skirt", slug: "pleated-midi-skirt", category: "Bottoms", price: "Rp 165.000", condition: "Very good", size: "S", image: "https://images.unsplash.com/photo-1583496661160-fb5974b21fa0?auto=format&fit=crop&w=600&q=80", rating: 4.1, reviews: 76 },
  { name: "Woven Shoulder Bag", slug: "woven-shoulder-bag", category: "Accessories", price: "Rp 275.000", condition: "Like new", size: "OS", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", rating: 4.6, reviews: 132 },
  { name: "High-Waist Mom Jeans", slug: "high-waist-mom-jeans", category: "Bottoms", price: "Rp 310.000", condition: "Good", size: "28", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", rating: 4.5, reviews: 207 },
  { name: "Floral Wrap Blouse", slug: "floral-wrap-blouse", category: "Tops", price: "Rp 145.000", condition: "Very good", size: "M", image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=600&q=80", rating: 4.2, reviews: 58 },
  { name: "Leather Belt Classic", slug: "leather-belt-classic", category: "Accessories", price: "Rp 110.000", condition: "Good", size: "OS", image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80", rating: 4.3, reviews: 88 },
];

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
          <div className="kauppa-product-grid">
            {featuredProducts.map((p) => (
              <KauppaProductCard key={p.slug} product={p} />
            ))}
          </div>
          <div className="kauppa-center-cta">
            <Link href="/shop" className="kauppa-cta-orange">Check more Fashion</Link>
          </div>
        </div>
      </section>

      {/* Products you may like */}
      <section className="kauppa-section kauppa-bg-gray">
        <div className="kauppa-container">
          <div className="kauppa-section-header">
            <h2 className="kauppa-section-title">Products you may like</h2>
            <Link href="/shop" className="kauppa-view-all-btn dark">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="kauppa-product-grid-6">
            {mayLikeProducts.map((p) => (
              <KauppaProductCard key={p.slug} product={p} compact />
            ))}
          </div>
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