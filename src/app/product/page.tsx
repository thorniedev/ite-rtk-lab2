"use client";

import CartIcon from "@/components/cart/CartIcon";
import ProductCart from "@/components/Products/ProductCart";
import { Button } from "@/components/ui/button";
import { addToCart, clearCart } from "@/lib/features/addToCard/AddToCartSlice";
import { useAppDispatch } from "@/lib/hook";
import { productType } from "@/types/productType";

export default function ProductPage() {
  const dispatch = useAppDispatch();

  // constant data
  const product: productType = {
    id: 1,
    title: "iPhone 15 Pro",
    description: "Latest Apple smartphone with A17 chip",
    price: 999,
    image:
      "https://i.pinimg.com/736x/2d/26/a9/2d26a931bf1a3f424819c584caf11586.jpg",
  };

  return (
    <div className="container mx-auto p-6">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <CartIcon />

        <Button variant="destructive" onClick={() => dispatch(clearCart())}>
          Clear Cart
        </Button>
      </div>

      <ProductCart
        image={product.image}
        title={product.title}
        description={product.description}
        onAddToCart={() => dispatch(addToCart(product))}
      />
    </div>
  );
}
