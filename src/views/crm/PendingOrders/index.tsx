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

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  selected_image: string;
  custom_design: string;
  custom_description: string;
}

interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  shipping_cost: number;
  amount_paid: number;
  items: OrderItem[];
}

interface ClientWithPendingOrders extends Client {
  pendingOrders: Order[];
}

// Supabase client
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Mock data service
const mockDataService = {
  getClientsWithPendingOrders: (): Promise<ClientWithPendingOrders[]> => {
    return Promise.resolve([
      {
        id: 1,
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        pendingOrders: [
          {
            id: 1,
            total: 150.00,
            status: 'pending',
            created_at: '2023-05-15T10:30:00Z',
            shipping_cost: 10.00,
            amount_paid: 50.00,
            items: [
              {
                id: 1,
                quantity: 2,
                price: 70.00,
                selected_image: '/placeholder.svg?height=50&width=50',
                custom_design: 'Custom logo',
                custom_description: 'Add company logo to the left chest'
              }
            ]
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
        pendingOrders: [
          {
            id: 2,
            total: 200.00,
            status: 'pending',
            created_at: '2023-05-16T14:45:00Z',
            shipping_cost: 15.00,
            amount_paid: 100.00,
            items: [
              {
                id: 2,
                quantity: 1,
                price: 185.00,
                selected_image: '/placeholder.svg?height=50&width=50',
                custom_design: 'Custom text',
                custom_description: 'Add "Best Team" text to the back'
              }
            ]
          }
        ]
      }
    ]);
  }
};

// Supabase data service
// const supabaseDataService = {
//   getClientsWithPendingOrders: async (): Promise<ClientWithPendingOrders[]> => {
//     const { data, error } = await supabase
//       .from('clients')
//       .select(`
//         id,
//         user:users (id, name, email, phone),
//         pendingOrders:orders (
//           id,
//           total,
//           status,
//           created_at,
//           shipping_cost,
//           amount_paid,
//           items:order_items (
//             id,
//             quantity,
//             price,
//             selected_image,
//             custom_design,
//             custom_description
//           )
//         )
//       `)
//       .eq('orders.status', 'pending');
    
//     if (error) {
//       console.error('Error fetching clients with pending orders:', error);
//       return [];
//     }
    
//     return data || [];
//   }
// };

// Use mock data service
const dataService = mockDataService;

export default function PendingOrdersView() {
  const [clientsWithPendingOrders, setClientsWithPendingOrders] = useState<ClientWithPendingOrders[]>([]);
  const [expandedClients, setExpandedClients] = useState<Record<number, boolean>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  useEffect(() => {
    dataService.getClientsWithPendingOrders().then(setClientsWithPendingOrders);
  }, []);

  const toggleClient = (clientId: number) => {
    setExpandedClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
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
      <h1 className="text-3xl font-bold mb-8">Clientes con Órdenes Pendientes</h1>
      
      <div className="space-y-4">
        {clientsWithPendingOrders.map(client => (
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
                <h3 className="text-lg font-semibold mb-2">Órdenes Pendientes</h3>
                <div className="space-y-4">
                  {client.pendingOrders.map(order => (
                    <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleOrder(order.id)}
                      >
                        <div className="flex items-center">
                          {expandedOrders[order.id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                          )}
                          <span className="font-semibold">Orden #{order.id}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>Total: {formatCurrency(order.total)}</span>
                          <span>Fecha: {formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      
                      {expandedOrders[order.id] && (
                        <div className="p-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p><strong>Estado:</strong> {order.status}</p>
                              <p><strong>Costo de envío:</strong> {formatCurrency(order.shipping_cost)}</p>
                              <p><strong>Monto pagado:</strong> {formatCurrency(order.amount_paid)}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Artículos</h4>
                              {order.items.map(item => (
                                <div key={item.id} className="mb-2">
                                  <p><strong>Cantidad:</strong> {item.quantity}</p>
                                  <p><strong>Precio:</strong> {formatCurrency(item.price)}</p>
                                  <p><strong>Diseño personalizado:</strong> {item.custom_design}</p>
                                  <p><strong>Descripción personalizada:</strong> {item.custom_description}</p>
                                  <img src={item.selected_image} alt="Imagen seleccionada" className="mt-2 w-20 h-20 object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}