import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

// ─── Expo SDK ─────────────────────────────────────────────────────────────────

/**
 * Versions Expo SDK réellement supportées par Rashwright UI.
 * Mettre à jour cette liste lorsqu'un nouveau SDK est validé.
 */
export const SUPPORTED_SDK_VERSIONS = [54, 55, 56, 57, 58] as const;

export type SupportedSdkVersion = (typeof SUPPORTED_SDK_VERSIONS)[number];

export const MINIMUM_SDK_VERSION: SupportedSdkVersion = 54;

export const LATEST_SUPPORTED_SDK: SupportedSdkVersion = 58;

/**
 * Résoudre "latest" ou un nombre vers une version SDK numérique valide.
 * Retourne `LATEST_SUPPORTED_SDK` si la valeur est "latest" ou invalide.
 */
export function resolveSdkVersion(raw: string | number | undefined): SupportedSdkVersion {
  if (raw === "latest" || raw === undefined || raw === "") {
    return LATEST_SUPPORTED_SDK;
  }
  const num = Number(raw);
  if (
    Number.isInteger(num) &&
    (SUPPORTED_SDK_VERSIONS as readonly number[]).includes(num)
  ) {
    return num as SupportedSdkVersion;
  }
  // Valeur fournie mais non reconnue → fallback latest
  return LATEST_SUPPORTED_SDK;
}

/**
 * Detect package manager from lockfiles present in the project root.
 */
export function detectPackageManager(cwd: string = process.cwd()): PackageManager {
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun";
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

/**
 * Build the base install command to install all existing dependencies in package.json.
 *
 * - npm always uses `--legacy-peer-deps` to avoid infinite resolution loops caused by
 *   NativeWind v5 peer-dependency conflicts (react>=19, react-native>=0.81, etc.).
 *   `--force` is intentionally avoided: it blocks indefinitely on npm when peer deps
 *   cannot be resolved non-interactively.
 * - pnpm uses `--shamefully-hoist` for compatibility with Expo Metro's module resolution.
 * - yarn uses `--ignore-engines` to tolerate engine mismatches in Expo projects.
 */
export function buildProjectInstallCommand(
  pm: PackageManager,
  options: { legacyPeerDeps?: boolean } = {}
): string {
  switch (pm) {
    case "bun":
      return "bun install --force";
    case "pnpm":
      return "pnpm install --shamefully-hoist";
    case "yarn":
      return "yarn install --ignore-engines";
    case "npm":
    default:
      // --legacy-peer-deps resolves peer-dep conflicts without blocking —
      // required for Expo projects using NativeWind v5 (tailwindcss>=4.1.11,
      // react-native-css@3.1.0-rc.0 which requires react>=19 & react-native>=0.81).
      return options.legacyPeerDeps === false
        ? "npm install"
        : "npm install --legacy-peer-deps";
  }
}

/**
 * Build the install command string for regular npm packages.
 */
export function buildInstallCommand(
  pm: PackageManager,
  packages: string[]
): string {
  if (packages.length === 0) return "";
  const pkgList = packages.join(" ");
  switch (pm) {
    case "bun":
      return `bun add ${pkgList}`;
    case "pnpm":
      return `pnpm add ${pkgList}`;
    case "yarn":
      return `yarn add ${pkgList}`;
    case "npm":
      // --legacy-peer-deps avoids peer-dep resolution failures in Expo/NativeWind v5 projects
      return `npm install --legacy-peer-deps ${pkgList}`;
  }
}

/**
 * Build the expo install command for Expo-compatible packages.
 * Uses `expo install` which resolves correct versions for the current SDK.
 */
export function buildExpoInstallCommand(
  pm: PackageManager,
  packages: string[]
): string {
  if (packages.length === 0) return "";
  const pkgList = packages.join(" ");
  // expo install works with npx/bunx
  switch (pm) {
    case "bun":
      return `bunx expo install ${pkgList}`;
    case "pnpm":
      return `pnpm dlx expo install ${pkgList}`;
    case "yarn":
      return `yarn expo install ${pkgList}`;
    case "npm":
    default:
      return `npx expo install ${pkgList}`;
  }
}

/**
 * Build the `create-expo-app` bootstrap command for the given package manager and SDK version.
 *
 * - Always uses `--no-install` to avoid a first dependency installation before Rashwright takes over.
 * - Always uses `--no-agents-md` to skip the Expo agents MD prompt.
 * - Template is `blank-typescript@<sdkVersion>` (never "default" or "latest").
 */
export function buildCreateExpoAppCommand(
  pm: PackageManager,
  projectName: string,
  sdkVersion: number,
): string {
  const template = `blank-typescript@${sdkVersion}`;
  const flags = `--template ${template} --no-install --no-agents-md`;

  switch (pm) {
    case "bun":
      return `bunx create-expo-app@latest ${projectName} ${flags}`;
    case "pnpm":
      return `pnpm dlx create-expo-app@latest ${projectName} ${flags}`;
    case "yarn":
      return `yarn dlx create-expo-app@latest ${projectName} ${flags}`;
    case "npm":
    default:
      return `npx create-expo-app@latest ${projectName} ${flags}`;
  }
}

/**
 * Execute a shell command in the given directory.
 * Throws if the command fails.
 */
export function runCommand(command: string, cwd: string, dryRun = false): void {
  if (dryRun) {
    console.log(`  [dry-run] ${command}`);
    return;
  }
  execSync(command, { cwd, stdio: "inherit" });
}

/**
 * Install regular project dependencies already declared in package.json.
 */
export function installProjectDependencies(
  pm: PackageManager,
  cwd: string,
  dryRun = false
): void {
  const command = buildProjectInstallCommand(pm);
  runCommand(command, cwd, dryRun);
}

/**
 * Install npm packages in the project directory.
 */
export function installNpmPackages(
  packages: string[],
  pm: PackageManager,
  cwd: string,
  dryRun = false
): void {
  if (packages.length === 0) return;
  const command = buildInstallCommand(pm, packages);
  runCommand(command, cwd, dryRun);
}

/**
 * Install Expo packages using expo install (respects SDK compatibility).
 */
export function installExpoPackages(
  packages: string[],
  pm: PackageManager,
  cwd: string,
  dryRun = false
): void {
  if (packages.length === 0) return;
  const command = buildExpoInstallCommand(pm, packages);
  runCommand(command, cwd, dryRun);
}
