import type {
    ForgotPassword,
    ResetPassword,
    SignUpCredential,
    SignUpResponse
} from '@/@types/auth';
import ApiService from './ApiService';

export interface Attribute {
    id?: string;
    name: string;
    options: string[];
  }

export async function apiProductBasic() {
    return ApiService.fetchData({
        url: '/products/findBrandCategoriesAndSub',
        method: 'get',
    })
}


export async function apiProductAttribute() {
    return ApiService.fetchData({
        url: '/attribute',
        method: 'get',
    })
}

export async function apiSignUp(id: string, data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: `/subscription-links/${id}/user`,
        method: 'put',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/sign-out',
        method: 'post',
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData({
        url: '/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}
