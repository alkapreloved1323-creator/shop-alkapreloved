import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminRole = "superadmin" | "admin" | "staff";
const SUPERADMIN_EMAIL = "alkapreloved1323@gmail.com";

function isSuperadmin(user: { email?: string | null; app_metadata?: Record<string, unknown> }) {
  return user.email?.toLowerCase() === SUPERADMIN_EMAIL || user.app_metadata?.role === "superadmin";
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (!isSuperadmin(user) && user.app_metadata?.role !== "admin")) return null;
  return user;
}

function unauthorized() {
  return NextResponse.json({ error: "Hanya admin yang dapat mengatur akses pengguna." }, { status: 403 });
}

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const users = data.users
    .filter((user) => isSuperadmin(user) || user.app_metadata?.role === "admin" || user.app_metadata?.role === "staff")
    .map((user) => ({ id: user.id, email: user.email ?? "", role: isSuperadmin(user) ? "superadmin" : user.app_metadata?.role as AdminRole, createdAt: user.created_at, lastSignInAt: user.last_sign_in_at }));
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorized();
  const body = await request.json().catch(() => null) as { email?: string; password?: string; role?: AdminRole } | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const role = body?.role;
  if (!email || !password || !role || !["admin", "staff"].includes(role) || password.length < 8) {
    return NextResponse.json({ error: "Email, role, dan password minimal 8 karakter wajib diisi." }, { status: 400 });
  }
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role } });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: { id: data.user.id, email: data.user.email, role } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) return unauthorized();
  const body = await request.json().catch(() => null) as { id?: string; role?: AdminRole } | null;
  if (!body?.id || !body.role || !["admin", "staff"].includes(body.role)) return NextResponse.json({ error: "User dan role wajib diisi." }, { status: 400 });
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: targetData } = await supabaseAdmin.auth.admin.getUserById(body.id);
  if (targetData.user && isSuperadmin(targetData.user)) return NextResponse.json({ error: "Superadmin tidak dapat diubah." }, { status: 403 });
  if (body.id === currentUser.id && body.role !== "admin") return NextResponse.json({ error: "Anda tidak dapat menghapus akses admin sendiri." }, { status: 400 });
  const { error } = await supabaseAdmin.auth.admin.updateUserById(body.id, { app_metadata: { role: body.role } });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) return unauthorized();
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id || body.id === currentUser.id) return NextResponse.json({ error: "User tidak valid atau tidak dapat menghapus akses sendiri." }, { status: 400 });
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: targetData } = await supabaseAdmin.auth.admin.getUserById(body.id);
  if (targetData.user && isSuperadmin(targetData.user)) return NextResponse.json({ error: "Superadmin tidak dapat dihapus." }, { status: 403 });
  const { error } = await supabaseAdmin.auth.admin.deleteUser(body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
