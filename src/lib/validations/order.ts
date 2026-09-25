// ============================================================
// Order Validation Schema (Zod)
// Server-side validation for order creation and track order.
// ============================================================

import { z } from "zod";

/**
 * Track Order — customer verifies ownership by providing
 * order number + phone or email.
 */
export const trackOrderSchema = z.object({
  order_number: z
    .string()
    .regex(/^ALK-\d{8}-\d{4}$/, "Format nomor order tidak valid"),
  identifier: z
    .string()
    .min(5, "Masukkan nomor WhatsApp atau email")
    .max(255),
});

export type TrackOrderInput = z.infer<typeof trackOrderSchema>;

/**
 * Admin: Update order status
 */
export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid(),
  order_status: z.enum([
    "pending_payment",
    "payment_confirmed",
    "processing",
    "packed",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
  ]),
});

/**
 * Admin: Add tracking number
 */
export const addTrackingSchema = z.object({
  order_id: z.string().uuid(),
  tracking_number: z.string().min(5, "Nomor resi tidak valid"),
  courier: z.string().min(1, "Pilih kurir"),
  service: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddTrackingInput = z.infer<typeof addTrackingSchema>;
