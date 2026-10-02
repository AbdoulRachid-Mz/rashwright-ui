import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { join, dirname, resolve, relative, basename } from "node:path";
import { execSync } from "node:child_process";
import { copyComponentFiles, writeFile } from "./file-manager.js";

/**
 * Copy Rashwright assets (RS logo PNG + SVG) into target project assets directory.
 */
export function copyRashwrightAssets(
  sourceRoot: string,
  targetProjectRoot: string,
  dryRun = false
): void {
  const assetsDir = join(targetProjectRoot, "assets");
  const svgDir = join(assetsDir, "svg");

  if (!dryRun) {
    if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });
    if (!existsSync(svgDir)) mkdirSync(svgDir, { recursive: true });
  }

  const primaryPngSrc = join(sourceRoot, "assets", "primary.png");
  const primaryPngDest = join(assetsDir, "primary.png");
  if (existsSync(primaryPngSrc) && !dryRun) {
    copyFileSync(primaryPngSrc, primaryPngDest);
  }

  const primarySvgSrc = join(sourceRoot, "assets", "svg", "primary.svg");
  const primarySvgDest = join(svgDir, "primary.svg");
  if (existsSync(primarySvgSrc) && !dryRun) {
    copyFileSync(primarySvgSrc, primarySvgDest);
  }
}

export type ExpoPackageManager = "bun" | "pnpm" | "yarn" | "npm";

export function createExpoProject(params: {
  targetDir: string;
  sdkVersion: string | number;
  packageManager: ExpoPackageManager;
  dryRun?: boolean;
}): void {
  const { targetDir, sdkVersion, packageManager, dryRun = false } = params;
  const dirName = basename(targetDir);
  const parentDir = dirname(targetDir);
  const runner = packageManager === "bun" ? "bunx" : "npx";

  const createCmd = `${runner} create-expo-app@latest ${dirName} --template default`;

  if (dryRun) {
    console.log(`  [dry-run] ${createCmd}`);
    console.log(`  [dry-run]   cwd: ${parentDir}`);
  } else {
    execSync(createCmd, { cwd: parentDir, stdio: "inherit" });
  }

  const sdkStr = String(sdkVersion);
  if (sdkStr.toLowerCase() === "latest") {
    return;
  }

  const sdkNum = parseInt(sdkStr, 10);
  if (isNaN(sdkNum) || sdkNum < 54 || sdkNum > 58) {
    return;
  }

  const pinCmd = `npx expo install expo@~${sdkNum}.0.0 -- --non-interactive`;

  if (dryRun) {
    console.log(`  [dry-run] ${pinCmd}`);
    console.log(`  [dry-run]   cwd: ${targetDir}`);
  } else {
    execSync(pinCmd, { cwd: targetDir, stdio: "inherit" });
  }
}

/**
 * ⚡ Objectif A.2 (errors.md) — resetExpoProject
 * Nettoie les fichiers d'exemple du template Expo create-expo-app (default) pour
 * laisser place à Rashwright. Cross-platform (fs.rmSync, pas de rm -rf).
 * NE TOUCHE PAS : package.json, app.json, tsconfig.json, babel.config.js (on les
 *   met à jour via updateTsconfig / writeBabelConfig plus loin), node_modules,
 *   .git, bun.lock, package-lock.json, yarn.lock.
 */
export function resetExpoProject(
  targetProjectRoot: string,
  dryRun = false,
): void {
  if (dryRun) return;

  /**
   * Helper safe-rm : supprime en récursif seulement si le chemin existe.
   * Cross-platform Win/macOS/Linux via Node fs.rmSync (pas d'invocation shell).
   */
  const safeRm = (rel: string, isDir = false): void => {
    const abs = join(targetProjectRoot, rel);
    if (!existsSync(abs)) return;
    try {
      rmSync(abs, { recursive: true, force: true, maxRetries: 2 });
    } catch (err) {
      // On ne plante pas init pour un échec de cleanup d'exemple.
      console.warn(`    ⚠ Impossible de nettoyer ${rel}:`, (err as Error).message);
    }
    void isDir;
  };

  // Pages & routeurs template Expo Router
  safeRm("app/index.tsx");
  safeRm("app/_layout.tsx");
  safeRm("app/(tabs)", true);
  safeRm("app/+html.tsx");
  safeRm("app/+not-found.tsx");

  // App template classique (non routeur)
  safeRm("App.tsx");
  safeRm("App.js");
  safeRm("App.jsx");

  // Dossiers exemples du template
  safeRm("components", true);
  safeRm("hooks", true);
  safeRm("constants", true);

  // Assets exemples (sauf collisions : assets/images/ logo template)
  safeRm("assets/images", true);
  safeRm("assets/images", true);
}

/**
 * ⚡ Objectif A.4 — writeBabelConfig
 * Garantit que babel.config.js existe ET inclut 'react-native-reanimated/plugin'
 * (requis par react-native-reanimated v3+). Préserve le preset babel-preset-expo
 * ou le plugin expo-router/babel s'ils étaient déjà là.
 */
export function writeBabelConfig(
  targetProjectRoot: string,
  dryRun = false,
): void {
  if (dryRun) return;
  const path = join(targetProjectRoot, "babel.config.js");

  let originalContent: string | null = null;
  let presets: string[] = ["babel-preset-expo"];
  let plugins: string[] = [];

  if (existsSync(path)) {
    originalContent = readFileSync(path, "utf-8");
    // Parser naive mais robuste pour template Expo default / Expo Router
    // Format attendu : module.exports = function (api) { api.cache(true); return { presets: [...], plugins: [...] }; }
    try {
      const presetsMatch = originalContent.match(/presets\s*:\s*\[([\s\S]*?)\]/);
      const pluginsMatch = originalContent.match(/plugins\s*:\s*\[([\s\S]*?)\]/);
      if (presetsMatch?.[1]) {
        presets = Array.from(
          new Set(
            presetsMatch[1]
              .split(",")
              .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
              .filter(Boolean),
          ),
        );
      }
      if (pluginsMatch?.[1]) {
        plugins = Array.from(
          new Set(
            pluginsMatch[1]
              .split(",")
              .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
              .filter(Boolean),
          ),
        );
      }
    } catch {
      // Si parse impossible, on gardera originalContent en fallback + append commentaire
    }
  }

  // Règle dure Expo : reanimated plugin doit être EN DERNIER dans la liste.
  plugins = plugins.filter((p) => p !== "react-native-reanimated/plugin");
  plugins.push("react-native-reanimated/plugin");

  // Si Expo Router était là, on garde son plugin
  if (originalContent && originalContent.includes("expo-router/babel") && !plugins.includes("expo-router/babel")) {
    plugins.unshift("expo-router/babel");
  }

  const content = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [${presets.map((p) => `"${p}"`).join(", ")}],
    plugins: [${plugins.map((p) => `"${p}"`).join(", ")}],
  };
};
`;

  writeFileSync(path, content, "utf-8");
}

/**
 * ⚡ Objectif A.4 — updateTsconfig
 * Lit/mets à jour tsconfig.json pour ajouter:
 *   - compilerOptions.jsx = "react-native" (si absent)
 *   - compilerOptions.paths."@/*" = ["./*"] pour résoudre les imports @/...
 *     (format standard Expo SDK 54+ avec tsconfig expo/tsconfig.base)
 * Crée un tsconfig minimal (extends: "expo/tsconfig.base") sinon.
 */
export function updateTsconfig(
  targetProjectRoot: string,
  dryRun = false,
): void {
  if (dryRun) return;

  const path = join(targetProjectRoot, "tsconfig.json");

  type TsConfig = {
    extends?: string;
    compilerOptions?: {
      strict?: boolean;
      jsx?: string;
      paths?: Record<string, string[]>;
      baseUrl?: string;
      [k: string]: unknown;
    };
    include?: string[];
    exclude?: string[];
    [k: string]: unknown;
  };

  let cfg: TsConfig = {};
  if (existsSync(path)) {
    try {
      cfg = JSON.parse(readFileSync(path, "utf-8")) as TsConfig;
    } catch (err) {
      throw new Error(`tsconfig.json invalide dans ${path}: ` + (err as Error).message);
    }
  } else {
    cfg = { extends: "expo/tsconfig.base", compilerOptions: { strict: true } };
  }

  if (!cfg.compilerOptions) cfg.compilerOptions = {};
  if (!cfg.compilerOptions.jsx || cfg.compilerOptions.jsx.toLowerCase() !== "react-native") {
    cfg.compilerOptions.jsx = "react-native";
  }
  if (!cfg.compilerOptions.paths || typeof cfg.compilerOptions.paths !== "object") {
    cfg.compilerOptions.paths = {};
  }
  if (!Array.isArray(cfg.compilerOptions.paths["@/*"]) || cfg.compilerOptions.paths["@/*"].length === 0) {
    cfg.compilerOptions.paths["@/*"] = ["./*"];
  }
  if (!cfg.include || !Array.isArray(cfg.include) || cfg.include.length === 0) {
    cfg.include = ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"];
  }

  writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
}

/**
 * ⚡ Objectif A.5 + A.3 — writeExpoRouterLayout + génération app/ index
 * Pour le template Expo Router (app/):
 *   - app/_layout.tsx: <ThemeProvider><Slot /></ThemeProvider>
 *   - app/index.tsx : <RashwrightShowcaseScreen />
 * Les imports utilisent systématiquement l'alias @/ (indépendant de componentsPath).
 */
export function writeExpoRouterLayout(
  targetProjectRoot: string,
  componentsPath: string = "components/ui",
  dryRun = false,
): void {
  if (dryRun) return;

  const appDir = join(targetProjectRoot, "app");
  if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });

  const normalize = (p: string): string => p.replace(/\\/g, "/").replace(/\/+/g, "/");
  const showcaseCompImportPath = `@/${normalize(componentsPath)}/showcase-screen`;

  const layoutContent = `import { Slot } from "expo-router";
import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";

export default function RootLayout() {
  return (
    <ThemeProvider initialMode="system" initialPreset="default">
      <Slot />
    </ThemeProvider>
  );
}
`;
  writeFileSync(join(appDir, "_layout.tsx"), layoutContent, "utf-8");

  const indexContent = `import React from "react";
import { RashwrightShowcaseScreen } from "${showcaseCompImportPath}";

export default function Index() {
  return <RashwrightShowcaseScreen />;
}
`;
  writeFileSync(join(appDir, "index.tsx"), indexContent, "utf-8");
}

/**
 * Setup foundational files (constants/theme, constants/glass-theme, stores/theme-store, contexts/theme-context)
 * and core UI primitives (text, view, liquid/*) + lib/upload in the target project.
 */
export function setupFoundations(
  sourceRoot: string,
  targetProjectRoot: string,
  componentsPath: string = "components/ui",
  dryRun = false
): void {
  if (dryRun) return;

  const filesToCopy: Array<{ src: string; dest: string }> = [
    { src: "constants/theme.ts", dest: "constants/theme.ts" },
    { src: "constants/glass-theme.ts", dest: "constants/glass-theme.ts" },
    { src: "stores/theme-store.ts", dest: "stores/theme-store.ts" },
    { src: "contexts/theme-context.tsx", dest: "contexts/theme-context.tsx" },
    { src: "contexts/tab-bar-context.tsx", dest: "contexts/tab-bar-context.tsx" },
    { src: "hooks/use-device.ts", dest: "hooks/use-device.ts" },
    { src: "hooks/useBackHandler.ts", dest: "hooks/useBackHandler.ts" },
    { src: "hooks/useScrollAwareTabBar.ts", dest: "hooks/useScrollAwareTabBar.ts" },
    { src: "theme/index.ts", dest: "theme/index.ts" },
    { src: "theme/tokens/colors.ts", dest: "theme/tokens/colors.ts" },
    { src: "theme/tokens/glass.ts", dest: "theme/tokens/glass.ts" },
    { src: "theme/tokens/radius.ts", dest: "theme/tokens/radius.ts" },
    { src: "theme/tokens/spacing.ts", dest: "theme/tokens/spacing.ts" },
    { src: "theme/tokens/typography.ts", dest: "theme/tokens/typography.ts" },
    { src: "theme/themes/default.ts", dest: "theme/themes/default.ts" },
    { src: "theme/themes/glass.ts", dest: "theme/themes/glass.ts" },
    { src: "theme/themes/emerald.ts", dest: "theme/themes/emerald.ts" },
    { src: "theme/themes/violet.ts", dest: "theme/themes/violet.ts" },
    { src: "theme/themes/amber.ts", dest: "theme/themes/amber.ts" },
    { src: "theme/themes/rose.ts", dest: "theme/themes/rose.ts" },
    { src: "theme/themes/slate.ts", dest: "theme/themes/slate.ts" },
  ];

  // Objectif C.2 + A.3 : inliner lib/upload/** dans le projet utilisateur aussi
  // (car upload-image.tsx / upload-video.tsx l'importent via ../../lib/upload).
  const libUploadSourceDir = join(sourceRoot, "lib", "upload");
  if (existsSync(libUploadSourceDir)) {
    const walkCopy = (dir: string): void => {
      const srcDir = join(libUploadSourceDir, dir);
      const destDir = join(targetProjectRoot, "lib", "upload", dir);
      if (!existsSync(srcDir)) return;
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
      const entries = readdirSync(srcDir, { withFileTypes: true });
      for (const e of entries) {
        const rel = join(dir, e.name);
        if (e.isDirectory()) {
          walkCopy(rel);
        } else if (e.isFile()) {
          filesToCopy.push({
            src: join("lib", "upload", rel).split("\\").join("/"),
            dest: join("lib", "upload", rel).split("\\").join("/"),
          });
        }
      }
    };
    walkCopy("");
  }

  for (const { src, dest } of filesToCopy) {
    const srcPath = join(sourceRoot, src);
    const destPath = join(targetProjectRoot, dest);
    if (existsSync(srcPath)) {
      const dir = dirname(destPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }

  setupCoreUi(sourceRoot, join(targetProjectRoot, componentsPath), dryRun);
}

/**
 * Core UI files required by any component using Liquid primitives or Themed Text/View.
 * Copied ONCE during init; never overwritten during add.
 */
const CORE_UI_FILES = [
  "components/ui/text.tsx",
  "components/ui/view.tsx",
  "components/ui/index.ts",
  "components/ui/liquid/liquid-types.ts",
  "components/ui/liquid/liquid-surface.tsx",
  "components/ui/liquid/liquid-pressable.tsx",
  "components/ui/liquid/liquid-highlight.tsx",
  "components/ui/liquid/liquid-border.tsx",
  "components/ui/liquid/liquid-glow.tsx",
  "components/ui/liquid/liquid-blob.tsx",
  "components/ui/liquid/liquid-shadow.ts",
];

export function setupCoreUi(
  sourceRoot: string,
  targetComponentsRoot: string,
  dryRun = false
): void {
  copyComponentFiles(CORE_UI_FILES, sourceRoot, targetComponentsRoot, {
    overwrite: false,
    dryRun,
  });
}

/**
 * Copy starter showcase components into target project components folder.
 */
export function setupStarterComponents(
  sourceRoot: string,
  targetComponentsRoot: string,
  dryRun = false
): string[] {
  const starterComponents = [
    "components/ui/button.tsx",
    "components/ui/card.tsx",
    "components/ui/glass-card.tsx",
    "components/ui/badge.tsx",
    "components/ui/text-input.tsx",
    "components/ui/upload-image.tsx",
    "components/ui/upload-video.tsx",
    "components/ui/rashwright-logo.tsx",
    "components/ui/showcase-screen.tsx",
  ];

  copyComponentFiles(starterComponents, sourceRoot, targetComponentsRoot, {
    overwrite: true,
    dryRun,
  });

  return [
    "button",
    "card",
    "glass-card",
    "badge",
    "text-input",
    "upload-image",
    "upload-video",
    "rashwright-logo",
    "showcase-screen",
  ];
}

/**
 * Generate demo showcase screen: utilise writeExpoRouterLayout pour Expo Router,
 * ou bien App.tsx classique (non routeur).
 * Retourne le chemin du fichier d'entrée principal généré.
 */
export function generateShowcaseScreen(
  targetProjectRoot: string,
  componentsPath: string,
  dryRun = false
): string | null {
  if (dryRun) return null;

  const hasExpoRouter = existsSync(join(targetProjectRoot, "app"));

  if (hasExpoRouter) {
    writeExpoRouterLayout(targetProjectRoot, componentsPath, dryRun);
    return join(targetProjectRoot, "app", "index.tsx");
  }

  // Mode classique : App.tsx (sans expo-router)
  const classicApp = join(targetProjectRoot, "App.tsx");
  const normalize = (p: string): string => p.replace(/\\/g, "/").replace(/\/+/g, "/");
  const showcaseRel = `@/${normalize(componentsPath)}/showcase-screen`;
  const content = `import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { RashwrightShowcaseScreen } from "${showcaseRel}";

export default function App() {
  return (
    <ThemeProvider initialMode="system" initialPreset="default">
      <RashwrightShowcaseScreen />
    </ThemeProvider>
  );
}
`;
  const dir = dirname(classicApp);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(classicApp, content, "utf-8");
  return classicApp;
}


