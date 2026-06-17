"use client";

import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ProductResponse } from "@/types/productType";

function getCategoryName(category: ProductResponse["category"]) {
  if (typeof category === "string") return category;
  if (category && typeof category === "object" && "name" in category) {
    return String(category.name);
  }
  return "Uncategorized";
}

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="-ml-2">
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

export const columns: ColumnDef<ProductResponse>[] = [
  {
    accessorKey: "image",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="relative size-[50px] overflow-hidden rounded-md border bg-muted">
        <Image
          src={row.original.image ?? "https://placehold.co/100x100"}
          alt={row.original.title}
          fill
          className="object-contain p-1"
          sizes="50px"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <SortHeader
        label="Name / Title"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <div className="max-w-[360px] truncate font-medium">
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{getCategoryName(row.original.category)}</span>
    ),
    filterFn: (row, id, value) =>
      getCategoryName(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase()),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <SortHeader
        label="Price"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="font-medium">${row.original.price.toFixed(2)}</span>
    ),
  },
  {
    id: "slug",
    accessorFn: (row) => String(row.id),
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.id}
      </span>
    ),
  },
];
