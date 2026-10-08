import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface LockedFile {
  path: string;
  hash: string;
  installedAt?: string;
}

export interface LockedComponent {
  version: string;
  sourceHash?: string;
  files: LockedFile[];
  dependencies: string[];
  expoDependencies: string[];
  installedAt?: string;
}

export interface RashwrightLockfile {
  lockfileVersion: number;
  generatedAt: string;
  components: Record<string, LockedComponent>;
}

export const LOCKFILE_NAME = "rashwright-ui.lock";

/**
 * Calcule le hash SHA-256 normalisé d'un contenu de fichier (indépendant des retours à la ligne CRLF/LF).
 */
export function computeFileHash(content: string | Buffer): string {
  const normalized = typeof content === "string"
    ? content.replace(/\r\n/g, "\n")
    : content;
  return `sha256:${createHash("sha256").update(normalized).digest("hex")}`;
}

export function getLockfilePath(projectRoot: string): string {
  return join(projectRoot, LOCKFILE_NAME);
}

/**
 * Lit le lockfile rashwright-ui.lock s'il existe.
 */
export function readLockfile(projectRoot: string): RashwrightLockfile | null {
  const filePath = getLockfilePath(projectRoot);
  if (!existsSync(filePath)) return null;
  try {
    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    if (typeof raw === "object" && raw !== null && raw.components) {
      return raw as RashwrightLockfile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Écrit le lockfile rashwright-ui.lock sur le disque.
 */
export function writeLockfile(
  projectRoot: string,
  lock: RashwrightLockfile,
  dryRun = false,
): void {
  if (dryRun) return;
  const filePath = getLockfilePath(projectRoot);
  writeFileSync(filePath, JSON.stringify(lock, null, 2) + "\n", "utf-8");
}

/**
 * Enregistre ou met à jour un composant dans le lockfile avec le hash de ses fichiers.
 */
export function recordLockedComponent(
  projectRoot: string,
  componentName: string,
  version: string,
  relativeFiles: string[],
  dependencies: string[] = [],
  expoDependencies: string[] = [],
  dryRun = false,
): RashwrightLockfile {
  const lock = readLockfile(projectRoot) || {
    lockfileVersion: 1,
    generatedAt: new Date().toISOString(),
    components: {},
  };

  const files: LockedFile[] = [];
  for (const rel of relativeFiles) {
    const normalizedRel = rel.replace(/\\/g, "/");
    const abs = join(projectRoot, normalizedRel);
    if (existsSync(abs)) {
      const content = readFileSync(abs, "utf-8");
      files.push({
        path: normalizedRel,
        hash: computeFileHash(content),
        installedAt: new Date().toISOString(),
      });
    }
  }

  lock.components[componentName] = {
    version,
    sourceHash: files[0]?.hash,
    files,
    dependencies,
    expoDependencies,
    installedAt: new Date().toISOString(),
  };

  lock.generatedAt = new Date().toISOString();
  writeLockfile(projectRoot, lock, dryRun);
  return lock;
}

/**
 * Retire un composant du lockfile.
 */
export function removeLockedComponent(
  projectRoot: string,
  componentName: string,
  dryRun = false,
): RashwrightLockfile | null {
  const lock = readLockfile(projectRoot);
  if (!lock) return null;

  delete lock.components[componentName];
  lock.generatedAt = new Date().toISOString();
  writeLockfile(projectRoot, lock, dryRun);
  return lock;
}

export type FileIntegrityStatus = "clean" | "modified" | "missing" | "untracked";

/**
 * Analyse l'intégrité d'un composant installé en comparant le hash de ses fichiers au lockfile.
 */
export function checkComponentIntegrity(
  projectRoot: string,
  componentName: string,
): {
  status: FileIntegrityStatus;
  modifiedFiles: string[];
  missingFiles: string[];
} {
  const lock = readLockfile(projectRoot);
  const lockedComp = lock?.components[componentName];

  if (!lockedComp) {
    return { status: "untracked", modifiedFiles: [], missingFiles: [] };
  }

  const modifiedFiles: string[] = [];
  const missingFiles: string[] = [];

  for (const f of lockedComp.files) {
    const abs = join(projectRoot, f.path);
    if (!existsSync(abs)) {
      missingFiles.push(f.path);
    } else {
      const content = readFileSync(abs, "utf-8");
      const currentHash = computeFileHash(content);
      if (currentHash !== f.hash) {
        modifiedFiles.push(f.path);
      }
    }
  }

  if (missingFiles.length > 0) {
    return { status: "missing", modifiedFiles, missingFiles };
  }
  if (modifiedFiles.length > 0) {
    return { status: "modified", modifiedFiles, missingFiles };
  }
  return { status: "clean", modifiedFiles, missingFiles };
}
