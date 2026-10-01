import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ProjectInfo {
  root: string;
  hasPackageJson: boolean;
  isExpo: boolean;
  expoVersion: string | null;
  expoSdkVersion: number | null;
  reactNativeVersion: string | null;
  hasExpoRouter: boolean;
  hasTypeScript: boolean;
  packageManager: "bun" | "pnpm" | "yarn" | "npm";
  componentsPath: string;
  hasRashwrightConfig: boolean;
  rashwrightConfigPath: string;
}

export function detectProject(cwd: string = process.cwd()): ProjectInfo {
  const packageJsonPath = join(cwd, "package.json");
  const hasPackageJson = existsSync(packageJsonPath);

  if (!hasPackageJson) {
    return {
      root: cwd,
      hasPackageJson: false,
      isExpo: false,
      expoVersion: null,
      expoSdkVersion: null,
      reactNativeVersion: null,
      hasExpoRouter: false,
      hasTypeScript: false,
      packageManager: "npm",
      componentsPath: "components/ui",
      hasRashwrightConfig: false,
      rashwrightConfigPath: join(cwd, "rashwright-ui.json"),
    };
  }

  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const allDeps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  };

  // Detect Expo
  const isExpo = "expo" in allDeps;
  const expoVersion = allDeps["expo"] ?? null;

  // Resolve actual SDK number from node_modules
  let expoSdkVersion: number | null = null;
  try {
    const expoPackageJsonPath = join(cwd, "node_modules", "expo", "package.json");
    if (existsSync(expoPackageJsonPath)) {
      const expoPkg = JSON.parse(readFileSync(expoPackageJsonPath, "utf-8"));
      const versionStr: string = expoPkg.version ?? "";
      const major = parseInt(versionStr.split(".")[0] ?? "0", 10);
      if (!isNaN(major)) expoSdkVersion = major;
    }
  } catch {
    // fallback: try to parse from the version range in package.json
    if (expoVersion) {
      const match = String(expoVersion).match(/(\d+)/);
      if (match) expoSdkVersion = parseInt(match[1], 10);
    }
  }

  const reactNativeVersion = allDeps["react-native"] ?? null;
  const hasExpoRouter = "expo-router" in allDeps;
  const hasTypeScript = existsSync(join(cwd, "tsconfig.json"));

  // Detect package manager
  let packageManager: "bun" | "pnpm" | "yarn" | "npm" = "npm";
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) {
    packageManager = "bun";
  } else if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
    packageManager = "pnpm";
  } else if (existsSync(join(cwd, "yarn.lock"))) {
    packageManager = "yarn";
  }

  // Detect components path
  let componentsPath = "components/ui";
  if (existsSync(join(cwd, "src", "components", "ui"))) {
    componentsPath = "src/components/ui";
  } else if (existsSync(join(cwd, "app", "components", "ui"))) {
    componentsPath = "app/components/ui";
  }

  const rashwrightConfigPath = join(cwd, "rashwright-ui.json");
  const hasRashwrightConfig = existsSync(rashwrightConfigPath);

  return {
    root: cwd,
    hasPackageJson,
    isExpo,
    expoVersion,
    expoSdkVersion,
    reactNativeVersion,
    hasExpoRouter,
    hasTypeScript,
    packageManager,
    componentsPath,
    hasRashwrightConfig,
    rashwrightConfigPath,
  };
}
