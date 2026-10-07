/**
 * remote-registry.ts — Gestion du registre distant (remote registry) avec cache local 24h.
 *
 * Permet au CLI @rashwright/cli d'être utilisé de façon totalement autonome
 * (sans avoir besoin que @rashwright/ui-mobile soit installé localement).
 *
 * Résolution :
 *  1. Si --registry <url> fourni → Téléchargement depuis cette URL.
 *  2. Si le registre local existe (node_modules/@rashwright/ui-mobile ou monorepo) → Utilisation locale directe.
 *  3. Fallback CDN npm (https://unpkg.com/@rashwright/ui-mobile@latest).
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { REGISTRY_ROOT, SOURCE_ROOT } from "./paths.js";
import type { ComponentRegistryEntry } from "./dependency-resolver.js";
import type { RegistryIndex } from "./registry.js";

export const DEFAULT_REMOTE_REGISTRY = "https://unpkg.com/@rashwright/ui-mobile@latest";
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function getCacheDir(): string {
  return join(homedir(), ".rs-ui", "cache");
}

function getMetadataPath(): string {
  return join(homedir(), ".rs-ui", "cache-metadata.json");
}

interface CacheMetadata {
  lastFetchedAt: number;
  registryUrl: string;
}

function readMetadata(): CacheMetadata | null {
  const metaPath = getMetadataPath();
  if (!existsSync(metaPath)) return null;
  try {
    return JSON.parse(readFileSync(metaPath, "utf-8")) as CacheMetadata;
  } catch {
    return null;
  }
}

function writeMetadata(url: string): void {
  const metaPath = getMetadataPath();
  const dir = dirname(metaPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const meta: CacheMetadata = {
    lastFetchedAt: Date.now(),
    registryUrl: url,
  };
  try {
    writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8");
  } catch {
    // Non-bloquant si les permissions interdisent l'écriture dans homedir
  }
}

export function isCacheValid(url: string, maxAgeMs = CACHE_TTL_MS): boolean {
  const meta = readMetadata();
  if (!meta) return false;
  if (meta.registryUrl !== url) return false;
  return Date.now() - meta.lastFetchedAt < maxAgeMs;
}

export function hasLocalRegistry(): boolean {
  return existsSync(join(REGISTRY_ROOT, "index.json"));
}

export async function fetchRemoteText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "rashwright-cli" },
  });
  if (!res.ok) {
    throw new Error(`Échec de récupération (${res.status} ${res.statusText}) : ${url}`);
  }
  return await res.text();
}

export async function fetchRemoteJson<T>(url: string): Promise<T> {
  const text = await fetchRemoteText(url);
  return JSON.parse(text) as T;
}

export interface ResolvedRegistryPaths {
  registryRoot: string;
  sourceRoot: string;
  isRemote: boolean;
  registryUrl?: string;
}

/**
 * Résout la racine du registre et des sources.
 * Si le registre local est disponible et qu'aucune URL personnalisée n'est fournie,
 * renvoie les chemins locaux. Sinon, télécharge et synchronise le cache local.
 */
export async function resolveRegistry(options: {
  registryUrl?: string;
  forceRemote?: boolean;
  fresh?: boolean;
} = {}): Promise<ResolvedRegistryPaths> {
  const customUrl = options.registryUrl || process.env.RS_UI_REGISTRY;

  // 1. Utilisation du registre local si disponible et non forcé
  if (!customUrl && !options.forceRemote && hasLocalRegistry()) {
    return {
      registryRoot: REGISTRY_ROOT,
      sourceRoot: SOURCE_ROOT,
      isRemote: false,
    };
  }

  // 2. Mode remote
  const baseUrl = (customUrl || DEFAULT_REMOTE_REGISTRY).replace(/\/$/, "");
  const cacheDir = getCacheDir();
  const cachedRegistryRoot = join(cacheDir, "registry");
  const cachedIndexPath = join(cachedRegistryRoot, "index.json");

  const isCacheFresh = !options.fresh && isCacheValid(baseUrl) && existsSync(cachedIndexPath);

  if (!isCacheFresh) {
    try {
      const indexUrl = `${baseUrl}/registry/index.json`;
      const indexData = await fetchRemoteJson<RegistryIndex>(indexUrl);

      const targetDir = dirname(cachedIndexPath);
      if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

      writeFileSync(cachedIndexPath, JSON.stringify(indexData, null, 2), "utf-8");
      writeMetadata(baseUrl);
    } catch (err) {
      // Si le réseau échoue mais qu'on a déjà un cache local même expiré, l'utiliser en secours
      if (existsSync(cachedIndexPath)) {
        return {
          registryRoot: cachedRegistryRoot,
          sourceRoot: cacheDir,
          isRemote: true,
          registryUrl: baseUrl,
        };
      }
      throw new Error(
        `Impossible d'accéder au registre distant (${baseUrl}) et aucun cache local disponible.\n` +
          `Détail : ${(err as Error).message}`
      );
    }
  }

  return {
    registryRoot: cachedRegistryRoot,
    sourceRoot: cacheDir,
    isRemote: true,
    registryUrl: baseUrl,
  };
}

/**
 * Assure que le fichier JSON d'un composant ainsi que l'ensemble de ses fichiers sources
 * sont présents localement (téléchargés depuis le CDN si nécessaire).
 */
export async function ensureComponentDownloaded(
  componentName: string,
  options: {
    registryUrl?: string;
    sourceRoot?: string;
    registryRoot?: string;
  } = {}
): Promise<ComponentRegistryEntry | null> {
  const baseUrl = (options.registryUrl || process.env.RS_UI_REGISTRY || DEFAULT_REMOTE_REGISTRY).replace(/\/$/, "");
  const cacheDir = options.sourceRoot || getCacheDir();
  const cachedRegistryRoot = options.registryRoot || join(cacheDir, "registry");

  const componentJsonPath = join(cachedRegistryRoot, "components", `${componentName}.json`);

  let entry: ComponentRegistryEntry;

  if (existsSync(componentJsonPath)) {
    try {
      entry = JSON.parse(readFileSync(componentJsonPath, "utf-8")) as ComponentRegistryEntry;
    } catch {
      entry = await fetchRemoteJson<ComponentRegistryEntry>(
        `${baseUrl}/registry/components/${componentName}.json`
      );
    }
  } else {
    try {
      entry = await fetchRemoteJson<ComponentRegistryEntry>(
        `${baseUrl}/registry/components/${componentName}.json`
      );
      const jsonDir = dirname(componentJsonPath);
      if (!existsSync(jsonDir)) mkdirSync(jsonDir, { recursive: true });
      writeFileSync(componentJsonPath, JSON.stringify(entry, null, 2), "utf-8");
    } catch {
      return null;
    }
  }

  // Télécharger les fichiers sources associés (ex: components/ui/button.tsx)
  if (Array.isArray(entry.files)) {
    for (const relFile of entry.files) {
      const destPath = join(cacheDir, relFile);
      if (!existsSync(destPath)) {
        try {
          const fileUrl = `${baseUrl}/${relFile}`;
          const content = await fetchRemoteText(fileUrl);
          const destDir = dirname(destPath);
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
          writeFileSync(destPath, content, "utf-8");
        } catch {
          // Si le téléchargement échoue pour un fichier individuel
        }
      }
    }
  }

  return entry;
}

/**
 * Assure que la matrice de compatibilité Expo d'un SDK spécifique est téléchargée en cache.
 */
export async function ensureCompatibilityMatrixDownloaded(
  sdkVersion: number | string,
  options: { registryUrl?: string; registryRoot?: string } = {}
): Promise<void> {
  const baseUrl = (options.registryUrl || process.env.RS_UI_REGISTRY || DEFAULT_REMOTE_REGISTRY).replace(/\/$/, "");
  const cacheDir = getCacheDir();
  const cachedRegistryRoot = options.registryRoot || join(cacheDir, "registry");
  const matrixPath = join(cachedRegistryRoot, "versions", `expo-${sdkVersion}.json`);

  if (!existsSync(matrixPath)) {
    try {
      const matrixUrl = `${baseUrl}/registry/versions/expo-${sdkVersion}.json`;
      const content = await fetchRemoteText(matrixUrl);
      const destDir = dirname(matrixPath);
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
      writeFileSync(matrixPath, content, "utf-8");
    } catch {
      // Fallback silencieux si la matrice n'est pas trouvée
    }
  }
}

/**
 * Vide le cache local du registre.
 */
export function clearRegistryCache(): void {
  const cacheDir = getCacheDir();
  if (existsSync(cacheDir)) {
    rmSync(cacheDir, { recursive: true, force: true });
  }
  const metaPath = getMetadataPath();
  if (existsSync(metaPath)) {
    rmSync(metaPath, { force: true });
  }
}
