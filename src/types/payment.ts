// ============================================================
// Payment Types — used by PaymentService interface
// ============================================================

import type { PaymentStatus } from "./database";

export interface CreatePaymentParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Additional metadata for payment provider
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  transactionId: string;
  paymentUrl?: string;   // redirect URL for hosted payment
  snapToken?: string;    // for embedded payment (e.g. Midtrans Snap)
  qrCode?: string;       // for QRIS payments
  vaNumber?: string;     // for virtual account
  expiresAt?: string;    // ISO date string
  provider: string;
  status: PaymentStatus;
  raw: Record<string, unknown>;
}

export interface PaymentStatusResult {
  transactionId: string;
  status: PaymentStatus;
  paymentMethod?: string;
  amount: number;
  paidAt?: string;
  raw: Record<string, unknown>;
}
