// @/components/ui/button.tsx
import React, { ReactNode, forwardRef, useMemo } from "react";
import {
  PressableProps,
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

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "glass";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  loading?: boolean;
  isFullWidth?: boolean;
  viscosity?: LiquidViscosity;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      disabled = false,
      loading = false,
      isFullWidth = false,
      viscosity = "medium",
      leftIcon,
      rightIcon,
      style,
      onPress,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark]
    );

    const colors = useMemo(() => {
      switch (variant) {
        case "default":
          return {
            backgroundColor: theme.colors.primary,
            textColor: theme.colors.primaryForeground,
            borderColor: "transparent",
            showHighlight: false,
          };
        case "secondary":
          return {
            backgroundColor: theme.colors.secondary,
            textColor: theme.colors.secondaryForeground,
            borderColor: "transparent",
            showHighlight: false,
          };
        case "outline":
          return {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.02)",
            textColor: theme.colors.foreground,
            borderColor: theme.colors.border,
            showHighlight: false,
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            textColor: theme.colors.foreground,
            borderColor: "transparent",
            showHighlight: false,
          };
        case "destructive":
          return {
            backgroundColor: theme.colors.destructive,
            textColor: theme.colors.destructiveForeground,
            borderColor: "transparent",
            showHighlight: false,
          };
        case "glass":
          return {
            // Liquid désactivé → fond card solide + border standard
            backgroundColor: liquidGlassEnabled
              ? glass.materials.regular.background
              : theme.colors.card,
            textColor: theme.colors.foreground,
            borderColor: liquidGlassEnabled
              ? glass.border.regular
              : theme.colors.border,
            showHighlight: liquidGlassEnabled,
          };
        default:
          return {
            backgroundColor: theme.colors.primary,
            textColor: theme.colors.primaryForeground,
            borderColor: "transparent",
            showHighlight: false,
          };
      }
    }, [variant, theme, isDark, glass, liquidGlassEnabled]);

    const sizeStyles = useMemo(() => {
      switch (size) {
        case "sm":
          return {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.borderRadius.sm,
            minHeight: 36,
            fontSize: theme.typography.sm,
          };
        case "lg":
          return {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            borderRadius: theme.borderRadius.lg,
            minHeight: 52,
            fontSize: theme.typography.lg,
          };
        case "md":
        default:
          return {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
            minHeight: 44,
            fontSize: theme.typography.base,
          };
      }
    }, [size, theme]);

    const baseContainerStyle: ViewStyle = useMemo(
      () => ({
        backgroundColor: colors.backgroundColor,
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: colors.borderColor,
        paddingVertical: sizeStyles.paddingVertical,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        borderRadius: sizeStyles.borderRadius,
        minHeight: sizeStyles.minHeight,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
        width: isFullWidth ? "100%" : undefined,
        alignSelf: isFullWidth ? "stretch" : "flex-start",
        position: "relative",
        overflow: "hidden",
      }),
      [colors, variant, sizeStyles, isFullWidth, theme]
    );

    const renderChild = (child: ReactNode, index?: number) => {
      if (React.isValidElement(child)) {
        return child;
      }
      if (child !== null && child !== undefined) {
        return (
          <ThemedText
            key={index}
            style={{
              color: colors.textColor,
              fontWeight: "600",
              fontSize: sizeStyles.fontSize,
            }}
          >
            {child}
          </ThemedText>
        );
      }
      return null;
    };

    return (
      <LiquidPressable
        ref={ref}
        disabled={disabled || loading}
        viscosity={viscosity}
        onPress={onPress}
        style={[baseContainerStyle, style]}
        {...props}
      >
        {/* Subtle glass highlight reflection */}
        {colors.showHighlight && !disabled && (
          <LiquidHighlight
            type="top"
            borderRadius={sizeStyles.borderRadius}
            opacity={0.65}
          />
        )}

        {/* Translucent border overlay for glass or outline */}
        {(variant === "glass" || variant === "outline") && (
          <LiquidBorder
            variant="subtle"
            borderRadius={sizeStyles.borderRadius}
          />
        )}

        {loading ? (
          <ActivityIndicator size="small" color={colors.textColor} />
        ) : (
          <>
            {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
            {Array.isArray(children)
              ? children.map((child, index) => renderChild(child, index))
              : renderChild(children)}
            {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
          </>
        )}
      </LiquidPressable>
    );
  }
);

Button.displayName = "Button";

export default Button;

const styles = StyleSheet.create({
  icon: {
    justifyContent: "center",
    alignItems: "center",
  },
});