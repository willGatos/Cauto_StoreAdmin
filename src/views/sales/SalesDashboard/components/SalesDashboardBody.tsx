import { useEffect, useState } from "react";
import Loading from "@/components/shared/Loading";
import Statistic from "./Statistic";
import SalesReport from "./SalesReport";
import SalesByCategories from "./SalesByCategories";
import LatestOrder from "./LatestOrder";
import TopProduct from "./TopProduct";
import { getSalesDashboardData, useAppSelector } from "../store";
import { useAppDispatch } from "@/store";
import supabase from "@/services/Supabase/BaseClient";

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
          id,
          created_at,
          total,
          status,
          client_id,
          amount_paid,
          clients: seller_id(id, name)
        `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  return data.map((order) => ({
    id: order.id.toString(),
    created_at: new Date(order.created_at).getTime(),
    customer: order.clients?.name || "Unknown",
    status: mapStatus(order.status),
    paymentMethod: "Not available", // This info is not in the provided schema
    paymentIdentifier: "Not available", // This info is not in the provided schema
    totalAmount: parseFloat(order.total),
  }));
};

const mapStatus = (status: string): number => {
  // Define your status mapping here
  const statusMap: { [key: string]: number } = {
    pending: 0,
    processing: 1,
    completed: 2,
    // Add more status mappings as needed
  };
  return statusMap[status] || 0;
};

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
