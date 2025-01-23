import { useMemo, Fragment, useState, useEffect } from "react";
import Table from "@/components/ui/Table";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ReactElement } from "react";
import { mockOrderService } from "../mock/mockService";
import { Order, OrderItem } from "@/@types/orders";
import Label from "@/components/ui/Label";
import { Button, Tag } from "@/components/ui";

type ReactTableProps<T> = {
  RenderRowSubComponent: (props: { row: Row<T> }) => ReactElement;
  getRowCanExpand: (row: Row<T>) => boolean;
};

const { Tr, Th, Td, THead, TBody } = Table;

function ReactTable({
  RenderRowSubComponent,
  getRowCanExpand,
}: ReactTableProps<Order>) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    mockOrderService.getOrders().then(setOrders);
  }, []);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: () => null,
        id: "expander",
        cell: ({ row }) => (
          <>
            {row.getCanExpand() ? (
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
            ) : null}
          </>
        ),
        subCell: () => null,
      },
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => (
          <a
            className="text-blue-600 underline"
            href={`/app/sales/order-details/${row.original.id}`}
          >
            {row.original.id}{" "}
          </a>
        ),
      },
      {
        header: "Cliente",
        accessorKey: "clients.name",
      },
      {
        header: "Teléfono",
        accessorKey: "clients.phone",
      },
      {
        header: "Estado",
        accessorKey: "status",
      },
      {
        header: "Total",
        accessorKey: "total",
        cell: ({ row }) => row.original.total + " CUP",
      },
      {
        header: "Fecha",
        accessorKey: "created_at",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders, // Usa los datos de la tabla principal
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
                  <RenderRowSubComponent row={row} />
                </Td>
              </Tr>
            )}
          </Fragment>
        ))}
      </TBody>
    </Table>
  );
}

function RenderRowSubComponent({ row }: { row: Row<Order> }) {
  const columns = useMemo<ColumnDef<OrderItem>[]>(
    () => [
      {
        header: "Producto",
        accessorKey: "variation.name",
        cell: ({ row }) =>
          row.original.variation.attribute_values.map((av) => (
            <Tag className="m-1">{av.value}</Tag>
          )),
      },
      {
        header: "Cantidad",
        accessorKey: "quantity",
      },
      {
        header: "Precio",
        accessorKey: "price",
        cell: ({ row }) => row.original.price + " CUP",
      },
    ],
    []
  );

  const subTable = useReactTable({
    data: row.original.items, // Datos de la subtabla (items del pedido)
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <THead>
        {subTable.getHeaderGroups().map((headerGroup) => (
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
        {subTable.getRowModel().rows.map((row) => (
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

// Formateadores
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function SubComponent() {
  return (
    <ReactTable
      RenderRowSubComponent={RenderRowSubComponent}
      getRowCanExpand={() => true}
    />
  );
}
