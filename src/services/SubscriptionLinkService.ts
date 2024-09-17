import ApiService from './ApiService'

type MyApiResponse = {
    _id: string
    expDate: string
}

type MyApiRequest = {
    someRequestData: string
}

export async function SubscriptionLinkServiceCreate () {
    return ApiService.fetchData<MyApiResponse,MyApiRequest>({
        url: '/subscription-links',
        method: 'post',
    })
}

export async function getSubscriptionLinkService() {
    return ApiService.fetchData<MyApiResponse,MyApiRequest>({
        url: '/subscription-links',
        method: 'get',
    })
}