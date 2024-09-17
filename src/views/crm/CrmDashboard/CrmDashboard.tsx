import { injectReducer } from '@/store/'
import { useEffect } from 'react'
import Sellers from './components/Sellers'
import Statistic from './components/Statistic'
import reducer, {
    getCrmDashboardData,
    useAppDispatch,
    useAppSelector,
} from './store'



injectReducer('crmDashboard', reducer)

const CrmDashboard = () => {
    const dispatch = useAppDispatch()

    const { statisticData, leadByRegionData, recentLeadsData, emailSentData } =
        useAppSelector((state) => state.crmDashboard.data.dashboardData)
    const loading = useAppSelector((state) => state.crmDashboard.data.loading)

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = () => {
        dispatch(getCrmDashboardData())
    }

    return (
        <div className="flex flex-col gap-4 h-full">

           {/*  <Loading loading={loading}> */}
                <Statistic data={statisticData} />

                <Sellers data={recentLeadsData} />
            {/* </Loading> */}
        </div>
    )
}

export default CrmDashboard
                {/* <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
                    <LeadByCountries
                        className="xl:col-span-5"
                        data={leadByRegionData}
                    />
                    <EmailSent className="xl:col-span-2" data={emailSentData} />
                </div> */}