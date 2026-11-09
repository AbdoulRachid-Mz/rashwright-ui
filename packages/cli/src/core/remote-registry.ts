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
  /** Le cache local a été utilisé parce que le registre distant est injoignable. */
  stale?: boolean;
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
          stale: true,
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
 * Assure que le fichier JSON d'un composant ainsi que l'ensemble de ses fichiers
 * sources et assets sont présents localement.
 *
 * Toute anomalie est une erreur explicite : un manifeste absent/illisible ou un
 * fichier déclaré non téléchargeable ne doit jamais produire un plan partiel.
 */
export async function ensureComponentDownloaded(
  componentName: string,
  options: {
    registryUrl?: string;
    sourceRoot?: string;
    registryRoot?: string;
  } = {}
): Promise<ComponentRegistryEntry> {
  const baseUrl = (options.registryUrl || process.env.RS_UI_REGISTRY || DEFAULT_REMOTE_REGISTRY).replace(/\/$/, "");
  const cacheDir = options.sourceRoot || getCacheDir();
  const cachedRegistryRoot = options.registryRoot || join(cacheDir, "registry");

  const componentJsonPath = join(cachedRegistryRoot, "components", `${componentName}.json`);

  const fetchManifest = async (): Promise<ComponentRegistryEntry> => {
    try {
      return await fetchRemoteJson<ComponentRegistryEntry>(
        `${baseUrl}/registry/components/${componentName}.json`
      );
    } catch (error) {
      throw new Error(
        `Composant '${componentName}' introuvable dans le registre distant (${baseUrl}).\n` +
          `Détail : ${(error as Error).message}`
      );
    }
  };

  let entry: ComponentRegistryEntry;
  let cachedInvalidReason: string | null = null;

  if (existsSync(componentJsonPath)) {
    try {
      entry = JSON.parse(readFileSync(componentJsonPath, "utf-8")) as ComponentRegistryEntry;
    } catch (error) {
      cachedInvalidReason = (error as Error).message;
      entry = await fetchManifest();
      const jsonDir = dirname(componentJsonPath);
      if (!existsSync(jsonDir)) mkdirSync(jsonDir, { recursive: true });
      writeFileSync(componentJsonPath, JSON.stringify(entry, null, 2), "utf-8");
      if (cachedInvalidReason) {
        // Le cache a été réparé, mais l'utilisateur doit savoir que le manifeste
        // local était corrompu (aucun échec silencieux masqué).
        console.warn(
          `  ⚠ Manifeste en cache illisible pour '${componentName}' (${cachedInvalidReason}) — retéléchargé.`
        );
      }
    }
  } else {
    entry = await fetchManifest();
    const jsonDir = dirname(componentJsonPath);
    if (!existsSync(jsonDir)) mkdirSync(jsonDir, { recursive: true });
    writeFileSync(componentJsonPath, JSON.stringify(entry, null, 2), "utf-8");
  }

  if (typeof entry.name !== "string" || entry.name.trim() === "") {
    throw new Error(
      `Manifeste invalide pour '${componentName}' : champ 'name' manquant ou vide (${baseUrl}).`
    );
  }
  if (!Array.isArray(entry.files) || entry.files.length === 0) {
    throw new Error(
      `Manifeste invalide pour '${componentName}' : aucun fichier déclaré (${baseUrl}).`
    );
  }

  // Télécharger les fichiers sources et les assets associés.
  const remoteFiles = [
    ...entry.files,
    ...(Array.isArray(entry.assets) ? entry.assets : []),
  ];
  for (const relFile of remoteFiles) {
    const destPath = join(cacheDir, relFile);
    if (existsSync(destPath)) continue;
    try {
      const fileUrl = `${baseUrl}/${relFile}`;
      const content = await fetchRemoteText(fileUrl);
      const destDir = dirname(destPath);
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
      writeFileSync(destPath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Téléchargement incomplet du composant '${componentName}' : ${relFile}\n` +
          `Détail : ${(error as Error).message}`
      );
    }
  }

  return entry;
}

/**
 * Assure qu'un manifeste de fondation et TOUS ses fichiers/assets sont
 * présents dans le cache local. Contrairement aux composants, une fondation
 * incomplète fait échouer explicitement : elle est indispensable à la
 * résolution des imports.
 */
export async function ensureFoundationDownloaded(
  foundationName: string,
  options: {
    registryUrl?: string;
    sourceRoot?: string;
    registryRoot?: string;
  } = {}
): Promise<ComponentRegistryEntry> {
  const baseUrl = (options.registryUrl || process.env.RS_UI_REGISTRY || DEFAULT_REMOTE_REGISTRY).replace(/\/$/, "");
  const cacheDir = options.sourceRoot || getCacheDir();
  const cachedRegistryRoot = options.registryRoot || join(cacheDir, "registry");
  const foundationJsonPath = join(cachedRegistryRoot, "foundations", `${foundationName}.json`);

  let entry: ComponentRegistryEntry;
  if (existsSync(foundationJsonPath)) {
    try {
      entry = JSON.parse(readFileSync(foundationJsonPath, "utf-8")) as ComponentRegistryEntry;
    } catch (error) {
      throw new Error(
        `Manifeste de fondation illisible en cache (${foundationJsonPath}) : ${(error as Error).message}`,
      );
    }
  } else {
    try {
      entry = await fetchRemoteJson<ComponentRegistryEntry>(
        `${baseUrl}/registry/foundations/${foundationName}.json`,
      );
    } catch (error) {
      throw new Error(
        `Fondation '${foundationName}' introuvable dans le registre distant (${baseUrl}).\n` +
          `Détail : ${(error as Error).message}`,
      );
    }
    const jsonDir = dirname(foundationJsonPath);
    if (!existsSync(jsonDir)) mkdirSync(jsonDir, { recursive: true });
    writeFileSync(foundationJsonPath, JSON.stringify(entry, null, 2), "utf-8");
  }

  if (typeof entry.name !== "string" || entry.name.trim() === "") {
    throw new Error(
      `Manifeste de fondation invalide pour '${foundationName}' : champ 'name' manquant ou vide (${baseUrl}).`,
    );
  }
  if (!Array.isArray(entry.files) || entry.files.length === 0) {
    throw new Error(
      `Manifeste de fondation invalide pour '${foundationName}' : aucun fichier déclaré (${baseUrl}).`,
    );
  }

  const remoteFiles = [
    ...(Array.isArray(entry.files) ? entry.files : []),
    ...(Array.isArray(entry.assets) ? entry.assets : []),
  ];
  for (const relFile of remoteFiles) {
    const destPath = join(cacheDir, relFile);
    if (existsSync(destPath)) continue;
    try {
      const content = await fetchRemoteText(`${baseUrl}/${relFile}`);
      const destDir = dirname(destPath);
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
      writeFileSync(destPath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Téléchargement incomplet de la fondation '${foundationName}' : ${relFile}\n` +
          `Détail : ${(error as Error).message}`,
      );
    }
  }

  return entry;
}

/**
 * Assure que la matrice de compatibilité Expo d'un SDK spécifique est téléchargée en cache.
 *
 * Retourne `true` si la matrice est disponible localement après l'appel.
 * Un échec n'est pas masqué : l'appelant doit avertir ou bloquer selon la
 * criticité des dépendances (aucune version n'est inventée).
 */
export async function ensureCompatibilityMatrixDownloaded(
  sdkVersion: number | string,
  options: { registryUrl?: string; registryRoot?: string } = {}
): Promise<boolean> {
  const baseUrl = (options.registryUrl || process.env.RS_UI_REGISTRY || DEFAULT_REMOTE_REGISTRY).replace(/\/$/, "");
  const cacheDir = getCacheDir();
  const cachedRegistryRoot = options.registryRoot || join(cacheDir, "registry");
  const matrixPath = join(cachedRegistryRoot, "versions", `expo-${sdkVersion}.json`);

  if (existsSync(matrixPath)) return true;

  try {
    const matrixUrl = `${baseUrl}/registry/versions/expo-${sdkVersion}.json`;
    const content = await fetchRemoteText(matrixUrl);
    const destDir = dirname(matrixPath);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
    writeFileSync(matrixPath, content, "utf-8");
    return true;
  } catch {
    return false;
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
