import React, { Fragment, useMemo } from "react";
import Table from "@/components/ui/Table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import Label from "@/components/ui/Label";
import { Tag } from "@/components/ui";

const { Tr, Th, Td, THead, TBody } = Table;

function SubTable({ data }) {
  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      // {
      //   header: 'Nombre',
      //   accessorKey: 'name',
      // },
      {
        header: "Precio",
        accessorKey: "price",
        cell: ({ row }) => {
          console.log(row);
          return (
            <div>
              {row.original.price} {row.original.currency.name}
            </div>
          );
        },
      },
      {
        header: "Stock",
        accessorKey: "stock",
        cell: ({ row }) => {
          console.log(row);
          return <div>{row.original.stock}</div>;
        },
      },
      {
        header: "Atributos",
        cell: ({ row }) => {
          console.log(row);
          return (
            <div>
              {row.original.attribute_values.map((av) => (
                <Tag>{av.value}</Tag>
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <THead>
        <Tr>
          {table.getHeaderGroups().map((headerGroup) => (
            <Fragment key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id} colSpan={header.colSpan}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </Th>
              ))}
            </Fragment>
          ))}
        </Tr>
      </THead>
      <TBody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
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
