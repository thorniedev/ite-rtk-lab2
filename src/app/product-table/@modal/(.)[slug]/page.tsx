import { ProductModal } from "@/components/product-table/product-modal";

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductModal slug={slug} />;
}
