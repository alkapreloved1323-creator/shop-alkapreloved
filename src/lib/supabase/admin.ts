// ============================================================
// Supabase Admin Client (Service Role)
// ⚠️  SERVER-SIDE ONLY — NEVER import in Client Components.
// Bypasses Row Level Security — use only when RLS would block
// legitimate server-side operations (e.g. order creation,
// inventory updates, webhook processing).
// ============================================================

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client with the service role key.
 *
 * ⚠️  IMPORTANT RULES:
 * - Only call this in Server Actions, API Routes, and server-side utilities.
 * - The SUPABASE_SERVICE_ROLE_KEY must NEVER be a NEXT_PUBLIC_ variable.
 * - Never pass this client or its data access to the browser.
 * - This client bypasses all RLS policies — double-check all queries.
 *
 * Usage in Server Actions / API Routes:
 *   const supabase = createSupabaseAdminClient();
 *   await supabase.from("orders").insert(...);
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
