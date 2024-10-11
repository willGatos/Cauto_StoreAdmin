import { Fragment } from 'react'
import AdaptableCard from '@/components/shared/AdaptableCard'
import Table from '@/components/ui/Table'
import Avatar from '@/components/ui/Avatar'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { NumericFormat } from 'react-number-format'
import isLastChild from '@/utils/isLastChild'

type ProductVariation = {
    id: string
    name: string
    price: number
    stock: number
    createdAt: string
    thumbnail: string
    images: string[]
    currency: string
}

type ProductVariationsProps = {
    data?: ProductVariation[]
}

const { Tr, Th, Td, THead, TBody } = Table

const columnHelper = createColumnHelper<ProductVariation>()

const ProductColumn = ({ row }: { row: ProductVariation }) => {
    return (
        <div className="flex">
            <Avatar size={90} src={row.thumbnail} />
            <div className="ltr:ml-2 rtl:mr-2">
                <h6 className="mb-2">{row.name}</h6>
                {row.images.length > 0 && (
                    <div className="mb-1">
                        <span>Pictures: </span>
                        {row.pictures.map((picture, index) => (
                            <Fragment key={picture + index}>
                                <span className="font-semibold">{picture}</span>
                                {!isLastChild(row.pictures, index) && (
                                    <span>, </span>
                                )}
                            </Fragment>
                        ))}
                    </div>
                )}
                <div>
                    <span>Stock: </span>
                    <span className="font-semibold">{row.stock}</span>
                </div>
                <div>
                    <span>Created At: </span>
                    <span className="font-semibold">{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    )
}

const PriceAmount = ({ amount, currency }: { amount: number, currency: string }) => {
    return (
        <NumericFormat
            displayType="text"
            value={(Math.round(amount * 100) / 100).toFixed(2)}
            prefix={`${currency} `}
            thousandSeparator={true}
        />
    )
}

const columns = [
    columnHelper.accessor('name', {
        header: 'Product',
        cell: (props) => {
            const row = props.row.original
            return <ProductColumn row={row} />
        },
    }),
    columnHelper.accessor('price', {
        header: 'Price',
        cell: (props) => {
            const row = props.row.original
            return <PriceAmount amount={row.price} currency={row.currency} />
        },
    }),
    columnHelper.accessor('stock', {
        header: 'Stock',
    }),
]

const ProductVariations = ({ data = [] }: ProductVariationsProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <AdaptableCard className="mb-4">
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </Th>
                                )
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
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
        </AdaptableCard>
    )
}

export default ProductVariations
