import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Phone, Mail } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Client {
  id: number;
  user: User;
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  shipping_cost: number;
  amount_paid: number;
}

interface ClientWithOrders extends Client {
  orders: Order[];
}

// Mock data service
const mockDataService = {
  getClientsWithOrders: (sellerId: number): Promise<ClientWithOrders[]> => {
    return Promise.resolve([
      {
        id: 1,
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        orders: [
          {
            id: 1,
            total: 150.00,
            status: 'completed',
            created_at: '2023-05-15T10:30:00Z',
            shipping_cost: 10.00,
            amount_paid: 150.00
          },
          {
            id: 2,
            total: 200.00,
            status: 'pending',
            created_at: '2023-05-20T14:45:00Z',
            shipping_cost: 15.00,
            amount_paid: 100.00
          }
        ]
      },
      {
        id: 2,
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        },
        orders: [
          {
            id: 3,
            total: 75.00,
            status: 'completed',
            created_at: '2023-05-18T09:15:00Z',
            shipping_cost: 5.00,
            amount_paid: 75.00
          }
        ]
      }
    ]);
  }
};

// Supabase data service
// const supabaseDataService = {
//   getClientsWithOrders: async (sellerId: number): Promise<ClientWithOrders[]> => {
//     const { data, error } = await supabase
//       .from('clients')
//       .select(`
//         id,
//         user:users (id, name, email, phone),
//         orders (
//           id,
//           total,
//           status,
//           created_at,
//           shipping_cost,
//           amount_paid
//         )
//       `)
//       .eq('orders.seller_id', sellerId);
    
//     if (error) {
//       console.error('Error fetching clients with orders:', error);
//       return [];
//     }
    
//     return data || [];
//   }
// };

// Use mock data service
const dataService = mockDataService;

function SellerClientsView() {
  const [clientsWithOrders, setClientsWithOrders] = useState<ClientWithOrders[]>([]);
  const [expandedClients, setExpandedClients] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Assuming seller ID is 1 for this example
    dataService.getClientsWithOrders(1).then(setClientsWithOrders);
  }, []);

  const toggleClient = (clientId: number) => {
    setExpandedClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Clientes y sus Órdenes</h1>
      
      <div className="space-y-4">
        {clientsWithOrders.map(client => (
          <div key={client.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleClient(client.id)}
            >
              <div className="flex items-center">
                {expandedClients[client.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <h2 className="text-xl font-semibold">{client.user.name}</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-1" />
                  {client.user.phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-1" />
                  {client.user.email}
                </div>
              </div>
            </div>
            
            {expandedClients[client.id] && (
              <div className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Órdenes del Cliente</h3>
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="py-2 px-4 text-left">ID</th>
                      <th className="py-2 px-4 text-left">Fecha</th>
                      <th className="py-2 px-4 text-left">Estado</th>
                      <th className="py-2 px-4 text-left">Total</th>
                      <th className="py-2 px-4 text-left">Envío</th>
                      <th className="py-2 px-4 text-left">Pagado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4">{order.id}</td>
                        <td className="py-2 px-4">{formatDate(order.created_at)}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded ${
                            order.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2 px-4">{formatCurrency(order.total)}</td>
                        <td className="py-2 px-4">{formatCurrency(order.shipping_cost)}</td>
                        <td className="py-2 px-4">{formatCurrency(order.amount_paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function index (){
    return <div>
        <SellerClientsView />
    </div>
}