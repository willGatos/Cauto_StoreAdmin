import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Tag from '@/components/ui/Tag'
import Avatar from '@/components/ui/Avatar'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Lead } from '../store'
import { useEffect, useState } from 'react'
import CreateLink from './CreateLink'
import { SubscriptionLinkServiceCreate, getSubscriptionLinkService } from '@/services/SubscriptionLinkService'
import NotificationType from './NotificationMessage'
import NotificationMessage from './NotificationMessage'
type SellerProps = {
    data?: Lead[]
    className?: string
}

const { Tr, Td, TBody, THead, Th } = Table

const NameColumn = ({ row }: { row: Lead }) => {
    return (
        <div className="flex items-center gap-2">
            <Avatar shape="circle" size={25} src={row.avatar} />
            <span className="font-semibold">{row.name}</span>
        </div>
    )
}

const ComidaColumn = ({ row }: { row: Lead }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold">{row.comida}</span>
        </div>
    )
}

const Sellertatus = ({ status }: { status: number }) => {
    switch (status) {
        case 0:
            return <Tag className="rounded-md">New</Tag>
        case 1:
            return (
                <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100  border-0 rounded">
                    Sold
                </Tag>
            )
        case 2:
            return (
                <Tag className="text-amber-600 bg-amber-100 dark:text-amber-100 dark:bg-amber-500/20  border-0 rounded">
                    Not Interested
                </Tag>
            )
        case 3:
            return (
                <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0 rounded">
                    In Progress
                </Tag>
            )
        default:
            return <></>
    }
}

const columnHelper = createColumnHelper<Lead>()

const columns = [
    columnHelper.accessor('name', {
        header: 'Nombre',
        cell: (props) => {
            const row = props.row.original
            return <NameColumn row={row} />
        },
    }),
    columnHelper.accessor('comida', {
        header: 'Comida',
        cell: (props) => {
            const row = props.row.original
            return <ComidaColumn row={row} />
        },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (props) => {
            const row = props.row.original
            return <Sellertatus status={row.status} />
        },
    }),
    columnHelper.accessor('email', {
        header: 'Email',
    }),
    columnHelper.accessor('createdTime', {
        header: 'Created Time',
        cell: (props) => {
            const row = props.row.original
            return (
                <span>
                    {dayjs.unix(row.createdTime).format('DD/MM/YYYY hh:mm')}
                </span>
            )
        },
    }),
    columnHelper.accessor('assignee', {
        header: 'Assignee',
        cell: (props) => {
            const row = props.row.original
            return (
                <Tag className="rounded-md font-bold cursor-pointer select-none text-gray-900 dark:text-gray-100">
                    {row.assignee}
                </Tag>
            )
        },
    }),
]

const Sellers = ({ data = [],className }: SellerProps) => {
    const navigate = useNavigate()
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [subscriptionLink, setSubscriptionLink] = useState<{ _id: string; expDate: string; }>({_id: "", expDate: "" })
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })



    useEffect(()=>{
        getSubscriptionLinkService()
        .then((resp) => {
            console.log(resp.data)
            setSubscriptionLink(resp.data)
        })
    },[])

    return (
        <>
        <Card className={className}>
            <div className="flex items-center justify-between mb-4">
                <h4>Vendedores</h4>
                
            </div>
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
        </Card>
       {/*  <CreateLink setIsOpen={setIsOpen} dialogIsOpen={dialogIsOpen} subscriptionLink={subscriptionLink} /> */}
        </>
    )
}

export default Sellers

    /* const onNavigate = () => {
        navigator.clipboard.writeText("COMIDA")
    }
    type MyApiResponse = {
        someResponseData: string
        someResponseData2: boolean
    }
    
    type MyApiRequest = {} */