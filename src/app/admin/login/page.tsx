// Admin Login Page
// This is exempt from the admin layout (no auth required here).

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
        <p className="text-gray-500">Login form — Phase 12</p>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Admin Login — AlkaPreloved",
  robots: { index: false, follow: false }, // Don't index admin pages
};
