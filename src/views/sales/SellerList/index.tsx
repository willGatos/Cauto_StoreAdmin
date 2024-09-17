import React, { useMemo, Fragment } from 'react';
import Table from '@/components/ui/Table';
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';
import { mockDataService } from './mock/service';
import { User } from '@/@types/auth';
import { Order } from '@/@types/orders';
import type { ColumnDef, Row } from '@tanstack/react-table';
import type { ReactElement } from 'react';
import InviteButton from './components/InviteButton';

type ReactTableProps<T> = {
    renderRowSubComponent: (props: { row: Row<T> }) => ReactElement;
    getRowCanExpand: (row: Row<T>) => boolean;
};

const { Tr, Th, Td, THead, TBody } = Table;

function ReactTable({
    renderRowSubComponent,
    getRowCanExpand,
}: ReactTableProps<User>) {
    const [sellers, setSellers] = React.useState<User[]>([]);

    React.useEffect(() => {
        mockDataService.getSellers().then(setSellers);
    }, []);

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            header: () => null, // No header
            id: 'expander', // It needs an ID
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
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: 'Nombre',
            accessorKey: 'name',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Teléfono',
            accessorKey: 'phone',
        },
        {
            header: 'Fecha de Registro',
            accessorFn: (row) => new Date(row.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        },
        {
            header: 'Ventas Totales',
            accessorFn: (row) => row.orders.reduce((sum, order) => sum + order.total, 0).toLocaleString('es-ES', {
                style: 'currency',
                currency: 'USD',
            }),
        },
        {
            header: 'Órdenes Completadas',
            accessorFn: (row) => row.orders.filter(order => order.status === 'Completada').length,
        },
        {
            header: 'Total de Órdenes',
            accessorFn: (row) => row.orders.length,
        },
    ], []);

    const table = useReactTable({
        data: sellers,
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
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
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

const SubTable = ({ data }: { data: Order[] }) => {
    const columns = useMemo<ColumnDef<Order>[]>(() => [
        {
            header: 'ID de Orden',
            accessorKey: 'id',
        },
        {
            header: 'Total',
            accessorFn: (row) => row.total.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'USD',
            }),
        },
        {
            header: 'Estado',
            accessorKey: 'status',
        },
        {
            header: 'Fecha de Creación',
            accessorFn: (row) => new Date(row.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        },
    ], []);

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
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </Td>
                        ))}
                    </Tr>
                ))}
            </TBody>
        </Table>
    );
};

const renderSubComponent = ({ row }: { row: Row<User> }) => {
    const orders = row.original.orders || [];
    return <SubTable data={orders} />;
};

const SubComponent = () => {
    return (
        <>
        <InviteButton ></InviteButton>
        <ReactTable
            renderRowSubComponent={renderSubComponent}
            getRowCanExpand={(row) => row.original.orders && row.original.orders.length > 0}
        />
        </>
    );
};

export default SubComponent;