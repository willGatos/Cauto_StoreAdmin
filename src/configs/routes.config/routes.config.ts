import type { Routes } from '@/@types/routes'
import appsRoute from './appsRoute'
import authRoute from './authRoute'
import pagesRoute from './pagesRoute'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    ...appsRoute,
    ...pagesRoute,
    ...authRoute,
]
