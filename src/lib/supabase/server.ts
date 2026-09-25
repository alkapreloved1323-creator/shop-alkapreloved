// ============================================================
// Supabase Server Client (SSR)
// Uses the anon key with cookie-based session for Server Components.
// Respects Row Level Security — behaves as the authenticated user.
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components and Server Actions.
 * Reads and writes cookies to maintain user session (admin auth).
 * Uses anon key + RLS — does NOT have elevated privileges.
 *
 * Usage in Server Components:
 *   const supabase = await createSupabaseServerClient();
 *   const { data } = await supabase.from("products").select();
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
