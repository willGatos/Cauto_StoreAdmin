import { Product } from "./products";

export type SignInCredential = {
  email: string;
  password: string;
};

export type SignInResponse = {
  token: string;
  user: {
    name: string;
    phone: string;
    password: string;
    email: string;
    role: string;
    permissions: [];
    customizationSettings?: any;
  };
  error: string;
};

export type SignUpResponse = SignInResponse;

export type SignUpCredential = {
  name: string;
  email: string;
  password: string;
  phone: string;
  identifier: string;
  customizationSettings?: any;
};

export type ForgotPassword = {
  email: string;
};

export type ResetPassword = {
  password: string;
};

export interface User {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  shopId: string | null;
  authority: string[];
  sellersShops: string[];
}
