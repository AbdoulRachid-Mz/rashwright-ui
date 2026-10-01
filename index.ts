/**
 * @rashwright/ui-mobile
 *
 * Point d'entrée principal de la bibliothèque Rashwright UI Mobile.
 * Utilisé quand la lib est importée comme package (pas via rs-ui add).
 */

// Theme system
export * from "./constants/theme";
export * from "./constants/glass-theme";

// Contexts
export { ThemeProvider, useTheme } from "./contexts/theme-context";
export { TabBarProvider, useTabBar } from "./contexts/tab-bar-context";

// Store
export { useThemeStore, createThemeStore } from "./stores/theme-store";
export type { ThemeStoreState, ThemeStore } from "./stores/theme-store";

// Hooks
export { useDevice } from "./hooks/use-device";
export { useBackHandler } from "./hooks/useBackHandler";
export { useScrollAwareTabBar } from "./hooks/useScrollAwareTabBar";

// UI Components — re-exported from components/ui/index.ts
export * from "./components/ui";
