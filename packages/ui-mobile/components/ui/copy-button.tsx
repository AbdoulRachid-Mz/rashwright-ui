// @/components/ui/copy-button.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  ActivityIndicator,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export type CopyButtonVariant = "default" | "icon-only" | "compact" | "full" | "glass" | "outline";
export type CopyButtonSize = "sm" | "md" | "lg";
export type CopyStatus = "idle" | "copying" | "copied" | "error";

export interface CopyButtonProps {
  /** Valeur à copier ou fonction génératrice (synchrone ou asynchrone) */
  value: string | (() => string | Promise<string>);
  /** Variante visuelle */
  variant?: CopyButtonVariant;
  /** Taille du bouton */
  size?: CopyButtonSize;
  /** Libellé affiché au repos (pour les variantes avec texte) */
  label?: string;
  /** Libellé affiché lorsque la copie est réussie */
  copiedLabel?: string;
  /** Libellé affiché en cas d'erreur */
  errorLabel?: string;
  /** Durée d'affichage du feedback de succès en millisecondes (défaut : 2000) */
  timeout?: number;
  /** Désactive le bouton */
  disabled?: boolean;
  /** Callback déclenché après succès de copie */
  onCopySuccess?: (copiedValue: string) => void;
  /** Callback déclenché en cas d'erreur de copie */
  onCopyError?: (error: Error) => void;
  /** Style personnalisé pour le conteneur */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
  /** Libellé d'accessibilité personnalisé */
  accessibilityLabel?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  variant = "compact",
  size = "md",
  label = "Copier",
  copiedLabel = "Copié !",
  errorLabel = "Échec",
  timeout = 2000,
  disabled = false,
  onCopySuccess,
  onCopyError,
  style,
  className,
  accessibilityLabel,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const [status, setStatus] = useState<CopyStatus>("idle");

  const glass = useMemo(
    () => createGlassTheme(theme, isDark),
    [theme, isDark]
  );

  const handleCopy = useCallback(async () => {
    if (disabled || status === "copying") return;

    setStatus("copying");
    try {
      let textToCopy = "";
      if (typeof value === "function") {
        textToCopy = await Promise.resolve(value());
      } else {
        textToCopy = value;
      }

      let copied = false;
      // 1. Tenter expo-clipboard dynamiquement si disponible
      try {
        const runtime = globalThis as unknown as {
          require?: (mod: string) => { setStringAsync?: (text: string) => Promise<boolean> };
        };
        const ExpoClipboard = runtime.require ? runtime.require("expo-clipboard") : null;
        if (ExpoClipboard && typeof ExpoClipboard.setStringAsync === "function") {
          await ExpoClipboard.setStringAsync(textToCopy);
          copied = true;
        }
      } catch {
        // Fallback Web ou React Native natif
      }

      // 2. Fallback Web navigator.clipboard
      if (!copied && Platform.OS === "web") {
        const webNav = (globalThis as unknown as {
          navigator?: { clipboard?: { writeText: (text: string) => Promise<void> } };
        }).navigator;
        if (webNav?.clipboard?.writeText) {
          await webNav.clipboard.writeText(textToCopy);
          copied = true;
        }
      }

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Haptics indisponible sans bloquer
      }

      setStatus("copied");
      onCopySuccess?.(textToCopy);

      setTimeout(() => {
        setStatus("idle");
      }, timeout);
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setStatus("error");
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
      onCopyError?.(errorObj);
      setTimeout(() => {
        setStatus("idle");
      }, timeout);
    }
  }, [value, disabled, status, timeout, onCopySuccess, onCopyError]);

  const sizeMetrics = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          iconSize: 14,
          fontSize: theme.typography.xs,
          paddingHorizontal: variant === "icon-only" ? theme.spacing.xs : theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          minHeight: 32,
          minWidth: variant === "icon-only" ? 32 : undefined,
          borderRadius: theme.borderRadius.sm,
        };
      case "lg":
        return {
          iconSize: 20,
          fontSize: theme.typography.base,
          paddingHorizontal: variant === "icon-only" ? theme.spacing.md : theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          minHeight: 48,
          minWidth: variant === "icon-only" ? 48 : undefined,
          borderRadius: theme.borderRadius.lg,
        };
      case "md":
      default:
        return {
          iconSize: 16,
          fontSize: theme.typography.sm,
          paddingHorizontal: variant === "icon-only" ? theme.spacing.sm : theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 40,
          minWidth: variant === "icon-only" ? 40 : undefined,
          borderRadius: theme.borderRadius.md,
        };
    }
  }, [size, variant, theme]);

  const visualStyle = useMemo(() => {
    const isSuccess = status === "copied";
    const isErrorState = status === "error";

    if (isSuccess) {
      return {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        borderColor: "#10B981",
        textColor: "#10B981",
        iconColor: "#10B981",
      };
    }

    if (isErrorState) {
      return {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderColor: theme.colors.destructive,
        textColor: theme.colors.destructive,
        iconColor: theme.colors.destructive,
      };
    }

    switch (variant) {
      case "glass":
        return {
          backgroundColor: liquidGlassEnabled
            ? glass.materials.soft.background
            : theme.colors.card,
          borderColor: liquidGlassEnabled
            ? glass.border.subtle
            : theme.colors.border,
          textColor: theme.colors.foreground,
          iconColor: theme.colors.primary,
        };
      case "outline":
      case "icon-only":
        return {
          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
          borderColor: theme.colors.border,
          textColor: theme.colors.foreground,
          iconColor: theme.colors.foreground,
        };
      case "full":
      case "compact":
      case "default":
      default:
        return {
          backgroundColor: theme.colors.secondary,
          borderColor: "transparent",
          textColor: theme.colors.secondaryForeground,
          iconColor: theme.colors.secondaryForeground,
        };
    }
  }, [variant, status, theme, isDark, liquidGlassEnabled, glass]);

  const currentLabel = useMemo(() => {
    if (status === "copied") return copiedLabel;
    if (status === "error") return errorLabel;
    return label;
  }, [status, label, copiedLabel, errorLabel]);

  const accessibilityString = accessibilityLabel ?? (
    status === "copied" ? "Texte copié dans le presse-papier" : label
  );

  return (
    <LiquidPressable
      disabled={disabled || status === "copying"}
      onPress={handleCopy}
      className={className}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || status === "copying" }}
      accessibilityLabel={accessibilityString}
      style={[
        styles.container,
        {
          backgroundColor: visualStyle.backgroundColor,
          borderColor: visualStyle.borderColor,
          borderWidth: 1,
          borderRadius: sizeMetrics.borderRadius,
          paddingHorizontal: sizeMetrics.paddingHorizontal,
          paddingVertical: sizeMetrics.paddingVertical,
          minHeight: sizeMetrics.minHeight,
          minWidth: sizeMetrics.minWidth,
          width: variant === "full" ? "100%" : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {variant === "glass" && liquidGlassEnabled && (
        <LiquidHighlight type="top" borderRadius={sizeMetrics.borderRadius} opacity={0.5} />
      )}
      {(variant === "glass" || variant === "outline") && (
        <LiquidBorder variant="subtle" borderRadius={sizeMetrics.borderRadius} />
      )}

      {status === "copying" ? (
        <ActivityIndicator size="small" color={visualStyle.textColor} />
      ) : (
        <View style={styles.contentRow}>
          <Ionicons
            name={
              status === "copied"
                ? "checkmark-circle"
                : status === "error"
                ? "alert-circle"
                : "copy-outline"
            }
            size={sizeMetrics.iconSize}
            color={visualStyle.iconColor}
          />
          {variant !== "icon-only" && (
            <Text
              style={[
                styles.labelText,
                {
                  fontSize: sizeMetrics.fontSize,
                  color: visualStyle.textColor,
                },
              ]}
            >
              {currentLabel}
            </Text>
          )}
        </View>
      )}
    </LiquidPressable>
  );
};

export default CopyButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  labelText: {
    fontWeight: "600",
  },
});
