import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/@types/auth";
import { ProductVariation } from "@/@types/products";

export const initialStateOfProducts = {
  productsSelected: [],
};
export type ProductState = {
  productsSelected: ProductVariation[];
};

const productsSlice = createSlice({
  name: `product`,
  initialState: initialStateOfProducts,
  reducers: {
    setProductsSelected(state, action: PayloadAction<ProductState>) {
      state.productsSelected = action.payload?.productsSelected;
    },
  },
});

export const { setProductsSelected } = productsSlice.actions;
export default productsSlice.reducer;
