"use client";

import Image from "next/image";

type Props = {
  image: string;
  title: string;
  description: string;
  onAddToCart?: () => void;
};

export default function ProductCart({
  image,
  title,
  description,
  onAddToCart,
}: Props) {
  return (
    <div>
      <div className="relative min-h-100 w-full">
        <Image
          src={image}
          alt={title}
          width={200}
          height={200}
          className="object-contain"
        />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>

      <button
        onClick={onAddToCart}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Add To Cart
      </button>
    </div>
  );
}
