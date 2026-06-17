"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductDetail } from "@/components/product-table/product-detail";

type ProductModalProps = {
  slug: string;
};

export function ProductModal({ slug }: ProductModalProps) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6">
        <DialogTitle className="sr-only">Product detail</DialogTitle>
        <ProductDetail slug={slug} framed={false} />
      </DialogContent>
    </Dialog>
  );
}
