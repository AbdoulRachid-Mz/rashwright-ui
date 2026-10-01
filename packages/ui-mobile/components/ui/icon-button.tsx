// @/components/ui/icon-button.tsx
//
// Bouton d'action circulaire / carré avec icône.
// Feedback Rubber Reanimated, support des variantes glass, outline, ghost, loading, badge.

import React, { ReactNode, forwardRef, useMemo } from "react";
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { useTheme } from "../../contexts/theme-context";
import { createGlassTheme } from "../../constants/glass-theme";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";
import type { LiquidViscosity } from "./liquid/liquid-types";

export type IconButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "glass";

export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconButtonProps {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: boolean;
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
  viscosity?: LiquidViscosity;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const SIZE_MAP = {
  xs: { size: 30, radius: 8, iconSize: 14 },
  sm: { size: 36, radius: 10, iconSize: 18 },
  md: { size: 44, radius: 12, iconSize: 22 },
  lg: { size: 52, radius: 16, iconSize: 26 },
  xl: { size: 60, radius: 18, iconSize: 30 },
};

export const IconButton = forwardRef<any, IconButtonProps>(
  (
    {
      icon,
      variant = "ghost",
      size = "md",
      rounded = true,
      disabled = false,
      loading = false,
      badge,
      viscosity = "medium",
      style,
      onPress,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark]
    );

    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
    const borderRadius = rounded ? sizeConfig.size / 2 : sizeConfig.radius;

    const colors = useMemo(() => {
      switch (variant) {
        case "default":
          return {
            bg: theme.colors.primary,
            fg: theme.colors.primaryForeground,
            border: "transparent",
            showHighlight: false,
          };
        case "secondary":
          return {
            bg: theme.colors.secondary,
            fg: theme.colors.secondaryForeground,
            border: "transparent",
            showHighlight: false,
          };
        case "outline":
          return {
            bg: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            fg: theme.colors.foreground,
            border: theme.colors.border,
            showHighlight: false,
          };
        case "destructive":
          return {
            bg: theme.colors.destructive,
            fg: theme.colors.destructiveForeground,
            border: "transparent",
            showHighlight: false,
          };
        case "glass":
          return {
            bg: liquidGlassEnabled
              ? glass.materials.regular.background
              : theme.colors.card,
            fg: theme.colors.foreground,
            border: liquidGlassEnabled
              ? glass.border.regular
              : theme.colors.border,
            showHighlight: liquidGlassEnabled,
          };
        case "ghost":
        default:
          return {
            bg: "transparent",
            fg: theme.colors.foreground,
            border: "transparent",
            showHighlight: false,
          };
      }
    }, [variant, theme, isDark, glass, liquidGlassEnabled]);

    const renderedIcon = useMemo(() => {
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement<any>, {
          size: (icon.props as any).size ?? sizeConfig.iconSize,
          color: (icon.props as any).color ?? colors.fg,
        });
      }
      return icon;
    }, [icon, sizeConfig.iconSize, colors.fg]);

    return (
      <LiquidPressable
        ref={ref}
        disabled={disabled || loading}
        viscosity={viscosity}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={[
          styles.container,
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: variant === "outline" ? 1 : 0,
          },
          style,
        ]}
        {...props}
      >
        {colors.showHighlight && !disabled && (
          <LiquidHighlight
            type="top"
            borderRadius={borderRadius}
            opacity={0.6}
          />
        )}

        {variant === "glass" && (
          <LiquidBorder variant="subtle" borderRadius={borderRadius} />
        )}

        {loading ? (
          <ActivityIndicator size="small" color={colors.fg} />
        ) : (
          renderedIcon
        )}

        {badge !== undefined && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.destructive,
              },
            ]}
          >
            <ThemedText
              variant="xs"
              style={{ color: "#fff", fontWeight: "700", fontSize: 9 }}
            >
              {badge}
            </ThemedText>
          </View>
        )}
      </LiquidPressable>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
});
