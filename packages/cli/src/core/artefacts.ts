/**
 * artefacts.ts — Vue unifiée de tous les artefacts Rashwright UI.
 *
 * Un « artefact » désigne indifféremment un composant, une fondation, un hook,
 * une lib, un template ou un widget. Ce module centralise :
 *   - le parsing des références (`template:auth`, `hook:use-device`...) ;
 *   - le chargement normalisé d'un manifeste, quel que soit son type ;
 *   - l'état réellement installé (lockfile + intégrité) pour tous les types ;
 *   - le graphe de dépendances internes, directes et inverses ;
 *   - les dépendances Expo déclarées par chaque artefact.
 *
 * Aucune dépendance n'est inventée : un manifeste absent reste absent, et une
 * entrée de lockfile sans manifeste n'est jamais requalifiée silencieusement.
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  REGISTRY_ROOT,
  TEMPLATES_ROOT,
  WIDGETS_ROOT,
} from "./paths.js";
import {
  loadComponentEntry,
  loadAllFoundationEntries,
  type ComponentRegistryEntry,
  type FoundationRegistryEntry,
  type RegistryItemType,
} from "./dependency-resolver.js";
import {
  loadTemplatesRegistry,
  getTemplateDefinition,
  type TemplateDefinition,
} from "./templates-registry.js";
import {
  loadWidgetsRegistry,
  getWidgetDefinition,
  type WidgetDefinition,
} from "./widgets-registry.js";
import {
  readLockfile,
  checkComponentIntegrity,
  checkFoundationIntegrity,
  checkTemplateIntegrity,
  checkWidgetIntegrity,
  type FileIntegrityStatus,
  type LockedFile,
} from "./lock-manager.js";
import type { RashwrightConfig } from "./config-manager.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ArtefactType =
  | "component"
  | "foundation"
  | "hook"
  | "lib"
  | "template"
  | "widget";

export interface ArtefactRef {
  type: ArtefactType;
  id: string;
}

/** Manifeste normalisé, indépendant du type d'origine. */
export interface ArtefactManifest {
  type: ArtefactType;
  id: string;
  /** Nom d'affichage (peut différer de l'id pour templates/widgets). */
  name: string;
  version: string;
  registryVersion?: string;
  description?: string;
  /** Chemins relatifs au registre (ou au dossier autonome). */
  files: string[];
  assets: string[];
  /** Dépendances npm (non-Expo). */
  dependencies: string[];
  /** Dépendances Expo requises. */
  expoDependencies: string[];
  /** Dépendances Expo optionnelles réellement importées. */
  optionalExpoDependencies: string[];
  requiresComponents: string[];
  requiresFoundations: string[];
  /** Chemin d'installation relatif au projet (templates/widgets uniquement). */
  installPath?: string;
}

export interface IntegrityReport {
  status: FileIntegrityStatus;
  modifiedFiles: string[];
  missingFiles: string[];
}

export interface InstalledArtefact {
  type: ArtefactType;
  id: string;
  version: string;
  registryVersion?: string;
  files: LockedFile[];
  installPath?: string;
  dependencies: string[];
  expoDependencies: string[];
  requiredComponents: string[];
  integrity: IntegrityReport;
}

export interface ArtefactNode extends ArtefactRef {
  dependsOn: ArtefactRef[];
  dependencies: string[];
  expoDependencies: string[];
}

export interface ArtefactGraph {
  nodes: Map<string, ArtefactNode>;
  /** Clé `type:id` → nœuds dépendants directs. */
  reverse: Map<string, ArtefactNode[]>;
}

// ── Références ────────────────────────────────────────────────────────────────

export function artefactKey(ref: ArtefactRef): string {
  return `${ref.type}:${ref.id}`;
}

export function artefactsEqual(a: ArtefactRef, b: ArtefactRef): boolean {
  return a.type === b.type && a.id === b.id;
}

/**
 * Parse une référence d'artefact.
 *
 *   `template:auth` → template
 *   `widget:metric` → widget
 *   `foundation:theme` / `core:theme` → fondation
 *   `hook:use-device` → hook
 *   `lib:upload` → lib
 *   `ui:button` / `component:button` → composant
 *   `button` → composant (type par défaut, jamais deviné plus loin)
 */
export function parseArtefactRef(raw: string): ArtefactRef {
  const value = raw.trim();
  const colon = value.indexOf(":");
  if (colon > 0) {
    const prefix = value.slice(0, colon).toLowerCase();
    const id = value.slice(colon + 1).trim();
    if (id) {
      switch (prefix) {
        case "template":
          return { type: "template", id };
        case "widget":
          return { type: "widget", id };
        case "foundation":
        case "core":
          return { type: "foundation", id };
        case "hook":
          return { type: "hook", id };
        case "lib":
          return { type: "lib", id };
        case "ui":
        case "component":
          return { type: "component", id };
        default:
          break;
      }
    }
  }
  return { type: "component", id: value };
}

// ── Manifestes ────────────────────────────────────────────────────────────────

function fromComponentEntry(
  entry: ComponentRegistryEntry,
  fallbackType: ArtefactType,
): ArtefactManifest {
  return {
    type: fallbackType,
    id: entry.name,
    name: entry.name,
    version: entry.version,
    ...(entry.registryVersion ? { registryVersion: entry.registryVersion } : {}),
    description: entry.description,
    files: entry.files ?? [],
    assets: entry.assets ?? [],
    dependencies: entry.dependencies ?? [],
    expoDependencies: entry.expoDependencies ?? [],
    optionalExpoDependencies: entry.optionalExpoDependencies ?? [],
    requiresComponents: entry.requiresComponents ?? [],
    requiresFoundations: entry.requiresFoundations ?? [],
  };
}

function fromFoundationEntry(entry: FoundationRegistryEntry): ArtefactManifest {
  return fromComponentEntry(entry, "foundation");
}

function fromTemplate(def: TemplateDefinition): ArtefactManifest {
  return {
    type: "template",
    id: def.id,
    name: def.name,
    version: def.version,
    ...(def.registryVersion ? { registryVersion: def.registryVersion } : {}),
    description: def.description,
    files: def.files ?? [],
    assets: def.assets ?? [],
    dependencies: def.dependencies ?? [],
    expoDependencies: def.expoDependencies ?? [],
    optionalExpoDependencies: [],
    requiresComponents: def.requiredComponents ?? [],
    requiresFoundations: def.requiresFoundations ?? [],
  };
}

function fromWidget(def: WidgetDefinition): ArtefactManifest {
  return {
    type: "widget",
    id: def.id,
    name: def.name,
    version: def.version,
    ...(def.registryVersion ? { registryVersion: def.registryVersion } : {}),
    description: def.description,
    files: def.files ?? [],
    assets: def.assets ?? [],
    dependencies: def.dependencies ?? [],
    expoDependencies: def.expoDependencies ?? [],
    optionalExpoDependencies: [],
    requiresComponents: def.requiredComponents ?? [],
    requiresFoundations: def.requiresFoundations ?? [],
  };
}

function registryItemTypeToArtefactType(
  type: RegistryItemType | undefined,
): ArtefactType {
  switch (type) {
    case "registry:hook":
      return "hook";
    case "registry:lib":
      return "lib";
    case "registry:foundation":
      return "foundation";
    default:
      return "component";
  }
}

export interface LoadArtefactOptions {
  registryRoot?: string;
  templatesRoot?: string;
  widgetsRoot?: string;
}

/**
 * Charge le manifeste d'un artefact. Retourne `null` si le manifeste est absent
 * ou invalide — aucune valeur par défaut inventée.
 */
export function loadArtefact(
  ref: ArtefactRef,
  options: LoadArtefactOptions = {},
): ArtefactManifest | null {
  const registryRoot = options.registryRoot ?? REGISTRY_ROOT;
  const templatesRoot = options.templatesRoot ?? TEMPLATES_ROOT;
  const widgetsRoot = options.widgetsRoot ?? WIDGETS_ROOT;

  switch (ref.type) {
    case "template": {
      const def = getTemplateDefinition(ref.id, templatesRoot);
      return def ? fromTemplate(def) : null;
    }
    case "widget": {
      const def = getWidgetDefinition(ref.id, widgetsRoot);
      return def ? fromWidget(def) : null;
    }
    case "foundation": {
      const entry = loadComponentEntry(`foundation:${ref.id}`, registryRoot);
      return entry ? fromFoundationEntry(entry as FoundationRegistryEntry) : null;
    }
    case "hook": {
      const entry = loadComponentEntry(`hook:${ref.id}`, registryRoot);
      return entry ? fromComponentEntry(entry, "hook") : null;
    }
    case "lib": {
      const entry = loadComponentEntry(`lib:${ref.id}`, registryRoot);
      return entry ? fromComponentEntry(entry, "lib") : null;
    }
    case "component": {
      const entry = loadComponentEntry(`ui:${ref.id}`, registryRoot);
      return entry
        ? fromComponentEntry(entry, registryItemTypeToArtefactType(entry.type))
        : null;
    }
  }
}

function listManifestFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length));
}

/**
 * Charge tous les manifestes du registre, tous types confondus.
 * L'ordre est stable (composants, hooks, libs, fondations, templates, widgets).
 */
export function loadAllArtefacts(
  options: LoadArtefactOptions = {},
): ArtefactManifest[] {
  const registryRoot = options.registryRoot ?? REGISTRY_ROOT;
  const templatesRoot = options.templatesRoot ?? TEMPLATES_ROOT;
  const widgetsRoot = options.widgetsRoot ?? WIDGETS_ROOT;

  const manifests: ArtefactManifest[] = [];
  const seen = new Set<string>();
  const push = (manifest: ArtefactManifest | null): void => {
    if (!manifest) return;
    const key = artefactKey(manifest);
    if (seen.has(key)) return;
    seen.add(key);
    manifests.push(manifest);
  };

  for (const id of listManifestFiles(join(registryRoot, "components"))) {
    push(loadArtefact({ type: "component", id }, { registryRoot }));
  }
  for (const id of listManifestFiles(join(registryRoot, "hooks"))) {
    push(loadArtefact({ type: "hook", id }, { registryRoot }));
  }
  for (const id of listManifestFiles(join(registryRoot, "lib"))) {
    push(loadArtefact({ type: "lib", id }, { registryRoot }));
  }
  for (const entry of loadAllFoundationEntries(registryRoot)) {
    push(fromFoundationEntry(entry));
  }
  for (const def of loadTemplatesRegistry(templatesRoot)) {
    push(fromTemplate(def));
  }
  for (const def of loadWidgetsRegistry(widgetsRoot)) {
    push(fromWidget(def));
  }

  return manifests;
}

// ── Graphe ────────────────────────────────────────────────────────────────────

function refsFromManifest(manifest: ArtefactManifest): ArtefactRef[] {
  const refs: ArtefactRef[] = [];
  for (const name of manifest.requiresComponents) {
    refs.push({ type: "component", id: name });
  }
  for (const name of manifest.requiresFoundations) {
    refs.push({ type: "foundation", id: name });
  }
  return refs;
}

/**
 * Construit le graphe d'artefacts du registre. Les dépendances inconnues sont
 * conservées telles quelles : elles ne sont ni supprimées ni inventées.
 */
export function buildArtefactGraph(
  options: LoadArtefactOptions = {},
): ArtefactGraph {
  const manifests = loadAllArtefacts(options);
  const nodes = new Map<string, ArtefactNode>();

  for (const manifest of manifests) {
    nodes.set(artefactKey(manifest), {
      type: manifest.type,
      id: manifest.id,
      dependsOn: refsFromManifest(manifest),
      dependencies: manifest.dependencies,
      expoDependencies: manifest.expoDependencies,
    });
  }

  const reverse = new Map<string, ArtefactNode[]>();
  for (const node of nodes.values()) {
    for (const dep of node.dependsOn) {
      const key = artefactKey(dep);
      const list = reverse.get(key) ?? [];
      if (!list.some((candidate) => artefactsEqual(candidate, node))) {
        list.push(node);
      }
      reverse.set(key, list);
    }
  }

  return { nodes, reverse };
}

/**
 * Retourne les artefacts qui dépendent directement de `ref`, ou
 * transitivement si `transitive` est vrai.
 */
export function findReverseDependents(
  graph: ArtefactGraph,
  ref: ArtefactRef,
  transitive = false,
): ArtefactNode[] {
  const rootKey = artefactKey(ref);
  const result: ArtefactNode[] = [];
  const visited = new Set<string>();

  const queue: string[] = [rootKey];
  while (queue.length > 0) {
    const key = queue.shift()!;
    for (const dependent of graph.reverse.get(key) ?? []) {
      const dependentKey = artefactKey(dependent);
      if (visited.has(dependentKey)) continue;
      visited.add(dependentKey);
      result.push(dependent);
      if (transitive) queue.push(dependentKey);
    }
  }

  return result;
}

/** Retourne les artefacts qui déclarent le package Expo donné. */
export function findExpoDependents(
  graph: ArtefactGraph,
  packageName: string,
): ArtefactNode[] {
  return [...graph.nodes.values()].filter((node) =>
    node.expoDependencies.includes(packageName),
  );
}

// ── État installé ─────────────────────────────────────────────────────────────

function integrityFor(
  projectRoot: string,
  ref: ArtefactRef,
): IntegrityReport {
  switch (ref.type) {
    case "foundation":
      return checkFoundationIntegrity(projectRoot, ref.id);
    case "template":
      return checkTemplateIntegrity(projectRoot, ref.id);
    case "widget":
      return checkWidgetIntegrity(projectRoot, ref.id);
    case "component":
    case "hook":
    case "lib":
    default:
      return checkComponentIntegrity(projectRoot, ref.id);
  }
}

/**
 * Vérifie l'intégrité d'un artefact installé, quel que soit son type.
 */
export function checkArtefactIntegrity(
  projectRoot: string,
  ref: ArtefactRef,
): IntegrityReport {
  return integrityFor(projectRoot, ref);
}

/** Calcule le chemin d'installation relatif d'un template/widget. */
export function computeArtefactInstallPath(
  ref: ArtefactRef,
  config: Pick<RashwrightConfig, "componentsPath">,
): string | null {
  if (ref.type !== "template" && ref.type !== "widget") return null;
  const base = config.componentsPath.replace(/\\/g, "/");
  const componentsBase = base.endsWith("/ui") ? base.slice(0, -3) : base;
  const folder = ref.type === "template" ? "templates" : "widgets";
  return `${componentsBase}/${folder}/${ref.id}`;
}

/**
 * Retourne tous les artefacts réellement présents dans le lockfile, avec leur
 * type, leur version et leur intégrité courante. Le lockfile est la source de
 * vérité : un artefact absent du lockfile n'est pas retourné, même s'il est
 * présent sur le disque.
 */
export function getInstalledArtefacts(
  projectRoot: string,
  options: LoadArtefactOptions = {},
): InstalledArtefact[] {
  const lock = readLockfile(projectRoot);
  if (!lock) return [];

  const registryRoot = options.registryRoot ?? REGISTRY_ROOT;
  const installed: InstalledArtefact[] = [];

  for (const [id, entry] of Object.entries(lock.components ?? {})) {
    // Un hook/lib est enregistré dans `lock.components` : on récupère son type
    // réel depuis son manifeste, sans jamais le présenter comme un composant.
    // Aucune requalification n'a lieu si le manifeste est absent : l'entrée
    // reste un composant verrouillé, tel quel.
    let manifest = loadArtefact(
      { type: "component", id },
      { registryRoot, templatesRoot: options.templatesRoot, widgetsRoot: options.widgetsRoot },
    );
    let type: ArtefactType = manifest?.type ?? "component";
    if (!manifest) {
      for (const candidate of ["hook", "lib"] as const) {
        const candidateManifest = loadArtefact(
          { type: candidate, id },
          { registryRoot, templatesRoot: options.templatesRoot, widgetsRoot: options.widgetsRoot },
        );
        if (candidateManifest) {
          manifest = candidateManifest;
          type = candidate;
          break;
        }
      }
    }
    installed.push({
      type,
      id,
      version: entry.version,
      ...(entry.registryVersion ? { registryVersion: entry.registryVersion } : {}),
      files: entry.files ?? [],
      dependencies: entry.dependencies ?? [],
      expoDependencies: entry.expoDependencies ?? [],
      requiredComponents: manifest?.requiresComponents ?? [],
      integrity: integrityFor(projectRoot, { type, id }),
    });
  }

  for (const [id, entry] of Object.entries(lock.foundations ?? {})) {
    installed.push({
      type: "foundation",
      id,
      version: entry.version,
      ...(entry.registryVersion ? { registryVersion: entry.registryVersion } : {}),
      files: entry.files ?? [],
      dependencies: entry.dependencies ?? [],
      expoDependencies: entry.expoDependencies ?? [],
      requiredComponents: [],
      integrity: integrityFor(projectRoot, { type: "foundation", id }),
    });
  }

  for (const [id, entry] of Object.entries(lock.templates ?? {})) {
    installed.push({
      type: "template",
      id,
      version: entry.version,
      ...(entry.registryVersion ? { registryVersion: entry.registryVersion } : {}),
      files: entry.files ?? [],
      installPath: entry.installPath,
      dependencies: entry.dependencies ?? [],
      expoDependencies: entry.expoDependencies ?? [],
      requiredComponents: entry.requiredComponents ?? [],
      integrity: integrityFor(projectRoot, { type: "template", id }),
    });
  }

  for (const [id, entry] of Object.entries(lock.widgets ?? {})) {
    installed.push({
      type: "widget",
      id,
      version: entry.version,
      ...(entry.registryVersion ? { registryVersion: entry.registryVersion } : {}),
      files: entry.files ?? [],
      installPath: entry.installPath,
      dependencies: entry.dependencies ?? [],
      expoDependencies: entry.expoDependencies ?? [],
      requiredComponents: entry.requiredComponents ?? [],
      integrity: integrityFor(projectRoot, { type: "widget", id }),
    });
  }

  return installed;
}
