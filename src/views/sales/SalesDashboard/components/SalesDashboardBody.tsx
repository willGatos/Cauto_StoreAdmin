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
  const [data, setData] = useState([]);
  const dashboardData = useAppSelector(
    (state) => state.salesDashboard.data.dashboardData
  );

  //const loading = useAppSelector((state) => state.salesDashboard.data.loading)

  // TODO: Hacer el servicio en Backend y Frontend para traer a
  // TODO: Todos los vendedores referenciados a la tienda

  useEffect(() => {
    getOrders().then(setData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = () => {
    dispatch(getSalesDashboardData());
  };

  return (
    <Loading loading={false}>
      <Statistic data={dashboardData?.statisticData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesReport
          data={dashboardData?.salesReportData}
          className="col-span-2"
        />
        <SalesByCategories data={dashboardData?.salesByCategoriesData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LatestOrder data={data} className="lg:col-span-2" />
        <TopProduct data={dashboardData?.topProductsData} />
      </div>
    </Loading>
  );
};

export default SalesDashboardBody;
