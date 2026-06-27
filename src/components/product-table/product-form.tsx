"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getSafeImageSrc } from "@/lib/utils";
import {
  CategoryResponse,
  CreateProductRequest,
  ImageUploadResponse,
  ProductResponse,
} from "@/types/productType";

const optionalImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) return true;

      return value.startsWith("/") || /^https?:\/\//i.test(value);
    },
    { message: "Use a valid http(s) URL or an app-relative path." },
  );

const optionalFileSchema = z
  .custom<FileList | undefined>()
  .optional()
  .refine((fileList) => !fileList?.length || fileList[0].type.startsWith("image/"), {
    message: "Upload an image file.",
  })
  .refine((fileList) => !fileList?.length || fileList[0].size <= 5 * 1024 * 1024, {
    message: "Image must be 5MB or smaller.",
  });

const productFormSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category is required.")
    .refine((value) => Number.isFinite(Number(value)), {
      message: "Choose a valid category.",
    }),
  description: z.string().trim().max(1000, "Description must be 1000 characters or less."),
  file: optionalFileSchema,
  isAvailable: z.enum(["true", "false"]),
  name: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(120, "Product name must be 120 characters or less."),
  qty: z
    .string()
    .min(1, "Quantity is required.")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, {
      message: "Quantity must be a whole number of 0 or more.",
    }),
  thumbnail: optionalImageUrlSchema,
  unitPrice: z
    .string()
    .min(1, "Unit price is required.")
    .refine((value) => Number(value) > 0, {
      message: "Unit price must be positive.",
    }),
});

const createProductRequestSchema = z.object({
  categoryId: z.number().int().positive(),
  description: z.string().optional(),
  isAvailable: z.boolean().optional(),
  name: z.string().trim().min(1).max(120),
  qty: z.number().int().nonnegative(),
  thumbnail: optionalImageUrlSchema.optional(),
  unitPrice: z.number().positive(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type ProductFormProps = {
  categories: CategoryResponse[];
  categoryStatus?: React.ReactNode;
  className?: string;
  initialProduct?: ProductResponse | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (product: CreateProductRequest) => Promise<void>;
};

function getUploadedUrl(uploaded: ImageUploadResponse) {
  return (
    uploaded.Uri ??
    uploaded.uri ??
    uploaded.downloadUri ??
    uploaded.url ??
    uploaded.location ??
    uploaded.fileUrl ??
    uploaded.path ??
    ""
  );
}

function getDefaultValues(
  categories: CategoryResponse[],
  product?: ProductResponse | null,
): ProductFormValues {
  return {
    categoryId: String(product?.categoryId ?? ""),
    description: product?.description ?? "",
    file: undefined,
    isAvailable: product?.isAvailable === false ? "false" : "true",
    name: product?.name ?? "",
    qty: String(product?.qty ?? 0),
    thumbnail: product?.thumbnail ?? "",
    unitPrice: String(product?.unitPrice ?? ""),
  };
}

export function ProductForm({
  categories,
  categoryStatus,
  className,
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
    setError,
  } = useForm<ProductFormValues>({
    defaultValues: getDefaultValues(categories, initialProduct),
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(productFormSchema),
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
    let uploadedThumbnail = "";

    try {
      uploadedThumbnail = await uploadThumbnail(values.file);
    } catch (error) {
      setError("file", {
        message:
          error instanceof Error ? error.message : "Image upload failed.",
      });
      return;
    }

    const description = values.description.trim();
    const thumbnail = uploadedThumbnail || values.thumbnail.trim();

    const product = createProductRequestSchema.parse({
      name: values.name.trim(),
      unitPrice: Number(values.unitPrice),
      qty: Number(values.qty),
      description: description || undefined,
      isAvailable: values.isAvailable === "true",
      categoryId: Number(values.categoryId),
      thumbnail: thumbnail || undefined,
    });

    await onSubmit(product);

    if (!initialProduct) {
      reset(getDefaultValues(categories));
    }
  }

  const disabled = isSubmitting || isUploading;

  return (
    <form
      className={cn("grid gap-3 rounded-lg border bg-muted/30 p-4", className)}
      onSubmit={handleSubmit(submitForm)}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Name
          <Input
            placeholder="iPhone 15 Pro"
            {...register("name")}
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
            {...register("unitPrice")}
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
            {...register("qty")}
          />
          {errors.qty ? (
            <span className="text-xs text-destructive">{errors.qty.message}</span>
          ) : null}
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Category
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("categoryId")}
          >
            <option value="">
              {categories.length ? "Select category" : "No categories loaded"}
            </option>
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
          {categoryStatus ? (
            <span className="text-sm text-muted-foreground">{categoryStatus}</span>
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
      <div className="grid gap-3 md:grid-cols-[140px_1fr]">
        <div className="grid gap-1.5 text-sm font-medium">
          Thumbnail
          <input type="hidden" {...register("thumbnail")} />
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <Image
              src={getSafeImageSrc(
                initialProduct?.thumbnail,
                "https://placehold.co/280x280",
              )}
              alt={initialProduct?.name ?? "Product thumbnail"}
              fill
              sizes="140px"
              className="object-contain p-3"
              unoptimized
            />
          </div>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">
          Upload thumbnail
          <Input accept="image/*" type="file" {...register("file")} />
          {errors.file ? (
            <span className="text-xs text-destructive">{errors.file.message}</span>
          ) : null}
          {errors.thumbnail ? (
            <span className="text-xs text-destructive">
              {errors.thumbnail.message}
            </span>
          ) : null}
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Apple iPhone 15 Pro with 256GB storage"
          {...register("description")}
        />
        {errors.description ? (
          <span className="text-xs text-destructive">
            {errors.description.message}
          </span>
        ) : null}
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
