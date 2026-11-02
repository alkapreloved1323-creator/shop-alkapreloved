import type { PaymentService } from "./payment.interface";
import type { CreatePaymentParams, PaymentResult, PaymentStatusResult } from "@/types/payment";
import type { PaymentStatus } from "@/types/database";

const API_URL = process.env.PAYMENT_API_URL || "https://api-pay.sumopod.com";
const API_KEY = process.env.PAYMENT_API_KEY;

function mapStatus(status: string): PaymentStatus {
  if (status === "completed") return "paid";
  if (status === "failed") return "failed";
  if (status === "expired") return "expired";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

export class SumopodPaymentService implements PaymentService {
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    if (!API_KEY) throw new Error("PAYMENT_API_KEY is not configured");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${API_URL}/api/v1/payments`, { method: "POST", headers: { "Content-Type": "application/json", "X-Api-Key": API_KEY }, body: JSON.stringify({ order_id: params.orderNumber, amount: params.amount, currency: "IDR", expires_in_hours: 24, success_return_url: `${siteUrl}/checkout/success`, cancel_return_url: `${siteUrl}/checkout/cancel`, payment_method_type_code: "QRIS" }), cache: "no-store" });
    const raw = await response.json() as Record<string, unknown>;
    if (!response.ok) throw new Error(typeof raw.message === "string" ? raw.message : "Sumopod payment creation failed");
    return { transactionId: String(raw.payment_id), paymentUrl: String(raw.payment_link_url), expiresAt: typeof raw.expires_at === "string" ? raw.expires_at : undefined, provider: "sumopod", status: mapStatus(String(raw.status)), raw };
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> { return { transactionId, status: "pending", amount: 0, raw: { provider: "sumopod" } }; }
  async handleWebhook(payload: unknown): Promise<{ orderId: string; status: string }> { const event = payload as { event_type?: string; data?: { order_id?: string; status?: string } }; if (!event.data?.order_id) throw new Error("Invalid Sumopod webhook payload"); return { orderId: event.data.order_id, status: mapStatus(event.data.status || event.event_type?.replace("payment.", "") || "pending") }; }
  async cancelPayment(transactionId: string): Promise<void> { void transactionId; }
}
