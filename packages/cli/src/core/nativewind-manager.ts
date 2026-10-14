// packages/cli/src/core/nativewind-manager.ts
// Note: Génère des configurations CommonJS (metro/tailwind) compatibles avec createRequire()
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import ora from "ora";
import type { PackageManager } from "./package-manager.js";
import { installNpmPackages } from "./package-manager.js";

export type NativeWindVersion = "v4" | "v5";

export interface NativeWindConfig {
  enabled: boolean;
  version: NativeWindVersion;
  cssPath: string;
}

/**
 * Retourne le contenu de global.css selon la version de NativeWind.
 */
export function generateGlobalCss(version: NativeWindVersion): string {
  if (version === "v5") {
    return `/* global.css — NativeWind v5 (Tailwind CSS v4 Next-Gen) */
@import "tailwindcss";
@plugin "nativewind";
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
 * Retourne le contenu de tailwind.config.js (uniquement nécessaire pour v4).
 */
export function generateTailwindConfig(version: NativeWindVersion, useSrc: boolean): string {
  const contentPattern = useSrc
    ? `["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"]`
    : `["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"]`;

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
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
 * Retourne le contenu de metro.config.js configuré pour NativeWind.
 */
export function generateMetroConfig(version: NativeWindVersion, inputCss: string): string {
  const inlineStyles = version === "v5" ? ", inlineStyles: true" : "";
  return `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./${inputCss}"${inlineStyles} });
`;
}

/**
 * Retourne le contenu de babel.config.js pour NativeWind v4.
 */
export function generateBabelConfig(version: NativeWindVersion): string {
  if (version === "v5") {
    return `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
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
export function generateNativeWindEnv(): string {
  return `/// <reference types="nativewind/types" />
`;
}

/**
 * Configure NativeWind (v4 ou v5) dans un projet cible.
 */
export function setupNativeWind(
  projectRoot: string,
  version: NativeWindVersion,
  pm: PackageManager,
  options: { dryRun?: boolean; useSrc?: boolean } = {}
): { packagesToInstall: string[]; generatedFiles: string[] } {
  const useSrc = options.useSrc ?? existsSync(join(projectRoot, "src"));
  const cssRelative = useSrc ? "src/global.css" : "global.css";
  const generatedFiles: string[] = [];

  // 1. Déterminer les paquets npm à installer
  const packagesToInstall: string[] =
    version === "v5"
      ? ["nativewind@^5.0.0-preview", "tailwindcss@^4.0.0"]
      : ["nativewind@^4.0.1", "tailwindcss@^3.4.0"];

  if (options.dryRun) {
    return { packagesToInstall, generatedFiles };
  }

  // 2. Écrire global.css
  const globalCssPath = join(projectRoot, cssRelative);
  writeFileSync(globalCssPath, generateGlobalCss(version), "utf-8");
  generatedFiles.push(cssRelative);

  // 3. Écrire tailwind.config.js (requis pour v4)
  if (version === "v4") {
    const tailwindConfigPath = join(projectRoot, "tailwind.config.js");
    writeFileSync(tailwindConfigPath, generateTailwindConfig("v4", useSrc), "utf-8");
    generatedFiles.push("tailwind.config.js");
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
  writeFileSync(envPath, generateNativeWindEnv(), "utf-8");
  generatedFiles.push("nativewind-env.d.ts");

  // 7. Importer global.css dans app/_layout.tsx ou src/app/_layout.tsx si existant
  const layoutCandidates = [
    join(projectRoot, "src/app/_layout.tsx"),
    join(projectRoot, "app/_layout.tsx"),
  ];

  for (const layoutPath of layoutCandidates) {
    if (existsSync(layoutPath)) {
      const layoutContent = readFileSync(layoutPath, "utf-8");
      const importStatement = useSrc ? 'import "../global.css";' : 'import "./global.css";';
      if (!layoutContent.includes("global.css")) {
        writeFileSync(layoutPath, `${importStatement}\n${layoutContent}`, "utf-8");
      }
      break;
    }
  }

  return { packagesToInstall, generatedFiles };
}
