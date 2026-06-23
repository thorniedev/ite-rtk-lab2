import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  CategoryResponse,
  CreateProductRequest,
  PageResponse,
  ProductFilterRequest,
  ProductResponse,
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

  for (const key of ["content", "data", "payload", "items", "results"]) {
    const nested = record[key];

    if (Array.isArray(nested)) return nested as T[];

    const nestedRecord = asRecord(nested);
    if (nestedRecord) {
      const nestedContent = nestedRecord.content;
      if (Array.isArray(nestedContent)) return nestedContent as T[];
    }
  }

  return [];
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
    size: Number(nestedPage.size ?? content.length),
    number: Number(nestedPage.number ?? nestedPage.pageNumber ?? 0),
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
      transformResponse: (response: unknown) =>
        normalizePage<ProductResponse>(response),
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<ProductResponse, CreateProductRequest>({
      query: (body) => ({
        url: "products",
        method: "POST",
        body,
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
        normalizePage<ProductResponse>(response),
      invalidatesTags: ["Products"],
    }),
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => "categories",
      transformResponse: (response: unknown) =>
        extractArray<CategoryResponse>(response),
      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useSearchProductsMutation,
} = productApi;
