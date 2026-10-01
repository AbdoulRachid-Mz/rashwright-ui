// @/components/ui/floating-action-button.tsx
//
// Floating Action Button (FAB) avec Liquid Surface floating, glow optionnel,
// feedback Rubber et adaptation aux zones de sécurité (Safe Area).

import React, { ReactNode } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidGlow from "./liquid/liquid-glow";

export type FABPosition =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-right"
  | "top-left";

export type FABSize = "sm" | "md" | "lg";

export interface FloatingActionButtonProps {
  icon: ReactNode;
  label?: string;
  onPress: () => void;
  variant?: "default" | "accent" | "glass";
  size?: FABSize;
  glow?: boolean;
  position?: FABPosition;
  offset?: { x?: number; y?: number };
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SIZE_MAP = {
  sm: { size: 44, iconSize: 20, paddingH: 14, fontSize: 13 },
  md: { size: 56, iconSize: 24, paddingH: 18, fontSize: 15 },
  lg: { size: 68, iconSize: 28, paddingH: 22, fontSize: 17 },
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onPress,
  variant = "default",
  size = "md",
  glow = true,
  position = "bottom-right",
  offset,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const sizeCfg = SIZE_MAP[size];
  const isExtended = Boolean(label);

  const getPositionStyle = (): ViewStyle => {
    const bottomBase = (offset?.y ?? 20) + Math.max(insets.bottom, 16);
    const topBase = (offset?.y ?? 20) + Math.max(insets.top, 16);
    const rightBase = (offset?.x ?? 20) + Math.max(insets.right, 16);
    const leftBase = (offset?.x ?? 20) + Math.max(insets.left, 16);

    switch (position) {
      case "bottom-left":
        return { bottom: bottomBase, left: leftBase };
      case "bottom-center":
        return { bottom: bottomBase, alignSelf: "center" };
      case "top-right":
        return { top: topBase, right: rightBase };
      case "top-left":
        return { top: topBase, left: leftBase };
      case "bottom-right":
      default:
        return { bottom: bottomBase, right: rightBase };
    }
  };

  const bgColors = {
    default: theme.colors.primary,
    accent: theme.colors.accent,
    glass: undefined, // handled via LiquidSurface
  };

  const fgColors = {
    default: theme.colors.primaryForeground,
    accent: theme.colors.accentForeground,
    glass: theme.colors.foreground,
  };

  const renderedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, {
        size: (icon.props as any).size ?? sizeCfg.iconSize,
        color: (icon.props as any).color ?? fgColors[variant],
      })
    : icon;

  const content = (
    <View
      style={[
        styles.innerContent,
        {
          height: sizeCfg.size,
          minWidth: sizeCfg.size,
          borderRadius: sizeCfg.size / 2,
          paddingHorizontal: isExtended ? sizeCfg.paddingH : 0,
          backgroundColor: bgColors[variant],
        },
      ]}
    >
      {renderedIcon}
      {label && (
        <ThemedText
          style={{
            color: fgColors[variant],
            fontWeight: "700",
            fontSize: sizeCfg.fontSize,
          }}
        >
          {label}
        </ThemedText>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.positionContainer,
        getPositionStyle(),
        style,
      ]}
    >
      {glow && !disabled && (
        <LiquidGlow
          color={variant === "accent" ? "accent" : "primary"}
          size={sizeCfg.size * 1.6}
          intensity="soft"
        />
      )}

      <LiquidPressable
        onPress={onPress}
        disabled={disabled}
        viscosity="medium"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
      >
        {variant === "glass" ? (
          <LiquidSurface
            material="floating"
            borderRadius={sizeCfg.size / 2}
          >
            {content}
          </LiquidSurface>
        ) : (
          content
        )}
      </LiquidPressable>
    </View>
  );
};

export default FloatingActionButton;

const styles = StyleSheet.create({
  positionContainer: {
    position: "absolute",
    zIndex: 999,
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
