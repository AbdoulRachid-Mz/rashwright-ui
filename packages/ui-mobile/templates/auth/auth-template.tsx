// @/components/templates/auth/auth-template.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { OtpStep } from "./components/otp-step";
import type { AuthMode, AuthTemplateProps, LoginCredentials, RegisterCredentials } from "./types";

export function AuthTemplate({
  initialMode = "login",
  onLogin,
  onRegister,
  onGoogleAuth,
  onVerifyOtp,
  onForgotPassword,
  isLoading = false,
}: AuthTemplateProps) {
  const { theme, isDark } = useTheme();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleLoginSubmit = (credentials: LoginCredentials) => {
    if (onLogin) {
      void onLogin(credentials);
    } else {
      console.log("Login credentials:", credentials);
    }
  };

  const handleRegisterSubmit = (credentials: RegisterCredentials) => {
    if (onRegister) {
      void onRegister(credentials);
    } else {
      console.log("Register credentials:", credentials);
    }
  };

  const handleOtpVerify = (otp: string) => {
    if (onVerifyOtp) {
      void onVerifyOtp(otp);
    } else {
      console.log("OTP code:", otp);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RashwrightLogo size={70} showText={false} isDark={isDark} primaryColor={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            {mode === "login" && "Connexion"}
            {mode === "register" && "Créer un compte"}
            {mode === "otp" && "Vérification de sécurité"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
            {mode === "login" && "Accédez à votre tableau de bord et à vos composants"}
            {mode === "register" && "Rejoignez des milliers de développeurs qui construisent avec Rashwright"}
            {mode === "otp" && "Entrez le code à 6 chiffres envoyé sur votre appareil"}
          </Text>
          <View style={styles.badgeWrapper}>
            <Badge variant="outline" size="sm">
              {mode === "login" && "Accès Sécurisé"}
              {mode === "register" && "Inscription Gratuite"}
              {mode === "otp" && "2FA Activé"}
            </Badge>
          </View>
        </View>

        <Card variant="glass" style={styles.card}>
          {mode === "login" && (
            <LoginForm
              onSubmit={handleLoginSubmit}
              onGoogleAuth={onGoogleAuth}
              onForgotPassword={onForgotPassword}
              onGoToRegister={() => setMode("register")}
              onNeedOtp={() => setMode("otp")}
              isLoading={isLoading}
            />
          )}

          {mode === "register" && (
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              onGoogleAuth={onGoogleAuth}
              onGoToLogin={() => setMode("login")}
              isLoading={isLoading}
            />
          )}

          {mode === "otp" && (
            <OtpStep
              onVerify={handleOtpVerify}
              onResend={() => console.log("Renvoyer le code")}
              onBack={() => setMode("login")}
              isLoading={isLoading}
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 20,
  },
  badgeWrapper: {
    marginTop: 12,
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
});

export default AuthTemplate;
