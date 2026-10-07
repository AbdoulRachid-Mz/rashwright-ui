import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  detectProject,
  isDefaultExpoTemplate,
} from "../src/core/project-detector.js";
import { detectPackageManager } from "../src/core/package-manager.js";

describe("project-detector", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-proj-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("detectProject identifies absence of package.json", () => {
    const proj = detectProject(tempDir);
    expect(proj.hasPackageJson).toBe(false);
    expect(proj.isExpo).toBe(false);
    expect(proj.hasRashwrightConfig).toBe(false);
  });

  it("detectProject identifies Expo project with dependencies and config", () => {
    const pkg = {
      name: "my-app",
      dependencies: {
        expo: "~54.0.0",
        "react-native": "0.76.0",
      },
    };
    writeFileSync(join(tempDir, "package.json"), JSON.stringify(pkg), "utf-8");

    const rashwrightConfig = {
      version: 1,
      componentsPath: "src/components/ui",
      theme: "default",
      glass: true,
      typescript: true,
      aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" },
      components: {},
    };
    writeFileSync(join(tempDir, "rashwright-ui.json"), JSON.stringify(rashwrightConfig), "utf-8");

    const proj = detectProject(tempDir);
    expect(proj.hasPackageJson).toBe(true);
    expect(proj.isExpo).toBe(true);
    expect(proj.hasRashwrightConfig).toBe(true);
  });

  it("detectPackageManager identifies lockfiles correctly", () => {
    writeFileSync(join(tempDir, "bun.lockb"), "");
    expect(detectPackageManager(tempDir)).toBe("bun");

    rmSync(join(tempDir, "bun.lockb"));
    writeFileSync(join(tempDir, "pnpm-lock.yaml"), "");
    expect(detectPackageManager(tempDir)).toBe("pnpm");

    rmSync(join(tempDir, "pnpm-lock.yaml"));
    writeFileSync(join(tempDir, "yarn.lock"), "");
    expect(detectPackageManager(tempDir)).toBe("yarn");

    rmSync(join(tempDir, "yarn.lock"));
    writeFileSync(join(tempDir, "package-lock.json"), "");
    expect(detectPackageManager(tempDir)).toBe("npm");
  });

  it("isDefaultExpoTemplate detects presence of template markers", () => {
    // Empty dir -> false
    expect(isDefaultExpoTemplate(tempDir)).toBe(false);

    // With reset-project.js
    mkdirSync(join(tempDir, "scripts"), { recursive: true });
    writeFileSync(join(tempDir, "scripts", "reset-project.js"), "// template");
    expect(isDefaultExpoTemplate(tempDir)).toBe(true);
  });

  it("isDefaultExpoTemplate returns false if rashwright-ui.json already exists", () => {
    mkdirSync(join(tempDir, "scripts"), { recursive: true });
    writeFileSync(join(tempDir, "scripts", "reset-project.js"), "// template");
    writeFileSync(join(tempDir, "rashwright-ui.json"), "{}");
    expect(isDefaultExpoTemplate(tempDir)).toBe(false);
  });
});
