"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductCreateForm } from "@/components/product-table/product-create-form";

type ProductCreateModalProps = {
  closeHref?: string;
};

export function ProductCreateModal({ closeHref }: ProductCreateModalProps) {
  const router = useRouter();

  function closeModal() {
    if (closeHref) {
      router.push(closeHref);
      return;
    }

    router.back();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Create product</DialogTitle>
          <DialogDescription>Add a product to the catalog.</DialogDescription>
        </DialogHeader>
        <ProductCreateForm
          className="p-6"
          onCancel={closeModal}
          onSuccess={closeModal}
        />
      </DialogContent>
    </Dialog>
  );
}
