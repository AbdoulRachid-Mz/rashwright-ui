// @/components/ui/badge.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidPressable from "./liquid/liquid-pressable";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning"
  | "glass";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  rounded?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  icon,
  loading = false,
  error = false,
  style,
  textStyle,
  rounded = true,
  onPress,
  accessibilityLabel,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();

  const glass = useMemo(
    () => createGlassTheme(theme, isDark),
    [theme, isDark]
  );

  const { containerStyles, textColor, iconColor, spinnerColor, showHighlight } =
    useMemo(() => {
      let bg = theme.colors.muted;
      let fg = theme.colors.mutedForeground;
      let border = "transparent";
      let bw = 0;
      let hl = false;

      switch (variant) {
        case "primary":
          bg = theme.colors.primary;
          fg = theme.colors.primaryForeground;
          hl = false;
          break;
        case "secondary":
          bg = theme.colors.secondary;
          fg = theme.colors.secondaryForeground;
          hl = false;
          break;
        case "outline":
          bg = "transparent";
          fg = theme.colors.foreground;
          border = theme.colors.border;
          bw = 1;
          break;
        case "destructive":
          bg = theme.colors.destructive;
          fg = theme.colors.destructiveForeground;
          hl = false;
          break;
        case "success":
          // Liquid désactivé → couleur solide sémantique
          bg = liquidGlassEnabled
            ? glass.semantic.success.background
            : (isDark ? "rgba(5, 150, 105, 0.20)" : "rgba(5, 150, 105, 0.12)");
          fg = glass.semantic.success.foreground;
          border = liquidGlassEnabled ? glass.semantic.success.border : "rgba(5,150,105,0.3)";
          bw = 1;
          break;
        case "warning":
          bg = liquidGlassEnabled
            ? glass.semantic.warning.background
            : (isDark ? "rgba(217, 119, 6, 0.20)" : "rgba(217, 119, 6, 0.12)");
          fg = glass.semantic.warning.foreground;
          border = liquidGlassEnabled ? glass.semantic.warning.border : "rgba(217,119,6,0.3)";
          bw = 1;
          break;
        case "glass":
          // Liquid désactivé → fond card solide + border standard
          bg = liquidGlassEnabled ? glass.materials.soft.background : theme.colors.card;
          fg = theme.colors.foreground;
          border = liquidGlassEnabled ? glass.border.subtle : theme.colors.border;
          bw = 1;
          hl = liquidGlassEnabled;
          break;
        case "default":
        default:
          bg = theme.colors.muted;
          fg = theme.colors.mutedForeground;
          break;
      }

      if (error) {
        bg = theme.colors.destructive;
        fg = theme.colors.destructiveForeground;
        border = "transparent";
        bw = 0;
        hl = liquidGlassEnabled; // highlight uniquement si liquid actif
      }

      const sizePadding = {
        sm: { ph: theme.spacing.xs, pv: 2, gap: 4, fs: theme.typography.xs },
        md: { ph: 8, pv: 3, gap: 5, fs: 13 },
        lg: { ph: theme.spacing.sm, pv: 4, gap: 6, fs: theme.typography.sm },
      }[size] || { ph: 8, pv: 3, gap: 5, fs: 13 };

      const cStyle: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: bg,
        borderColor: border,
        borderWidth: bw,
        paddingHorizontal: sizePadding.ph,
        paddingVertical: sizePadding.pv,
        gap: sizePadding.gap,
        borderRadius: rounded ? theme.borderRadius.full : theme.borderRadius.sm,
        position: "relative",
        overflow: "hidden",
      };

      const tStyle: TextStyle = {
        color: fg,
        fontSize: sizePadding.fs,
        fontWeight: "500",
        textAlign: "center",
      };

      return {
        containerStyles: cStyle,
        textColor: fg,
        iconColor: fg,
        spinnerColor: fg,
        showHighlight: hl,
        textStyles: tStyle,
      };
    }, [theme, isDark, glass, variant, size, error, rounded, liquidGlassEnabled]);

  const renderIcon = () => {
    if (!icon || loading) return null;
    if (React.isValidElement(icon)) {
      const typedIcon = icon as React.ReactElement<{ color?: string; size?: number; style?: unknown }>;
      return React.cloneElement(typedIcon, {
        color: typedIcon.props.color ?? iconColor,
        size:
          typedIcon.props.size ??
          (size === "sm" ? 10 : size === "lg" ? 14 : 12),
      });
    }
    return icon;
  };

  const content = (
    <View
      style={[containerStyles, style]}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={accessibilityLabel}
    >
      {showHighlight && (
        <LiquidHighlight
          type="top"
          borderRadius={rounded ? 9999 : theme.borderRadius.sm}
          opacity={0.5}
        />
      )}
      {loading ? (
        <ActivityIndicator
          size={size === "sm" ? 8 : size === "lg" ? 12 : 10}
          color={spinnerColor}
        />
      ) : (
        renderIcon()
      )}
      {children && (
        <Text style={[containerStyles, styles.resetView, textStyle]} numberOfLines={1}>
          <Text style={{ color: textColor, fontWeight: "600" }}>{children}</Text>
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <LiquidPressable onPress={onPress} viscosity="soft">
        {content}
      </LiquidPressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  resetView: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
  },
});

export default Badge;
