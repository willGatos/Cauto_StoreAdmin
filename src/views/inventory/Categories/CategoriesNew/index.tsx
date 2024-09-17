import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Alert } from "@/components/ui/Alert"
import { Checkbox } from "@/components/ui/Checkbox"

interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  parent_id: number | null;
  subcategories?: Category[];
}

interface FormValues {
  name: string;
  description: string;
  parent_id: number | null;
  subcategories: number[];
}

const initialValues: FormValues = {
  name: '',
  description: '',
  parent_id: null,
  subcategories: [],
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('El nombre es requerido'),
  description: Yup.string(),
  parent_id: Yup.number().nullable(),
  subcategories: Yup.array().of(Yup.number()),
})

// Servicio mock para obtener categorías (reemplazar con llamada real a Supabase)
const fetchCategories = async (shopId: number): Promise<Category[]> => {
  // Simulamos una llamada a la API
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, name: 'Electrónica', description: 'Productos electrónicos', created_at: new Date().toISOString(), parent_id: null },
    { id: 2, name: 'Ropa', description: 'Artículos de vestir', created_at: new Date().toISOString(), parent_id: null },
    { id: 3, name: 'Smartphones', description: 'Teléfonos inteligentes', created_at: new Date().toISOString(), parent_id: 1 },
  ];
}

// Servicios de Supabase (comentados)
/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

const fetchCategoriesFromSupabase = async (shopId: number): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shopId)
  
  if (error) throw error;
  return data;
}

const createCategory = async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .single()
  
  if (error) throw error;
  return data;
}

const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .single()
  
  if (error) throw error;
  return data;
}
*/

export default function CategoryForm() {
  const { id, shopId } = useParams<{ id: string, shopId: string }>()
  const [initialFormValues, setInitialFormValues] = useState<FormValues>(initialValues)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const categoriesData = await fetchCategories(parseInt(shopId))
        setCategories(categoriesData)

        if (id) {
          // Aquí iría la lógica para cargar los datos de la categoría existente
          // Por ahora, simularemos la carga con datos mock
          const existingCategory = categoriesData.find(c => c.id === parseInt(id))
          if (existingCategory) {
            setInitialFormValues({
              name: existingCategory.name,
              description: existingCategory.description || '',
              parent_id: existingCategory.parent_id,
              subcategories: categoriesData.filter(c => c.parent_id === existingCategory.id).map(c => c.id),
            })
          }
        }
      } catch (err) {
        setError('Error al cargar los datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, shopId])

  const handleSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      // Aquí iría la lógica para enviar los datos al servidor
      // Por ahora, simularemos el envío
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(values)
      alert(id ? 'Categoría actualizada' : 'Categoría creada')
      
      // Comentado: Código para usar con Supabase
      /*
      if (id) {
        await updateCategory(parseInt(id), {
          name: values.name,
          description: values.description,
          parent_id: values.parent_id,
        })
      } else {
        const newCategory = await createCategory({
          name: values.name,
          description: values.description,
          parent_id: values.parent_id,
          shop_id: parseInt(shopId),
        })
        
        // Actualizar las subcategorías
        for (const subcategoryId of values.subcategories) {
          await updateCategory(subcategoryId, { parent_id: newCategory.id })
        }
      }
      */
    } catch (err) {
      setError('Error al guardar la categoría')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-6">{id ? 'Editar Categoría' : 'Crear Categoría'}</h2>
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name">Nombre</label>
                <Field name="name" as={Input} className="mt-1" />
                {errors.name && touched.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description">Descripción</label>
                <Field name="description" as={Textarea} className="mt-1" />
                {errors.description && touched.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label>Categoría Padre</label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-parent"
                      checked={values.parent_id === null}
                      onCheckedChange={(checked) => {
                        setFieldValue('parent_id', checked ? null : '')
                      }}
                    />
                    <label htmlFor="no-parent">Sin categoría padre</label>
                  </div>
                  {categories.filter(c => c.id !== parseInt(id)).map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`parent-${category.id}`}
                        checked={values.parent_id === category.id}
                        onCheckedChange={(checked) => {
                          setFieldValue('parent_id', checked ? category.id : null)
                        }}
                      />
                      <label htmlFor={`parent-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label>Subcategorías</label>
                <div className="space-y-2 mt-2">
                  {categories.filter(c => c.id !== parseInt(id) && c.id !== values.parent_id).map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subcategory-${category.id}`}
                        checked={values.subcategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const newSubcategories = checked
                            ? [...values.subcategories, category.id]
                            : values.subcategories.filter(id => id !== category.id)
                          setFieldValue('subcategories', newSubcategories)
                        }}
                      />
                      <label htmlFor={`subcategory-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : id ? 'Actualizar Categoría' : 'Crear Categoría'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Card>
  )
}