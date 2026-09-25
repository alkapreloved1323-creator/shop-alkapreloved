// ============================================================
// Supabase Browser Client
// Uses the public anon key — safe for client-side use.
// Only read public data and auth operations for the current user.
// ============================================================

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components.
 * Uses only NEXT_PUBLIC_ variables — never service role key.
 *
 * Usage in Client Components:
 *   const supabase = createSupabaseBrowserClient();
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
