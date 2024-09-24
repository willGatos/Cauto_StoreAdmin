import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import InviteButton from "./components/InviteButton";
interface Seller {
  id: string;
  name: string;
  email: string;
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  shipping_cost: number | null;
  amount_paid: number | null;
  client: {
    id: number;
    location: {
      name: string;
      municipality: {
        name: string;
        province: {
          name: string;
        };
      };
    };
  };
}

interface SellerWithOrders extends Seller {
  orders: Order[];
}

// Mock data service
const mockDataService = {
  getSellers: async (): Promise<SellerWithOrders[]> => {
    return [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@example.com",
        orders: [
          {
            id: 1,
            total: 100.0,
            status: "completed",
            created_at: "2023-05-01T10:00:00Z",
            shipping_cost: 10.0,
            amount_paid: 110.0,
            client: {
              id: 1,
              location: {
                name: "Calle Principal 123",
                municipality: {
                  name: "Santo Domingo Este",
                  province: {
                    name: "Santo Domingo",
                  },
                },
              },
            },
          },
          {
            id: 2,
            total: 75.5,
            status: "pending",
            created_at: "2023-05-02T14:30:00Z",
            shipping_cost: 5.0,
            amount_paid: null,
            client: {
              id: 2,
              location: {
                name: "Avenida Central 456",
                municipality: {
                  name: "Santiago de los Caballeros",
                  province: {
                    name: "Santiago",
                  },
                },
              },
            },
          },
        ],
      },
      {
        id: "2",
        name: "María Rodríguez",
        email: "maria@example.com",
        orders: [
          {
            id: 3,
            total: 150.25,
            status: "shipped",
            created_at: "2023-05-03T09:15:00Z",
            shipping_cost: 15.0,
            amount_paid: 165.25,
            client: {
              id: 3,
              location: {
                name: "Calle Duarte 789",
                municipality: {
                  name: "La Romana",
                  province: {
                    name: "La Romana",
                  },
                },
              },
            },
          },
        ],
      },
    ];
  },
};

// Supabase service (commented out)

const supabaseDataService = {
  getSellers: async (): Promise<SellerWithOrders[]> => {
    const { data: sellers, error: sellersError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'seller')

    if (sellersError) {
      throw sellersError
    }

    const sellersWithOrders: SellerWithOrders[] = []

    for (const seller of sellers) {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          status,
          created_at,
          shipping_cost,
          amount_paid,
          client:clients (
            id,
            location:locations (
              name,
              municipality:municipalities (
                name,
                province:provinces (
                  name
                )
              )
            )
          )
        `)
        .eq('seller_id', seller.id)

      if (ordersError) {
        throw ordersError
      }

      sellersWithOrders.push({
        ...seller,
        orders: orders
      })
    }

    return sellersWithOrders
  }
}

// Choose which service to use
const dataService = mockDataService;
// const dataService = supabaseDataService

export default function SellerOrdersTable() {
  const [sellers, setSellers] = useState<SellerWithOrders[]>([]);
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const loadSellers = async () => {
      const data = await dataService.getSellers();
      setSellers(data);
    };
    loadSellers();
  }, []);

  const toggleSellerExpansion = (sellerId: string) => {
    setExpandedSeller(expandedSeller === sellerId ? null : sellerId);
    setCurrentPage(1);
  };

  const renderOrdersTable = (orders: Order[]) => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    return (
      <>
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${order.client.location.name}, ${order.client.location.municipality.name}, ${order.client.location.municipality.province.name}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(orders.length)}
        </div>
      </>
    );
  };

  const renderPagination = (totalOrders: number) => {
    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * ordersPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * ordersPerPage, totalOrders)}
              </span>{" "}
              of <span className="font-medium">{totalOrders}</span> results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <Button
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">First</span>
                <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Last</span>
                <ChevronsRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 my-6">
        Seller Orders
      </h1>
      <InviteButton/>

      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Expand
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <React.Fragment key={seller.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleSellerExpansion(seller.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {expandedSeller === seller.id ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {seller.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {seller.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {seller.orders.length}
                        </td>
                      </tr>
                      {expandedSeller === seller.id && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4">
                            {renderOrdersTable(seller.orders)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
