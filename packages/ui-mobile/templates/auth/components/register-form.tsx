// @/components/templates/auth/components/register-form.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/text-input";
import Checkbox from "@/components/ui/checkbox";
import type { RegisterCredentials } from "../types";

export interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => void;
  onGoToLogin: () => void;
  isLoading?: boolean;
}

export function RegisterForm({
  onSubmit,
  onGoToLogin,
  isLoading,
}: RegisterFormProps) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = () => {
    onSubmit({ name, email, password, acceptTerms });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Nom complet"
        placeholder="Jean Dupont"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Au moins 8 caractères"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Checkbox
        checked={acceptTerms}
        onCheckedChange={setAcceptTerms}
        label="J'accepte les conditions d'utilisation et la politique de confidentialité"
      />

      <Button
        variant="default"
        size="lg"
        disabled={!acceptTerms}
        loading={isLoading}
        onPress={handleSubmit}
        style={styles.submitBtn}
      >
        Créer mon compte
      </Button>

      <View style={styles.switchRow}>
        <Text style={[styles.switchText, { color: theme.colors.mutedForeground }]}>
          Déjà un compte ?
        </Text>
        <TouchableOpacity onPress={onGoToLogin}>
          <Text style={[styles.switchLink, { color: theme.colors.primary }]}>
            Se connecter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
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
