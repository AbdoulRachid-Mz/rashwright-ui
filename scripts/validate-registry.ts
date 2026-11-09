#!/usr/bin/env bun
/**
 * validate-registry.ts
 *
 * Vérifie que le registre est cohérent avec les sources, sans rien réécrire.
 *
 * Contrôles :
 *   V-1  Chaque manifeste est structurellement valide (`validateRegistryItem`)
 *   V-2  `type`, `version` et `registryVersion` sont présents et cohérents
 *   V-3  Chaque fichier/asset déclaré existe réellement
 *   V-4  Les dépendances déclarées correspondent EXACTEMENT aux imports réels
 *        (npm, Expo, optionnelles, composants, fondations, assets)
 *   V-5  Aucun `requiresComponents` fantôme, aucun cycle
 *   V-6  `index.json` ↔ manifestes ↔ `versions/expo-*.json`
 *   V-7  Les primitives UI Core restent hors de `index.json`
 *
 * Retourne 0 si tout est valide, 1 sinon.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { validateRegistryItem } from "../packages/cli/src/core/schema.js";
import {
  CORE_FILES,
  KNOWN_FOUNDATIONS,
  analyzeFiles,
  stripExt,
  toPosix,
  walkTsTsx,
  type FoundationId,
} from "./registry-utils.js";

const PROJECT_ROOT = process.cwd();
const UI_MOBILE_ROOT = join(PROJECT_ROOT, "packages", "ui-mobile");
const UI_ROOT = join(UI_MOBILE_ROOT, "components", "ui");
const REG_ROOT = join(UI_MOBILE_ROOT, "registry");
const REG_COMPONENTS = join(REG_ROOT, "components");
const REG_HOOKS = join(REG_ROOT, "hooks");
const REG_LIB = join(REG_ROOT, "lib");
const REG_FOUNDATIONS = join(REG_ROOT, "foundations");
const INDEX_PATH = join(REG_ROOT, "index.json");
const VERSIONS_ROOT = join(REG_ROOT, "versions");
const TEMPLATES_ROOT = join(UI_MOBILE_ROOT, "templates");
const WIDGETS_ROOT = join(UI_MOBILE_ROOT, "widgets");

/** Primitives UI Core réelles mais volontairement hors du registre public. */
const CORE_COMPONENTS = new Set(["text", "view"]);

type ItemKind = "component" | "hook" | "lib" | "foundation" | "template" | "widget";

interface CheckedItem {
  kind: ItemKind;
  id: string;
  /** Chemin lisible dans les messages d'erreur. */
  path: string;
  /** Base de résolution des `files` déclarés. */
  filesBaseDir: string;
  manifest: Record<string, unknown>;
}

interface IndexFile {
  version: string;
  totalComponents?: number;
  minimumExpoSdk?: number;
  sdkVersions?: number[];
  components: string[];
  categories: Record<string, string[]>;
  themes?: string[];
}

const errors: string[] = [];
const infos: string[] = [];

function fail(message: string): void {
  errors.push(message);
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
}

function relPath(path: string): string {
  return toPosix(relative(PROJECT_ROOT, path));
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function sameSet(actual: string[], expected: string[]): boolean {
  const a = sortedUnique(actual);
  const b = sortedUnique(expected);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function describeDiff(label: string, actual: string[], expected: string[]): string {
  const a = new Set(actual);
  const b = new Set(expected);
  const missing = [...b].filter((value) => !a.has(value));
  const extra = [...a].filter((value) => !b.has(value));
  const parts: string[] = [];
  if (missing.length) parts.push(`manquant: ${missing.join(", ")}`);
  if (extra.length) parts.push(`en trop: ${extra.join(", ")}`);
  if (parts.length === 0) parts.push(`ordre différent: [${actual.join(", ")}] vs [${expected.join(", ")}]`);
  return `${label} — ${parts.join(" ; ")}`;
}

function compareArrays(
  item: CheckedItem,
  field: string,
  actual: string[],
  expected: string[],
  options: { allowAbsent?: boolean } = {}
): void {
  if (!Array.isArray(item.manifest[field])) {
    if (options.allowAbsent) return;
    fail(`${item.path}: champ '${field}' absent ou invalide (attendu un tableau).`);
    return;
  }
  if (!sameSet(actual, expected)) {
    fail(`${item.path}: ${describeDiff(`'${field}' désynchronisé`, actual, expected)}`);
  }
}

function requireFields(item: CheckedItem, fields: readonly string[]): void {
  for (const field of fields) {
    if (!(field in item.manifest)) {
      fail(`${item.path}: champ obligatoire '${field}' manquant.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Collecte des manifestes
// ---------------------------------------------------------------------------

const items: CheckedItem[] = [];

function collectRegistryFolder(
  folder: string,
  kind: ItemKind,
  baseDir: string
): void {
  const dir = join(REG_ROOT, folder);
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir).filter((entry) => entry.endsWith(".json")).sort()) {
    const path = join(dir, file);
    items.push({
      kind,
      id: stripExt(file),
      path: relPath(path),
      filesBaseDir: baseDir,
      manifest: readJson(path),
    });
  }
}

collectRegistryFolder("components", "component", UI_MOBILE_ROOT);
collectRegistryFolder("hooks", "hook", UI_MOBILE_ROOT);
collectRegistryFolder("lib", "lib", UI_MOBILE_ROOT);
collectRegistryFolder("foundations", "foundation", UI_MOBILE_ROOT);

for (const family of [
  { root: TEMPLATES_ROOT, file: "template.json", kind: "template" as const },
  { root: WIDGETS_ROOT, file: "widget.json", kind: "widget" as const },
]) {
  if (!existsSync(family.root)) continue;
  for (const entry of readdirSync(family.root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(family.root, entry.name, family.file);
    if (!existsSync(path)) {
      fail(`${relPath(join(family.root, entry.name))}: ${family.file} manquant.`);
      continue;
    }
    items.push({
      kind: family.kind,
      id: entry.name,
      path: relPath(path),
      filesBaseDir: join(family.root, entry.name),
      manifest: readJson(path),
    });
  }
}

const components = items.filter((item) => item.kind === "component");
const componentNames = new Set(components.map((item) => item.id));
const foundations = items.filter((item) => item.kind === "foundation");
const foundationNames = new Set(foundations.map((item) => item.id));

// ---------------------------------------------------------------------------
// Cartographie fichier → fondation (mêmes clés relatives que sync-registry)
// ---------------------------------------------------------------------------

const foundationFileMap = new Map<string, FoundationId>();
for (const foundation of foundations) {
  for (const file of stringArray(foundation.manifest.files)) {
    const absolute = join(UI_MOBILE_ROOT, file);
    const key = stripExt(toPosix(relative(UI_ROOT, absolute)));
    const previous = foundationFileMap.get(key);
    if (previous && previous !== foundation.id) {
      fail(
        `${foundation.path}: fichier '${file}' déjà revendiqué par la fondation '${previous}'.`
      );
    } else {
      foundationFileMap.set(key, foundation.id as FoundationId);
    }
  }
}

// ---------------------------------------------------------------------------
// V-1 / V-2 : structure, type, version, registryVersion
// ---------------------------------------------------------------------------

let index: IndexFile | null = null;
try {
  index = readJson(INDEX_PATH) as unknown as IndexFile;
} catch (error) {
  fail(`registry/index.json illisible : ${(error as Error).message}`);
}

const registryVersion = index?.version;

const EXPECTED_TYPE: Record<ItemKind, string> = {
  component: "registry:ui",
  hook: "registry:hook",
  lib: "registry:lib",
  foundation: "registry:foundation",
  template: "registry:block",
  widget: "registry:block",
};

const REQUIRED_FIELDS: Record<ItemKind, readonly string[]> = {
  component: [
    "name",
    "type",
    "version",
    "registryVersion",
    "description",
    "category",
    "files",
    "dependencies",
    "expoDependencies",
    "optionalExpoDependencies",
    "requiresComponents",
    "requiresFoundations",
    "providers",
    "supportsGlass",
    "platforms",
    "nativeRebuildRequired",
  ],
  hook: [
    "name",
    "type",
    "version",
    "registryVersion",
    "description",
    "files",
    "dependencies",
    "expoDependencies",
    "optionalExpoDependencies",
    "requiresComponents",
    "requiresFoundations",
  ],
  lib: [
    "name",
    "type",
    "version",
    "registryVersion",
    "description",
    "files",
    "dependencies",
    "expoDependencies",
    "optionalExpoDependencies",
    "requiresComponents",
    "requiresFoundations",
  ],
  foundation: [
    "name",
    "type",
    "version",
    "registryVersion",
    "description",
    "category",
    "files",
    "dependencies",
    "expoDependencies",
    "optionalExpoDependencies",
    "requiresComponents",
    "requiresFoundations",
    "providers",
    "supportsGlass",
    "platforms",
    "nativeRebuildRequired",
  ],
  template: [
    "id",
    "name",
    "type",
    "version",
    "registryVersion",
    "description",
    "componentName",
    "entrypoint",
    "files",
    "requiredComponents",
    "requiresFoundations",
    "dependencies",
    "expoDependencies",
  ],
  widget: [
    "id",
    "name",
    "type",
    "version",
    "registryVersion",
    "description",
    "componentName",
    "entrypoint",
    "files",
    "requiredComponents",
    "requiresFoundations",
    "dependencies",
    "expoDependencies",
  ],
};

for (const item of items) {
  requireFields(item, REQUIRED_FIELDS[item.kind]);

  const validation = validateRegistryItem(item.manifest);
  if (!validation.success) {
    fail(`${item.path}: ${validation.error}`);
  }

  const { manifest } = item;

  if (manifest.type !== EXPECTED_TYPE[item.kind]) {
    fail(
      `${item.path}: type '${String(manifest.type)}' invalide — attendu '${EXPECTED_TYPE[item.kind]}'.`
    );
  }

  if (typeof manifest.version !== "string" || !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    fail(`${item.path}: 'version' doit être une version sémantique (ex: 1.0.0).`);
  }

  if (typeof manifest.registryVersion !== "string" || manifest.registryVersion.trim() === "") {
    fail(`${item.path}: 'registryVersion' doit être une chaîne non vide.`);
  } else if (registryVersion && manifest.registryVersion !== registryVersion) {
    fail(
      `${item.path}: registryVersion '${manifest.registryVersion}' ≠ index.version '${registryVersion}'.`
    );
  }

  const id = item.kind === "template" || item.kind === "widget" ? manifest.id : manifest.name;
  if (id !== item.id) {
    fail(`${item.path}: identifiant '${String(id)}' incohérent avec le nom de fichier/dossier '${item.id}'.`);
  }
}

// ---------------------------------------------------------------------------
// V-3 : fichiers et assets déclarés
// ---------------------------------------------------------------------------

for (const item of items) {
  const files = stringArray(item.manifest.files);
  if (files.length === 0) {
    fail(`${item.path}: 'files' ne peut pas être vide.`);
  }

  for (const file of files) {
    const abs = join(item.filesBaseDir, file);
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      fail(`${item.path}: fichier déclaré introuvable → '${file}' (cherché dans ${relPath(abs)}).`);
    }
  }

  if (item.kind === "component") {
    for (const file of files) {
      if (!file.startsWith("components/ui/")) {
        fail(`${item.path}: fichier '${file}' doit être sous 'components/ui/'.`);
      }
    }
  }

  for (const asset of stringArray(item.manifest.assets)) {
    const abs = join(UI_MOBILE_ROOT, asset);
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      fail(`${item.path}: asset déclaré introuvable → '${asset}' (cherché dans ${relPath(abs)}).`);
    }
  }
}

// ---------------------------------------------------------------------------
// V-4 : dépendances déclarées == imports réels
// ---------------------------------------------------------------------------

for (const item of items) {
  const declaredFiles = stringArray(item.manifest.files);
  const absFiles: string[] = [];
  for (const file of declaredFiles) {
    const abs = join(item.filesBaseDir, file);
    if (/\.(ts|tsx)$/.test(file) && existsSync(abs)) absFiles.push(abs);
  }

  const analysis = analyzeFiles(absFiles, UI_ROOT, {
    componentNames,
    relativeMode: item.kind === "component" ? "component" : "local",
    collectLiquid: item.kind === "component",
    foundationFileMap: item.kind === "foundation" ? foundationFileMap : undefined,
    currentFoundation: item.kind === "foundation" ? (item.id as FoundationId) : undefined,
  });

  if (analysis.unknown.length > 0) {
    fail(`${item.path}: import(s) non reconnu(s) → ${analysis.unknown.join(", ")}.`);
    continue;
  }

  if (
    item.kind === "component" ||
    item.kind === "hook" ||
    item.kind === "lib" ||
    item.kind === "foundation"
  ) {
    compareArrays(item, "dependencies", stringArray(item.manifest.dependencies), analysis.npm);
    compareArrays(item, "expoDependencies", stringArray(item.manifest.expoDependencies), analysis.expo);
    compareArrays(
      item,
      "optionalExpoDependencies",
      stringArray(item.manifest.optionalExpoDependencies),
      analysis.optionalExpo
    );
    compareArrays(
      item,
      "requiresComponents",
      stringArray(item.manifest.requiresComponents),
      analysis.components
    );
    compareArrays(
      item,
      "requiresFoundations",
      stringArray(item.manifest.requiresFoundations),
      analysis.foundations
    );
    compareArrays(item, "assets", stringArray(item.manifest.assets), analysis.assets, { allowAbsent: true });
  } else {
    compareArrays(
      item,
      "requiredComponents",
      stringArray(item.manifest.requiredComponents),
      analysis.components
    );
    compareArrays(
      item,
      "requiresFoundations",
      stringArray(item.manifest.requiresFoundations),
      analysis.foundations
    );
    compareArrays(item, "dependencies", stringArray(item.manifest.dependencies), analysis.npm);
    compareArrays(
      item,
      "expoDependencies",
      stringArray(item.manifest.expoDependencies),
      sortedUnique([...analysis.expo, ...analysis.optionalExpo])
    );
    compareArrays(item, "assets", stringArray(item.manifest.assets), analysis.assets, { allowAbsent: true });
  }
}

// ---------------------------------------------------------------------------
// V-5 : composants/fondations fantômes, fondations connues, cycles unifiés
// ---------------------------------------------------------------------------

type GraphKey = `component:${string}` | `foundation:${string}`;

const dependencyGraph = new Map<GraphKey, GraphKey[]>();

function componentRef(name: string): GraphKey {
  if (CORE_COMPONENTS.has(name)) return "foundation:core-ui";
  return `component:${name}`;
}

function foundationRef(name: string): GraphKey {
  return `foundation:${name}`;
}

for (const item of components) {
  const requires = stringArray(item.manifest.requiresComponents);
  const requiresFoundations = stringArray(item.manifest.requiresFoundations);

  const edges: GraphKey[] = [
    ...requires.map(componentRef),
    ...requiresFoundations.map(foundationRef),
  ];
  dependencyGraph.set(`component:${item.id}`, [...new Set(edges)]);

  for (const required of requires) {
    if (!componentNames.has(required) && !CORE_COMPONENTS.has(required)) {
      fail(`${item.path}: requiresComponents['${required}'] — composant inexistant.`);
    }
  }
  for (const foundation of requiresFoundations) {
    if (!KNOWN_FOUNDATIONS.has(foundation as never)) {
      fail(`${item.path}: requiresFoundations['${foundation}'] — fondation inconnue.`);
    }
  }
}

for (const item of foundations) {
  const requires = stringArray(item.manifest.requiresComponents);
  const requiresFoundations = stringArray(item.manifest.requiresFoundations);

  const edges: GraphKey[] = [
    ...requires.map(componentRef),
    ...requiresFoundations.map(foundationRef),
  ];
  dependencyGraph.set(`foundation:${item.id}`, [...new Set(edges)]);

  for (const required of requires) {
    if (!componentNames.has(required) && !CORE_COMPONENTS.has(required)) {
      fail(`${item.path}: requiresComponents['${required}'] — composant inexistant.`);
    }
  }
  for (const foundation of requiresFoundations) {
    if (!KNOWN_FOUNDATIONS.has(foundation as never)) {
      fail(`${item.path}: requiresFoundations['${foundation}'] — fondation inconnue.`);
    }
  }
}

// Correspondance exacte entre les fondations connues et leurs manifestes.
for (const name of foundationNames) {
  if (!KNOWN_FOUNDATIONS.has(name as FoundationId)) {
    fail(
      `registry/foundations/${name}.json: fondation '${name}' inconnue de KNOWN_FOUNDATIONS.`
    );
  }
}
for (const known of KNOWN_FOUNDATIONS) {
  if (!foundationNames.has(known)) {
    fail(`Fondation '${known}' déclarée dans KNOWN_FOUNDATIONS mais registry/foundations/${known}.json manquant.`);
  }
}

for (const item of items) {
  if (item.kind === "component" || item.kind === "foundation") continue;

  const requiredField =
    item.kind === "template" || item.kind === "widget"
      ? "requiredComponents"
      : "requiresComponents";
  for (const required of stringArray(item.manifest[requiredField])) {
    if (!componentNames.has(required) && !CORE_COMPONENTS.has(required)) {
      fail(`${item.path}: ${requiredField}['${required}'] — composant inexistant.`);
    }
  }
  for (const foundation of stringArray(item.manifest.requiresFoundations)) {
    if (!KNOWN_FOUNDATIONS.has(foundation as never)) {
      fail(`${item.path}: requiresFoundations['${foundation}'] — fondation inconnue.`);
    }
  }
}

const visitState = new Map<string, "pending" | "done">();

function visit(key: GraphKey, path: GraphKey[]): void {
  const state = visitState.get(key);
  if (state === "done") return;
  if (state === "pending") {
    const cycle = [...path.slice(path.indexOf(key)), key].join(" → ");
    fail(`Cycle de dépendances détecté : ${cycle}.`);
    return;
  }
  visitState.set(key, "pending");
  path.push(key);
  for (const next of dependencyGraph.get(key) ?? []) visit(next, path);
  path.pop();
  visitState.set(key, "done");
}

for (const key of dependencyGraph.keys()) visit(key, []);

// ---------------------------------------------------------------------------
// V-6 : index ↔ manifestes ↔ matrices SDK
// ---------------------------------------------------------------------------

if (index) {
  const listed = stringArray(index.components);
  const real = [...componentNames].sort();

  const missing = real.filter((name) => !listed.includes(name));
  const extra = listed.filter((name) => !real.includes(name));
  if (missing.length) fail(`index.json: composants manquants → ${missing.join(", ")}.`);
  if (extra.length) fail(`index.json: composants en trop → ${extra.join(", ")}.`);
  if (new Set(listed).size !== listed.length) fail("index.json: liste 'components' contient des doublons.");

  if (index.totalComponents !== real.length) {
    fail(`index.json: totalComponents=${String(index.totalComponents)} ≠ ${real.length} manifestes.`);
  }

  const categories = index.categories ?? {};
  const categorized: string[] = [];
  for (const [category, names] of Object.entries(categories)) {
    for (const name of names) {
      categorized.push(name);
      if (!componentNames.has(name)) {
        fail(`index.json: catégorie '${category}' référence un composant inexistant '${name}'.`);
      }
    }
  }
  const uncategorized = real.filter((name) => !categorized.includes(name));
  if (uncategorized.length) {
    fail(`index.json: composants sans catégorie → ${uncategorized.join(", ")}.`);
  }

  const matrixFiles = existsSync(VERSIONS_ROOT)
    ? readdirSync(VERSIONS_ROOT).filter((file) => /^expo-\d+\.json$/.test(file))
    : [];
  const matrixVersions = matrixFiles
    .map((file) => Number.parseInt(file.slice("expo-".length, -".json".length), 10))
    .sort((a, b) => a - b);

  const declaredSdk = Array.isArray(index.sdkVersions) ? [...index.sdkVersions].sort((a, b) => a - b) : null;
  if (!declaredSdk) {
    fail("index.json: 'sdkVersions' doit être un tableau.");
  } else if (!sameSet(declaredSdk.map(String), matrixVersions.map(String))) {
    fail(
      `index.json: sdkVersions [${declaredSdk.join(", ")}] ≠ matrices disponibles [${matrixVersions.join(", ")}].`
    );
  }

  const minimum = matrixVersions[0];
  if (index.minimumExpoSdk !== minimum) {
    fail(`index.json: minimumExpoSdk=${String(index.minimumExpoSdk)} ≠ plus petite matrice (${String(minimum)}).`);
  }

  for (const file of matrixFiles) {
    const matrix = readJson(join(VERSIONS_ROOT, file));
    const expected = Number.parseInt(file.slice("expo-".length, -".json".length), 10);
    if (matrix.sdk !== expected) {
      fail(`versions/${file}: champ 'sdk'=${String(matrix.sdk)} ≠ ${expected}.`);
    }
    const packages = matrix.packages;
    if (typeof packages !== "object" || packages === null || Object.keys(packages).length === 0) {
      fail(`versions/${file}: 'packages' doit être un objet non vide.`);
    }
  }

  // Chaque dépendance Expo déclarée par un manifeste doit être versionnée dans
  // toutes les matrices : sinon le résolveur laisserait une version vide.
  const usedExpoDeps = new Set<string>();
  for (const item of items) {
    for (const dep of [
      ...stringArray(item.manifest.expoDependencies),
      ...stringArray(item.manifest.optionalExpoDependencies),
    ]) {
      usedExpoDeps.add(dep);
    }
  }
  for (const file of matrixFiles) {
    const packages = readJson(join(VERSIONS_ROOT, file)).packages as Record<string, unknown>;
    const missingDeps = [...usedExpoDeps].filter((dep) => !(dep in packages));
    if (missingDeps.length) {
      fail(
        `versions/${file}: dépendances Expo utilisées mais non versionnées → ${missingDeps.join(", ")}.`
      );
    }
    for (const [dep, version] of Object.entries(packages)) {
      if (typeof version !== "string" || version.trim() === "") {
        fail(`versions/${file}: version vide ou invalide pour '${dep}'.`);
      }
    }
  }

  infos.push(
    `index.json : version ${index.version}, ${real.length} composants, SDK ${matrixVersions.join(", ")}.`
  );
}

// ---------------------------------------------------------------------------
// V-7 : primitives UI Core
// ---------------------------------------------------------------------------

for (const core of ["text.tsx", "view.tsx"]) {
  if (!existsSync(join(UI_ROOT, core))) {
    fail(`Primitive UI Core manquante : components/ui/${core}.`);
  }
}

if (index && (index.components ?? []).some((name) => CORE_COMPONENTS.has(name))) {
  fail("index.json: les primitives UI Core (text, view) ne doivent pas être listées comme composants publics.");
}

if (!existsSync(join(UI_ROOT, "liquid"))) {
  fail("Dossier components/ui/liquid/ manquant.");
} else {
  const liquidFiles = walkTsTsx(join(UI_ROOT, "liquid"));
  if (liquidFiles.length === 0) {
    fail("components/ui/liquid/ ne contient aucune primitive.");
  }
}

// Les sources sans manifeste public (hors primitives Core) sont une dérive.
const registeredSources = new Set(
  walkTsTsx(UI_ROOT)
    .filter((file) => {
      const rel = stripExt(toPosix(relative(UI_ROOT, file)));
      return !CORE_FILES.has(rel);
    })
    .map((file) => basename(stripExt(relative(UI_ROOT, file))))
);

for (const source of registeredSources) {
  if (!componentNames.has(source)) {
    fail(`Composant source '${source}' sans manifeste registry/components/${source}.json.`);
  }
}
for (const name of componentNames) {
  if (!registeredSources.has(name)) {
    fail(`Manifeste registry/components/${name}.json sans source components/ui/${name}.tsx.`);
  }
}

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

const counts = {
  components: components.length,
  foundations: foundations.length,
  templates: items.filter((item) => item.kind === "template").length,
  widgets: items.filter((item) => item.kind === "widget").length,
  hooks: items.filter((item) => item.kind === "hook").length,
  libs: items.filter((item) => item.kind === "lib").length,
};

console.log(
  `Manifestes : ${counts.components} composants, ${counts.foundations} fondations, ` +
    `${counts.templates} templates, ${counts.widgets} widgets, ` +
    `${counts.hooks} hooks, ${counts.libs} libs.`
);
for (const info of infos) console.log(info);

if (errors.length === 0) {
  console.log("✅ validate-registry : 0 erreur, 0 avertissement.");
  process.exit(0);
}

console.error(`❌ validate-registry : ${errors.length} erreur(s) :`);
for (const error of errors) console.error(`   - ${error}`);
process.exit(1);
