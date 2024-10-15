import React, { useMemo, Fragment } from "react";
import Table from "@/components/ui/Table";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi";
import { mockSuppliesService } from "../Data/mockService";
import type { Supply, SupplyVariation } from "../Data/types";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ReactElement } from "react";
import { supabaseService } from "@/services/Supabase/AttributeService";
import { Button } from "@/components/ui";

type ReactTableProps<T> = {
  renderRowSubComponent: (props: { row: Row<T> }) => ReactElement;
  getRowCanExpand: (row: Row<T>) => boolean;
};

const { Tr, Th, Td, THead, TBody } = Table;

function ReactTable({
  renderRowSubComponent,
  getRowCanExpand,
}: ReactTableProps<Supply>) {
  const [supplies, setSupplies] = React.useState<Supply[]>([]);

  React.useEffect(() => {
    supabaseService.getSupplies().then(setSupplies);
  }, []);

  const columns = useMemo<ColumnDef<Supply>[]>(
    () => [
      {
        header: () => null, // No header
        id: "expander", // It needs an ID
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
      },
      {
        header: "Nombre",
        accessorKey: "name",
      },
      {
        header: "Tipo",
        accessorFn: (row) => (row.type === "Fixed" ? "Fijo" : "Variable"),
      },
      {
        header: "Acciones",
        id: "actions",
        cell: ({ row }) => (
          <a
            href={"supply-new/" + row.original.id}
            className="flex justify-end"
          >
            <Button className="ml-2 text-blue-500 hover:text-blue-700">
              Editar
            </Button>
          </a>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: supplies,
    columns,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <>
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
    </>
  );
}

const SubTable = ({ data }: { data: SupplyVariation[] }) => {
  const columns = useMemo<ColumnDef<SupplyVariation>[]>(
    () => [
      {
        header: "Costo",
        accessorKey: "cost",
      },
      {
        header: "Costo",
        accessorKey: "currency.name",
      },
      {
        header: "Descripción",
        accessorKey: "description",
      },
      {
        header: "Medida",
        accessorKey: "measure",
      },
      {
        header: "Fecha de Creación",
        accessorFn: (row) => new Date(row.created_at).toLocaleString(),
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
};

const renderSubComponent = ({ row }: { row: Row<Supply> }) => {
  const variations = row.original.supply_variation || []; // Cambiar a supply_variation
  return <SubTable data={variations} />;
};

const SubComponent = () => {
  return (
    <ReactTable
      renderRowSubComponent={renderSubComponent}
      getRowCanExpand={(row) =>
        row.original.supply_variation &&
        row.original.supply_variation.length > 0
      }
    />
  );
};

export default SubComponent;
