// ============================================================
// Next.js Middleware
// Handles:
// 1. Supabase session refresh on every request
// 2. Admin route protection
// ============================================================

import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Public pages can render without Supabase configuration; admin routes still
  // require the configured client and will be handled by the application.
  const authEnabled = process.env.NEXT_PUBLIC_ADMIN_AUTH_ENABLED !== "false";
  if (!authEnabled) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create a Supabase client that can read/write cookies
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll: ((cookiesToSet, headers) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        }) satisfies SetAllCookies,
      },
    }
  );

  // Refresh the session — this is required by @supabase/ssr
  // DO NOT remove this line
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ─── Admin Route Protection ──────────────────────────────
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login";

  if (isAdminRoute) {
    if (!user) {
      // Redirect to admin login if not authenticated
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ─── Prevent authenticated admins from seeing login page ─
  if (request.nextUrl.pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     * - API webhook route (must not refresh session to preserve raw body)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};