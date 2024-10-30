import { Fragment } from "react";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Table from "@/components/ui/Table";
import Avatar from "@/components/ui/Avatar";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { NumericFormat } from "react-number-format";
import isLastChild from "@/utils/isLastChild";

type ProductVariation = {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  images: string[];
  currency: string;
};

type ProductVariationsProps = {
  data?: ProductVariation[];
};

const { Tr, Th, Td, THead, TBody } = Table;

const columnHelper = createColumnHelper<ProductVariation>();

const ProductColumn = ({ row }: { row: ProductVariation }) => {
  return (
    <div className="flex">
      <Avatar size={90} src={row.images[0]} />
      <div className="">
        <div className="ltr:ml-2 rtl:mr-2">
          <h6 className="mb-2">{row.name}</h6>
        </div>

        <div className="flex mx-2 gap-2">
          {row.attributesValues.map((av, key) => (
            <div key={key} className="bg-slate-500 text-red-50 px-2 rounded-md">
              <span>{av.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PriceAmount = ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) => {
  return (
    <NumericFormat
      displayType="text"
      value={(Math.round(amount * 100) / 100).toFixed(2)}
      prefix={`${currency} `}
      thousandSeparator={true}
    />
  );
};

const columns = [
  columnHelper.accessor("name", {
    header: "Productos",
    cell: (props) => {
      const row = props.row.original;
      return <ProductColumn row={row} />;
    },
  }),
  columnHelper.accessor("price", {
    header: "Precio",
    cell: (props) => {
      const row = props.row.original;
      return <PriceAmount amount={row.price} currency={row.currency} />;
    },
  }),
  columnHelper.accessor("quantity", {
    header: "Cantidad",
  }),
];

const ProductVariations = ({ data = [] }: ProductVariationsProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <AdaptableCard className="mb-4">
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
    </AdaptableCard>
  );
};

export default ProductVariations;
