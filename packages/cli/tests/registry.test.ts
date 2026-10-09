import { describe, it, expect } from "vitest";
import {
  loadRegistryIndex,
  getAllComponents,
  getComponent,
  getCategories,
  getRegistrySourceRoot,
} from "../src/core/registry.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

describe("registry", () => {
  it("loadRegistryIndex returns index metadata", () => {
    const index = loadRegistryIndex(REGISTRY_ROOT);
    expect(index).not.toBeNull();
    expect(index?.components.length).toBeGreaterThan(50);
    expect(index?.categories).toBeDefined();
    expect(index?.themes).toBeDefined();
  });

  it("getAllComponents returns all entries", () => {
    const all = getAllComponents(REGISTRY_ROOT);
    expect(all.length).toBeGreaterThan(50);
  }, 20000);

  it("getComponent returns specific component or null", () => {
    const button = getComponent("button", REGISTRY_ROOT);
    expect(button).not.toBeNull();
    expect(button?.name).toBe("button");

    const unknown = getComponent("totally-fake-comp", REGISTRY_ROOT);
    expect(unknown).toBeNull();
  });

  it("getCategories returns categories map", () => {
    const cats = getCategories(REGISTRY_ROOT);
    expect(Object.keys(cats).length).toBeGreaterThan(0);
    expect(cats["Starter"]).toContain("button");
    expect(cats["Basic"]).toContain("badge");
  });

  it("getRegistrySourceRoot navigates two directories up", () => {
    const root = getRegistrySourceRoot("/path/to/cli/entry.js");
    expect(root.replace(/\\/g, "/")).toBe("/path/to");
  });
});
