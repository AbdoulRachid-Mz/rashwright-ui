// @/components/ui/error-state.tsx
//
// Composant d'état d'erreur avec bouton réessayer et accent sémantique.

import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import Button from "./button";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidBlob from "./liquid/liquid-blob";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Une erreur est survenue",
  description = "Impossible de charger les données. Veuillez vérifier votre connexion et réessayer.",
  onRetry,
  retryText = "Réessayer",
  icon,
  style,
}) => {
  const { theme } = useTheme();

  const renderIcon = () => {
    if (typeof icon === "string") {
      return (
        <Ionicons
          name={icon as any}
          size={36}
          color={theme.colors.destructive}
        />
      );
    }
    return (
      icon || (
        <Ionicons
          name="alert-circle-outline"
          size={36}
          color={theme.colors.destructive}
        />
      )
    );
  };

  return (
    <View style={[styles.container, style]}>
      <LiquidBlob
        size={180}
        color="destructive"
        blur={35}
        opacity={0.10}
        style={styles.blob}
      />

      <LiquidSurface
        material="soft"
        borderRadius={theme.borderRadius.full}
        tint="destructive"
        style={styles.iconSurface}
      >
        <View style={styles.iconInner}>{renderIcon()}</View>
      </LiquidSurface>

      <View style={styles.textContainer}>
        <ThemedText variant="lg" weight="bold" style={styles.titleText}>
          {title}
        </ThemedText>
        {description && (
          <ThemedText
            variant="sm"
            color="mutedForeground"
            style={styles.descriptionText}
          >
            {description}
          </ThemedText>
        )}
      </View>

      {onRetry && (
        <View style={styles.actionContainer}>
          <Button
            variant="default"
            size="md"
            onPress={onRetry}
            leftIcon={
              <Ionicons
                name="refresh"
                size={16}
                color={theme.colors.primaryForeground}
              />
            }
          >
            {retryText}
          </Button>
        </View>
      )}
    </View>
  );
};

export default ErrorState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    position: "relative",
  },
  blob: {
    top: "15%",
    alignSelf: "center",
  },
  iconSurface: {
    marginBottom: 20,
    padding: 6,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
    maxWidth: 320,
  },
  titleText: {
    textAlign: "center",
  },
  descriptionText: {
    textAlign: "center",
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 24,
  },
});
