import { useRef, useEffect, useMemo, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import Table from '@/components/ui/Table';
import Checkbox from '@/components/ui/Checkbox';
//import { data10 } from './data';
import type { ChangeEvent } from 'react';
import type { CheckboxProps } from '@/components/ui/Checkbox';
import type { Person } from './data';
import type { ColumnDef } from '@tanstack/react-table';
import inventoryStatusColor, {statuses} from '@/utils/inventoryStatusColor'
import { Badge, Button } from '@/components/ui';
import { apiGetProductsFromStoresProducts } from '@/services/SalesService';

interface Product {
    id: string;
    name: string;
    pricingDetails:{
        salePrice: number;
        commission: number;
    }
    status: string;
}

const productData = [
    {
        id: "1",
        name: 'Producto A',
        pricingDetails:{
            salePrice: 200.00,
            commission: 20.00,
        },  
        status: 'Agotado',
    },
    {
        id: "2",
        name: 'Producto B',
        pricingDetails:{
            salePrice: 200.00,
            commission: 20.00,
        },        
        status: 'En Inventario',
    },
    {
        id: "3",
        name: 'Producto C',
        pricingDetails:{
            salePrice: 200.00,
            commission: 20.00,
        },
        status: 'Agotado',
    },
    // Puedes agregar más productos aquí
];

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

const { Tr, Th, Td, THead, TBody } = Table

function RowSelection(props) {
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState(() => productData)
    const {setSelectedProductIds} = props;
    const columns = useMemo<ColumnDef<Product>[]>(() => {
        return [
            {
                id: 'select',
                cell: ({ row }) => (
                    <div className="px-1" key={row.original.id}>
                         <Checkbox onChange={(_, e) =>{handleCheckboxChange(row.original.id, e.target.checked)}} />
                    </div>
                ),
            },
            {
                header: 'Nombre',
                accessorKey: 'name',
            },
            {
                header: 'Precio',
                accessorKey: 'pricingDetails.salePrice',
                cell: (props) => {
                    const { pricingDetails } = props.row.original
                    return <span>${pricingDetails.salePrice}</span>
                },
            },
            {
                header: 'Comisión',
                accessorKey: 'pricingDetails.commission',
                cell: (props) => {
                    const { pricingDetails } = props.row.original
                    return <span>${pricingDetails.commission}</span>
                },
            },
            {
                header: 'Estado del Producto',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    const index = statuses.indexOf(status);
                    return (
                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    inventoryStatusColor[index].dotClass
                                }
                            />
                            <span
                                className={`capitalize font-semibold ${inventoryStatusColor[index].textClass}`}
                            >
                                {inventoryStatusColor[index].label}
                            </span>
                        </div>
                    )
                },
            },
        ]
    }, [])
    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection,
        },
        enableRowSelection: true, //enable row selection for all rows
        // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })
    
    useEffect(()=>{
        apiGetProductsFromStoresProducts().then((res) =>{
            console.log(res.data);
            setData(res.data);
        })
    },[])

    //TODO: Crear la función para poder crear los datos de las ordenes

    const handleCheckboxChange = (productId: string, isChecked: boolean) => {
        setSelectedProductIds((prevSelectedProductIds: any) => {
        //console.log(selectedProductIds, isChecked, productId, prevSelectedProductIds);
          if (isChecked) {
            // Si el checkbox está marcado, añadir el ID al array
            return [...prevSelectedProductIds, productId];
          } else {
            // Si el checkbox no está marcado, quitar el ID del array
            return prevSelectedProductIds.filter((id:any) => id !== productId);
          }
        });

     };
    
    return (
        <>
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
        </>
    )
}

export default RowSelection
