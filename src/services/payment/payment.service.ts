// ============================================================
// Payment Service — Factory / Entry Point
// Switch implementations here when the real gateway is ready.
// ============================================================

import type { PaymentService } from "./payment.interface";
import { MockPaymentService } from "./payment.mock";
// When real gateway is ready, import it here:
// import { MidtransPaymentService } from "./payment.midtrans";

/**
 * Returns the active payment service implementation.
 * To switch to a real provider:
 * 1. Create a new class implementing PaymentService (e.g. payment.midtrans.ts)
 * 2. Import it above
 * 3. Change the return statement below
 *
 * IMPORTANT: This function must only be called server-side.
 * Payment credentials must never reach the browser.
 */
export function getPaymentService(): PaymentService {
  // Phase 14: swap MockPaymentService with the real implementation
  return new MockPaymentService();
}

// Re-export the interface for convenience
export type { PaymentService } from "./payment.interface";
