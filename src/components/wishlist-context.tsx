"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/components/storefront";

export type WishlistItem = Pick<Product, "name" | "slug" | "category" | "price" | "priceValue" | "condition" | "size" | "image" | "badge">;
type WishlistContextValue = { items: WishlistItem[]; itemCount: number; isSaved: (slug: string) => boolean; toggleItem: (item: WishlistItem) => void; removeItem: (slug: string) => void };
const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "alkapreloved-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => { if (typeof window === "undefined") return []; try { const saved = window.localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as WishlistItem[] : []; } catch { window.localStorage.removeItem(STORAGE_KEY); return []; } });
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  const value = useMemo(() => ({ items, itemCount: items.length, isSaved: (slug: string) => items.some((item) => item.slug === slug), toggleItem: (item: WishlistItem) => setItems((current) => current.some((entry) => entry.slug === item.slug) ? current.filter((entry) => entry.slug !== item.slug) : [...current, item]), removeItem: (slug: string) => setItems((current) => current.filter((item) => item.slug !== slug)) }), [items]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used inside WishlistProvider"); return context; }
