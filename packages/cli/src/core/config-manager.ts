import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

export interface RashwrightConfig {
  version: number;
  componentsPath: string;
  theme: "default" | "glass";
  themePreset?: string;
  glass: boolean;
  typescript: boolean;
  aliases: {
    components: string;
    lib: string;
    theme: string;
  };
  components: Record<string, string>; // name → version installed
}

const DEFAULT_CONFIG: RashwrightConfig = {
  version: 1,
  componentsPath: "components/ui",
  theme: "default",
  glass: false,
  typescript: true,
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
 * Mark a component as installed in the config.
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
      [name]: version,
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
 * Get the installed version of a component.
 */
export function getInstalledVersion(
  config: RashwrightConfig,
  name: string
): string | null {
  return config.components[name] ?? null;
}
