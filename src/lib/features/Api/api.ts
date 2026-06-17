import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ecommerceApi = createApi({
    reducerPath: 'productsApi',

    baseQuery: fetchBaseQuery({ }),

    tagTypes: ["products"],

    endpoints: () => ({}),

});