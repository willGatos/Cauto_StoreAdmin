import { useState, useEffect } from "react";

export const useService = (service) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data } = await service()
            setData( data )
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return [data, setData, loading, error, fetchData]
}