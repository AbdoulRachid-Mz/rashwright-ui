import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SupportedSdk } from "./expo-detector.js";
import { readCompatibilityMatrix } from "./expo-detector.js";

export interface ComponentRegistryEntry {
  name: string;
  version: string;
  description: string;
  category: string;
  files: string[];
  dependencies: string[];
  expoDependencies: string[];
  optionalExpoDependencies: string[];
  requiresComponents: string[];
  providers: string[];
  supportsGlass: boolean;
  platforms: string[];
  nativeRebuildRequired: boolean;
  notes?: string;
  props?: Record<string, unknown>;
}

export interface ResolvedComponent {
  name: string;
  entry: ComponentRegistryEntry;
  npmDeps: string[];
  expoDepsWithVersions: Record<string, string>;
  requiredComponents: string[];
  requiresRebuild: boolean;
}

export interface DependencyPlan {
  components: ResolvedComponent[];
  allNpmDeps: string[];
  allExpoDeps: Record<string, string>;
  requiresRebuild: boolean;
  allRequiredComponents: string[];
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
 * Resolve all dependencies for a list of component names.
 * Returns the full dependency plan including transitive component deps and version conflicts.
 */
export function resolveDependencies(
  componentNames: string[],
  sdkVersion: SupportedSdk | null,
  registryRoot: string,
  installed: Record<string, string> = {}
): DependencyPlan & { versionConflicts: VersionConflict[] } {
  const compatMatrix = sdkVersion ? readCompatibilityMatrix(sdkVersion, registryRoot) : null;

  const resolved = new Map<string, ResolvedComponent>();
  const queue = [...componentNames];
  const seen = new Set<string>();
  const versionConflicts: VersionConflict[] = [];

  while (queue.length > 0) {
    const name = queue.shift()!;
    if (seen.has(name)) continue;
    seen.add(name);

    const entry = loadComponentEntry(name, registryRoot);
    if (!entry) continue;

    // ── C-2 : Résolution Expo deps avec détection de conflits de versions
    const expoDepsWithVersions: Record<string, string> = {};
    for (const dep of entry.expoDependencies) {
      const requiredVersion = compatMatrix?.[dep] ?? "latest";

      if (dep in installed) {
        // Vérifier compatibilité majeur.mineur entre version installée et requise
        if (
          requiredVersion !== "latest" &&
          extractMajorMinor(installed[dep]) !== extractMajorMinor(requiredVersion)
        ) {
          versionConflicts.push({ pkg: dep, installed: installed[dep], required: requiredVersion });
        }
        continue; // ne pas re-installer
      }
      expoDepsWithVersions[dep] = requiredVersion;
    }

    // Resolve npm (non-expo) deps
    const npmDeps = entry.dependencies.filter((d) => !(d in installed));

    // Enqueue required components not yet resolved
    for (const reqComp of entry.requiresComponents) {
      if (!seen.has(reqComp)) queue.push(reqComp);
    }

    resolved.set(name, {
      name,
      entry,
      npmDeps,
      expoDepsWithVersions,
      requiredComponents: entry.requiresComponents,
      requiresRebuild: entry.nativeRebuildRequired,
    });
  }

  // Flatten all deps, deduplicate
  const allNpmDeps = [...new Set([...resolved.values()].flatMap((r) => r.npmDeps))];
  const allExpoDeps: Record<string, string> = {};
  for (const r of resolved.values()) {
    for (const [pkg, ver] of Object.entries(r.expoDepsWithVersions)) {
      if (!(pkg in allExpoDeps)) allExpoDeps[pkg] = ver;
    }
  }
  const requiresRebuild = [...resolved.values()].some((r) => r.requiresRebuild);
  const allRequiredComponents = [...new Set([...resolved.values()].flatMap((r) => r.requiredComponents))];

  return {
    components: [...resolved.values()],
    allNpmDeps,
    allExpoDeps,
    requiresRebuild,
    allRequiredComponents,
    versionConflicts,
  };
}


export function loadComponentEntry(
  name: string,
  registryRoot: string
): ComponentRegistryEntry | null {
  const path = join(registryRoot, "components", `${name}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as ComponentRegistryEntry;
  } catch {
    return null;
  }
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
