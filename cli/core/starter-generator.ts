import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
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

/**
 * Setup foundational files (constants/theme, constants/glass-theme, stores/theme-store, contexts/theme-context)
 * in the target project.
 */
export function setupFoundations(
  sourceRoot: string,
  targetProjectRoot: string,
  dryRun = false
): void {
  if (dryRun) return;

  const filesToCopy = [
    { src: "constants/theme.ts", dest: "constants/theme.ts" },
    { src: "constants/glass-theme.ts", dest: "constants/glass-theme.ts" },
    { src: "stores/theme-store.ts", dest: "stores/theme-store.ts" },
    { src: "contexts/theme-context.tsx", dest: "contexts/theme-context.tsx" },
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

  for (const { src, dest } of filesToCopy) {
    const srcPath = join(sourceRoot, src);
    const destPath = join(targetProjectRoot, dest);
    if (existsSync(srcPath)) {
      const dir = dirname(destPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
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
 * Generate demo showcase screen in app/index.tsx (if Expo Router) or App.tsx (classic).
 */
export function generateShowcaseScreen(
  targetProjectRoot: string,
  componentsPath: string,
  dryRun = false
): string | null {
  if (dryRun) return null;

  const appRouterIndex = join(targetProjectRoot, "app", "index.tsx");
  const classicApp = join(targetProjectRoot, "App.tsx");

  const hasExpoRouter = existsSync(join(targetProjectRoot, "app"));
  const targetFile = hasExpoRouter ? appRouterIndex : classicApp;

  const content = `import React from "react";
import { ThemeProvider } from "../contexts/theme-context";
import { RashwrightShowcaseScreen } from "../${componentsPath}/showcase-screen";

export default function App() {
  return (
    <ThemeProvider>
      <RashwrightShowcaseScreen />
    </ThemeProvider>
  );
}
`;

  const dir = dirname(targetFile);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(targetFile, content, "utf-8");

  return targetFile;
}
