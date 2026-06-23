"use client";
import Image from "next/image"; 
import { getImageProxySrc } from "@/lib/utils";

type ProductCardProps = {
  description?: string;
  image?: string;
  title: string;
};

export default function ProductCard({
  image,
  title,
  description,
}: ProductCardProps) {
  return (
    <div>
      <div className="relative min-h-100 w-full">
        <Image
          src={getImageProxySrc(image)}
          alt={title}
          fill
          unoptimized
          className="object-contain"
          sizes="300px"
        />
      </div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
