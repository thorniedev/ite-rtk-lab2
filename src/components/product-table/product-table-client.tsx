"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { columns } from "@/components/product-table/columns";
import { DataTable } from "@/components/product-table/data-table";
import { ProductForm } from "@/components/product-table/product-form";
import {
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useSearchProductsMutation,
  useUpdateProductMutation,
} from "@/lib/features/product/productApi";
import {
  CreateProductRequest,
  PageResponse,
  ProductFilterRequest,
  ProductResponse,
} from "@/types/productType";

type AppliedFilters = Pick<
  ProductFilterRequest,
  "keyword" | "categoryId" | "isAvailable"
>;

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;

    if (data?.message) return data.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}

function hasFilters(filters: AppliedFilters) {
  return Boolean(
    filters.keyword ||
      filters.categoryId !== undefined ||
      filters.isAvailable !== undefined,
  );
}

export function ProductTableClient() {
  const [pageNumber, setPageNumber] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(25);
  const [keyword, setKeyword] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [availability, setAvailability] = React.useState("");
  const [appliedFilters, setAppliedFilters] = React.useState<AppliedFilters>({});
  const [editingProduct, setEditingProduct] = React.useState<ProductResponse | null>(
    null,
  );
  const [deletingProductId, setDeletingProductId] = React.useState<number | null>(
    null,
  );

  const {
    data: productPage,
    isLoading,
    isError,
  } = useGetProductsQuery({ pageNumber, pageSize });
  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetCategoriesQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [
    searchProducts,
    { data: searchPage, isLoading: isSearching, isError: isSearchError },
  ] = useSearchProductsMutation();

  const isFiltering = hasFilters(appliedFilters);
  const activePage: PageResponse<ProductResponse> | undefined = isFiltering
    ? searchPage
    : productPage;
  const products = activePage?.content ?? [];

  React.useEffect(() => {
    if (sessionStorage.getItem("ecommerce-user-synced") === "true") return;

    void fetch("/api/ecommerce/users/me", { cache: "no-store" })
      .then((response) => {
        if (response.ok) {
          sessionStorage.setItem("ecommerce-user-synced", "true");
        }
      })
      .catch((error) => {
        console.error("User sync failed", error);
      });
  }, []);

  React.useEffect(() => {
    if (!isFiltering) return;

    searchProducts({
      ...appliedFilters,
      page: pageNumber,
      size: pageSize,
    });
  }, [appliedFilters, isFiltering, pageNumber, pageSize, searchProducts]);

  async function handleUpdateProduct(product: CreateProductRequest) {
    if (!editingProduct) return;

    try {
      await toast.promise(
        updateProduct({
          id: editingProduct.id,
          body: product,
        }).unwrap(),
        {
          loading: "Updating product...",
          success: "Product updated successfully.",
          error: (error) => getErrorMessage(error),
        },
      );
      setEditingProduct(null);
    } catch {
      // toast.promise renders the error message.
    }
  }

  async function handleDeleteProduct(product: ProductResponse) {
    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) return;

    setDeletingProductId(product.id);

    try {
      await toast.promise(deleteProduct(product.id).unwrap(), {
        loading: "Deleting product...",
        success: "Product deleted successfully.",
        error: (error) => getErrorMessage(error),
      });
    } catch {
      // toast.promise renders the error message.
    } finally {
      setDeletingProductId(null);
    }
  }

  function handleApplyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageNumber(0);
    setAppliedFilters({
      keyword: keyword.trim() || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      isAvailable: availability ? availability === "true" : undefined,
    });
  }

  function handleClearFilters() {
    setKeyword("");
    setCategoryId("");
    setAvailability("");
    setAppliedFilters({});
    setPageNumber(0);
  }

  const totalPages = activePage?.totalPages ?? 1;
  const totalElements = activePage?.totalElements ?? products.length;
  const pageLabel = `${(activePage?.number ?? pageNumber) + 1} of ${Math.max(
    totalPages,
    1,
  )}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Product Table</CardTitle>
            <CardDescription>
              Manage Spring Boot products with Keycloak auth, server search,
              categories, image upload, and RTK Query cache invalidation.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/product-table/create">
                <Plus />
                Add product
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                Home
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-muted/30 p-4 lg:grid-cols-[1fr_180px_180px_140px_auto]"
            onSubmit={handleApplyFilters}
          >
            <label className="grid gap-1.5 text-sm font-medium">
              Search keyword
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="pl-9"
                  placeholder="iphone"
                />
              </div>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Category
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Availability
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Page size
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageNumber(0);
                  setPageSize(Number(event.target.value));
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isSearching}>
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </form>

          {editingProduct ? (
            <ProductForm
              key={editingProduct.id}
              categories={categories}
              initialProduct={editingProduct}
              isSubmitting={isUpdating}
              onCancel={() => setEditingProduct(null)}
              onSubmit={handleUpdateProduct}
            />
          ) : null}

          {isLoading || isSearching || isLoadingCategories ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              Loading products...
            </div>
          ) : isError || isSearchError ? (
            <div className="grid gap-3 py-20 text-center text-sm text-destructive">
              <span>Failed to load products. Your session may have expired.</span>
              <Button asChild className="mx-auto" variant="outline">
                <Link href="/api/auth/login?returnTo=/product-table">
                  Sign in again
                </Link>
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No products available.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              deletingProductId={deletingProductId}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={(product) => setEditingProduct(product)}
            />
          )}

          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Page {pageLabel} · {totalElements} products
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pageNumber <= 0}
                onClick={() => setPageNumber((page) => Math.max(page - 1, 0))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pageNumber + 1 >= totalPages}
                onClick={() => setPageNumber((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
