 import { apiGetAllAttributes } from '@/services/inventory/AttributeService'
import { apiGetAllCategories } from '@/services/inventory/CategoryService'
import { useService } from '@/utils/hooks/useService'
import ExpandingTable from './TablaExpandible'
import { HiOutlinePlusCircle, HiOutlineMinusCircle } from 'react-icons/hi';
import { Button } from '@/components/ui';
import FormDialog from '../Form';
import FormDialogVariation from '../Variation';
import { apiUpdateAttribute } from '@/services/inventory/AttributeService';
import { apiUpdateCategory } from '@/services/inventory/CategoryService';
import FormDialogSubcategory from '../Subcategory';
import { apiUpdateSubcategory } from '@/services/inventory/SubcategoryService';
function GetElements() {
    const [categories] = useService(apiGetAllCategories)
    const [attributes] = useService(apiGetAllAttributes)

    // TODO: Buscar Tabla de elementos expandibles
    // TODO: Mirar como se puede hacer como un componente en el que se inserten los datos desde afuera
    // TODO: Asignarle los valores desde el Servicio.
    
    // TODO: Crear el Boton de Delete y Update
    // TODO: Mirar como asociar los elementos desde los modales hacia los botones de Editar
    // TODO: Hacer el servicio para hacer el Update
    
    // TODO: Hacer la funcion para llamar el Delete
    // TODO: Ajustar el servicio en el Backend para Delete


    return (
        <div>
            <h3 className='my-6'> Atributos </h3>
            { 
            //<ExpandingTable data={attributes} columsDef={columnDefs}/>
            attributes.map(
                (e, key)=>
                (
                    <div key={key} style={{ borderBottom: '1px solid black' }}>
                    <div className='flex gap-10 items-center justify-evenly'> 
                        <span>{e.name}</span> 
                        <FormDialogVariation
                            apiService={apiUpdateAttribute}
                            ButtonText='Editar'
                            defaultValue={e}
                        />
                        <Button>Eliminar</Button>
                    </div> 
                    <p className='flex gap-12'> {e.value.map((e, key)=> <span 
                    className='my-2 p-5 py-2 bg-blue-300 rounded text-white' key={key}>{e.value}</span>)} </p>
                    <br style={{background: 'black', border: ' 000 1px'}}/>
                    </div>
                ))
            }

            <h3 className='my-6'> Categorias </h3>
            {
            //<ExpandingTable data={categories} columsDef={columnDefsForCategories}/>
             categories.map(
                 (cat, key)=> 
                 <div  key={key} style={{ borderBottom: '1px solid black' }}>
                    <div className='flex p-2 gap-16 items-center justify-evenly'>
                        <span>{cat.name} </span>
                        <FormDialog
                            apiService={ apiUpdateCategory }
                            ButtonText='Editar'
                            defaultValue={cat}
                        />
                        <Button>Eliminar</Button>
                    </div>
                    <p className='flex gap-12 '> {
                        cat.subcategories.map((e, key)=> 
                        (<FormDialogSubcategory
                            apiService={ apiUpdateSubcategory }
                            defaultValue={{...e, categoryId: cat._id, name: e.name, oldCategory: cat._id}}
                            ButtonText={e.name}
                            valueSelect={{
                                value: cat.name,
                                label: cat.name,
                                name: cat.name,
                            }}
                            key={key}
                        />)
                        
                        )
                    } 
                    </p>
                 </div>
                 ) 
            }
        </div>
    )
}

export default GetElements

/**
 * 
 * {
                        //    <span className='my-2 p-5 py-2 bg-blue-300 rounded text-white'  key={key}>{e.name}</span>
                        }
     const columnDefs = [
        {
            id: 'expander',
            header: ({ table }) => (
                <button className="text-xl" {...{onClick:table.getToggleAllRowsExpandedHandler()}}>
                    {table.getIsAllRowsExpanded() ? <HiOutlineMinusCircle /> : <HiOutlinePlusCircle />}
                </button>
            ),
            cell: ({ row }) => (
                <>
                    {row.getCanExpand() && (
                        <button className="text-xl" {...{
                            onClick: row.getToggleExpandedHandler(),
                        }}>
                            {row.getIsExpanded() ? <HiOutlineMinusCircle /> : <HiOutlinePlusCircle />}
                        </button>
                    )}
                </>
            ),
        },
        { header: 'Nombre del Atributo', accessorKey: 'name' },
    ]

    const columnDefsForCategories = [
        {
            id: 'expander',
            header: ({ table }) => (
                <button className="text-xl" {...{onClick:table.getToggleAllRowsExpandedHandler()}}>
                    {table.getIsAllRowsExpanded() ? <HiOutlineMinusCircle /> : <HiOutlinePlusCircle />}
                </button>
            ),
            cell: ({ row }) => (
                <>
                    {row.getCanExpand() && (
                        <button className="text-xl" {...{
                            onClick: row.getToggleExpandedHandler(),
                        }}>
                            {row.getIsExpanded() ? <HiOutlineMinusCircle /> : <HiOutlinePlusCircle />}
                        </button>
                    )}
                </>
            ),
        },
        { header: 'Nombre de la Categoria', accessorKey: 'name' }
    ]
 */