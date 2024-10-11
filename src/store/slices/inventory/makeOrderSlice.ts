import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductVariation } from "@/@types/products";
import { Offer } from "@/views/crm/SellersCatalog/components/OffersCards";

export const initialStateOfProducts = {
  productsSelected: [],
  offersSelected: [],
};
export type ProductState = {
  productsSelected: ProductVariation[];
  offersSelected: Offer[]
};

const productsSlice = createSlice({
  name: `products`,
  initialState: initialStateOfProducts,
  reducers: {
    setProductsSelected(state, action: PayloadAction<ProductState>) {
      state.productsSelected = action.payload?.productsSelected;
      state.offersSelected = action.payload?.offersSelected;
    },
  },
});

export const { setProductsSelected } = productsSlice.actions;
export default productsSlice.reducer;
