"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAppSelector } from "@/store";
import supabase from "@/services/Supabase/BaseClient";
import { SELLER_FIXED } from "@/constants/roles.constant";
import InviteButton from "@/views/sales/SellerList/components/InviteButton";
import { Loading } from "@/components/shared";

interface Order {
  id: number;
  total: number;
  status: number;
  created_at: string;
  order_items: {
    product_variations: {
      products: {
        commission_type: string;
        commission: number;
      };
    };
  }[];
}

interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  orders: Order[];
}

const orderStatusColor = {
  1: {
    label: "Pendiente",
    dotClass: "bg-yellow-500",
    textClass: "text-yellow-500",
  },
  2: {
    label: "En proceso",
    dotClass: "bg-blue-500",
    textClass: "text-blue-500",
  },
  3: {
    label: "Completada",
    dotClass: "bg-green-500",
    textClass: "text-green-500",
  },
  4: { label: "Cancelada", dotClass: "bg-red-500", textClass: "text-red-500" },
  5: {
    label: "Reembolsada",
    dotClass: "bg-purple-500",
    textClass: "text-purple-500",
  },
};

export default function Component() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSellers, setExpandedSellers] = useState<
    Record<number, boolean>
  >({});
  const { shopId, sellersShops } = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    setLoading(true);
    const fetchSellers = async () => {
      if (shopId) {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
          id,
          name,
          email,
          phone,
          shops!shop_seller(id),
          roles(name),
          orders (
            id,
            total,
            status,
            created_at,
            order_items (
              product_variations (
                products (
                  commission_type,
                  commission
                )
              )
            )
          )
        `
          )
          .eq("shops.id", shopId)
          .eq("roles.name", SELLER_FIXED)
          .in("orders.status", [4, 5]);
        if (error) {
          console.error("Error fetching sellers:", error);
        } else {
          // Filtrar por shopId después de obtener los datos
          const filteredSellers = data.filter((seller) =>
            seller.shops.some((shop) => shop.id === shopId)
          );

          setSellers(filteredSellers);
        }
      } else if (sellersShops) {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
              id,
              name,
              email,
              phone,
              shops!shop_seller(id),
              roles(name),
              orders (
                id,
                total,
                status,
                created_at,
                order_items (
                  product_variations (
                    products (
                      commission_type,
                      commission
                    )
                  )
                )
              )
            `
          )
          .in("shops.id", sellersShops)
          .eq("roles.name", SELLER_FIXED)
          .in("orders.status", [4, 5]);
        if (error) {
          console.error("Error fetching sellers:", error);
        } else {
          // Filtrar por shopId después de obtener los datos
          const filteredSellers = data.filter((seller) => {
            return seller.shops.some((shop) =>
              sellersShops.some((sellerShop) => sellerShop == shop.id)
            );
          });

          setSellers(filteredSellers);
        }
      }
    };

    fetchSellers().then(() => setLoading(false));
  }, [shopId]);

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
    let totalSales = 0;
    let totalCommission = 0;

    orders.forEach((order) => {
      totalSales += order.total;
      order.order_items.forEach((item) => {
        const product = item.product_variations.products;
        if (product.commission_type === "percentage") {
          totalCommission += order.total * (product.commission / 100);
        } else {
          totalCommission += product.commission;
        }
      });
    });

    const completedOrders = orders.filter((order) => order.status === 3).length;

    return {
      totalSales: formatCurrency(totalSales),
      totalCommission: formatCurrency(totalCommission),
      completedOrders,
      totalOrders: orders.length,
    };
  };

  return (
    <Loading loading={loading}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Rendimiento de Vendedores</h1>
        <div className="my-5">
          <InviteButton />
        </div>
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
                <th className="py-2 px-4 border-b text-left">Comisión Total</th>
                <th className="py-2 px-4 border-b text-left">
                  Órdenes Completadas
                </th>
                <th className="py-2 px-4 border-b text-left">
                  Total de Órdenes
                </th>
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
                        {performance.totalCommission}
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
                              </tr>
                            </thead>
                            <tbody>
                              {seller.orders.map((order) => (
                                <tr
                                  key={order.id}
                                  className="hover:bg-gray-100"
                                >
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
                                      className={`ml-2 rtl:mr-2 capitalize font-semibold ${
                                        orderStatusColor[order.status].textClass
                                      }`}
                                    >
                                      {orderStatusColor[order.status].label}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDate(order.created_at)}
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
    </Loading>
  );
}
