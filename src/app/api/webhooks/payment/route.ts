// ============================================================
// Payment Webhook API Route
// POST /api/webhooks/payment
//
// Security requirements:
// 1. Validate provider signature BEFORE processing
// 2. Verify transaction exists in database
// 3. Check for duplicate (idempotency)
// 4. Update payment status
// 5. Update order status
// 6. Update inventory (restore stock if payment fails/cancels)
// 7. Log webhook event
//
// ⚠️  Never trust the webhook body alone — verify with signature.
// ⚠️  Must be idempotent — safe to call multiple times.
// ============================================================

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentService } from "@/services/payment/payment.service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function verifyWebhook(rawBody: string, request: NextRequest) {
  const token = process.env.PAYMENT_WEBHOOK_TOKEN;
  const receivedToken = request.headers.get("x-webhook-token");
  if (token && receivedToken === token) return true;
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!secret || !id || !timestamp || !signature) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = createHmac("sha256", Buffer.from(secret.replace(/^whsec_/, ""), "base64")).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  return signature.split(" ").some((entry) => { const candidate = entry.split(",")[1]; if (!candidate) return false; const a = Buffer.from(candidate); const b = Buffer.from(expected); return a.length === b.length && timingSafeEqual(a, b); });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!verifyWebhook(rawBody, request)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // ─── Step 1: Validate signature & process ────────────────
    const paymentService = getPaymentService();

    let webhookResult: { orderId: string; status: string };
    try {
      webhookResult = await paymentService.handleWebhook(payload);
    } catch (err) {
      console.error("[Webhook] Payment signature validation failed:", err);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const { orderId, status } = webhookResult;

    // ─── Step 2–7: Update database ───────────────────────────
    const supabase = createSupabaseAdminClient();

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, payment_status, order_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[Webhook] Order not found:", orderId);
      // Return 200 to prevent retries for unknown orders
      return NextResponse.json({ received: true });
    }

    // ─── Idempotency check ────────────────────────────────────
    // If the payment is already in the same status, skip processing
    if (status === "paid" && order.payment_status === "paid") {
      console.log("[Webhook] Duplicate webhook for already-paid order:", orderId);
      return NextResponse.json({ received: true });
    }

    // ─── Update payment record ────────────────────────────────
    await supabase
      .from("payments")
      .update({
        status,
        paid_at: status === "paid" ? new Date().toISOString() : null,
        raw_response: payload as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    // ─── Update order status ──────────────────────────────────
    let newOrderStatus = order.order_status;
    const newPaymentStatus = status;

    if (status === "paid") {
      newOrderStatus = "payment_confirmed";
    } else if (status === "cancelled" || status === "expired" || status === "failed") {
      newOrderStatus = "cancelled";
    }

    await supabase
      .from("orders")
      .update({
        payment_status: newPaymentStatus,
        order_status: newOrderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // ─── Restore stock if payment failed/cancelled/expired ───
    if (["cancelled", "expired", "failed"].includes(status)) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (orderItems) {
        for (const item of orderItems) {
          // Atomic increment using Postgres function
          await supabase.rpc("increment_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }
      }
    }

    console.log(`[Webhook] Processed order ${orderId} → status: ${status}`);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook] Unexpected error:", err);
    // Return 500 so the payment provider retries
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Disable body parsing — we need the raw body for signature verification
export const dynamic = "force-dynamic";