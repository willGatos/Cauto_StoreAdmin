import { supabaseService } from '@/services/Supabase/AttributeService'
import { Supply, SupplyVariation } from '@/@types/supply'
import { useEffect, useState } from 'react'
const useSupplyManagement = () => {
    const [supplies, setSupplies] = useState<Supply[]>([])
    const [selectedSupplyIds, setSelectedSupplyIds] = useState<number[]>([])
    const [supplyVariations, setSupplyVariations] = useState<SupplyVariation[]>(
        []
    )
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSupplies = async () => {
            try {
                setLoading(true)
                await supabaseService.getAllSupplies().then(setSupplies)
            } catch (err) {
                setError('Error fetching supplies')
            } finally {
                setLoading(false)
            }
        }
        fetchSupplies()
    }, [])

    useEffect(() => {
        const fetchSupplyVariations = async () => {
            if (selectedSupplyIds.length > 0) {
                try {
                    setLoading(true)
                    await supabaseService
                        .getSupplyVariationsBySupplies(selectedSupplyIds)
                        .then(setSupplyVariations)
                } catch (err) {
                    setError('Error fetching supply variations')
                } finally {
                    setLoading(false)
                }
            } else {
                setSupplyVariations([])
            }
        }
        fetchSupplyVariations()
    }, [selectedSupplyIds])

    return {
        supplies,
        selectedSupplyIds,
        setSelectedSupplyIds,
        supplyVariations,
        loading,
        error,
    }
}

export default useSupplyManagement
