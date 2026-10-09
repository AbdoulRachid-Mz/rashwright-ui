import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  writeBabelConfig,
  updateTsconfig,
  generateUiIndex,
  generateShowcaseScreen,
  writeExpoRouterLayout,
  resetExpoProject,
  COMPONENT_EXPORTS_MAP,
} from "../src/core/starter-generator.js";

describe("starter-generator", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-starter-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("writeBabelConfig generates babel config with react-native-reanimated plugin", () => {
    writeBabelConfig(tempDir);
    const babelFile = join(tempDir, "babel.config.js");
    expect(existsSync(babelFile)).toBe(true);
    const content = readFileSync(babelFile, "utf-8");
    expect(content).toContain("react-native-reanimated/plugin");
  });

  it("updateTsconfig updates paths alias and removes deprecated baseUrl and ignoreDeprecations", () => {
    updateTsconfig(tempDir);
    const tsconfigFile = join(tempDir, "tsconfig.json");
    expect(existsSync(tsconfigFile)).toBe(true);
    const cfg = JSON.parse(readFileSync(tsconfigFile, "utf-8"));
    expect(cfg.compilerOptions.baseUrl).toBeUndefined();
    expect(cfg.compilerOptions.ignoreDeprecations).toBeUndefined();
    expect(cfg.compilerOptions.jsx).toBe("react-native");
    expect(cfg.compilerOptions.paths["@/*"]).toEqual(["./src/*", "./*"]);
  });

  it("generateUiIndex generates selective exports for only installed components", () => {
    const compDir = join(tempDir, "src/components/ui");
    mkdirSync(compDir, { recursive: true });

    generateUiIndex(compDir, ["button", "card", "accordion"]);
    const indexFile = join(compDir, "index.ts");
    expect(existsSync(indexFile)).toBe(true);
    const content = readFileSync(indexFile, "utf-8");
    expect(content).toContain('export { default as Button } from "./button";');
    expect(content).toContain('export { default as Card } from "./card";');
    expect(content).toContain('export { Accordion } from "./accordion";');
    expect(content).not.toContain('export { default as Switch } from "./switch";');
  });

  it("COMPONENT_EXPORTS_MAP includes all 61 components and 6 template screens", () => {
    const keys = Object.keys(COMPONENT_EXPORTS_MAP);
    expect(keys.length).toBe(67);
    expect(keys).toContain("accordion");
    expect(keys).toContain("collapsible");
    expect(keys).toContain("data-table");
    expect(keys).toContain("form");
    expect(keys).toContain("otp-input");
    expect(keys).toContain("rating");
    expect(keys).toContain("auth-screen");
    expect(keys).toContain("dashboard-screen");
  });

  it("generateShowcaseScreen writes screen in src/app for router projects", () => {
    mkdirSync(join(tempDir, "src/app"), { recursive: true });
    generateShowcaseScreen(tempDir, "src/components/ui");
    const appDir = join(tempDir, "src/app");
    expect(existsSync(join(appDir, "_layout.tsx"))).toBe(true);
    expect(existsSync(join(appDir, "index.tsx"))).toBe(true);
    const indexContent = readFileSync(join(appDir, "index.tsx"), "utf-8");
    expect(indexContent).toContain("@/components/ui/showcase-screen");
  });

  it("writeExpoRouterLayout creates ThemeProvider wrapper in _layout.tsx", () => {
    writeExpoRouterLayout(tempDir);
    const layoutFile = join(tempDir, "src/app/_layout.tsx");
    expect(existsSync(layoutFile)).toBe(true);
    const content = readFileSync(layoutFile, "utf-8");
    expect(content).toContain("ThemeProvider");
    expect(content).toContain("Slot");
  });

  it("resetExpoProject removes template items and sets up standardized dirs", () => {
    mkdirSync(join(tempDir, "src/components"), { recursive: true });
    writeFileSync(join(tempDir, "src/components/ThemedText.tsx"), "// old");
    writeFileSync(join(tempDir, "src/components/app-tabs.tsx"), "// old");

    resetExpoProject(tempDir);
    expect(existsSync(join(tempDir, "src/components/ThemedText.tsx"))).toBe(false);
    expect(existsSync(join(tempDir, "src/components/app-tabs.tsx"))).toBe(false);
    expect(existsSync(join(tempDir, "src/contexts"))).toBe(true);
    expect(existsSync(join(tempDir, "src/constants"))).toBe(true);
  });
});
