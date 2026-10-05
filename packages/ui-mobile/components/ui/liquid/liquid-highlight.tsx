// @/components/ui/liquid/liquid-highlight.tsx
//
// Overlay de reflet lumineux positionné en AbsoluteOverlay.
// Simule la réflexion lumineuse supérieure d'une surface en verre.
// Utilise LinearGradient — jamais de blur, uniquement luminosité.
//
// Usage:
//   <LiquidHighlight type="top" borderRadius={16} />

import React, { memo } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "@/contexts/theme-context";
import { useMemo } from 'react';
import { createGlassTheme } from "@/constants/glass-theme";
import type { LiquidHighlightProps } from './liquid-types';

const LiquidHighlight = memo(
  ({
    type = 'top',
    opacity,
    coverage = 0.45,
    borderRadius = 0,
    style,
  }: LiquidHighlightProps) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();

    // ── Guard : si Liquid Glass désactivé, aucun rendu visuel ──
    if (!liquidGlassEnabled) return null;

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark],
    );

    const colors = useMemo(() => {
      const base = glass.highlight;
      const applyOpacity = (colorStr: string, mult: number): string => {
        if (opacity === undefined) return colorStr;
        // Rebuild with custom opacity
        const match = colorStr.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
        if (!match) return colorStr;
        const [, r, g, b] = match;
        return `rgba(${r},${g},${b},${(opacity * mult).toFixed(3)})`;
      };

      switch (type) {
        case 'top':
          return [
            applyOpacity(base.top[0], 1),
            'transparent',
          ] as const;
        case 'diagonal':
          return [
            applyOpacity(base.diagonal[0], 1),
            'transparent',
          ] as const;
        case 'inner':
          return [
            'transparent',
            applyOpacity(base.inner[1], 1),
          ] as const;
        case 'edge':
          // Edge is a thin line — handled via a simple View
          return null;
        default:
          return [applyOpacity(base.top[0], 1), 'transparent'] as const;
      }
    }, [glass, type, opacity]);

    const coverageStyle: ViewStyle = {
      height: `${Math.round(coverage * 100)}%` satisfies ViewStyle['height'],
    };

    if (type === 'edge') {
      return (
        <View
          pointerEvents="none"
          style={[
            styles.edgeContainer,
            { borderRadius },
            style,
          ]}
        >
          <View
            style={[
              styles.edgeLine,
              {
                backgroundColor: glass.highlight.edge,
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: borderRadius,
              },
            ]}
          />
        </View>
      );
    }

    const gradientStart =
      type === 'diagonal'
        ? { x: 0, y: 0 }
        : { x: 0.5, y: 0 };
    const gradientEnd =
      type === 'diagonal'
        ? { x: 1, y: 1 }
        : { x: 0.5, y: 1 };

    return (
      <LinearGradient
        colors={(colors ?? []) as readonly [string, string, ...string[]]}
        start={gradientStart}
        end={gradientEnd}
        pointerEvents="none"
        style={[
          styles.overlay,
          coverageStyle,
          {
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            ...(type === 'inner' && {
              top: 'auto' satisfies ViewStyle['top'],
              bottom: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: borderRadius,
              borderBottomRightRadius: borderRadius,
            }),
          },
          style,
        ]}
      />
    );
  },
);

LiquidHighlight.displayName = 'LiquidHighlight';

export default LiquidHighlight;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  } as ViewStyle,
  edgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  } as ViewStyle,
  edgeLine: {
    height: 1,
    width: '100%',
    opacity: 1,
  } as ViewStyle,
});
