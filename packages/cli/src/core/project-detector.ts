import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type InitMode = "new-project" | "existing-project";

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

/**
 * Détecte si le projet cible est un template standard officiel Expo / React Native par défaut
 * (généré par create-expo-app ou react-native init) qui contient les fichiers d'exemple par défaut
 * nécessitant un reset avant installation de Rashwright UI.
 */
export function isDefaultExpoTemplate(cwd: string = process.cwd()): boolean {
  // Si Rashwright UI est déjà configuré, ce n'est pas un template standard vierge
  if (existsSync(join(cwd, "rashwright-ui.json"))) {
    return false;
  }

  // 1. Script reset-project officiel fourni par le template par défaut d'Expo
  if (existsSync(join(cwd, "scripts", "reset-project.js"))) {
    return true;
  }

  // 2. Détection via package.json ("reset-project" script)
  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      if (pkg.scripts && ("reset-project" in pkg.scripts || pkg.scripts["reset-project"])) {
        return true;
      }
    } catch {
      /* ignore */
    }
  }

  // 3. Fichiers/dossiers signatures du template create-expo-app par défaut
  const templateMarkers = [
    join(cwd, "app", "(tabs)"),
    join(cwd, "src", "app", "(tabs)"),
    join(cwd, "components", "Collapsible.tsx"),
    join(cwd, "src", "components", "Collapsible.tsx"),
    join(cwd, "components", "ParallaxScrollView.tsx"),
    join(cwd, "src", "components", "ParallaxScrollView.tsx"),
    join(cwd, "components", "ThemedText.tsx"),
    join(cwd, "src", "components", "ThemedText.tsx"),
    join(cwd, "components", "ThemedView.tsx"),
    join(cwd, "src", "components", "ThemedView.tsx"),
    join(cwd, "components", "animated-icon.web.tsx"),
    join(cwd, "src", "components", "animated-icon.web.tsx"),
    join(cwd, "constants", "Colors.ts"),
    join(cwd, "src", "constants", "Colors.ts"),
    join(cwd, "hooks", "useColorScheme.ts"),
    join(cwd, "src", "hooks", "useColorScheme.ts"),
  ];

  return templateMarkers.some((marker) => existsSync(marker));
}

export function detectInitMode(cwd: string): InitMode {
  const project = detectProject(cwd);
  if (project.hasPackageJson && (project.isExpo || project.reactNativeVersion !== null)) {
    return "existing-project";
  }
  return "new-project";
}
