import { useEffect, useState } from "react";
import Loading from "@/components/shared/Loading";
import Statistic from "./Statistic";
import SalesReport from "./SalesReport";
import SalesByCategories from "./SalesByCategories";
import LatestOrder from "./LatestOrder";
import TopProduct from "./TopProduct";
import { getSalesDashboardData, useAppSelector } from "../store";
import { useAppDispatch } from "@/store";

const SalesDashboardBody = () => {
  const dispatch = useAppDispatch();

  const { shopId } = useAppSelector((state) => state.auth.user);
  const { dashboardData, startDate, endDate } = useAppSelector(
    (state) => state.salesDashboard.data
  );

  //const loading = useAppSelector((state) => state.salesDashboard.data.loading);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const fetchData = () => {
    dispatch(getSalesDashboardData({ startDate, endDate, shopId })).then(() =>
      setLoading(false)
    );
  };

  return (
    <Loading loading={loading}>
      <Statistic data={dashboardData?.statisticData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesReport
          data={dashboardData?.salesReportData}
          className="col-span-2"
        />
        <SalesByCategories data={dashboardData?.salesByCategoriesData} />
      </div>
      <SalesByCategories data={dashboardData?.supplyCostReportData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* <LatestOrder
          data={dashboardData?.latestOrderData}
          className="lg:col-span-2"
        /> */}
        <TopProduct data={dashboardData?.topProductsData} />
      </div>
    </Loading>
  );
};

export default SalesDashboardBody;
