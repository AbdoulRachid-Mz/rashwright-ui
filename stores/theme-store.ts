/**
 * @rashwright/ui-mobile — Theme Store
 *
 * Store universel pour la gestion du thème UI, des 6 presets et du mode Glass.
 * Détecte automatiquement AsyncStorage (@react-native-async-storage/async-storage)
 * ou MMKV, avec fallback transparent en mémoire si aucun n'est installé.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createRequire } from "node:module";
import type { ThemeMode } from "../constants/theme";
import type { ThemePresetName } from "../theme/themes/default";
import { DEFAULT_THEME_NAME } from "../theme/themes/default";

export interface ThemeStoreState {
  /** Mode d'apparence : light, dark ou synchronisé avec le système */
  themeMode: ThemeMode;
  /** Preset visuel parmi les 6 thèmes disponibles */
  themePreset: ThemePresetName;
  /** Activation du matériau Liquid Glass */
  liquidGlassEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setThemePreset: (preset: ThemePresetName) => void;
  setLiquidGlassEnabled: (enabled: boolean) => void;
  toggleTheme: () => void;
}

type StorageAdapter = {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
};

// Fallback in-memory storage si aucun backend natif n'est installé
const memoryStorageMap = new Map<string, string>();
const fallbackMemoryStorage: StorageAdapter = {
  getItem: (key) => memoryStorageMap.get(key) ?? null,
  setItem: (key, value) => { memoryStorageMap.set(key, value); },
  removeItem: (key) => { memoryStorageMap.delete(key); },
};

/**
 * Résolution automatique du meilleur backend de stockage disponible.
 * 1. AsyncStorage (@react-native-async-storage/async-storage) si présent
 * 2. Fallback mémoire
 */
export function getDefaultStorage(): StorageAdapter {
  try {
    const require = createRequire(import.meta.url);
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    if (AsyncStorage && typeof AsyncStorage.getItem === "function") {
      return AsyncStorage;
    }
  } catch {
    // AsyncStorage non installé dans le projet consommateur
  }
  return fallbackMemoryStorage;
}

export const createThemeStore = (customStorage?: () => StorageAdapter) =>
  create<ThemeStoreState>()(
    persist(
      (set, get) => ({
        themeMode: "system" as ThemeMode,
        themePreset: DEFAULT_THEME_NAME,
        liquidGlassEnabled: false,
        setThemeMode: (mode) => set({ themeMode: mode }),
        setThemePreset: (preset) => set({ themePreset: preset }),
        setLiquidGlassEnabled: (enabled) => set({ liquidGlassEnabled: enabled }),
        toggleTheme: () => {
          const current = get().themeMode;
          const next: ThemeMode =
            current === "dark" ? "light" : current === "light" ? "dark" : "dark";
          set({ themeMode: next });
        },
      }),
      {
        name: "rashwright-ui-theme",
        storage: createJSONStorage(customStorage || getDefaultStorage),
      }
    )
  );

export const useThemeStore = createThemeStore();

export type ThemeStore = ReturnType<typeof createThemeStore>;
