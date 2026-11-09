#!/usr/bin/env bun
/**
 * registry-utils.ts
 *
 * Helpers partagés par `sync-registry`, `validate-registry` et les tests de
 * cohérence du registre. Aucune écriture : uniquement de l'analyse.
 *
 * Règles de classification :
 * - `react`, `react-native` et leurs sous-chemins sont des pairs implicites.
 * - `expo-*`, `@expo/*`, `react-native-*` et `@react-native*` sont des
 *   dépendances Expo/RN (versionnées par les matrices SDK).
 * - `expo-haptics` est optionnel (les composants fonctionnent sans).
 * - tout le reste est une dépendance npm classique.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

export const CORE_FILES = new Set([
  "index",
  "text",
  "view",
  "liquid/liquid-types",
  "liquid/liquid-surface",
  "liquid/liquid-pressable",
  "liquid/liquid-highlight",
  "liquid/liquid-border",
  "liquid/liquid-glow",
  "liquid/liquid-blob",
  "liquid/liquid-shadow",
]);

export type FoundationId =
  | "theme"
  | "glass"
  | "core-ui"
  | "liquid"
  | "responsive"
  | "upload"
  | "tab-bar";

export const KNOWN_FOUNDATIONS: ReadonlySet<FoundationId> = new Set([
  "theme",
  "glass",
  "core-ui",
  "liquid",
  "responsive",
  "upload",
  "tab-bar",
]);

/**
 * Mapping des imports internes vers les fondations de la Phase 2.
 * Les identifiants correspondent aux manifestes `registry/foundations/*.json`.
 */
const FOUNDATION_BY_IMPORT: Record<string, FoundationId> = {
  "@/contexts/theme-context": "theme",
  "@/stores/theme-store": "theme",
  "@/constants/theme": "theme",
  "@/constants/glass-theme": "glass",
  "@/hooks/use-responsive": "responsive",
  "@/lib/responsive": "responsive",
  "@/lib/upload": "upload",
  "@/contexts/tab-bar-context": "tab-bar",
};

const FOUNDATION_BY_PREFIX: Array<[string, FoundationId]> = [
  ["@/theme/", "theme"],
  ["@/constants/theme/", "theme"],
  ["@/stores/theme-store/", "theme"],
  ["@/lib/upload/", "upload"],
];

export function foundationForImport(target: string): FoundationId | null {
  const exact = FOUNDATION_BY_IMPORT[target];
  if (exact) return exact;
  for (const [prefix, foundation] of FOUNDATION_BY_PREFIX) {
    if (target.startsWith(prefix)) return foundation;
  }
  return null;
}

export function toPosix(p: string): string {
  return p.split("\\").join("/");
}

export function stripExt(p: string): string {
  const ext = extname(p);
  return ext ? p.slice(0, -ext.length) : p;
}

export function walkTsTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walkTsTsx(full, out);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

/**
 * Extrait les imports statiques, les ré-exports et les imports dynamiques.
 * Volontairement simple : le dépôt n'utilise pas de syntaxe exotique.
 */
const IMPORT_RE = /(?:from\s*|import\s*\(\s*|import\s+|require\s*\(\s*)(["'])([^"'`]+)\1/g;

export function extractImports(content: string): string[] {
  const out: string[] = [];
  let match: RegExpExecArray | null;
  IMPORT_RE.lastIndex = 0;
  while ((match = IMPORT_RE.exec(content)) !== null) {
    out.push(match[2]);
  }
  return out;
}

export type ExternalKind = "expo" | "optionalExpo" | "npm";

/**
 * `react` et `react-native` sont fournis par tout projet Expo/RN : ils ne sont
 * jamais déclarés comme dépendances et ne doivent jamais être signalés comme
 * imports inconnus.
 */
export function isPeerPackage(pkg: string): boolean {
  return (
    pkg === "react" ||
    pkg.startsWith("react/") ||
    pkg === "react-native" ||
    pkg.startsWith("react-native/")
  );
}

export const ASSET_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ttf",
  ".otf",
  ".mp4",
  ".mov",
] as const;

/**
 * Un asset (image, police, vidéo) n'est ni un package npm ni un module TS :
 * il doit être copié avec l'artefact qui le référence.
 */
export function isAssetImport(target: string): boolean {
  const lower = target.toLowerCase();
  return ASSET_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Nom réellement installable d'un package.
 * `zustand/middleware` → `zustand`, `@scope/pkg/sub` → `@scope/pkg`.
 */
export function normalizePackageName(specifier: string): string {
  const clean = specifier.trim();
  if (clean.startsWith("@")) return clean.split("/").slice(0, 2).join("/");
  return clean.split("/")[0];
}

export function classifyExternalPackage(pkg: string): ExternalKind | null {
  if (isPeerPackage(pkg)) return null;
  if (pkg === "expo-haptics") return "optionalExpo";
  if (
    pkg === "expo" ||
    pkg.startsWith("expo-") ||
    pkg.startsWith("expo/") ||
    pkg.startsWith("@expo/") ||
    pkg.startsWith("react-native-") ||
    pkg.startsWith("@react-native/") ||
    pkg.startsWith("@react-native-")
  ) {
    return "expo";
  }
  return "npm";
}

export interface ResolvedRelativeImport {
  abs: string;
  /** Chemin relatif à `uiRoot`, sans extension, en POSIX. */
  rel: string;
}

export function resolveRelativeImport(
  fromAbs: string,
  target: string,
  uiRoot: string
): ResolvedRelativeImport | null {
  const base = join(dirname(fromAbs), target);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.d.ts`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return {
        abs: candidate,
        rel: stripExt(toPosix(relative(uiRoot, candidate))),
      };
    }
  }
  return null;
}

export interface AnalysisResult {
  components: string[];
  foundations: FoundationId[];
  npm: string[];
  expo: string[];
  optionalExpo: string[];
  /**
   * Assets réellement référencés (images, polices, vidéos), chemins relatifs à
   * `packages/ui-mobile`. Ils doivent accompagner l'artefact installé.
   */
  assets: string[];
  unknown: string[];
  usesLiquid: boolean;
}

export interface AnalyzeOptions {
  /** Noms des composants réellement enregistrés (registry/components/*.json). */
  componentNames: ReadonlySet<string>;
  /**
   * - `component` : les imports relatifs désignent des composants/primitive core
   *   et sont résolus depuis `components/ui/`.
   * - `local` : les imports relatifs restent dans l'artefact (template, widget,
   *   hook, lib) et sont ignorés.
   */
  relativeMode: "component" | "local";
  /** Suivre récursivement les primitives `liquid/*` pour propager leurs deps. */
  collectLiquid?: boolean;
  /**
   * Résolution des imports relatifs d'une fondation : chemin sans extension
   * (relatif à `packages/ui-mobile`) → fondation propriétaire.
   *
   * Fourni uniquement pour l'analyse des fondations. Sans lui, les imports
   * relatifs gardent le comportement de `relativeMode`.
   */
  foundationFileMap?: ReadonlyMap<string, FoundationId>;
  /** Fondation en cours d'analyse : ses auto-références ne sont pas déclarées. */
  currentFoundation?: FoundationId;
}

/**
 * Analyse un ensemble de fichiers source et retourne les dépendances
 * nécessaires, classées par famille.
 */
export function analyzeFiles(
  absFiles: string[],
  uiRoot: string,
  options: AnalyzeOptions
): AnalysisResult {
  const components = new Set<string>();
  const foundations = new Set<FoundationId>();
  const npm = new Set<string>();
  const expo = new Set<string>();
  const optionalExpo = new Set<string>();
  const assets = new Set<string>();
  const unknown = new Set<string>();

  const liquidQueue: ResolvedRelativeImport[] = [];
  const liquidSeen = new Set<string>();
  // `uiRoot` pointe sur `components/ui` ; les assets vivent à la racine du paquet.
  const uiMobileRoot = join(uiRoot, "..", "..");

  const addExternal = (pkg: string): void => {
    const normalized = normalizePackageName(pkg);
    if (!normalized) return;
    const kind = classifyExternalPackage(normalized);
    if (kind === "npm") npm.add(normalized);
    else if (kind === "expo") expo.add(normalized);
    else if (kind === "optionalExpo") optionalExpo.add(normalized);
  };

  const addAsset = (target: string, fromAbs: string): void => {
    const candidates: string[] = [];
    if (target.startsWith("@/")) {
      candidates.push(join(uiMobileRoot, target.slice(2)));
    } else if (target.startsWith(".")) {
      candidates.push(join(dirname(fromAbs), target));
    } else {
      unknown.add(target);
      return;
    }

    // Un composant embarqué peut référencer son asset via un chemin relatif
    // valable seulement APRÈS installation (ex: `../../../assets/primary.png`).
    // On retombe alors sur l'asset correspondant du paquet source.
    const assetTail = /(?:^|\/)assets\/(.+)$/.exec(toPosix(target));
    if (assetTail) candidates.push(join(uiMobileRoot, "assets", assetTail[1]));

    for (const candidateAbs of candidates) {
      if (existsSync(candidateAbs) && statSync(candidateAbs).isFile()) {
        assets.add(toPosix(relative(uiMobileRoot, candidateAbs)));
        return;
      }
    }
    unknown.add(target);
  };

  const processFile = (absPath: string): void => {
    if (!existsSync(absPath)) {
      unknown.add(absPath);
      return;
    }
    const content = readFileSync(absPath, "utf-8");

    for (const target of extractImports(content)) {
      if (isPeerPackage(target)) continue;

      if (isAssetImport(target)) {
        addAsset(target, absPath);
        continue;
      }

      if (target === "@/components/ui" || target.startsWith("@/components/ui/")) {
        const rawName = target.slice("@/components/ui".length).replace(/^\//, "");
        const name = stripExt(rawName);
        if (!name || name.includes("/")) {
          unknown.add(target);
        } else if (options.componentNames.has(name) || name === "text" || name === "view") {
          components.add(name);
          // `text` et `view` sont des primitives Core servies par la fondation
          // `core-ui` : sans elle, l'import reste non résolu.
          if (name === "text" || name === "view") foundations.add("core-ui");
        } else {
          unknown.add(target);
        }
        continue;
      }

      if (target.startsWith("@/")) {
        const foundation = foundationForImport(target);
        if (foundation) {
          if (foundation !== options.currentFoundation) foundations.add(foundation);
        } else {
          unknown.add(target);
        }
        continue;
      }

      if (target.startsWith(".")) {
        const resolved = resolveRelativeImport(absPath, target, uiRoot);

        // Analyse d'une fondation : tout import relatif doit appartenir à une
        // fondation connue (y compris elle-même). Aucun fichier n'est ignoré.
        if (options.foundationFileMap) {
          if (!resolved) {
            unknown.add(target);
            continue;
          }
          const owner = options.foundationFileMap.get(resolved.rel);
          if (!owner) {
            unknown.add(target);
            continue;
          }
          if (owner !== options.currentFoundation) foundations.add(owner);
          continue;
        }

        if (options.relativeMode === "local") continue;

        if (!resolved) {
          unknown.add(target);
          continue;
        }

        if (resolved.rel === "text" || resolved.rel === "view") {
          components.add(resolved.rel);
          foundations.add("core-ui");
          continue;
        }

        if (resolved.rel.startsWith("liquid/")) {
          foundations.add("liquid");
          if (options.collectLiquid && !liquidSeen.has(resolved.rel)) {
            liquidSeen.add(resolved.rel);
            liquidQueue.push(resolved);
          }
          continue;
        }

        if (CORE_FILES.has(resolved.rel)) continue;

        const name = resolved.rel.includes("/")
          ? resolved.rel.slice(resolved.rel.lastIndexOf("/") + 1)
          : resolved.rel;
        if (options.componentNames.has(name)) {
          components.add(name);
        } else {
          unknown.add(target);
        }
        continue;
      }

      // Package externe (Expo, RN, npm).
      const external = classifyExternalPackage(target);
      if (external !== null) {
        addExternal(target);
        continue;
      }

      // Package inconnu (builtin Node, sous-chemin exotique...).
      unknown.add(target);
    }
  };

  for (const file of absFiles) processFile(file);

  while (liquidQueue.length > 0) {
    const next = liquidQueue.shift();
    if (next) processFile(next.abs);
  }

  return {
    components: [...components].sort(),
    foundations: [...foundations].sort() as FoundationId[],
    npm: [...npm].sort(),
    expo: [...expo].sort(),
    optionalExpo: [...optionalExpo].sort(),
    assets: [...assets].sort(),
    unknown: [...unknown].sort(),
    usesLiquid: foundations.has("liquid"),
  };
}

/**
 * Réordonne un manifeste selon un ordre canonique, en conservant les champs
 * inconnus à la fin. Utilisé par sync-registry pour garantir l'idempotence.
 */
export function reorderManifest(
  manifest: Record<string, unknown>,
  order: readonly string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of order) {
    if (key in manifest && manifest[key] !== undefined) out[key] = manifest[key];
  }
  for (const key of Object.keys(manifest)) {
    if (!(key in out) && manifest[key] !== undefined) out[key] = manifest[key];
  }
  return out;
}

export const COMPONENT_KEY_ORDER = [
  "name",
  "type",
  "version",
  "registryVersion",
  "description",
  "category",
  "files",
  "assets",
  "dependencies",
  "expoDependencies",
  "optionalExpoDependencies",
  "requiresComponents",
  "requiresFoundations",
  "providers",
  "supportsGlass",
  "platforms",
  "nativeRebuildRequired",
  "notes",
  "props",
] as const;

export const TEMPLATE_KEY_ORDER = [
  "id",
  "name",
  "type",
  "version",
  "registryVersion",
  "description",
  "componentName",
  "entrypoint",
  "files",
  "assets",
  "requiredComponents",
  "requiresFoundations",
  "dependencies",
  "expoDependencies",
  "supportsGlass",
  "screens",
] as const;

export const WIDGET_KEY_ORDER = [
  "id",
  "name",
  "type",
  "version",
  "registryVersion",
  "description",
  "category",
  "componentName",
  "entrypoint",
  "files",
  "assets",
  "requiredComponents",
  "requiresFoundations",
  "dependencies",
  "expoDependencies",
  "supportsGlass",
  "defaultSize",
  "previewProps",
] as const;

export const HOOK_LIB_KEY_ORDER = [
  "name",
  "type",
  "version",
  "registryVersion",
  "description",
  "category",
  "files",
  "assets",
  "dependencies",
  "expoDependencies",
  "optionalExpoDependencies",
  "requiresComponents",
  "requiresFoundations",
  "providers",
  "supportsGlass",
  "platforms",
  "nativeRebuildRequired",
] as const;

export const FOUNDATION_KEY_ORDER = [
  "name",
  "type",
  "version",
  "registryVersion",
  "description",
  "category",
  "files",
  "assets",
  "dependencies",
  "expoDependencies",
  "optionalExpoDependencies",
  "requiresComponents",
  "requiresFoundations",
  "providers",
  "supportsGlass",
  "platforms",
  "nativeRebuildRequired",
  "notes",
] as const;
