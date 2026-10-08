import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { recordLockedComponent } from "./lock-manager.js";
import { createBackup } from "./backup-manager.js";

export interface MigrationContext {
  projectRoot: string;
  configPath: string;
  lockfilePath: string;
  dryRun: boolean;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    success: (msg: string) => void;
  };
}

export interface MigrationDefinition {
  id: string; // ex: "0.3.0-to-0.4.0"
  description: string;
  fromVersion: string;
  toVersion: string;
  up: (ctx: MigrationContext) => Promise<{ success: boolean; changes: string[] }>;
}

/**
 * Migration 0.3.0 -> 0.4.0
 * - S'assure que rashwright-ui.lock existe avec le mapping des composants installés
 * - Initialise la structure du starter si manquante
 */
export const migration030to040: MigrationDefinition = {
  id: "0.3.0-to-0.4.0",
  description: "Initialisation du Lockfile SHA-256 (rashwright-ui.lock) et formatage de configuration",
  fromVersion: "0.3.0",
  toVersion: "0.4.0",
  async up(ctx) {
    const changes: string[] = [];

    if (!existsSync(ctx.configPath)) {
      return { success: false, changes: ["Fichier rashwright-ui.json introuvable"] };
    }

    const raw = readFileSync(ctx.configPath, "utf-8");
    const config = JSON.parse(raw);

    // 1. Mise à jour de starterConfig si nécessaire
    if (!config.starter) {
      config.starter = { installed: true };
      changes.push("Initialisation des métadonnées config.starter");
      if (!ctx.dryRun) {
        writeFileSync(ctx.configPath, JSON.stringify(config, null, 2), "utf-8");
      }
    }

    // 2. Génération du Lockfile rétroactif si manquant
    if (!existsSync(ctx.lockfilePath)) {
      changes.push("Création initiale de rashwright-ui.lock");
      if (!ctx.dryRun) {
        const components = config.components || {};
        for (const [name, val] of Object.entries(components)) {
          const ver = typeof val === "string" ? val : (val as { version: string }).version || "0.3.0";
          const compRel = `${config.componentsPath || "components/ui"}/${name}.tsx`;
          recordLockedComponent(ctx.projectRoot, name, ver, [compRel], [], [], false);
        }
      }
    }

    return { success: true, changes };
  },
};

/**
 * Migration 0.4.0 -> 0.5.0
 * - Support des composants personnalisés du projet (projectComponents: {})
 * - Support des skills décorrélés (skillsMetadata)
 */
export const migration040to050: MigrationDefinition = {
  id: "0.4.0-to-0.5.0",
  description: "Ajout du support des composants projet personnalisés et métadonnées de compétences IA",
  fromVersion: "0.4.0",
  toVersion: "0.5.0",
  async up(ctx) {
    const changes: string[] = [];

    if (!existsSync(ctx.configPath)) {
      return { success: false, changes: ["Fichier rashwright-ui.json introuvable"] };
    }

    const raw = readFileSync(ctx.configPath, "utf-8");
    const config = JSON.parse(raw);

    let updated = false;

    if (!config.projectComponents) {
      config.projectComponents = {};
      changes.push("Ajout du registre de composants projet : config.projectComponents");
      updated = true;
    }

    if (!config.skills) {
      config.skills = { enabled: true, directory: "skills/rs-ui" };
      changes.push("Ajout de la configuration des compétences IA : config.skills");
      updated = true;
    }

    if (updated && !ctx.dryRun) {
      writeFileSync(ctx.configPath, JSON.stringify(config, null, 2), "utf-8");
    }

    return { success: true, changes };
  },
};

export const REGISTERED_MIGRATIONS: MigrationDefinition[] = [
  migration030to040,
  migration040to050,
];

/**
 * Détermine les migrations à exécuter pour un projet donné
 */
export function getPendingMigrations(currentProjectVersion: string): MigrationDefinition[] {
  const pending: MigrationDefinition[] = [];

  for (const m of REGISTERED_MIGRATIONS) {
    if (m.fromVersion <= currentProjectVersion && m.toVersion > currentProjectVersion) {
      pending.push(m);
    }
  }

  return pending;
}

/**
 * Exécute une chaîne de migrations
 */
export async function runMigrations(
  projectRoot: string,
  options: {
    dryRun?: boolean;
    logger?: MigrationContext["logger"];
  } = {}
): Promise<{
  executedCount: number;
  results: Array<{ id: string; success: boolean; changes: string[] }>;
}> {
  const { dryRun = false, logger = { info: () => {}, warn: () => {}, success: () => {} } } = options;
  const configPath = join(projectRoot, "rashwright-ui.json");
  const lockfilePath = join(projectRoot, "rashwright-ui.lock");

  if (!existsSync(configPath)) {
    throw new Error("Projet Rashwright UI non initialisé");
  }

  // Création d'un backup automatique avant migration
  if (!dryRun) {
    createBackup(projectRoot, { trigger: "auto-update", label: "pre-migration" });
  }

  const results: Array<{ id: string; success: boolean; changes: string[] }> = [];

  const ctx: MigrationContext = {
    projectRoot,
    configPath,
    lockfilePath,
    dryRun,
    logger,
  };

  for (const migration of REGISTERED_MIGRATIONS) {
    logger.info(`Exécution de la migration : ${migration.id} (${migration.description})...`);
    const res = await migration.up(ctx);
    results.push({ id: migration.id, success: res.success, changes: res.changes });
    if (!res.success) {
      logger.warn(`Échec de la migration ${migration.id}`);
      break;
    }
  }

  return {
    executedCount: results.filter((r) => r.success).length,
    results,
  };
}
