import { ImageResponse } from "next/og";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "AlkaPreloved product preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const mediaPreview = (url: string) => /\.(mp4|webm|mov)(?:\?|$)/i.test(url)
  ? url.replace("/video/upload/", "/video/upload/so_0/").replace(/\.(mp4|webm|mov)(?:\?.*)?$/i, ".jpg")
  : url;

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("name,price,condition,product_images(public_url,sort_order)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  const media = [...(data?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const image = media[0]?.public_url ? mediaPreview(media[0].public_url) : undefined;
  const price = data?.price == null ? "" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(data.price));
  const name = data?.name ?? "Koleksi Preloved";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f8fafc", color: "#0f172a", fontFamily: "Arial", padding: 42 }}>
        <div style={{ width: "52%", height: "100%", display: "flex", overflow: "hidden", borderRadius: 28, background: "#e0e7ff" }}>
          {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", fontSize: 42, color: "#4f46e5" }}>AlkaPreloved</div>}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px" }}>
          <div style={{ display: "flex", color: "#4f46e5", fontSize: 28, fontWeight: 700, marginBottom: 28 }}>alkapreloved</div>
          <div style={{ display: "flex", color: "#64748b", fontSize: 20, textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>Preloved fashion</div>
          <div style={{ display: "flex", fontSize: 48, lineHeight: 1.08, fontWeight: 700, marginBottom: 22 }}>{name}</div>
          <div style={{ display: "flex", color: "#4f46e5", fontSize: 34, fontWeight: 700 }}>{price}</div>
          <div style={{ display: "flex", color: "#64748b", fontSize: 20, marginTop: 28 }}>www.alkapreloved.my.id</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
