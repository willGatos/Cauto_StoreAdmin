import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui'
import DialogWrapper from '@/components/shared/DialogWrapper'
import type { ChangeEvent } from 'react'

export default function FormDialog({
  defaultValue='',
  apiService,
  ButtonText='Crear Categoria'
  }) {

  
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)



    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
        setValue(prev => ({...prev, name: e.target.value}))

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
                    <Input
                        name='name'
                        value={value.name}
                        onChange={handleChange}
                        placeholder="Ejemplo: Ropa"
                    />


                    <div className='flex justify-center items-center gap-4'>
                        <Button onClick={() => {
                            onDialogClose();
                            apiService(value);
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