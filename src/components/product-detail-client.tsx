"use client";

import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { DetailProduct } from "@/app/product/[slug]/page";

export function ProductDetailClient({ product }: { product: DetailProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const maxQuantity = Math.max(1, Math.min(product.stock, 5));
  const image = product.images[activeImage] ?? product.images[0];

  return <>
    <div className="detail-breadcrumb"><Link href="/shop">Shop</Link><span>/</span><span>{product.category}</span><span>/</span><strong>{product.name}</strong></div>
    <section className="detail-layout">
      <div className="detail-gallery"><div className="detail-main-image"><img src={image} alt={`${product.name} preview`} />{product.stock === 0 && <span className="sold-overlay">Sold</span>}<button className="gallery-arrow gallery-prev" aria-label="Previous image" onClick={() => setActiveImage((activeImage - 1 + product.images.length) % product.images.length)}><ChevronLeft size={18} /></button><button className="gallery-arrow gallery-next" aria-label="Next image" onClick={() => setActiveImage((activeImage + 1) % product.images.length)}><ChevronRight size={18} /></button></div><div className="detail-thumbnails">{product.images.map((item, index) => <button key={item} className={index === activeImage ? "is-active" : ""} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`}><img src={item} alt="" /></button>)}</div></div>
      <div className="detail-info"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="detail-price">{product.price}</p><div className="detail-rule" /><div className="detail-condition"><span>Condition</span><strong>{product.condition}</strong></div><p className="detail-description">{product.description}</p><div className="detail-facts"><div><span>Size</span><strong>{product.size}</strong></div><div><span>Weight</span><strong>{product.weight ? `${product.weight}g` : "—"}</strong></div><div><span>Availability</span><strong className={product.stock > 0 ? "in-stock" : "sold-text"}>{product.stock > 0 ? `${product.stock} available` : "Sold out"}</strong></div></div>{product.stock > 0 ? <div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}><Plus size={14} /></button></div><button className="button button-dark add-cart-button"><ShoppingBag size={16} /> Add to bag</button><button className={`detail-heart ${liked ? "is-liked" : ""}`} aria-label="Add to wishlist" onClick={() => setLiked(!liked)}><Heart size={18} fill={liked ? "currentColor" : "none"} /></button></div> : <button className="button sold-button" disabled>Currently unavailable</button>}<div className="detail-note"><Check size={15} /><span>Every item is inspected and photographed with care.<br />Ships within 1–2 business days.</span></div></div>
    </section>
  </>;
}
