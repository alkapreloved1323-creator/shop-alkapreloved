// ============================================================
// Mock Payment Service — used during development
// Replace with real implementation in Phase 14.
// ============================================================

import type { PaymentService } from "./payment.interface";
import type {
  CreatePaymentParams,
  PaymentResult,
  PaymentStatusResult,
} from "@/types/payment";

export class MockPaymentService implements PaymentService {
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    await this.mockDelay(500);

    const transactionId = `mock-txn-${Date.now()}`;

    console.log("[MockPaymentService] createPayment called:", {
      orderId: params.orderId,
      amount: params.amount,
    });

    return {
      transactionId,
      // In real implementation, this would be the payment provider's URL
      paymentUrl: `/checkout/payment-pending?txn=${transactionId}&order=${params.orderId}`,
      provider: "mock",
      status: "pending",
      raw: {
        mock: true,
        orderId: params.orderId,
        amount: params.amount,
        transactionId,
      },
    };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    await this.mockDelay(300);

    console.log("[MockPaymentService] getPaymentStatus called:", transactionId);

    // Mock: always returns pending in development
    return {
      transactionId,
      status: "pending",
      amount: 0,
      raw: {
        mock: true,
        transactionId,
      },
    };
  }

  async handleWebhook(
    payload: unknown,
    _signature?: string
  ): Promise<{ orderId: string; status: string }> {
    void _signature;
    console.log("[MockPaymentService] handleWebhook called:", payload);

    // In development, return a mock successful result
    return {
      orderId: "mock-order-id",
      status: "paid",
    };
  }

  async cancelPayment(transactionId: string): Promise<void> {
    await this.mockDelay(300);
    console.log("[MockPaymentService] cancelPayment called:", transactionId);
  }

  private mockDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
