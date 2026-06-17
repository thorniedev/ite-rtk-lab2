"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { columns } from "@/components/product-table/columns";
import { DataTable } from "@/components/product-table/data-table";
import { useGetProductsQuery } from "@/lib/features/product/productApi";

export function ProductTableClient() {
  const { data: products = [], isLoading, isError } = useGetProductsQuery();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl">Product Table</CardTitle>
          <CardDescription>
            Browse Fake Store products with search, sorting, pagination, and column controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Loading products...
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-sm text-destructive">
              Failed to load products.
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No products available.
            </div>
          ) : (
            <DataTable columns={columns} data={products} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
