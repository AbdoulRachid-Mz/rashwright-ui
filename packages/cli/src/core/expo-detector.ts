import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const SUPPORTED_SDK_VERSIONS = [54, 55, 56, 57, 58, 59] as const;
export const MINIMUM_SDK_VERSION = 54;

export type SupportedSdk = (typeof SUPPORTED_SDK_VERSIONS)[number];

export interface ExpoInfo {
  detected: boolean;
  version: string | null;
  sdkVersion: number | null;
  isSupported: boolean;
  supportedVersion: SupportedSdk | null;
}

export function detectExpo(cwd: string = process.cwd()): ExpoInfo {
  // Try reading from node_modules/expo/package.json first (most accurate)
  const expoNodeModules = join(cwd, "node_modules", "expo", "package.json");
  if (existsSync(expoNodeModules)) {
    try {
      const expoPkg = JSON.parse(readFileSync(expoNodeModules, "utf-8"));
      const version: string = expoPkg.version ?? "";
      const sdk = parseInt(version.split(".")[0] ?? "0", 10);
      const isSupported = sdk >= MINIMUM_SDK_VERSION;
      const supportedVersion = SUPPORTED_SDK_VERSIONS.includes(sdk as SupportedSdk)
        ? (sdk as SupportedSdk)
        : null;
      return { detected: true, version, sdkVersion: sdk, isSupported, supportedVersion };
    } catch {
      // fall through
    }
  }

  // Fallback: read from project package.json
  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      const expoVersion = allDeps["expo"];
      if (expoVersion) {
        const match = String(expoVersion).match(/(\d+)/);
        const sdk = match ? parseInt(match[1], 10) : null;
        const isSupported = sdk !== null && sdk >= MINIMUM_SDK_VERSION;
        const supportedVersion =
          sdk !== null && SUPPORTED_SDK_VERSIONS.includes(sdk as SupportedSdk)
            ? (sdk as SupportedSdk)
            : null;
        return {
          detected: true,
          version: expoVersion,
          sdkVersion: sdk,
          isSupported,
          supportedVersion,
        };
      }
    } catch {
      // fall through
    }
  }

  return { detected: false, version: null, sdkVersion: null, isSupported: false, supportedVersion: null };
}

/**
 * Get the compatibility matrix for a given Expo SDK version.
 * Returns the versions file path, or null if not found.
 */
export function getCompatibilityMatrixPath(
  sdkVersion: number,
  registryRoot: string
): string | null {
  const path = join(registryRoot, "versions", `expo-${sdkVersion}.json`);
  return existsSync(path) ? path : null;
}

/**
 * Read compatibility matrix for a given SDK version.
 */
export function readCompatibilityMatrix(
  sdkVersion: number,
  registryRoot: string
): Record<string, string> | null {
  const path = getCompatibilityMatrixPath(sdkVersion, registryRoot);
  if (!path) return null;
  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));
    return data.packages ?? null;
  } catch {
    return null;
  }
}
