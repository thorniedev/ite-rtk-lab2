import { ProductCreateModal } from "@/components/product-table/product-create-modal";
import { ProductTableClient } from "@/components/product-table/product-table-client";

export default function ProductCreatePage() {
  return (
    <>
      <ProductTableClient />
      <ProductCreateModal closeHref="/product-table" />
    </>
  );
}
