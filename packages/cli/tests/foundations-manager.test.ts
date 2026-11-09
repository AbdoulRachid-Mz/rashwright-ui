import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  applyFoundationPlan,
  applyFoundationPlans,
  planFoundation,
  planFoundations,
  projectUsesSrc,
  resolveFoundationDestination,
} from "../src/core/foundations-manager.js";
import type {
  FoundationRegistryEntry,
  ResolvedFoundation,
} from "../src/core/dependency-resolver.js";

function makeEntry(overrides: Partial<FoundationRegistryEntry> = {}): FoundationRegistryEntry {
  return {
    name: "demo",
    type: "registry:foundation",
    version: "1.0.0",
    description: "Fondation de test",
    category: "Core",
    files: ["constants/theme.ts", "components/ui/text.tsx"],
    assets: ["assets/logo.png"],
    dependencies: [],
    expoDependencies: [],
    optionalExpoDependencies: [],
    requiresComponents: [],
    requiresFoundations: [],
    providers: [],
    supportsGlass: false,
    platforms: ["ios", "android"],
    nativeRebuildRequired: false,
    ...overrides,
  };
}

function makeFoundation(overrides: Partial<FoundationRegistryEntry> = {}): ResolvedFoundation {
  const entry = makeEntry(overrides);
  return {
    name: entry.name,
    entry,
    npmDeps: [],
    expoDepsWithVersions: {},
    requiredFoundations: [],
  };
}

describe("foundations-manager", () => {
  let sourceRoot: string;
  let projectRoot: string;

  beforeEach(() => {
    sourceRoot = mkdtempSync(join(tmpdir(), "rs-ui-foundation-source-"));
    projectRoot = mkdtempSync(join(tmpdir(), "rs-ui-foundation-project-"));
  });

  afterEach(() => {
    rmSync(sourceRoot, { recursive: true, force: true });
    rmSync(projectRoot, { recursive: true, force: true });
  });

  function writeSourceFixtures(): void {
    mkdirSync(join(sourceRoot, "constants"), { recursive: true });
    mkdirSync(join(sourceRoot, "components", "ui"), { recursive: true });
    mkdirSync(join(sourceRoot, "assets"), { recursive: true });
    writeFileSync(join(sourceRoot, "constants", "theme.ts"), "export const theme = { mode: \"default\" };\n");
    writeFileSync(
      join(sourceRoot, "components", "ui", "text.tsx"),
      'const logo = require("@/assets/logo.png");\nexport default logo;\n',
    );
    writeFileSync(join(sourceRoot, "assets", "logo.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }

  it("routes foundation files to componentsPath, src/ and root assets", () => {
    const withSrc = resolveFoundationDestination(
      "components/ui/text.tsx",
      projectRoot,
      "src/components/ui",
    );
    expect(withSrc).toBe(join(projectRoot, "src", "components", "ui", "text.tsx"));

    const constantsWithSrc = resolveFoundationDestination(
      "constants/theme.ts",
      projectRoot,
      "src/components/ui",
    );
    expect(constantsWithSrc).toBe(join(projectRoot, "src", "constants", "theme.ts"));

    const asset = resolveFoundationDestination("assets/logo.png", projectRoot, "components/ui");
    expect(asset).toBe(join(projectRoot, "assets", "logo.png"));
  });

  it("detects src projects from componentsPath or an existing src directory", () => {
    expect(projectUsesSrc(projectRoot, "src/components/ui")).toBe(true);
    expect(projectUsesSrc(projectRoot, "components/ui")).toBe(false);
    mkdirSync(join(projectRoot, "src"), { recursive: true });
    expect(projectUsesSrc(projectRoot, "components/ui")).toBe(true);
  });

  it("plans a missing foundation, then installs files and rewrites asset requires", () => {
    writeSourceFixtures();
    const foundation = makeFoundation();

    const plan = planFoundation(foundation, sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    expect(plan.state).toBe("missing");
    expect(plan.errors).toHaveLength(0);
    expect(plan.files.some((file) => file.status === "missing")).toBe(true);

    const result = applyFoundationPlan(plan, { dryRun: false });
    expect(result.errors).toHaveLength(0);
    expect(result.writtenFiles).toContain("src/constants/theme.ts");
    expect(result.writtenFiles).toContain("src/components/ui/text.tsx");

    expect(
      existsSync(join(projectRoot, "src", "constants", "theme.ts")),
    ).toBe(true);
    const textContent = readFileSync(
      join(projectRoot, "src", "components", "ui", "text.tsx"),
      "utf-8",
    );
    expect(textContent).toContain('require("../../../assets/logo.png")');
    expect(textContent).not.toContain('"@/assets/logo.png"');

    const assets = applyFoundationPlans([plan], sourceRoot, projectRoot, {
      overwrite: false,
    });
    expect(assets[0].assets[0].status).toBe("copied");
    expect(
      readFileSync(join(projectRoot, "assets", "logo.png")).equals(
        readFileSync(join(sourceRoot, "assets", "logo.png")),
      ),
    ).toBe(true);
  });

  it("reports an installed foundation as unchanged on a second plan", () => {
    writeSourceFixtures();
    const foundation = makeFoundation();

    const first = planFoundation(foundation, sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    applyFoundationPlan(first, { dryRun: false });
    applyFoundationPlans([first], sourceRoot, projectRoot, { overwrite: false });

    const second = planFoundation(foundation, sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    expect(second.state).toBe("installed");
    expect(second.files.every((file) => file.status === "installed")).toBe(true);
  });

  it("never overwrites a locally modified foundation file without overwrite", () => {
    writeSourceFixtures();
    const foundation = makeFoundation();

    const first = planFoundation(foundation, sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    applyFoundationPlan(first, { dryRun: false });

    const localFile = join(projectRoot, "src", "components", "ui", "text.tsx");
    writeFileSync(localFile, "// modification locale\n");

    const modifiedPlan = planFoundation(foundation, sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    expect(modifiedPlan.state).toBe("modified");

    const withoutOverwrite = applyFoundationPlan(modifiedPlan, { overwrite: false });
    expect(withoutOverwrite.needsRepair).toBe(true);
    expect(withoutOverwrite.files.some((file) => file.status === "modified")).toBe(true);
    expect(readFileSync(localFile, "utf-8")).toBe("// modification locale\n");

    const withOverwrite = applyFoundationPlan(modifiedPlan, { overwrite: true });
    expect(withOverwrite.files.some((file) => file.status === "written")).toBe(true);
    expect(readFileSync(localFile, "utf-8")).toContain('require("../../../assets/logo.png")');
  });

  it("fails explicitly when a declared file is missing from the source", () => {
    writeSourceFixtures();
    rmSync(join(sourceRoot, "constants", "theme.ts"));

    const plan = planFoundation(makeFoundation(), sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    expect(plan.state).toBe("invalid");
    expect(plan.errors.join(" ")).toContain("constants/theme.ts");
  });

  it("fails explicitly when a declared asset is missing from the source", () => {
    writeSourceFixtures();
    rmSync(join(sourceRoot, "assets", "logo.png"));

    const plan = planFoundation(makeFoundation(), sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    expect(plan.state).toBe("invalid");
    expect(plan.errors.join(" ")).toContain("assets/logo.png");
  });

  it("plans several foundations in the provided order", () => {
    writeSourceFixtures();
    const a = makeFoundation({ name: "a" });
    const b = makeFoundation({ name: "b" });
    const plans = planFoundations([a, b], sourceRoot, {
      projectRoot,
      componentsPath: "src/components/ui",
    });
    expect(plans.map((plan) => plan.name)).toEqual(["a", "b"]);
  });
});
