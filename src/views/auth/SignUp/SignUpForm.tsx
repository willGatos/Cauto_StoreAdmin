import type { CommonProps } from '@/@types/common'
import ActionLink from '@/components/shared/ActionLink'
import PasswordInput from '@/components/shared/PasswordInput'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import { Field, Form, Formik } from 'formik'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
    message: string
    onSubmit: Function
}


const validationSchema = Yup.object().shape({
    name: Yup.string()
              .required('Por Favor. Inroduzca su nombre.'),
    phone: Yup.string()
              .required('Introduzca su Número de Teléfono'),
    email: Yup.string()
              .email('Email Inválido')
              .required('Introduzca su Email'),
    identifier: Yup.string()
    .matches(
        /^[a-z]+$/,
        "Debe solo contener letras minúsculas"
    ).required('Identificador requerido'),
    password: Yup.string()
              .required('Por Favor, introduzca su contraseña.'),
    confirmPassword: Yup.string()
              .oneOf(
        [Yup.ref('password')],
        'No encaja con la contraseña'
    ),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { subscriptionId } = useParams()
    const { disableSubmit = false, className, signInUrl = '/s/sign-in/' + subscriptionId, message="",onSubmit  } = props    

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    name: '1',
                    phone: '5555',
                    email: '1@1.co',
                    password: '12345678',
                    confirmPassword: '12345678',
                    identifier: "",
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSubmit(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                        <FormItem
                                label="Nombre"
                                invalid={errors.name && touched.name}
                                errorMessage={errors.name}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="name"
                                    placeholder="Nombre de Usuario"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Número de WhatsApp"
                                invalid={errors.phone && touched.phone}
                                errorMessage={errors.phone}
                            >
                                <Field
                                    type="phone"
                                    autoComplete="off"
                                    name="phone"
                                    placeholder="Teléfono"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Email"
                                invalid={errors.email && touched.email}
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
                                label="Nombre Como Usario"
                                invalid={errors.identifier && touched.identifier}
                                errorMessage={errors.identifier}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="identifier"
                                    placeholder="juan1402"
                                    component={Input}
                                    prefix={'@'}
                                />
                            </FormItem>
                            
                            <FormItem
                                label="Password"
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Password"
                                    component={PasswordInput}
                                />
                            </FormItem>

                            <FormItem
                                label="Confirm Password"
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? 'Creando Cuenta...'
                                    : 'Crear Cuenta'}
                            </Button>
                            { subscriptionId &&
                            <div className="mt-4 text-center">
                                <span>¿Ya tienes una cuenta? </span>
                                <ActionLink to={signInUrl}>Inicia Sesión</ActionLink>
                            </div> }
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
