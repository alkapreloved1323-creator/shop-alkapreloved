"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  X,
  ArrowUpRight,
} from "lucide-react";
import { NewsletterForm } from "@/components/marketing-forms";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Katalog", href: "/shop" },
  { label: "Kategori", href: "/#categories" },
  { label: "Cerita Kami", href: "/#story" },
  { label: "Lacak Pesanan", href: "/track-order" },
];

export function Navbar({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { itemCount } = useCart();

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    window.location.href = query
      ? `/shop?search=${encodeURIComponent(query)}`
      : "/shop";
  }

  if (theme === "dark") {
    return (
      <header className="sticky top-0 z-50 w-full bg-[#0F172A]/95 backdrop-blur-md border-b border-[#4F46E5]/80 text-white">
        {/* Top Announcement Bar */}
        <div className="bg-[#0F172A] border-b border-[#4F46E5] py-2 px-4 text-center text-[11px] font-medium tracking-widest uppercase text-[#E2E8F0] flex items-center justify-center gap-2">
          <Sparkles size={13} className="text-[#FED7AA] shrink-0" />
          <span>
            Diskon 20% Pembelian Pertama • Kode:{" "}
            <strong className="text-[#E2E8F0]">PRELOVED20</strong> • Gratis
            Ongkir Se-Indonesia
          </span>
          <Sparkles size={13} className="text-[#FED7AA] shrink-0 hidden sm:inline" />
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 rounded-full border border-[#4F46E5] bg-[#4F46E5]/80 flex items-center justify-center text-[#E2E8F0] hover:text-[#F8FAFC]"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl tracking-tight font-bold text-white group"
            aria-label="AlkaPreloved Home"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#FED7AA] flex items-center justify-center text-[#0F172A] font-extrabold text-sm shadow-md shadow-[#6366F1]/20">
              A
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-wider uppercase text-white">
                ALKA<span className="text-[#FED7AA]">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-medium">
                PRELOVED & VINTAGE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#F8FAFC] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="w-10 h-10 rounded-full border border-[#4F46E5]/80 bg-[#4F46E5]/60 hover:bg-[#4F46E5] text-[#E2E8F0] hover:text-[#F8FAFC] flex items-center justify-center transition-colors"
              aria-label="Cari produk"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
            </button>

            <Link
              href="/wishlist"
              className="w-10 h-10 rounded-full border border-[#4F46E5]/80 bg-[#4F46E5]/60 hover:bg-[#4F46E5] text-[#E2E8F0] hover:text-[#F8FAFC] flex items-center justify-center transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </Link>

            <Link
              href="/cart"
              className="w-10 h-10 rounded-full border border-[#4F46E5]/80 bg-[#4F46E5]/60 hover:bg-[#4F46E5] text-[#E2E8F0] hover:text-[#F8FAFC] flex items-center justify-center transition-colors relative"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#FED7AA] text-[#0F172A] text-[9px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#6366F1]/80 bg-[#0F172A] hover:bg-[#4F46E5] text-[#EEF2FF] hover:text-[#F8FAFC] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Search Overlay */}
        {searchOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian Produk"
          >
            <div className="bg-[#0F172A] border border-[#4F46E5] rounded-3xl p-6 sm:p-8 w-full max-w-2xl relative shadow-2xl">
              <button
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#4F46E5] hover:bg-[#6366F1] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center"
                aria-label="Tutup pencarian"
                onClick={() => setSearchOpen(false)}
              >
                <X size={18} />
              </button>
              <p className="text-[#FED7AA] text-xs font-semibold tracking-widest uppercase mb-3">
                Cari Koleksi Preloved
              </p>
              <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-[#6366F1] pb-3">
                <Search size={22} className="text-[#94A3B8] shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari kemeja, blazer, celana, jaket, tas..."
                  className="bg-transparent border-0 outline-none text-white text-base sm:text-lg w-full placeholder-[#94A3B8]"
                  aria-label="Kata kunci pencarian"
                />
                <button
                  type="submit"
                  className="bg-[#EEF2FF] text-[#0F172A] hover:bg-[#E2E8F0] font-semibold px-5 py-2 rounded-full text-xs transition-colors shrink-0"
                >
                  Cari
                </button>
              </form>
              <p className="text-[#94A3B8] text-xs mt-4">
                Pencarian populer:{" "}
                <button
                  type="button"
                  onClick={() => setSearch("Linen")}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] underline mr-2"
                >
                  Linen
                </button>
                <button
                  type="button"
                  onClick={() => setSearch("Outerwear")}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] underline mr-2"
                >
                  Outerwear
                </button>
                <button
                  type="button"
                  onClick={() => setSearch("Trousers")}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] underline mr-2"
                >
                  Trousers
                </button>
                <button
                  type="button"
                  onClick={() => setSearch("Tote")}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] underline"
                >
                  Tote Bag
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {open && (
          <div
            className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-sm flex justify-start"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-4/5 max-w-sm h-full bg-[#0F172A] border-r border-[#4F46E5] p-6 flex flex-col justify-between"
              onClick={(event) => event.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#4F46E5]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#FED7AA] text-[#0F172A] font-extrabold text-xs flex items-center justify-center">
                      A
                    </span>
                    <span className="font-bold text-white tracking-wide">
                      ALKA PRELOVED
                    </span>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full bg-[#0F172A] border border-[#4F46E5] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center"
                    aria-label="Tutup menu"
                    onClick={() => setOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
                <nav className="flex flex-col gap-2 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-3 px-3 rounded-xl text-[#E2E8F0] hover:text-[#F8FAFC] hover:bg-[#0F172A] text-base font-medium transition-colors"
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={16} className="text-[#94A3B8]" />
                    </Link>
                  ))}
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-3 px-3 rounded-xl text-[#E2E8F0] hover:bg-[#0F172A] text-base font-medium transition-colors"
                  >
                    <span>Masuk Admin</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </nav>
              </div>
              <div className="pt-6 border-t border-[#4F46E5] text-xs text-[#94A3B8]">
                Pakaian terkurasi dengan penuh perhatian di Jakarta, Indonesia.
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Fallback for light theme
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <button
          className="icon-button mobile-menu-button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={21} strokeWidth={1.8} />
        </button>
        <Link href="/" className="brand-mark" aria-label="AlkaPreloved home">
          <span className="brand-dot" />
          <span>
            alka<span>preloved</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} strokeWidth={1.8} />
          </button>
          <Link href="/wishlist" className="icon-button" aria-label="Wishlist">
            <Heart size={19} strokeWidth={1.8} />
          </Link>
          <Link
            href="/cart"
            className="icon-button cart-button"
            aria-label="Shopping bag"
          >
            <ShoppingBag size={19} strokeWidth={1.8} />
            <span className="cart-count">{itemCount}</span>
          </Link>
        </div>
      </div>
      {searchOpen && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
        >
          <button
            className="search-overlay-close icon-button"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <X size={21} />
          </button>
          <div className="search-overlay-inner">
            <p className="eyebrow">Find your next piece</p>
            <form onSubmit={submitSearch} className="header-search-form">
              <Search size={22} />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search shirts, dresses, accessories..."
                aria-label="Search products"
              />
              <button type="submit" className="button button-dark">
                Search
              </button>
            </form>
            <p className="search-suggestions">Try “linen”, “dress”, or “tote”</p>
          </div>
        </div>
      )}
      {open && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="mobile-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-menu-top">
              <span className="eyebrow">Explore</span>
              <button
                className="icon-button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={21} />
              </button>
            </div>
            <nav className="mobile-nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <ArrowRight size={17} />
                </Link>
              ))}
            </nav>
            <p className="mobile-menu-note">
              Thoughtfully chosen pieces for a more considered wardrobe.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

export function ProductCard({
  product,
  theme = "dark",
}: {
  product: Product;
  theme?: "dark" | "light";
}) {
  const { isSaved, toggleItem } = useWishlist();
  const liked = isSaved(product.slug);

  if (theme === "dark") {
    return (
      <article className="group bg-[#4F46E5]/60 border border-[#4F46E5]/80 hover:border-[#6366F1]/80 rounded-3xl p-3.5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 flex flex-col justify-between">
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#0F172A]">
          <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={60}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-[#0F172A]/75 backdrop-blur-md text-[#E2E8F0] border border-[#FED7AA]/20 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full pointer-events-none">
              {product.badge}
            </span>
          )}

          {/* Wishlist toggle */}
          <button
            className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-[#0F172A]/70 backdrop-blur-md border border-[#EEF2FF]/10 flex items-center justify-center transition-colors cursor-pointer ${
              liked ? "text-rose-500" : "text-white/80 hover:text-[#F8FAFC]"
            }`}
            aria-label={`${liked ? "Hapus" : "Tambah"} ${product.name} ke wishlist`}
            onClick={(event) => {
              event.preventDefault();
              toggleItem(product);
            }}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Product meta */}
        <div className="pt-4 px-1 flex flex-col gap-1.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#FED7AA]/90 font-medium tracking-wider uppercase text-[10px]">
              {product.category}
            </span>
            <span className="text-[#94A3B8] text-[11px]">
              {product.condition} • {product.size}
            </span>
          </div>

          <h3 className="font-semibold text-white text-base tracking-tight group-hover:text-[#E2E8F0] transition-colors line-clamp-1">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#4F46E5]/60">
            <span className="text-white font-bold text-base tracking-tight">
              {product.price}
            </span>
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4F46E5] hover:bg-[#EEF2FF] text-[#E2E8F0] hover:text-[#0F172A] text-xs font-medium transition-colors"
            >
              Lihat
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Fallback light theme
  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-image-wrap">
        <Image
          src={product.image}
          alt={product.name}
          className="product-image"
          width={900}
          height={1100}
        />
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        <button
          className={`heart-button ${liked ? "is-liked" : ""}`}
          aria-label={`${liked ? "Remove" : "Add"} ${product.name} ${
            liked ? "from" : "to"
          } wishlist`}
          onClick={(event) => {
            event.preventDefault();
            toggleItem(product);
          }}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
      </Link>
      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <p className="product-price">{product.price}</p>
      </div>
      <p className="product-condition">
        {product.condition} <span>·</span> {product.size}
      </p>
    </article>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  link,
  theme = "dark",
}: {
  eyebrow: string;
  title: string;
  link?: string;
  theme?: "dark" | "light";
}) {
  if (theme === "dark") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-[#FED7AA] text-xs font-semibold tracking-widest uppercase mb-2">
            {eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
        </div>
        {link && (
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#E2E8F0] hover:text-[#F8FAFC] transition-colors pb-1 border-b border-[#6366F1]"
          >
            {link}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {link && (
        <Link href="/shop" className="text-link">
          {link}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function Footer({ theme = "dark" }: { theme?: "dark" | "light" }) {
  if (theme === "dark") {
    return (
      <footer className="bg-[#0F172A] border-t border-[#4F46E5] text-[#94A3B8] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-[#4F46E5]">
            {/* Brand column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#FED7AA] flex items-center justify-center text-[#0F172A] font-extrabold text-sm shadow-md">
                  A
                </span>
                <span className="text-xl font-bold tracking-wider uppercase text-white">
                  ALKA<span className="text-[#FED7AA]">.</span>PRELOVED
                </span>
              </Link>
              <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm">
                Pilihan fashion preloved & vintage terkurasi dengan teliti.
                Menghadirkan gaya berkelas yang lebih hemat dan ramah lingkungan.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[#94A3B8]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram AlkaPreloved"
                  className="w-9 h-9 rounded-full bg-[#0F172A] border border-[#4F46E5] hover:border-[#6366F1] hover:text-[#F8FAFC] flex items-center justify-center transition-colors"
                >
                  <span aria-hidden="true" className="text-sm font-semibold">◎</span>
                </a>
              </div>
            </div>

            {/* Nav Column 1 */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">
                Koleksi
              </p>
              <Link href="/shop" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Semua Produk
              </Link>
              <Link href="/shop#categories" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Kategori
              </Link>
              <Link href="/shop?category=Tops" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Tops & Kemeja
              </Link>
              <Link href="/shop?category=Outerwear" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Outerwear & Jaket
              </Link>
            </div>

            {/* Nav Column 2 */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">
                Bantuan
              </p>
              <Link href="/track-order" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Lacak Pesanan
              </Link>
              <Link href="/cart" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Keranjang Belanja
              </Link>
              <Link href="/wishlist" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Wishlist
              </Link>
              <Link href="/#contact" className="text-sm hover:text-[#F8FAFC] transition-colors">
                Hubungi Kami
              </Link>
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">
                Dapatkan Info Drop Terbaru
              </p>
              <p className="text-sm text-[#94A3B8]">
                Jadilah yang pertama tahu saat ada koleksi baru dan promo eksklusif rilis.
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <span>© 2026 AlkaPreloved. Wear it well, pass it on.</span>
            <div className="flex items-center gap-6">
              <Link href="/#story" className="hover:text-[#94A3B8] transition-colors">
                Cerita Kami
              </Link>
              <Link href="/admin" className="hover:text-[#94A3B8] transition-colors">
                Admin Area
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand-mark">
            <span className="brand-dot" />
            <span>
              alka<span>preloved</span>
            </span>
          </Link>
          <p>
            Pre-loved pieces,
            <br />
            chosen with intention.
          </p>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <Link href="/shop">Shop all</Link>
          <Link href="/shop#new">New arrivals</Link>
          <Link href="/shop#categories">Categories</Link>
        </div>
        <div>
          <p className="footer-label">Help</p>
          <Link href="/track-order">Track your order</Link>
          <Link href="/cart">Your bag</Link>
          <Link href="/#contact">Contact us</Link>
        </div>
        <div className="footer-newsletter">
          <p className="footer-label">The edit, occasionally</p>
          <p>New drops, thoughtful notes, no noise.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 AlkaPreloved</span>
        <span>Made for a slower kind of shopping.</span>
      </div>
    </footer>
  );
}

export type Product = {
  name: string;
  slug: string;
  category: string;
  price: string;
  priceValue?: number;
  condition: string;
  size: string;
  image: string;
  badge?: string;
  createdAt?: string;
  rating?: number;
  reviews?: number;
};

// ────────────────────────────────────────────────────────────────────
// KAUPPA MARKETPLACE COMPONENTS
// ────────────────────────────────────────────────────────────────────

export function KauppaNavbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { itemCount } = useCart();

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    window.location.href = query ? `/shop?search=${encodeURIComponent(query)}` : "/shop";
  }

  return (
    <header className="kauppa-header">
      {/* Main navbar */}
      <div className="kauppa-navbar-main">
        <div className="kauppa-container kauppa-navbar-inner">
          <button className="kauppa-hamburger lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <Link href="/" className="kauppa-brand">
            <span className="kauppa-brand-logo">A</span>
            <span className="kauppa-brand-name">alka<span>preloved</span></span>
          </Link>
          <nav className="kauppa-main-nav">
            <Link href="/">Beranda</Link>
            <div className="kauppa-nav-dropdown">
              <button type="button" aria-haspopup="true" className="kauppa-nav-dropdown-trigger">
                <span>Kategori</span> <ChevronDown size={14} aria-hidden="true" />
              </button>
              <div className="kauppa-nav-dropdown-menu">
                {["Semua", "Fashion", "Accessories", "Footwear", "Outerwear", "Vintage"].map((category) => (
                  <Link key={category} href={category === "Semua" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`}>
                    {category}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/#promo">Promo</Link>
            <Link href="/#story">Tentang</Link>
            <Link href="/#contact">Kontak</Link>
            <Link href="/track-order">Lacak Pesanan</Link>
          </nav>
          <div className="kauppa-nav-actions">
            <button className="kauppa-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={18} />
            </button>
            <Link href="/wishlist" className="kauppa-icon-btn" aria-label="Wishlist">
              <Heart size={18} />
            </Link>
            <Link href="/cart" className="kauppa-icon-btn kauppa-cart-btn" aria-label="Cart">
              <ShoppingBag size={18} />
              {itemCount > 0 && <span className="kauppa-cart-count">{itemCount}</span>}
            </Link>
            <Link href="/admin" className="kauppa-admin-btn">Admin</Link>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
          <button className="search-overlay-close icon-button" aria-label="Close" onClick={() => setSearchOpen(false)}>
            <X size={21} />
          </button>
          <div className="search-overlay-inner">
            <p className="eyebrow">Find your next piece</p>
            <form onSubmit={submitSearch} className="header-search-form">
              <Search size={22} />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shirts, dresses, accessories..." aria-label="Search" />
              <button type="submit" className="button button-dark">Search</button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="mobile-menu-overlay" onClick={() => setOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-top">
              <span className="kauppa-brand-name">alka<span>preloved</span></span>
              <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close"><X size={21} /></button>
            </div>
            <nav className="mobile-nav">
              <Link href="/" onClick={() => setOpen(false)}>Beranda<ArrowRight size={17} /></Link>
              <p className="mobile-nav-label">Kategori</p>
              {["Semua", "Fashion", "Accessories", "Footwear", "Outerwear", "Vintage"].map((category) => (
                <Link key={category} href={category === "Semua" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`} onClick={() => setOpen(false)}>
                  {category}<ArrowRight size={17} />
                </Link>
              ))}
              <Link href="/#promo" onClick={() => setOpen(false)}>Promo<ArrowRight size={17} /></Link>
              <Link href="/#story" onClick={() => setOpen(false)}>Tentang<ArrowRight size={17} /></Link>
              <Link href="/#contact" onClick={() => setOpen(false)}>Kontak<ArrowRight size={17} /></Link>
              <Link href="/track-order" onClick={() => setOpen(false)}>Lacak Pesanan<ArrowRight size={17} /></Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export function KauppaProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { isSaved, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const liked = isSaved(product.slug);

  return (
    <article className={`kauppa-product-card${compact ? " kauppa-card-compact" : ""}`}>
      <div className="kauppa-card-image-wrap">
        <Link href={`/product/${product.slug}`}>
          <Image src={product.image} alt={product.name} fill sizes="(max-width:640px) 50vw,300px" className="kauppa-card-img" />
        </Link>
        {product.badge && <span className="kauppa-card-badge">{product.badge}</span>}
        <button
          className={`kauppa-card-heart${liked ? " liked" : ""}`}
          aria-label={`${liked ? "Remove" : "Add"} ${product.name} to wishlist`}
          onClick={() => toggleItem(product)}
        >
          <Heart size={15} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="kauppa-card-info">
        <p className="kauppa-card-category">{product.category}</p>
        <h3 className="kauppa-card-name">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.rating !== undefined && (
          <div className="kauppa-card-rating">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} fill={i <= Math.round(product.rating!) ? "#f59e0b" : "none"} stroke="#f59e0b" />
            ))}
            <span className="kauppa-card-reviews">({product.reviews})</span>
          </div>
        )}
        <div className="kauppa-card-footer">
          <span className="kauppa-card-price">{product.price}</span>
          <button
            className="kauppa-card-add"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem({ ...product, priceValue: product.priceValue ?? 0, stock: 10 }, 1)}
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function KauppaFooter() {
  return (
    <footer className="kauppa-footer">
      <div className="kauppa-footer-top">
        <div className="kauppa-container kauppa-footer-top-inner">
          <div className="kauppa-footer-brand">
            <div className="kauppa-brand-big">
              <span className="kauppa-brand-logo">A</span>
              <span>Alka<span>preloved</span></span>
            </div>
            <p>Sign up for exclusive promos, new items, drop dates &amp; more</p>
            <NewsletterForm />
          </div>
          <div className="kauppa-footer-links">
            <div>
              <p className="kauppa-footer-label">About us</p>
              <Link href="/#story">Our Story</Link>
              <Link href="/shop">Career</Link>
              <Link href="/shop">Partners</Link>
              <Link href="/shop">Location</Link>
              <Link href="/shop">News</Link>
            </div>
            <div>
              <p className="kauppa-footer-label">Supports</p>
              <Link href="/#contact">Contact Us</Link>
              <Link href="/shop">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="kauppa-footer-bottom">
        <div className="kauppa-container">
          <span className="kauppa-footer-watermark">Alkapreloved</span>
          <p className="kauppa-footer-copy">© Copyright Alkapreloved 2026. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

