import type { Metadata } from "next";
import { AdminLoginForm } from "./login-form";

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}

export const metadata: Metadata = {
  title: "Admin Login — AlkaPreloved",
  robots: { index: false, follow: false },
};