export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  image?: string;
  images: string[] | string;
  category: string | ProductCategory;
};

export type ProductCategory = {
  id: number;
  name: string;
  image?: string;
};

export type ProductResponse = {
  id: number;
  title: string;
  description: string;
  price: number;
  image?: string;
  images?: string[] | string;
  category: string | ProductCategory;
  creationAt?: string;
  updatedAt?: string;
};

export type ProductRequest = {
  title: string;
  price: number;
  description: string;
  categoryId: number;
  images: string[];
};

export type UploadResponse = {
  originalname?: string;
  filename?: string;
  location: string;
};

export type Category = {
  id: number;
  name: string;
  image: string;
};

export type productType = Product;
export type productResponse = ProductResponse;
