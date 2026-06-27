import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  CategoryResponse,
  CreateProductRequest,
  PageResponse,
  ProductFilterRequest,
  ProductResponse,
  UpdateProductRequest,
} from "@/types/productType";

type ProductListParams = {
  pageNumber?: number;
  pageSize?: number;
};

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function extractArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  const record = asRecord(value);

  if (!record) return [];

  for (const key of [
    "content",
    "contents",
    "data",
    "payload",
    "items",
    "results",
    "categories",
    "categoryList",
    "list",
  ]) {
    const nested = record[key];

    if (Array.isArray(nested)) return nested as T[];

    const nestedRecord = asRecord(nested);
    if (nestedRecord) {
      const nestedItems = extractArray<T>(nestedRecord);
      if (nestedItems.length) return nestedItems;
    }
  }

  return [];
}

function normalizeProduct(value: ProductResponse): ProductResponse {
  return {
    ...value,
    categoryId: value.categoryId ?? value.category?.id,
    categoryName: value.categoryName ?? value.category?.name,
  };
}

function normalizePage<T>(value: unknown): PageResponse<T> {
  const record = asRecord(value);
  const nestedPage =
    asRecord(record?.data) ??
    asRecord(record?.payload) ??
    asRecord(record?.result) ??
    record;

  if (!nestedPage) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 0,
      number: 0,
    };
  }

  const content = extractArray<T>(nestedPage);

  return {
    content,
    totalElements: Number(nestedPage.totalElements ?? content.length),
    totalPages: Number(nestedPage.totalPages ?? 1),
    size: Number(nestedPage.size ?? nestedPage.pageSize ?? content.length),
    number: Number(nestedPage.number ?? nestedPage.pageNumber ?? 0),
  };
}

function normalizeProductPage(value: unknown): PageResponse<ProductResponse> {
  const page = normalizePage<ProductResponse>(value);

  return {
    ...page,
    content: page.content.map(normalizeProduct),
  };
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/ecommerce/",
  }),
  tagTypes: ["Products", "Categories"],
  endpoints: (builder) => ({
    getProducts: builder.query<PageResponse<ProductResponse>, ProductListParams | void>({
      query: ({ pageNumber = 0, pageSize = 25 } = {}) =>
        `products?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      transformResponse: normalizeProductPage,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({
        url: "products",
        method: "POST",
        body,
      }),
      transformResponse: (response: ProductResponse) => normalizeProduct(response),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation<
      ProductResponse,
      { id: number | string; body: UpdateProductRequest }
    >({
      query: ({ id, body }) => ({
        url: `products/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ProductResponse) => normalizeProduct(response),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation<ProductResponse, number | string>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    searchProducts: builder.mutation<
      PageResponse<ProductResponse>,
      ProductFilterRequest
    >({
      query: (body) => ({
        url: "products/search",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeProductPage(response),
      invalidatesTags: ["Products"],
    }),
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => "categories?pageNumber=0&pageSize=100",
      transformResponse: (response: unknown) =>
        extractArray<CategoryResponse>(response),
      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useSearchProductsMutation,
  useUpdateProductMutation,
} = productApi;
