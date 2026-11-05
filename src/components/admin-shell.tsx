"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  UsersRound,
  Settings,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; children?: { href: string; label: string }[] };

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/promos", label: "Promo", icon: Tag },
  { href: "/admin/crm", label: "CRM Customer", icon: UsersRound, children: [{ href: "/admin/crm", label: "CRM overview" }, { href: "/admin/customers", label: "Customers" }] },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(
    process.env.NEXT_PUBLIC_ADMIN_AUTH_ENABLED === "false",
  );

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (process.env.NEXT_PUBLIC_ADMIN_AUTH_ENABLED === "false") return;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      window.location.replace("/admin/login?error=auth-not-configured");
      return;
    }
    const client = createSupabaseBrowserClient();
    client.auth.getUser().then(({ data }) => {
      if (data.user) setAuthorized(true);
      else window.location.replace("/admin/login");
    }).catch(() => window.location.replace("/admin/login"));
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!authorized) return <main className="admin-auth-check" aria-live="polite">Memeriksa sesi admin...</main>;

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-head">
          <Link href="/" className="admin-sidebar-brand">
            <span className="admin-sidebar-logo">A</span>
            <span className="admin-sidebar-name">
              alka<span>preloved</span>
            </span>
          </Link>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="admin-sidebar-label">Menu</p>
          {navItems.map((item) => (
            <div key={item.href} className="admin-sidebar-group">
              <Link
                href={item.href}
                className={`admin-sidebar-link ${isActive(item.href) ? "is-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={17} />
                <span>{item.label}</span>
                <ChevronRight size={13} className="admin-sidebar-arrow" />
              </Link>
              {item.children && <div className="admin-sidebar-subnav">{item.children.map((child) => <Link key={child.href} href={child.href} className={`admin-sidebar-sublink ${pathname === child.href ? "is-active" : ""}`} onClick={() => setSidebarOpen(false)}>{child.label}</Link>)}</div>}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-link" target="_blank">
            <ExternalLink size={17} />
            <span>Lihat Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-topbar-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="admin-topbar-right">
            <span className="admin-topbar-badge">Demo Mode</span>
            <div className="admin-topbar-avatar">A</div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
