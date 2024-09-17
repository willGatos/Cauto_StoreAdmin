import React, { useMemo, useState, useEffect } from 'react';
import Table from '@/components/ui/Table';
import { useReactTable, getCoreRowModel, getExpandedRowModel, flexRender } from '@tanstack/react-table';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import type { Seller, Order } from './types'; // Asegúrate de tener estos tipos

const { Tr, Th, Td, THead, TBody } = Table;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
};

const columns = useMemo<ColumnDef<Seller>[]>(
  () => [
    {
      header: () => null, // No header
      id: 'expander', // It needs an ID
      cell: ({ row }) => (
        <button
          className="text-lg"
          onClick={row.getToggleExpandedHandler()}
          aria-label={row.getIsExpanded() ? "Contraer vendedor" : "Expandir vendedor"}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>
      ),
    },
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Nombre',
      accessorKey: 'name',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone',
    },
    {
      header: 'Fecha de Registro',
      accessorKey: 'created_at',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      header: 'Ventas Totales',
      accessorKey: 'orders',
      cell: ({ getValue }) => {
        const orders = getValue() as Order[];
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        return formatCurrency(totalSales);
      },
    },
    {
      header: 'Órdenes Completadas',
      accessorKey: 'orders',
      cell: ({ getValue }) => {
        const orders = getValue() as Order[];
        return orders.filter(order => order.status === "Completada").length;
      },
    },
    {
      header: 'Total de Órdenes',
      accessorKey: 'orders',
      cell: ({ getValue }) => (getValue() as Order[]).length,
    },
  ],
  []
);

const SubComponent = ({ row }: { row: Row<Seller> }) => {
  const orders = row.original.orders;

  return (
    <table className="min-w-full bg-gray-50">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-4 border-b text-left">ID de Orden</th>
          <th className="py-2 px-4 border-b text-left">Total</th>
          <th className="py-2 px-4 border-b text-left">Estado</th>
          <th className="py-2 px-4 border-b text-left">Fecha de Creación</th>
          <th className="py-2 px-4 border-b text-left">Acción</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id} className="hover:bg-gray-100">
            <td className="py-2 px-4 border-b">{order.id}</td>
            <td className="py-2 px-4 border-b">{formatCurrency(order.total)}</td>
            <td className="py-2 px-4 border-b">{order.status}</td>
            <td className="py-2 px-4 border-b">{formatDate(order.created_at)}</td>
            <td className="py-2 px-4 border-b">
              <a href={`/orders/${order.id}`} className="text-blue-500 hover:text-blue-700 flex items-center">
                Ver orden
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default function MainComponent() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [expandedSellers, setExpandedSellers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    //dataService.getSellers().then(setSellers);
    // Usaremos datos simulados para este ejemplo
    setSellers([
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
  }, []);

  const table = useReactTable({
    data: sellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Rendimiento de Vendedores</h1>
      <Table>
        <THead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Th key={header.id} colSpan={header.colSpan}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Tr>
          ))}
        </THead>
        <TBody>
          {table.getRowModel().rows.map(row => (
            <React.Fragment key={row.id}>
              <Tr>
                {row.getVisibleCells().map(cell => (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
              {row.getIsExpanded() && (
                <Tr>
                  <Td colSpan={row.getVisibleCells().length}>
                    <SubComponent row={row} />
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