import { Command } from "commander";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { dirname, isAbsolute, join, relative } from "node:path";
import {
  existsSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from "node:fs";
import { detectProject } from "../core/project-detector.js";
import {
  readConfig,
  writeConfig,
  markComponentRemoved,
  isComponentInstalled,
  type RashwrightConfig,
} from "../core/config-manager.js";
import { generateUiIndex } from "../core/starter-generator.js";
import { resolveRegistry } from "../core/remote-registry.js";
import { removeComponentSkill, removeWidgetSkill } from "../core/skills-manager.js";
import { createBackup } from "../core/backup-manager.js";
import {
  readLockfile,
  removeLockedComponent,
  removeLockedFoundation,
  removeLockedTemplate,
  removeLockedWidget,
  type LockedFile,
  type RashwrightLockfile,
} from "../core/lock-manager.js";
import {
  parseArtefactRef,
  loadArtefact,
  buildArtefactGraph,
  findReverseDependents,
  checkArtefactIntegrity,
  getInstalledArtefacts,
  artefactKey,
  computeArtefactInstallPath,
  type ArtefactRef,
  type ArtefactType,
} from "../core/artefacts.js";
import { resolveComponentDestination } from "../core/file-manager.js";
import { resolveFoundationDestination } from "../core/foundations-manager.js";

type LockSection = "components" | "foundations" | "templates" | "widgets";

interface LocatedArtefact {
  ref: ArtefactRef;
  section: LockSection | null;
  locked:
    | {
        version: string;
        files: LockedFile[];
        installPath?: string;
      }
    | null;
  installPath: string | null;
  inConfig: boolean;
}

export interface RemoveArtefactOptions {
  registry?: string;
  yes?: boolean;
  dryRun?: boolean;
  force?: boolean;
  /** Force le type pour les sous-commandes (`template remove`, `widget remove`). */
  type?: ArtefactType;
}

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function isInsideProject(projectRoot: string, target: string): boolean {
  const rel = relative(projectRoot, target);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

function sectionForType(type: ArtefactType): LockSection {
  switch (type) {
    case "foundation":
      return "foundations";
    case "template":
      return "templates";
    case "widget":
      return "widgets";
    case "component":
    case "hook":
    case "lib":
    default:
      return "components";
  }
}

function locateArtefact(
  ref: ArtefactRef,
  config: RashwrightConfig,
  lock: RashwrightLockfile | null,
  projectRoot: string,
): LocatedArtefact {
  const section = sectionForType(ref.type);
  const locked = (lock?.[section] as Record<string, LocatedArtefact["locked"]> | undefined)?.[
    ref.id
  ] ?? null;

  const installPath =
    ref.type === "template" || ref.type === "widget"
      ? (locked?.installPath ?? computeArtefactInstallPath(ref, config))
      : null;

  return {
    ref,
    section: locked ? section : null,
    locked,
    installPath,
    inConfig:
      ref.type === "component" ||
      ref.type === "hook" ||
      ref.type === "lib"
        ? isComponentInstalled(config, ref.id)
        : false,
  };
}

function collectRemovalFiles(
  located: LocatedArtefact,
  config: RashwrightConfig,
  projectRoot: string,
  registryRoot: string,
): string[] {
  const { ref, locked } = located;
  const files = new Set<string>();

  if (locked && locked.files.length > 0) {
    for (const file of locked.files) {
      files.add(join(projectRoot, toPosix(file.path)));
    }
    return [...files];
  }

  // Repli pour les configurations historiques sans lockfile : on recalcule les
  // destinations réelles à partir du manifeste. Aucun chemin n'est deviné.
  const manifest = loadArtefact(ref, { registryRoot });
  if (!manifest) return [];

  const targetDir = join(projectRoot, config.componentsPath);

  for (const file of manifest.files) {
    const normalized = toPosix(file);
    switch (ref.type) {
      case "foundation":
        files.add(resolveFoundationDestination(normalized, projectRoot, config.componentsPath));
        break;
      case "template":
      case "widget": {
        const base = located.installPath ?? computeArtefactInstallPath(ref, config);
        if (base) files.add(join(projectRoot, base, normalized));
        break;
      }
      case "component":
      case "hook":
      case "lib":
      default:
        files.add(resolveComponentDestination(normalized, targetDir, projectRoot));
        break;
    }
  }

  for (const asset of manifest.assets) {
    files.add(join(projectRoot, toPosix(asset)));
  }

  return [...files];
}

/** Retire les dossiers vides, sans jamais supprimer la structure du projet. */
const NEVER_REMOVE = new Set([
  "components",
  "ui",
  "hooks",
  "lib",
  "src",
  "constants",
  "contexts",
  "stores",
  "theme",
  "assets",
  "app",
]);

function pruneEmptyParents(startDir: string, projectRoot: string): void {
  let dir = startDir;
  while (isInsideProject(projectRoot, dir)) {
    if (!existsSync(dir)) {
      dir = dirname(dir);
      continue;
    }
    if (NEVER_REMOVE.has(dir.split(/[\\/]/).pop() ?? "")) return;
    if (readdirSync(dir).length > 0) return;
    try {
      rmdirSync(dir);
    } catch {
      return;
    }
    dir = dirname(dir);
  }
}

function installedKeySet(
  projectRoot: string,
  registryRoot: string,
): Set<string> {
  const keys = new Set<string>();
  for (const artefact of getInstalledArtefacts(projectRoot, { registryRoot })) {
    keys.add(artefactKey(artefact));
    // Les hooks/libs partagent le lock des composants.
    if (artefact.type === "hook" || artefact.type === "lib") {
      keys.add(`component:${artefact.id}`);
    }
  }
  return keys;
}

function findInstalledDependents(
  ref: ArtefactRef,
  lock: RashwrightLockfile | null,
  projectRoot: string,
  registryRoot: string,
): string[] {
  const graph = buildArtefactGraph({ registryRoot });
  const installed = installedKeySet(projectRoot, registryRoot);
  const dependents = new Map<string, string>();

  for (const node of findReverseDependents(graph, ref, true)) {
    const key = artefactKey(node);
    if (installed.has(key)) {
      dependents.set(key, chalk.dim(key));
    }
  }

  // Les templates/widgets verrouillent leurs composants requis explicitement,
  // même si le manifeste correspondant n'est plus disponible dans le registre.
  if (ref.type === "component") {
    for (const [id, entry] of Object.entries(lock?.templates ?? {})) {
      if (entry.requiredComponents?.includes(ref.id)) {
        dependents.set(`template:${id}`, chalk.dim(`template:${id}`));
      }
    }
    for (const [id, entry] of Object.entries(lock?.widgets ?? {})) {
      if (entry.requiredComponents?.includes(ref.id)) {
        dependents.set(`widget:${id}`, chalk.dim(`widget:${id}`));
      }
    }
  }

  return [...dependents.values()];
}

function removeLockEntry(
  projectRoot: string,
  ref: ArtefactRef,
  dryRun: boolean,
): void {
  switch (ref.type) {
    case "foundation":
      removeLockedFoundation(projectRoot, ref.id, dryRun);
      break;
    case "template":
      removeLockedTemplate(projectRoot, ref.id, dryRun);
      break;
    case "widget":
      removeLockedWidget(projectRoot, ref.id, dryRun);
      break;
    case "component":
    case "hook":
    case "lib":
    default:
      removeLockedComponent(projectRoot, ref.id, dryRun);
      break;
  }
}

function displayRef(ref: ArtefactRef): string {
  return ref.type === "component" ? ref.id : `${ref.type}:${ref.id}`;
}

/**
 * Retire un artefact du projet, quel que soit son type.
 * Retourne un code de sortie (0 succès, 1 refus/échec).
 */
export async function removeArtefact(
  rawRef: string,
  options: RemoveArtefactOptions = {},
): Promise<number> {
  const cwd = process.cwd();
  const project = detectProject(cwd);

  if (!project.hasRashwrightConfig) {
    console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé."));
    return 1;
  }

  const parsed = parseArtefactRef(rawRef);
  const ref: ArtefactRef = options.type
    ? { type: options.type, id: parsed.id }
    : parsed;

  const config = readConfig(project.rashwrightConfigPath);
  const lock = readLockfile(cwd);
  const resolved = await resolveRegistry({ registryUrl: options.registry });
  const located = locateArtefact(ref, config, lock, cwd);

  const integrity = checkArtefactIntegrity(cwd, ref);
  const ownsLock = located.locked !== null;
  const ownsConfig = located.inConfig;
  const fallbackFiles = collectRemovalFiles(
    located,
    config,
    cwd,
    resolved.registryRoot,
  ).filter((file) => existsSync(file));

  // ── 1. Dépendances inverses installées ─────────────────────────────────
  //
  // Ce contrôle passe avant « non installé » : une cible sans manifeste
  // autonome (ex: `text`, fourni par la fondation `core-ui`) peut être
  // requise par un template installé. La supprimer silencieusement
  // casserait ce template.
  const dependents = findInstalledDependents(
    ref,
    lock,
    cwd,
    resolved.registryRoot,
  );
  if (dependents.length > 0 && !options.force) {
    console.log(chalk.yellow(`  ⚠ ${displayRef(ref)} est requis par :`));
    for (const dependent of dependents) {
      console.log(chalk.dim(`    ${dependent}`));
    }
    console.log();
    console.log(
      chalk.dim(
        "    Retirez d'abord les artefacts dépendants, ou utilisez --force.",
      ),
    );
    return 1;
  }

  // ── 2. L'artefact est-il réellement installé ? ─────────────────────────
  if (!ownsLock && !ownsConfig) {
    if (fallbackFiles.length === 0) {
      console.log(chalk.yellow(`  ⚠ ${displayRef(ref)} n'est pas installé.`));
      if (dependents.length > 0) {
        console.log(
          chalk.dim(
            `    Il reste toutefois requis par ${dependents.length} dépendant(s) : aucun fichier autonome n'est suivi par le lockfile.`,
          ),
        );
      }
      return 0;
    }

    if (!options.force) {
      console.log(
        chalk.yellow(
          `  ⚠ ${displayRef(ref)} existe sur le disque mais n'est pas suivi par le lockfile.`,
        ),
      );
      console.log(
        chalk.dim(
          "    Refus de supprimer des fichiers non suivis. Utilisez --force pour confirmer.",
        ),
      );
      return 1;
    }
  }

  // ── 3. Fichiers modifiés localement ────────────────────────────────────
  if (integrity.status === "modified" && !options.force) {
    console.log(
      chalk.yellow(
        `  ⚠ ${displayRef(ref)} a été modifié localement ; suppression refusée.`,
      ),
    );
    for (const file of integrity.modifiedFiles) {
      console.log(chalk.dim(`    • ${file}`));
    }
    console.log(
      chalk.dim("    Utilisez --force pour supprimer malgré les modifications."),
    );
    return 1;
  }

  if (dependents.length > 0) {
    console.log(
      chalk.yellow(
        `  ⚠ Suppression forcée malgré ${dependents.length} dépendant(s) installé(s) :`,
      ),
    );
    for (const dependent of dependents) {
      console.log(chalk.dim(`    ${dependent}`));
    }
  }

  const files = collectRemovalFiles(located, config, cwd, resolved.registryRoot);
  const existingFiles = files.filter((file) => existsSync(file));

  // ── 4. Aperçu + confirmation ───────────────────────────────────────────
  console.log();
  console.log(chalk.bold(`  Retirer "${displayRef(ref)}":`));
  if (located.installPath) {
    console.log(chalk.dim(`  • Dossier : ${located.installPath}`));
  }
  for (const file of existingFiles) {
    console.log(chalk.dim(`  • Supprimer : ${toPosix(relative(cwd, file))}`));
  }
  if (existingFiles.length === 0) {
    console.log(chalk.dim("  • Aucun fichier restant sur le disque."));
  }
  console.log(chalk.dim("  • Mettre à jour rashwright-ui.lock et rashwright-ui.json"));
  console.log();

  if (!options.yes && !options.dryRun) {
    const ok = await confirm({
      message: "Confirmer la suppression ?",
      default: false,
    });
    if (!ok) {
      console.log(chalk.dim("  Annulé."));
      return 0;
    }
  }

  if (options.dryRun) {
    console.log(chalk.dim("  [dry-run] Aucune modification appliquée."));
    return 0;
  }

  // ── 5. Backup puis suppression réelle ──────────────────────────────────
  const backup = createBackup(cwd, {
    trigger: "auto-remove",
    label: `pre-remove-${ref.type}-${ref.id}`,
  });
  if (backup) {
    console.log(chalk.dim(`  ✔ Backup de précaution créé (${backup.id})`));
  }

  const failed: string[] = [];
  for (const file of existingFiles) {
    if (!isInsideProject(cwd, file)) {
      failed.push(`${toPosix(file)} (hors du projet)`);
      continue;
    }
    try {
      unlinkSync(file);
    } catch (error) {
      failed.push(`${toPosix(relative(cwd, file))} (${(error as Error).message})`);
    }
  }

  if (failed.length > 0) {
    console.log(chalk.red(`  ✖ Suppression incomplète de ${displayRef(ref)} :`));
    for (const failure of failed) {
      console.log(chalk.red(`    • ${failure}`));
    }
    console.log(
      chalk.dim(
        "    Le lockfile et la configuration n'ont pas été mis à jour. Un backup est disponible.",
      ),
    );
    return 1;
  }

  for (const file of existingFiles) {
    pruneEmptyParents(dirname(file), cwd);
  }
  if (located.installPath) {
    const installDir = join(cwd, located.installPath);
    if (existsSync(installDir)) {
      pruneEmptyParents(installDir, cwd);
    }
  }

  // ── 6. Skills, lockfile, config, index ─────────────────────────────────
  if (ref.type === "component") {
    removeComponentSkill(ref.id, cwd, false);
  } else if (ref.type === "widget") {
    removeWidgetSkill(ref.id, cwd, false);
  }

  removeLockEntry(cwd, ref, false);

  let updatedConfig = config;
  if (ownsConfig) {
    updatedConfig = markComponentRemoved(config, ref.id);
  }
  if (ref.type === "component" || ref.type === "foundation") {
    generateUiIndex(
      join(cwd, config.componentsPath),
      Object.keys(updatedConfig.components),
      false,
    );
  }
  if (updatedConfig !== config) {
    writeConfig(project.rashwrightConfigPath, updatedConfig);
  }

  console.log(
    chalk.green(
      `  ✔ ${displayRef(ref)} retiré (${existingFiles.length} fichier(s)).`,
    ),
  );
  console.log();
  return 0;
}

export function removeCommand(): Command {
  const cmd = new Command("remove");
  cmd
    .description(
      "Retirer un artefact Rashwright UI (composant, fondation, hook, lib, template, widget)",
    )
    .argument(
      "<artefact>",
      "Artefact à retirer (ex: button, foundation:theme, template:auth, widget:metric)",
    )
    .option(
      "--registry <url>",
      "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)",
    )
    .option("--yes", "Confirmer sans demander")
    .option("--force", "Supprimer malgré des dépendants ou des modifications locales")
    .option("--dry-run", "Afficher sans exécuter")
    .action(async (name: string, options) => {
      const code = await removeArtefact(name, {
        registry: options.registry,
        yes: options.yes,
        force: options.force,
        dryRun: options.dryRun,
      });
      if (code !== 0) process.exit(code);
    });

  return cmd;
}
