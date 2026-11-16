import { describe, expect, it } from "vitest";
import {
  artefactKey,
  buildArtefactGraph,
  computeArtefactInstallPath,
  findExpoDependents,
  findReverseDependents,
  loadAllArtefacts,
  loadArtefact,
  parseArtefactRef,
} from "../src/core/artefacts.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

describe("artefacts — références", () => {
  it("parse les préfixes de tous les types", () => {
    expect(parseArtefactRef("button")).toEqual({ type: "component", id: "button" });
    expect(parseArtefactRef("ui:button")).toEqual({ type: "component", id: "button" });
    expect(parseArtefactRef("component:card")).toEqual({ type: "component", id: "card" });
    expect(parseArtefactRef("foundation:theme")).toEqual({ type: "foundation", id: "theme" });
    expect(parseArtefactRef("core:theme")).toEqual({ type: "foundation", id: "theme" });
    expect(parseArtefactRef("hook:use-device")).toEqual({ type: "hook", id: "use-device" });
    expect(parseArtefactRef("lib:upload")).toEqual({ type: "lib", id: "upload" });
    expect(parseArtefactRef("template:minimal")).toEqual({ type: "template", id: "minimal" });
    expect(parseArtefactRef("widget:metric")).toEqual({ type: "widget", id: "metric" });
  });

  it("ne devine pas un préfixe inconnu et conserve la valeur brute", () => {
    expect(parseArtefactRef("unknown:thing")).toEqual({
      type: "component",
      id: "unknown:thing",
    });
  });

  it("construit une clé stable type:id", () => {
    expect(artefactKey({ type: "template", id: "auth" })).toBe("template:auth");
    expect(artefactKey({ type: "component", id: "button" })).toBe("component:button");
  });
});

describe("artefacts — manifestes", () => {
  it("charge un composant avec ses dépendances déclarées", () => {
    const manifest = loadArtefact({ type: "component", id: "button" }, { registryRoot: REGISTRY_ROOT });
    expect(manifest).not.toBeNull();
    expect(manifest?.type).toBe("component");
    expect(manifest?.version).toBe("1.0.0");
    expect(manifest?.registryVersion).toBe("1.6.3");
    expect(manifest?.requiresComponents).toContain("text");
    expect(manifest?.requiresFoundations).toContain("theme");
    expect(manifest?.expoDependencies).toContain("expo-blur");
  });

  it("charge une fondation", () => {
    const manifest = loadArtefact({ type: "foundation", id: "theme" }, { registryRoot: REGISTRY_ROOT });
    expect(manifest?.type).toBe("foundation");
    expect(manifest?.id).toBe("theme");
  });

  it("charge un hook et une lib", () => {
    const hook = loadArtefact({ type: "hook", id: "use-device" }, { registryRoot: REGISTRY_ROOT });
    expect(hook?.type).toBe("hook");
    expect(hook?.expoDependencies).toContain("expo-device");

    const lib = loadArtefact({ type: "lib", id: "upload" }, { registryRoot: REGISTRY_ROOT });
    expect(lib?.type).toBe("lib");
    expect(lib?.files.length).toBeGreaterThan(1);
  });

  it("charge un template et un widget", () => {
    const template = loadArtefact({ type: "template", id: "minimal" }, { registryRoot: REGISTRY_ROOT });
    expect(template?.type).toBe("template");
    expect(template?.requiresComponents).toContain("button");

    const widget = loadArtefact({ type: "widget", id: "metric" }, { registryRoot: REGISTRY_ROOT });
    expect(widget?.type).toBe("widget");
    expect(widget?.requiresComponents).toContain("card");
  });

  it("retourne null pour un manifeste absent, sans invention", () => {
    expect(
      loadArtefact({ type: "component", id: "does-not-exist" }, { registryRoot: REGISTRY_ROOT }),
    ).toBeNull();
  });

  it("charge tous les artefacts sans doublon et couvre tous les types", () => {
    const all = loadAllArtefacts({ registryRoot: REGISTRY_ROOT });
    const keys = all.map((manifest) => artefactKey(manifest));
    expect(new Set(keys).size).toBe(keys.length);

    const types = new Set(all.map((manifest) => manifest.type));
    expect(types).toEqual(
      new Set(["component", "foundation", "hook", "lib", "template", "widget"]),
    );
  });
});

describe("artefacts — graphe", () => {
  const graph = buildArtefactGraph({ registryRoot: REGISTRY_ROOT });

  it("indexe les dépendances directes et inverses", () => {
    const button = graph.nodes.get("component:button");
    expect(button).toBeDefined();
    expect(button?.dependsOn.map(artefactKey)).toContain("component:text");

    const template = graph.nodes.get("template:minimal");
    expect(template?.dependsOn.map(artefactKey)).toContain("component:button");
  });

  it("trouve les dépendants directs d'un artefact", () => {
    const dependents = findReverseDependents(graph, { type: "component", id: "button" });
    expect(dependents.map(artefactKey)).toContain("template:minimal");
  });

  it("trouve les dépendants transitifs", () => {
    const direct = findReverseDependents(graph, { type: "component", id: "text" });
    const transitive = findReverseDependents(
      graph,
      { type: "component", id: "text" },
      true,
    );

    expect(direct.map(artefactKey)).toContain("component:button");
    expect(transitive.map(artefactKey)).toContain("component:button");
    // button dépend de text, template:minimal dépend de button.
    expect(transitive.map(artefactKey)).toContain("template:minimal");
  });

  it("conserve les dépendances inconnues dans le graphe inverse", () => {
    const dependents = findReverseDependents(graph, {
      type: "component",
      id: "manifeste-inexistant",
    });
    expect(dependents).toEqual([]);
  });

  it("trouve les artefacts qui déclarent un paquet Expo", () => {
    const dependents = findExpoDependents(graph, "expo-blur");
    expect(dependents.map(artefactKey)).toContain("component:button");
    expect(findExpoDependents(graph, "paquet-inexistant")).toEqual([]);
  });
});

describe("artefacts — chemins d'installation", () => {
  it("calcule le dossier d'un template et d'un widget", () => {
    expect(
      computeArtefactInstallPath(
        { type: "template", id: "minimal" },
        { componentsPath: "src/components/ui" },
      ),
    ).toBe("src/components/templates/minimal");

    expect(
      computeArtefactInstallPath(
        { type: "widget", id: "metric" },
        { componentsPath: "components/ui" },
      ),
    ).toBe("components/widgets/metric");
  });

  it("retourne null pour les types sans dossier dédié", () => {
    expect(
      computeArtefactInstallPath(
        { type: "component", id: "button" },
        { componentsPath: "src/components/ui" },
      ),
    ).toBeNull();
  });
});
