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
  const isLatest = sdkStr.toLowerCase() === "latest";
  const sdkNum = isLatest ? NaN : parseInt(sdkStr, 10);

  // ── C-3 : Validation post-create du SDK réel installé
  if (!dryRun) {
    try {
      const projectPkgPath = join(targetDir, "package.json");
      if (existsSync(projectPkgPath)) {
        const projectPkg = JSON.parse(readFileSync(projectPkgPath, "utf-8")) as {
          dependencies?: Record<string, string>;
        };
        const expoVersion = projectPkg.dependencies?.["expo"] ?? "";
        // Extraire numéro SDK depuis "~54.0.0" ou "54.0.0" ou "^54.1.0"
        const detectedSdk = parseInt(expoVersion.replace(/^[\^~>=\s]+/, ""), 10);
        const SUPPORTED = [54, 55, 56, 57, 58];
        if (!isNaN(detectedSdk) && !SUPPORTED.includes(detectedSdk)) {
          console.log(
            `  ⚠ SDK Expo détecté (${detectedSdk}) hors de la plage supportée (54→58). Certains composants peuvent ne pas fonctionner correctement.`
          );
        } else if (!isNaN(detectedSdk)) {
          console.log(`  ✔ SDK Expo ${detectedSdk} détecté — version supportée.`);
        }
      }
    } catch {
      // Non-bloquant : si on ne peut pas lire le package.json, on continue
    }
  }

  // Si un SDK spécifique (non-latest) est demandé, le pinner via expo install
  if (!isLatest && !isNaN(sdkNum) && sdkNum >= 54 && sdkNum <= 58) {
    const pinCmd = `npx expo install expo@~${sdkNum}.0.0 -- --non-interactive`;

    if (dryRun) {
      console.log(`  [dry-run] ${pinCmd}`);
      console.log(`  [dry-run]   cwd: ${targetDir}`);
    } else {
      execSync(pinCmd, { cwd: targetDir, stdio: "inherit" });
    }
  }
}


/**
 * ⚡ Objectif A.2 (errors.md) — resetExpoProject
 * Nettoie les fichiers et dossiers d'exemple du template Expo standard
 * (conforme aux spécifications de expo-rn-reset.js et architecture.md).
 * Cross-platform (fs.rmSync, pas de rm -rf).
 * Prépare la structure standardisée /src pour une isolation optimale.
 */
export function resetExpoProject(
  targetProjectRoot: string,
  dryRun = false,
): void {
  if (dryRun) return;

  const safeRm = (rel: string, isDir = false): void => {
    const abs = join(targetProjectRoot, rel);
    if (!existsSync(abs)) return;
    try {
      rmSync(abs, { recursive: true, force: true, maxRetries: 3 });
    } catch (err) {
      console.warn(`    ⚠ Impossible de nettoyer ${rel}:`, (err as Error).message);
    }
    void isDir;
  };

  // 1. Script reset-project natif Expo
  safeRm("scripts/reset-project.js");

  // 2. Pages & routeurs template Expo Router (racine et src/)
  //    Inclut les nouvelles pages du template 2025 : explore.tsx, +not-found.tsx, etc.
  safeRm("app/index.tsx");
  safeRm("app/_layout.tsx");
  safeRm("app/(tabs)", true);
  safeRm("app/+html.tsx");
  safeRm("app/+not-found.tsx");
  safeRm("app/explore.tsx");

  safeRm("src/app/index.tsx");
  safeRm("src/app/_layout.tsx");
  safeRm("src/app/(tabs)", true);
  safeRm("src/app/+html.tsx");
  safeRm("src/app/+not-found.tsx");
  safeRm("src/app/explore.tsx");       // ← page onglet "Explore" du template 2025

  // 3. App template classique (non routeur)
  safeRm("App.tsx");
  safeRm("App.js");
  safeRm("App.jsx");
  safeRm("src/App.tsx");
  safeRm("src/App.js");
  safeRm("src/App.jsx");

  // 4. Composants template Expo à la racine components/
  safeRm("components", true);

  // 5. Composants template Expo dans src/components/ — liste exhaustive du template 2025
  //    Ces fichiers importent Colors/Spacing/Fonts/ThemeColor depuis @/constants/theme
  //    qui n'existent PAS dans Rashwright → erreurs TS après init si non supprimés
  safeRm("src/components/Collapsible.tsx");
  safeRm("src/components/ExternalLink.tsx");
  safeRm("src/components/HelloWave.tsx");
  safeRm("src/components/ParallaxScrollView.tsx");
  safeRm("src/components/ThemedText.tsx");
  safeRm("src/components/ThemedView.tsx");
  safeRm("src/components/animated-icon.web.tsx");
  safeRm("src/components/animated-icon.module.css");
  safeRm("src/components/navigation", true);
  // Nouveaux fichiers du template 2025 (app-tabs, web-badge, hint-row, themed-*)
  safeRm("src/components/app-tabs.tsx");
  safeRm("src/components/app-tabs.web.tsx");
  safeRm("src/components/hint-row.tsx");
  safeRm("src/components/themed-text.tsx");
  safeRm("src/components/themed-view.tsx");
  safeRm("src/components/web-badge.tsx");
  // Nettoyage complet préventif de tous les composants d'exemple dans src/components SAUF ui
  const srcComponentsDir = join(targetProjectRoot, "src", "components");
  if (existsSync(srcComponentsDir)) {
    try {
      const entries = readdirSync(srcComponentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name !== "ui") {
          rmSync(join(srcComponentsDir, entry.name), { recursive: true, force: true });
        }
      }
    } catch {
      /* ignore */
    }
  }

  // 6. Hooks template Expo
  safeRm("hooks/useColorScheme.ts");
  safeRm("hooks/useThemeColor.ts");
  safeRm("src/hooks/useColorScheme.ts");
  safeRm("src/hooks/useThemeColor.ts");
  safeRm("src/hooks/use-theme.ts");    // ← nouveau hook du template 2025

  // 7. Constants template Expo
  safeRm("constants/Colors.ts");
  safeRm("src/constants/Colors.ts");

  // 5. Assets template exemple
  safeRm("assets/images/react-logo.png");
  safeRm("assets/images/partial-react-logo.png");

  // 6. Supprimer le script "reset-project" de package.json s'il existe
  const pkgPath = join(targetProjectRoot, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      if (pkg.scripts && "reset-project" in pkg.scripts) {
        delete pkg.scripts["reset-project"];
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
      }
    } catch {
      /* ignore */
    }
  }

  // 7. Initialiser l'arborescence standardisée /src définie dans architecture.md
  const standardDirs = [
    "src/app",
    "src/components/ui",
    "src/constants",
    "src/contexts",
    "src/hooks",
    "src/stores",
    "src/theme",
    "src/lib/upload",
  ];
  for (const dir of standardDirs) {
    const fullDir = join(targetProjectRoot, dir);
    if (!existsSync(fullDir)) {
      mkdirSync(fullDir, { recursive: true });
    }
  }
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
      // Fallback
    }
  }

  // Règle dure Expo : reanimated plugin doit être EN DERNIER dans la liste.
  plugins = plugins.filter((p) => p !== "react-native-reanimated/plugin");
  plugins.push("react-native-reanimated/plugin");

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
 * Lit/met à jour tsconfig.json pour ajouter:
 *   - compilerOptions.jsx = "react-native" (si absent)
 *   - compilerOptions.paths."@/*" = ["./src/*", "./*"] pour résoudre les imports @/...
 *   - compilerOptions.ignoreDeprecations = "6.0" pour supprimer le warning baseUrl TS7
 *
 * NOTE: baseUrl est déprécié en TypeScript 7+. On utilise paths seuls avec rootDirs
 * pour la résolution d'alias, sans baseUrl.
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
      ignoreDeprecations?: string;
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
    } catch {
      cfg = { extends: "expo/tsconfig.base", compilerOptions: { strict: true } };
    }
  } else {
    cfg = { extends: "expo/tsconfig.base", compilerOptions: { strict: true } };
  }

  if (!cfg.compilerOptions) cfg.compilerOptions = {};
  cfg.compilerOptions.jsx = "react-native";
  cfg.compilerOptions.baseUrl = ".";

  // Silencer le warning TS5101 pour TypeScript (baseUrl sans paths ou transition TS)
  cfg.compilerOptions.ignoreDeprecations = "5.0";

  if (!cfg.compilerOptions.paths || typeof cfg.compilerOptions.paths !== "object") {
    cfg.compilerOptions.paths = {};
  }
  // Alias robuste : résout @/... vers src/ en priorité, puis racine
  cfg.compilerOptions.paths["@/*"] = ["./src/*", "./*"];

  if (!cfg.include || !Array.isArray(cfg.include) || cfg.include.length === 0) {
    cfg.include = ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"];
  }

  writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
}


/**
 * Table des déclarations d'export individuelles pour chaque composant UI Rashwright.
 * Permet de générer dynamiquement index.ts en n'exportant que les composants installés.
 */
export const COMPONENT_EXPORTS_MAP: Record<string, string> = {
  "actions-grid": 'export { ActionsGrid } from "./actions-grid";',
  "activity-indicator": 'export { default as ActivityIndicator } from "./activity-indicator";',
  alert: 'export { Alert } from "./alert";',
  avatar: 'export { default as Avatar } from "./avatar";',
  "avatar-group": 'export { default as AvatarGroup } from "./avatar-group";',
  badge: 'export { default as Badge } from "./badge";',
  "bottom-sheet": 'export { default as BottomSheet } from "./bottom-sheet";',
  button: 'export { default as Button } from "./button";',
  card: 'export { default as Card } from "./card";',
  carousel: 'export { Carousel } from "./carousel";',
  checkbox: 'export { default as Checkbox } from "./checkbox";',
  chip: 'export { default as Chip } from "./chip";',
  confirm: 'export { ConfirmProvider, useConfirm } from "./confirm";',
  divider: 'export { default as Divider } from "./divider";',
  dot: 'export { default as Dot } from "./dot";',
  drawer: 'export { default as Drawer } from "./drawer";',
  "dropdown-menu": 'export { default as DropdownMenu } from "./dropdown-menu";',
  "empty-state": 'export { default as EmptyState } from "./empty-state";',
  "error-state": 'export { default as ErrorState } from "./error-state";',
  "fab-menu": 'export { default as FabMenu } from "./fab-menu";',
  "flat-list": 'export { default as FlatList } from "./flat-list";',
  "floating-action-button": 'export { default as FloatingActionButton } from "./floating-action-button";',
  "glass-card": 'export { default as GlassCard } from "./glass-card";',
  icon: 'export { default as Icon } from "./icon";',
  "icon-button": 'export { default as IconButton } from "./icon-button";',
  image: 'export { default as Image } from "./image";',
  "keyboard-avoiding-view": 'export { default as KeyboardAvoidingView } from "./keyboard-avoiding-view";',
  "loading-state": 'export { default as LoadingState } from "./loading-state";',
  modal: 'export { default as Modal } from "./modal";',
  particles: 'export { Particles } from "./particles";',
  popup: 'export { default as Popup } from "./popup";',
  progress: 'export { default as Progress } from "./progress";',
  radio: 'export { Radio, RadioGroup } from "./radio";',
  "rashwright-logo": 'export { RashwrightLogo } from "./rashwright-logo";',
  "safe-area-view": 'export { default as SafeAreaView } from "./safe-area-view";',
  "screen-skeleton": 'export { ScreenSkeleton, DashboardSkeleton } from "./screen-skeleton";',
  "scroll-view": 'export { default as ScrollView } from "./scroll-view";',
  "search-input": 'export { default as SearchInput } from "./search-input";',
  "section-list": 'export { default as SectionList } from "./section-list";',
  "segmented-control": 'export { default as SegmentedControl } from "./segmented-control";',
  select: 'export { default as Select } from "./select";',
  shimmer: 'export { default as Shimmer } from "./shimmer";',
  "showcase-screen": 'export { RashwrightShowcaseScreen } from "./showcase-screen";',
  skeleton: 'export { Skeleton, SkeletonCircle, SkeletonText, SkeletonCard } from "./skeleton";',
  slider: 'export { default as Slider } from "./slider";',
  spacer: 'export { default as Spacer } from "./spacer";',
  "stat-card": 'export { default as StatCard } from "./stat-card";',
  switch: 'export { default as Switch } from "./switch";',
  tabs: 'export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";',
  "text-input": 'export { default as TextInput } from "./text-input";',
  "time-picker": 'export { TimePicker } from "./time-picker";',
  tooltip: 'export { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";',
  "upload-image": 'export { UploadImage } from "./upload-image";',
  "upload-video": 'export { UploadVideo } from "./upload-video";',
  video: 'export { default as Video } from "./video";',
  // ── Phase 2 — Nouveaux composants v0.2.0 ───────────────────────────────────
  accordion: 'export { Accordion } from "./accordion";',
  collapsible: 'export { Collapsible } from "./collapsible";',
  "data-table": 'export { DataTable } from "./data-table";',
  form: 'export { Form, FormField, FormLabel, FormMessage, FormDescription, useFormField } from "./form";',
  "otp-input": 'export { OtpInput } from "./otp-input";',
  rating: 'export { Rating } from "./rating";',
};

/**
 * ⚡ Point 4 — Génération dynamique de components/ui/index.ts
 * Ne référence et n'exporte QUE les composants effectivement installés dans le projet.
 */
export function generateUiIndex(
  targetComponentsRoot: string,
  installedComponents: string[],
  dryRun = false,
): void {
  if (dryRun) return;

  const lines = [
    '// @/components/ui/index.ts',
    '//',
    '// Barrel d\'exportation dynamique Rashwright UI Mobile.',
    '// Exporte les primitives Liquid Glass, les vues de base et uniquement les composants installés.',
    '',
    '// ---------------------------------------------------------------------------',
    '// 1. Primitives Liquid Glass',
    '// ---------------------------------------------------------------------------',
    'export { default as LiquidSurface } from "./liquid/liquid-surface";',
    'export { default as LiquidPressable } from "./liquid/liquid-pressable";',
    'export { default as LiquidHighlight } from "./liquid/liquid-highlight";',
    'export { default as LiquidBorder } from "./liquid/liquid-border";',
    'export { default as LiquidGlow } from "./liquid/liquid-glow";',
    'export { default as LiquidBlob } from "./liquid/liquid-blob";',
    'export { getLiquidShadow, mergeShadows } from "./liquid/liquid-shadow";',
    'export * from "./liquid/liquid-types";',
    '',
    '// ---------------------------------------------------------------------------',
    '// 2. Vues Thématiques de Base',
    '// ---------------------------------------------------------------------------',
    'export { default as ThemedView } from "./view";',
    'export { default as ThemedText } from "./text";',
    'export { createGlassTheme } from "@/constants/glass-theme";',
    '',
    '// ---------------------------------------------------------------------------',
    '// 3. Composants Installés',
    '// ---------------------------------------------------------------------------',
  ];

  const uniqueInstalled = Array.from(new Set(installedComponents)).sort();
  for (const name of uniqueInstalled) {
    const exportStatement = COMPONENT_EXPORTS_MAP[name];
    if (exportStatement) {
      lines.push(exportStatement);
    }
  }

  lines.push("");
  const content = lines.join("\n");
  const targetFile = join(targetComponentsRoot, "index.ts");
  const dir = dirname(targetFile);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(targetFile, content, "utf-8");
}

/**
 * ⚡ Objectif A.5 + A.3 — writeExpoRouterLayout + génération app/ index
 * Pour le template Expo Router (app/ ou src/app/):
 *   - _layout.tsx: <ThemeProvider><Slot /></ThemeProvider>
 *   - index.tsx : <RashwrightShowcaseScreen />
 */
export interface CustomThemeColors {
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accentLight?: string;
  accentDark?: string;
  backgroundLight?: string;
  backgroundDark?: string;
  cardLight?: string;
  cardDark?: string;
}

/**
 * ⚡ Génération dynamique d'un thème personnalisé theme/themes/custom.ts
 */
export function generateCustomTheme(
  targetProjectRoot: string,
  componentsPath: string = "src/components/ui",
  colors: CustomThemeColors,
  dryRun = false,
): void {
  if (dryRun) return;

  const useSrc = componentsPath.startsWith("src/") || existsSync(join(targetProjectRoot, "src"));
  const themeDir = join(targetProjectRoot, useSrc ? "src/theme/themes" : "theme/themes");
  if (!existsSync(themeDir)) mkdirSync(themeDir, { recursive: true });

  const customThemeContent = `import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const customLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "${colors.primaryLight}",
    primaryForeground: "#FFFFFF",
    secondary: "${colors.secondaryLight}",
    secondaryForeground: "${colors.primaryLight}",
    accent: "${colors.accentLight || colors.primaryLight}",
    accentForeground: "#FFFFFF",
    ring: "${colors.primaryLight}",
    background: "${colors.backgroundLight || "#F8FAFC"}",
    card: "${colors.cardLight || "#FFFFFF"}",
  },
};

export const customDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "${colors.primaryDark}",
    primaryForeground: "#FFFFFF",
    secondary: "${colors.secondaryDark}",
    secondaryForeground: "${colors.primaryDark}",
    accent: "${colors.accentDark || colors.primaryDark}",
    accentForeground: "#FFFFFF",
    ring: "${colors.primaryDark}",
    background: "${colors.backgroundDark || "#0F172A"}",
    card: "${colors.cardDark || "#1E293B"}",
  },
};
`;

  writeFileSync(join(themeDir, "custom.ts"), customThemeContent, "utf-8");

  // Inscription dans default.ts du projet cible si présent
  const defaultTsPath = join(themeDir, "default.ts");
  if (existsSync(defaultTsPath)) {
    let defaultContent = readFileSync(defaultTsPath, "utf-8");
    if (!defaultContent.includes('import { customLight, customDark } from "./custom";')) {
      defaultContent = `import { customLight, customDark } from "./custom";\n` + defaultContent;
      const presetInsert = `  custom: {\n    name: "custom",\n    label: "Custom Theme",\n    light: customLight,\n    dark: customDark,\n  },\n`;
      defaultContent = defaultContent.replace(/export const THEME_PRESETS[^{]*{/, (match) => match + "\n" + presetInsert);
      writeFileSync(defaultTsPath, defaultContent, "utf-8");
    }
  }

  // Export dans theme/index.ts si présent
  const themeIndexDir = join(targetProjectRoot, useSrc ? "src/theme" : "theme");
  const themeIndexPath = join(themeIndexDir, "index.ts");
  if (existsSync(themeIndexPath)) {
    const themeIndexContent = readFileSync(themeIndexPath, "utf-8");
    if (!themeIndexContent.includes('"./themes/custom"')) {
      writeFileSync(themeIndexPath, themeIndexContent + `export * from "./themes/custom";\n`, "utf-8");
    }
  }
}

/**
 * ⚡ Objectif A.5 + A.3 — writeExpoRouterLayout + génération app/ index
 * Pour le template Expo Router (app/ ou src/app/):
 *   - _layout.tsx: <ThemeProvider initialPreset={preset}><Slot /></ThemeProvider>
 *   - index.tsx : <RashwrightShowcaseScreen />
 */
export function writeExpoRouterLayout(
  targetProjectRoot: string,
  componentsPath: string = "src/components/ui",
  themePreset: string = "default",
  dryRun = false,
): void {
  if (dryRun) return;

  const useSrc = componentsPath.startsWith("src/") || existsSync(join(targetProjectRoot, "src"));
  const appDir = join(targetProjectRoot, useSrc ? "src/app" : "app");
  if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });

  const cleanComponentsPath = componentsPath.replace(/^src\//, "");
  const showcaseCompImportPath = `@/${cleanComponentsPath}/showcase-screen`;

  const layoutContent = `import { Slot } from "expo-router";
import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";

export default function RootLayout() {
  return (
    <ThemeProvider initialMode="system" initialPreset="${themePreset as any}">
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
 * Setup foundational files (constants, stores, contexts, hooks, theme, lib/upload)
 * and core UI primitives (text, view, liquid/*) in the target project.
 * Conforme à architecture.md : si src/ est utilisé, installe dans src/.
 */
export function setupFoundations(
  sourceRoot: string,
  targetProjectRoot: string,
  componentsPath: string = "src/components/ui",
  dryRun = false,
): void {
  if (dryRun) return;

  const useSrc = componentsPath.startsWith("src/") || existsSync(join(targetProjectRoot, "src"));
  const basePrefix = useSrc ? "src" : "";

  const filesToCopy: Array<{ src: string; dest: string }> = [
    { src: "constants/theme.ts", dest: join(basePrefix, "constants/theme.ts").replace(/\\/g, "/") },
    { src: "constants/glass-theme.ts", dest: join(basePrefix, "constants/glass-theme.ts").replace(/\\/g, "/") },
    { src: "stores/theme-store.ts", dest: join(basePrefix, "stores/theme-store.ts").replace(/\\/g, "/") },
    { src: "contexts/theme-context.tsx", dest: join(basePrefix, "contexts/theme-context.tsx").replace(/\\/g, "/") },
    { src: "contexts/tab-bar-context.tsx", dest: join(basePrefix, "contexts/tab-bar-context.tsx").replace(/\\/g, "/") },
    { src: "hooks/use-device.ts", dest: join(basePrefix, "hooks/use-device.ts").replace(/\\/g, "/") },
    { src: "hooks/useBackHandler.ts", dest: join(basePrefix, "hooks/useBackHandler.ts").replace(/\\/g, "/") },
    { src: "hooks/useScrollAwareTabBar.ts", dest: join(basePrefix, "hooks/useScrollAwareTabBar.ts").replace(/\\/g, "/") },
    { src: "theme/index.ts", dest: join(basePrefix, "theme/index.ts").replace(/\\/g, "/") },
    { src: "theme/tokens/colors.ts", dest: join(basePrefix, "theme/tokens/colors.ts").replace(/\\/g, "/") },
    { src: "theme/tokens/glass.ts", dest: join(basePrefix, "theme/tokens/glass.ts").replace(/\\/g, "/") },
    { src: "theme/tokens/radius.ts", dest: join(basePrefix, "theme/tokens/radius.ts").replace(/\\/g, "/") },
    { src: "theme/tokens/spacing.ts", dest: join(basePrefix, "theme/tokens/spacing.ts").replace(/\\/g, "/") },
    { src: "theme/tokens/typography.ts", dest: join(basePrefix, "theme/tokens/typography.ts").replace(/\\/g, "/") },
    { src: "theme/themes/default.ts", dest: join(basePrefix, "theme/themes/default.ts").replace(/\\/g, "/") },
    { src: "theme/themes/glass.ts", dest: join(basePrefix, "theme/themes/glass.ts").replace(/\\/g, "/") },
    { src: "theme/themes/emerald.ts", dest: join(basePrefix, "theme/themes/emerald.ts").replace(/\\/g, "/") },
    { src: "theme/themes/violet.ts", dest: join(basePrefix, "theme/themes/violet.ts").replace(/\\/g, "/") },
    { src: "theme/themes/amber.ts", dest: join(basePrefix, "theme/themes/amber.ts").replace(/\\/g, "/") },
    { src: "theme/themes/rose.ts", dest: join(basePrefix, "theme/themes/rose.ts").replace(/\\/g, "/") },
    { src: "theme/themes/slate.ts", dest: join(basePrefix, "theme/themes/slate.ts").replace(/\\/g, "/") },
    { src: "theme/themes/green.ts", dest: join(basePrefix, "theme/themes/green.ts").replace(/\\/g, "/") },
    { src: "theme/themes/red.ts", dest: join(basePrefix, "theme/themes/red.ts").replace(/\\/g, "/") },
    { src: "theme/themes/cyan.ts", dest: join(basePrefix, "theme/themes/cyan.ts").replace(/\\/g, "/") },
  ];

  // Copier lib/upload dans le dossier cible
  const libUploadSourceDir = join(sourceRoot, "lib", "upload");
  const uploadDestRel = join(basePrefix, "lib", "upload").replace(/\\/g, "/");
  if (existsSync(libUploadSourceDir)) {
    const walkCopy = (dir: string): void => {
      const srcDir = join(libUploadSourceDir, dir);
      if (!existsSync(srcDir)) return;
      const entries = readdirSync(srcDir, { withFileTypes: true });
      for (const e of entries) {
        const rel = join(dir, e.name);
        if (e.isDirectory()) {
          walkCopy(rel);
        } else if (e.isFile()) {
          filesToCopy.push({
            src: join("lib", "upload", rel).replace(/\\/g, "/"),
            dest: join(uploadDestRel, rel).replace(/\\/g, "/"),
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
  dryRun = false,
): void {
  copyComponentFiles(CORE_UI_FILES, sourceRoot, targetComponentsRoot, {
    overwrite: false,
    dryRun,
  });
  // Initialise un index.ts propre (primitives + ThemedView/Text)
  generateUiIndex(targetComponentsRoot, [], dryRun);
}

/**
 * Copy starter showcase components into target project components folder.
 * Génère automatiquement index.ts avec les exports des composants installés.
 */
export function setupStarterComponents(
  sourceRoot: string,
  targetComponentsRoot: string,
  dryRun = false,
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

  const installed = [
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

  // Met à jour components/ui/index.ts avec les starters effectivement installés
  generateUiIndex(targetComponentsRoot, installed, dryRun);

  return installed;
}

/**
 * Generate demo showcase screen: utilise writeExpoRouterLayout pour Expo Router,
 * ou bien App.tsx classique (non routeur).
 * Retourne le chemin du fichier d'entrée principal généré.
 */
export function generateShowcaseScreen(
  targetProjectRoot: string,
  componentsPath: string,
  themePreset: string = "default",
  dryRun = false,
): string | null {
  if (dryRun) return null;

  const hasExpoRouter =
    existsSync(join(targetProjectRoot, "src", "app")) ||
    existsSync(join(targetProjectRoot, "app"));

  if (hasExpoRouter) {
    writeExpoRouterLayout(targetProjectRoot, componentsPath, themePreset, dryRun);
    const useSrc = componentsPath.startsWith("src/") || existsSync(join(targetProjectRoot, "src"));
    return join(targetProjectRoot, useSrc ? "src/app" : "app", "index.tsx");
  }

  // Mode classique : App.tsx (sans expo-router)
  const classicApp = join(targetProjectRoot, "App.tsx");
  const cleanComponentsPath = componentsPath.replace(/^src\//, "");
  const showcaseRel = `@/${cleanComponentsPath}/showcase-screen`;
  const content = `import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { RashwrightShowcaseScreen } from "${showcaseRel}";

export default function App() {
  return (
    <ThemeProvider initialMode="system" initialPreset="${themePreset as any}">
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


