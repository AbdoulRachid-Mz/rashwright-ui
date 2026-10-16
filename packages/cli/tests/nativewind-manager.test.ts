import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  generateGlobalCss,
  generateTailwindConfig,
  generateMetroConfig,
  generateBabelConfig,
  generateNativeWindEnv,
  setupNativeWind,
  injectGlobalCssImport,
} from "../src/core/nativewind-manager.js";

const TEMP_PROJECT = join(__dirname, "temp-nativewind-test");

describe("NativeWind Manager (v4 & v5)", () => {
  beforeEach(() => {
    if (existsSync(TEMP_PROJECT)) rmSync(TEMP_PROJECT, { recursive: true, force: true });
    mkdirSync(join(TEMP_PROJECT, "src/app"), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEMP_PROJECT)) rmSync(TEMP_PROJECT, { recursive: true, force: true });
  });

  it("generateGlobalCss outputs correct syntax for v4 and v5", () => {
    const cssV4 = generateGlobalCss("v4");
    expect(cssV4).toContain("@tailwind base;");
    expect(cssV4).toContain("@tailwind components;");

    const cssV5 = generateGlobalCss("v5");
    expect(cssV5).toContain('layer(theme)');
    expect(cssV5).toContain('@import "nativewind/theme";');
  });

  it("generateTailwindConfig configures content paths for v4", () => {
    const config = generateTailwindConfig("v4", true);
    expect(config).toContain("nativewind/preset");
    expect(config).toContain("./src/**/*.{js,jsx,ts,tsx}");
  });

  it("generateMetroConfig includes withNativeWind wrapper", () => {
    const metroV4 = generateMetroConfig("v4", "src/global.css");
    expect(metroV4).toContain("withNativeWind");
    expect(metroV4).toContain("./src/global.css");

    const metroV5 = generateMetroConfig("v5", "global.css");
    expect(metroV5).toContain("withNativewind");
    expect(metroV5).toContain("nativewind/metro");
  });

  it("generateBabelConfig provides nativewind preset for v4 and clean preset for v5", () => {
    const babelV4 = generateBabelConfig("v4");
    expect(babelV4).toContain('jsxImportSource: "nativewind"');
    expect(babelV4).toContain('"nativewind/babel"');

    const babelV5 = generateBabelConfig("v5");
    expect(babelV5).toContain('"babel-preset-expo"');
    expect(babelV5).not.toContain('jsxImportSource: "nativewind"');
  });

  it("setupNativeWind v4 writes all necessary files and returns dependencies", () => {
    const result = setupNativeWind(TEMP_PROJECT, "v4", "npm", { useSrc: true });

    expect(result.packagesToInstall).toContain("nativewind@4.2.7");
    expect(result.devPackagesToInstall).toContain("tailwindcss@^3.4.17");
    expect(result.expoPackagesToInstall).toContain("react-native-reanimated");

    expect(existsSync(join(TEMP_PROJECT, "src/global.css"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "tailwind.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "metro.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "babel.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "nativewind-env.d.ts"))).toBe(true);
    const envContent = readFileSync(join(TEMP_PROJECT, "nativewind-env.d.ts"), "utf-8");
    expect(envContent).toContain("nativewind/types");
  });

  it("setupNativeWind v5 generates CSS-first config with postcss.config.mjs and overrides", () => {
    const result = setupNativeWind(TEMP_PROJECT, "v5", "npm", { useSrc: true });

    expect(result.packagesToInstall).toContain("nativewind@5.0.0-rc.0");
    expect(result.packagesToInstall).toContain("react-native-css@3.1.0-rc.0");
    expect(result.devPackagesToInstall).toContain("tailwindcss@4.1.12");
    expect(result.devPackagesToInstall).toContain("lightningcss@1.30.1");

    expect(existsSync(join(TEMP_PROJECT, "src/global.css"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "postcss.config.mjs"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "metro.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "babel.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "nativewind-env.d.ts"))).toBe(true);
    const envContent = readFileSync(join(TEMP_PROJECT, "nativewind-env.d.ts"), "utf-8");
    expect(envContent).toContain("react-native-css/types");
  });

  it("injectGlobalCssImport injects import into _layout.tsx and App.tsx", () => {
    const layoutPath = join(TEMP_PROJECT, "src/app/_layout.tsx");
    mkdirSync(join(TEMP_PROJECT, "src/app"), { recursive: true });
    writeFileSync(layoutPath, "export default function Layout() { return null; }\n", "utf-8");

    const injected = injectGlobalCssImport(TEMP_PROJECT, "src/global.css");
    expect(injected).toBe(true);

    const layoutContent = readFileSync(layoutPath, "utf-8");
    expect(layoutContent).toContain('import "../global.css";');
  });
});
