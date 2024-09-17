import { useState, useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import DelieveryForm from './OrderForm'
import isEmpty from 'lodash/isEmpty'
import { apiGetDelievery, apiPostDelievery } from '@/services/SalesService'


const DelieveryWrapper = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [delieveyData, setDelieveyData] = useState({messagerPricingList:""})

    const fetchData = () => {
        apiGetDelievery()
        .then((res)=> {
            console.log(res.data)
            setDelieveyData(res.data)
            setIsLoading(false)
        })
    }

    const handleFormSubmit = async (
        values: string,
    ) => {
        const success = await apiPostDelievery(values)
        if (success) {
            popNotification('Guardada')
        }
    }

    const popNotification = (keyword: string) => {
        toast.push(
            <Notification
                title={`Successfuly ${keyword}`}
                type="success"
                duration={2500}
            >
                Mensajería Exitosamente {keyword}
            </Notification>,
            {
                placement: 'top-center',
            }
        )
       // navigate('/app/sales/product-list')
    }

    useEffect(() => {
        setIsLoading(true)
        fetchData()
    }, [])

    return (
        <>
            <Loading loading={isLoading}>
                {!isEmpty(delieveyData) && (
                    <>
                        <DelieveryForm
                            type="edit"
                            initialData={delieveyData}
                            onFormSubmit={handleFormSubmit}
                        />
                    </>
                )}
            </Loading>
            
        </>
    )
}

export default DelieveryWrapper
