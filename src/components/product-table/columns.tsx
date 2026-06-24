"use client";

import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { getSafeImageSrc } from "@/lib/utils";
import { ProductResponse } from "@/types/productType";

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
    accessorKey: "thumbnail",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="relative size-[50px] overflow-hidden rounded-md border bg-muted">
        <img
          src={getSafeImageSrc(row.original.thumbnail, "https://placehold.co/100x100")}
          alt={row.original.name}
          className="size-full object-contain p-1"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortHeader
        label="Name"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <div className="max-w-[360px] truncate font-medium">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => row.original.categoryName ?? "Uncategorized",
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => (
      <SortHeader
        label="Unit price"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="font-medium">${row.original.unitPrice.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "qty",
    header: "Qty",
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => (row.original.isAvailable ? "Available" : "Unavailable"),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.slug}
      </span>
    ),
  },
];
