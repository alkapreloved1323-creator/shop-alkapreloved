// ============================================================
// Shipping Types — used by ShippingService interface
// ============================================================

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  province_id: string;
  name: string;
  type: "Kota" | "Kabupaten" | string;
  postal_code?: string;
}

export interface District {
  id: string;
  city_id: string;
  name: string;
}

export interface ShippingCalculationParams {
  origin_city_id: string;
  destination_city_id: string;
  weight: number; // total weight in grams
}

export interface ShippingOption {
  courier: string;
  courier_name: string;
  service: string;
  service_description: string;
  price: number;
  estimated_delivery: string; // e.g. "1-2 hari"
}

export interface TrackingEvent {
  date: string;
  description: string;
  location?: string;
}

export interface TrackingResult {
  tracking_number: string;
  courier: string;
  status: string;
  events: TrackingEvent[];
}
