import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getExpandedRowModel, flexRender } from '@tanstack/react-table';
import Table from '@/components/ui/Table';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { Order } from '@/@types/orders';

const { Tr, Th, Td, THead, TBody } = Table;

type OrderProps = {
  orders: Order[];
};

const OrderTable = ({ orders }: OrderProps) => {
  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      header: 'ID de Orden',
      accessorKey: 'id',
    },
    {
      header: 'Total',
      accessorKey: 'total',
    },
    {
      header: 'Estado',
      accessorKey: 'status',
    },
    {
      header: 'Fecha de Creación',
      accessorKey: 'created_at',
    },
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
          <Tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <Td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
  );
};

export default OrderTable;