import { NextRequest, NextResponse } from "next/server";

const API_URL = `${process.env.COURIER_API_URL ?? "https://use.api.co.id"}/courier/v2/rates`;

export async function GET(request: NextRequest) {
  const incoming = request.nextUrl.searchParams;
  const origin = incoming.get("origin_district_code")?.trim();
  const destination = incoming.get("destination_district_code")?.trim();
  const weight = Number(incoming.get("weight") ?? "0");
  if (!origin || !destination || !Number.isFinite(weight) || weight <= 0) return NextResponse.json({ is_success: false, message: "Origin, destination, and a positive weight are required." }, { status: 400 });
  const apiKey = process.env.COURIER_API_KEY;
  if (!apiKey) return NextResponse.json({ is_success: false, message: "Courier API is not configured." }, { status: 503 });
  const query = new URLSearchParams({ origin_district_code: origin, destination_district_code: destination, weight: String(weight) });
  for (const name of ["item_value", "insurance", "length", "width", "height"]) { const value = incoming.get(name); if (value) query.set(name, value); }
  try {
    const response = await fetch(`${API_URL}?${query.toString()}`, { headers: { "x-api-co-id": apiKey }, cache: "no-store" });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch { return NextResponse.json({ is_success: false, message: "Unable to reach courier service." }, { status: 502 }); }
}