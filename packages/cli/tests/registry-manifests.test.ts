import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeFiles,
  stripExt,
  toPosix,
  type AnalysisResult,
} from "../../../scripts/registry-utils.js";

/**
 * Ces tests garantissent que les manifestes ne peuvent pas mentir sur leurs
 * dépendances : tout import externe réellement présent dans les sources doit
 * être déclaré, et inversement.
 */

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const UI_MOBILE_ROOT = join(REPO_ROOT, "packages", "ui-mobile");
const UI_ROOT = join(UI_MOBILE_ROOT, "components", "ui");
const REG_ROOT = join(UI_MOBILE_ROOT, "registry");

const CORE_COMPONENTS = new Set(["text", "view"]);

interface Manifest {
  name?: string;
  id?: string;
  files: string[];
  dependencies?: string[];
  expoDependencies?: string[];
  optionalExpoDependencies?: string[];
  requiresComponents?: string[];
  requiredComponents?: string[];
  requiresFoundations?: string[];
  assets?: string[];
}

interface Artifact {
  label: string;
  manifest: Manifest;
  filesBaseDir: string;
  relativeMode: "component" | "local";
  collectLiquid: boolean;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function listRegistryManifests(folder: string): Array<{ name: string; path: string }> {
  const dir = join(REG_ROOT, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({ name: stripExt(file), path: join(dir, file) }));
}

const componentNames = new Set(listRegistryManifests("components").map((entry) => entry.name));

function collectArtifacts(): Artifact[] {
  const artifacts: Artifact[] = [];

  for (const entry of listRegistryManifests("components")) {
    artifacts.push({
      label: `components/${entry.name}`,
      manifest: readJson<Manifest>(entry.path),
      filesBaseDir: UI_MOBILE_ROOT,
      relativeMode: "component",
      collectLiquid: true,
    });
  }
  for (const entry of listRegistryManifests("hooks")) {
    artifacts.push({
      label: `hooks/${entry.name}`,
      manifest: readJson<Manifest>(entry.path),
      filesBaseDir: UI_MOBILE_ROOT,
      relativeMode: "local",
      collectLiquid: false,
    });
  }
  for (const entry of listRegistryManifests("lib")) {
    artifacts.push({
      label: `lib/${entry.name}`,
      manifest: readJson<Manifest>(entry.path),
      filesBaseDir: UI_MOBILE_ROOT,
      relativeMode: "local",
      collectLiquid: false,
    });
  }

  for (const family of [
    { root: join(UI_MOBILE_ROOT, "templates"), file: "template.json" },
    { root: join(UI_MOBILE_ROOT, "widgets"), file: "widget.json" },
  ]) {
    if (!existsSync(family.root)) continue;
    for (const entry of readdirSync(family.root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const path = join(family.root, entry.name, family.file);
      artifacts.push({
        label: `${relative(UI_MOBILE_ROOT, path)}`,
        manifest: readJson<Manifest>(path),
        filesBaseDir: join(family.root, entry.name),
        relativeMode: "local",
        collectLiquid: false,
      });
    }
  }

  return artifacts;
}

function analyzeArtifact(artifact: Artifact): AnalysisResult {
  const absFiles = artifact.manifest.files
    .map((file) => join(artifact.filesBaseDir, file))
    .filter((abs) => /\.(ts|tsx)$/.test(abs) && existsSync(abs) && statSync(abs).isFile());

  return analyzeFiles(absFiles, UI_ROOT, {
    componentNames,
    relativeMode: artifact.relativeMode,
    collectLiquid: artifact.collectLiquid,
  });
}

interface Diff {
  missing: string[];
  extra: string[];
}

function diffDeclared(declared: string[], actual: string[]): Diff {
  const declaredSet = new Set(declared);
  const actualSet = new Set(actual);
  return {
    missing: [...actualSet].filter((value) => !declaredSet.has(value)).sort(),
    extra: [...declaredSet].filter((value) => !actualSet.has(value)).sort(),
  };
}

function declaredExternals(manifest: Manifest, isBlock: boolean): { npm: string[]; expo: string[] } {
  return {
    npm: stringArray(manifest.dependencies),
    expo: isBlock
      ? stringArray(manifest.expoDependencies)
      : [...stringArray(manifest.expoDependencies), ...stringArray(manifest.optionalExpoDependencies)],
  };
}

function actualExternals(analysis: AnalysisResult): { npm: string[]; expo: string[] } {
  return {
    npm: analysis.npm,
    expo: [...analysis.expo, ...analysis.optionalExpo],
  };
}

const artifacts = collectArtifacts();

describe("registry manifests ↔ sources", () => {
  it("chaque import externe est déclaré (npm + Expo)", () => {
    const problems: string[] = [];

    for (const artifact of artifacts) {
      const isBlock = typeof artifact.manifest.id === "string";
      const analysis = analyzeArtifact(artifact);
      const declared = declaredExternals(artifact.manifest, isBlock);
      const actual = actualExternals(analysis);

      const npmDiff = diffDeclared(declared.npm, actual.npm);
      const expoDiff = diffDeclared(declared.expo, actual.expo);

      if (npmDiff.missing.length || npmDiff.extra.length) {
        problems.push(
          `${artifact.label}: dépendances npm manquantes [${npmDiff.missing.join(", ")}] / en trop [${npmDiff.extra.join(", ")}]`
        );
      }
      if (expoDiff.missing.length || expoDiff.extra.length) {
        problems.push(
          `${artifact.label}: dépendances Expo manquantes [${expoDiff.missing.join(", ")}] / en trop [${expoDiff.extra.join(", ")}]`
        );
      }
    }

    expect(problems).toEqual([]);
  });

  it("chaque import interne est déclaré (composants, fondations, assets)", () => {
    const problems: string[] = [];

    for (const artifact of artifacts) {
      const analysis = analyzeArtifact(artifact);
      const isBlock = typeof artifact.manifest.id === "string";

      if (analysis.unknown.length > 0) {
        problems.push(`${artifact.label}: imports non reconnus [${analysis.unknown.join(", ")}]`);
        continue;
      }

      const declaredComponents = isBlock
        ? stringArray(artifact.manifest.requiredComponents)
        : stringArray(artifact.manifest.requiresComponents);
      const componentDiff = diffDeclared(declaredComponents, analysis.components);
      if (componentDiff.missing.length || componentDiff.extra.length) {
        problems.push(
          `${artifact.label}: composants manquants [${componentDiff.missing.join(", ")}] / en trop [${componentDiff.extra.join(", ")}]`
        );
      }

      const foundationDiff = diffDeclared(
        stringArray(artifact.manifest.requiresFoundations),
        analysis.foundations
      );
      if (foundationDiff.missing.length || foundationDiff.extra.length) {
        problems.push(
          `${artifact.label}: fondations manquantes [${foundationDiff.missing.join(", ")}] / en trop [${foundationDiff.extra.join(", ")}]`
        );
      }

      const assetDiff = diffDeclared(stringArray(artifact.manifest.assets), analysis.assets);
      if (assetDiff.missing.length || assetDiff.extra.length) {
        problems.push(
          `${artifact.label}: assets manquants [${assetDiff.missing.join(", ")}] / en trop [${assetDiff.extra.join(", ")}]`
        );
      }
    }

    expect(problems).toEqual([]);
  });

  it("aucun requiresComponents fantôme", () => {
    const phantom: string[] = [];

    for (const artifact of artifacts) {
      const names = stringArray(artifact.manifest.requiresComponents ?? artifact.manifest.requiredComponents);
      for (const name of names) {
        if (!componentNames.has(name) && !CORE_COMPONENTS.has(name)) {
          phantom.push(`${artifact.label}: '${name}'`);
        }
      }
    }

    expect(phantom).toEqual([]);
  });

  it("registryVersion est aligné sur index.version et le type est valide", () => {
    const index = readJson<{ version: string }>(join(REG_ROOT, "index.json"));
    const problems: string[] = [];

    for (const artifact of artifacts) {
      const manifest = artifact.manifest as Manifest & { type?: string; registryVersion?: string };
      if (manifest.registryVersion !== index.version) {
        problems.push(`${artifact.label}: registryVersion '${String(manifest.registryVersion)}' ≠ '${index.version}'`);
      }
      if (typeof manifest.type !== "string" || !manifest.type.startsWith("registry:")) {
        problems.push(`${artifact.label}: type manquant ou invalide`);
      }
    }

    expect(problems).toEqual([]);
  });

  it("contrôle négatif : un import externe non déclaré est bien détecté", () => {
    const button = readJson<Manifest>(join(REG_ROOT, "components", "button.json"));
    const analysis = analyzeArtifact({
      label: "components/button",
      manifest: button,
      filesBaseDir: UI_MOBILE_ROOT,
      relativeMode: "component",
      collectLiquid: true,
    });

    const tampered: Manifest = {
      ...button,
      expoDependencies: stringArray(button.expoDependencies).filter((dep) => dep !== "expo-blur"),
    };

    const diff = diffDeclared(declaredExternals(tampered, false).expo, actualExternals(analysis).expo);
    expect(diff.missing).toContain("expo-blur");
  });

  it("les sources publiques et les manifestes se correspondent exactement", () => {
    const sources = new Set(
      readdirSync(UI_ROOT)
        .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
        .map((file) => stripExt(file))
        .filter((name) => name !== "index")
    );
    // text/view sont des primitives Core volontairement hors registre public.
    for (const core of CORE_COMPONENTS) sources.delete(core);
    // `liquid/` est un dossier, pas un fichier.
    sources.delete("liquid");

    expect([...componentNames].sort()).toEqual([...sources].sort());
  });
});
