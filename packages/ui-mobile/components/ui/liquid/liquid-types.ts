// @/components/ui/liquid/liquid-types.ts
//
// Types TypeScript partagés pour le système Liquid Glass.
// Importé par tous les composants ui/liquid/*.
// N'importe rien de React Native pour rester léger.

import type { ViewProps, PressableProps, StyleProp, ViewStyle } from 'react-native';
import type {
  LiquidMaterial,
  LiquidIntensity,
  LiquidViscosity,
  LiquidTint,
  LiquidBorderVariant,
  LiquidBlurSize,
  LiquidShadowSize,
  GlassTokens,
  GlassMaterialConfig,
  GlassShadowConfig,
  GlassSemanticToken,
  GlassInteractionConfig,
} from '../../../constants/glass-theme';

// Re-export glass-theme types so consumers import from a single place
export type {
  LiquidMaterial,
  LiquidIntensity,
  LiquidViscosity,
  LiquidTint,
  LiquidBorderVariant,
  LiquidBlurSize,
  LiquidShadowSize,
  GlassTokens,
  GlassMaterialConfig,
  GlassShadowConfig,
  GlassSemanticToken,
  GlassInteractionConfig,
};

// ---------------------------------------------------------------------------
// 9. Props Primitives
// ---------------------------------------------------------------------------

export interface LiquidSurfaceProps extends ViewProps {
  /**
   * Glass material preset. Controls blur, opacity, border and highlight.
   * All values come from glass-theme — you never pass raw numbers.
   * @default "regular"
   */
  material?: LiquidMaterial;

  /**
   * Intensity multiplier applied on top of the material preset.
   * @default "medium"
   */
  intensity?: LiquidIntensity;

  /**
   * Colour tint overlaid on the glass surface.
   * @default "none"
   */
  tint?: LiquidTint;

  /**
   * Whether to disable blur (performance hint for large lists).
   * Falls back to backgroundFallback.
   * @default false
   */
  noBlur?: boolean;

  /**
   * Border radius. If not specified, inherits from parent or defaults to theme.borderRadius.lg.
   */
  borderRadius?: number;

  /**
   * Clipping mode for overflow content.
   * @default "hidden"
   */
  overflow?: 'hidden' | 'visible';

  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// LiquidPressable
// ---------------------------------------------------------------------------

export interface LiquidPressableProps
  extends Omit<PressableProps, 'style' | 'children'> {
  /**
   * Children can be standard ReactNode or render function with pressed state
   */
  children?:
    | React.ReactNode
    | ((state: { pressed: boolean }) => React.ReactNode);

  /**
   * Material applied to the surface when used as a standalone pressable container.
   * Leave undefined to use LiquidPressable as a pure interaction wrapper.
   */
  material?: LiquidMaterial;

  /**
   * Rubber spring strength on press interaction.
   * @default "medium"
   */
  viscosity?: LiquidViscosity;

  /**
   * Enable expo-haptics light impact on press.
   * @default false
   */
  haptic?: boolean;

  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// LiquidHighlight
// ---------------------------------------------------------------------------

export interface LiquidHighlightProps {
  /**
   * Highlight type.
   * - top: gradient from top edge downward (default)
   * - diagonal: gradient from top-left corner
   * - inner: gradient from bottom, creating inner glow
   * - edge: solid luminous border at top edge only
   */
  type?: 'top' | 'diagonal' | 'inner' | 'edge';

  /**
   * Override the opacity intensity. Defaults to material config value.
   */
  opacity?: number;

  /**
   * Height of the gradient area as a fraction of container.
   * @default 0.45
   */
  coverage?: number;

  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// LiquidBorder
// ---------------------------------------------------------------------------

export interface LiquidBorderProps {
  /**
   * Border visual variant.
   * - subtle: barely visible translucent white/grey
   * - regular: standard glass border (default)
   * - accent: uses theme.colors.ring with opacity
   * - glow: uses theme.colors.primary with glow opacity
   */
  variant?: LiquidBorderVariant;

  /**
   * Override border width. Defaults vary by variant (0.5 – 1.5).
   */
  width?: number;

  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// LiquidGlow
// ---------------------------------------------------------------------------

export interface LiquidGlowProps {
  /**
   * Colour key from theme.colors.* or a raw colour string.
   * @default "primary"
   */
  color?: LiquidTint | string;

  /**
   * Glow intensity.
   * @default "soft"
   */
  intensity?: 'subtle' | 'soft' | 'medium' | 'strong';

  /**
   * Size of the glow area in pixels.
   * @default 80
   */
  size?: number;

  /**
   * Position of the glow relative to its container.
   * @default "center"
   */
  position?: 'center' | 'top' | 'bottom' | 'top-left' | 'top-right';

  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// LiquidBlob
// ---------------------------------------------------------------------------

export interface LiquidBlobProps {
  /**
   * Diameter in pixels.
   * @default 200
   */
  size?: number;

  /**
   * Colour key from theme.colors.* or a raw colour string.
   * @default "primary"
   */
  color?: LiquidTint | string;

  /**
   * Blur amount applied to the blob (CSS blur or SimulatedBlur).
   * @default 40
   */
  blur?: number;

  /**
   * Enable slow floating animation.
   * @default true
   */
  animated?: boolean;

  /**
   * Base opacity of the blob.
   * @default 0.18
   */
  opacity?: number;

  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Utility types used across components
// ---------------------------------------------------------------------------

/** Spring config presets for rubber interactions */
export type SpringPreset = 'gentle' | 'bouncy' | 'stiff';

export const SPRING_PRESETS: Record<
  SpringPreset,
  { damping: number; stiffness: number; mass?: number }
> = {
  gentle:  { damping: 18, stiffness: 220 },
  bouncy:  { damping: 8,  stiffness: 350 },
  stiff:   { damping: 22, stiffness: 400 },
} as const;

/** Viscosity → spring config mapping */
export const VISCOSITY_MAP: Record<
  LiquidViscosity,
  { pressIn: SpringPreset; pressOut: SpringPreset }
> = {
  soft:   { pressIn: 'gentle', pressOut: 'gentle' },
  medium: { pressIn: 'stiff',  pressOut: 'bouncy' },
  strong: { pressIn: 'stiff',  pressOut: 'stiff'  },
} as const;

/** Intensity → multiplier for opacity/highlight scaling */
export const INTENSITY_MULTIPLIER: Record<LiquidIntensity, number> = {
  subtle: 0.55,
  soft:   0.75,
  medium: 1.00,
  strong: 1.30,
} as const;
