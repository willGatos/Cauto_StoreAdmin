import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetSalesProducts,
    apiDeleteSalesProducts,
} from '@/services/SalesService'
import type { TableQueries } from '@/@types/common'

type Product = {
    id: string
    name: string
    productCode: string
    img: string
    category: string
    price: number
    stock: number
    status: number
}

type GetSalesProductsResponse = {
    data: Product[]
    total: number
}

type FilterQueries = {
    name: string
    subcategory: string[]
    status: string[]
}

export type SalesProductListState = {
    loading: boolean
    deleteConfirmation: boolean
    selectedProduct: string
    tableData: TableQueries
    filterData: FilterQueries
    productList: Product[]
}

type GetSalesProductsRequest = TableQueries & { filterData: FilterQueries }

export const SLICE_NAME = 'salesProductList'

export const getProducts = createAsyncThunk(
    SLICE_NAME + '/products',
    async (data: GetSalesProductsRequest) => {
        const response = await apiGetSalesProducts<
            GetSalesProductsResponse,
            GetSalesProductsRequest
        >(data)
        return response.data
    }
)

export const deleteProduct = async (data: { id: string | string[] }) => {
    const response = await apiDeleteSalesProducts<
        boolean,
        { id: string | string[] }
    >(data)
    return response.data
}

export const initialTableData: TableQueries = {
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

const initialState: SalesProductListState = {
    loading: false,
    deleteConfirmation: false,
    selectedProduct: '',
    productList: [],
    tableData: initialTableData,
    filterData: {
        name: '',
        subcategory: [],
        status: ["En Inventario", "En Camino", "Agotado"],
    },
}

const productListSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        updateProductList: (state, action) => {
            state.productList = action.payload
        },
        setTableData: (state, action) => {
            state.tableData = action.payload
        },
        setFilterData: (state, action) => {
            state.filterData = action.payload
        },
        toggleDeleteConfirmation: (state, action) => {
            state.deleteConfirmation = action.payload
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.fulfilled, (state, action) => {
                state.productList = action.payload.data
                state.tableData.total = action.payload.total
                state.loading = false
            })
            .addCase(getProducts.pending, (state) => {
                state.loading = true
            })
    },
})

export const {
    updateProductList,
    setTableData,
    setFilterData,
    toggleDeleteConfirmation,
    setSelectedProduct,
} = productListSlice.actions

export default productListSlice.reducer
