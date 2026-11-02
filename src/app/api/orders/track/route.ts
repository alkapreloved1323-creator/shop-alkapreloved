import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { trackOrderSchema } from "@/lib/validations/order";

export async function POST(request: NextRequest) {
  try {
    const parsed = trackOrderSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tracking tidak valid" }, { status: 400 });
    const { order_number, identifier } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data: order, error } = await supabase.from("orders").select("order_number, customer_name, email, phone, total, payment_status, order_status, shipping_provider, shipping_service, tracking_number, created_at, updated_at, shipments(courier, service, tracking_number, status, shipped_at, delivered_at)").eq("order_number", order_number).or(`email.eq.${identifier},phone.eq.${identifier}`).maybeSingle();
    if (error || !order) return NextResponse.json({ error: "Pesanan tidak ditemukan. Periksa nomor order dan email/WhatsApp Anda." }, { status: 404 });
    return NextResponse.json({ order });
  } catch { return NextResponse.json({ error: "Permintaan tracking tidak dapat diproses." }, { status: 500 }); }
}

export const dynamic = "force-dynamic";