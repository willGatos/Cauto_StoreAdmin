import { FormItem, FormContainer } from '@/components/ui/Form'
import Segment from '@/components/ui/Segment'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import SegmentItemOption from '@/components/shared/SegmentItemOption'
import {
    HiOutlineCode,
    HiOutlineCube,
    HiOutlinePencil,
    HiOutlineShieldCheck,
    HiOutlineAcademicCap,
    HiOutlineSparkles,
    HiArrowSmLeft,
} from 'react-icons/hi'
import type { CallbackSetBack } from '../types'
import type { FieldProps } from 'formik'
import type { ReactNode } from 'react'
import Input from '@/components/ui/Input'
import * as Yup from 'yup'
import { StoreData } from '../Welcome'
import axios from 'axios'
import { apiPostStoreData } from '@/services/not-now/CrmService'
import { useParams } from 'react-router-dom'
type Step3Props = CallbackSetBack
import { useNavigate } from 'react-router-dom'
const roles: {
    value: string
    label: string
    icon: ReactNode
    disabled?: boolean
}[] = [
    {
        value: 'softwareEngineer',
        label: 'Software Engineer',
        icon: <HiOutlineCode />,
    },
    {
        value: 'productManager',
        label: 'Product Manager',
        icon: <HiOutlineCube />,
    },
    { value: 'designer', label: 'Designer', icon: <HiOutlinePencil /> },
    { value: 'qaTester', label: 'QA Tester', icon: <HiOutlineShieldCheck /> },
    {
        value: 'skateHolder',
        label: 'Skate Holder',
        icon: <HiOutlineAcademicCap />,
    },
    { value: 'other', label: 'Others', icon: <HiOutlineSparkles /> },
]
const validationSchema = Yup.object().shape({
    availableMoney: Yup.number().required('Cantidad de dinero disponible requerida'),
    phone: Yup.string().required('Teléfono requerido'),
    email: Yup.string()
    .email('Correo electrónico inválido')
    .required('Correo electrónico requerido'),
});

const Step3 = ({ storeData,setStoreData=()=>{}, onNext, onBack }: Step3Props) => {
    const {subscriptionId= ""} = useParams()
    const navigation= useNavigate()
    return (
        <div className="text-center">
            <h3 className="mb-2">What is your role in the organization?</h3>
            <div className="mt-8 max-w-[600px] lg:min-w-[600px] mx-auto">
                <Formik
                    initialValues={{
                        availableMoney: storeData.availableMoney,
                        email: storeData.email,
                        phone: storeData.phone,
                      }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        console.log(values)
                        setStoreData((prevState: StoreData)=>{
                            console.log(prevState);
                            const data = {...prevState, ...values}
                            console.log(data)
                            const res = apiPostStoreData(subscriptionId, data)
                        })
                        navigation("/app/crm/dashboard")
                        }
                    }
                >
                    {({ touched, errors }) => {
                        return (
                            <Form>
                                <FormContainer>
                                <FormItem
                                    label="Fondos de la Empresa"
                                    invalid={
                                        errors.availableMoney &&
                                        touched.availableMoney
                                    }
                                    errorMessage={errors.availableMoney}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="availableMoney"
                                        placeholder="Cantidad de Dinero Inicial"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Email"
                                    invalid={
                                        errors.email &&
                                        touched.email
                                    }
                                    errorMessage={errors.email}
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder="Email"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Teléfono"
                                    invalid={
                                        errors.phone &&
                                        touched.phone
                                    }
                                    errorMessage={errors.phone}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="phone"
                              placeholder="Teléfono"
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

export default Step3
