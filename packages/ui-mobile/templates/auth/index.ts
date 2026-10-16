// @/components/templates/auth/index.ts
export { AuthTemplate } from "./auth-template";
export { SignInScreen } from "./sign-in";
export { SignUpScreen } from "./sign-up";
export { GoogleAuthButton } from "./components/google-auth-button";
export { LoginForm } from "./components/login-form";
export { RegisterForm } from "./components/register-form";
export { OtpStep } from "./components/otp-step";

export type {
  AuthMode,
  AuthTemplateProps,
  SignInScreenProps,
  SignUpScreenProps,
  LoginCredentials,
  RegisterCredentials,
} from "./types";

export default AuthTemplate;
