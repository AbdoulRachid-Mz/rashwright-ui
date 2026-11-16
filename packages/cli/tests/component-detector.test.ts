import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  analyzeSourceImports,
  detectMissingTemplateRequirements,
  detectMissingWidgetRequirements,
  extractImportTargets,
  WHITELISTED_INTERNAL_IMPORTS,
  type ComponentRequirementPlan,
} from "../src/core/component-detector.js";
import { getAllComponents, loadRegistryIndex } from "../src/core/registry.js";
import { loadAllFoundationEntries } from "../src/core/dependency-resolver.js";
import {
  getTemplateDefinition,
  listTemplateIds,
} from "../src/core/templates-registry.js";
import {
  getWidgetDefinition,
  listWidgetIds,
} from "../src/core/widgets-registry.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

const EXPECTED_COMPONENT_COUNT = 81;

function artifactFiles(
  kind: "templates" | "widgets",
  id: string,
  files: string[],
): { files: string[]; localFiles: string[] } {
  const prefix = `${kind}/${id}`;
  const sourceFiles = files
    .filter((file) => /\.(ts|tsx|d\.ts)$/.test(file))
    .map((file) => `${prefix}/${file.replace(/\\/g, "/")}`);
  return { files: sourceFiles, localFiles: sourceFiles };
}

function manifestFilesFromRegistry(folder: "hooks" | "lib"): string[] {
  const dir = join(REGISTRY_ROOT, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .flatMap((file) => {
      const parsed = JSON.parse(readFileSync(join(dir, file), "utf-8")) as {
        files?: string[];
      };
      return parsed.files ?? [];
    });
}

function issuesOf(
  value:
    | { unresolvedImports?: ComponentRequirementPlan["unresolvedImports"]; unresolved?: ComponentRequirementPlan["unresolvedImports"] },
): NonNullable<ComponentRequirementPlan["unresolvedImports"]> {
  return value.unresolvedImports ?? value.unresolved ?? [];
}

function expectNoUnresolved(
  plan: {
    unresolvedImports?: ComponentRequirementPlan["unresolvedImports"];
    unresolved?: ComponentRequirementPlan["unresolvedImports"];
  },
  label: string,
): void {
  const issues = issuesOf(plan);
  expect(
    issues,
    `${label} : imports internes non résolus\n${issues
      .map((issue) => `- ${issue.file} → ${issue.specifier} (${issue.reason})`)
      .join("\n")}`,
  ).toEqual([]);
}

describe("Détecteur de composants — exhaustivité (Phase 5)", () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), "rs-ui-detector-test-"));
    mkdirSync(join(projectRoot, "src/components/ui"), { recursive: true });
    writeFileSync(
      join(projectRoot, "package.json"),
      JSON.stringify(
        {
          name: "detector-fixture",
          private: true,
          dependencies: {
            expo: "~54.0.0",
            react: "18.3.1",
            "react-native": "0.76.0",
          },
        },
        null,
        2,
      ),
      "utf-8",
    );
  });

  afterEach(() => {
    if (existsSync(projectRoot)) {
      rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it("parcourt les 79 sources du registre sans aucun import interne non résolu", () => {
    const index = loadRegistryIndex(REGISTRY_ROOT);
    expect(index).not.toBeNull();

    const components = getAllComponents(REGISTRY_ROOT);
    expect(components).toHaveLength(EXPECTED_COMPONENT_COUNT);
    expect(components.map((entry) => entry.name).sort()).toEqual(
      [...(index?.components ?? [])].sort(),
    );

    for (const component of components) {
      const analysis = analyzeSourceImports({
        files: component.files,
        localFiles: component.files,
      });
      expectNoUnresolved(analysis, `composant ${component.name}`);
      expect(analysis.files).toEqual(component.files.map((f) => f.replace(/\\/g, "/")));
    }
  });

  it("résout les fondations, hooks et libs déclarés par leurs manifestes", () => {
    const foundations = loadAllFoundationEntries(REGISTRY_ROOT);
    expect(foundations).toHaveLength(7);

    for (const foundation of foundations) {
      const analysis = analyzeSourceImports({
        files: foundation.files,
        localFiles: foundation.files,
      });
      expectNoUnresolved(analysis, `fondation ${foundation.name}`);
    }

    for (const folder of ["hooks", "lib"] as const) {
      const files = manifestFilesFromRegistry(folder);
      expect(files.length, `${folder} doit déclarer des fichiers`).toBeGreaterThan(0);

      // Chaque lib multi-fichiers est analysée avec ses propres fichiers locaux ;
      // un hook est un artefact d'un seul fichier.
      for (const file of files) {
        const isPrimitives = file.startsWith("lib/primitives/");
        const localFiles = isPrimitives ? files.filter((f) => f.startsWith("lib/primitives/")) : [file];
        const analysis = analyzeSourceImports({ files: [file], localFiles });
        expectNoUnresolved(analysis, `${folder} ${file}`);
      }
    }
  });

  it("résout tous les imports internes des templates et widgets", () => {
    for (const id of listTemplateIds()) {
      const def = getTemplateDefinition(id);
      expect(def, `template ${id}`).not.toBeNull();
      const { files, localFiles } = artifactFiles("templates", id, def!.files);
      const analysis = analyzeSourceImports({ files, localFiles });
      expectNoUnresolved(analysis, `template ${id}`);
    }

    for (const id of listWidgetIds()) {
      const def = getWidgetDefinition(id);
      expect(def, `widget ${id}`).not.toBeNull();
      const { files, localFiles } = artifactFiles("widgets", id, def!.files);
      const analysis = analyzeSourceImports({ files, localFiles });
      expectNoUnresolved(analysis, `widget ${id}`);
    }
  });

  it("détecte les mêmes besoins pour un template/widget que pour ses composants", () => {
    for (const id of listTemplateIds()) {
      const def = getTemplateDefinition(id)!;
      const plan = detectMissingTemplateRequirements(id, projectRoot);
      expectNoUnresolved(plan, `template ${id}`);
      expect(plan.components).toEqual(
        expect.arrayContaining(def.requiredComponents.map((name) => name.toLowerCase())),
      );
      expect(plan.foundations).toEqual(
        expect.arrayContaining(def.requiresFoundations),
      );
    }

    for (const id of listWidgetIds()) {
      const def = getWidgetDefinition(id)!;
      const plan = detectMissingWidgetRequirements(id, projectRoot);
      expectNoUnresolved(plan, `widget ${id}`);
      expect(plan.components).toEqual(
        expect.arrayContaining(def.requiredComponents.map((name) => name.toLowerCase())),
      );
      expect(plan.foundations).toEqual(
        expect.arrayContaining(def.requiresFoundations),
      );
    }
  });

  it("mappe les imports réels vers les bonnes fondations", () => {
    const button = analyzeSourceImports({ files: ["components/ui/button.tsx"] });
    expectNoUnresolved(button, "button");
    expect(button.foundations).toEqual(
      expect.arrayContaining(["core-ui", "glass", "liquid", "theme"]),
    );
    expect(button.components).toContain("text");
    expect(button.expoDeps).toEqual(
      expect.arrayContaining([
        "expo-blur",
        "expo-haptics",
        "expo-linear-gradient",
        "react-native-reanimated",
      ]),
    );

    const upload = analyzeSourceImports({
      files: ["components/ui/upload-image.tsx"],
    });
    expectNoUnresolved(upload, "upload-image");
    expect(upload.foundations).toContain("upload");

    const tabBarHook = analyzeSourceImports({
      files: ["hooks/useScrollAwareTabBar.ts"],
    });
    expectNoUnresolved(tabBarHook, "useScrollAwareTabBar");
    expect(tabBarHook.foundations).toContain("tab-bar");
  });

  it("résout les alias de thème, de store et de contexte vers la bonne fondation", () => {
    const sourceRoot = mkdtempSync(join(tmpdir(), "rs-ui-detector-alias-"));
    try {
      const write = (relative: string, content: string): void => {
        const absolute = join(sourceRoot, relative);
        mkdirSync(join(absolute, ".."), { recursive: true });
        writeFileSync(absolute, content, "utf-8");
      };

      // Fichiers réels minimaux pour que la résolution aboutisse.
      write("stores/theme-store.ts", "export const useThemeStore = () => null;\n");
      write("contexts/tab-bar-context.tsx", "export const useTabBar = () => null;\n");
      write("constants/theme.ts", "export const theme = {};\n");
      write("constants/glass-theme.ts", "export const glass = {};\n");
      write("components/ui/text.tsx", "export const Text = () => null;\n");
      write(
        "components/ui/synthetic.tsx",
        [
          'import { useThemeStore } from "@/stores/theme-store";',
          'import { useTabBar } from "@/contexts/tab-bar-context";',
          'import { theme } from "@/constants/theme";',
          'import { glass } from "@/constants/glass-theme";',
          'import { Text } from "./text";',
          "export const Synthetic = () => null;",
        ].join("\n"),
      );

      const analysis = analyzeSourceImports(
        { files: ["components/ui/synthetic.tsx"] },
        { sourceRoot },
      );

      expectNoUnresolved(analysis, "alias synthétiques");
      expect(analysis.foundations).toEqual(
        expect.arrayContaining(["core-ui", "glass", "theme", "tab-bar"]),
      );
      expect(analysis.components).toContain("text");
    } finally {
      rmSync(sourceRoot, { recursive: true, force: true });
    }
  });

  it("signale un alias introuvable et un fichier non déclaré au lieu de les ignorer", () => {
    const sourceRoot = mkdtempSync(join(tmpdir(), "rs-ui-detector-unresolved-"));
    try {
      const write = (relative: string, content: string): void => {
        const absolute = join(sourceRoot, relative);
        mkdirSync(join(absolute, ".."), { recursive: true });
        writeFileSync(absolute, content, "utf-8");
      };

      write("components/ui/helper.ts", "export const helper = 1;\n");
      write(
        "components/ui/broken.tsx",
        [
          'import { missing } from "@/does/not/exist";',
          'import { helper } from "./helper";',
          "export const Broken = () => helper;",
        ].join("\n"),
      );

      const analysis = analyzeSourceImports(
        { files: ["components/ui/broken.tsx"] },
        { sourceRoot },
      );

      expect(analysis.unresolved).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            specifier: "@/does/not/exist",
            reason: expect.stringContaining("fichier introuvable"),
          }),
          expect.objectContaining({
            specifier: "./helper",
            reason: expect.stringContaining("non déclaré"),
          }),
        ]),
      );
    } finally {
      rmSync(sourceRoot, { recursive: true, force: true });
    }
  });

  it("n'accepte une whitelist que si elle est justifiée", () => {
    for (const [specifier, justification] of Object.entries(
      WHITELISTED_INTERNAL_IMPORTS,
    )) {
      expect(justification.trim(), `justification manquante pour ${specifier}`).not.toBe(
        "",
      );
    }
  });

  it("extrait les imports statiques, les ré-exports et les side-effects", () => {
    const targets = extractImportTargets(
      [
        'import React from "react";',
        'import { a } from "./a";',
        'export { b } from "./b";',
        'import "./side-effect";',
      ].join("\n"),
    );

    expect(targets).toEqual(
      expect.arrayContaining(["react", "./a", "./b", "./side-effect"]),
    );
  });
});
