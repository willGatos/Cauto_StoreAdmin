const inventoryStatusColor: Record<
    number,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    0: {
        label: 'En Inventario',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    1: {
        label: 'En Camino',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    2: {
        label: 'Agotado',
        dotClass: 'bg-red-500',
        textClass: 'text-red-500',
    },
}
export default inventoryStatusColor

export const statuses = ['En Inventario', 'En Camino', 'Agotado'];