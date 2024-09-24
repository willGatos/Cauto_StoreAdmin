import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Types
interface Order {
  id: number;
  total: number;
  status: string;
  created_at: string;
  shipping_cost: number;
  amount_paid: number;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  variation: ProductVariation;
}

interface ProductVariation {
  id: number;
  name: string;
  price: number;
  currency: Currency;
  supplies: SupplyVariation[];
}

interface SupplyVariation {
  id: number;
  cost: number;
  currency: Currency;
  description: string;
  measure: string;
}

interface Currency {
  id: number;
  name: string;
  exchange_rate: number;
}

// Supabase client
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Mock data service
const mockDataService = {
  getOrders: (): Promise<Order[]> => {
    return Promise.resolve([
      {
        id: 1,
        total: 150.00,
        status: 'Completada',
        created_at: '2023-01-05T10:30:00Z',
        shipping_cost: 10.00,
        amount_paid: 150.00,
        items: [
          {
            id: 1,
            quantity: 2,
            price: 70.00,
            variation: {
              id: 1,
              name: 'Camiseta Roja - Talla M',
              price: 70.00,
              currency: { id: 1, name: 'USD', exchange_rate: 320 },
              supplies: [
                {
                  id: 1,
                  cost: 20.00,
                  currency: { id: 1, name: 'USD', exchange_rate: 320 },
                  description: 'Tela',
                  measure: '1 metro'
                },
                {
                  id: 2,
                  cost: 5.00,
                  currency: { id: 1, name: 'USD', exchange_rate: 320 },
                  description: 'Hilo',
                  measure: '10 metros'
                }
              ]
            }
          }
        ]
      },
      {
        id: 2,
        total: 200.00,
        status: 'En proceso',
        created_at: '2023-01-10T14:45:00Z',
        shipping_cost: 15.00,
        amount_paid: 100.00,
        items: [
          {
            id: 2,
            quantity: 1,
            price: 185.00,
            variation: {
              id: 2,
              name: 'Zapatos Deportivos - Talla 39',
              price: 185.00,
              currency: { id: 1, name: 'USD', exchange_rate: 320 },
              supplies: [
                {
                  id: 3,
                  cost: 50.00,
                  currency: { id: 1, name: 'USD', exchange_rate: 320 },
                  description: 'Cuero',
                  measure: '0.5 metros cuadrados'
                },
                {
                  id: 4,
                  cost: 20.00,
                  currency: { id: 1, name: 'USD', exchange_rate: 320 },
                  description: 'Suela',
                  measure: '1 par'
                }
              ]
            }
          }
        ]
      }
    ]);
  },
  getCurrencies: (): Promise<Currency[]> => {
    return Promise.resolve([
      { id: 1, name: 'USD', exchange_rate: 320 },
      { id: 2, name: 'EUR', exchange_rate: 340 },
      { id: 3, name: 'MLC', exchange_rate: 240 },
      { id: 4, name: 'CUP', exchange_rate: 1 }
    ]);
  }
};

// Supabase data service
// const supabaseDataService = {
//   getOrders: async (): Promise<Order[]> => {
//     const { data, error } = await supabase
//       .from('orders')
//       .select(`
//         *,
//         items:order_items (
//           id,
//           quantity,
//           price,
//           variation:product_variations (
//             id,
//             name,
//             price,
//             currency:currencies (*),
//             supplies:supply_variations (
//               id,
//               cost,
//               currency:currencies (*),
//               description,
//               measure
//             )
//           )
//         )
//       `)
//       .order('created_at', { ascending: false });
    
//     if (error) {
//       console.error('Error fetching orders:', error);
//       return [];
//     }
    
//     return data || [];
//   },
//   getCurrencies: async (): Promise<Currency[]> => {
//     const { data, error } = await supabase
//       .from('currencies')
//       .select('*')
//       .order('id');
    
//     if (error) {
//       console.error('Error fetching currencies:', error);
//       return [];
//     }
    
//     return data || [];
//   }
// };

// Use mock data service
const dataService = mockDataService;

export default function Component() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    dataService.getOrders().then(orders => {
      setOrders(orders);
      setFilteredOrders(orders);
    });
    dataService.getCurrencies().then(currencies => {
      setCurrencies(currencies);
      setSelectedCurrency(currencies.find(c => c.name === 'CUP') || currencies[0]);
    });
  }, []);

  useEffect(() => {
    filterOrders();
  }, [startDate, endDate, orders]);

  const filterOrders = () => {
    let filtered = orders;
    if (startDate && endDate) {
      filtered = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      });
    }
    setFilteredOrders(filtered);
  };

  const toggleOrder = (id: number) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
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

  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency.name }).format(amount);
  };

  const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency) => {
    return (amount * fromCurrency.exchange_rate) / toCurrency.exchange_rate;
  };

  const calculateNetProfit = (orders: Order[]) => {
    return orders.reduce((total, order) => {
      const orderTotal = convertCurrency(order.amount_paid, order.items[0].variation.currency, selectedCurrency!);
      const suppliesCost = order.items.reduce((itemTotal, item) => {
        return itemTotal + item.variation.supplies.reduce((supplyTotal, supply) => {
          return supplyTotal + convertCurrency(supply.cost, supply.currency, selectedCurrency!);
        }, 0);
      }, 0);
      return total + (orderTotal - suppliesCost);
    }, 0);
  };

  const calculateProgrammerPay = (netProfit: number) => {
    return netProfit * 0.02; // 2% of net profit
  };

  const netProfit = calculateNetProfit(filteredOrders);
  const programmerPay = calculateProgrammerPay(netProfit);

  if (!selectedCurrency) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Órdenes y Suministros</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {currencies.map(currency => (
          <button
            key={currency.id}
            className={`p-4 border rounded ${selectedCurrency.id === currency.id ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setSelectedCurrency(currency)}
          >
            <div className="font-bold">{currency.name}</div>
            <div>Tasa: {currency.exchange_rate}</div>
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-green-100 rounded">
          <h2 className="text-xl font-bold mb-2">Beneficio Neto</h2>
          <p className="text-2xl">{formatCurrency(netProfit, selectedCurrency)}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="text-xl font-bold mb-2">Pago del Programador (2%)</h2>
          <p className="text-2xl">{formatCurrency(programmerPay, selectedCurrency)}</p>
        </div>
      </div>

      <div className="mb-8 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="startDate" className="font-bold">Fecha inicial:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="endDate" className="font-bold">Fecha final:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <button
          onClick={filterOrders}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Filtrar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left"></th>
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Total</th>
              <th className="py-2 px-4 border-b text-left">Estado</th>
              <th className="py-2 px-4 border-b text-left">Fecha de Creación</th>
              <th className="py-2 px-4 border-b text-left">Ingresos Reportados</th>
              <th className="py-2 px-4 border-b text-left">Ingresos Pagados</th>
              <th className="py-2 px-4 border-b text-left">Costos de Insumos</th>
              <th className="py-2 px-4 border-b text-left">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => {
              const suppliesCost = order.items.reduce((total, item) => {
                return total + item.variation.supplies.reduce((supplyTotal, supply) => {
                  return supplyTotal + convertCurrency(supply.cost, supply.currency, selectedCurrency);
                }, 0);
              }, 0);
              const totalValue = convertCurrency(order.amount_paid, order.items[0].variation.currency, selectedCurrency) - suppliesCost;

              return (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="focus:outline-none"
                        aria-label={expandedOrders[order.id] ? "Contraer orden" : "Expandir orden"}
                      >
                        {expandedOrders[order.id] ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">{order.id}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(convertCurrency(order.total, order.items[0].variation.currency, selectedCurrency), selectedCurrency)}</td>
                    <td className="py-2 px-4 border-b">{order.status}</td>
                    <td className="py-2 px-4 border-b">{formatDate(order.created_at)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(convertCurrency(order.total, order.items[0].variation.currency, selectedCurrency), selectedCurrency)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(convertCurrency(order.amount_paid, order.items[0].variation.currency, selectedCurrency), selectedCurrency)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(suppliesCost, selectedCurrency)}</td>
                    <td className="py-2 px-4 border-b">{formatCurrency(totalValue, selectedCurrency)}</td>
                  </tr>
                  {expandedOrders[order.id] && (
                    <tr>
                      <td colSpan={9} className="py-2 px-4 border-b">
                        <table className="min-w-full bg-gray-50">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b text-left">Producto</th>
                              <th className="py-2 px-4 border-b text-left">Cantidad</th>
                              <th className="py-2 px-4 border-b text-left">Precio</th>
                              <th className="py-2 px-4 border-b text-left">Insumo</th>
                              <th className="py-2 px-4 border-b text-left">Costo</th>
                              <th className="py-2 px-4 border-b text-left">Medida</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <React.Fragment key={item.id}>
                                {item.variation.supplies.map((supply, index) => (
                                  <tr key={supply.id} className="hover:bg-gray-100">
                                    {index === 0 && (
                                      <>
                                        <td className="py-2 px-4 border-b"
                                            rowSpan={item.variation.supplies.length}>
                                          {item.variation.name}
                                        </td>
                                        <td className="py-2 px-4 border-b"
                                            rowSpan={item.variation.supplies.length}>
                                          {item.quantity}
                                        </td>
                                        <td className="py-2 px-4 border-b"
                                            rowSpan={item.variation.supplies.length}>
                                          {formatCurrency(convertCurrency(item.price, item.variation.currency, selectedCurrency), selectedCurrency)}
                                        </td>
                                      </>
                                    )}
                                    <td className="py-2 px-4 border-b">{supply.description}</td>
                                    <td className="py-2 px-4 border-b">
                                      {formatCurrency(convertCurrency(supply.cost, supply.currency, selectedCurrency), selectedCurrency)}
                                    </td>
                                    <td className="py-2 px-4 border-b">{supply.measure}</td>
                                  </tr>
                                ))}
                              </React.Fragment>
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