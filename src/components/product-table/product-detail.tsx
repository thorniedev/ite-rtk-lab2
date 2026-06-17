"use client";

import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { useGetProductsQuery } from "@/lib/features/product/productApi";

type ProductDetailProps = {
  slug: string;
  framed?: boolean;
};

function getCategoryName(category: unknown) {
  if (typeof category === "string") return category;
  if (category && typeof category === "object" && "name" in category) {
    return String((category as { name: string }).name);
  }
  return "Uncategorized";
}

export function ProductDetail({ slug, framed = true }: ProductDetailProps) {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const product = products?.find((item) => String(item.id) === slug);

  const content = (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      {isLoading ? (
        <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
          Loading product detail...
        </div>
      ) : isError ? (
        <div className="col-span-full py-16 text-center text-sm text-destructive">
          Failed to load product detail.
        </div>
      ) : !product ? (
        <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
          Product not found.
        </div>
      ) : (
        <>
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={product.image ?? "https://placehold.co/400x400"}
              alt={product.title}
              fill
              className="object-contain p-6"
              sizes="(min-width: 768px) 240px, 100vw"
            />
          </div>
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {getCategoryName(product.category)}
              </div>
              <h1 className="text-2xl font-semibold leading-tight">
                {product.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground">
                ${product.price.toFixed(2)}
              </span>
              <span className="rounded-md border px-3 py-1 text-muted-foreground">
                Slug: {product.id}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {product.description}
            </p>
          </div>
        </>
      )}
    </div>
  );

  if (!framed) return content;

  return (
    <Card className="mx-auto w-full max-w-5xl rounded-lg">
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  );
}
