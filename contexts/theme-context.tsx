import React, {
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { useThemeStore } from "../stores/theme-store";
import { lightTheme, darkTheme, Theme, ThemeMode } from "../constants/theme";
import type { ThemePresetName } from "../theme/themes/default";
import { THEME_PRESETS } from "../theme/themes/default";

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  themePreset: ThemePresetName;
  colorScheme: NonNullable<ColorSchemeName>;
  setMode: (mode: ThemeMode) => void;
  setThemePreset: (preset: ThemePresetName) => void;
  toggleTheme: () => void;
  isDark: boolean;
  liquidGlassEnabled: boolean;
  setLiquidGlassEnabled: (enabled: boolean) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
  initialPreset?: ThemePresetName;
}

export function ThemeProvider({
  children,
  initialMode = "system",
  initialPreset,
}: ThemeProviderProps) {
  const storeMode = useThemeStore((s) => s.themeMode);
  const storePreset = useThemeStore((s) => s.themePreset);
  const storeSetMode = useThemeStore((s) => s.setThemeMode);
  const storeSetPreset = useThemeStore((s) => s.setThemePreset);
  const storeLiquidGlass = useThemeStore((s) => s.liquidGlassEnabled);
  const storeSetLiquidGlass = useThemeStore((s) => s.setLiquidGlassEnabled);

  const [colorScheme, setColorScheme] = useState<NonNullable<ColorSchemeName>>(
    Appearance.getColorScheme() ?? "light"
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: scheme }) => {
      if (scheme) {
        setColorScheme(scheme);
      }
    });
    return () => subscription.remove();
  }, []);

  const mode: ThemeMode = storeMode ?? initialMode;
  const themePreset: ThemePresetName = storePreset ?? initialPreset ?? "default";
  const liquidGlassEnabled = storeLiquidGlass ?? true;

  const isDark = useMemo(() => {
    if (mode === "system") {
      return colorScheme === "dark";
    }
    return mode === "dark";
  }, [mode, colorScheme]);

  // Résolution dynamique du thème parmi les 6 presets
  const theme: Theme = useMemo(() => {
    const preset = THEME_PRESETS[themePreset] || THEME_PRESETS.default;
    return isDark ? preset.dark : preset.light;
  }, [themePreset, isDark]);

  const setMode = (newMode: ThemeMode) => {
    storeSetMode(newMode);
  };

  const setThemePreset = (preset: ThemePresetName) => {
    storeSetPreset(preset);
  };

  const toggleTheme = () => {
    if (mode === "dark") {
      setMode("light");
    } else if (mode === "light") {
      setMode("dark");
    } else {
      setMode(isDark ? "light" : "dark");
    }
  };

  const setLiquidGlassEnabled = (enabled: boolean) => {
    storeSetLiquidGlass(enabled);
  };

  const value = useMemo(
    () => ({
      theme,
      mode,
      themePreset,
      colorScheme,
      setMode,
      setThemePreset,
      toggleTheme,
      isDark,
      liquidGlassEnabled,
      setLiquidGlassEnabled,
    }),
    [theme, mode, themePreset, colorScheme, isDark, liquidGlassEnabled]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
