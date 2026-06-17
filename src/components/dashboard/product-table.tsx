"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/lib/features/product/productApi";
import { getImageProxySrc } from "@/lib/utils";
import { ProductResponse } from "@/types/productType";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

function getCategoryName(category: ProductResponse["category"]) {
  if (typeof category === "string") return category;
  if (category && typeof category === "object" && "name" in category) {
    return String(category.name);
  }
  return "Unknown";
}

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) return "N/A";

  return new Date(updatedAt).toLocaleDateString();
}

export default function ProductTable() {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  async function handleDeleteProduct(id: number) {
    const confirmed = window.confirm("Are you sure you want to delete this product?");

    if (!confirmed) return;

    try {
      toast.loading("Deleting product...");
      await deleteProduct(id).unwrap();
      toast.dismiss();
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete product!");
      console.error("Failed to delete product", error);
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Browse product records and jump to the create form from one place.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/product/create">Add product</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading products...
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-sm text-destructive">
            Failed to load product data.
          </div>
        ) : !products?.length ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No products found yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-14 w-14 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={getImageProxySrc(
                          product.images,
                          "https://placehold.co/100x100",
                        )}
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-65">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-muted-foreground line-clamp-1 text-xs">
                      {product.description}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryName(product.category)}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                  <TableCell>
                    {formatUpdatedAt(product.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/product/${product.id}/edit`}>
                          <Pencil />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDeleting}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Toaster position="top-center" richColors />
    </Card>
  );
}
