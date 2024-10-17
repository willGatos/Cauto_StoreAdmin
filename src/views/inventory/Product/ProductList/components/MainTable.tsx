import { Button } from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useMemo } from "react";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";

const { Tr, Th, Td, THead, TBody } = Table;

function MainTable({ data, renderRowSubComponent, getRowCanExpand }) {
  const columns = useMemo(
    () => [
      {
        header: () => null,
        id: "expander",
        cell: ({ row }) => (
          <>
            {row.getCanExpand() && (
              <button
                className="text-lg"
                {...{ onClick: row.getToggleExpandedHandler() }}
              >
                {row.getIsExpanded() ? (
                  <HiOutlineChevronDown />
                ) : (
                  <HiOutlineChevronRight />
                )}
              </button>
            )}
          </>
        ),
      },
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Nombre",
        accessorKey: "name",
      },
      {
        header: "Precio",
        accessorKey: "standard_price",
      },
      {
        header: "Categoría",
        accessorKey: "category.name",
      },
      {
        header: "Tipo",
        //accessorKey: "type",
        cell: ({ row }) => {
          console.log(row);
          return <div>{
            row.original.type == "simple" && "Simple" ||
            row.original.type == "variable" && "Con Variantes"
        }</div>;
        },
      },
      {
        header: "Origen",
        //accessorKey: "origin",
        cell: ({ row }) => {
          console.log(row);
          return <div>{
            row.original.origin == "manufactured" && "Manufacturado" ||
            row.original.origin == "imported" && "Importado"
        }</div>;
        },
      },
      {
        header: "Estado",
        accessorKey: "state",
      },
      {
        header: "Acciones",
        cell: ({ row }) => {
          console.log(row);
          return (
            <a href={"product-edit/" + row.original.id}>
              <Button>Editar</Button>
            </a>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <Table>
      <THead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Th key={header.id} colSpan={header.colSpan}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </Th>
            ))}
          </Tr>
        ))}
      </THead>
      <TBody>
        {table.getRowModel().rows.map((row) => (
          <Fragment key={row.id}>
            <Tr>
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </Tr>
            {row.getIsExpanded() && (
              <Tr>
                <Td colSpan={row.getVisibleCells().length}>
                  {renderRowSubComponent({ row })}
                </Td>
              </Tr>
            )}
          </Fragment>
        ))}
      </TBody>
    </Table>
  );
}

export default MainTable;
