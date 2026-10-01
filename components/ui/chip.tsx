// @/components/ui/chip.tsx
//
// Chip interactif pour filtres, tags, catégories et statuts.
// Effet Liquid Glass, support de sélection active animée, icône et bouton de fermeture.

import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export type ChipVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "glass";

export type ChipSize = "sm" | "md" | "lg";

export interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: React.ReactNode;
  onClose?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  variant = "default",
  size = "md",
  icon,
  onClose,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();

  const glass = useMemo(
    () => createGlassTheme(theme, isDark),
    [theme, isDark]
  );

  const colors = useMemo(() => {
    if (selected) {
      return {
        bg: theme.colors.primary,
        fg: theme.colors.primaryForeground,
        border: "transparent",
        showHighlight: false, // selected est déjà coloré, pas besoin de highlight
      };
    }

    switch (variant) {
      case "primary":
        return {
          bg: isDark ? "rgba(59, 130, 246, 0.18)" : "rgba(30, 58, 138, 0.10)",
          fg: theme.colors.primary,
          border: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 58, 138, 0.2)",
          showHighlight: liquidGlassEnabled,
        };
      case "success":
        return {
          bg: liquidGlassEnabled
            ? glass.semantic.success.background
            : (isDark ? "rgba(5, 150, 105, 0.20)" : "rgba(5, 150, 105, 0.12)"),
          fg: glass.semantic.success.foreground,
          border: liquidGlassEnabled ? glass.semantic.success.border : "rgba(5,150,105,0.3)",
          showHighlight: liquidGlassEnabled,
        };
      case "warning":
        return {
          bg: liquidGlassEnabled
            ? glass.semantic.warning.background
            : (isDark ? "rgba(217, 119, 6, 0.20)" : "rgba(217, 119, 6, 0.12)"),
          fg: glass.semantic.warning.foreground,
          border: liquidGlassEnabled ? glass.semantic.warning.border : "rgba(217,119,6,0.3)",
          showHighlight: liquidGlassEnabled,
        };
      case "destructive":
        return {
          bg: isDark ? "rgba(239, 68, 68, 0.18)" : "rgba(220, 38, 38, 0.10)",
          fg: theme.colors.destructive,
          border: isDark ? "rgba(239, 68, 68, 0.3)" : "rgba(220, 38, 38, 0.2)",
          showHighlight: liquidGlassEnabled,
        };
      case "outline":
        return {
          bg: "transparent",
          fg: theme.colors.foreground,
          border: theme.colors.border,
          showHighlight: false,
        };
      case "glass":
        return {
          // Liquid désactivé → fond card solide + border standard
          bg: liquidGlassEnabled ? glass.materials.soft.background : theme.colors.card,
          fg: theme.colors.foreground,
          border: liquidGlassEnabled ? glass.border.subtle : theme.colors.border,
          showHighlight: liquidGlassEnabled,
        };
      case "default":
      default:
        return {
          bg: isDark ? theme.colors.card : theme.colors.muted,
          fg: theme.colors.foreground,
          border: theme.colors.border,
          showHighlight: false,
        };
    }
  }, [selected, variant, theme, isDark, glass, liquidGlassEnabled]);

  const sizeStyles = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          fontSize: theme.typography.xs,
          iconSize: 12,
          gap: 4,
        };
      case "lg":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: theme.typography.base,
          iconSize: 18,
          gap: 8,
        };
      case "md":
      default:
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: theme.typography.sm,
          iconSize: 14,
          gap: 6,
        };
    }
  }, [size, theme]);

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        size: (icon.props as any).size ?? sizeStyles.iconSize,
        color: (icon.props as any).color ?? colors.fg,
      });
    }
    return icon;
  };

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: colors.border !== "transparent" ? 1 : 0,
    borderRadius: theme.borderRadius.full,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    gap: sizeStyles.gap,
    alignSelf: "flex-start",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <LiquidPressable
      onPress={onPress}
      disabled={disabled || !onPress}
      viscosity="soft"
      style={[containerStyle, style]}
    >
      {colors.showHighlight && (
        <LiquidHighlight type="top" borderRadius={theme.borderRadius.full} opacity={0.5} />
      )}

      {renderIcon()}

      {React.isValidElement(children) ? (
        children
      ) : children !== null && children !== undefined ? (
        <ThemedText
          style={[
            {
              color: colors.fg,
              fontSize: sizeStyles.fontSize,
              fontWeight: selected ? "600" : "500",
            },
            textStyle,
          ]}
        >
          {children}
        </ThemedText>
      ) : null}

      {onClose && (
        <LiquidPressable
          onPress={onClose}
          style={styles.closeBtn}
          viscosity="soft"
        >
          <Ionicons
            name="close-circle"
            size={sizeStyles.iconSize + 2}
            color={colors.fg}
          />
        </LiquidPressable>
      )}
    </LiquidPressable>
  );
};

export default Chip;

const styles = StyleSheet.create({
  closeBtn: {
    marginLeft: 2,
  },
});
