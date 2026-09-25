// ============================================================
// Checkout Validation Schema (Zod)
// Used on both client (form UX) and server (final validation).
// Server validation is authoritative — client is for UX only.
// ============================================================

import { z } from "zod";

export const customerSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .trim(),

  phone: z
    .string()
    .min(10, "Nomor WhatsApp minimal 10 digit")
    .max(15, "Nomor WhatsApp maksimal 15 digit")
    .regex(/^(08|\+628|628)[0-9]{7,12}$/, "Format nomor WhatsApp tidak valid"),

  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email terlalu panjang")
    .toLowerCase()
    .trim(),
});

export const addressSchema = z.object({
  province: z.string().min(1, "Pilih provinsi"),
  city: z.string().min(1, "Pilih kota/kabupaten"),
  district: z.string().min(1, "Pilih kecamatan"),
  postal_code: z
    .string()
    .length(5, "Kode pos harus 5 digit")
    .regex(/^[0-9]+$/, "Kode pos hanya angka"),
  address: z
    .string()
    .min(10, "Alamat minimal 10 karakter")
    .max(500, "Alamat maksimal 500 karakter")
    .trim(),
});

export const shippingSelectionSchema = z.object({
  courier: z.string().min(1, "Pilih kurir"),
  service: z.string().min(1, "Pilih layanan pengiriman"),
  shipping_cost: z.number().min(0, "Biaya kirim tidak valid"),
});

/**
 * Full checkout form schema — combines all sub-schemas.
 */
export const checkoutFormSchema = customerSchema
  .merge(addressSchema)
  .merge(shippingSelectionSchema);

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type CustomerData = z.infer<typeof customerSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type ShippingSelectionData = z.infer<typeof shippingSelectionSchema>;
