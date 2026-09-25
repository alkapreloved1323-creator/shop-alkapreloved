// ============================================================
// Shipping Service — Factory / Entry Point
// Switch implementations here when the real API is provided.
// ============================================================

import type { ShippingService } from "./shipping.interface";
import { MockShippingService } from "./shipping.mock";
// When real API is ready, import it here:
// import { RealShippingService } from "./shipping.real";

/**
 * Returns the active shipping service implementation.
 * To switch to a real provider:
 * 1. Create a new class implementing ShippingService in shipping.real.ts
 * 2. Import it above
 * 3. Change the return statement below
 */
export function getShippingService(): ShippingService {
  // Phase 13: swap MockShippingService with the real implementation
  return new MockShippingService();
}

// Re-export the interface for convenience
export type { ShippingService } from "./shipping.interface";
