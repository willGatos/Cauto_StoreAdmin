import { useEffect, useMemo, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { FiPackage } from 'react-icons/fi'
import {
    getProducts,
    setTableData,
    setSelectedProduct,
    toggleDeleteConfirmation,
    useAppDispatch,
    useAppSelector,
} from '../store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import ProductDeleteConfirmation from './ProductDeleteConfirmation'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import type {
    DataTableResetHandle,
    OnSortParam,
    ColumnDef,
} from '@/components/shared/DataTable'

import { ProductData } from '../../ProductForm'
import inventoryStatusColor, {statuses} from '@/utils/inventoryStatusColor'


const ActionColumn = ({ row }: { row: ProductData }) => {
    const dispatch = useAppDispatch()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onEdit = () => {
        navigate(`/app/sales/product-edit/${row._id}`)
    }

    const onDelete = () => {
        dispatch(toggleDeleteConfirmation(true))
        dispatch(setSelectedProduct(row._id))
    }

    return (
        <div className="flex justify-end text-lg">
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={onEdit}
            >
                <HiOutlinePencil />
            </span>
            <span
                className="cursor-pointer p-2 hover:text-red-500"
                onClick={onDelete}
            >
                <HiOutlineTrash />
            </span>
        </div>
    )
}

const ProductColumn = ({ row }: { row: ProductData }) => {
    const avatar = row.imgList[0] ? (
        <Avatar src={"http://localhost:3000/uploads/thn-" + row.imgList[0]} />
    ) : (
        <Avatar icon={<FiPackage />} />
    )

    return (
        <div className="flex items-center">
            {avatar}
            <span className={`ml-2 rtl:mr-2 font-semibold`}>{row.subcategory?.name}</span>
        </div>
    )
}

const ProductTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)

    const dispatch = useAppDispatch()

    const { pageIndex, pageSize, sort, query, total } = useAppSelector(
        (state) => state.salesProductList.data.tableData
    )

    const filterData = useAppSelector(
        (state) => state.salesProductList.data.filterData
    )

    const loading = useAppSelector(
        (state) => state.salesProductList.data.loading
    )

    const data = useAppSelector(
        (state) => state.salesProductList.data.productList
    )

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIndex, pageSize, sort])

    useEffect(() => {
        if (tableRef) {
            tableRef.current?.resetSorting()
        }
    }, [filterData])

    const tableData = useMemo(
        () => ({ pageIndex, pageSize, sort, query, total }),
        [pageIndex, pageSize, sort, query, total]
    )

    const fetchData = () => {
        dispatch(getProducts({ pageIndex, pageSize, sort, query, filterData }))
    }

    const columns: ColumnDef<ProductData>[] = useMemo(
        () => [
            {
                header: 'Subcategoría',
                accessorKey: 'subcategory',
                cell: (props) => {
                    const row = props.row.original
                    return <ProductColumn row={row} />
                },
            },
            {
                header: 'Marca',
                accessorKey: 'brand',
                cell: (props) => {
                    const row = props.row.original
                    return <span className="capitalize">{row.brand}</span>
                },
                sortable: true
            },
            {
                header: 'Cant.',
                accessorKey: 'stock',
                sortable: true,
            },
            {
                header: 'Estado',
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    const index = statuses.indexOf(status);
                    return (
                        <div className="flex items-center gap-2">
                            <Badge
                                className={
                                    inventoryStatusColor[index].dotClass
                                }
                            />
                            <span
                                className={`capitalize font-semibold ${inventoryStatusColor[index].textClass}`}
                            >
                                {inventoryStatusColor[index].label}
                            </span>
                        </div>
                    )
                },
            }, 
            {
                header: 'P.Venta',
                accessorKey: 'pricingDetails.normalPrice',
                cell: (props) => {
                    const { pricingDetails } = props.row.original
                    return <span>${pricingDetails.normalPrice}</span>
                },
            },
            {
                header: 'Costo',
                accessorKey: 'pricingDetails.cost',
                cell: (props) => {
                    const { pricingDetails } = props.row.original
                    return <span>${pricingDetails.cost}</span>
                },
            },
            {
                header: 'Beneficio de Tienda',
                accessorKey: 'pricingDetails.earnedPercentageOfProfit',
                cell: (props) => {
                    const { pricingDetails } = props.row.original
                    return <span>${pricingDetails.earnedPercentageOfProfit}</span>
                },
            },
            {
                header: '',
                id: 'action',
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        []
    )

    const onPaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        dispatch(setTableData(newTableData))
    }

    const onSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        dispatch(setTableData(newTableData))
    }

    const onSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        dispatch(setTableData(newTableData))
    }

    return (
        <>
            <DataTable
                ref={tableRef}
                columns={columns}
                data={data}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ className: 'rounded-md' }}
                loading={loading}
                pagingData={{
                    total: tableData.total as number,
                    pageIndex: tableData.pageIndex as number,
                    pageSize: tableData.pageSize as number,
                }}
                onPaginationChange={onPaginationChange}
                onSelectChange={onSelectChange}
                onSort={onSort}
            />
            <ProductDeleteConfirmation />
        </>
    )
}

export default ProductTable
