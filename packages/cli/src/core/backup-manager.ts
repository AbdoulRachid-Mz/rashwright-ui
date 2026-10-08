import { join } from "node:path";
import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";

export const BACKUPS_DIR_REL = ".rashwright/backups";

export interface BackupMetadata {
  id: string; // ex: "2026-10-08-11-42-31"
  timestamp: string; // ISO 8601
  label?: string;
  trigger: "manual" | "auto-update" | "auto-remove" | "auto-reset";
  componentsCount: number;
  components: string[];
}

export interface BackupSummary {
  id: string;
  path: string;
  meta: BackupMetadata;
}

/**
 * Génère un identifiant horodaté pour un backup (ex: 2026-10-08-11-42-31)
 */
export function generateBackupId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${mm}-${dd}-${hh}-${min}-${ss}`;
}

/**
 * Crée un instantané de sauvegarde dans .rashwright/backups/<id>/
 */
export function createBackup(
  projectRoot: string,
  options: {
    label?: string;
    trigger?: BackupMetadata["trigger"];
    dryRun?: boolean;
  } = {}
): BackupSummary | null {
  const { label, trigger = "manual", dryRun = false } = options;
  const configPath = join(projectRoot, "rashwright-ui.json");
  const lockfilePath = join(projectRoot, "rashwright-ui.lock");

  if (!existsSync(configPath)) {
    return null;
  }

  let components: string[] = [];
  let componentsPathRel = "components/ui";

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.components && typeof parsed.components === "object") {
      components = Object.keys(parsed.components);
    }
    if (typeof parsed.componentsPath === "string") {
      componentsPathRel = parsed.componentsPath;
    }
  } catch {
    // Config illisible, backup minimal
  }

  const id = generateBackupId();
  const backupDir = join(projectRoot, BACKUPS_DIR_REL, id);

  const meta: BackupMetadata = {
    id,
    timestamp: new Date().toISOString(),
    label,
    trigger,
    componentsCount: components.length,
    components,
  };

  if (dryRun) {
    return { id, path: backupDir, meta };
  }

  mkdirSync(backupDir, { recursive: true });

  // 1. Sauvegarder rashwright-ui.json
  cpSync(configPath, join(backupDir, "rashwright-ui.json"));

  // 2. Sauvegarder rashwright-ui.lock si existant
  if (existsSync(lockfilePath)) {
    cpSync(lockfilePath, join(backupDir, "rashwright-ui.lock"));
  }

  // 3. Sauvegarder les composants
  const sourceCompDir = join(projectRoot, componentsPathRel);
  if (existsSync(sourceCompDir)) {
    const destCompDir = join(backupDir, "components");
    mkdirSync(destCompDir, { recursive: true });
    cpSync(sourceCompDir, destCompDir, { recursive: true });
  }

  // 4. Écrire meta.json
  writeFileSync(join(backupDir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");

  return { id, path: backupDir, meta };
}

/**
 * Liste les backups disponibles, du plus récent au plus ancien
 */
export function listBackups(projectRoot: string): BackupSummary[] {
  const backupsRoot = join(projectRoot, BACKUPS_DIR_REL);
  if (!existsSync(backupsRoot)) return [];

  const entries = readdirSync(backupsRoot, { withFileTypes: true });
  const backups: BackupSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const backupDir = join(backupsRoot, entry.name);
    const metaPath = join(backupDir, "meta.json");

    let meta: BackupMetadata;
    if (existsSync(metaPath)) {
      try {
        meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      } catch {
        meta = {
          id: entry.name,
          timestamp: new Date().toISOString(),
          trigger: "manual",
          componentsCount: 0,
          components: [],
        };
      }
    } else {
      meta = {
        id: entry.name,
        timestamp: new Date().toISOString(),
        trigger: "manual",
        componentsCount: 0,
        components: [],
      };
    }

    backups.push({
      id: entry.name,
      path: backupDir,
      meta,
    });
  }

  // Trier par date/nom décroissant (le plus récent en premier)
  return backups.sort((a, b) => b.id.localeCompare(a.id));
}

/**
 * Récupère le backup le plus récent
 */
export function getLatestBackup(projectRoot: string): BackupSummary | null {
  const all = listBackups(projectRoot);
  return all.length > 0 ? all[0] : null;
}

/**
 * Restaure un backup donné par son ID (ou chemin)
 */
export function restoreBackup(
  projectRoot: string,
  backupIdOrPath: string,
  options: { dryRun?: boolean } = {}
): { restoredId: string; restoredComponents: number } {
  const { dryRun = false } = options;
  const isDirectPath = existsSync(backupIdOrPath) && statSync(backupIdOrPath).isDirectory();
  const backupDir = isDirectPath ? backupIdOrPath : join(projectRoot, BACKUPS_DIR_REL, backupIdOrPath);

  if (!existsSync(backupDir)) {
    throw new Error(`Backup introuvable : ${backupIdOrPath}`);
  }

  const metaPath = join(backupDir, "meta.json");
  let compCount = 0;
  if (existsSync(metaPath)) {
    try {
      const meta: BackupMetadata = JSON.parse(readFileSync(metaPath, "utf-8"));
      compCount = meta.componentsCount;
    } catch {
      // Ignorer
    }
  }

  if (dryRun) {
    return { restoredId: backupIdOrPath, restoredComponents: compCount };
  }

  // Lire la config du backup pour savoir où restaurer les composants
  const backupConfigPath = join(backupDir, "rashwright-ui.json");
  let targetComponentsRel = "components/ui";

  if (existsSync(backupConfigPath)) {
    try {
      const parsed = JSON.parse(readFileSync(backupConfigPath, "utf-8"));
      if (typeof parsed.componentsPath === "string") {
        targetComponentsRel = parsed.componentsPath;
      }
    } catch {
      // défaut
    }
    cpSync(backupConfigPath, join(projectRoot, "rashwright-ui.json"));
  }

  // Restaurer rashwright-ui.lock
  const backupLockPath = join(backupDir, "rashwright-ui.lock");
  const targetLockPath = join(projectRoot, "rashwright-ui.lock");
  if (existsSync(backupLockPath)) {
    cpSync(backupLockPath, targetLockPath);
  } else if (existsSync(targetLockPath)) {
    // Si le backup n'avait pas de lockfile, on supprime le lockfile actuel
    rmSync(targetLockPath, { force: true });
  }

  // Restaurer les composants
  const backupCompDir = join(backupDir, "components");
  const targetCompDir = join(projectRoot, targetComponentsRel);

  if (existsSync(backupCompDir)) {
    mkdirSync(targetCompDir, { recursive: true });
    cpSync(backupCompDir, targetCompDir, { recursive: true });
  }

  return { restoredId: backupIdOrPath, restoredComponents: compCount };
}
