// @/components/ui/liquid/liquid-shadow.ts
//
// Helper cross-platform pour les ombres.
// iOS  → shadowColor / shadowOffset / shadowOpacity / shadowRadius
// Android → elevation
// Web  → boxShadow (via StyleSheet / inline style)
//
// Usage:
//   const shadow = getLiquidShadow(glass.shadow.md);
//   <View style={[shadow, style]} />

import { Platform, StyleSheet, ViewStyle } from 'react-native';
import type { GlassShadowConfig, LiquidShadowSize } from './liquid-types';

// ---------------------------------------------------------------------------
// Returns a React Native StyleSheet-compatible shadow object.
// On each platform only the relevant properties are applied.
// ---------------------------------------------------------------------------

export function getLiquidShadow(config: GlassShadowConfig): ViewStyle {
  if (!config) return {};

  if (Platform.OS === 'ios') {
    return {
      shadowColor: config.shadowColor,
      shadowOffset: config.shadowOffset,
      shadowOpacity: config.shadowOpacity,
      shadowRadius: config.shadowRadius,
    };
  }

  if (Platform.OS === 'android') {
    return {
      elevation: config.elevation ?? 0,
    };
  }

  // Web — react-native-web maps boxShadow when provided as a string in style
  return {
    // @ts-ignore — web-only property, RNW maps it to CSS box-shadow
    boxShadow: config.boxShadow ?? 'none',
  };
}

// ---------------------------------------------------------------------------
// Convenience: merge multiple shadow configs into one (iOS + Android).
// Useful when you need both shadow + elevation on a component.
// ---------------------------------------------------------------------------

export function mergeShadows(...configs: GlassShadowConfig[]): ViewStyle {
  if (configs.length === 0) return {};
  if (configs.length === 1) return getLiquidShadow(configs[0]);

  // Take the last config for iOS (most prominent wins)
  const last = configs[configs.length - 1];
  return getLiquidShadow(last);
}

// ---------------------------------------------------------------------------
// Static presets — for use without a full GlassTokens object
// (e.g., when bootstrapping before theme is available)
// ---------------------------------------------------------------------------

export const SHADOW_PRESETS: Record<string, GlassShadowConfig> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    boxShadow: 'none',
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 36,
    elevation: 18,
    boxShadow: '0 16px 48px rgba(0,0,0,0.16)',
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 14,
    boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
  },
};
