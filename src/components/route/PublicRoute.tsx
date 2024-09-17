import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import useAuth from '@/utils/hooks/useAuth'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { authenticated } = useAuth()
    const location = useLocation()
    const {subscriptionId} = useParams()
    
    return authenticated ? 
    
    ( location.pathname.includes("sign-up")
        ? "/pages/welcome/" + subscriptionId 
        : <Navigate to={authenticatedEntryPath} /> 
    )
    : <Outlet />
}

export default PublicRoute
