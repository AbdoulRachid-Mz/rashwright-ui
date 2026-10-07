import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  readConfig,
  writeConfig,
  markComponentInstalled,
  markComponentRemoved,
  isComponentInstalled,
  getInstalledVersion,
  getInstalledAt,
  mergeRashwrightConfigs,
  type RashwrightConfig,
} from "../src/core/config-manager.js";

describe("config-manager", () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-config-test-"));
    configPath = join(tempDir, "rashwright-ui.json");
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("writeConfig and readConfig roundtrip works properly", () => {
    const initial: RashwrightConfig = {
      version: 1,
      componentsPath: "src/components/ui",
      packageManager: "npm",
      theme: "default",
      glass: true,
      typescript: true,
      aliases: {
        components: "@/components",
        lib: "@/lib",
        theme: "@/theme",
      },
      components: {
        button: "1.0.0",
      },
    };

    writeConfig(configPath, initial);
    expect(existsSync(configPath)).toBe(true);

    const loaded = readConfig(configPath);
    expect(loaded.version).toBe(1);
    expect(loaded.componentsPath).toBe("src/components/ui");
    expect(loaded.packageManager).toBe("npm");
    expect(loaded.glass).toBe(true);
    expect(loaded.components["button"]).toBe("1.0.0");
  });

  it("markComponentInstalled adds component with version", () => {
    let cfg: RashwrightConfig = {
      version: 1,
      componentsPath: "src/components/ui",
      theme: "default",
      glass: false,
      typescript: true,
      aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" },
      components: {},
    };

    cfg = markComponentInstalled(cfg, "button", "1.0.0");
    expect(isComponentInstalled(cfg, "button")).toBe(true);
    expect(getInstalledVersion(cfg, "button")).toBe("1.0.0");
    expect(getInstalledAt(cfg, "button")).toBeDefined();

    cfg = markComponentInstalled(cfg, "card", "1.1.0");
    expect(isComponentInstalled(cfg, "card")).toBe(true);
    expect(getInstalledVersion(cfg, "card")).toBe("1.1.0");
  });

  it("markComponentRemoved removes component", () => {
    let cfg: RashwrightConfig = {
      version: 1,
      componentsPath: "src/components/ui",
      theme: "default",
      glass: false,
      typescript: true,
      aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" },
      components: {
        button: "1.0.0",
        card: "1.0.0",
      },
    };

    cfg = markComponentRemoved(cfg, "button");
    expect(isComponentInstalled(cfg, "button")).toBe(false);
    expect(getInstalledVersion(cfg, "button")).toBeNull();
    expect(isComponentInstalled(cfg, "card")).toBe(true);
  });

  it("mergeRashwrightConfigs preserves installed components while updating options", () => {
    const existing: RashwrightConfig = {
      version: 1,
      componentsPath: "components/ui",
      theme: "default",
      glass: false,
      typescript: true,
      aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" },
      components: {
        button: "1.0.0",
      },
    };

    const merged = mergeRashwrightConfigs(existing, {
      theme: "emerald",
      glass: true,
      components: {
        card: "1.0.0",
      },
    });

    expect(merged.theme).toBe("emerald");
    expect(merged.glass).toBe(true);
    expect(merged.components["button"]).toBe("1.0.0");
    expect(merged.components["card"]).toBe("1.0.0");
  });
});
