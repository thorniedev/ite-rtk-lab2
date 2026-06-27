"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/product-table/product-form";
import {
  useCreateProductMutation,
  useGetCategoriesQuery,
} from "@/lib/features/product/productApi";
import { cn } from "@/lib/utils";
import { CreateProductRequest } from "@/types/productType";

type ProductCreateFormProps = {
  className?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;

    if (data?.message) return data.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}

export function ProductCreateForm({
  className,
  onCancel,
  onSuccess,
}: ProductCreateFormProps) {
  const {
    data: categories = [],
    isError: isCategoryError,
    isFetching: isFetchingCategories,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useGetCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  async function handleCreateProduct(product: CreateProductRequest) {
    try {
      await toast.promise(createProduct(product).unwrap(), {
        loading: "Creating product...",
        success: "Product created successfully.",
        error: (error) => getErrorMessage(error),
      });
      onSuccess?.();
    } catch {
      // toast.promise renders the error message.
    }
  }

  return (
    <section className={cn("space-y-4", className)}>
      {isLoadingCategories ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading categories...
        </div>
      ) : (
        <div className="space-y-3">
          {isCategoryError ? (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/35 bg-destructive/10 p-3 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <span>
                Categories failed to load. Sign in again or check the ecommerce
                API before creating a product.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchCategories()}
              >
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          ) : null}
          <ProductForm
            categories={categories}
            categoryStatus={
              isFetchingCategories
                ? "Refreshing categories..."
                : undefined
            }
            className="border-border/70 bg-muted/20"
            isSubmitting={isCreating}
            onCancel={onCancel}
            onSubmit={handleCreateProduct}
          />
        </div>
      )}
    </section>
  );
}
