// Phase 5 — Product Detail
// This page will be implemented in Phase 5.

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Product: {slug} — Phase 5</p>
    </div>
  );
}
