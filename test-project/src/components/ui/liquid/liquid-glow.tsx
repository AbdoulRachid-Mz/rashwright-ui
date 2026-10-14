// @/components/ui/liquid/liquid-glow.tsx
//
// Halo lumineux d'accentuation (Glow).
// Utilisé pour les éléments actifs, focus, FAB, boutons premium, badges verified.
// Rendu fluide et léger sans impact de performance.

import React, { memo, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/contexts/theme-context";
import type { LiquidGlowProps, LiquidTint } from "./liquid-types";
import { INTENSITY_MULTIPLIER } from "./liquid-types";

const LiquidGlow = memo(
  ({
    color = "primary",
    intensity = "soft",
    size = 80,
    position = "center",
    style,
  }: LiquidGlowProps) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();

    // ── Guard : si Liquid Glass désactivé, aucun glow ──
    if (!liquidGlassEnabled) return null;

    const resolvedColor = useMemo(() => {
      const tintMap: Record<string, string> = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        destructive: theme.colors.destructive,
        muted: theme.colors.muted,
      };

      if (tintMap[color]) {
        return tintMap[color];
      }
      return color;
    }, [color, theme.colors]);

    const multiplier = INTENSITY_MULTIPLIER[intensity] || 0.75;
    const opacity = isDark ? 0.35 * multiplier : 0.22 * multiplier;

    const positionStyle = useMemo((): ViewStyle => {
      const half = size / 2;
      switch (position) {
        case "top":
          return { top: -half, alignSelf: "center" };
        case "bottom":
          return { bottom: -half, alignSelf: "center" };
        case "top-left":
          return { top: -half, left: -half };
        case "top-right":
          return { top: -half, right: -half };
        case "center":
        default:
          return {
            top: "50%",
            left: "50%",
            transform: [{ translateX: -half }, { translateY: -half }],
          };
      }
    }, [position, size]);

    // Gradient radial approximé
    const gradientColors = useMemo(() => {
      return [resolvedColor, "transparent"] as const;
    }, [resolvedColor]);

    return (
      <View
        pointerEvents="none"
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity,
          },
          positionStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={gradientColors as readonly [string, string, ...string[]]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: size / 2 }]}
        />
      </View>
    );
  }
);

LiquidGlow.displayName = "LiquidGlow";

export default LiquidGlow;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
});
