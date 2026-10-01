import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type PackageManager = "bun" | "pnpm" | "yarn" | "npm";

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
      return `npm install ${pkgList}`;
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
