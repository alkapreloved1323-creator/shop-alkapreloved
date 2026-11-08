import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const sourceValues = ["direct", "instagram", "facebook", "google", "tiktok", "referral", "whatsapp", "marketplace", "carousell", "other"] as const;
const schema = z.object({
  full_name: z.string().min(2).max(120),
  phone: z.string().max(30).optional(),
  source: z.enum(sourceValues).default("direct"),
  source_detail: z.string().max(160).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(160).optional(),
  utm_content: z.string().max(160).optional(),
  referral_code: z.string().max(80).optional(),
  marketing_consent: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Data customer tidak valid." }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const customer = parsed.data;
    const phone = customer.phone?.trim();
    if (!phone) return NextResponse.json({ error: "Nomor WhatsApp customer wajib diisi." }, { status: 400 });
    const values = {
      ...customer,
      phone,
      consented_at: customer.marketing_consent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    const existing = await supabase.from("customers").select("id").eq("phone", phone).maybeSingle();
    if (existing.error) throw existing.error;
    const result = existing.data
      ? await supabase.from("customers").update(values).eq("id", existing.data.id)
      : await supabase.from("customers").insert(values);
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch {
    // CRM capture must not prevent a customer from completing checkout.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
