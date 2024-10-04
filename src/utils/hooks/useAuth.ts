import type { SignInCredential, SignUpCredential } from "@/@types/auth";
import appConfig from "@/configs/app.config";
import {
  apiSignIn,
  apiSignUp,
  apiSignUpSeller,
  signUpWithInvitation,
} from "@/services/AuthService";
import {
  setUser,
  signInSuccess,
  signOutSuccess,
  useAppDispatch,
  useAppSelector,
} from "@/store";
import { useLocation, useNavigate } from "react-router-dom";
import useQuery from "./useQuery";
import supabase from "@/services/Supabase/BaseClient";
import { OWNER, SELLER } from "@/constants/roles.constant";
import { initialState } from "@/store/slices/auth/userSlice";
type Status = "success" | "failed";

function useAuth() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const location = useLocation();
  const isForSellers = location.pathname.includes("/s/");
  const query = useQuery();

  const { token, signedIn } = useAppSelector((state) => state.auth.session);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiSignIn(email, password);

      console.log(data);

      if (data) {
        const { user, session } = data;

        if (session?.access_token) {
          dispatch(signInSuccess(session.access_token));
        }

        console.log(user);
        if (user) {
          dispatch(setUser(user));
          navigate(appConfig.authenticatedEntryPath); // Redirige a la ruta autenticada
        }

        return {
          status: "success",
          message: "",
        };
      }
    } catch (error) {
      return {
        status: "failed",
        message: error.message || "Failed to sign in.",
      };
    }
  };

  const signUp = async (id = "", values: SignUpCredential) => {
    console.log(isForSellers);
    try {
      const data = isForSellers // Analiza si es para vendedores o dueños
        ? await signUpWithInvitation(id, values, SELLER)
        : await signUpWithInvitation(id, values, OWNER);

      if (data) {
        const { user, session } = data;

        if (session?.access_token) {
          dispatch(signInSuccess(session.access_token));
        }
        if (user) {
          dispatch(setUser(user));
          navigate(appConfig.authenticatedEntryPath);
        }

        return {
          status: "success",
          message: "",
        };
      } else {
        return data;
      }
    } catch (errors: any) {
      return {
        status: "failed",
        message: errors?.response?.data?.message || errors.toString(),
      };
    }
  };

  const handleSignOut = () => {
    dispatch(signOutSuccess());
    dispatch(setUser(initialState));
    navigate(appConfig.unAuthenticatedEntryPath);
  };

  const signOut = async () => {
    //await apiSignOut()
    handleSignOut();
  };

  const createInvitation = async (shopId: number, inviterId: string) => {
    try {
      console.log(shopId, inviterId);
      // 1. Verificar si ya existe una invitación con el mismo shop_id y inviter_id
      const { data: existingInvitation, error: findError } = await supabase
        .from("invitations")
        .select("*")
        .eq("shop_id", shopId)
        .eq("inviter_id", inviterId)
        .is("invitee_id", null)
        .single();

      if (existingInvitation?.id) {
        return {
          status: "success",
          message: "Invitación creada con éxito.",
          invitationId: existingInvitation,
        };
      } else {
        console.log(existingInvitation);
        // 2. Crear una nueva invitación si no existe
        const { data: newInvitation, error } = await supabase
          .from("invitations")
          .insert({
            shop_id: shopId,
            inviter_id: inviterId,
          })
          .select("id")
          .single();

        if (error) {
          throw new Error(`Error al crear la invitación: ${error.message}`);
        }
        const invitationId = newInvitation.id;
      }
    } catch (error) {
      return {
        status: "failed",
        message: error.message || "Failed to create invitation.",
      };
    }
  };

  return {
    authenticated: token && signedIn,
    signIn,
    signUp,
    signOut,
    createInvitation,
  };
}

export default useAuth;
