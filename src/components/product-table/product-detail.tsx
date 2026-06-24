"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useGetProductsQuery } from "@/lib/features/product/productApi";
import { getSafeImageSrc } from "@/lib/utils";

type ProductDetailProps = {
  slug: string;
  framed?: boolean;
};

export function ProductDetail({ slug, framed = true }: ProductDetailProps) {
  const { data: productPage, isLoading, isError } = useGetProductsQuery({
    pageNumber: 0,
    pageSize: 100,
  });
  const product = productPage?.content.find(
    (item) => item.slug === slug || String(item.id) === slug,
  );

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
          Product detail endpoint is not available yet, and this item was not in
          the first product page.
        </div>
      ) : (
        <>
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <img
              src={getSafeImageSrc(product.thumbnail, "https://placehold.co/400x400")}
              alt={product.name}
              className="size-full object-contain p-6"
            />
          </div>
          <div className="min-w-0 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {product.categoryName ?? "Uncategorized"}
              </div>
              <h1 className="text-2xl font-semibold leading-tight">
                {product.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground">
                ${product.unitPrice.toFixed(2)}
              </span>
              <span className="rounded-md border px-3 py-1 text-muted-foreground">
                Qty: {product.qty}
              </span>
              <span className="rounded-md border px-3 py-1 text-muted-foreground">
                {product.isAvailable ? "Available" : "Unavailable"}
              </span>
              <span className="rounded-md border px-3 py-1 text-muted-foreground">
                Code: {product.code}
              </span>
            </div>
            {product.description ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
            ) : null}
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
