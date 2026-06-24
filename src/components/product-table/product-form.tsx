"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CategoryResponse,
  CreateProductRequest,
  ImageUploadResponse,
  ProductResponse,
} from "@/types/productType";

type ProductFormValues = {
  categoryId: string;
  description: string;
  file?: FileList;
  isAvailable: string;
  name: string;
  qty: string;
  thumbnail: string;
  unitPrice: string;
};

type ProductFormProps = {
  categories: CategoryResponse[];
  initialProduct?: ProductResponse | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (product: CreateProductRequest) => Promise<void>;
};

function getUploadedUrl(uploaded: ImageUploadResponse) {
  return uploaded.url ?? uploaded.location ?? uploaded.fileUrl ?? uploaded.path ?? "";
}

function getDefaultValues(
  categories: CategoryResponse[],
  product?: ProductResponse | null,
): ProductFormValues {
  return {
    categoryId: String(product?.categoryId ?? categories[0]?.id ?? ""),
    description: product?.description ?? "",
    file: undefined,
    isAvailable: String(product?.isAvailable ?? true),
    name: product?.name ?? "",
    qty: String(product?.qty ?? 0),
    thumbnail: product?.thumbnail ?? "",
    unitPrice: String(product?.unitPrice ?? ""),
  };
}

export function ProductForm({
  categories,
  initialProduct,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ProductFormValues>({
    defaultValues: getDefaultValues(categories, initialProduct),
  });

  React.useEffect(() => {
    reset(getDefaultValues(categories, initialProduct));
  }, [categories, initialProduct, reset]);

  async function uploadThumbnail(fileList?: FileList) {
    const file = fileList?.[0];

    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const response = await fetch("/api/ecommerce/images", {
        method: "POST",
        body: formData,
      });
      const uploaded = (await response.json()) as ImageUploadResponse;

      if (!response.ok) {
        throw new Error("Image upload failed.");
      }

      return getUploadedUrl(uploaded);
    } finally {
      setIsUploading(false);
    }
  }

  async function submitForm(values: ProductFormValues) {
    const uploadedThumbnail = await uploadThumbnail(values.file);

    await onSubmit({
      name: values.name.trim(),
      unitPrice: Number(values.unitPrice),
      qty: Number(values.qty),
      description: values.description.trim() || undefined,
      isAvailable: values.isAvailable === "true",
      categoryId: Number(values.categoryId),
      thumbnail: uploadedThumbnail || values.thumbnail.trim() || undefined,
    });

    if (!initialProduct) {
      reset(getDefaultValues(categories));
    }
  }

  const disabled = isSubmitting || isUploading || !categories.length;

  return (
    <form className="grid gap-3 rounded-lg border bg-muted/30 p-4" onSubmit={handleSubmit(submitForm)}>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Name
          <Input
            placeholder="iPhone 15 Pro"
            {...register("name", { required: "Product name is required." })}
          />
          {errors.name ? (
            <span className="text-xs text-destructive">{errors.name.message}</span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Unit price
          <Input
            min="0.01"
            placeholder="999.99"
            step="0.01"
            type="number"
            {...register("unitPrice", {
              required: "Unit price is required.",
              min: { value: 0.01, message: "Unit price must be positive." },
            })}
          />
          {errors.unitPrice ? (
            <span className="text-xs text-destructive">
              {errors.unitPrice.message}
            </span>
          ) : null}
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">
          Quantity
          <Input
            min="0"
            type="number"
            {...register("qty", {
              required: "Quantity is required.",
              min: { value: 0, message: "Quantity cannot be negative." },
            })}
          />
          {errors.qty ? (
            <span className="text-xs text-destructive">{errors.qty.message}</span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Category
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("categoryId", { required: "Category is required." })}
          >
            {categories.length ? null : <option value="">No categories</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <span className="text-xs text-destructive">
              {errors.categoryId.message}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Availability
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("isAvailable")}
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Thumbnail URL
          <Input
            placeholder="https://example.com/image.png"
            {...register("thumbnail")}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Upload thumbnail
          <Input accept="image/*" type="file" {...register("file")} />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Apple iPhone 15 Pro with 256GB storage"
          {...register("description")}
        />
      </label>
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={disabled}>
          {isUploading
            ? "Uploading..."
            : initialProduct
              ? "Update product"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}
