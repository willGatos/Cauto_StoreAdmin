import { useCallback } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import useThemeClass from "@/utils/hooks/useThemeClass";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import dayjs from "dayjs";

type Order = {
  id: string;
  created_at: number;
  customer: string;
  status: number;
  paymentMehod: string;
  paymentIdendifier: string;
  totalAmount: number;
};

type LatestOrderProps = {
  data?: Order[];
  className?: string;
};

type OrderColumnPros = {
  row: Order;
};

const { Tr, Td, TBody, THead, Th } = Table;


export const orderStatusColor: Record<
  number,
  {
    label: string;
    dotClass: string;
    textClass: string;
    value: number
  }
> = {
  0: {
    label: "Cancelado - Pagado",
    dotClass: "bg-gray-500", // Color genérico para estados no conocidos
    textClass: "text-gray-500",
    value: 0,
  },
  1: {
    label: "Cancelado",
    dotClass: "bg-gray-500", // Color genérico para estados no conocidos
    textClass: "text-gray-500",
    value: 1,
  },
  2: {
    label: "Pendiente",
    dotClass: "bg-amber-500", // Color para el punto
    textClass: "text-amber-500", // Color para el texto
    value: 2,

  },
  3: {
    label: "En proceso",
    dotClass: "bg-blue-500",
    textClass: "text-blue-500",
    value: 3,

  },
  4: {
    label: "Listo para Entrega",
    dotClass: "bg-purple-500",
    textClass: "text-purple-500",
    value: 4,
  },
  5: {
    label: "Pagado a los Gestores",
    dotClass: "bg-emerald-500", // Completado
    textClass: "text-emerald-500",
    value: 5,
  },
};

export const deliveryStatusColor: Record<
  number,
  {
    label: string;
    dotClass: string;
    textClass: string;
    value: number
  }
> = {
  0: {
    label: "No Disponible",
    dotClass: "bg-gray-500", // Color genérico para estados no conocidos
    textClass: "text-gray-500",
    value: 0,
  },
  1: {
    label: "Disponible",
    dotClass: "bg-gray-500", // Color genérico para estados no conocidos
    textClass: "text-gray-500",
    value: 1,
  },
  2: {
    label: "Entregado",
    dotClass: "bg-amber-500", // Color para el punto
    textClass: "text-amber-500", // Color para el texto
    value: 2,

  },
  3: {
    label: "Pagado",
    dotClass: "bg-blue-500",
    textClass: "text-blue-500",
    value: 3,

  },
};


const OrderColumn = ({ row }: OrderColumnPros) => {
  const { textTheme } = useThemeClass();
  const navigate = useNavigate();

  const onView = useCallback(() => {
    navigate(`/app/sales/order-details/${row.id}`);
  }, [navigate, row]);

  return (
    <span
      className={`cursor-pointer select-none font-semibold hover:${textTheme}`}
      onClick={onView}
    >
      #{row.id}
    </span>
  );
};

const columnHelper = createColumnHelper<Order>();

const columns = [
  columnHelper.accessor("id", {
    header: "Orden",
    cell: (props) => <OrderColumn row={props.row.original} />,
  }),
  columnHelper.accessor("status", {
    header: "Estado",
    cell: (props) => {
      const { status } = props.row.original;
      console.log('',status);
      return (
        <div className="flex items-center">
          <Badge className={orderStatusColor[status].dotClass} />
          <span
            className={`ml-2 rtl:mr-2 capitalize font-semibold ${orderStatusColor[status].textClass}`}
          >
            {orderStatusColor[status].label}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Fecha",
    cell: (props) => {
      const row = props.row.original;
      return <span>{dayjs(row.created_at).format("DD/MM/YYYY")}</span>;
    },
  }),
  columnHelper.accessor("customer", {
    header: "Customer",
  }),
  columnHelper.accessor("totalAmount", {
    header: "Profile Progress",
    cell: (props) => {
      const { totalAmount } = props.row.original;
      return (
        <NumericFormat
          displayType="text"
          value={(Math.round(totalAmount * 100) / 100).toFixed(2)}
          prefix={"$"}
          thousandSeparator={true}
        />
      );
    },
  }),
];

const LatestOrder = ({ data = [], className }: LatestOrderProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-6">
        <h4>Últimas Ordenes</h4>
        <Button size="sm">Ver Ordenes</Button>
      </div>
      <Table>
        <THead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Th key={header.id} colSpan={header.colSpan}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Th>
                );
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
                  );
                })}
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </Card>
  );
};

export default LatestOrder;
