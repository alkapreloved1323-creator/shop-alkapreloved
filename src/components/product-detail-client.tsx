"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { DetailProduct } from "@/app/product/[slug]/page";

import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";

export function ProductDetailClient({ product }: { product: DetailProduct }) {
  const { addItem } = useCart();
  const { isSaved, toggleItem } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToBag, setAddedToBag] = useState(false);
  const maxQuantity = Math.max(1, Math.min(product.stock, 5));
  const activeMedia = product.media[activeImage] ?? product.media[0];
  const image = activeMedia?.url ?? "";
  const imageMedia = product.media.filter((item) => item.kind === "image");

  const handleAddToBag = () => {
    addItem({ slug: product.slug, name: product.name, price: product.price, priceValue: Number(product.price.replace(/[^0-9]/g, "")), image, size: product.size, stock: product.stock }, quantity);
    setAddedToBag(true);
  };

  return <>
    <div className="detail-breadcrumb"><Link href="/shop">Katalog</Link><span>/</span><span>{product.category}</span><span>/</span><strong>{product.name}</strong></div>
    <section className="detail-layout">
      <div className="detail-gallery"><div className="detail-main-image">{activeMedia?.kind === "video" ? <video src={activeMedia.url} controls playsInline preload="metadata" /> : <Image src={image} alt={`${product.name} preview`} width={900} height={1020} />}{product.stock === 0 && <span className="sold-overlay">Sold</span>}<button className="gallery-arrow gallery-prev" aria-label="Previous media" onClick={() => setActiveImage((activeImage - 1 + product.media.length) % product.media.length)}><ChevronLeft size={18} /></button><button className="gallery-arrow gallery-next" aria-label="Next media" onClick={() => setActiveImage((activeImage + 1) % product.media.length)}><ChevronRight size={18} /></button></div><div className="detail-thumbnails">{product.media.map((item, index) => <button key={`${item.url}-${index}`} className={index === activeImage ? "is-active" : ""} onClick={() => setActiveImage(index)} aria-label={`View media ${index + 1}`}>{item.kind === "video" ? <video src={item.url} muted preload="metadata" /> : <Image src={item.url} alt="" width={76} height={88} />}</button>)}</div></div>
      <div className="detail-info"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="detail-price">{product.price}</p><div className="detail-rule" /><div className="detail-condition"><span>Condition</span><strong>{product.condition}</strong></div><p className="detail-description">{product.description}</p><div className="detail-facts"><div><span>Size</span><strong>{product.size}</strong></div><div><span>Weight</span><strong>{product.weight ? `${product.weight}g` : "—"}</strong></div><div><span>Availability</span><strong className={product.stock > 0 ? "in-stock" : "sold-text"}>{product.stock > 0 ? `${product.stock} available` : "Sold out"}</strong></div></div>{product.stock > 0 ? <div className="detail-actions"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}><Plus size={14} /></button></div><button className={`button ${addedToBag ? "button-added" : "button-dark"} add-cart-button`} onClick={handleAddToBag}>{addedToBag ? <><Check size={16} /> Added to bag</> : <><ShoppingBag size={16} /> Add to bag</>}</button><button className={`detail-heart ${isSaved(product.slug) ? "is-liked" : ""}`} aria-label="Toggle wishlist" onClick={() => toggleItem({ slug: product.slug, name: product.name, category: product.category, price: product.price, priceValue: Number(product.price.replace(/[^0-9]/g, "")), condition: product.condition, size: product.size, image })}><Heart size={18} fill={isSaved(product.slug) ? "currentColor" : "none"} /></button></div> : <button className="button sold-button" disabled>Currently unavailable</button>}{addedToBag && <Link href="/cart" className="added-bag-link">View your bag <ChevronRight size={14} /></Link>}<div className="detail-note"><Check size={15} /><span>Every item is inspected and photographed with care.<br />Ships within 1–2 business days.</span></div></div>
    </section>
  </>;
}
