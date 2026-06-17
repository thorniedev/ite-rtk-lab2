import { ProductDetail } from "@/components/product-table/product-detail";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ProductDetail slug={slug} />
    </main>
  );
}
