import ApiService from "./ApiService";
import supabase from "./Supabase/BaseClient";

export async function apiGetDelievery() {
  return ApiService.fetchData({
    url: "shops/delievery",
    method: "get",
  });
}

export async function apiPostDelievery(data: string) {
  return ApiService.fetchData({
    url: "shops/delievery",
    method: "post",
    data,
  });
}
// Función para mapear los estados de la orden (puede ajustarse)
export const mapOrderStatus = (status: string): number => {
    console.log(status)
  switch (status) {
    case "Pendiente":
      return 1;
    case "Completada":
      return 2;
    case "Cancelada":
      return 3;
    default:
      return 0;
  }
};

// Función para obtener el reporte de ventas distribuido por intervalos
export const getSalesReportByIntervals = async (intervals: number) => {
  const { data, error } = await supabase
    .rpc('get_sales_report_by_intervals', { intervals });

  if (error) {
    throw new Error(error.message);
  }


  // Mapeo de los datos para adaptarlos al formato esperado
  const salesReportData = {
    series: [
      {
        name: 'Ventas',
        data: data.map((interval) => interval.sales_count), // Cantidad de ventas por intervalo
      },
    ],
    categories: data.map((interval) => {
      // Crear una etiqueta para el intervalo de tiempo
      const startDate = new Date(interval.interval_start);
      const endDate = new Date(interval.interval_end);
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }),
  };

  return salesReportData;
};

export const getDashboardData = async () => {
  // Obtener todas las órdenes y productos vendidos
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('id, total, created_at, status, clients (name, email, phone)');

  if (ordersError) throw new Error(ordersError.message);

  // Filtrar las órdenes completadas ("Pagado a los Gestores")
  const completedOrders = ordersData.filter(order => order.status === 'Pagado a los Gestores');
  const totalCompletedOrders = completedOrders.length;

  // Calcular el total de ventas (Revenue)
  const totalRevenue = ordersData.reduce((acc, order) => acc + order.total, 0);

  // Obtener productos vendidos y sus variaciones
  const { data: productVariationsData, error: productVariationsError } = await supabase
    .from('product_variations')
    .select(`
      id, 
      products (id, name, images), 
      supply_variation!inner (cost)
    `);

  if (productVariationsError) throw new Error(productVariationsError.message);

  // Obtener insumos y sus variaciones
  const { data: suppliesData, error: suppliesError } = await supabase
    .from('supplies')
    .select('id, name, type, supply_variation (cost)');

  if (suppliesError) throw new Error(suppliesError.message);
  const salesReportData = await getSalesReportByIntervals(5);
      console.log(salesReportData)
  // Calcular el costo total de los insumos
  const totalSupplyCost = suppliesData.reduce((acc, supply) => {
    const supplyVariationCost = supply.supply_variation.reduce((costAcc, variation) => costAcc + variation.cost, 0);
    return acc + supplyVariationCost;
  }, 0);

  // Calcular el ingreso neto (totalRevenue - totalSupplyCost)
  const netIncome = totalRevenue - totalSupplyCost;

  // Placeholder para crecimiento/disminución del ingreso (se puede ajustar con una comparación temporal)
  const growShrinkIncome = (netIncome > 0 ? 5 : -5);  // Valor ficticio para ejemplo
  const growShrinkSupplies = totalSupplyCost > 0 ? 3 : -3;  // Valor ficticio

  // Obtener categorías de la base de datos
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');

  if (categoriesError) throw new Error(categoriesError.message);

  // Obtener órdenes y calcular porcentaje por categoría
  const { data: ordersCategoriesData, error: ordersCategoriesError } = await supabase
    .rpc('get_orders_count_by_category');  // Función en Supabase para el cálculo de porcentajes

  if (ordersCategoriesError) throw new Error(ordersCategoriesError.message);


  const salesByCategoriesData = {
    labels: ordersCategoriesData.map(category => category.name),
    data: ordersCategoriesData.map(category => category.orders_count),
  };

  // Obtener productos más vendidos desde Supabase
  const { data: topProductsData, error: topProductsError } = await supabase
    .rpc('get_top_selling_products');  // Función RPC en Supabase para obtener los productos más vendidos
  if (topProductsError) throw new Error(topProductsError.message);

  

  const { data:itemsInOrders, error } = await supabase
        .rpc('get_total_items_in_completed_orders'); // Llama a la función
  // Retornar el dashboard con los datos de insumos y estadísticas actualizadas
  return {
    statisticData: {
      revenue: {
        value: totalRevenue,
        growShrink: 5,  // Placeholder, ajustar según datos reales
      },
      orders: {
        value: ordersData.length,
        growShrink: 3,
      },
      purchases: {
        value: itemsInOrders,  // Contar órdenes en estado 'Completadas'
        growShrink: 2,
      },
      income: {
        value: netIncome,
        growShrink: growShrinkIncome,
      },
      supplies: {  // Añadimos los costos de insumos como estadística
        value: totalSupplyCost,
        growShrink: growShrinkSupplies,
      }
    },
    topProductsData: topProductsData.map(product => ({
      id: product.id,
      name: product.name,
      img: product.images,
      sold: product.sold,  // Número de ventas por producto
    })),
    salesReportData: salesReportData,

    salesByCategoriesData,  // Datos calculados de ventas por categoría
    latestOrderData: ordersData.map(order => ({
      id: order.id,
      date: new Date(order.created_at),
      customer: order.clients.name, // Aquí obtenemos el nombre del cliente
      status: mapOrderStatus(order.status),
      paymentMehod: 'Tarjeta',
      paymentIdendifier: 'Pago Completo',
      totalAmount: order.total,
    }))
  };
};

export async function apiGetSalesProducts<T, U extends Record<string, unknown>>(
  data: any
) {
  return ApiService.fetchData<T>({
    url: "products/getFiltered",
    method: "post",
    data,
  });
}

export async function apiGetProductsFromStoresProducts<
  T,
  U extends Record<string, unknown>
>() {
  //data: U
  return ApiService.fetchData<T>({
    url: "shops/productsFromStores",
    method: "get",
    // data,
  });
}

export async function apiDeleteSalesProducts<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: "products",
    method: "delete",
    data,
  });
}

export async function apiGetSalesProduct<T, U extends Record<string, unknown>>(
  params: U
) {
  return ApiService.fetchData<T>({
    url: "products",
    method: "get",
    params,
  });
}

export async function apiPutSalesProduct<T, U extends Record<string, unknown>>(
  data: U,
  params: any
) {
  return ApiService.fetchData<T>({
    url: "products",
    method: "put",
    data,
    params,
  });
}

export async function apiProductCreate(values: any) {
  return ApiService.fetchData({
    url: "/products/",
    method: "post",
    data: values,
  });
}

/* export async function apiCreateSalesProduct<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: 'products',
        method: 'post',
        data,
    })
} */

export async function apiGetSalesOrders<T, U extends Record<string, unknown>>(
  params: U
) {
  return ApiService.fetchData<T>({
    url: "/sales/orders",
    method: "get",
    params,
  });
}

export async function apiDeleteSalesOrders<
  T,
  U extends Record<string, unknown>
>(data: U) {
  return ApiService.fetchData<T>({
    url: "/sales/orders/delete",
    method: "delete",
    data,
  });
}

export async function apiGetSalesOrderDetails<
  T,
  U extends Record<string, unknown>
>(params: U) {
  return ApiService.fetchData<T>({
    url: "/sales/orders-details",
    method: "get",
    params,
  });
}
