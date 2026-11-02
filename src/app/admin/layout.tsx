// Phase 12 — Admin Dashboard
// This layout protects all /admin routes with authentication.
// Middleware also guards these routes server-side.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Double-check auth (middleware handles redirect, this is a safety net)
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Admin sidebar and layout will be added in Phase 12 */}
      <div className="flex">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}