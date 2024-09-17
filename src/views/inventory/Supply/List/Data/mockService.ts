import { Currency } from "@/@types/currency";
import { Supply } from "./types";

export const currencies: Currency[] = [
  { id: 1, name: 'USD', exchange_rate: 310 },
  { id: 2, name: 'EUR', exchange_rate: 320 },
];

// Servicio mock para simular la obtención de datos desde Supabase
export const mockSuppliesService = {
    getSupplies: (): Promise<Supply[]> => {
      return Promise.resolve([
        {
          id: 1,
          name: 'Papel',
          currency: 'USD',
          type: 'variable',
          product_id: 1,
          supply_variation_id: 1,
          supply_variation: [
            {
              id: 1,
              cost: 10.50,
              currency: currencies.find(c => c.id === 1)!, // Encuentra la moneda correspondiente
              description: 'Papel A4',
              measure: '500 hojas',
              created_at: '2023-05-01T00:00:00Z',
            },
            {
              id: 2,
              cost: 15.75,
              currency: currencies.find(c => c.id === 1)!, // Encuentra la moneda correspondiente
              description: 'Papel A3',
              measure: '250 hojas',
              created_at: '2023-05-02T00:00:00Z',
            },
          ],
        },
        {
          id: 2,
          name: 'Tinta',
          currency: 'EUR',
          type: 'fixed',
          product_id: 2,
          supply_variation_id: 3,
          supply_variation: [
            {
              id: 3,
              cost: 25.00,
              currency: currencies.find(c => c.id === 2)!, // Encuentra la moneda correspondiente
              description: 'Tinta negra',
              measure: '100ml',
              created_at: '2023-05-03T00:00:00Z',
            },
          ],
        },
      ]);
    },
  };