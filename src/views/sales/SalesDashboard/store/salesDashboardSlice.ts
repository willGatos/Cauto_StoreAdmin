import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { getDashboardData } from "@/services/SalesService";
import supabase from "@/services/Supabase/BaseClient";

export const getOrders = async () => {
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

type Statistic = {
  value: number;
  growShrink: number;
};

export type DashboardData = {
  statisticData?: {
    revenue: Statistic;
    orders: Statistic;
    purchases: Statistic;
  };
  salesReportData?: {
    series: {
      name: string;
      data: number[];
    }[];
    categories: string[];
  };
  topProductsData?: {
    id: string;
    name: string;
    img: string;
    sold: number;
  }[];
  latestOrderData?: {
    id: string;
    date: number;
    customer: string;
    status: number;
    paymentMehod: string;
    paymentIdendifier: string;
    totalAmount: number;
  }[];
  salesByCategoriesData?: {
    labels: string[];
    data: number[];
  };
};

type DashboardDataResponse = DashboardData;

export type SalesDashboardState = {
  startDate: number;
  endDate: number;
  loading: boolean;
  dashboardData: DashboardData;
};

export const SLICE_NAME = "salesDashboard";

export const getSalesDashboardData = createAsyncThunk(
  SLICE_NAME + "/getSalesDashboardData",
  async () => {
    const response = await getDashboardData();
    return response;
  }
);


const initialState: SalesDashboardState = {
  startDate: dayjs(
    dayjs().subtract(3, "month").format("DD-MMM-YYYY, hh:mm A")
  ).unix(),
  endDate: dayjs(new Date()).unix(),
  loading: true,
  dashboardData: {},
};

const salesDashboardSlice = createSlice({
  name: `${SLICE_NAME}/state`,
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<number>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<number>) => {
      state.endDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSalesDashboardData.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
        state.loading = false;
      })
      .addCase(getSalesDashboardData.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { setStartDate, setEndDate } = salesDashboardSlice.actions;

export default salesDashboardSlice.reducer;
