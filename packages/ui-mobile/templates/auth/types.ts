// @/components/templates/auth/types.ts

export type AuthMode = "login" | "register" | "otp";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface AuthTemplateProps {
  initialMode?: AuthMode;
  onLogin?: (credentials: LoginCredentials) => void | Promise<void>;
  onRegister?: (credentials: RegisterCredentials) => void | Promise<void>;
  onVerifyOtp?: (otp: string) => void | Promise<void>;
  onForgotPassword?: (email: string) => void;
  isLoading?: boolean;
}
