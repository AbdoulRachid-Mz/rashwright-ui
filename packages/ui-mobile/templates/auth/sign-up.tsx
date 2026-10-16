// @/components/templates/auth/sign-up.tsx
/**
 * SignUpScreen — Écran complet d'inscription Rashwright UI Mobile.
 * Intègre le logo, la carte Glass UI, le formulaire de création de compte et Google Auth.
 */

import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import { RegisterForm } from "./components/register-form";
import type { SignUpScreenProps } from "./types";

export function SignUpScreen({
  onRegister,
  onGoogleAuth,
  onGoToSignIn,
  isLoading,
}: SignUpScreenProps) {
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
            Créer un compte
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
            Rejoignez l'écosystème Rashwright dès maintenant
          </Text>
        </View>

        {/* Card Formulaire */}
        <Card variant="glass" style={styles.card}>
          <RegisterForm
            onSubmit={(creds) => onRegister?.(creds)}
            onGoogleAuth={onGoogleAuth}
            onGoToLogin={() => onGoToSignIn?.()}
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

export default SignUpScreen;
