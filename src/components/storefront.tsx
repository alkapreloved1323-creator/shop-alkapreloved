"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/shop#categories" },
  { label: "Our story", href: "/#story" },
  { label: "Track order", href: "/track-order" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container nav-inner"><button className="icon-button mobile-menu-button" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={21} strokeWidth={1.8} /></button><Link href="/" className="brand-mark" aria-label="AlkaPreloved home"><span className="brand-dot" /><span>alka<span>preloved</span></span></Link><nav className="desktop-nav" aria-label="Primary navigation">{navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav><div className="nav-actions"><button className="icon-button" aria-label="Search"><Search size={19} strokeWidth={1.8} /></button><Link href="/cart" className="icon-button cart-button" aria-label="Shopping bag"><ShoppingBag size={19} strokeWidth={1.8} /><span className="cart-count">0</span></Link></div></div>{open && <div className="mobile-menu-overlay" onClick={() => setOpen(false)}><div className="mobile-menu" onClick={(event) => event.stopPropagation()}><div className="mobile-menu-top"><span className="eyebrow">Explore</span><button className="icon-button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={21} /></button></div><nav className="mobile-nav">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}<ArrowRight size={17} /></Link>)}</nav><p className="mobile-menu-note">Thoughtfully chosen pieces for a more considered wardrobe.</p></div></div>}</header>;
}

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  return <article className="product-card"><Link href={`/product/${product.slug}`} className="product-image-wrap"><img src={product.image} alt={product.name} className="product-image" />{product.badge && <span className="product-badge">{product.badge}</span>}<button className={`heart-button ${liked ? "is-liked" : ""}`} aria-label={`${liked ? "Remove" : "Add"} ${product.name} ${liked ? "from" : "to"} wishlist`} onClick={(event) => { event.preventDefault(); setLiked(!liked); }}><Heart size={17} fill={liked ? "currentColor" : "none"} /></button></Link><div className="product-info"><div><p className="product-category">{product.category}</p><h3><Link href={`/product/${product.slug}`}>{product.name}</Link></h3></div><p className="product-price">{product.price}</p></div><p className="product-condition">{product.condition} <span>·</span> {product.size}</p></article>;
}

export function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: string }) { return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{link && <Link href="/shop" className="text-link">{link}<ArrowRight size={16} /></Link>}</div>; }

export function Footer() { return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Link href="/" className="brand-mark"><span className="brand-dot" /><span>alka<span>preloved</span></span></Link><p>Pre-loved pieces,<br />chosen with intention.</p></div><div><p className="footer-label">Explore</p><Link href="/shop">Shop all</Link><Link href="/shop#new">New arrivals</Link><Link href="/shop#categories">Categories</Link></div><div><p className="footer-label">Help</p><Link href="/track-order">Track your order</Link><Link href="/cart">Your bag</Link><Link href="/#contact">Contact us</Link></div><div className="footer-newsletter"><p className="footer-label">The edit, occasionally</p><p>New drops, thoughtful notes, no noise.</p><div className="newsletter-form"><input type="email" placeholder="Your email address" aria-label="Email address" /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div></div></div><div className="container footer-bottom"><span>© 2026 AlkaPreloved</span><span>Made for a slower kind of shopping.</span></div></footer>; }

export type Product = { name: string; slug: string; category: string; price: string; condition: string; size: string; image: string; badge?: string };
