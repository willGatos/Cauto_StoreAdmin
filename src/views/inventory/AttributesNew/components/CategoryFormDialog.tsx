import DialogWrapper from '@/components/shared/DialogWrapper'
import { Input, Select } from '@/components/ui'
import Button from '@/components/ui/Button'
import { ChangeEvent, useState } from 'react'
import { supabaseService } from '@/services/Supabase/AttributeService'

export default function CategoryFormDialog({ defaultValue = { _id: null ,name: '', description: '', parent_id: null }, ButtonText = '', categories = [], shopId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState({ ...defaultValue, shop_id: shopId })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setCategory(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handleParentChange = (e: ChangeEvent<HTMLSelectElement>) => setCategory(prev => ({ ...prev, parent_id: e.target.value }))

  const openDialog = () => setIsOpen(true)
  const onDialogClose = () => setIsOpen(false)

  const handleSave = async () => {
    try {
      await supabaseService.saveCategory(category, !category._id)
      onDialogClose()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  return (
    <div>
      <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen} ButtonText={ButtonText}>
        <div className='flex gap-5 flex-col'>
          <h3>{category._id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <Input name='name' value={category.name} onChange={handleChange} placeholder="Nombre de la Categoría" />
          <Input name='description' value={category.description} onChange={handleChange} placeholder="Descripción de la Categoría" />

          <Select name='parent_id' value={category.parent_id || ''} onChange={handleParentChange} placeholder="Seleccione Categoría Padre">
            <option value=''>Ninguna</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Select>

          <div className='flex justify-center items-center gap-4'>
            <Button onClick={handleSave}>Aceptar</Button>
            <Button onClick={onDialogClose}>Cancelar</Button>
          </div>
        </div>
      </DialogWrapper>
    </div>
  )
}