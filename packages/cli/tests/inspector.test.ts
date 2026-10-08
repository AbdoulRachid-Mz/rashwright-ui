import { describe, it, expect } from "vitest";
import { infoCommand } from "../src/commands/info.js";
import { depsCommand, buildDependencyTree, renderAsciiTree } from "../src/commands/deps.js";
import { whyCommand } from "../src/commands/why.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

describe("Inspector 360° & Dependency Graph Commands (info, deps, why)", () => {
  it("infoCommand exposes 360 inspector definition", () => {
    const cmd = infoCommand();
    expect(cmd.name()).toBe("info");
    expect(cmd.description()).toContain("360°");
  });

  it("depsCommand exposes deps command definition", () => {
    const cmd = depsCommand();
    expect(cmd.name()).toBe("deps");
    expect(cmd.description()).toContain("dépendances");
  });

  it("whyCommand exposes why command definition", () => {
    const cmd = whyCommand();
    expect(cmd.name()).toBe("why");
    expect(cmd.description()).toContain("pourquoi");
  });

  it("buildDependencyTree constructs tree for component with expoDependencies", () => {
    const tree = buildDependencyTree("accordion", REGISTRY_ROOT);
    expect(tree).not.toBeNull();
    expect(tree?.name).toBe("accordion");
    expect(tree?.type).toBe("component");
    // Accordion has expoDependencies: expo-haptics
    const expoChild = tree?.children.find((c) => c.name === "expo-haptics");
    expect(expoChild).toBeDefined();
    expect(expoChild?.type).toBe("expo");
  });

  it("renderAsciiTree formats readable ASCII tree representation", () => {
    const tree = buildDependencyTree("button", REGISTRY_ROOT);
    expect(tree).not.toBeNull();
    const lines = renderAsciiTree(tree!);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0]).toContain("button");
  });
});
