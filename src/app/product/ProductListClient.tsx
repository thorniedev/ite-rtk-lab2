"use client";
import Link from "next/link";
import ProductCard from "@/components/Products/ProductCart";
import { useGetProductsQuery } from "@/lib/features/product/productApi";

export default function ProductListClient() {
  
  const { data: products, isLoading, error } = useGetProductsQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load products</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {products?.map((product) => (
        <Link href={`/products/${product.id}`} key={product.id}>
          <ProductCard
            image={""} {...product}
          />
        </Link>
      ))}
    </div>
  );
}
