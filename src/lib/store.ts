// src/lib/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { CounterSlice } from '@/lib/features/counter/counterSlice';
import AddToCartSlice  from './features/addToCard/AddToCartSlice';
import { ecommerceApi } from '@/service/ecommerceApi';
import { productApi } from '@/lib/features/product/productApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: CounterSlice.reducer,
      addToCart: AddToCartSlice,
      [ecommerceApi.reducerPath]: ecommerceApi.reducer,
      [productApi.reducerPath]: productApi.reducer,
    },
    middleware  : (getDefaultMiddleware) => getDefaultMiddleware().concat(ecommerceApi.middleware, productApi.middleware),
  });
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
