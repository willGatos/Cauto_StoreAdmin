import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight } from "lucide-react"

// Types
interface Product {
  id: number;
  name: string;
  variations: ProductVariation[];
}

interface ProductVariation {
  id: number;
  name: string;
  product_id: number;
}

interface Supply {
  id: number;
  name: string;
  variations: SupplyVariation[];
}

interface SupplyVariation {
  id: number;
  name: string;
  supply_id: number;
}

// Mock Data Service
const getMockProducts = (): Product[] => [
  { id: 1, name: 'Camiseta', variations: [
    { id: 1, name: 'Camiseta Roja S', product_id: 1 },
    { id: 2, name: 'Camiseta Azul M', product_id: 1 }
  ]},
  { id: 2, name: 'Pantalón', variations: [
    { id: 3, name: 'Pantalón Negro 32', product_id: 2 },
    { id: 4, name: 'Pantalón Gris 34', product_id: 2 }
  ]}
]

const getMockSupplies = (): Supply[] => [
  { id: 1, name: 'Tela de Algodón', variations: [
    { id: 1, name: 'Tela de Algodón Roja', supply_id: 1 },
    { id: 2, name: 'Tela de Algodón Azul', supply_id: 1 }
  ]},
  { id: 2, name: 'Botones', variations: [
    { id: 3, name: 'Botones Negros', supply_id: 2 },
    { id: 4, name: 'Botones Plateados', supply_id: 2 }
  ]}
]

const getMockAssociations = (): {productId: number, supplyId: number}[] => [
  { productId: 1, supplyId: 1 },
  { productId: 2, supplyId: 2 }
]

// Supabase Service (comentado)
/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY')

const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*, variations(*)')
  if (error) throw error
  return data
}

const getSupplies = async (): Promise<Supply[]> => {
  const { data, error } = await supabase
    .from('supplies')
    .select('*, variations(*)')
  if (error) throw error
  return data
}

const getAssociations = async (): Promise<{productId: number, supplyId: number}[]> => {
  const { data, error } = await supabase
    .from('product_supply_associations')
    .select('product_id, supply_id')
  if (error) throw error
  return data.map(item => ({ productId: item.product_id, supplyId: item.supply_id }))
}

const updateAssociation = async (productId: number, supplyId: number, isAssociated: boolean) => {
  if (isAssociated) {
    const { error } = await supabase
      .from('product_supply_associations')
      .insert({ product_id: productId, supply_id: supplyId })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('product_supply_associations')
      .delete()
      .match({ product_id: productId, supply_id: supplyId })
    if (error) throw error
  }
}
*/

export default function ProductSupplyAssociationTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [associations, setAssociations] = useState<{productId: number, supplyId: number}[]>([])
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  useEffect(() => {
    // Fetch data
    setProducts(getMockProducts())
    setSupplies(getMockSupplies())
    setAssociations(getMockAssociations())
    
    // Uncomment to use with Supabase
    // const fetchData = async () => {
    //   const [productsData, suppliesData, associationsData] = await Promise.all([
    //     getProducts(),
    //     getSupplies(),
    //     getAssociations()
    //   ])
    //   setProducts(productsData)
    //   setSupplies(suppliesData)
    //   setAssociations(associationsData)
    // }
    // fetchData()
  }, [])

  const toggleRowExpansion = (productId: number) => {
    setExpandedRows(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const isAssociated = (productId: number, supplyId: number) => {
    return associations.some(a => a.productId === productId && a.supplyId === supplyId)
  }

  const handleAssociationChange = (productId: number, supplyId: number, checked: boolean) => {
    if (checked) {
      setAssociations(prev => [...prev, { productId, supplyId }])
    } else {
      setAssociations(prev => prev.filter(a => !(a.productId === productId && a.supplyId === supplyId)))
    }
    // Uncomment to use with Supabase
    // updateAssociation(productId, supplyId, checked)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Asociación de Productos y Suministros</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Suministro</TableHead>
            <TableHead className="w-[100px]">Asociado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <React.Fragment key={product.id}>
              <TableRow>
                <TableCell>
                  <button 
                    onClick={() => toggleRowExpansion(product.id)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label={expandedRows.includes(product.id) ? "Contraer fila" : "Expandir fila"}
                  >
                    {expandedRows.includes(product.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Select onValueChange={(value) => handleAssociationChange(product.id, parseInt(value), true)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Seleccionar suministro" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplies.map(supply => (
                        <SelectItem key={supply.id} value={supply.id.toString()}>{supply.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {supplies.some(supply => isAssociated(product.id, supply.id)) ? 'Sí' : 'No'}
                </TableCell>
              </TableRow>
              {expandedRows.includes(product.id) && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variación de Producto</TableHead>
                          <TableHead>Variación de Suministro</TableHead>
                          <TableHead className="w-[100px]">Asociado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variations.map(productVariation => (
                          <TableRow key={productVariation.id}>
                            <TableCell>{productVariation.name}</TableCell>
                            <TableCell>
                              <Select>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Seleccionar variación de suministro" />
                                </SelectTrigger>
                                <SelectContent>
                                  {supplies.flatMap(supply => 
                                    supply.variations.map(supplyVariation => (
                                      <SelectItem key={supplyVariation.id} value={supplyVariation.id.toString()}>
                                        {supplyVariation.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}