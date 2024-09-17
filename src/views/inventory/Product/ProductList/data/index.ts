import { Product } from "@/@types/products";

// Mock service to simulate Supabase data fetching
export const mockProductService = {
    getProducts: (): Promise<Product[]> => {
      return Promise.resolve([
        {
          id: 1,
          name: "Classic T-Shirt",
          description: "Comfortable cotton t-shirt",
          price: 19.99,
          categoryId: 1,
          createdAt: "2023-05-01T00:00:00Z",
          shopId: 1,
          cost: 10.00,
          discount: 0,
          state: "available",
          ownerId: 1,
          gender: "unisex",
          commission: 5,
          type: "variable",
          origin: "manufactured",
          commissionType: "percentage",
          referenceCurrency: 1,
          category: {
            id: 1,
            name: "Apparel",
            description: "Clothing and accessories",
            createdAt: "2023-01-01T00:00:00Z",
            parentId: null
          },
          currency: {
            id: 1,
            name: "USD",
            exchangeRate: 1,
            isAutomatic: true,
            createdAt: "2023-01-01T00:00:00Z"
          },
          variations: [
            {
              id: 1,
              productId: 1,
              name: "Small Black",
              price: 19.99,
              stock: 100,
              createdAt: "2023-05-01T00:00:00Z",
              thumbnail: "https://example.com/small-black-tshirt.jpg",
              pictures: ["https://example.com/small-black-tshirt-1.jpg", "https://example.com/small-black-tshirt-2.jpg"],
              currencyId: 1,
              currency: {
                id: 1,
                name: "USD",
                exchangeRate: 1,
                isAutomatic: true,
                createdAt: "2023-01-01T00:00:00Z"
              },
              attributes: [
                {
                  id: 1,
                  type: 1,
                  value: "Small",
                  createdAt: "2023-05-01T00:00:00Z",
                  attribute: {
                    id: 1,
                    name: "Size",
                    createdAt: "2023-01-01T00:00:00Z"
                  }
                },
                {
                  id: 2,
                  type: 2,
                  value: "Black",
                  createdAt: "2023-05-01T00:00:00Z",
                  attribute: {
                    id: 2,
                    name: "Color",
                    createdAt: "2023-01-01T00:00:00Z"
                  }
                }
              ]
            },
            {
              id: 2,
              productId: 1,
              name: "Medium White",
              price: 19.99,
              stock: 150,
              createdAt: "2023-05-01T00:00:00Z",
              thumbnail: "https://example.com/medium-white-tshirt.jpg",
              pictures: ["https://example.com/medium-white-tshirt-1.jpg", "https://example.com/medium-white-tshirt-2.jpg"],
              currencyId: 1,
              currency: {
                id: 1,
                name: "USD",
                exchangeRate: 1,
                isAutomatic: true,
                createdAt: "2023-01-01T00:00:00Z"
              },
              attributes: [
                {
                  id: 3,
                  type: 1,
                  value: "Medium",
                  createdAt: "2023-05-01T00:00:00Z",
                  attribute: {
                    id: 1,
                    name: "Size",
                    createdAt: "2023-01-01T00:00:00Z"
                  }
                },
                {
                  id: 4,
                  type: 2,
                  value: "White",
                  createdAt: "2023-05-01T00:00:00Z",
                  attribute: {
                    id: 2,
                    name: "Color",
                    createdAt: "2023-01-01T00:00:00Z"
                  }
                }
              ]
            }
          ]
        },
        {
          id: 2,
          name: "Leather Wallet",
          description: "Genuine leather wallet",
          price: 49.99,
          categoryId: 2,
          createdAt: "2023-05-02T00:00:00Z",
          shopId: 1,
          cost: 25.00,
          discount: 10,
          state: "available",
          ownerId: 1,
          gender: "unisex",
          commission: 7.5,
          type: "simple",
          origin: "imported",
          commissionType: "fixed",
          referenceCurrency: 1,
          category: {
            id: 2,
            name: "Accessories",
            description: "Personal accessories",
            createdAt: "2023-01-01T00:00:00Z",
            parentId: null
          },
          currency: {
            id: 1,
            name: "USD",
            exchangeRate: 1,
            isAutomatic: true,
            createdAt: "2023-01-01T00:00:00Z"
          },
          variations: []
        }
      ]);
    },
  };
  