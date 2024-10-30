import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import supabase from "@/services/Supabase/BaseClient";
import { orderStatusColor } from "@/views/sales/SalesDashboard/components/LatestOrder";
import { Badge } from "@/components/ui";

// Types
interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  orders: Order[];
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
}

// Supabase client
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Mock data service
const mockDataService = {
  getSellers: (): Promise<Seller[]> => {
    return Promise.resolve([
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+1234567890",
        created_at: "2023-01-01T00:00:00Z",
        orders: [
          {
            id: 1,
            total: 150.0,
            status: "Completada",
            created_at: "2023-05-15T10:30:00Z",
          },
          {
            id: 2,
            total: 200.0,
            status: "En proceso",
            created_at: "2023-05-16T14:45:00Z",
          },
        ],
      },
      {
        id: 2,
        name: "María González",
        email: "maria@example.com",
        phone: "+0987654321",
        created_at: "2023-02-01T00:00:00Z",
        orders: [
          {
            id: 3,
            total: 300.0,
            status: "Completada",
            created_at: "2023-05-17T09:15:00Z",
          },
          {
            id: 4,
            total: 175.5,
            status: "Pendiente",
            created_at: "2023-05-18T16:20:00Z",
          },
        ],
      },
    ]);
  },
};

const supabaseDataService = {
  getSellersWithPendingOrders: async (): Promise<any[]> => {
    const { data, error } = await supabase.rpc(
      "get_sellers_with_pending_orders"
    ); // Llamada a la función RPC

    if (error) {
      console.error("Error fetching sellers with pending orders:", error);
      return [];
    }

    // Transformar los datos al formato deseado
    const transformedData = data.reduce((result, current) => {
      const sellerIndex = result.findIndex(
        (seller) => seller.email === current.email
      );

      // Si el vendedor ya está en la lista, agregarle la nueva orden
      if (sellerIndex !== -1) {
        result[sellerIndex].orders.push({
          id: current.order_id,
          total: current.total,
          status: current.status,
          created_at: current.created_at,
        });
      } else {
        // Si el vendedor no está en la lista, agregarlo con sus datos y su primera orden
        result.push({
          id: current.seller_id,
          name: current.name || "Nombre no disponible",
          email: current.email,
          phone: current.phone,
          created_at: current.created_at,
          orders: [
            {
              id: current.order_id,
              total: current.total,
              status: current.status,
              created_at: current.created_at,
            },
          ],
        });
      }
      return result;
    }, []);

    return transformedData || [];
  },
};

// Use mock data service
const dataService = supabaseDataService;

export default function Component() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [expandedSellers, setExpandedSellers] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    dataService.getSellersWithPendingOrders().then(setSellers);
  }, []);

  const toggleSeller = (id: number) => {
    setExpandedSellers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculatePerformance = (orders: Order[]) => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(
      (order) => order.status === "Completada"
    ).length;
    return {
      totalSales: formatCurrency(totalSales),
      completedOrders,
      totalOrders: orders.length,
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Rendimiento de Vendedores</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left"></th>
              <th className="py-2 px-4 border-b text-left">Nombre</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Teléfono</th>
              <th className="py-2 px-4 border-b text-left">
                Fecha de Registro
              </th>
              <th className="py-2 px-4 border-b text-left">Ventas Totales</th>
              <th className="py-2 px-4 border-b text-left">
                Órdenes Completadas
              </th>
              <th className="py-2 px-4 border-b text-left">Total de Órdenes</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => {
              const performance = calculatePerformance(seller.orders);
              return (
                <React.Fragment key={seller.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => toggleSeller(seller.id)}
                        className="focus:outline-none"
                        aria-label={
                          expandedSellers[seller.id]
                            ? "Contraer vendedor"
                            : "Expandir vendedor"
                        }
                      >
                        {expandedSellers[seller.id] ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">{seller.name}</td>
                    <td className="py-2 px-4 border-b">{seller.email}</td>
                    <td className="py-2 px-4 border-b">{seller.phone}</td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(seller.created_at)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {performance.totalSales}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {performance.completedOrders}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {performance.totalOrders}
                    </td>
                  </tr>
                  {expandedSellers[seller.id] && (
                    <tr>
                      <td colSpan={9} className="py-2 px-4 border-b">
                        <table className="min-w-full bg-gray-50">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b text-left">
                                ID de Orden
                              </th>
                              <th className="py-2 px-4 border-b text-left">
                                Total
                              </th>
                              <th className="py-2 px-4 border-b text-left">
                                Estado
                              </th>
                              <th className="py-2 px-4 border-b text-left">
                                Fecha de Creación
                              </th>
                              <th className="py-2 px-4 border-b text-left">
                                Acción
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {seller.orders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">
                                  {order.id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  {formatCurrency(order.total)}
                                </td>
                                <td className="py-2 px-4 border-b">

                                  <Badge
                                    className={
                                      orderStatusColor[order.status].dotClass
                                    }
                                  />
                                  <span
                                    className={`ml-2 rtl:mr-2 capitalize font-semibold ${orderStatusColor[order.status].textClass}`}
                                  >
                                    {orderStatusColor[order.status].label}
                                  </span>
                                </td>
                                <td className="py-2 px-4 border-b">
                                  {formatDate(order.created_at)}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  <a
                                    href={`/orders/${order.id}`}
                                    className="text-blue-500 hover:text-blue-700 flex items-center"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Ver orden
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
