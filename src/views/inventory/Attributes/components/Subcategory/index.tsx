import DialogWrapper from '@/components/shared/DialogWrapper'
import { Input } from '@/components/ui'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { apiGetAllCategories } from '@/services/inventory/CategoryService'
import { convertForSelecters } from '@/utils/convertForSelecters'
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

export default function FormDialog({
  defaultValue={name: '', categoryId: '', _id: ''},
  apiService,
  ButtonText = 'Crear Subategoria',
  valueSelect=''

  }) {

    const [isOpen, setIsOpen] = useState(false)
    const [value, setValue] = useState(defaultValue)
    const [valueState, setValueState] = useState([])
    const [valueForSelect, setValueForSelect] = useState(valueSelect)

    const fetchData = async () => {
        try {
            // Llamada a la API
            const { data } = await apiGetAllCategories();
            console.log(data);
            
            // Conversión de datos
            let converted = data.map((category) => convertForSelecters(category));
            console.log(converted)
            // Actualización del estado
            setValueState(converted);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    useEffect(()=> {
        fetchData()
    },[])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
        setValue(prevValue => ({...prevValue, name: e.target.value, }))

    const openDialog = () => setIsOpen(true)
    const onDialogClose = () => setIsOpen(false)

    //TODO: Hacer El formulario para poder agregar en un objeto hacia un array 
    // y * reducir la cantidad de veces que tengo que anadir en Subcategoria


  return (
    <div>
            <DialogWrapper
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                ButtonText={ButtonText}
            > 
               <div className='flex gap-5 flex-col'> 
               <h3>Nombre de Categoria</h3>
               <Select
                    name='categoryId'
                    value={valueForSelect}
                    placeholder="Categoria a la que pertenece"
                    options={valueState}
                    onChange={(newValue => setValue(prev => {
                        console.log(prev, newValue)
                        setValueForSelect(newValue)
                        return ({...prev, categoryId: newValue._id})
                    })
                )}
                />

               <h3>Nombre de Subategoria</h3>
                    <Input
                        name='name'
                        value={value.name}
                        onChange={handleChange}
                        placeholder="Ejemplo: Blusa, Pantalón"
                    />
                    
                    {/* 
                    <Select
                        name='categoryId'
                        placeholder="Please Select"
                        options={valueState.options}
                        value={valueState.value}
                    />
                    */}

                    <div className='flex justify-center items-center gap-4'>
                        <Button onClick={() => {
                            onDialogClose();
                            apiService({...defaultValue,...value});
                        }}>
                            Aceptar
                        </Button>
                        
                        <Button onClick={()=>onDialogClose()}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogWrapper>
      </div>
  )
}