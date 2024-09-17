import Container from '@/components/shared/Container'
import supabase from '@/services/Supabase/BaseClient'
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'

const Step1 = lazy(() => import('./components/Step1'))
const Step2 = lazy(() => import('./components/Step2'))
const Step3 = lazy(() => import('./components/Step3'))
const Step4 = lazy(() => import('./components/Step4'))
const QuickStart = lazy(() => import('./components/QuickStart'))

export type StoreData = {
    storeName: string;
    storeLogo: string;
    identifier: string;
    address: string;
    township: string;
    availableMoney?: number; // Optional because it's not present in Step2
    email?: string; // Optional because it's not present in Step2
    phone?: string; // Optional because it's not present in Step2
  };


const Welcome = () => {
    const [surveyStep, setSurveyStep] = useState(0)
    const [storeData, setStoreData] = useState<StoreData>({
        storeName: '',
        storeLogo: '',
        identifier: '',
        address: '',
        township: '',
        availableMoney: 0,
        email: '@gmail.com',
        phone: '+53',
      });

      useEffect(
        () => { 
        const data = async () => await supabase
        .from('products')
        .select(`
          *,
          currency:reference_currency(*),
          variations:product_variations(
            *,
            attribute_values:product_variation_attributes(
              attribute_values(*)
            )
          )
        `)

            data()
    }, [])
    const handleNext = useCallback(() => {
        setSurveyStep(surveyStep + 1)
    }, [surveyStep])

    const handleBack = useCallback(() => {
        setSurveyStep(surveyStep - 1)
    }, [surveyStep])

    const handleSkip = () => {
        setSurveyStep(4)
    }

    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <Suspense fallback={<></>}>
                    {surveyStep === 0 && (
                        <Step1  
                        onNext={handleNext} 
                        onSkip={handleSkip} />
                    )}
                    {surveyStep === 1 && (
                        <Step2 
                            storeData={storeData}
                            setStoreData={setStoreData} 
                            onNext={handleNext} 
                            onBack={handleBack} />
                    )}
                    {surveyStep === 2 && (
                        <Step3 
                            storeData={storeData}
                            setStoreData={setStoreData} 
                            onNext={handleNext} 
                            onBack={handleBack} 
                        />
                    )}
                </Suspense>
            </div>
        </Container>
    )
}

export default Welcome
