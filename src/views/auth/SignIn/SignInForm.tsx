import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    forgotPasswordUrl?: string
    signUpUrl?: string
    onSubmit: Function
    message: string
}



const validationSchema = Yup.object().shape({
    email: Yup.string().required('Por Favor, introduzca su correo'),
    password: Yup.string().required('Por Favor, introduzca su Contraseña'),
    rememberMe: Yup.bool(),
})

const SignInForm = (props: SignInFormProps) => {
    const {
        disableSubmit = false,
        className,
        onSubmit,
        message
    } = props

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <>{message}</>
                </Alert>
            )}
            <Formik
                initialValues={{
                    email: 'admin',
                    password: '123Qwe',
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
                                label="Correo Electrónico"
                                invalid={
                                    (errors.email &&
                                        touched.email) as boolean
                                }
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Correo"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Contraseña"
                                invalid={
                                    (errors.password &&
                                        touched.password) as boolean
                                }
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Contraseña"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>{`¿Aún no tienes cuenta?`} </span>
                                <ActionLink to={"https://wa.me/+5358419139"}>Contactanos</ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignInForm
