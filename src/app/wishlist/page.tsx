"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { KauppaFooter, KauppaNavbar } from "@/components/storefront";
import { useWishlist } from "@/components/wishlist-context";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  return <main className="kauppa-page"><KauppaNavbar /><section className="wishlist-page kauppa-container"><div className="wishlist-heading"><div><p className="eyebrow">Saved with intention</p><h1>Your <em>wishlist.</em></h1></div><p>{items.length} {items.length === 1 ? "piece" : "pieces"}</p></div>{items.length === 0 ? <div className="wishlist-empty"><Heart size={26} /><h2>Nothing saved yet.</h2><p>Keep the pieces that speak to you close.</p><Link href="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link></div> : <div className="wishlist-grid">{items.map((item) => <article className="wishlist-card" key={item.slug}><Link href={`/product/${item.slug}`} className="wishlist-image"><Image src={item.image} alt={item.name} width={700} height={850} />{item.badge && <span>{item.badge}</span>}</Link><div className="wishlist-card-info"><div><p className="product-category">{item.category}</p><h2><Link href={`/product/${item.slug}`}>{item.name}</Link></h2><p className="product-condition">{item.condition} · {item.size}</p></div><div className="wishlist-card-bottom"><strong>{item.price}</strong><button aria-label={`Remove ${item.name} from wishlist`} onClick={() => removeItem(item.slug)}><Trash2 size={15} /></button></div></div></article>)}</div>}</section><KauppaFooter /></main>;
}
