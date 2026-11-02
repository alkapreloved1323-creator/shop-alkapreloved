// Admin Login Page
// This is exempt from the admin layout (no auth required here).

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-[#0F172A]">
      <div className="max-w-md w-full p-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Admin Login</h1>
        <p className="text-[#64748B]">Login form — Phase 12</p>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Admin Login — AlkaPreloved",
  robots: { index: false, follow: false }, // Don't index admin pages
};