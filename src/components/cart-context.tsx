"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  size: string;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "alkapreloved-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const hydrateCart = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved) as CartItem[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(hydrateCart);
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, hydrated]);
  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.priceValue * item.quantity, 0),
    addItem: (item, quantity = 1) => setItems((current) => { const existing = current.find((entry) => entry.slug === item.slug); if (existing) return current.map((entry) => entry.slug === item.slug ? { ...entry, quantity: Math.min(entry.stock, entry.quantity + quantity) } : entry); return [...current, { ...item, quantity: Math.min(item.stock, quantity) }]; }),
    updateQuantity: (slug, quantity) => setItems((current) => current.map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item)),
    removeItem: (slug) => setItems((current) => current.filter((item) => item.slug !== slug)),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context; }
