import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  resolveDependencies,
  loadComponentEntry,
  loadAllComponentEntries,
} from "../src/core/dependency-resolver.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

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
    // Simulated installed: react-native-reanimated at 2.10.0, but required by SDK 54 is ~3.16.1
    const installed = {
      "react-native-reanimated": "2.10.0",
    };
    const plan = resolveDependencies(["shimmer"], 54, REGISTRY_ROOT, installed);
    expect(plan.versionConflicts.length).toBeGreaterThanOrEqual(1);
    const conflict = plan.versionConflicts.find((c) => c.pkg === "react-native-reanimated");
    expect(conflict).toBeDefined();
    expect(conflict?.installed).toBe("2.10.0");
  });

  it("resolveDependencies skips version conflict when installed version matches required major.minor", () => {
    // Matrix for SDK 54 requires ~3.16.1, installed is 3.16.0 -> matching major.minor
    const installed = {
      "react-native-reanimated": "~3.16.0",
    };
    const plan = resolveDependencies(["shimmer"], 54, REGISTRY_ROOT, installed);
    const conflict = plan.versionConflicts.find((c) => c.pkg === "react-native-reanimated");
    expect(conflict).toBeUndefined();
  });
});
