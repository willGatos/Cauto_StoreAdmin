import ApiService from './ApiService'
import supabase from './Supabase/BaseClient';

export async function apiGetAccountSettingData<T>(userId) {
    const { data: shops, error: shopError } = await supabase
      .from("shops")
      .select("*")
      .eq("id", userId)
      .single();

    if (shopError) {
      throw new Error(`Error: ${shopError.message}`);
    }
    return shops;
}

export async function apiGetAccountSettingIntegrationData<T>() {
    return ApiService.fetchData<T>({
        url: '/account/setting/integration',
        method: 'get',
    })
}

export async function apiGetAccountSettingBillingData<T>() {
    return ApiService.fetchData<T>({
        url: '/account/setting/billing',
        method: 'get',
    })
}

export async function apiGetAccountInvoiceData<
    T,
    U extends Record<string, unknown>
>(params: U) {
    return ApiService.fetchData<T>({
        url: '/account/invoice',
        method: 'get',
        params,
    })
}

export async function apiGetAccountLogData<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/account/log',
        method: 'post',
        data,
    })
}

export async function apiGetAccountFormData<T>() {
    return ApiService.fetchData<T>({
        url: '/account/form',
        method: 'get',
    })
}
