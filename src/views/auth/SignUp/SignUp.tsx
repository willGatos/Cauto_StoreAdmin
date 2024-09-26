import Side from "@/components/layouts/AuthLayout/Side";
import useAuth from "@/utils/hooks/useAuth";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import { useParams } from "react-router-dom";
import SignUpForm from "./SignUpForm";

type SignUpFormSchema = {
  name: string;
  phone: string;
  password: string;
  email: string;
  identifier: string;
  customizationSettings?: any;
};

const SignUp = () => {
  const [message, setMessage] = useTimeOutMessage();

  const { signUp } = useAuth();
  const { subscriptionId } = useParams();

  const onSubmit = async (
    values: SignUpFormSchema,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    setSubmitting(true);
    const result = await signUp(subscriptionId, { ...values });

    if (result?.status === "failed") {
      setMessage(result.message);
    }

    setSubmitting(false);
  };

  return (
    <Side
      content={
        <div className="mb-1">
          <h3 className="mb-1">Bienvenidos</h3>
          <p>Por Favor, introduzca los Datos</p>
        </div>
      }
    >
      <SignUpForm message={message} onSubmit={onSubmit} disableSubmit={false} />
    </Side>
  );
};

export default SignUp;
