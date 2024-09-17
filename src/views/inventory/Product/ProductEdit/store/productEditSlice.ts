import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetSalesProduct,
    apiPutSalesProduct,
    apiDeleteSalesProducts,
} from '@/services/SalesService'

type ProductData = {
    _id?: string
    name?: string;
    description?: string;
    pricingDetails?: {
      normalPrice: number;
      salePrice: number;
      referenceCurrency: string;
      commission: number;
      cost: number;
      earnedPercentageOfProfit: number;
    };
    stock?: number;
    gender?: string;
    brand?: string;
    variations?: [];
    category?: string;
    subcategory?: string;
    img?: string;
    imgList?: string[]
    newSubcategory?: string
  };


export type SalesProductEditState = {
    loading: boolean
    productData: ProductData
}

type GetSalesProductResponse = ProductData

export const SLICE_NAME = 'salesProductEdit'

export const getProduct = createAsyncThunk(
    SLICE_NAME + '/getProducts',
    async (data: { id: string }) => {
        const response = await apiGetSalesProduct<
            GetSalesProductResponse,
            { id: string }
        >(data)
        return response.data
    }
)

export const updateProduct = async <T, U extends Record<string, unknown>>(
    data: U,
    params: any,
) => {
    const response = await apiPutSalesProduct<T, U>(data, params)
    return response.data
}

export const deleteProduct = async <T, U extends Record<string, unknown>>(
    data: U
) => {
    const response = await apiDeleteSalesProducts<T, U>(data)
    return response.data
}

const initialState: SalesProductEditState = {
    loading: true,
    productData: {},
}

const productEditSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProduct.fulfilled, (state, action) => {
                state.productData = action.payload
                state.loading = false
            })
            .addCase(getProduct.pending, (state) => {
                state.loading = true
            })
    },
})

export default productEditSlice.reducer
