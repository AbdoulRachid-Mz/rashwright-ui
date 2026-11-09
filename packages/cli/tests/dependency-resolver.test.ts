import { describe, it, expect } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  resolveDependencies,
  loadComponentEntry,
  loadAllComponentEntries,
  loadFoundationEntry,
  validatePlanSources,
  isCriticalNativePackage,
} from "../src/core/dependency-resolver.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";
import { readCompatibilityMatrix } from "../src/core/expo-detector.js";

/**
 * Version réellement exigée par la matrice pour un SDK donné. Les tests ne
 * doivent pas coder en dur une version qui peut être corrigée dans la matrice.
 */
function requiredVersion(sdk: number, pkg: string): string {
  const matrix = readCompatibilityMatrix(sdk, REGISTRY_ROOT);
  const version = matrix?.[pkg];
  if (!version) throw new Error(`Matrice SDK ${sdk} : version absente pour ${pkg}`);
  return version;
}

function majorMinor(version: string): string {
  const match = version.match(/(\d+)\.(\d+)/);
  if (!match) throw new Error(`Version illisible: ${version}`);
  return `${match[1]}.${match[2]}`;
}

describe("dependency-resolver", () => {
  it("loadComponentEntry loads an existing component from registry", () => {
    const entry = loadComponentEntry("button", REGISTRY_ROOT);
    expect(entry).not.toBeNull();
    expect(entry?.name).toBe("button");
    expect(entry?.files).toContain("components/ui/button.tsx");
  });

  it("loadComponentEntry returns null for unknown component", () => {
    const entry = loadComponentEntry("non-existent-component-xyz", REGISTRY_ROOT);
    expect(entry).toBeNull();
  });

  it("loadAllComponentEntries returns list of components", () => {
    const all = loadAllComponentEntries(REGISTRY_ROOT);
    expect(all.length).toBeGreaterThan(50);
    const names = all.map((c) => c.name);
    expect(names).toContain("button");
    expect(names).toContain("card");
    expect(names).toContain("data-table");
  }, 20000);

  it("resolveDependencies resolves direct dependencies for button", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {});
    expect(plan.components.length).toBeGreaterThanOrEqual(1);
    expect(plan.components.map((c) => c.name)).toContain("button");
  });

  it("resolveDependencies resolves transitive component dependencies", () => {
    // data-table requires search-input
    const plan = resolveDependencies(["data-table"], 54, REGISTRY_ROOT, {});
    const names = plan.components.map((c) => c.name);
    expect(names).toContain("data-table");
    expect(names).toContain("search-input");
    expect(plan.allRequiredComponents).toContain("search-input");
  });

  it("resolveDependencies detects version conflicts (C-2)", () => {
    // Version installée volontairement très ancienne, incompatible avec la
    // version réellement exigée par la matrice SDK 54.
    const required = requiredVersion(54, "react-native-reanimated");
    const installed = {
      "react-native-reanimated": "2.10.0",
    };
    const plan = resolveDependencies(["shimmer"], 54, REGISTRY_ROOT, installed);
    expect(plan.versionConflicts.length).toBeGreaterThanOrEqual(1);
    const conflict = plan.versionConflicts.find((c) => c.pkg === "react-native-reanimated");
    expect(conflict).toBeDefined();
    expect(conflict?.installed).toBe("2.10.0");
    expect(conflict?.required).toBe(required);
  });

  it("resolveDependencies skips version conflict when installed version matches required major.minor", () => {
    // Même major.minor que la matrice, patch différent → pas de conflit.
    const required = requiredVersion(54, "react-native-reanimated");
    const installed = {
      "react-native-reanimated": `~${majorMinor(required)}.0`,
    };
    const plan = resolveDependencies(["shimmer"], 54, REGISTRY_ROOT, installed);
    const conflict = plan.versionConflicts.find((c) => c.pkg === "react-native-reanimated");
    expect(conflict).toBeUndefined();
  });

  it("loadFoundationEntry loads a foundation manifest", () => {
    const entry = loadFoundationEntry("theme", REGISTRY_ROOT);
    expect(entry).not.toBeNull();
    expect(entry?.type).toBe("registry:foundation");
    expect(entry?.files).toContain("constants/theme.ts");
  });

  it("resolveDependencies resolves transitive foundations before components", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {});
    const foundationNames = plan.foundations.map((f) => f.name);
    expect(foundationNames).toContain("core-ui");
    expect(foundationNames).toContain("glass");
    expect(foundationNames).toContain("liquid");
    expect(foundationNames).toContain("theme");

    // Le tri topologique place les dépendances avant leurs dépendants.
    expect(foundationNames.indexOf("theme")).toBeLessThan(foundationNames.indexOf("glass"));
    expect(foundationNames.indexOf("glass")).toBeLessThan(foundationNames.indexOf("liquid"));

    // `text`/`view` sont des primitives Core, pas des composants installables.
    const componentNames = plan.components.map((c) => c.name);
    expect(componentNames).not.toContain("text");
    expect(componentNames).not.toContain("view");
    expect(foundationNames).toContain("core-ui");
  });

  it("resolveDependencies maps a text request to the core-ui foundation", () => {
    const plan = resolveDependencies(["text"], 54, REGISTRY_ROOT, {});
    expect(plan.foundations.map((f) => f.name)).toContain("core-ui");
    expect(plan.diagnostics.missingComponents).toHaveLength(0);
  });

  it("resolveDependencies installs optional expo deps that are statically imported", () => {
    const plan = resolveDependencies(["foundation:liquid"], 54, REGISTRY_ROOT, {});
    const liquid = plan.foundations.find((f) => f.name === "liquid");
    expect(liquid).toBeDefined();
    expect(liquid?.entry.expoDependencies).toContain("expo-blur");
    expect(liquid?.entry.optionalExpoDependencies).toContain("expo-haptics");
    expect(Object.keys(plan.allExpoDeps)).toContain("expo-haptics");
  });

  it("resolveDependencies reports missing foundations instead of ignoring them", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {}, {
      extraFoundations: ["foundation-introuvable-xyz"],
    });
    expect(plan.diagnostics.missingFoundations.map((d) => d.name)).toContain(
      "foundation-introuvable-xyz",
    );
  });

  it("resolveDependencies reports unversioned expo deps without inventing a version", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {}, {
      extraExpoDeps: ["expo-package-absent-de-la-matrice"],
    });
    expect(plan.diagnostics.unversionedExpoDeps).toContain(
      "expo-package-absent-de-la-matrice",
    );
    expect(plan.allExpoDeps["expo-package-absent-de-la-matrice"]).toBe("");
  });

  it("resolveDependencies accepts explicit template/widget extras", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {}, {
      extraFoundations: ["theme"],
      extraNpmDeps: ["zustand/middleware"],
      extraExpoDeps: ["react-native-safe-area-context"],
    });
    expect(plan.allNpmDeps).toContain("zustand");
    expect(Object.keys(plan.allExpoDeps)).toContain("react-native-safe-area-context");
  });

  it("resolveDependencies reports invalid manifests instead of treating them as absent", () => {
    const root = mkdtempSync(join(tmpdir(), "rs-ui-invalid-manifest-"));
    try {
      mkdirSync(join(root, "components"), { recursive: true });
      writeFileSync(join(root, "components", "broken.json"), "{ not valid json", "utf-8");

      const plan = resolveDependencies(["broken"], 54, root, {});
      expect(plan.diagnostics.invalidManifests).toHaveLength(1);
      expect(plan.diagnostics.invalidManifests[0]).toMatchObject({
        kind: "component",
        name: "broken",
      });
      expect(plan.diagnostics.missingComponents.map((d) => d.name)).toContain("broken");
      expect(plan.components).toHaveLength(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("resolveDependencies reports cycles without infinite recursion", () => {
    const root = mkdtempSync(join(tmpdir(), "rs-ui-cycle-"));
    try {
      mkdirSync(join(root, "components"), { recursive: true });
      writeFileSync(
        join(root, "components", "a.json"),
        JSON.stringify({ name: "a", files: ["components/ui/a.tsx"], requiresComponents: ["b"] }),
        "utf-8",
      );
      writeFileSync(
        join(root, "components", "b.json"),
        JSON.stringify({ name: "b", files: ["components/ui/b.tsx"], requiresComponents: ["a"] }),
        "utf-8",
      );

      const plan = resolveDependencies(["a"], 54, root, {});
      expect(plan.diagnostics.cycles.length).toBeGreaterThanOrEqual(1);
      expect(plan.diagnostics.cycles[0]).toContain("component:a");
      expect(plan.diagnostics.cycles[0]).toContain("component:b");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("validatePlanSources refuses a plan whose declared files are absent", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {});
    const emptyRoot = mkdtempSync(join(tmpdir(), "rs-ui-empty-source-"));
    try {
      const missing = validatePlanSources(plan, emptyRoot);
      expect(missing.length).toBeGreaterThan(0);
      expect(missing.some((m) => m.name === "button")).toBe(true);
    } finally {
      rmSync(emptyRoot, { recursive: true, force: true });
    }
  });

  it("validatePlanSources accepts the real registry sources", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {});
    expect(validatePlanSources(plan, join(REGISTRY_ROOT, ".."))).toHaveLength(0);
  });

  it("resolveDependencies flags critical native expo deps without a matrix version", () => {
    expect(isCriticalNativePackage("expo-blur")).toBe(true);
    expect(isCriticalNativePackage("react-native-reanimated")).toBe(true);
    expect(isCriticalNativePackage("@expo/vector-icons")).toBe(false);

    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {}, {
      extraExpoDeps: ["expo-module-inexistant-xyz"],
    });
    expect(plan.diagnostics.unversionedCriticalExpoDeps).toContain(
      "expo-module-inexistant-xyz",
    );
    expect(plan.allExpoDeps["expo-module-inexistant-xyz"]).toBe("");
  });

  it("resolveDependencies exposes providers separately from packages", () => {
    const plan = resolveDependencies(["button"], 54, REGISTRY_ROOT, {});
    expect(plan.allProviders).toContain("ThemeProvider");
    expect(plan.allNpmDeps).not.toContain("ThemeProvider");
    expect(Object.keys(plan.allExpoDeps)).not.toContain("ThemeProvider");
  });
});
