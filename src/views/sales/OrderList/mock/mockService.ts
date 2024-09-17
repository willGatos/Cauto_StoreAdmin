import { Order } from "@/@types/orders";
  
// Mock data service
export const mockOrderService = {
    getOrders: (): Promise<Order[]> => {
      return Promise.resolve([
        {
          id: 1,
          total: 150.00,
          status: 'Pendiente',
          created_at: '2023-05-15T10:30:00Z',
          shipping_cost: 10.00,
          seller_id: 1, 
          amount_paid: 0, 
          items: [
            {
              id: 1,
              quantity: 2,
              price: 70.00,
              variation: {
                id: 1,
                product_id: 1,
                name: 'Camiseta Roja - Talla M',
                price: 35.00,
                stock: 50,
                created_at: '2023-05-10T09:00:00Z',
                thumbnail: '/placeholder.svg?height=50&width=50',
                pictures: ['/placeholder1.svg', '/placeholder2.svg'],
                currency: { id: 1, name: 'USD' },
                attributes: [
                  { id: 1, attribute_id: 1, value: 'Rojo' },
                  { id: 2, attribute_id: 2, value: 'M' }
                ],
                supplies: [
                  { id: 1, supply_id: 1, quantity: 2 },
                  { id: 2, supply_id: 2, quantity: 1 }
                ]
              }
            },
            {
              id: 2,
              quantity: 1,
              price: 80.00,
              variation: {
                id: 2,
                product_id: 2,
                name: 'Pantalón Negro - Talla 32',
                price: 80.00,
                stock: 30,
                created_at: '2023-04-20T09:00:00Z',
                thumbnail: '/placeholder.svg?height=50&width=50',
                pictures: ['/placeholder1.svg', '/placeholder2.svg'],
                currency: { id: 1, name: 'USD' },
                attributes: [
                  { id: 1, attribute_id: 3, value: 'Negro' },
                  { id: 2, attribute_id: 4, value: '32' }
                ],
                supplies: [
                  { id: 1, supply_id: 3, quantity: 3 },
                  { id: 2, supply_id: 4, quantity: 1 }
                ]
              }
            }
          ]
        },
        {
          id: 2,
          total: 200.00,
          status: 'En Proceso',
          created_at: '2023-05-16T14:45:00Z',
          shipping_cost: 15.00,
          seller_id: 2, 
          amount_paid: 50.00, 
          items: [
            {
              id: 3,
              quantity: 1,
              price: 185.00,
              variation: {
                id: 3,
                product_id: 3,
                name: 'Zapatos Deportivos - Talla 39',
                price: 185.00,
                stock: 20,
                created_at: '2023-03-15T09:00:00Z',
                thumbnail: '/placeholder.svg?height=50&width=50',
                pictures: ['/placeholder1.svg', '/placeholder2.svg'],
                currency: { id: 1, name: 'USD' },
                attributes: [
                  { id: 1, attribute_id: 5, value: 'Blanco' },
                  { id: 2, attribute_id: 6, value: '39' }
                ],
                supplies: [
                  { id: 1, supply_id: 5, quantity: 2 }
                ]
              }
            }
          ]
        }
      ]);
    }
  };