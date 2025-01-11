import { Order } from "@/@types/orders";
import supabase from "@/services/Supabase/BaseClient";

// Mock data service
export const mockOrderService = {
  getOrders: (): Promise<Order[]> => {
    return new Promise((resolve, reject) => {
      supabase
        .from("orders")
        .select(
          "*,clients(*), orderPersonalized: personalized_orders(*),seller: seller_id(*), items: order_items(*, variation: product_variations(*, currency(*), attribute_values(*)))"
        )
        .then(async (response) => {
          if (response.error) {
            console.error("Supabase error:", response.error);
            reject(response.error);
          } else {
            const orders = response.data;

            // Filter out any non-Order objects
            const validOrders = orders.filter(
              (item) => typeof item === "object" && item !== null
            ) as Order[];

            resolve(validOrders);
          }
        });
    });
  },
};
