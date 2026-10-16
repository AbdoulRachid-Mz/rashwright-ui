// @/components/templates/auth/sign-in.tsx
/**
 * SignInScreen — Écran complet de connexion Rashwright UI Mobile.
 * Intègre le logo, la carte Glass UI, le formulaire et le bouton Google Auth.
 */

import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import { LoginForm } from "./components/login-form";
import type { SignInScreenProps } from "./types";

export function SignInScreen({
  onLogin,
  onGoogleAuth,
  onGoToSignUp,
  onForgotPassword,
  onNeedOtp,
  isLoading,
}: SignInScreenProps) {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Branding */}
        <View style={styles.header}>
          <RashwrightLogo size={56} style={styles.logo} />
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            Bon retour parmi nous
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
            Connectez-vous à votre espace Rashwright
          </Text>
        </View>

        {/* Card Formulaire */}
        <Card variant="glass" style={styles.card}>
          <LoginForm
            onSubmit={(creds) => onLogin?.(creds)}
            onGoogleAuth={onGoogleAuth}
            onForgotPassword={onForgotPassword}
            onGoToRegister={() => onGoToSignUp?.()}
            onNeedOtp={() => onNeedOtp?.()}
            isLoading={isLoading}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
});

export default SignInScreen;
