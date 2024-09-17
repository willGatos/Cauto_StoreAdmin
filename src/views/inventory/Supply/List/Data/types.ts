import { Currency } from "@/@types/currency";

// Tipos de datos
export interface Supply {
    id: number;
    name: string;
    type: 'fixed' | 'variable';
    product_id: number;
    supply_variation: SupplyVariation[];
  }
  
  export interface SupplyVariation {
    id: number;
    cost: number;
    currency_id: Currency;
    description: string;
    measure: string;
    created_at: string;
  }