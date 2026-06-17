import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { ProductResponse } from "@/types/productType";

type DeleteProductArg = string | number;

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://fakestoreapi.com/",
  }),
  tagTypes: ["products"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductResponse[], void>({
      query: () => "products",
      providesTags: ["products"],
    }),
    deleteProduct: builder.mutation<void, DeleteProductArg>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products"],
    }),
  }),
});

export const { useGetProductsQuery, useDeleteProductMutation } = productApi;
