import React, { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import {
  getProductsByShop,
  getSuppliesByShop,
  getProductSuppliesByShop,
  createProductSupply,
  deleteProductSupply
} from '@/services/Supabase/AttributeService'
import { Product } from '@/@types/products'
import { Supply } from '@/@types/supply'
import { Table } from '@/components/ui'

const ProductSupplyManager: React.FC<{ shopId: number }> = ({ shopId }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [productSupplies, setProductSupplies] = useState([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getProductsByShop(shopId)
      const suppliesData = await getSuppliesByShop(shopId)
      const productSuppliesData = await getProductSuppliesByShop(shopId)
      
      setProducts(productsData)
      setSupplies(suppliesData)
      setProductSupplies(productSuppliesData)
    }
    
    fetchData()
  }, [shopId])

  const columns: ColumnDef<Supply, any>[] = React.useMemo(
    () => [
      {
        header: 'Supply',
        accessorKey: 'name',
      },
      {
        header: 'Associated',
        accessorFn: (row) => productSupplies.some(ps => ps.product_id === selectedProduct && ps.supply_id === row.id),
        cell: ({ getValue }: CellContext<Supply, boolean>) => (
          <input 
            type="checkbox" 
            checked={getValue()} 
            onChange={(e) => handleCheckboxChange(row.id, e.target.checked)} 
          />
        ),
      },
    ],
    [productSupplies, selectedProduct]
  )
  const { Tr, Th, Td, THead, TBody } = Table

  const table = useReactTable({
    data: supplies,
    columns,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
  })

  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(Number(event.target.value))
  }
  
  const handleCheckboxChange = async (supplyId: number, isChecked: boolean) => {
    if (selectedProduct === null) return

    if (isChecked) {
      await createProductSupply(selectedProduct, supplyId, 1, shopId)
    } else {
      await deleteProductSupply(selectedProduct, supplyId)
    }

    const updatedProductSupplies = await getProductSuppliesByShop(shopId)
    setProductSupplies(updatedProductSupplies)
  }

  return (
    <div>
      <select onChange={handleProductChange}>
        <option value="">Select a product</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>

      <Table>
        <THead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</Th>
              ))}
            </Tr>
          ))}
        </THead>
        <TBody>
          {table.getRowModel().rows.map(row => (
            <Tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
              ))}
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  )
}

export default ProductSupplyManager
