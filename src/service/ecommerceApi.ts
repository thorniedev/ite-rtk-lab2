
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type ProductType = {
    uuid: string;
    thumbnail: string;
    priceOut: number;
    name: string;
}

export const ecommerceApi = createApi({
  reducerPath: 'ecommerceApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getAllProducts: builder.query<ProductType, void>({
      query: () => `/products`,
    }),
  }),
})

export const { useGetAllProductsQuery } = ecommerceApi;