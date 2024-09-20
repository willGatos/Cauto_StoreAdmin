import Layout from '@/components/layouts'
import Theme from '@/components/template/Theme'
import appConfig from '@/configs/app.config'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import './locales'
import mockServer from './mock'
import { AuthProvider } from './services/Supabase/Auth/AuthContext'
import store, { persistor } from './store'

const environment = import.meta.env.NODE_ENV

if (appConfig.enableMock) {
    if (environment === 'production') {
        mockServer({ environment: "production" })
    }

    if (environment === 'development') {
        mockServer({ environment: "development" })
    }

    console.log('mockServer is enabled')
    // mockServer()
} else {
    console.log('mockServer is disabled')
    // mockServer()
}



function App() {

    

    return (
        <AuthProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <BrowserRouter>
                        <Theme>
                            <Layout />
                        </Theme>
                    </BrowserRouter>
                </PersistGate>
            </Provider>
        </AuthProvider>
    )
}

export default App
