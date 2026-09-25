// ============================================================
// Shipping Service Interface
// All shipping providers must implement this interface.
// When a real API is provided, create a new implementation
// and swap it in shipping.service.ts.
// ============================================================

import type {
  Province,
  City,
  District,
  ShippingCalculationParams,
  ShippingOption,
  TrackingResult,
} from "@/types/shipping";

export interface ShippingService {
  /**
   * Get list of provinces for address form.
   */
  getProvinces(): Promise<Province[]>;

  /**
   * Get cities/regencies in a province.
   */
  getCities(provinceId: string): Promise<City[]>;

  /**
   * Get districts/sub-districts in a city.
   */
  getDistricts(cityId: string): Promise<District[]>;

  /**
   * Calculate available shipping options.
   * Weight is in grams (sum of product weights × quantities).
   */
  calculateShipping(
    params: ShippingCalculationParams
  ): Promise<ShippingOption[]>;

  /**
   * Track a shipment by tracking number.
   */
  trackShipment(trackingNumber: string): Promise<TrackingResult>;
}
