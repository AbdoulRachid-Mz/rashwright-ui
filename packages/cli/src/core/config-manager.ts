import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface ComponentLockInfo {
  version: string;
  installedAt?: string;
}

export type InstalledComponentsMap = Record<string, string | ComponentLockInfo>;

export interface RashwrightConfig {
  version: number;
  componentsPath: string;
  theme: "default" | "glass";
  themePreset?: string;
  glass: boolean;
  typescript: boolean;
  packageManager?: "bun" | "pnpm" | "yarn" | "npm";
  aliases: {
    components: string;
    lib: string;
    theme: string;
  };
  components: InstalledComponentsMap; // name → version or lock metadata
}

const DEFAULT_CONFIG: RashwrightConfig = {
  version: 1,
  componentsPath: "src/components/ui",
  theme: "default",
  glass: false,
  typescript: true,
  packageManager: "npm",
  aliases: {
    components: "@/components",
    lib: "@/lib",
    theme: "@/theme",
  },
  components: {},
};

/**
 * Read Rashwright config from the given path.
 * Returns default config if file doesn't exist.
 */
export function readConfig(configPath: string): RashwrightConfig {
  if (!existsSync(configPath)) return { ...DEFAULT_CONFIG };
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    return { ...DEFAULT_CONFIG, ...raw } as RashwrightConfig;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Write Rashwright config to disk.
 */
export function writeConfig(configPath: string, config: RashwrightConfig): void {
  const dir = dirname(configPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

/**
 * Mark a component as installed in the config with version lock and timestamp.
 */
export function markComponentInstalled(
  config: RashwrightConfig,
  name: string,
  version: string
): RashwrightConfig {
  return {
    ...config,
    components: {
      ...config.components,
      [name]: {
        version,
        installedAt: new Date().toISOString(),
      },
    },
  };
}

/**
 * Remove a component from the installed list.
 */
export function markComponentRemoved(
  config: RashwrightConfig,
  name: string
): RashwrightConfig {
  const components = { ...config.components };
  delete components[name];
  return { ...config, components };
}

/**
 * Check if a component is currently installed.
 */
export function isComponentInstalled(config: RashwrightConfig, name: string): boolean {
  return name in config.components;
}

/**
 * Get the installed version of a component (handles both string and lock object format).
 */
export function getInstalledVersion(
  config: RashwrightConfig,
  name: string
): string | null {
  const item = config.components[name];
  if (!item) return null;
  if (typeof item === "string") return item;
  return item.version ?? null;
}

/**
 * Get the installation timestamp of a component if available.
 */
export function getInstalledAt(
  config: RashwrightConfig,
  name: string
): string | null {
  const item = config.components[name];
  if (!item || typeof item === "string") return null;
  return item.installedAt ?? null;
}

export function mergeRashwrightConfigs(
  existing: RashwrightConfig,
  overrides: Partial<RashwrightConfig> & { components?: InstalledComponentsMap },
): RashwrightConfig {
  const { components: overrideComponents, ...restOverrides } = overrides;
  const merged: RashwrightConfig = {
    ...existing,
    ...restOverrides,
    components: {
      ...existing.components,
      ...(overrideComponents ?? {}),
    },
  };
  return merged;
}
