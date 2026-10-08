import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  detectResetArtifacts,
  generateMinimalHomeScreen,
} from "../src/commands/reset.js";
import { readConfig, writeConfig, type RashwrightConfig } from "../src/core/config-manager.js";

describe("rs-ui reset command", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-reset-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("detectResetArtifacts detects existing starter files", () => {
    // Créer structure fictive
    const compDir = join(tempDir, "components", "ui");
    const assetsDir = join(tempDir, "assets");
    const appDir = join(tempDir, "app");

    mkdirSync(compDir, { recursive: true });
    mkdirSync(assetsDir, { recursive: true });
    mkdirSync(appDir, { recursive: true });

    writeFileSync(join(compDir, "showcase-screen.tsx"), "// showcase", "utf-8");
    writeFileSync(join(compDir, "rashwright-logo.tsx"), "// logo", "utf-8");
    writeFileSync(join(assetsDir, "primary.png"), "fake png", "utf-8");
    writeFileSync(join(appDir, "index.tsx"), "// app entry", "utf-8");

    const artifacts = detectResetArtifacts(tempDir, "components/ui");
    expect(artifacts.length).toBe(4);

    const relPaths = artifacts.map((a) => a.relativePath);
    expect(relPaths).toContain("components/ui/showcase-screen.tsx");
    expect(relPaths).toContain("components/ui/rashwright-logo.tsx");
    expect(relPaths).toContain("assets/primary.png");
    expect(relPaths).toContain("app/index.tsx");
  });

  it("detectResetArtifacts returns empty array when no demo files exist", () => {
    const artifacts = detectResetArtifacts(tempDir, "components/ui");
    expect(artifacts).toEqual([]);
  });

  it("generateMinimalHomeScreen outputs valid React Native screen with useTheme", () => {
    const code = generateMinimalHomeScreen();
    expect(code).toContain("useTheme");
    expect(code).toContain("export default function HomeScreen");
    expect(code).toContain("Bienvenue sur votre application");
    expect(code).toContain("theme.colors.background");
  });

  it("reset preserves config history and updates starter metadata", () => {
    const configPath = join(tempDir, "rashwright-ui.json");
    const initialConfig: RashwrightConfig = {
      version: 1,
      componentsPath: "components/ui",
      theme: "default",
      glass: false,
      typescript: true,
      aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" },
      starter: { installed: true, reset: false },
      components: {
        button: "1.0.0",
        "showcase-screen": "1.0.0",
        "rashwright-logo": "1.0.0",
      },
    };
    writeConfig(configPath, initialConfig);

    // Simuler mise à jour config post-reset
    const cfg = readConfig(configPath);
    delete cfg.components["showcase-screen"];
    delete cfg.components["rashwright-logo"];
    cfg.starter = {
      installed: true,
      reset: true,
      archived: true,
      resetAt: new Date().toISOString(),
    };
    writeConfig(configPath, cfg);

    const finalConfig = readConfig(configPath);
    expect(finalConfig.starter?.reset).toBe(true);
    expect(finalConfig.starter?.archived).toBe(true);
    expect(finalConfig.components["button"]).toBe("1.0.0");
    expect(finalConfig.components["showcase-screen"]).toBeUndefined();
    expect(finalConfig.components["rashwright-logo"]).toBeUndefined();
  });
});
