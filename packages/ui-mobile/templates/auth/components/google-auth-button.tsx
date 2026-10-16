// @/components/templates/auth/components/google-auth-button.tsx
/**
 * GoogleAuthButton — Bouton d'authentification Google fluide et premium pour Rashwright UI.
 * Supporte le thème clair, sombre et le mode Liquid Glass.
 */

import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/theme-context";

export interface GoogleAuthButtonProps {
  onPress?: () => void;
  label?: string;
  variant?: "default" | "glass" | "outline";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GoogleAuthButton({
  onPress,
  label = "Continuer avec Google",
  variant = "outline",
  disabled = false,
  style,
}: GoogleAuthButtonProps) {
  const { theme, isDark } = useTheme();

  const isGlass = variant === "glass";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: isGlass
            ? isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(255, 255, 255, 0.75)"
            : isDark
            ? "#1E293B"
            : "#FFFFFF",
          borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Icône Google officielle stylisée */}
        <View style={styles.googleIconContainer}>
          <Text style={styles.googleLetterG}>
            <Text style={{ color: "#4285F4" }}>G</Text>
            <Text style={{ color: "#EA4335" }}>o</Text>
            <Text style={{ color: "#FBBC05" }}>o</Text>
            <Text style={{ color: "#4285F4" }}>g</Text>
            <Text style={{ color: "#34A853" }}>l</Text>
            <Text style={{ color: "#EA4335" }}>e</Text>
          </Text>
        </View>

        <Text
          style={[
            styles.label,
            {
              color: isDark ? "#F8FAFC" : "#0F172A",
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  googleIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  googleLetterG: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GoogleAuthButton;
