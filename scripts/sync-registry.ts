#!/usr/bin/env bun
/**
 * sync-registry.ts
 *
 * Synchronise les manifestes du registre avec le CODE RÉEL :
 *   - registry/components/*.json
 *   - registry/hooks/*.json
 *   - registry/lib/*.json
 *   - templates/*\/template.json
 *   - widgets/*\/widget.json
 *   - registry/index.json (composants, total, versions SDK)
 *
 * Champs recalculés depuis les imports :
 *   - dependencies / expoDependencies / optionalExpoDependencies
 *   - requiresComponents (composants internes + primitives text/view)
 *   - requiresFoundations (theme, glass, core-ui, liquid, responsive, upload, tab-bar)
 *   - supportsGlass / nativeRebuildRequired (composants)
 *   - type et registryVersion (version du registre, distincte de `version`)
 *
 * Les champs statiques (description, category, files, providers, platforms,
 * props, screens, defaultSize...) sont préservés.
 *
 * Le script échoue (exit 1) s'il rencontre un import interne non reconnu ou un
 * fichier/manifeste manquant : aucune dérive n'est masquée.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import {
  COMPONENT_KEY_ORDER,
  CORE_FILES,
  FOUNDATION_KEY_ORDER,
  HOOK_LIB_KEY_ORDER,
  TEMPLATE_KEY_ORDER,
  WIDGET_KEY_ORDER,
  analyzeFiles,
  reorderManifest,
  stripExt,
  toPosix,
  walkTsTsx,
} from "./registry-utils.js";

const PROJECT_ROOT = process.cwd();
const UI_MOBILE_ROOT = join(PROJECT_ROOT, "packages", "ui-mobile");
const UI_ROOT = join(UI_MOBILE_ROOT, "components", "ui");
const REG_ROOT = join(UI_MOBILE_ROOT, "registry");
const REG_COMPONENTS = join(REG_ROOT, "components");
const REG_FOUNDATIONS = join(REG_ROOT, "foundations");
const INDEX_PATH = join(REG_ROOT, "index.json");
const TEMPLATES_ROOT = join(UI_MOBILE_ROOT, "templates");
const WIDGETS_ROOT = join(UI_MOBILE_ROOT, "widgets");
const VERSIONS_ROOT = join(REG_ROOT, "versions");

type JsonObject = Record<string, unknown>;

interface SyncStats {
  written: number;
  unchanged: number;
}

const stats: SyncStats = { written: 0, unchanged: 0 };
const anomalies: string[] = [];

function readJson(path: string): JsonObject {
  return JSON.parse(readFileSync(path, "utf-8")) as JsonObject;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function writeIfChanged(path: string, manifest: JsonObject): void {
  const next = JSON.stringify(manifest, null, 2) + "\n";
  const current = readFileSync(path, "utf-8");
  if (current === next) {
    stats.unchanged += 1;
    return;
  }
  writeFileSync(path, next, "utf-8");
  stats.written += 1;
  console.log(`✓ écrit : ${toPosix(relative(PROJECT_ROOT, path))}`);
}

function readIndexVersion(): string {
  if (!existsSync(INDEX_PATH)) {
    throw new Error(`index.json introuvable : ${INDEX_PATH}`);
  }
  const index = readJson(INDEX_PATH);
  if (typeof index.version !== "string" || index.version.trim() === "") {
    throw new Error("registry/index.json doit contenir une version non vide.");
  }
  return index.version;
}

function listManifestNames(dir: string): string[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => stripExt(file))
    .sort();
}

function analyzeOrReport(
  label: string,
  absFiles: string[],
  componentNames: ReadonlySet<string>,
  relativeMode: "component" | "local",
  collectLiquid: boolean
) {
  const analysis = analyzeFiles(absFiles, UI_ROOT, {
    componentNames,
    relativeMode,
    collectLiquid,
  });
  if (analysis.unknown.length > 0) {
    anomalies.push(
      `${label} : import(s) interne(s) non reconnu(s) → ${analysis.unknown.join(", ")}`
    );
    return null;
  }
  return analysis;
}

// ---------------------------------------------------------------------------
// 0. Source de vérité : version du registre
// ---------------------------------------------------------------------------
const registryVersion = readIndexVersion();
const componentManifestNames = listManifestNames(REG_COMPONENTS);
const componentNameSet = new Set(componentManifestNames);

// ---------------------------------------------------------------------------
// 1. Composants
// ---------------------------------------------------------------------------
const componentSources = walkTsTsx(UI_ROOT).filter((abs) => {
  const rel = stripExt(toPosix(relative(UI_ROOT, abs)));
  return !CORE_FILES.has(rel);
});

const sourceByName = new Map<string, string>();
for (const abs of componentSources) {
  const rel = stripExt(toPosix(relative(UI_ROOT, abs)));
  if (rel.includes("/")) {
    anomalies.push(`Composant imbriqué non pris en charge : components/ui/${rel}.tsx`);
    continue;
  }
  sourceByName.set(basename(rel), abs);
}

for (const name of new Set([...componentNameSet, ...sourceByName.keys()])) {
  const manifestPath = join(REG_COMPONENTS, `${name}.json`);
  const sourcePath = sourceByName.get(name);

  if (!existsSync(manifestPath)) {
    anomalies.push(`Composant source '${name}' sans manifeste registry/components/${name}.json`);
    continue;
  }
  if (!sourcePath) {
    anomalies.push(`Manifeste registry/components/${name}.json sans fichier source components/ui/${name}.tsx`);
    continue;
  }

  const manifest = readJson(manifestPath);
  const analysis = analyzeOrReport(
    `components/${name}`,
    [sourcePath],
    componentNameSet,
    "component",
    true
  );
  if (!analysis) continue;

  const source = readFileSync(sourcePath, "utf-8");
  const hasGlassKeywords =
    source.includes('variant="glass"') ||
    source.includes("createGlassTheme") ||
    source.includes("glassEnabled") ||
    source.includes('variant: "glass"') ||
    source.includes("variant:'glass'") ||
    source.includes("supportsGlass");
  const hasActiveGesture =
    source.includes("Gesture.") &&
    (/Gesture\.\w+\s*\(/.test(source) ||
      /PanGestureHandler|TapGestureHandler|LongPressGestureHandler/.test(source));

  const updated: JsonObject = {
    ...manifest,
    name,
    type: "registry:ui",
    version: typeof manifest.version === "string" ? manifest.version : "1.0.0",
    registryVersion,
    dependencies: analysis.npm,
    expoDependencies: analysis.expo,
    optionalExpoDependencies: analysis.optionalExpo,
    requiresComponents: analysis.components,
    requiresFoundations: analysis.foundations,
    supportsGlass: analysis.usesLiquid || hasGlassKeywords || name === "tabs",
    nativeRebuildRequired: hasActiveGesture,
  };
  if (analysis.assets.length > 0) updated.assets = analysis.assets;
  else delete updated.assets;

  writeIfChanged(manifestPath, reorderManifest(updated, COMPONENT_KEY_ORDER));
}

// ---------------------------------------------------------------------------
// 2. Hooks et libs du registre
// ---------------------------------------------------------------------------
const REGISTRY_FAMILIES = [
  { folder: "hooks", type: "registry:hook" },
  { folder: "lib", type: "registry:lib" },
] as const;

for (const family of REGISTRY_FAMILIES) {
  const dir = join(REG_ROOT, family.folder);
  if (!existsSync(dir)) continue;

  for (const file of readdirSync(dir).filter((entry) => entry.endsWith(".json"))) {
    const manifestPath = join(dir, file);
    const name = stripExt(file);
    const manifest = readJson(manifestPath);
    const files = stringArray(manifest.files);
    const absFiles: string[] = [];

    if (files.length === 0) {
      anomalies.push(`${family.folder}/${name}.json ne déclare aucun fichier`);
      continue;
    }

    for (const relFile of files) {
      const abs = join(UI_MOBILE_ROOT, relFile);
      if (!existsSync(abs)) {
        anomalies.push(`${family.folder}/${name}.json liste '${relFile}' (fichier absent)`);
      } else if (abs.endsWith(".ts") || abs.endsWith(".tsx")) {
        absFiles.push(abs);
      }
    }

    const analysis = analyzeOrReport(
      `${family.folder}/${name}`,
      absFiles,
      componentNameSet,
      "local",
      false
    );
    if (!analysis) continue;

    const updated: JsonObject = {
      ...manifest,
      name,
      type: family.type,
      version: typeof manifest.version === "string" ? manifest.version : "1.0.0",
      registryVersion,
      dependencies: analysis.npm,
      expoDependencies: analysis.expo,
      optionalExpoDependencies: analysis.optionalExpo,
      requiresComponents: analysis.components,
      requiresFoundations: analysis.foundations,
    };
    if (analysis.assets.length > 0) updated.assets = analysis.assets;
    else delete updated.assets;

    writeIfChanged(manifestPath, reorderManifest(updated, HOOK_LIB_KEY_ORDER));
  }
}

// ---------------------------------------------------------------------------
// 3. Templates
// ---------------------------------------------------------------------------
if (existsSync(TEMPLATES_ROOT)) {
  for (const entry of readdirSync(TEMPLATES_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const templateDir = join(TEMPLATES_ROOT, entry.name);
    const manifestPath = join(templateDir, "template.json");

    if (!existsSync(manifestPath)) {
      anomalies.push(`templates/${entry.name} : template.json manquant`);
      continue;
    }

    const manifest = readJson(manifestPath);
    const id = typeof manifest.id === "string" ? manifest.id : "";
    if (id !== entry.name) {
      anomalies.push(
        `templates/${entry.name}/template.json : id '${id}' incohérent avec le dossier '${entry.name}'`
      );
      continue;
    }

    const files = stringArray(manifest.files);
    if (files.length === 0) {
      anomalies.push(`templates/${entry.name}/template.json ne déclare aucun fichier`);
      continue;
    }

    const absFiles: string[] = [];
    for (const relFile of files) {
      const abs = join(templateDir, relFile);
      if (!existsSync(abs)) {
        anomalies.push(`templates/${entry.name}/template.json liste '${relFile}' (fichier absent)`);
      } else if (abs.endsWith(".ts") || abs.endsWith(".tsx")) {
        absFiles.push(abs);
      }
    }

    const analysis = analyzeOrReport(
      `templates/${entry.name}`,
      absFiles,
      componentNameSet,
      "local",
      false
    );
    if (!analysis) continue;

    const updated: JsonObject = {
      ...manifest,
      id,
      type: "registry:block",
      version: typeof manifest.version === "string" ? manifest.version : "1.0.0",
      registryVersion,
      requiredComponents: analysis.components,
      requiresFoundations: analysis.foundations,
      dependencies: analysis.npm,
      expoDependencies: [...new Set([...analysis.expo, ...analysis.optionalExpo])].sort(),
    };
    if (analysis.assets.length > 0) updated.assets = analysis.assets;
    else delete updated.assets;

    writeIfChanged(manifestPath, reorderManifest(updated, TEMPLATE_KEY_ORDER));
  }
}

// ---------------------------------------------------------------------------
// 4. Widgets
// ---------------------------------------------------------------------------
if (existsSync(WIDGETS_ROOT)) {
  for (const entry of readdirSync(WIDGETS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const widgetDir = join(WIDGETS_ROOT, entry.name);
    const manifestPath = join(widgetDir, "widget.json");

    if (!existsSync(manifestPath)) {
      anomalies.push(`widgets/${entry.name} : widget.json manquant`);
      continue;
    }

    const manifest = readJson(manifestPath);
    const id = typeof manifest.id === "string" ? manifest.id : "";
    if (id !== entry.name) {
      anomalies.push(
        `widgets/${entry.name}/widget.json : id '${id}' incohérent avec le dossier '${entry.name}'`
      );
      continue;
    }

    const files = stringArray(manifest.files);
    if (files.length === 0) {
      anomalies.push(`widgets/${entry.name}/widget.json ne déclare aucun fichier`);
      continue;
    }

    const absFiles: string[] = [];
    for (const relFile of files) {
      const abs = join(widgetDir, relFile);
      if (!existsSync(abs)) {
        anomalies.push(`widgets/${entry.name}/widget.json liste '${relFile}' (fichier absent)`);
      } else if (abs.endsWith(".ts") || abs.endsWith(".tsx")) {
        absFiles.push(abs);
      }
    }

    const analysis = analyzeOrReport(
      `widgets/${entry.name}`,
      absFiles,
      componentNameSet,
      "local",
      false
    );
    if (!analysis) continue;

    const updated: JsonObject = {
      ...manifest,
      id,
      type: "registry:block",
      version: typeof manifest.version === "string" ? manifest.version : "1.0.0",
      registryVersion,
      requiredComponents: analysis.components,
      requiresFoundations: analysis.foundations,
      dependencies: analysis.npm,
      expoDependencies: [...new Set([...analysis.expo, ...analysis.optionalExpo])].sort(),
    };
    if (analysis.assets.length > 0) updated.assets = analysis.assets;
    else delete updated.assets;

    writeIfChanged(manifestPath, reorderManifest(updated, WIDGET_KEY_ORDER));
  }
}

// ---------------------------------------------------------------------------
// 5. Fondations
// ---------------------------------------------------------------------------
if (existsSync(REG_FOUNDATIONS)) {
  const foundationManifestNames = listManifestNames(REG_FOUNDATIONS);
  const foundationManifests = new Map<string, JsonObject>();
  for (const name of foundationManifestNames) {
    foundationManifests.set(name, readJson(join(REG_FOUNDATIONS, `${name}.json`)));
  }

  // Tous les fichiers de toutes les fondations → fondation propriétaire.
  // Les clés utilisent la même base que `resolveRelativeImport` : `components/ui`.
  const foundationFileMap = new Map<string, string>();
  for (const [name, manifest] of foundationManifests) {
    for (const file of stringArray(manifest.files)) {
      const rel = stripExt(toPosix(relative(UI_ROOT, join(UI_MOBILE_ROOT, file))));
      const previous = foundationFileMap.get(rel);
      if (previous && previous !== name) {
        anomalies.push(
          `Fichier de fondation revendiqué deux fois : '${file}' (${previous} et ${name})`
        );
        continue;
      }
      foundationFileMap.set(rel, name);
    }
  }

  for (const [name, manifest] of foundationManifests) {
    const absFiles = stringArray(manifest.files)
      .map((file) => join(UI_MOBILE_ROOT, file))
      .filter((abs) => existsSync(abs));

    const analysis = analyzeFiles(absFiles, UI_ROOT, {
      componentNames: componentNameSet,
      relativeMode: "local",
      collectLiquid: false,
      foundationFileMap,
      currentFoundation: name,
    });

    if (analysis.unknown.length > 0) {
      anomalies.push(
        `foundations/${name} : import(s) non reconnu(s) → ${analysis.unknown.join(", ")}`
      );
      continue;
    }

    const updated: JsonObject = {
      ...manifest,
      name,
      type: "registry:foundation",
      version: typeof manifest.version === "string" ? manifest.version : "1.0.0",
      registryVersion,
      assets: analysis.assets,
      dependencies: analysis.npm,
      expoDependencies: analysis.expo,
      optionalExpoDependencies: analysis.optionalExpo,
      requiresComponents: analysis.components,
      requiresFoundations: analysis.foundations,
    };

    writeIfChanged(join(REG_FOUNDATIONS, `${name}.json`), reorderManifest(updated, FOUNDATION_KEY_ORDER));
  }
}

// ---------------------------------------------------------------------------
// 6. Index du registre
// ---------------------------------------------------------------------------
if (existsSync(VERSIONS_ROOT)) {
  const sdkVersions = readdirSync(VERSIONS_ROOT)
    .map((file) => /^expo-(\d+)\.json$/.exec(file))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number.parseInt(match[1], 10))
    .sort((a, b) => a - b);

  const index = readJson(INDEX_PATH);
  index.components = [...componentManifestNames].sort();
  index.totalComponents = componentManifestNames.length;
  index.sdkVersions = sdkVersions;
  if (typeof index.minimumExpoSdk !== "number") {
    index.minimumExpoSdk = sdkVersions[0] ?? 54;
  }
  writeIfChanged(INDEX_PATH, index);
}

// ---------------------------------------------------------------------------
// 7. Rapport
// ---------------------------------------------------------------------------
console.log();
console.log(
  `✅ sync-registry terminé : ${stats.written} fichier(s) modifié(s), ${stats.unchanged} inchangé(s).`
);

if (anomalies.length > 0) {
  console.error();
  console.error(`❌ ${anomalies.length} anomalie(s) :`);
  for (const anomaly of anomalies) console.error(`   - ${anomaly}`);
  process.exit(1);
}
