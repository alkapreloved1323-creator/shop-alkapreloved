// ============================================================
// Payment Service — Factory / Entry Point
// Switch implementations here when the real gateway is ready.
// ============================================================

import type { PaymentService } from "./payment.interface";
import { MockPaymentService } from "./payment.mock";
import { SumopodPaymentService } from "./payment.sumopod";

export function getPaymentService(): PaymentService {
  return process.env.PAYMENT_PROVIDER === "sumopod" ? new SumopodPaymentService() : new MockPaymentService();
}

// Re-export the interface for convenience
export type { PaymentService } from "./payment.interface";
