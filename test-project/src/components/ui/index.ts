// @/components/ui/index.ts
//
// Barrel d'exportation dynamique Rashwright UI Mobile.
// Exporte les primitives Liquid Glass, les vues de base et uniquement les composants installés.

// ---------------------------------------------------------------------------
// 1. Primitives Liquid Glass
// ---------------------------------------------------------------------------
export { default as LiquidSurface } from "./liquid/liquid-surface";
export { default as LiquidPressable } from "./liquid/liquid-pressable";
export { default as LiquidHighlight } from "./liquid/liquid-highlight";
export { default as LiquidBorder } from "./liquid/liquid-border";
export { default as LiquidGlow } from "./liquid/liquid-glow";
export { default as LiquidBlob } from "./liquid/liquid-blob";
export { getLiquidShadow, mergeShadows } from "./liquid/liquid-shadow";
export * from "./liquid/liquid-types";

// ---------------------------------------------------------------------------
// 2. Vues Thématiques de Base
// ---------------------------------------------------------------------------
export { default as ThemedView } from "./view";
export { default as ThemedText } from "./text";
export { createGlassTheme } from "@/constants/glass-theme";

// ---------------------------------------------------------------------------
// 3. Composants Installés
// ---------------------------------------------------------------------------
export { default as Badge } from "./badge";
export { default as Button } from "./button";
export { default as Card } from "./card";
export { default as GlassCard } from "./glass-card";
export { RashwrightLogo } from "./rashwright-logo";
export { RashwrightShowcaseScreen } from "./showcase-screen";
export { default as TextInput } from "./text-input";
export { UploadImage } from "./upload-image";
export { UploadVideo } from "./upload-video";
