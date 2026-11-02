import { AdminShell } from "@/components/admin-shell";

interface AdminLayoutProps { children: React.ReactNode }

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}