// ============================================================
// Mock Shipping Service — used during development
// Replace with real implementation in Phase 13.
// ============================================================

import type { ShippingService } from "./shipping.interface";
import type {
  Province,
  City,
  District,
  ShippingCalculationParams,
  ShippingOption,
  TrackingResult,
} from "@/types/shipping";

// Sample Indonesian provinces for development
const MOCK_PROVINCES: Province[] = [
  { id: "11", name: "Aceh" },
  { id: "12", name: "Sumatera Utara" },
  { id: "13", name: "Sumatera Barat" },
  { id: "14", name: "Riau" },
  { id: "15", name: "Jambi" },
  { id: "16", name: "Sumatera Selatan" },
  { id: "17", name: "Bengkulu" },
  { id: "18", name: "Lampung" },
  { id: "19", name: "Kepulauan Bangka Belitung" },
  { id: "21", name: "Kepulauan Riau" },
  { id: "31", name: "DKI Jakarta" },
  { id: "32", name: "Jawa Barat" },
  { id: "33", name: "Jawa Tengah" },
  { id: "34", name: "DI Yogyakarta" },
  { id: "35", name: "Jawa Timur" },
  { id: "36", name: "Banten" },
  { id: "51", name: "Bali" },
  { id: "52", name: "Nusa Tenggara Barat" },
  { id: "53", name: "Nusa Tenggara Timur" },
  { id: "61", name: "Kalimantan Barat" },
  { id: "62", name: "Kalimantan Tengah" },
  { id: "63", name: "Kalimantan Selatan" },
  { id: "64", name: "Kalimantan Timur" },
  { id: "65", name: "Kalimantan Utara" },
  { id: "71", name: "Sulawesi Utara" },
  { id: "72", name: "Sulawesi Tengah" },
  { id: "73", name: "Sulawesi Selatan" },
  { id: "74", name: "Sulawesi Tenggara" },
  { id: "75", name: "Gorontalo" },
  { id: "76", name: "Sulawesi Barat" },
  { id: "81", name: "Maluku" },
  { id: "82", name: "Maluku Utara" },
  { id: "91", name: "Papua Barat" },
  { id: "94", name: "Papua" },
];

// Sample cities for each province (abbreviated for mock)
const MOCK_CITIES: Record<string, City[]> = {
  "31": [
    { id: "151", province_id: "31", name: "Jakarta Barat", type: "Kota" },
    { id: "152", province_id: "31", name: "Jakarta Pusat", type: "Kota" },
    { id: "153", province_id: "31", name: "Jakarta Selatan", type: "Kota" },
    { id: "154", province_id: "31", name: "Jakarta Timur", type: "Kota" },
    { id: "155", province_id: "31", name: "Jakarta Utara", type: "Kota" },
  ],
  "32": [
    { id: "23", province_id: "32", name: "Bandung", type: "Kota" },
    { id: "25", province_id: "32", name: "Bekasi", type: "Kota" },
    { id: "33", province_id: "32", name: "Bogor", type: "Kota" },
    { id: "254", province_id: "32", name: "Depok", type: "Kota" },
  ],
  "33": [
    { id: "95", province_id: "33", name: "Semarang", type: "Kota" },
    { id: "97", province_id: "33", name: "Solo", type: "Kota" },
  ],
  "34": [
    { id: "114", province_id: "34", name: "Yogyakarta", type: "Kota" },
    { id: "115", province_id: "34", name: "Sleman", type: "Kabupaten" },
    { id: "116", province_id: "34", name: "Bantul", type: "Kabupaten" },
    { id: "117", province_id: "34", name: "Gunung Kidul", type: "Kabupaten" },
    { id: "118", province_id: "34", name: "Kulon Progo", type: "Kabupaten" },
  ],
  "35": [
    { id: "131", province_id: "35", name: "Surabaya", type: "Kota" },
    { id: "132", province_id: "35", name: "Malang", type: "Kota" },
    { id: "133", province_id: "35", name: "Sidoarjo", type: "Kabupaten" },
  ],
  "51": [
    { id: "17", province_id: "51", name: "Badung", type: "Kabupaten" },
    { id: "18", province_id: "51", name: "Denpasar", type: "Kota" },
    { id: "19", province_id: "51", name: "Gianyar", type: "Kabupaten" },
  ],
};

// Generic districts for mock
const MOCK_DISTRICTS: Record<string, District[]> = {};

export class MockShippingService implements ShippingService {
  async getProvinces(): Promise<Province[]> {
    await this.mockDelay(300);
    return [...MOCK_PROVINCES];
  }

  async getCities(provinceId: string): Promise<City[]> {
    await this.mockDelay(300);
    return MOCK_CITIES[provinceId] ?? [
      { id: `${provinceId}-01`, province_id: provinceId, name: "Kota Utama", type: "Kota" },
      { id: `${provinceId}-02`, province_id: provinceId, name: "Kabupaten Utama", type: "Kabupaten" },
    ];
  }

  async getDistricts(cityId: string): Promise<District[]> {
    await this.mockDelay(300);
    return MOCK_DISTRICTS[cityId] ?? [
      { id: `${cityId}-d1`, city_id: cityId, name: "Kecamatan 1" },
      { id: `${cityId}-d2`, city_id: cityId, name: "Kecamatan 2" },
      { id: `${cityId}-d3`, city_id: cityId, name: "Kecamatan 3" },
    ];
  }

  async calculateShipping(
    params: ShippingCalculationParams
  ): Promise<ShippingOption[]> {
    await this.mockDelay(500);

    const { weight } = params;

    // Mock price calculation based on weight
    const basePrice = Math.ceil(weight / 1000) * 10000;

    return [
      {
        courier: "jne",
        courier_name: "JNE",
        service: "REG",
        service_description: "Layanan Reguler",
        price: basePrice + 5000,
        estimated_delivery: "2-3 hari",
      },
      {
        courier: "jne",
        courier_name: "JNE",
        service: "YES",
        service_description: "Yakin Esok Sampai",
        price: basePrice + 25000,
        estimated_delivery: "1 hari",
      },
      {
        courier: "tiki",
        courier_name: "TIKI",
        service: "REG",
        service_description: "Regular Service",
        price: basePrice + 4000,
        estimated_delivery: "2-4 hari",
      },
      {
        courier: "pos",
        courier_name: "POS Indonesia",
        service: "Pos Kilat Khusus",
        service_description: "Pos Kilat Khusus",
        price: basePrice + 2000,
        estimated_delivery: "3-5 hari",
      },
    ];
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    await this.mockDelay(500);

    return {
      tracking_number: trackingNumber,
      courier: "jne",
      status: "On Transit",
      events: [
        {
          date: new Date().toISOString(),
          description: "Paket dalam perjalanan ke kota tujuan",
          location: "Jakarta",
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          description: "Paket diterima di gudang pengiriman",
          location: "Jakarta",
        },
        {
          date: new Date(Date.now() - 172800000).toISOString(),
          description: "Paket dijemput dari pengirim",
          location: "Jakarta",
        },
      ],
    };
  }

  /** Simulate network latency */
  private mockDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
