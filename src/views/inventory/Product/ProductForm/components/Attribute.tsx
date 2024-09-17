import React, { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switcher } from "@/components/ui/Switcher"
import { Loader2, X } from "lucide-react"
import supabase from '@/services/Supabase/BaseClient'

interface Attribute {
  id: number
  name: string
  values: AttributeValue[]
}

interface AttributeValue {
  id: number
  value: string
}

interface Currency {
  id: number
  name: string
  code: string
  symbol: string
}

interface ProductVariation {
  id: number
  product_id: number
  name: string
  price: number
  stock: number
  created_at: string
  thumbnail: string
  pictures: string[]
  currency: Currency
  attributes?: AttributeValue[]
}

// Mock service
const mockService = {
    getAttributes: async (): Promise<Attribute[]> => {
        const { data, error } = await supabase
          .from('attributes')
          .select('id, name, values:attribute_values(id, value)')
        if (error) throw error
        return data
      },
      getCurrencies: async (): Promise<Currency[]> => {
        const { data, error } = await supabase
          .from('currency')
          .select('*')
        if (error) throw error
        return data
      },
      uploadImage: async (file: File): Promise<string> => {
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(`${Date.now()}-${file.name}`, file)
        if (error) throw error
        const { publicURL, error: urlError } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path)
        if (urlError) throw urlError
        return publicURL
      }
}

// Supabase service (commented out)
/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY')

const supabaseService = {

}
*/

interface ProductVariationGeneratorProps {
  onVariationsChange?: (variations: ProductVariation[]) => void
}

export default function ProductVariationGenerator({ onVariationsChange = () => {} }: ProductVariationGeneratorProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number[]>>({})
  const [variations, setVariations] = useState<ProductVariation[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [requiresStock, setRequiresStock] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const attributesData = await mockService.getAttributes()
      const currenciesData = await mockService.getCurrencies()
      setAttributes(attributesData)
      setCurrencies(currenciesData)
      setSelectedCurrency(currenciesData[0])
    }
    loadData()
  }, [])

  useEffect(() => {
    onVariationsChange(variations)
  }, [variations, onVariationsChange])

  const handleAttributeValueChange = (attributeId: number, valueId: number, isChecked: boolean) => {
    setSelectedAttributes(prev => {
      const updatedValues = isChecked
        ? [...(prev[attributeId] || []), valueId]
        : (prev[attributeId] || []).filter(id => id !== valueId)
      
      return {
        ...prev,
        [attributeId]: updatedValues
      }
    })
  }

  const generateVariations = () => {
    const selectedAttributesList = Object.entries(selectedAttributes)
      .filter(([_, values]) => values.length > 0)
      .map(([attributeId, valueIds]) => ({
        attribute: attributes.find(attr => attr.id === Number(attributeId))!,
        values: valueIds.map(id => attributes.find(attr => attr.id === Number(attributeId))!.values.find(v => v.id === id)!)
      }))

    if (selectedAttributesList.length === 0) {
      alert("Por favor, seleccione al menos un valor de atributo.")
      return
    }

    const generateCombinations = (index: number, current: AttributeValue[]): AttributeValue[][] => {
      if (index === selectedAttributesList.length) {
        return [current]
      }

      const combinations: AttributeValue[][] = []
      for (const value of selectedAttributesList[index].values) {
        combinations.push(...generateCombinations(index + 1, [...current, value]))
      }
      return combinations
    }

    const combinations = generateCombinations(0, [])

    const newVariations: ProductVariation[] = combinations.map((combo, index) => ({
      id: index + 1,
      product_id: 1,
      name: combo.map(attr => attr.value).join(" - "),
      price: 0,
      stock: 0,
      created_at: new Date().toISOString(),
      thumbnail: "",
      pictures: [],
      currency: selectedCurrency!,
      attributes: combo
    }))

    setVariations(newVariations)
  }

  const handleVariationChange = (index: number, field: keyof ProductVariation, value: any) => {
    setVariations(prev => prev.map((variation, i) => 
      i === index ? { ...variation, [field]: value } : variation
    ))
  }

  const handleImageUpload = async (index: number, files: FileList | null) => {
    if (files && files.length > 0) {
      const updatedVariation = { ...variations[index] }
      updatedVariation.pictures = [...updatedVariation.pictures, "loading"]
      setVariations(prev => prev.map((v, i) => i === index ? updatedVariation : v))

      const imageUrl = await mockService.uploadImage(files[0])
      
      updatedVariation.pictures = updatedVariation.pictures.map(pic => pic === "loading" ? imageUrl : pic)
      setVariations(prev => prev.map((v, i) => i === index ? updatedVariation : v))
    }
  }

  const removeImage = (variationIndex: number, imageIndex: number) => {
    setVariations(prev => prev.map((variation, i) => 
      i === variationIndex 
        ? { ...variation, pictures: variation.pictures.filter((_, idx) => idx !== imageIndex) }
        : variation
    ))
  }

  const handleGlobalCurrencyChange = (currencyId: string) => {
    const newCurrency = currencies.find(c => c.id === Number(currencyId))
    if (newCurrency) {
      setSelectedCurrency(newCurrency)
      setVariations(prev => prev.map(variation => 
        variation.currency.id === selectedCurrency?.id ? { ...variation, currency: newCurrency } : variation
      ))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generador de Variaciones de Producto</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Seleccione los atributos:</h2>
        {attributes.map(attribute => (
          <div key={attribute.id} className="mb-4">
            <h3 className="text-lg font-medium mb-2">{attribute.name}</h3>
            <div className="flex flex-wrap gap-4">
              {attribute.values.map(value => (
                <div key={value.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`attr-${attribute.id}-${value.id}`}
                    checked={selectedAttributes[attribute.id]?.includes(value.id) || false}
                    onChange={(checked) => handleAttributeValueChange(attribute.id, value.id, checked === true)}
                  />
                  <label
                    htmlFor={`attr-${attribute.id}-${value.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {value.value}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Seleccione la moneda:</h2>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedCurrency?.id || ''}
          onChange={(e) => handleGlobalCurrencyChange(e.target.value)}
        >
          <option value="">Seleccione una moneda</option>
          {currencies.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex items-center space-x-2">
        <Checkbox
          checked={requiresStock}
          onChange={setRequiresStock}
          id="requires-stock"
        />
        <label htmlFor="requires-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Producto requiere control de stock
        </label>
      </div>

      <Button onClick={generateVariations} className="mb-6">
        Generar Variaciones
      </Button>

      {variations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Variaciones Generadas:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Nombre</th>
                  <th className="py-2 px-4 border-b text-left">Precio</th>
                  {requiresStock && <th className="py-2 px-4 border-b text-left">Stock</th>}
                  <th className="py-2 px-4 border-b text-left">Moneda</th>
                  <th className="py-2 px-4 border-b text-left">Imágenes</th>
                </tr>
              </thead>
              <tbody>
                {variations.map((variation, index) => (
                  <tr key={variation.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <Input
                        value={variation.name}
                        onChange={(e) => handleVariationChange(index, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <Input
                        type="number"
                        value={variation.price}
                        onChange={(e) => handleVariationChange(index, 'price', Number(e.target.value))}
                        className="w-24"
                      />
                    </td>
                    {requiresStock && (
                      <td className="py-2 px-4 border-b">
                        <Input
                          type="number"
                          value={variation.stock}
                          onChange={(e) => handleVariationChange(index, 'stock', Number(e.target.value))}
                          className="w-24"
                        />
                      </td>
                    )}
                    <td className="py-2 px-4 border-b">
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={variation.currency.id}
                        onChange={(e) => handleVariationChange(index, 'currency', currencies.find(c => c.id === Number(e.target.value)))}
                      >
                        {currencies.map((currency) => (
                          <option key={currency.id} value={currency.id}>
                            {currency.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-wrap gap-2 items-center">
                        {variation.pictures.map((pic, picIndex) => (
                          <div key={picIndex} className="relative">
                            {pic === "loading" ? (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : (
                              <>
                                <img src={pic} alt={`Variation ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                                <button
                                  onClick={() => removeImage(index, picIndex)}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                  aria-label="Remove image"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                        <label className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(index, e.target.files)}
                          />
                          <span className="text-4xl text-gray-500">+</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}