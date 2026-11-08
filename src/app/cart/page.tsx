"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { KauppaFooter, KauppaNavbar } from "@/components/storefront";
import { useCart } from "@/components/cart-context";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const formatPrice = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [outOfStock, setOutOfStock] = useState<string[]>([]);
  useEffect(() => {
    if (!items.length) { setOutOfStock([]); return; }
    createSupabaseBrowserClient().from("products").select("slug,stock,status").in("slug", items.map((item) => item.slug)).then(({ data }) => {
      const available = new Map((data ?? []).map((product) => [product.slug, product]));
      setOutOfStock(items.filter((item) => { const product = available.get(item.slug); return !product || product.status !== "active" || Number(product.stock) < item.quantity; }).map((item) => item.slug));
    });
  }, [items]);
  const hasUnavailable = outOfStock.length > 0;
  return <main className="kauppa-page"><KauppaNavbar /><section className="cart-page kauppa-container"><div className="cart-heading"><div><p className="eyebrow">Your selection</p><h1>Your <em>bag.</em></h1></div><p>{items.length} {items.length === 1 ? "piece" : "pieces"}</p></div>{items.length === 0 ? <div className="cart-empty"><p className="eyebrow">Nothing saved yet</p><h2>A little room for something lovely.</h2><p>Discover considered pieces chosen for their next chapter.</p><Link href="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.slug}><Image src={item.image} alt={item.name} width={170} height={205} /><div className="cart-item-info"><div><p className="product-category">{item.size}</p><h2>{item.name}</h2><p className="product-condition">Ready to ship · {item.stock} available</p></div><div className="cart-item-bottom"><div className="quantity-control"><button aria-label={`Decrease ${item.name}`} onClick={() => updateQuantity(item.slug, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.name}`} onClick={() => updateQuantity(item.slug, item.quantity + 1)}><Plus size={13} /></button></div><strong>{formatPrice(item.priceValue * item.quantity)}</strong><button className="cart-remove" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.slug)}><Trash2 size={16} /></button></div></div></article>)}</div><aside className="cart-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Shipping</span><span>Calculated at checkout</span></div><hr /><div className="cart-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>{hasUnavailable && <p className="cart-note cart-stock-warning">Some items are sold out or no longer available. Remove them before checkout.</p>}<Link href={hasUnavailable ? "#" : "/checkout"} aria-disabled={hasUnavailable} onClick={(event) => { if (hasUnavailable) event.preventDefault(); }} className={`button button-dark cart-checkout${hasUnavailable ? " is-disabled" : ""}`}>Continue to checkout <ArrowRight size={16} /></Link><p className="cart-note">Shipping options and payment details will be confirmed at checkout.</p></aside></div>}</section><KauppaFooter /></main>;
}

