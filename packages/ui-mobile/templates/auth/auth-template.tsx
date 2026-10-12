// @/components/templates/auth/auth-template.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Card from "@/components/ui/card";
import Divider from "@/components/ui/divider";
import Badge from "@/components/ui/badge";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { OtpStep } from "./components/otp-step";
import type { AuthMode, AuthTemplateProps, LoginCredentials, RegisterCredentials } from "./types";

export function AuthTemplate({
  initialMode = "login",
  onLogin,
  onRegister,
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
            {mode === "login" && "Accédez à votre espace sécurisé Rashwright"}
            {mode === "register" && "Rejoignez la communauté en quelques secondes"}
            {mode === "otp" && "Validation par mot de passe à usage unique"}
          </Text>
        </View>

        {mode !== "otp" && (
          <View style={[styles.tabBar, { backgroundColor: theme.colors.muted }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === "login" && [styles.activeTab, { backgroundColor: theme.colors.card }],
              ]}
              onPress={() => setMode("login")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: mode === "login" ? theme.colors.foreground : theme.colors.mutedForeground },
                ]}
              >
                Se connecter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                mode === "register" && [styles.activeTab, { backgroundColor: theme.colors.card }],
              ]}
              onPress={() => setMode("register")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: mode === "register" ? theme.colors.foreground : theme.colors.mutedForeground },
                ]}
              >
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Card style={styles.card}>
          {mode === "login" && (
            <LoginForm
              onSubmit={handleLoginSubmit}
              onForgotPassword={onForgotPassword}
              onGoToRegister={() => setMode("register")}
              onNeedOtp={() => setMode("otp")}
              isLoading={isLoading}
            />
          )}

          {mode === "register" && (
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              onGoToLogin={() => setMode("login")}
              isLoading={isLoading}
            />
          )}

          {mode === "otp" && (
            <OtpStep
              onVerify={handleOtpVerify}
              onBackToLogin={() => setMode("login")}
              isLoading={isLoading}
            />
          )}
        </Card>

        <View style={styles.footer}>
          <Divider />
          <View style={styles.badgeRow}>
            <Badge variant="outline">256-bit SSL</Badge>
            <Badge variant="success">Sécurisé</Badge>
            <Badge variant="default">Rashwright UI</Badge>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, gap: 20 },
  header: { alignItems: "center", gap: 8, marginTop: 12 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center" },
  tabBar: { flexDirection: "row", borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4 },
  tabText: { fontSize: 14, fontWeight: "700" },
  card: { padding: 20, borderRadius: 20 },
  footer: { marginTop: 12, gap: 16, alignItems: "center" },
  badgeRow: { flexDirection: "row", gap: 8 },
});

export default AuthTemplate;
