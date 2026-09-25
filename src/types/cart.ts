// ============================================================
// Cart Types — client-side only, stored in localStorage
// ============================================================

import type { ProductWithImages } from "./database";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  condition: string;
  stock: number;
  weight: number | null; // grams, for shipping calculation
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

// Used when adding to cart from product page
export type AddToCartInput = Pick<CartItem, "productId"> & {
  product: ProductWithImages;
  quantity: number;
};
