"use client";
import Image from "next/image"; 
import { Product, ProductResponse } from "@/types/productType";
import { getImageProxySrc } from "@/lib/utils";

type ProductCardProps = Pick<Product | ProductResponse, "images" | "title" | "description">;

export default function ProductCard({
  images,
  title,
  description,
}: ProductCardProps) {
  return (
    <div>
      <div className="relative min-h-100 w-full">
        <Image
          src={getImageProxySrc(images)}
          alt={title}
          fill
          unoptimized
          className="object-contain"
          sizes="300px"
        />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
