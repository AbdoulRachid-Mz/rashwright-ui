/**
 * dependency-resolver.ts — Graphe complet des dépendances d'installation.
 *
 * Le résolveur ne copie rien : il produit un plan inspectable, dans l'ordre où
 * les artefacts doivent être installés (dépendances d'abord). Il distingue
 * strictement :
 *   - composants (`registry/components|hooks|lib`) ;
 *   - fondations (`registry/foundations`) ;
 *   - dépendances npm ;
 *   - dépendances Expo (y compris optionnelles réellement importées).
 *
 * Aucune dépendance manquante n'est ignorée : elles sont toutes retournées dans
 * `diagnostics` et l'appelant doit refuser d'installer un plan incomplet.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SupportedSdk } from "./expo-detector.js";
import { readCompatibilityMatrix } from "./expo-detector.js";

export type RegistryItemType =
  | "registry:ui"
  | "registry:hook"
  | "registry:lib"
  | "registry:block"
  | "registry:foundation";

export interface ComponentRegistryEntry {
  name: string;
  type?: RegistryItemType;
  version: string;
  registryVersion?: string;
  description: string;
  category: string;
  files: string[];
  assets?: string[];
  dependencies: string[];
  expoDependencies: string[];
  optionalExpoDependencies: string[];
  requiresComponents: string[];
  requiresFoundations?: string[];
  providers: string[];
  supportsGlass: boolean;
  platforms: string[];
  nativeRebuildRequired: boolean;
  notes?: string;
  props?: Record<string, unknown>;
}

/** Un manifeste de fondation est structurellement identique à un composant. */
export interface FoundationRegistryEntry extends ComponentRegistryEntry {
  type: "registry:foundation";
}

export interface ResolvedComponent {
  name: string;
  entry: ComponentRegistryEntry;
  npmDeps: string[];
  expoDepsWithVersions: Record<string, string>;
  requiredComponents: string[];
  requiresRebuild: boolean;
}

export interface ResolvedFoundation {
  name: string;
  entry: FoundationRegistryEntry;
  npmDeps: string[];
  expoDepsWithVersions: Record<string, string>;
  requiredFoundations: string[];
}

export interface MissingDependency {
  kind: "component" | "foundation";
  name: string;
  /** Identifiant lisible du parent, ou "demande explicite". */
  requiredBy: string;
}

/** Manifeste présent sur disque mais illisible ou structurellement invalide. */
export interface InvalidManifest {
  kind: "component" | "foundation";
  name: string;
  reason: string;
}

/** Fichier source ou asset déclaré par un manifeste mais absent du registre. */
export interface MissingSourceFile {
  kind: "component" | "foundation";
  name: string;
  file: string;
}

export interface ResolutionDiagnostics {
  missingComponents: MissingDependency[];
  missingFoundations: MissingDependency[];
  cycles: string[];
  /** Manifestes corrompus : jamais confondus avec une simple absence. */
  invalidManifests: InvalidManifest[];
  /**
   * Dépendances Expo absentes de la matrice SDK. Elles restent installables via
   * `expo install` (qui choisit la version compatible) mais ne sont jamais
   * affichées avec un faux numéro de version ni remplacées par "latest".
   */
  unversionedExpoDeps: string[];
  /**
   * Sous-ensemble de `unversionedExpoDeps` correspondant à des modules natifs
   * critiques (`expo-*`, `react-native-*`). Sans version connue, l'installation
   * est bloquée : `expo install` ne doit pas être invoqué à l'aveugle.
   */
  unversionedCriticalExpoDeps: string[];
}

export interface DependencyPlan {
  components: ResolvedComponent[];
  foundations: ResolvedFoundation[];
  allNpmDeps: string[];
  allExpoDeps: Record<string, string>;
  /** Providers React requis par les artefacts (séparés des packages npm/Expo). */
  allProviders: string[];
  requiresRebuild: boolean;
  allRequiredComponents: string[];
  allRequiredFoundations: string[];
  versionConflicts: VersionConflict[];
  diagnostics: ResolutionDiagnostics;
}

/** Options supplémentaires (templates, widgets, demande explicite). */
export interface ResolveOptions {
  /** Fondations requises par un template/widget ou demandées explicitement. */
  extraFoundations?: string[];
  /** Dépendances npm d'un template/widget, en plus du graphe. */
  extraNpmDeps?: string[];
  /** Dépendances Expo d'un template/widget, en plus du graphe. */
  extraExpoDeps?: string[];
}

/**
 * C-2 — Détection des conflits de versions Expo.
 * Compare la version installée avec la version requise par le SDK.
 */
export interface VersionConflict {
  pkg: string;
  installed: string;
  required: string;
}

/**
 * Extrait le prefixe majeur.mineur d'un range semver ("~55.0.0" → "55.0", "^2.1.0" → "2.1").
 */
function extractMajorMinor(version: string): string {
  return version.replace(/^[\^~>=\s]+/, "").split(".").slice(0, 2).join(".");
}

/**
 * Retourne le nom du package réellement installable.
 * `zustand/middleware` → `zustand`, `@scope/pkg/sub` → `@scope/pkg`.
 */
export function normalizePackageName(specifier: string): string {
  const clean = specifier.trim();
  if (clean.startsWith("@")) {
    return clean.split("/").slice(0, 2).join("/");
  }
  return clean.split("/")[0];
}

/**
 * Modules natifs dont l'absence de version compatible connue doit bloquer
 * l'installation. `@expo/vector-icons` est volontairement exclu : il ne
 * contient pas de module natif propre et reste résoluble sans matrice.
 */
export function isCriticalNativePackage(specifier: string): boolean {
  const pkg = normalizePackageName(specifier);
  return pkg.startsWith("expo-") || pkg.startsWith("react-native-");
}

function normalizeEntry(
  parsed: ComponentRegistryEntry,
  fallbackType: RegistryItemType
): ComponentRegistryEntry {
  return {
    ...parsed,
    type: parsed.type ?? fallbackType,
    version: typeof parsed.version === "string" ? parsed.version : "1.0.0",
    description: typeof parsed.description === "string" ? parsed.description : "",
    category: typeof parsed.category === "string" ? parsed.category : "Custom",
    files: Array.isArray(parsed.files) ? parsed.files : [],
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    dependencies: Array.isArray(parsed.dependencies) ? parsed.dependencies : [],
    expoDependencies: Array.isArray(parsed.expoDependencies) ? parsed.expoDependencies : [],
    optionalExpoDependencies: Array.isArray(parsed.optionalExpoDependencies)
      ? parsed.optionalExpoDependencies
      : [],
    requiresComponents: Array.isArray(parsed.requiresComponents) ? parsed.requiresComponents : [],
    requiresFoundations: Array.isArray(parsed.requiresFoundations)
      ? parsed.requiresFoundations
      : [],
    providers: Array.isArray(parsed.providers) ? parsed.providers : [],
    supportsGlass: Boolean(parsed.supportsGlass),
    platforms: Array.isArray(parsed.platforms) ? parsed.platforms : ["ios", "android"],
    nativeRebuildRequired: Boolean(parsed.nativeRebuildRequired),
  };
}

interface EntryReadResult {
  entry: ComponentRegistryEntry | null;
  /** `missing` = fichier absent ; `invalid` = présent mais inutilisable. */
  state: "ok" | "missing" | "invalid";
  reason?: string;
}

function readEntryDetailed(
  path: string,
  fallbackType: RegistryItemType
): EntryReadResult {
  if (!existsSync(path)) return { entry: null, state: "missing" };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as ComponentRegistryEntry;
    if (typeof parsed.name !== "string" || parsed.name.trim() === "") {
      return {
        entry: null,
        state: "invalid",
        reason: "champ 'name' manquant ou vide",
      };
    }
    return { entry: normalizeEntry(parsed, fallbackType), state: "ok" };
  } catch (error) {
    return {
      entry: null,
      state: "invalid",
      reason: (error as Error).message,
    };
  }
}

type InvalidManifestReporter = (issue: InvalidManifest) => void;

export function loadFoundationEntry(
  name: string,
  registryRoot: string,
  onInvalid?: InvalidManifestReporter
): FoundationRegistryEntry | null {
  const cleanName = name.replace(/^(foundation|core):/, "");
  const result = readEntryDetailed(
    join(registryRoot, "foundations", `${cleanName}.json`),
    "registry:foundation"
  );
  if (result.state === "invalid") {
    onInvalid?.({
      kind: "foundation",
      name: cleanName,
      reason: result.reason ?? "manifeste invalide",
    });
  }
  if (!result.entry) return null;
  return { ...result.entry, type: "registry:foundation" };
}

export function loadAllFoundationEntries(registryRoot: string): FoundationRegistryEntry[] {
  const dir = join(registryRoot, "foundations");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => loadFoundationEntry(file.slice(0, -".json".length), registryRoot))
    .filter((entry): entry is FoundationRegistryEntry => entry !== null);
}

/**
 * Charge un composant, un hook, une lib ou une fondation.
 *
 * Préfixes supportés : `foundation:` / `core:`, `ui:` / `component:`, `hook:`,
 * `lib:`. Sans préfixe, l'ordre de recherche reste composants → hooks → libs.
 */
export function loadComponentEntry(
  name: string,
  registryRoot: string,
  onInvalid?: InvalidManifestReporter
): ComponentRegistryEntry | null {
  if (name.startsWith("foundation:") || name.startsWith("core:")) {
    return loadFoundationEntry(name, registryRoot, onInvalid);
  }

  let cleanName = name;
  let targetFolder: "components" | "hooks" | "lib" | null = null;

  if (name.startsWith("hook:")) {
    cleanName = name.slice(5);
    targetFolder = "hooks";
  } else if (name.startsWith("lib:")) {
    cleanName = name.slice(4);
    targetFolder = "lib";
  } else if (name.startsWith("ui:") || name.startsWith("component:")) {
    cleanName = name.replace(/^(ui|component):/, "");
    targetFolder = "components";
  }

  const candidateFolders = targetFolder
    ? [targetFolder]
    : (["components", "hooks", "lib"] as const);

  for (const folder of candidateFolders) {
    const fallbackType: RegistryItemType =
      folder === "hooks" ? "registry:hook" : folder === "lib" ? "registry:lib" : "registry:ui";
    const result = readEntryDetailed(
      join(registryRoot, folder, `${cleanName}.json`),
      fallbackType
    );
    if (result.state === "invalid") {
      onInvalid?.({
        kind: "component",
        name: cleanName,
        reason: result.reason ?? "manifeste invalide",
      });
    }
    if (result.entry) return result.entry;
  }

  return null;
}

export function loadAllComponentEntries(registryRoot: string): ComponentRegistryEntry[] {
  const indexPath = join(registryRoot, "index.json");
  if (!existsSync(indexPath)) return [];
  try {
    const index = JSON.parse(readFileSync(indexPath, "utf-8"));
    const names: string[] = index.components ?? [];
    return names
      .map((name) => loadComponentEntry(name, registryRoot))
      .filter((e): e is ComponentRegistryEntry => e !== null);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Graphe
// ---------------------------------------------------------------------------

type NodeKey = `component:${string}` | `foundation:${string}`;

const CORE_COMPONENT_NAMES = new Set(["text", "view"]);

function componentKey(name: string): NodeKey {
  return `component:${name}`;
}

function foundationKey(name: string): NodeKey {
  return `foundation:${name}`;
}

function isFoundationReference(name: string): boolean {
  return name.startsWith("foundation:") || name.startsWith("core:");
}

function stripFoundationPrefix(name: string): string {
  return name.replace(/^(foundation|core):/, "");
}

function prettyNode(key: NodeKey): string {
  const [kind, name] = key.split(":");
  return kind === "component" ? `component:${name}` : `foundation:${name}`;
}

function pushMissing(
  list: MissingDependency[],
  seen: Set<string>,
  kind: MissingDependency["kind"],
  name: string,
  requiredBy: string
): void {
  const key = `${kind}:${name}:${requiredBy}`;
  if (seen.has(key)) return;
  seen.add(key);
  list.push({ kind, name, requiredBy });
}

interface GraphNode {
  key: NodeKey;
  kind: "component" | "foundation";
  name: string;
  entry: ComponentRegistryEntry;
}

/**
 * Résout récursivement les composants et leurs fondations.
 *
 * Retourne un plan dont `components` / `foundations` sont ordonnés
 * dépendances d'abord. Les cycles et les artefacts introuvables sont exposés
 * dans `diagnostics` : ils ne sont jamais silencieusement filtrés.
 */
export function resolveDependencies(
  componentNames: string[],
  sdkVersion: SupportedSdk | null,
  registryRoot: string,
  installed: Record<string, string> = {},
  options: ResolveOptions = {}
): DependencyPlan {
  const compatMatrix = sdkVersion ? readCompatibilityMatrix(sdkVersion, registryRoot) : null;

  const nodes = new Map<NodeKey, GraphNode>();
  const edges = new Map<NodeKey, NodeKey[]>();
  const diagnostics: ResolutionDiagnostics = {
    missingComponents: [],
    missingFoundations: [],
    cycles: [],
    invalidManifests: [],
    unversionedExpoDeps: [],
    unversionedCriticalExpoDeps: [],
  };
  const missingSeen = new Set<string>();
  const versionConflicts: VersionConflict[] = [];
  const reportInvalid = (issue: InvalidManifest): void => {
    if (
      !diagnostics.invalidManifests.some(
        (existing) => existing.kind === issue.kind && existing.name === issue.name
      )
    ) {
      diagnostics.invalidManifests.push(issue);
    }
  };

  const seeds: NodeKey[] = [];
  for (const requested of componentNames) {
    if (isFoundationReference(requested)) {
      seeds.push(foundationKey(stripFoundationPrefix(requested)));
    } else {
      seeds.push(componentKey(requested));
    }
  }
  for (const foundation of options.extraFoundations ?? []) {
    seeds.push(foundationKey(stripFoundationPrefix(foundation)));
  }

  const queue: Array<{ key: NodeKey; requiredBy: string }> = seeds.map((key) => ({
    key,
    requiredBy: "demande explicite",
  }));
  const discovered = new Set<NodeKey>();

  while (queue.length > 0) {
    const { key, requiredBy } = queue.shift()!;
    if (discovered.has(key)) continue;
    discovered.add(key);

    const [kind, name] = key.split(":") as ["component" | "foundation", string];
    let entry: ComponentRegistryEntry | null;

    if (kind === "component") {
      // `text` et `view` sont des primitives Core servies par la fondation
      // `core-ui`, pas des composants publics.
      if (CORE_COMPONENT_NAMES.has(name)) {
        const coreKey = foundationKey("core-ui");
        edges.set(key, [coreKey]);
        if (!discovered.has(coreKey)) {
          queue.push({ key: coreKey, requiredBy: key });
        }
        continue;
      }
      entry = loadComponentEntry(name, registryRoot, reportInvalid);
      if (!entry) {
        pushMissing(diagnostics.missingComponents, missingSeen, "component", name, requiredBy);
        continue;
      }
    } else {
      entry = loadFoundationEntry(name, registryRoot, reportInvalid);
      if (!entry) {
        pushMissing(diagnostics.missingFoundations, missingSeen, "foundation", name, requiredBy);
        continue;
      }
    }

    nodes.set(key, {
      key,
      kind: kind === "component" ? "component" : "foundation",
      name,
      entry,
    });

    const nextEdges: NodeKey[] = [];

    for (const required of entry.requiresFoundations ?? []) {
      const requiredName = stripFoundationPrefix(required);
      const requiredKey = foundationKey(requiredName);
      if (requiredKey === key) continue;
      nextEdges.push(requiredKey);
      if (!discovered.has(requiredKey)) {
        queue.push({ key: requiredKey, requiredBy: key });
      }
    }

    for (const required of entry.requiresComponents ?? []) {
      if (isFoundationReference(required)) {
        const requiredKey = foundationKey(stripFoundationPrefix(required));
        if (requiredKey === key) continue;
        nextEdges.push(requiredKey);
        if (!discovered.has(requiredKey)) {
          queue.push({ key: requiredKey, requiredBy: key });
        }
        continue;
      }

      if (CORE_COMPONENT_NAMES.has(required)) {
        const requiredKey = foundationKey("core-ui");
        if (requiredKey === key) continue;
        nextEdges.push(requiredKey);
        if (!discovered.has(requiredKey)) {
          queue.push({ key: requiredKey, requiredBy: key });
        }
        continue;
      }

      const requiredKey = componentKey(required);
      if (requiredKey === key) continue;
      nextEdges.push(requiredKey);
      if (!discovered.has(requiredKey)) {
        queue.push({ key: requiredKey, requiredBy: key });
      }
    }

    edges.set(key, [...new Set(nextEdges)]);
  }

  // ── Tri topologique stable, dépendances d'abord, avec détection de cycles.
  const state = new Map<NodeKey, "visiting" | "done">();
  const stack: NodeKey[] = [];
  const order: NodeKey[] = [];

  const visit = (key: NodeKey): void => {
    const current = state.get(key);
    if (current === "done") return;
    if (current === "visiting") {
      const start = stack.indexOf(key);
      const cycle = [...stack.slice(start >= 0 ? start : 0), key].map(prettyNode).join(" → ");
      if (!diagnostics.cycles.includes(cycle)) diagnostics.cycles.push(cycle);
      return;
    }

    state.set(key, "visiting");
    stack.push(key);
    for (const dependency of edges.get(key) ?? []) {
      if (nodes.has(dependency)) visit(dependency);
    }
    stack.pop();
    state.set(key, "done");
    order.push(key);
  };

  for (const key of nodes.keys()) visit(key);

  const resolveExternals = (
    entry: ComponentRegistryEntry
  ): { npmDeps: string[]; expoDepsWithVersions: Record<string, string> } => {
    const npmDeps = [
      ...new Set(entry.dependencies.map(normalizePackageName).filter(Boolean)),
    ].filter((dep) => !(dep in installed));

    const expoDepsWithVersions: Record<string, string> = {};
    const expoSpecifiers = [
      ...entry.expoDependencies,
      ...(entry.optionalExpoDependencies ?? []),
    ];

    for (const specifier of expoSpecifiers) {
      const dep = normalizePackageName(specifier);
      if (!dep) continue;

      const requiredVersion = compatMatrix?.[dep];

      if (dep in installed) {
        if (
          requiredVersion &&
          extractMajorMinor(installed[dep]) !== extractMajorMinor(requiredVersion)
        ) {
          versionConflicts.push({
            pkg: dep,
            installed: installed[dep],
            required: requiredVersion,
          });
        }
        continue;
      }

      if (!requiredVersion) {
        if (!diagnostics.unversionedExpoDeps.includes(dep)) {
          diagnostics.unversionedExpoDeps.push(dep);
        }
        if (
          isCriticalNativePackage(dep) &&
          !diagnostics.unversionedCriticalExpoDeps.includes(dep)
        ) {
          diagnostics.unversionedCriticalExpoDeps.push(dep);
        }
        expoDepsWithVersions[dep] = "";
      } else {
        expoDepsWithVersions[dep] = requiredVersion;
      }
    }

    return { npmDeps, expoDepsWithVersions };
  };

  const allNpmDeps = new Set<string>();
  const allExpoDeps: Record<string, string> = {};
  const allRequiredComponents = new Set<string>();
  const allRequiredFoundations = new Set<string>();
  const allProviders = new Set<string>();
  let requiresRebuild = false;

  const resolvedComponents: ResolvedComponent[] = [];
  const resolvedFoundations: ResolvedFoundation[] = [];

  for (const key of order) {
    const node = nodes.get(key);
    if (!node) continue;

    const externals = resolveExternals(node.entry);
    for (const dep of externals.npmDeps) allNpmDeps.add(dep);
    for (const [dep, version] of Object.entries(externals.expoDepsWithVersions)) {
      if (!(dep in allExpoDeps) || (allExpoDeps[dep] === "" && version !== "")) {
        allExpoDeps[dep] = version;
      }
    }

    for (const required of node.entry.requiresComponents ?? []) {
      if (isFoundationReference(required)) {
        allRequiredFoundations.add(stripFoundationPrefix(required));
      } else if (!CORE_COMPONENT_NAMES.has(required)) {
        allRequiredComponents.add(required);
      }
    }
    for (const required of node.entry.requiresFoundations ?? []) {
      allRequiredFoundations.add(stripFoundationPrefix(required));
    }
    for (const provider of node.entry.providers ?? []) {
      allProviders.add(provider);
    }

    if (node.kind === "component") {
      requiresRebuild ||= node.entry.nativeRebuildRequired;
      resolvedComponents.push({
        name: node.name,
        entry: node.entry,
        npmDeps: externals.npmDeps,
        expoDepsWithVersions: externals.expoDepsWithVersions,
        requiredComponents: node.entry.requiresComponents ?? [],
        requiresRebuild: node.entry.nativeRebuildRequired,
      });
    } else {
      resolvedFoundations.push({
        name: node.name,
        entry: { ...node.entry, type: "registry:foundation" },
        npmDeps: externals.npmDeps,
        expoDepsWithVersions: externals.expoDepsWithVersions,
        requiredFoundations: (node.entry.requiresFoundations ?? []).map(stripFoundationPrefix),
      });
      allRequiredFoundations.add(node.name);
    }
  }

  // Dépendances externes explicitement fournies par un template/widget.
  for (const dep of options.extraNpmDeps ?? []) {
    const normalized = normalizePackageName(dep);
    if (normalized && !(normalized in installed)) allNpmDeps.add(normalized);
  }
  for (const dep of options.extraExpoDeps ?? []) {
    const normalized = normalizePackageName(dep);
    if (!normalized || normalized in installed) continue;
    const version = compatMatrix?.[normalized];
    if (!version && !diagnostics.unversionedExpoDeps.includes(normalized)) {
      diagnostics.unversionedExpoDeps.push(normalized);
    }
    if (!version && isCriticalNativePackage(normalized) && !diagnostics.unversionedCriticalExpoDeps.includes(normalized)) {
      diagnostics.unversionedCriticalExpoDeps.push(normalized);
    }
    if (!(normalized in allExpoDeps) || (allExpoDeps[normalized] === "" && version)) {
      allExpoDeps[normalized] = version ?? "";
    }
  }

  // Les extras de fondations doivent aussi figurer dans le plan, même s'ils
  // n'ont pas de manifeste : l'absence est déjà signalée ci-dessus.
  for (const foundation of options.extraFoundations ?? []) {
    allRequiredFoundations.add(stripFoundationPrefix(foundation));
  }

  return {
    components: resolvedComponents,
    foundations: resolvedFoundations,
    allNpmDeps: [...allNpmDeps].sort(),
    allExpoDeps,
    allProviders: [...allProviders].sort(),
    requiresRebuild,
    allRequiredComponents: [...allRequiredComponents].sort(),
    allRequiredFoundations: [...allRequiredFoundations].sort(),
    versionConflicts,
    diagnostics,
  };
}

/**
 * Vérifie que tous les fichiers et assets déclarés par le plan existent bien
 * dans la source du registre. Un plan qui référence un fichier absent est
 * incomplet : l'appelant doit refuser d'installer avant la première écriture.
 */
export function validatePlanSources(
  plan: DependencyPlan,
  sourceRoot: string
): MissingSourceFile[] {
  const missing: MissingSourceFile[] = [];

  const checkEntry = (
    kind: MissingSourceFile["kind"],
    name: string,
    entry: ComponentRegistryEntry
  ): void => {
    for (const file of [...(entry.files ?? []), ...(entry.assets ?? [])]) {
      if (!existsSync(join(sourceRoot, file))) {
        missing.push({ kind, name, file });
      }
    }
  };

  for (const component of plan.components) {
    checkEntry("component", component.name, component.entry);
  }
  for (const foundation of plan.foundations) {
    checkEntry("foundation", foundation.name, foundation.entry);
  }

  return missing;
}
