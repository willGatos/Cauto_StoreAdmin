export const mockCategories = [
    {
      id: 1,
      name: "Ropa",
      description: "Categoría de ropa",
      parent_id: null,
      shop_id: 1,
      cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
      created_at: new Date().toISOString(),
      children: [
        {
          id: 2,
          name: "Hombre",
          description: "Ropa para hombre",
          parent_id: 1,
          shop_id: 1,
          cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
          created_at: new Date().toISOString(),
          children: [
            {
              id: 3,
              name: "Camisetas",
              description: "Camisetas para hombre",
              parent_id: 2,
              shop_id: 1,
              cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
              created_at: new Date().toISOString(),
            },
            {
              id: 4,
              name: "Pantalones",
              description: "Pantalones para hombre",
              parent_id: 2,
              shop_id: 1,
              cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
              created_at: new Date().toISOString(),
            }
          ]
        },
        {
          id: 5,
          name: "Mujer",
          description: "Ropa para mujer",
          parent_id: 1,
          shop_id: 1,
          cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
          created_at: new Date().toISOString(),
          children: [
            {
              id: 6,
              name: "Vestidos",
              description: "Vestidos para mujer",
              parent_id: 5,
              shop_id: 1,
              cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
              created_at: new Date().toISOString(),
            }
          ]
        }
      ]
    },
    {
      id: 7,
      name: "Electrónica",
      description: "Categoría de electrónica",
      parent_id: null,
      shop_id: 1,
      cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
      created_at: new Date().toISOString(),
      children: [
        {
          id: 8,
          name: "Smartphones",
          description: "Teléfonos móviles",
          parent_id: 7,
          shop_id: 1,
          cover: "https://res.cloudinary.com/dd6mge7ez/image/upload/v1732028250/cbtqjospqi7n97w8nwtz.jpg",
          created_at: new Date().toISOString(),
        }
      ]
    }
  ]
  
  export interface Category {
    id: number
    name: string
    description?: string
    parent_id?: number | null
    shop_id?: number | null
    cover: string
    created_at: string
    children?: Category[]
    level?: number
  }
  
  