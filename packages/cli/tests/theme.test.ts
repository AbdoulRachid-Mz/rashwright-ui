import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  generateCustomTheme,
  generateShowcaseScreen,
  writeExpoRouterLayout,
  type CustomThemeColors,
} from "../src/core/starter-generator.js";
import { THEME_PRESETS } from "../../ui-mobile/theme/themes/default.js";

describe("Theme System & Custom Theme Engine", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(tmpdir(), `rs-ui-theme-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("THEME_PRESETS includes green, red and cyan", () => {
    expect(THEME_PRESETS.green).toBeDefined();
    expect(THEME_PRESETS.green.light.colors.primary).toBe("#16A34A");
    expect(THEME_PRESETS.green.dark.colors.primary).toBe("#22C55E");

    expect(THEME_PRESETS.red).toBeDefined();
    expect(THEME_PRESETS.red.light.colors.primary).toBe("#DC2626");
    expect(THEME_PRESETS.red.dark.colors.primary).toBe("#EF4444");

    expect(THEME_PRESETS.cyan).toBeDefined();
    expect(THEME_PRESETS.cyan.light.colors.primary).toBe("#0891B2");
    expect(THEME_PRESETS.cyan.dark.colors.primary).toBe("#06B6D4");
  });

  it("generateCustomTheme generates custom.ts with customLight and customDark", () => {
    const colors: CustomThemeColors = {
      primaryLight: "#2563EB",
      primaryDark: "#3B82F6",
      secondaryLight: "#F1F5F9",
      secondaryDark: "#1E293B",
      accentLight: "#F59E0B",
      accentDark: "#FBBF24",
    };

    generateCustomTheme(tempDir, "src/components/ui", colors, false);

    const customFile = join(tempDir, "src/theme/themes/custom.ts");
    expect(existsSync(customFile)).toBe(true);

    const content = readFileSync(customFile, "utf-8");
    expect(content).toContain('primary: "#2563EB"');
    expect(content).toContain('primary: "#3B82F6"');
    expect(content).toContain('secondary: "#F1F5F9"');
    expect(content).toContain('secondary: "#1E293B"');
    expect(content).toContain('accent: "#F59E0B"');
    expect(content).toContain('accent: "#FBBF24"');
  });

  it("generateCustomTheme respects dryRun mode", () => {
    const colors: CustomThemeColors = {
      primaryLight: "#000000",
      primaryDark: "#FFFFFF",
      secondaryLight: "#111111",
      secondaryDark: "#EEEEEE",
    };

    generateCustomTheme(tempDir, "src/components/ui", colors, true);
    const customFile = join(tempDir, "src/theme/themes/custom.ts");
    expect(existsSync(customFile)).toBe(false);
  });

  it("writeExpoRouterLayout passes custom themePreset to ThemeProvider", () => {
    writeExpoRouterLayout(tempDir, "src/components/ui", "cyan", false);

    const layoutFile = join(tempDir, "src/app/_layout.tsx");
    expect(existsSync(layoutFile)).toBe(true);

    const content = readFileSync(layoutFile, "utf-8");
    expect(content).toContain('initialPreset="cyan"');
  });

  it("generateShowcaseScreen injects selected themePreset into App.tsx or router", () => {
    mkdirSync(join(tempDir, "src/app"), { recursive: true });
    generateShowcaseScreen(tempDir, "src/components/ui", "green", false);

    const layoutFile = join(tempDir, "src/app/_layout.tsx");
    const content = readFileSync(layoutFile, "utf-8");
    expect(content).toContain('initialPreset="green"');
  });
});
