import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  generateGlobalCss,
  generateTailwindConfig,
  generateMetroConfig,
  generateBabelConfig,
  generateNativeWindEnv,
  setupNativeWind,
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
    expect(cssV5).toContain('@import "tailwindcss";');
    expect(cssV5).toContain('@plugin "nativewind";');
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
    expect(metroV4).not.toContain("inlineStyles: true");

    const metroV5 = generateMetroConfig("v5", "global.css");
    expect(metroV5).toContain("inlineStyles: true");
  });

  it("generateBabelConfig provides nativewind preset and jsxImportSource", () => {
    const babelV4 = generateBabelConfig("v4");
    expect(babelV4).toContain('jsxImportSource: "nativewind"');
    expect(babelV4).toContain('"nativewind/babel"');

    const babelV5 = generateBabelConfig("v5");
    expect(babelV5).toContain('jsxImportSource: "nativewind"');
  });

  it("setupNativeWind v4 writes all necessary files and returns dependencies", () => {
    const result = setupNativeWind(TEMP_PROJECT, "v4", "npm", { useSrc: true });

    expect(result.packagesToInstall).toContain("nativewind@^4.0.1");
    expect(result.packagesToInstall).toContain("tailwindcss@^3.4.0");

    expect(existsSync(join(TEMP_PROJECT, "src/global.css"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "tailwind.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "metro.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "babel.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "nativewind-env.d.ts"))).toBe(true);
  });

  it("setupNativeWind v5 generates CSS-first config without tailwind.config.js", () => {
    const result = setupNativeWind(TEMP_PROJECT, "v5", "npm", { useSrc: true });

    expect(result.packagesToInstall).toContain("nativewind@^5.0.0-preview");
    expect(result.packagesToInstall).toContain("tailwindcss@^4.0.0");

    expect(existsSync(join(TEMP_PROJECT, "src/global.css"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "metro.config.js"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "babel.config.js"))).toBe(true);
  });
});
