// @/components/templates/auth/components/login-form.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import Checkbox from "@/components/ui/checkbox";
import { GoogleAuthButton } from "./google-auth-button";
import type { LoginCredentials } from "../types";

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  onGoogleAuth?: () => void;
  onForgotPassword?: (email: string) => void;
  onGoToRegister: () => void;
  onNeedOtp: () => void;
  isLoading?: boolean;
}

export function LoginForm({
  onSubmit,
  onGoogleAuth,
  onForgotPassword,
  onGoToRegister,
  onNeedOtp,
  isLoading,
}: LoginFormProps) {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = () => {
    onSubmit({ email, password, rememberMe });
  };

  return (
    <View style={styles.container}>
      {/* Bouton Google en premier plan */}
      <GoogleAuthButton
        onPress={onGoogleAuth}
        label="Continuer avec Google"
        variant="glass"
      />

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0" }]} />
        <Text style={[styles.dividerText, { color: theme.colors.mutedForeground }]}>
          ou par email
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0" }]} />
      </View>

      <TextInput
        label="Adresse Email"
        placeholder="nom@exemple.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        label="Mot de passe"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.optionsRow}>
        <Checkbox
          checked={rememberMe}
          onCheckedChange={setRememberMe}
          label="Se souvenir de moi"
        />
        {onForgotPassword && (
          <TouchableOpacity onPress={() => onForgotPassword(email)}>
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        variant="default"
        size="lg"
        loading={isLoading}
        onPress={handleSubmit}
        style={styles.submitBtn}
      >
        Se connecter
      </Button>

      <Button
        variant="outline"
        size="md"
        onPress={onNeedOtp}
      >
        Connexion rapide par code OTP
      </Button>

      <View style={styles.switchRow}>
        <Text style={[styles.switchText, { color: theme.colors.mutedForeground }]}>
          Pas encore de compte ?
        </Text>
        <TouchableOpacity onPress={onGoToRegister}>
          <Text style={[styles.switchLink, { color: theme.colors.primary }]}>
            Créer un compte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  forgotText: { fontSize: 13, fontWeight: "600" },
  submitBtn: { marginTop: 8 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "700" },
});

export default LoginForm;
