// @/components/ui/liquid/liquid-border.tsx
//
// Overlay de bordure translucide positionné en AbsoluteOverlay.
// Simule la bordure lumineuse d'une surface en verre.
// Aucun blur — uniquement des propriétés border RGBA.
//
// Usage:
//   <LiquidBorder variant="regular" borderRadius={16} />
//   <LiquidBorder variant="accent" width={1.5} borderRadius={12} />

import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import type { LiquidBorderProps } from './liquid-types';

const LiquidBorder = memo(
  ({
    variant = 'regular',
    width,
    borderRadius = 0,
    style,
  }: LiquidBorderProps) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();

    // ── Guard : si Liquid Glass désactivé, aucune border glass ──
    if (!liquidGlassEnabled) return null;

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark],
    );

    const { borderColor, borderWidth } = useMemo(() => {
      switch (variant) {
        case 'subtle':
          return {
            borderColor: glass.border.subtle,
            borderWidth: width ?? 0.5,
          };
        case 'accent':
          return {
            borderColor: glass.border.accent,
            borderWidth: width ?? 1.5,
          };
        case 'glow':
          return {
            borderColor: glass.border.glow,
            borderWidth: width ?? 1.5,
          };
        case 'regular':
        default:
          return {
            borderColor: glass.border.regular,
            borderWidth: width ?? 1,
          };
      }
    }, [glass, variant, width]);

    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth,
            borderColor,
          },
          style,
        ]}
      />
    );
  },
);

LiquidBorder.displayName = 'LiquidBorder';

export default LiquidBorder;
