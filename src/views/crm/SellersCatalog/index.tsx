import { useState, useEffect } from 'react'
import Image from 'next/image'

type Currency = {
  id: number;
  name: string;
  exchange_rate: number;
  is_automatic: boolean;
}

type AttributeValue = {
  id: number;
  type: number;
  value: string;
}

type ProductVariation = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  stock: number;
  pictures: string[];
  currency_id: number;
  attribute_values: AttributeValue[];
}

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  shop_id: number;
  cost: number;
  discount: number;
  state: string;
  owner_id: number;
  gender: string | null;
  commission: number;
  type: 'simple' | 'variable';
  origin: 'manufactured' | 'imported';
  commission_type: 'percentage' | 'fixed';
  reference_currency: number;
  tax: number;
  variations: ProductVariation[];
  currency: Currency;
}

// Datos de prueba con más imágenes
const mockProduct: Product = {
  id: 1,
  name: "Camiseta Premium",
  description: "Una camiseta de alta calidad con múltiples opciones de color y talla.",
  price: 29.99,
  category_id: 1,
  shop_id: 1,
  cost: 15.00,
  discount: 0,
  state: 'available',
  owner_id: 1,
  gender: null,
  commission: 5,
  type: 'variable',
  origin: 'manufactured',
  commission_type: 'percentage',
  reference_currency: 1,
  tax: 7,
  variations: [
    {
      id: 1,
      product_id: 1,
      name: "Camiseta Premium - Rojo S",
      price: 29.99,
      stock: 10,
      pictures: [
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600"
      ],
      currency_id: 1,
      attribute_values: [
        { id: 1, type: 1, value: "Rojo" },
        { id: 2, type: 2, value: "S" }
      ]
    },
    {
      id: 2,
      product_id: 1,
      name: "Camiseta Premium - Azul M",
      price: 29.99,
      stock: 15,
      pictures: [
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600"
      ],
      currency_id: 1,
      attribute_values: [
        { id: 3, type: 1, value: "Azul" },
        { id: 4, type: 2, value: "M" }
      ]
    },
    {
      id: 3,
      product_id: 1,
      name: "Camiseta Premium - Verde L",
      price: 34.99,
      stock: 5,
      pictures: [
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600",
        "/placeholder.svg?height=600&width=600"
      ],
      currency_id: 1,
      attribute_values: [
        { id: 5, type: 1, value: "Verde" },
        { id: 6, type: 2, value: "L" }
      ]
    }
  ],
  currency: {
    id: 1,
    name: "USD",
    exchange_rate: 1,
    is_automatic: true
  }
}

// Mapa de tipos de atributos
const attributeTypes = {
  1: "Color",
  2: "Talla"
}

export default function ProductVariations() {
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    // Simula la carga de datos
    setTimeout(() => {
      setProduct(mockProduct)
    }, 1000)

    // Comentario: Cómo se extraerían los datos de Supabase
    /*
    import { createClient } from '@supabase/supabase-js'

    const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

    const fetchProduct = async (productId: number) => {
      // Paso 1: Obtener el producto principal con su moneda
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          currency:reference_currency (*)
        `)
        .eq('id', productId)
        .single()

      if (productError) {
        console.error('Error fetching product:', productError)
        return null
      }

      // Paso 2: Obtener las variaciones del producto
      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select(`
          *,
          product_variation_attributes (
            attribute_values (
              id,
              type,
              value
            )
          )
        `)
        .eq('product_id', productId)

      if (variationsError) {
        console.error('Error fetching variations:', variationsError)
        return null
      }

      // Paso 3: Transformar los datos
      const transformedVariations = variationsData.map(variation => ({
        ...variation,
        attribute_values: variation.product_variation_attributes.map(pva => pva.attribute_values)
      }))

      // Paso 4: Combinar los datos del producto y las variaciones
      const fullProduct: Product = {
        ...productData,
        variations: transformedVariations
      }

      setProduct(fullProduct)
    }

    fetchProduct(1) // Reemplazar con el ID del producto real
    */
  }, [])

  if (!product) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{product.name}</h1>
      <p className="text-gray-600 mb-8">{product.description}</p>
      
      {product.variations.map((variation) => (
        <section key={variation.id} className="mb-12 border-b pb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">{variation.name}</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {variation.price.toFixed(2)} {product.currency.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">Stock: {variation.stock}</p>
            <div className="flex flex-wrap mt-2">
              {variation.attribute_values.map((attr) => (
                <span key={attr.id} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {attributeTypes[attr.type as keyof typeof attributeTypes]}: {attr.value}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {variation.pictures.map((picture, index) => (
                <div key={index} className="flex-shrink-0">
                  <Image
                    src={picture}
                    alt={`${variation.name} - Imagen ${index + 1}`}
                    width={600}
                    height={600}
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}