"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function AdminLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const authConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const destination = searchParams.get("redirect");
      router.replace(destination?.startsWith("/admin") ? destination : "/admin");
      router.refresh();
    } catch {
      setError("Login gagal. Periksa email, password, dan konfigurasi Supabase.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-login-page"><section className="admin-login-card"><Link href="/" className="admin-sidebar-brand"><span className="admin-sidebar-logo">A</span><span className="admin-sidebar-name">alka<span>preloved</span></span></Link><p className="admin-kicker">Area pengelola</p><h1>Selamat datang.</h1><p className="admin-login-copy">Masuk untuk mengelola produk, pesanan, dan promo toko.</p>
    {!authConfigured ? <p className="admin-login-error" role="alert">Autentikasi admin belum dikonfigurasi. Tambahkan URL dan anon key Supabase di environment deployment.</p> : <form onSubmit={handleSubmit}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>{error && <p className="admin-login-error" role="alert">{error}</p>}<button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Memeriksa..." : "Masuk ke admin"}</button></form>}
  </section></main>;
}

export function AdminLoginForm() {
  return <Suspense fallback={<main className="admin-login-page"><p>Memuat form login...</p></main>}><AdminLoginFormContent /></Suspense>;
}
