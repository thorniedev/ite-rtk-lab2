export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  image?: string;
  images: string[] | string;
  category: string;
};

export type ProductResponse = {
  id: number;
  code: string;
  slug: string;
  name: string;
  thumbnail?: string;
  unitPrice: number;
  qty: number;
  description?: string;
  isAvailable: boolean;
  categoryId?: number;
  categoryName?: string;
};

export type CreateProductRequest = {
  name: string;
  thumbnail?: string;
  unitPrice: number;
  qty: number;
  description?: string;
  isAvailable?: boolean;
  categoryId: number;
};

export type ProductFilterRequest = {
  keyword?: string;
  categoryId?: number;
  isAvailable?: boolean;
  page?: number;
  size?: number;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type CategoryResponse = {
  id: number;
  code?: string;
  name: string;
  description?: string;
  icon?: string;
};

export type ImageUploadResponse = {
  url?: string;
  location?: string;
  fileUrl?: string;
  path?: string;
};

export type ProductRequest = CreateProductRequest;
export type Category = CategoryResponse;
export type productType = Product;
export type productResponse = ProductResponse;
