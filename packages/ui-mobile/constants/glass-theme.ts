// @/constants/glass-theme.ts
//
// Adaptateur Liquid Glass — dérivé du thème actuel.
// Ne duplique pas les couleurs de theme.ts.
// Toutes les valeurs sont calculées depuis theme.colors.*.
//
// Usage:
//   const glass = useMemo(() => createGlassTheme(theme, isDark), [theme, isDark]);

import type { Theme } from './theme';

// ---------------------------------------------------------------------------
// Types (exportés pour les composants Liquid)
// ---------------------------------------------------------------------------

export type LiquidMaterial =
  | 'clear'
  | 'soft'
  | 'regular'
  | 'thick'
  | 'solid'
  | 'floating'
  | 'interactive';

export type LiquidIntensity = 'subtle' | 'soft' | 'medium' | 'strong';
export type LiquidViscosity = 'soft' | 'medium' | 'strong';
export type LiquidTint = 'none' | 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted';
export type LiquidBorderVariant = 'subtle' | 'regular' | 'accent' | 'glow';
export type LiquidBlurSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LiquidShadowSize = 'sm' | 'md' | 'lg' | 'xl';

export interface GlassShadowConfig {
  // iOS
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  // Android
  elevation: number;
  // Web (CSS)
  boxShadow: string;
}

export interface GlassMaterialConfig {
  /** RGBA background string */
  background: string;
  /** Slightly more opaque — used as Android fallback when blur unavailable */
  backgroundFallback: string;
  /** BlurView intensity (0–100 for expo-blur) */
  blurIntensity: number;
  /** CSS blur value in px (for Web backdropFilter) */
  blurPx: number;
  /** Border RGBA */
  borderColor: string;
  /** LinearGradient colors for the top highlight */
  highlightColors: readonly [string, string];
  /** Shadow config cross-platform */
  shadow: GlassShadowConfig;
}

export interface GlassSemanticToken {
  background: string;
  foreground: string;
  border: string;
}

export interface GlassInteractionConfig {
  /** Scale on pressIn */
  pressedScale: number;
  /** Scale micro-overshoot on pressOut */
  overshootScale: number;
  /** Opacity when pressed */
  pressedOpacity: number;
  /** Opacity when disabled */
  disabledOpacity: number;
  /** Opacity on hover (web) */
  hoverOpacity: number;
}

export interface GlassTokens {
  materials: Record<LiquidMaterial, GlassMaterialConfig>;
  blur: Record<LiquidBlurSize, { intensity: number; px: number }>;
  border: {
    subtle: string;
    regular: string;
    accent: string;
    glow: string;
  };
  highlight: {
    top: readonly [string, string];
    diagonal: readonly [string, string];
    inner: readonly [string, string];
    edge: string;
  };
  shadow: Record<LiquidShadowSize, GlassShadowConfig>;
  semantic: {
    success: GlassSemanticToken;
    warning: GlassSemanticToken;
    info: GlassSemanticToken;
  };
  interaction: GlassInteractionConfig;
  /** Resolved isDark flag for convenience */
  isDark: boolean;
}

// ---------------------------------------------------------------------------
// Internal color utilities — pure JS, no external dependencies
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Passthrough for non-hex strings (rgba/hsl already computed elsewhere)
  if (!hex || !hex.startsWith('#')) return { r: 255, g: 255, b: 255 };
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.length === 6
        ? clean
        : 'ffffff';
  return {
    r: parseInt(full.substring(0, 2), 16) || 255,
    g: parseInt(full.substring(2, 4), 16) || 255,
    b: parseInt(full.substring(4, 6), 16) || 255,
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

// BlurView intensity (0–100) → CSS blur px (approximate mapping)
function intensityToPx(intensity: number): number {
  return Math.round(intensity * 0.4);
}

// ---------------------------------------------------------------------------
// Shadow builder — cross-platform
// ---------------------------------------------------------------------------

function buildShadow(
  baseColor: string,
  isDark: boolean,
  size: LiquidShadowSize,
): GlassShadowConfig {
  const configs: Record<
    LiquidShadowSize,
    {
      offset: { width: number; height: number };
      opacity: { light: number; dark: number };
      radius: number;
      elevation: number;
    }
  > = {
    sm: {
      offset: { width: 0, height: 1 },
      opacity: { light: 0.07, dark: 0.38 },
      radius: 4,
      elevation: 2,
    },
    md: {
      offset: { width: 0, height: 4 },
      opacity: { light: 0.10, dark: 0.45 },
      radius: 10,
      elevation: 5,
    },
    lg: {
      offset: { width: 0, height: 8 },
      opacity: { light: 0.13, dark: 0.52 },
      radius: 20,
      elevation: 10,
    },
    xl: {
      offset: { width: 0, height: 16 },
      opacity: { light: 0.16, dark: 0.60 },
      radius: 36,
      elevation: 18,
    },
  };

  const cfg = configs[size];
  const opacity = isDark ? cfg.opacity.dark : cfg.opacity.light;
  const shadowColor = isDark ? '#000000' : baseColor;
  const boxShadowColor = rgba(shadowColor, opacity);

  return {
    shadowColor,
    shadowOffset: cfg.offset,
    shadowOpacity: opacity,
    shadowRadius: cfg.radius,
    elevation: cfg.elevation,
    boxShadow: `${cfg.offset.width}px ${cfg.offset.height + cfg.radius / 4}px ${cfg.radius}px ${boxShadowColor}`,
  };
}

// ---------------------------------------------------------------------------
// Material builder
// ---------------------------------------------------------------------------

interface MaterialSpec {
  bgOpacity: number;
  blurIntensity: number;
  borderOpacity: number;
  highlightOpacity: number;
  shadowSize: LiquidShadowSize;
}

function buildMaterial(
  cardHex: string,
  borderHex: string,
  isDark: boolean,
  spec: MaterialSpec,
): GlassMaterialConfig {
  const bg = rgba(cardHex, spec.bgOpacity);
  const bgFallback = rgba(cardHex, Math.min(spec.bgOpacity + 0.04, 1.0));

  const borderOpacity = isDark
    ? Math.min(spec.borderOpacity * 0.9, 0.4)
    : Math.min(spec.borderOpacity, 0.35);
  const borderColor = rgba(borderHex, borderOpacity);

  const hlOpacity = isDark
    ? spec.highlightOpacity * 0.4
    : spec.highlightOpacity * 0.6;
  const hlColor = rgba(isDark ? '#FFFFFF' : '#FFFFFF', hlOpacity);

  return {
    background: bg,
    backgroundFallback: bgFallback,
    blurIntensity: spec.blurIntensity,
    blurPx: intensityToPx(spec.blurIntensity),
    borderColor,
    highlightColors: [hlColor, 'transparent'],
    shadow: buildShadow(cardHex, isDark, spec.shadowSize),
  };
}

// ---------------------------------------------------------------------------
// Main factory — exported
// ---------------------------------------------------------------------------

export function createGlassTheme(theme: Theme, isDark: boolean): GlassTokens {
  const card = theme.colors.card;
  const borderCol = theme.colors.border;
  const primary = theme.colors.primary;
  const ring = theme.colors.ring;

  // ---- Materials with Theme Integrity (Solides, nets et contrastés) ----
  const materials: Record<LiquidMaterial, GlassMaterialConfig> = {
    clear: buildMaterial(card, borderCol, isDark, {
      bgOpacity: isDark ? 0.85 : 0.88,
      blurIntensity: 8,
      borderOpacity: 0.5,
      highlightOpacity: 0.03,
      shadowSize: 'sm',
    }),
    soft: buildMaterial(card, borderCol, isDark, {
      bgOpacity: isDark ? 0.90 : 0.92,
      blurIntensity: 12,
      borderOpacity: 0.6,
      highlightOpacity: 0.04,
      shadowSize: 'sm',
    }),
    regular: buildMaterial(card, borderCol, isDark, {
      bgOpacity: isDark ? 0.94 : 0.96,
      blurIntensity: 16,
      borderOpacity: 0.7,
      highlightOpacity: 0.05,
      shadowSize: 'md',
    }),
    thick: buildMaterial(card, borderCol, isDark, {
      bgOpacity: isDark ? 0.97 : 0.98,
      blurIntensity: 22,
      borderOpacity: 0.8,
      highlightOpacity: 0.05,
      shadowSize: 'lg',
    }),
    solid: buildMaterial(card, borderCol, isDark, {
      bgOpacity: 1.0,
      blurIntensity: 0,
      borderOpacity: 0.85,
      highlightOpacity: 0.02,
      shadowSize: 'md',
    }),
    floating: buildMaterial(card, borderCol, isDark, {
      bgOpacity: isDark ? 0.94 : 0.96,
      blurIntensity: 18,
      borderOpacity: 0.75,
      highlightOpacity: 0.06,
      shadowSize: 'xl',
    }),
    interactive: buildMaterial(card, borderCol, isDark, {
      bgOpacity: isDark ? 0.92 : 0.94,
      blurIntensity: 14,
      borderOpacity: 0.65,
      highlightOpacity: 0.04,
      shadowSize: 'sm',
    }),
  };

  // ---- Blur scale ----
  const blurScale: Record<LiquidBlurSize, { intensity: number; px: number }> = {
    xs: { intensity: 6,   px: 2  },
    sm: { intensity: 12,  px: 5  },
    md: { intensity: 18,  px: 8  },
    lg: { intensity: 28,  px: 12 },
    xl: { intensity: 40,  px: 18 },
  };

  // ---- Border tokens (Basés sur le thème actuel) ----
  const border = {
    subtle:  rgba(borderCol, isDark ? 0.45 : 0.40),
    regular: rgba(borderCol, isDark ? 0.80 : 0.75),
    accent:  rgba(ring,      isDark ? 0.65 : 0.55),
    glow:    rgba(primary,   isDark ? 0.75 : 0.60),
  };

  // ---- Highlight tokens (Subtils et discrets) ----
  const hl = {
    top:      [rgba('#FFFFFF', isDark ? 0.04 : 0.08), 'transparent'] as const,
    diagonal: [rgba('#FFFFFF', isDark ? 0.03 : 0.06), 'transparent'] as const,
    inner:    ['transparent', rgba('#FFFFFF', isDark ? 0.02 : 0.04)] as const,
    edge:     rgba(borderCol, isDark ? 0.40 : 0.30),
  };

  // ---- Global shadow scale ----
  const shadow: Record<LiquidShadowSize, GlassShadowConfig> = {
    sm: buildShadow(card, isDark, 'sm'),
    md: buildShadow(card, isDark, 'md'),
    lg: buildShadow(card, isDark, 'lg'),
    xl: buildShadow(card, isDark, 'xl'),
  };

  // ---- Semantic tokens ----
  const semantic = {
    success: {
      background: isDark ? rgba('#059669', 0.18) : rgba('#059669', 0.10),
      foreground: isDark ? '#6EE7B7' : '#065F46',
      border:     rgba('#059669', isDark ? 0.35 : 0.25),
    },
    warning: {
      background: isDark ? rgba('#D97706', 0.18) : rgba('#D97706', 0.10),
      foreground: isDark ? '#FCD34D' : '#92400E',
      border:     rgba('#D97706', isDark ? 0.35 : 0.25),
    },
    info: {
      background: isDark ? rgba('#3B82F6', 0.18) : rgba('#3B82F6', 0.10),
      foreground: isDark ? '#93C5FD' : '#1E40AF',
      border:     rgba('#3B82F6', isDark ? 0.35 : 0.25),
    },
  };

  // ---- Interaction (Effet visqueux / rebond élastique) ----
  const interaction: GlassInteractionConfig = {
    pressedScale:    0.97,
    overshootScale:  1.015,
    pressedOpacity:  0.88,
    disabledOpacity: 0.45,
    hoverOpacity:    0.95,
  };

  return {
    materials,
    blur: blurScale,
    border,
    highlight: hl,
    shadow,
    semantic,
    interaction,
    isDark,
  };
}
