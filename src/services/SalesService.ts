import ApiService from './ApiService'

export async function apiGetDelievery() {
    return ApiService.fetchData({
        url: 'shops/delievery',
        method: 'get',
    })
}

export async function apiPostDelievery(data:string) {
    return ApiService.fetchData({
        url: 'shops/delievery',
        method: 'post',
        data
    })
}

export async function apiGetSalesDashboardData<
    T extends Record<string, unknown>
>() {
    return ApiService.fetchData<T>({
        url: 'products',
        method: 'post',
    })
}

export async function apiGetSalesProducts<T, U extends Record<string, unknown>>(
    data: any
) {
    return ApiService.fetchData<T>({
        url: 'products/getFiltered',
        method: 'post',
        data,
    })
}

export async function apiGetProductsFromStoresProducts<
    T,
    U extends Record<string, unknown>
>(
    //data: U
) {
    return ApiService.fetchData<T>({
        url: 'shops/productsFromStores',
        method: 'get',
       // data,
    })
}

export async function apiDeleteSalesProducts<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: 'products',
        method: 'delete',
        data,
    })
}

export async function apiGetSalesProduct<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: 'products',
        method: 'get',
        params,
    })
}

export async function apiPutSalesProduct<T, U extends Record<string, unknown>>(
    data: U,
    params: any
) {
    return ApiService.fetchData<T>({
        url: 'products',
        method: 'put',
        data,
        params
    })
}

export async function apiProductCreate(values: any) {
    return ApiService.fetchData({
        url: '/products/',
        method: 'post',
        data: values,
    })
}

/* export async function apiCreateSalesProduct<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: 'products',
        method: 'post',
        data,
    })
} */

export async function apiGetSalesOrders<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: '/sales/orders',
        method: 'get',
        params,
    })
}

export async function apiDeleteSalesOrders<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/sales/orders/delete',
        method: 'delete',
        data,
    })
}

export async function apiGetSalesOrderDetails<
    T,
    U extends Record<string, unknown>
>(params: U) {
    return ApiService.fetchData<T>({
        url: '/sales/orders-details',
        method: 'get',
        params,
    })
}
