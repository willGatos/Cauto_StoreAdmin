import DialogWrapper from '@/components/shared/DialogWrapper'
import { Input } from '@/components/ui'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { ChangeEvent } from 'react'
import { useState } from 'react'

export default function FormDialog({
  defaultValue={name: '', value: []},
  apiService,
  ButtonText='',
  }) {
    const [isOpen, setIsOpen] = useState(false)
    const [attribute, setAttribute] = useState(defaultValue)
    const [newValue, setNewValue] = useState('')
    const [newAttributeValues, setNewAttributeValues] = useState('')

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
        setAttribute( (prev)=> ({...prev, name: e.target.value}) )

    const handleChange2 = (e: ChangeEvent<HTMLInputElement>) =>
        setNewAttributeValues( e.target.value )

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
               <h3>Nuevo Atributo</h3>
                <Input
                    name='name'
                    value={attribute.name}
                    onChange={handleChange}
                    placeholder="Nuevo Atributo, Ejemplo: Color"
                />
                <Input
                    value={newAttributeValues}
                    onChange={handleChange2}
                    placeholder="Valor del Atributo, Ejemplo: Rojo"
                />
                
                <Button 
                    variant="solid"
                    className="mb-5" 
                    block
                    onClick={()=> setAttribute( (prev) => {
                        return ({
                        ...prev, 
                        value: [...prev.value, {value: newAttributeValues}]} 
                        )}
                    )}
                >
                    Añadir Valor
                </Button>
                
                <div className='flex'>
                    {attribute.value.map((e, key) => <Badge key={key} className="mr-4 p-2" content={e.value} /> )}
                </div>

                <div className='flex justify-center items-center gap-4'>
                    <Button onClick={() => {
                        onDialogClose();
                        apiService(attribute);
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