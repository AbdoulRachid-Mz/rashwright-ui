// @/components/ui/liquid/liquid-surface.tsx
//
// Composant fondamental Liquid Surface.
// Rendu multi-couches :
// 1. Animated.View container (clip + borderRadius + shadow)
// 2. BlurView (natif iOS/Android) ou fallback overlay RGBA
// 3. Tint layer (si spécifié)
// 4. LiquidHighlight supérieur
// 5. LiquidBorder
// 6. Children
//
// Props : material, intensity, tint, noBlur, borderRadius, overflow + tout ViewProps.

import React, { forwardRef, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme } from "../../../contexts/theme-context";
import { createGlassTheme } from "../../../constants/glass-theme";
import { getLiquidShadow } from "./liquid-shadow";
import LiquidHighlight from "./liquid-highlight";
import LiquidBorder from "./liquid-border";
import type {
  LiquidSurfaceProps,
  LiquidTint,
  LiquidIntensity,
} from "./liquid-types";
import { INTENSITY_MULTIPLIER } from "./liquid-types";

const LiquidSurface = forwardRef<View, LiquidSurfaceProps>(
  (
    {
      children,
      material = "regular",
      intensity = "medium",
      tint = "none",
      noBlur = false,
      borderRadius,
      overflow = "hidden",
      style,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark]
    );

    const matConfig = useMemo(() => {
      return glass.materials[material] || glass.materials.regular;
    }, [glass, material]);

    const resolvedRadius = useMemo(() => {
      if (borderRadius !== undefined) return borderRadius;
      return theme.borderRadius.lg;
    }, [borderRadius, theme.borderRadius.lg]);

    const multiplier = INTENSITY_MULTIPLIER[intensity] || 1;

    // Calcul de la couleur de teinte optionnelle
    const tintColor = useMemo(() => {
      if (tint === "none") return null;
      const tintMap: Record<Exclude<LiquidTint, "none">, string> = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        destructive: theme.colors.destructive,
        muted: theme.colors.muted,
      };
      const base = tintMap[tint];
      if (!base) return null;
      return base;
    }, [tint, theme.colors]);


    const blurIntensity = useMemo(() => {
      if (!liquidGlassEnabled || noBlur) return 0;
      return Math.min(100, Math.round(matConfig.blurIntensity * multiplier));
    }, [liquidGlassEnabled, noBlur, matConfig.blurIntensity, multiplier]);

    const webBackdropStyle: any = useMemo(() => {
      if (Platform.OS !== "web") return {};
      if (!liquidGlassEnabled || noBlur || matConfig.blurPx === 0) return {};
      const blurPx = Math.round(matConfig.blurPx * multiplier);
      return {
        // @ts-ignore Web CSS backdrop-filter
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
      };
    }, [liquidGlassEnabled, noBlur, matConfig.blurPx, multiplier]);

    const backgroundColor = useMemo(() => {
      // Liquid désactivé → fond opaque natif theme.colors.card
      if (!liquidGlassEnabled) return theme.colors.card;
      // Android n'a pas de BlurView natif → utiliser le fallback semi-transparent
      if (noBlur || Platform.OS === "android") return matConfig.backgroundFallback;
      return matConfig.background;
    }, [liquidGlassEnabled, theme.colors.card, noBlur, matConfig]);

    return (
      <Animated.View
        ref={ref as any}
        style={[
          styles.container,
          // Ombres uniquement quand liquid est actif (évite un look bizarre sans blur)
          liquidGlassEnabled ? getLiquidShadow(matConfig.shadow) : {},
          {
            borderRadius: resolvedRadius,
            backgroundColor,
            overflow,
            // Quand désactivé : border native standard
            borderWidth: !liquidGlassEnabled ? 1 : undefined,
            borderColor: !liquidGlassEnabled ? theme.colors.border : undefined,
          },
          webBackdropStyle,
          style,
        ]}
        {...props}
      >
        {/* Native Blur Layer — iOS/Android uniquement, si liquid activé */}
        {liquidGlassEnabled && !noBlur && Platform.OS !== "web" && blurIntensity > 0 && (
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, { borderRadius: resolvedRadius }]}
          />
        )}

        {/* Optional Tint Overlay */}
        {liquidGlassEnabled && tintColor && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tintColor,
                opacity: isDark ? 0.10 * multiplier : 0.06 * multiplier,
                borderRadius: resolvedRadius,
              },
            ]}
          />
        )}

        {/* Luminous Top Highlight */}
        {liquidGlassEnabled && matConfig.highlightColors && (
          <LiquidHighlight
            type="top"
            borderRadius={resolvedRadius}
            opacity={multiplier * 0.5}
          />
        )}

        {/* Translucent Glass Border */}
        {liquidGlassEnabled && (
          <LiquidBorder variant="regular" borderRadius={resolvedRadius} />
        )}

        {/* Inner Content */}
        {children}
      </Animated.View>
    );
  }
);

LiquidSurface.displayName = "LiquidSurface";

export default LiquidSurface;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
});
