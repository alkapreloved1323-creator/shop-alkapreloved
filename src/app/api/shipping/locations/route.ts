import { NextRequest, NextResponse } from "next/server";
const BASE_URL = `${process.env.COURIER_API_URL ?? "https://use.api.co.id"}/courier/v1/locations`;
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const value = request.nextUrl.searchParams.get("value");
  const paths: Record<string, string> = { provinces: "/provinces", cities: `/cities?province=${encodeURIComponent(value ?? "")}`, districts: `/districts?city=${encodeURIComponent(value ?? "")}` };
  if (!type || !paths[type]) return NextResponse.json({ is_success: false, message: "Invalid location type." }, { status: 400 });
  const apiKey = process.env.COURIER_API_KEY;
  if (!apiKey) return NextResponse.json({ is_success: false, message: "Courier API is not configured." }, { status: 503 });
  try { const response = await fetch(`${BASE_URL}${paths[type]}`, { headers: { "x-api-co-id": apiKey }, cache: "no-store" }); return NextResponse.json(await response.json(), { status: response.status }); } catch { return NextResponse.json({ is_success: false, message: "Unable to reach location service." }, { status: 502 }); }
}