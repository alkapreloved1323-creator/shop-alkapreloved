import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) return NextResponse.json({ error: "Cloudinary belum dikonfigurasi." }, { status: 503 });

  const body = await request.json().catch(() => null) as { publicId?: string; resourceType?: "image" | "video" } | null;
  if (!body?.publicId || !/^(image|video)$/.test(body.resourceType ?? "")) return NextResponse.json({ error: "Media tidak valid." }, { status: 400 });

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`public_id=${body.publicId}&timestamp=${timestamp}${apiSecret}`).digest("hex");
  const endpoint = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${body.resourceType}/destroy`;
  const form = new URLSearchParams({ public_id: body.publicId, timestamp: String(timestamp), api_key: apiKey, signature });
  const response = await fetch(endpoint, { method: "POST", body: form });
  if (!response.ok) return NextResponse.json({ error: "Cloudinary gagal menghapus media." }, { status: 502 });
  return NextResponse.json(await response.json());
}
