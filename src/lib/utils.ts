import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getSafeImageSrc(
  src?: string | null,
  fallback = "https://placehold.co/600x600"
) {
  if (!src) return fallback
  if (src.startsWith("/")) return src
  if (src.startsWith("http://") || src.startsWith("https://")) return src
  return fallback
}

export function getFirstImage(images?: string[] | string | null) {
  if (Array.isArray(images)) return images[0] || "";
  if (typeof images === "string") return images;
  return "";
}


export function getImageProxySrc(
  images?: string[] | string | null,
  fallback = "https://placehold.co/600x600"
) {
  const source = getSafeImageSrc(getFirstImage(images), fallback);

  if (source.startsWith("/")) return source;

  return `/api/image?url=${encodeURIComponent(source)}`;
}