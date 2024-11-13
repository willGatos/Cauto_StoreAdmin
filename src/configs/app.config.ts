
export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    authenticatedEntryPathForSellers: string
    tourPath: string
    locale: string
    enableMock: boolean
}

const appConfig: AppConfig = {
    apiPrefix: 'http://localhost:3000/',// /api
    authenticatedEntryPath: "/app/sales/product-list",//'',
    authenticatedEntryPathForSellers: "/app/sales/leaderboardSellers",
    unAuthenticatedEntryPath: '/sign-in',
    tourPath: '/app/account/kyc-form',
    locale: 'es',
    enableMock: false,
}

export default appConfig
