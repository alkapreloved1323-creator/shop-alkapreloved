// ============================================================
// Payment Service Interface
// All payment providers must implement this interface.
// When a real gateway is provided, create a new implementation
// and swap it in payment.service.ts.
// ============================================================

import type {
  CreatePaymentParams,
  PaymentResult,
  PaymentStatusResult,
} from "@/types/payment";

export interface PaymentService {
  /**
   * Create a new payment transaction.
   * Returns a PaymentResult containing redirect URL or token.
   */
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

  /**
   * Get the current status of a payment transaction.
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;

  /**
   * Process an incoming webhook payload from the payment provider.
   * Must validate the signature before processing.
   * Must be idempotent — safe to call multiple times with the same payload.
   *
   * @param payload - Raw webhook body
   * @param signature - Signature header from payment provider (if applicable)
   */
  handleWebhook(payload: unknown, signature?: string): Promise<{
    orderId: string;
    status: string;
  }>;

  /**
   * Cancel / void a payment transaction.
   */
  cancelPayment(transactionId: string): Promise<void>;
}
