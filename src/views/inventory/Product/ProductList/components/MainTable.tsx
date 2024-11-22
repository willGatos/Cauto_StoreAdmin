import { Button } from "@/components/ui/Button";
import HandleFeedback from "@/components/ui/FeedBack";
import Table from "@/components/ui/Table";
import supabase from "@/services/Supabase/BaseClient";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, useMemo } from "react";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";

const { Tr, Th, Td, THead, TBody } = Table;

function MainTable({
  data,
  setProducts,
  renderRowSubComponent,
  getRowCanExpand,
}) {
  const { handleSuccess, handleLoading } = HandleFeedback();
  const deleteFunction = async (row) => {
    console.log(row.original);
    const varIds = row.original.variations.map((v) => v.id);
    console.log("VAR ID", varIds);
    await supabase
      .from("supply_variation_product_variations")
      .delete()
      .in("product_variation_id", varIds);
    await supabase
      .from("product_variation_attributes")
      .delete()
      .in("product_variation_id", varIds);

    await supabase
      .from("product_supplies")
      .delete()
      .eq("product_id", row.original.id);

    await supabase
      .from("product_variations")
      .delete()
      .eq("product_id", row.original.id);
    await supabase.from("products").delete().eq("id", row.original.id);
  };
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
          return (
            <div>
              {(row.original.type == "simple" && "Simple") ||
                (row.original.type == "variable" && "Con Variantes")}
            </div>
          );
        },
      },
      {
        header: "Origen",
        //accessorKey: "origin",
        cell: ({ row }) => {
          console.log(row);
          return (
            <div>
              {(row.original.origin == "manufactured" && "Manufacturado") ||
                (row.original.origin == "imported" && "Importado")}
            </div>
          );
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
            <div className="flex gap-5">
              <a href={"product-edit/" + row.original.id}>
                <Button>Editar</Button>
              </a>
              <div>
                <Button
                  onClick={async () => {
                    handleLoading(true);
                    await deleteFunction(row)
                      .then(() => handleSuccess("Eliminado con Éxito"))
                      .then(() =>
                        setProducts((prev) =>
                          prev.filter((prod) => prod.id != row.original.id)
                        )
                      );
                  }}
                >
                  Eliminar
                </Button>
              </div>
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
