import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/@types/auth";
import {ProductVariation} from "@/@types/products"
export const initialState = {
  productsSelected: [],
};
export type ProductState = {
    productsSelected: ProductVariation[]
}

const productsSlice = createSlice({
  name: `product`,
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<ProductState>) {
      state.productsSelected = action.payload?.productsSelected;
    },
  },
});

export const { setProducts } = productsSlice.actions;
export default productsSlice.reducer;
