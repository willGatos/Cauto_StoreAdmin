import Simple from '@/components/layouts/AuthLayout/Simple'
import SignInForm from './SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useAuth from '@/utils/hooks/useAuth'
import { useParams } from 'react-router-dom'

type SignInFormSchema = {
    email: string
    password: string
}

const SignIn = () => {
    const { subscriptionId } = useParams()
    const [message, setMessage] = useTimeOutMessage()
    const { signIn } = useAuth()

    const onSubmit = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { email, password } = values
        setSubmitting(true)

        const result = await signIn(email, password)

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    return (
        <Simple
            content={
                <div className="mb-4">
                    <h3 className="mb-1">Bienvenido de Nuevo!</h3>
                    <p>Por Favor, introduzca sus datos.</p>
                </div>
            }
        >
            <SignInForm
                message={message}
                onSubmit={onSubmit}
                disableSubmit={false}
            />
        </Simple>
    )
}

export default SignIn
