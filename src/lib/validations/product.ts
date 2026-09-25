// ============================================================
// Product Validation Schema (Zod)
// Used by admin when creating or editing products.
// ============================================================

import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "Nama produk minimal 3 karakter")
    .max(200, "Nama produk maksimal 200 karakter")
    .trim(),

  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung")
    .optional(),

  category_id: z.string().uuid("Pilih kategori yang valid").nullable(),

  description: z.string().max(5000).nullable().optional(),

  price: z
    .number()
    .int("Harga harus berupa angka bulat")
    .min(1000, "Harga minimal Rp 1.000")
    .max(100_000_000, "Harga maksimal Rp 100.000.000"),

  condition: z.enum(["like_new", "very_good", "good", "fair", "poor"], {
    error: () => "Pilih kondisi produk yang valid",
  }),

  stock: z
    .number()
    .int("Stok harus berupa angka bulat")
    .min(0, "Stok tidak boleh negatif")
    .max(999),

  weight: z
    .number()
    .int("Berat harus berupa angka bulat (gram)")
    .min(1, "Berat minimal 1 gram")
    .max(30000, "Berat maksimal 30.000 gram (30 kg)")
    .nullable()
    .optional(),

  length: z.number().min(0).max(999).nullable().optional(),
  width: z.number().min(0).max(999).nullable().optional(),
  height: z.number().min(0).max(999).nullable().optional(),

  status: z.enum(["draft", "active", "sold", "archived"]).default("draft"),
});

export type ProductFormData = z.infer<typeof productSchema>;
