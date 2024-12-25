import React, { Fragment, useMemo } from 'react';
import Table from '@/components/ui/Table';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const { Tr, Th, Td, THead, TBody } = Table;

function SubTable({ data }) {
  const columns = useMemo(() => [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    // {
    //   header: 'Nombre',
    //   accessorKey: 'name',
    // },
    {
      header: 'Precio',
      accessorKey: 'price',
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
    },
    {
      header: 'Moneda',
      accessorKey: 'currency.name',
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <THead>
        <Tr>
          {table.getHeaderGroups().map(headerGroup => (
            <Fragment key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Th key={header.id} colSpan={header.colSpan}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </Fragment>
          ))}
        </Tr>
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
}

export default SubTable;