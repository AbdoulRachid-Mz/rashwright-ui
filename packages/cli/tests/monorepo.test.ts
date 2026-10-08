import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { detectProject } from "../src/core/project-detector.js";

const TEST_DIR = join(process.cwd(), ".tmp-test-monorepo-detector");

describe("Monorepo & Workspace Awareness (detectProject)", () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("detectProject identifies standard non-workspace project", () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({ name: "my-expo-app", dependencies: { expo: "^54.0.0" } })
    );

    const project = detectProject(TEST_DIR);
    expect(project.isWorkspace).toBe(false);
    expect(project.workspaceType).toBeNull();
  });

  it("detectProject detects Bun / Yarn workspaces array in package.json", () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "my-monorepo",
        workspaces: ["packages/*", "apps/*"],
      })
    );

    const project = detectProject(TEST_DIR);
    expect(project.isWorkspace).toBe(true);
    expect(project.workspacePackages).toEqual(["packages/*", "apps/*"]);
  });

  it("detectProject detects pnpm-workspace.yaml file", () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({ name: "my-pnpm-monorepo" })
    );
    writeFileSync(
      join(TEST_DIR, "pnpm-workspace.yaml"),
      "packages:\n  - 'apps/*'\n  - 'packages/*'\n"
    );

    const project = detectProject(TEST_DIR);
    expect(project.isWorkspace).toBe(true);
    expect(project.workspaceType).toBe("pnpm");
  });
});
