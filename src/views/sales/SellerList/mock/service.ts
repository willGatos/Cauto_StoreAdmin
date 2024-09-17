import { User } from "@/@types/auth";

export const mockDataService = {
    getSellers: (): Promise<User[]> => {
      return Promise.resolve([
        {
          id: 1,
          name: "Juan Pérez",
          email: "juan@example.com",
          phone: "+1234567890",
          created_at: "2023-01-01T00:00:00Z",
          orders: [
            { id: 1, total: 150.00, status: "Completada", created_at: "2023-05-15T10:30:00Z" },
            { id: 2, total: 200.00, status: "En proceso", created_at: "2023-05-16T14:45:00Z" },
          ]
        },
        {
          id: 2,
          name: "María González",
          email: "maria@example.com",
          phone: "+0987654321",
          created_at: "2023-02-01T00:00:00Z",
          orders: [
            { id: 3, total: 300.00, status: "Completada", created_at: "2023-05-17T09:15:00Z" },
            { id: 4, total: 175.50, status: "Pendiente", created_at: "2023-05-18T16:20:00Z" },
          ]
        }
      ]);
    }
  };