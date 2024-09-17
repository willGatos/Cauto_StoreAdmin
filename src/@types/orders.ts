import { Currency } from "./currency";
import { ProductVariation } from "./products";

// Types
export interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
    shipping_cost: number;
    seller_id: number; // Referencia a una tabla de vendedores (no definida aquí)
    amount_paid: number;
    items: OrderItem[];
  }
  
export interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    variation: ProductVariation;
  }

   // Tipo para la tabla clients
   export interface Client {
    id: number;
    user_id: number; // Referencia a la tabla users
    location_id: number; // Referencia a una tabla de ubicaciones (no definida aquí)
    shop_id: number; // Referencia a una tabla de tiendas (no definida aquí)
    created_at: string;
  }
  
  // Tipo para las filas de la tabla principal (OrderTableRow)
  export interface OrderTableRow {
    id: number;
    clientName: string;
    clientPhone: string;
    status: string;
    total: string;
    createdAt: string;
    items: OrderItem[];
  }
  
  // Tipo para las filas de la tabla expandible (OrderItemTableRow)
  export interface OrderItemTableRow {
    thumbnail: string;
    productName: string;
    quantity: number;
    price: string;
    subtotal: string;
  }