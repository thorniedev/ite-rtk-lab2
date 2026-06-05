"use client";

import { ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/lib/hook";

export default function CartIcon() {
  const { cart } = useAppSelector((state) => state.addToCart);

  const totalQty = cart.length;

  return (
    <div className="relative">
        
      <ShoppingCart size={28} />

      {totalQty > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {totalQty}
        </span>
      )}
    </div>
  );
}