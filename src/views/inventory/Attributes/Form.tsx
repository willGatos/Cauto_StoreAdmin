import Button from '@/components/ui/Button'

const Variant = () => {
    return (
        <div className="inline-flex flex-wrap xl:flex gap-2">
            <Button variant="twoTone">Crear Atributo    </Button>
            <Button variant="twoTone">Crear Categoria   </Button>
            <Button variant="twoTone">Crear Subcategoria</Button>
        </div>
    )
}

export default Variant