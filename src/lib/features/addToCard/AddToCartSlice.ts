// src/lib/features/addToCard/AddToCartSlice.ts
import { productType } from "@/types/productType";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { increment } from "../counter/counterSlice";

type ProductState = {
  selectedProduct: productType | null;
  quantity: number;
  totalPrice: number;
  cart: productType[];
};

const initialState: ProductState = {
  selectedProduct: null,
  quantity: 1,
  totalPrice: 0,
  cart: [],
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<productType>) => {
      state.selectedProduct = action.payload;
      state.quantity = 1; // Reset quantity to 1 when a new product is selected
      state.totalPrice = action.payload.price; // Set total price to the price of the selected product
    },

    incrementQuantity: (state) => {
      if (state.selectedProduct) {
        state.quantity += 1;
        state.totalPrice = state.selectedProduct.price * state.quantity; // Update total price based on quantity
      }
    },

    decrementQuantity: (state) => {
      if (state.selectedProduct && state.quantity > 1) {
        state.quantity -= 1;
        state.totalPrice = state.selectedProduct.price * state.quantity; // Update total price based on quantity
      }
    },

    removeProduct: (state) => {
      state.selectedProduct = null;
      state.quantity = 1;
      state.totalPrice = 0;
    },

    clearProduct: (state) => {
      state.selectedProduct = null;
      state.quantity = 1;
      state.totalPrice = 0;
    },

    addToCart: (state, action: PayloadAction<productType>) => {
      state.cart.push(action.payload);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const {
  setSelectedProduct,
  incrementQuantity,
  decrementQuantity,
  removeProduct,
  clearProduct,
  addToCart,
  removeFromCart,
  clearCart,
} = productSlice.actions;

export default productSlice.reducer;
