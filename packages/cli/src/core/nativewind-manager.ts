// packages/cli/src/core/nativewind-manager.ts
// Note: Génère des configurations CommonJS (metro/tailwind) compatibles avec createRequire()
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageManager } from "./package-manager.js";

export type NativeWindVersion = "v4" | "v5";

export interface NativeWindConfig {
  enabled: boolean;
  version: NativeWindVersion;
  cssPath: string;
}

export interface NativeWindPackages {
  runtimeDeps: string[];
  devDeps: string[];
  expoDeps: string[];
}

/**
 * Retourne les dépendances exactes requises pour chaque version de NativeWind.
 */
export function getNativeWindPackages(version: NativeWindVersion): NativeWindPackages {
  if (version === "v5") {
    return {
      runtimeDeps: ["nativewind@5.0.0-rc.0", "react-native-css@3.1.0-rc.0"],
      devDeps: [
        "tailwindcss@4.1.12",
        "@tailwindcss/postcss@4.1.12",
        "postcss",
        "lightningcss@1.30.1",
      ],
      expoDeps: [
        "react-native-reanimated",
        "react-native-worklets",
        "react-native-safe-area-context",
        "expo-system-ui",
      ],
    };
  }

  // Version v4 stable
  return {
    runtimeDeps: ["nativewind@4.2.7"],
    devDeps: ["tailwindcss@^3.4.17"],
    expoDeps: ["react-native-reanimated", "react-native-safe-area-context"],
  };
}

/**
 * Retourne le contenu de global.css selon la version de NativeWind.
 */
export function generateGlobalCss(version: NativeWindVersion): string {
  if (version === "v5") {
    return `/* global.css — NativeWind v5 (Tailwind CSS v4 Next-Gen) */
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";
`;
  }

  // Version v4
  return `/* global.css — NativeWind v4 (Tailwind CSS v3.4) */
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

/**
 * Retourne le contenu de tailwind.config.js (requis uniquement pour v4).
 */
export function generateTailwindConfig(version: NativeWindVersion, useSrc: boolean): string {
  const contentPattern = useSrc
    ? `["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"]`
    : `["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]`;

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ${contentPattern},
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
}

/**
 * Retourne le contenu de postcss.config.mjs (requis pour v5).
 */
export function generatePostcssConfig(): string {
  return `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`;
}

/**
 * Retourne le contenu de metro.config.js configuré pour NativeWind.
 * v4 utilise withNativeWind(config, { input })
 * v5 utilise withNativewind(config)
 */
export function generateMetroConfig(version: NativeWindVersion, inputCss: string): string {
  if (version === "v5") {
    return `const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
`;
  }

  return `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./${inputCss}" });
`;
}

/**
 * Retourne le contenu de babel.config.js pour NativeWind.
 * v4 nécessite le preset nativewind/babel et jsxImportSource
 * v5 utilise le preset standard babel-preset-expo
 */
export function generateBabelConfig(version: NativeWindVersion): string {
  if (version === "v5") {
    return `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
`;
  }

  return `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
`;
}

/**
 * Déclaration de types TypeScript pour NativeWind.
 */
export function generateNativeWindEnv(version: NativeWindVersion): string {
  if (version === "v5") {
    return `/// <reference types="react-native-css/types" />
declare module "*.css";
`;
  }

  return `/// <reference types="nativewind/types" />
declare module "*.css";
`;
}

/**
 * Configure les overrides lightningcss dans package.json pour NativeWind v5.
 */
export function configurePackageJsonOverrides(
  projectRoot: string,
  pm: PackageManager,
  dryRun = false
): void {
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath) || dryRun) return;

  try {
    const raw = readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as Record<string, unknown>;

    if (pm === "yarn") {
      pkg.resolutions = {
        ...((pkg.resolutions as Record<string, string>) || {}),
        lightningcss: "1.30.1",
      };
    } else if (pm === "pnpm") {
      const pnpmSection = (pkg.pnpm as Record<string, unknown>) || {};
      pnpmSection.overrides = {
        ...((pnpmSection.overrides as Record<string, string>) || {}),
        lightningcss: "1.30.1",
      };
      pkg.pnpm = pnpmSection;
    } else {
      // npm et bun
      pkg.overrides = {
        ...((pkg.overrides as Record<string, string>) || {}),
        lightningcss: "1.30.1",
      };
    }

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  } catch {
    // Non-bloquant
  }
}

/**
 * Met à jour app.json pour NativeWind (web bundler metro + userInterfaceStyle automatic).
 */
export function updateAppJsonForNativeWind(
  projectRoot: string,
  version: NativeWindVersion,
  dryRun = false
): void {
  const appJsonPath = join(projectRoot, "app.json");
  if (!existsSync(appJsonPath) || dryRun) return;

  try {
    const raw = readFileSync(appJsonPath, "utf-8");
    const parsed = JSON.parse(raw) as { expo?: Record<string, unknown> };
    if (!parsed.expo) parsed.expo = {};

    // 1. Web bundler = metro
    const web = (parsed.expo.web as Record<string, unknown>) || {};
    web.bundler = "metro";
    parsed.expo.web = web;

    // 2. Pour NativeWind et gestion système : userInterfaceStyle automatic + plugin expo-system-ui
    parsed.expo.userInterfaceStyle = "automatic";
    const plugins = (parsed.expo.plugins as string[]) || [];
    if (!plugins.includes("expo-system-ui")) {
      plugins.push("expo-system-ui");
    }
    parsed.expo.plugins = plugins;

    writeFileSync(appJsonPath, JSON.stringify(parsed, null, 2) + "\n", "utf-8");
  } catch {
    // Non-bloquant
  }
}

/**
 * Injecte l'import de global.css au sommet des fichiers d'entrée (App.tsx ou _layout.tsx).
 */
export function injectGlobalCssImport(
  projectRoot: string,
  cssRelative: string = "global.css",
  dryRun = false
): boolean {
  if (dryRun) return false;

  let injected = false;

  // Candidates pour Expo Router
  const routerLayouts = [
    {
      file: join(projectRoot, "src/app/_layout.tsx"),
      importStatement: cssRelative.startsWith("src/")
        ? 'import "../global.css";'
        : 'import "../../global.css";',
    },
    {
      file: join(projectRoot, "app/_layout.tsx"),
      importStatement: cssRelative.startsWith("src/")
        ? 'import "../src/global.css";'
        : 'import "./global.css";',
    },
  ];

  for (const { file, importStatement } of routerLayouts) {
    if (existsSync(file)) {
      const content = readFileSync(file, "utf-8");
      if (!content.includes("global.css")) {
        writeFileSync(file, `${importStatement}\n${content}`, "utf-8");
        injected = true;
      }
    }
  }

  // Candidates pour App classique
  const classicApps = [
    {
      file: join(projectRoot, "App.tsx"),
      importStatement: `import "./${cssRelative}";`,
    },
    {
      file: join(projectRoot, "App.jsx"),
      importStatement: `import "./${cssRelative}";`,
    },
    {
      file: join(projectRoot, "App.js"),
      importStatement: `import "./${cssRelative}";`,
    },
    {
      file: join(projectRoot, "src/App.tsx"),
      importStatement: cssRelative.startsWith("src/")
        ? 'import "./global.css";'
        : 'import "../global.css";',
    },
  ];

  for (const { file, importStatement } of classicApps) {
    if (existsSync(file)) {
      const content = readFileSync(file, "utf-8");
      if (!content.includes("global.css")) {
        writeFileSync(file, `${importStatement}\n${content}`, "utf-8");
        injected = true;
      }
    }
  }

  return injected;
}

/**
 * Configure NativeWind (v4 ou v5) dans un projet cible.
 */
export function setupNativeWind(
  projectRoot: string,
  version: NativeWindVersion,
  pm: PackageManager,
  options: { dryRun?: boolean; useSrc?: boolean } = {}
): {
  packagesToInstall: string[];
  devPackagesToInstall: string[];
  expoPackagesToInstall: string[];
  generatedFiles: string[];
} {
  const useSrc = options.useSrc ?? existsSync(join(projectRoot, "src"));
  const cssRelative = useSrc ? "src/global.css" : "global.css";
  const generatedFiles: string[] = [];

  const pkgs = getNativeWindPackages(version);

  if (options.dryRun) {
    return {
      packagesToInstall: pkgs.runtimeDeps,
      devPackagesToInstall: pkgs.devDeps,
      expoPackagesToInstall: pkgs.expoDeps,
      generatedFiles,
    };
  }

  // 1. Écrire global.css
  const globalCssPath = join(projectRoot, cssRelative);
  writeFileSync(globalCssPath, generateGlobalCss(version), "utf-8");
  generatedFiles.push(cssRelative);

  // 2. Écrire tailwind.config.js (requis pour v4)
  if (version === "v4") {
    const tailwindConfigPath = join(projectRoot, "tailwind.config.js");
    writeFileSync(tailwindConfigPath, generateTailwindConfig("v4", useSrc), "utf-8");
    generatedFiles.push("tailwind.config.js");
  }

  // 3. Écrire postcss.config.mjs (requis pour v5)
  if (version === "v5") {
    const postcssConfigPath = join(projectRoot, "postcss.config.mjs");
    writeFileSync(postcssConfigPath, generatePostcssConfig(), "utf-8");
    generatedFiles.push("postcss.config.mjs");
    configurePackageJsonOverrides(projectRoot, pm, options.dryRun);
  }

  // 4. Écrire metro.config.js
  const metroConfigPath = join(projectRoot, "metro.config.js");
  writeFileSync(metroConfigPath, generateMetroConfig(version, cssRelative), "utf-8");
  generatedFiles.push("metro.config.js");

  // 5. Mettre à jour babel.config.js
  const babelConfigPath = join(projectRoot, "babel.config.js");
  writeFileSync(babelConfigPath, generateBabelConfig(version), "utf-8");
  generatedFiles.push("babel.config.js");

  // 6. Écrire nativewind-env.d.ts
  const envPath = join(projectRoot, "nativewind-env.d.ts");
  writeFileSync(envPath, generateNativeWindEnv(version), "utf-8");
  generatedFiles.push("nativewind-env.d.ts");

  // 7. Mettre à jour app.json
  updateAppJsonForNativeWind(projectRoot, version, options.dryRun);

  // 8. Tenter l'injection immédiate dans _layout.tsx ou App.tsx si déjà présents
  injectGlobalCssImport(projectRoot, cssRelative, options.dryRun);

  return {
    packagesToInstall: pkgs.runtimeDeps,
    devPackagesToInstall: pkgs.devDeps,
    expoPackagesToInstall: pkgs.expoDeps,
    generatedFiles,
  };
}
