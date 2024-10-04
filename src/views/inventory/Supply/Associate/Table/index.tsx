import React, { useState, useEffect } from "react";
import Select from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import Table from "@/components/ui/Table";

// Types
interface Product {
  id: number;
  name: string;
  variations: ProductVariation[];
  label: "Tela de Algodón";
  value: "Tela de Algodón";
}

interface ProductVariation {
  id: number;
  name: string;
  product_id: number;
  label: "Tela de Algodón";
  value: "Tela de Algodón";
}

interface Supply {
  id: number;
  name: string;
  variations: SupplyVariation[];
  label: "Tela de Algodón";
  value: "Tela de Algodón";
}

interface SupplyVariation {
  id: number;
  name: string;
  supply_id: number;
  label: "Tela de Algodón";
  value: "Tela de Algodón";
}

// Mock Data Service
const getMockProducts = (): Product[] => [
  {
    id: 1,
    name: "Jarra",
    label: "Tela de Algodón",
    value: "Tela de Algodón",
    variations: [
      {
        id: 1,
        name: "Camiseta Roja S",
        product_id: 1,
        label: "Tela de Algodón",
        value: "Tela de Algodón",
      },
      {
        id: 2,
        name: "Camiseta Azul M",
        product_id: 1,
        label: "Tela de Algodón",
        value: "Tela de Algodón",
      },
    ],
  },
  {
    id: 2,
    name: "Pantalón",
    label: "Tela de Algodón",
    value: "Tela de Algodón",
    variations: [
      {
        id: 3,
        name: "Pantalón Negro 32",
        product_id: 2,
        label: "Tela de Algodón",
        value: "Tela de Algodón",
      },
      {
        id: 4,
        name: "Pantalón Gris 34",
        product_id: 2,
        label: "Tela de Algodón",
        value: "Tela de Algodón",
      },
    ],
  },
];

const getMockSupplies = (): Supply[] => [
  {
    id: 1,
    name: "Tela de Algodón",
    label: "Tela de Algodón",
    value: "Tela de Algodón",
    variations: [
      {
        id: 1,
        name: "Tela de Algodón Roja",
        supply_id: 1,
        label: "Tela de Algodón",
        value: "Tela de Algodón",
      },
      {
        id: 2,
        name: "Tela de Algodón Azul",
        supply_id: 1,
        label: "Tela de Algodón",
        value: "Tela de Algodón",
      },
    ],
  },
  // {
  //   id: 2,
  //   name: "Botones",
  //   variations: [
  //     { id: 3, name: "Botones Negros", supply_id: 2 },
  //     { id: 4, name: "Botones Plateados", supply_id: 2 },
  //   ],
  // },
];

const getMockAssociations = (): { productId: number; supplyId: number }[] => [
  { productId: 1, supplyId: 1 },
  { productId: 2, supplyId: 2 },
];

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
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [associations, setAssociations] = useState<
    { productId: number; supplyId: number }[]
  >([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const { Tr, Th, Td, THead, TBody } = Table;
  useEffect(() => {
    // Fetch data
    setProducts(getMockProducts());
    setSupplies(getMockSupplies());
    setAssociations(getMockAssociations());

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
  }, []);

  const toggleRowExpansion = (productId: number) => {
    setExpandedRows((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isAssociated = (productId: number, supplyId: number) => {
    return associations.some(
      (a) => a.productId === productId && a.supplyId === supplyId
    );
  };

  const handleAssociationChange = (
    productId: number,
    supplyId: number,
    checked: boolean
  ) => {
    if (checked) {
      setAssociations((prev) => [...prev, { productId, supplyId }]);
    } else {
      setAssociations((prev) =>
        prev.filter(
          (a) => !(a.productId === productId && a.supplyId === supplyId)
        )
      );
    }
    // Uncomment to use with Supabase
    // updateAssociation(productId, supplyId, checked)
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Asociación de Productos y Suministros
      </h1>
      <Table>
        <THead>
          <Tr>
            <Th className="w-[50px]"></Th>
            <Th>Producto</Th>
            <Th>Suministro</Th>
            <Th className="w-[100px]">Asociado</Th>
          </Tr>
        </THead>
        <TBody>
          {products.map((product) => (
            <React.Fragment key={product.id}>
              <Tr>
                <Td>
                  <button
                    onClick={() => toggleRowExpansion(product.id)}
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label={
                      expandedRows.includes(product.id)
                        ? "Contraer fila"
                        : "Expandir fila"
                    }
                  >
                    {expandedRows.includes(product.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </Td>
                <Td>{product.name}</Td>
                <Td>
                  <Select
                    placeholder="Seleccionar suministro"
                    onChange={({ value }) =>
                      handleAssociationChange(product.id, parseInt(value), true)
                    }
                    options={supplies}
                  ></Select>
                </Td>
                <Td>
                  {supplies.some((supply) =>
                    isAssociated(product.id, supply.id)
                  )
                    ? "Sí"
                    : "No"}
                </Td>
              </Tr>
              {expandedRows.includes(product.id) && (
                <Tr>
                  <Td colSpan={4}>
                    <Table>
                      <THead>
                        <Tr>
                          <Th>Variación de Producto</Th>
                          <Th>Variación de Suministro</Th>
                          <Th className="w-[100px]">Asociado</Th>
                        </Tr>
                      </THead>
                      <TBody>
                        {product.variations.map((productVariation) => (
                          <Tr key={productVariation.id}>
                            <Td>{productVariation.name}</Td>
                            <Td>
                              <Select
                                options={supplies.flatMap(
                                  (supply) => supply.variations
                                )}
                                placeholder="Seleccionar variación de suministro"
                              ></Select>
                            </Td>
                            <Td>
                              <Checkbox />
                            </Td>
                          </Tr>
                        ))}
                      </TBody>
                    </Table>
                  </Td>
                </Tr>
              )}
            </React.Fragment>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
