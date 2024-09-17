import Button from '@/components/ui/Button'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { Field, Form, Formik } from 'formik'
import { HiArrowSmLeft } from 'react-icons/hi'
import * as Yup from 'yup'
import type { CallbackSetBack } from '../types'
import type { FieldProps, FormikProps, FieldInputProps } from 'formik'
/* import Upload from '@/components/ui/Upload'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineUser,
} from 'react-icons/hi' */
import axios from 'axios'
type Step2Props = CallbackSetBack;
import {useState} from "react"
import { StoreData } from '../Welcome'
/* import { StoreData } from '../Welcome'*/
export type ProfileFormModel = {
    storeLogo: string | Blob;
    storeName: string;
    identifier: string;
    address: string;
    township: string;
   // email: string
    phone: string;
  //  availableMoney: number;
}
const validationSchema = Yup.object().shape({
    storeName: Yup.string().required('Nombre de la tienda requerido')
    .min(3, 'Demasiado corto, mínimo 3 caracteres')
    .max(12, 'Demasiado largo, máximo 12 caracteres'),
    
    identifier: Yup.string()
    .matches(
        /^[a-z]+$/,
        "Debe solo contener letras minúsculas"
    )
    .required('Identificador requerido'),
    address: Yup.string().required('Dirección requerida'),
    township: Yup.string().required('Municipio requerido'),
    // availableMoney: Yup.number().required('Cantidad de dinero disponible requerida'),
    // phone: Yup.string().required('Teléfono requerido'),
    // email: Yup.string().email('Correo electrónico inválido').required('Correo electrónico requerido'),
    // storeLogo: Yup.().required('Logo de la tienda requerido'),
});

const sizes = [
    { label: 'Cerro', value: 'Cerro' },
    { label: 'Diez de Octubre', value: 'Diez de Octubre' },
    { label: 'Habana Vieja', value: 'Habana Vieja' },
    { label: 'Centro Habana', value: 'Centro Habana' },
    { label: 'Plaza de la Revolución', value: 'Plaza de la Revolución' },
    { label: 'Playa', value: 'Playa' },
    { label: 'Marianao', value: 'Marianao' },
    { label: 'La Lisa', value: 'La Lisa' },
    { label: 'Boyeros', value: 'Boyeros' },
    { label: 'Cotorro', value: 'Cotorro' },
    { label: 'Arroyo Naranjo', value: 'Arroyo Naranjo' },
    { label: 'Guanabacoa', value: 'Guanabacoa' },
    { label: 'Habana del Este', value: 'Habana del Este' },
    { label: 'Regla', value: 'Regla' },
    { label: 'San Miguel del Padrón', value: 'San Miguel del Padrón' }
  ];

function Step2 ({ storeData,setStoreData=()=>{}, onNext, onBack }: Step2Props) {

    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState("")

    return (
        <div className="text-center">
            <h3 className="mb-2">Datos de tu Empresa</h3>
            <div className="mt-8 max-w-[600px] lg:min-w-[600px] mx-auto">
                <Formik
                    initialValues={{
                        storeName: storeData.storeName,
                        storeLogo: storeData.storeLogo,
                        identifier: storeData.identifier,
                        address: storeData.address,
                        township: storeData.township,
                        availableMoney: storeData.availableMoney,
                        email: storeData.email,
                        phone: storeData.phone,
                      }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        console.log(values)
                        console.log(storeData)
                        setStoreData((prevState: StoreData)=>({...values, storeLogo: prevState.storeLogo  }))
                        onNext?.()
                    }}
                >
                    {({ values, touched, errors }) => {
                        return (
                            <Form>
                                {isLoading && <div>Cargando...</div>}

                                <FormContainer>
                                <FormItem
                                    label="Nombre de la Empresa"
                                    invalid={
                                        errors.storeName &&
                                        touched.storeName
                                    }
                                    errorMessage={errors.storeName}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="storeName"
                                        placeholder="Nombre de la Empresa"
                                        component={Input}
                                    />
                                </FormItem>
                                {storeData?.storeLogo 
                                && <img src={ process.env.SERVER + 'uploads/thn-' + storeData?.storeLogo} alt=""/>}
                                <FormItem
                                    label="Logo de la Empresa (Opcional)"
                                >
                                    <input
                                        title='storeLogo'
                                        type="file"
                                        multiple
                                        name="storeLogo"
                                        onChange={(e: any):void => {
                                            setIsLoading(true)
                                                const formData = new FormData();
                                                formData.append('file', e.target.files[0]);
                                                formData.append('upload_preset', 'service');
                                                axios.post(process.env.SERVER + 'upload/shopIcon',formData)
                                                .then((res)=>
                                                {
                                                    setStoreData((prevState:StoreData) => ({...prevState, storeLogo:res.data.fileName}))
                                                    console.log(res.data.fileName)
                                                    return res;
                                                })
                                            setIsLoading(false)
                                        }}
                                        accept="image/*"
                                        className="mt-4"
                                    />
                                </FormItem>
                                <FormItem
                                    label="Identificador"
                                    invalid={
                                        errors.identifier &&
                                        touched.identifier
                                    }
                                    errorMessage={errors.identifier}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="identifier"
                                        placeholder="Identificador"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Municipio"
                                    invalid={
                                        errors.township &&
                                        touched.township
                                    }
                                    errorMessage={errors.township}
                                >
                                    <Field name="township">
                                        {({ field, form }: FieldProps) => (
                                            <Select
                                                placeholder="Municipio"
                                                field={field}
                                                form={form}
                                                options={sizes}
                                                value={sizes.filter(
                                                    (size) =>
                                                        size.value ===
                                                        values.township
                                                )}
                                                onChange={(size) =>
                                                    form.setFieldValue(
                                                        field.name,
                                                        size?.value
                                                    )
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    label="Dirección"
                                    invalid={
                                        errors.address &&
                                        touched.address
                                    }
                                    errorMessage={errors.address}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="address"
                                        placeholder="Dirección"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem>
                                    <Button
                                        block
                                        variant="solid"
                                        type="submit"
                                    >
                                        Continuar
                                    </Button>
                                    <Button
                                        block
                                        className="mt-4"
                                        variant="plain"
                                        type="button"
                                        icon={<HiArrowSmLeft />}
                                        onClick={onBack}
                                    >
                                        Atrás
                                    </Button>
                                </FormItem>
                                </FormContainer>
                            </Form>
                        )
                    }}
                </Formik>
            </div>
        </div>
    )
}

export default Step2
