"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CategoryResponse,
  CreateProductRequest,
  ImageUploadResponse,
} from "@/types/productType";

type ProductFormProps = {
  categories: CategoryResponse[];
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (product: CreateProductRequest) => Promise<void>;
};

function getUploadedUrl(uploaded: ImageUploadResponse) {
  return uploaded.url ?? uploaded.location ?? uploaded.fileUrl ?? uploaded.path ?? "";
}

export function ProductForm({
  categories,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const firstCategoryId = categories[0]?.id ?? 1;
  const [name, setName] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [qty, setQty] = React.useState("0");
  const [description, setDescription] = React.useState("");
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [categoryId, setCategoryId] = React.useState(String(firstCategoryId));
  const [thumbnail, setThumbnail] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const selectedCategoryId = categoryId || String(firstCategoryId);

  async function uploadThumbnail() {
    if (!file) return thumbnail.trim();

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const uploadedThumbnail = await uploadThumbnail();

    await onSubmit({
      name: name.trim(),
      unitPrice: Number(unitPrice),
      qty: Number(qty),
      description: description.trim() || undefined,
      isAvailable,
      categoryId: Number(selectedCategoryId),
      thumbnail: uploadedThumbnail || undefined,
    });

    setName("");
    setUnitPrice("");
    setQty("0");
    setDescription("");
    setIsAvailable(true);
    setCategoryId(String(firstCategoryId));
    setThumbnail("");
    setFile(null);
  }

  return (
    <form className="grid gap-3 rounded-lg border bg-muted/30 p-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Name
          <Input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="iPhone 15 Pro"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Unit price
          <Input
            required
            min="0.01"
            step="0.01"
            type="number"
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            placeholder="999.99"
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">
          Quantity
          <Input
            required
            min="0"
            type="number"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Category
          <select
            required
            value={selectedCategoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {categories.length ? null : <option value="">No categories</option>}
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
            value={String(isAvailable)}
            onChange={(event) => setIsAvailable(event.target.value === "true")}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            value={thumbnail}
            onChange={(event) => setThumbnail(event.target.value)}
            placeholder="https://example.com/image.png"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Upload thumbnail
          <Input
            accept="image/*"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Apple iPhone 15 Pro with 256GB storage"
        />
      </label>
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || isUploading || !categories.length}>
          {isUploading ? "Uploading..." : "Create product"}
        </Button>
      </div>
    </form>
  );
}
