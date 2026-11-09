import { Command } from "commander";
import chalk from "chalk";
import { confirm, checkbox } from "@inquirer/prompts";
import { join, relative } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import {
  readConfig,
  writeConfig,
  markComponentInstalled,
  getInstalledVersion,
  type RashwrightConfig,
} from "../core/config-manager.js";
import {
  loadComponentEntry,
  type FoundationRegistryEntry,
  type ResolvedFoundation,
} from "../core/dependency-resolver.js";
import {
  copyArtefactFiles,
  copyAssetFiles,
  copyComponentFiles,
  resolveComponentDestination,
  type FileCopyResult,
} from "../core/file-manager.js";
import {
  resolveRegistry,
  ensureComponentDownloaded,
  ensureFoundationDownloaded,
} from "../core/remote-registry.js";
import {
  readLockfile,
  recordLockedComponent,
  recordLockedFoundation,
  recordLockedTemplate,
  recordLockedWidget,
  type FileIntegrityStatus,
  type LockedFile,
  type RashwrightLockfile,
} from "../core/lock-manager.js";
import { createBackup } from "../core/backup-manager.js";
import { computeLineDiff, formatDiffOutput } from "../core/diff.js";
import { copyComponentSkill } from "../core/skills-manager.js";
import { executeHook } from "../core/hooks-manager.js";
import { installExpoPackages, installNpmPackages } from "../core/package-manager.js";
import { TEMPLATES_ROOT, WIDGETS_ROOT } from "../core/paths.js";
import { planFoundation, applyFoundationPlan, resolveFoundationDestination } from "../core/foundations-manager.js";
import {
  parseArtefactRef,
  loadArtefact,
  checkArtefactIntegrity,
  computeArtefactInstallPath,
  artefactKey,
  type ArtefactManifest,
  type ArtefactRef,
} from "../core/artefacts.js";
import type { TransformImportOptions } from "../core/transformers/import-transformer.js";

interface UpdateStatus {
  ref: ArtefactRef;
  manifest: ArtefactManifest;
  installedVersion: string;
  installedRegistryVersion?: string;
  latestVersion: string;
  latestRegistryVersion?: string;
  hasUpdate: boolean;
  status: FileIntegrityStatus;
  diffStats?: { added: number; removed: number };
}

interface PlannedFile {
  source: string;
  destination: string;
  rel: string;
}

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function relativeToProject(projectRoot: string, absolute: string): string {
  return toPosix(relative(projectRoot, absolute));
}

function displayRef(ref: ArtefactRef): string {
  return ref.type === "component" ? ref.id : `${ref.type}:${ref.id}`;
}

function isHookOrLib(
  manifest: ArtefactManifest | null,
): manifest is ArtefactManifest & { type: "hook" | "lib" } {
  return manifest?.type === "hook" || manifest?.type === "lib";
}

function installedSnapshot(
  lock: RashwrightLockfile | null,
  config: RashwrightConfig,
  ref: ArtefactRef,
): { version: string; registryVersion?: string; installPath?: string } | null {
  switch (ref.type) {
    case "template": {
      const entry = lock?.templates?.[ref.id];
      return entry
        ? { version: entry.version, registryVersion: entry.registryVersion, installPath: entry.installPath }
        : null;
    }
    case "widget": {
      const entry = lock?.widgets?.[ref.id];
      return entry
        ? { version: entry.version, registryVersion: entry.registryVersion, installPath: entry.installPath }
        : null;
    }
    case "foundation": {
      const entry = lock?.foundations?.[ref.id];
      return entry
        ? { version: entry.version, registryVersion: entry.registryVersion }
        : null;
    }
    case "component":
    case "hook":
    case "lib":
    default: {
      const entry = lock?.components?.[ref.id];
      if (entry) {
        return { version: entry.version, registryVersion: entry.registryVersion };
      }
      const fromConfig = getInstalledVersion(config, ref.id);
      return fromConfig ? { version: fromConfig } : null;
    }
  }
}

function collectTargets(
  config: RashwrightConfig,
  lock: RashwrightLockfile | null,
  args: string[],
): ArtefactRef[] {
  if (args.length > 0) {
    return args.map((arg) => parseArtefactRef(arg));
  }

  const refs: ArtefactRef[] = [];
  const seen = new Set<string>();
  const add = (ref: ArtefactRef): void => {
    const key = artefactKey(ref);
    if (seen.has(key)) return;
    seen.add(key);
    refs.push(ref);
  };

  for (const id of Object.keys(lock?.components ?? {})) {
    add({ type: "component", id });
  }
  for (const id of Object.keys(lock?.foundations ?? {})) {
    add({ type: "foundation", id });
  }
  for (const id of Object.keys(lock?.templates ?? {})) {
    add({ type: "template", id });
  }
  for (const id of Object.keys(lock?.widgets ?? {})) {
    add({ type: "widget", id });
  }
  // Composants historiques déclarés dans la config mais absents du lockfile.
  for (const id of Object.keys(config.components ?? {})) {
    if (!lock?.components?.[id]) add({ type: "component", id });
  }

  return refs;
}

function resolveManifestFiles(
  ref: ArtefactRef,
  manifest: ArtefactManifest,
  config: RashwrightConfig,
  projectRoot: string,
  sourceRoot: string,
  installPath: string | null,
): PlannedFile[] {
  const targetDir = join(projectRoot, config.componentsPath);
  const files: PlannedFile[] = [];

  let sourceBase = sourceRoot;
  if (ref.type === "template") sourceBase = join(TEMPLATES_ROOT, ref.id);
  if (ref.type === "widget") sourceBase = join(WIDGETS_ROOT, ref.id);

  for (const file of manifest.files) {
    const normalized = toPosix(file);
    const source = join(sourceBase, normalized);
    let destination: string;

    switch (ref.type) {
      case "foundation":
        destination = resolveFoundationDestination(normalized, projectRoot, config.componentsPath);
        break;
      case "template":
      case "widget": {
        const base = installPath ?? computeArtefactInstallPath(ref, config);
        if (!base) continue;
        destination = join(projectRoot, base, normalized);
        break;
      }
      case "component":
      case "hook":
      case "lib":
      default:
        destination = resolveComponentDestination(normalized, targetDir, projectRoot);
        break;
    }

    files.push({
      source,
      destination,
      rel: relativeToProject(projectRoot, destination),
    });
  }

  return files;
}

function computeDiffStats(files: PlannedFile[]): { added: number; removed: number } | undefined {
  let added = 0;
  let removed = 0;
  let compared = 0;

  for (const file of files) {
    if (!existsSync(file.source) || !existsSync(file.destination)) continue;
    try {
      const local = readFileSync(file.destination, "utf-8");
      const registry = readFileSync(file.source, "utf-8");
      const diff = computeLineDiff(local, registry);
      added += diff.filter((line) => line.type === "added").length;
      removed += diff.filter((line) => line.type === "removed").length;
      compared += 1;
    } catch {
      // Fichier binaire ou illisible : pas de statistiques inventées.
    }
  }

  return compared > 0 ? { added, removed } : undefined;
}

function lockFilesFor(results: FileCopyResult[], projectRoot: string): string[] {
  return results
    .filter((r) => r.status === "copied" || r.status === "overwritten" || (r.status === "skipped" && !r.isModified))
    .map((r) => relativeToProject(projectRoot, r.destination));
}

function recordLock(
  projectRoot: string,
  ref: ArtefactRef,
  manifest: ArtefactManifest,
  installPath: string | null,
  relativeFiles: string[],
): void {
  const registryVersion = manifest.registryVersion;
  switch (ref.type) {
    case "foundation":
      recordLockedFoundation(
        projectRoot,
        ref.id,
        manifest.version,
        relativeFiles,
        manifest.dependencies,
        manifest.expoDependencies,
        false,
        registryVersion,
      );
      break;
    case "template":
      if (installPath) {
        recordLockedTemplate(
          projectRoot,
          ref.id,
          manifest.version,
          installPath,
          manifest.requiresComponents,
          relativeFiles,
          manifest.dependencies,
          manifest.expoDependencies,
          false,
          registryVersion,
        );
      }
      break;
    case "widget":
      if (installPath) {
        recordLockedWidget(
          projectRoot,
          ref.id,
          manifest.version,
          installPath,
          manifest.requiresComponents,
          relativeFiles,
          manifest.dependencies,
          manifest.expoDependencies,
          false,
          registryVersion,
        );
      }
      break;
    case "component":
    case "hook":
    case "lib":
    default:
      recordLockedComponent(
        projectRoot,
        ref.id,
        manifest.version,
        relativeFiles,
        manifest.dependencies,
        manifest.expoDependencies,
        false,
        registryVersion,
      );
      break;
  }
}

export function updateCommand(): Command {
  const cmd = new Command("update");
  cmd
    .description("Mettre à jour intelligemment les artefacts Rashwright UI installés (Smart Update)")
    .argument("[artefacts...]", "Composants/artefacts spécifiques à mettre à jour (tous si non spécifié)")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--check", "Audit non-destructif : affiche les statuts de mise à jour sans modifier aucun fichier")
    .option("-i, --interactive", "Sélectionner interactivement les artefacts à mettre à jour", false)
    .option("--diff", "Afficher les différences détaillées avant d'écraser")
    .option("--skills", "Mettre à jour également les Skills IA associés", true)
    .option("--merge", "Activer la fusion différentielle (3-Way Merge) pour préserver les modifications locales", true)
    .option("--no-merge", "Désactiver le 3-Way Merge et forcer l'écrasement")
    .option("--alias <prefix>", "Réécrire les alias d'import (ex: ~/ ou @app/)")
    .option("--yes", "Écraser sans demander confirmation")
    .option("--dry-run", "Afficher les actions prévues sans les exécuter")
    .action(async (artefactArgs: string[], options: {
      registry?: string;
      fresh?: boolean;
      check?: boolean;
      interactive?: boolean;
      diff?: boolean;
      skills?: boolean;
      yes?: boolean;
      dryRun?: boolean;
      merge?: boolean;
      alias?: string;
    }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        console.log(chalk.dim("    Exécutez d'abord: rs-ui init"));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);
      const lock = readLockfile(cwd);
      const targets = collectTargets(config, lock, artefactArgs ?? []);

      if (targets.length === 0) {
        console.log(chalk.yellow("  ⚠ Aucun artefact installé."));
        return;
      }

      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Smart Update"));
      if (resolved.isRemote) {
        console.log(chalk.dim(`  ℹ Registre : ${resolved.registryUrl}`));
      }
      console.log();

      // ── 1. Analyse d'intégrité et de version de chaque artefact ──────────
      const statuses: UpdateStatus[] = [];

      for (const originalRef of targets) {
        const snapshot = installedSnapshot(lock, config, originalRef);
        if (!snapshot) {
          if (artefactArgs.length > 0) {
            console.log(chalk.dim(`  ○ ${displayRef(originalRef)} — non installé, ignoré`));
          }
          continue;
        }

        let ref = originalRef;
        let manifest: ArtefactManifest | null = loadArtefact(ref, {
          registryRoot: resolved.registryRoot,
        });

        if (!manifest && resolved.isRemote) {
          try {
            if (ref.type === "component" || ref.type === "hook" || ref.type === "lib") {
              await ensureComponentDownloaded(ref.id, {
                registryUrl: resolved.registryUrl,
                registryRoot: resolved.registryRoot,
                sourceRoot: resolved.sourceRoot,
              });
            } else if (ref.type === "foundation") {
              await ensureFoundationDownloaded(ref.id, {
                registryUrl: resolved.registryUrl,
                registryRoot: resolved.registryRoot,
                sourceRoot: resolved.sourceRoot,
              });
            }
            manifest = loadArtefact(ref, { registryRoot: resolved.registryRoot });
          } catch (error) {
            console.log(chalk.yellow(`  ⚠ ${displayRef(ref)} — ${(error as Error).message}`));
            continue;
          }
        }

        // Un composant verrouillé peut être en réalité un hook ou une lib.
        if (!manifest && originalRef.type === "component") {
          for (const candidate of ["hook", "lib"] as const) {
            const candidateRef: ArtefactRef = { type: candidate, id: originalRef.id };
            const candidateManifest = loadArtefact(candidateRef, {
              registryRoot: resolved.registryRoot,
            });
            if (candidateManifest) {
              ref = candidateRef;
              manifest = candidateManifest;
              break;
            }
          }
        }

        if (!manifest) {
          console.log(chalk.yellow(`  ⚠ ${displayRef(originalRef)} — non trouvé dans le registre`));
          continue;
        }

        // Si le manifeste révèle un hook/lib, on aligne le type et le snapshot.
        if (isHookOrLib(manifest) && ref.type !== manifest.type) {
          ref = { type: manifest.type, id: ref.id };
        }

        const actualSnapshot = installedSnapshot(lock, config, ref) ?? snapshot;
        const integrity = checkArtefactIntegrity(cwd, ref);
        const latestRegistryVersion = manifest.registryVersion;
        const versionChanged = manifest.version !== actualSnapshot.version;
        const registryChanged =
          Boolean(latestRegistryVersion) &&
          latestRegistryVersion !== actualSnapshot.registryVersion &&
          !versionChanged;
        const needsRepair =
          integrity.status === "missing" || integrity.status === "untracked";
        const hasUpdate = versionChanged || registryChanged || needsRepair;

        const installPath =
          ref.type === "template" || ref.type === "widget"
            ? (actualSnapshot.installPath ?? computeArtefactInstallPath(ref, config))
            : null;
        const plannedFiles = resolveManifestFiles(
          ref,
          manifest,
          config,
          cwd,
          resolved.sourceRoot,
          installPath,
        );
        const diffStats = hasUpdate ? computeDiffStats(plannedFiles) : undefined;

        statuses.push({
          ref,
          manifest,
          installedVersion: actualSnapshot.version,
          installedRegistryVersion: actualSnapshot.registryVersion,
          latestVersion: manifest.version,
          latestRegistryVersion,
          hasUpdate,
          status: integrity.status,
          diffStats,
        });
      }

      if (statuses.length === 0) {
        console.log(chalk.yellow("  ⚠ Aucun artefact valide sélectionné."));
        return;
      }

      const updatable = statuses.filter((s) => s.hasUpdate);

      // ── 2. Mode --check (Audit non-destructif) ───────────────────────────
      if (options.check) {
        console.log(chalk.bold(`  État des artefacts (${statuses.length} analysé(s)) :`));
        console.log();
        for (const s of statuses) {
          const label = displayRef(s.ref);
          const versionTag = `v${s.installedVersion} → v${s.latestVersion}`;
          const registryTag =
            s.latestRegistryVersion && s.latestRegistryVersion !== s.installedRegistryVersion
              ? chalk.dim(` [registre ${s.installedRegistryVersion ?? "?"} → ${s.latestRegistryVersion}]`)
              : "";
          const stateTag =
            s.status === "modified"
              ? chalk.yellow(" (⚠ modifications locales)")
              : s.status === "missing"
                ? chalk.yellow(" (fichiers manquants)")
                : s.status === "untracked"
                  ? chalk.yellow(" (non suivi par le lockfile)")
                  : chalk.green(" (intact)");

          if (s.hasUpdate) {
            console.log(`  ${chalk.cyan("▲")} ${chalk.bold(label)} : ${chalk.yellow(versionTag)}${registryTag}${stateTag}`);
            if (s.diffStats) {
              console.log(chalk.dim(`    Différence : +${s.diffStats.added} lignes, -${s.diffStats.removed} lignes`));
            }
          } else {
            console.log(`  ${chalk.green("✔")} ${label} : v${s.installedVersion}${stateTag}`);
          }
        }

        console.log();
        if (updatable.length > 0) {
          console.log(chalk.yellow(`  ${updatable.length} artefact(s) possèdent des mises à jour ou une réparation nécessaire.`));
          console.log(chalk.dim("  Exécutez 'rs-ui update' pour les appliquer."));
        } else {
          console.log(chalk.green("  Tous les artefacts installés sont à jour avec le registre."));
        }
        console.log();
        return;
      }

      if (updatable.length === 0) {
        console.log(chalk.green("  ✔ Tous les artefacts ciblés sont déjà à jour avec le registre."));
        console.log();
        return;
      }

      console.log(chalk.bold(`  ${updatable.length} artefact(s) possèdent des mises à jour ou une réparation nécessaire :`));
      for (const s of updatable) {
        const modWarning = s.status === "modified"
          ? chalk.yellow(" (⚠ modifications locales détectées)")
          : chalk.dim(` (${s.status})`);
        console.log(
          chalk.dim(
            `    • ${displayRef(s.ref)} : v${s.installedVersion} → v${s.latestVersion}${modWarning}`,
          ),
        );
      }
      console.log();

      // ── 3. Sélection interactive ─────────────────────────────────────────
      let selectedKeys: string[] = updatable.map((u) => artefactKey(u.ref));

      if (options.interactive && !options.yes) {
        const choices = updatable.map((u) => {
          const modNote = u.status === "modified" ? " [MODIFIÉ]" : "";
          const diffNote = u.diffStats ? ` (+${u.diffStats.added}/-${u.diffStats.removed})` : "";
          return {
            name: `${displayRef(u.ref)} (v${u.installedVersion} → v${u.latestVersion})${modNote}${diffNote}`,
            value: artefactKey(u.ref),
            checked: true,
          };
        });

        selectedKeys = await checkbox({
          message: "Sélectionnez les artefacts à mettre à jour :",
          choices,
        });

        if (selectedKeys.length === 0) {
          console.log(chalk.dim("  Aucun artefact sélectionné. Opération annulée."));
          return;
        }
      }

      const selected = updatable.filter((u) =>
        selectedKeys.includes(artefactKey(u.ref)),
      );

      // ── 4. Confirmation pour les fichiers modifiés localement ────────────
      const modifiedSelected = selected.filter((u) => u.status === "modified");
      if (modifiedSelected.length > 0 && !options.yes && !options.dryRun) {
        console.log(
          chalk.yellow(
            `  ⚠ Attention : ${modifiedSelected.length} artefact(s) ont été modifiés localement (${modifiedSelected.map((m) => displayRef(m.ref)).join(", ")}).`,
          ),
        );
        const proceed = await confirm({
          message: "Voulez-vous écraser vos modifications locales pour ces artefacts ?",
          default: false,
        });
        if (!proceed) {
          console.log(chalk.dim("  Mise à jour annulée pour préserver vos modifications."));
          return;
        }
      }

      // ── 5. Backup automatique de précaution ──────────────────────────────
      if (!options.dryRun) {
        const backup = createBackup(cwd, {
          trigger: "auto-update",
          label: `pre-update-${selected.map((s) => s.ref.id).join("-").slice(0, 30)}`,
        });
        if (backup) {
          console.log(chalk.green(`  ✔ Snapshot de sécurité automatique créé (${backup.id})`));
          console.log();
        }
      }

      // ── 6. Application des mises à jour ──────────────────────────────────
      let updatedConfig = config;
      let exitCode = 0;
      const npmDeps = new Set<string>();
      const expoDeps = new Set<string>();
      const targetDir = join(cwd, config.componentsPath);
      const importTransform: TransformImportOptions | undefined = options.alias
        ? { toPrefix: options.alias }
        : (config.aliases ? { aliases: config.aliases } : undefined);

      for (const status of selected) {
        const { ref, manifest } = status;
        const label = displayRef(ref);
        const installPath =
          ref.type === "template" || ref.type === "widget"
            ? (computeArtefactInstallPath(ref, config) ?? null)
            : null;

        const plannedFiles = resolveManifestFiles(
          ref,
          manifest,
          config,
          cwd,
          resolved.sourceRoot,
          installPath,
        );

        if (options.diff) {
          for (const file of plannedFiles) {
            if (!existsSync(file.destination) || !existsSync(file.source)) continue;
            try {
              const oldCode = readFileSync(file.destination, "utf-8");
              const newCode = readFileSync(file.source, "utf-8");
              if (oldCode === newCode) continue;
              console.log(chalk.bold.yellow(`\n  [diff] ${file.rel} (local vs registre) :`));
              console.log(formatDiffOutput(computeLineDiff(oldCode, newCode)));
              console.log();
            } catch {
              // Fichier binaire : diff textuel impossible, signalé sans le masquer.
              console.log(chalk.dim(`  [diff] ${file.rel} : fichier non textuel, ignoré`));
            }
          }
        }

        if (options.dryRun) {
          console.log(chalk.dim(`  [dry-run] Serait mis à jour : ${label} → v${manifest.version}`));
          continue;
        }

        // ── Copie réelle des fichiers ─────────────────────────────────────
        let results: FileCopyResult[] = [];
        let relativeFiles: string[] = [];

        if (ref.type === "foundation") {
          const entry = loadComponentEntry(`foundation:${ref.id}`, resolved.registryRoot) as
            | FoundationRegistryEntry
            | null;
          if (!entry) {
            console.log(chalk.red(`  ✖ ${label} : manifeste de fondation introuvable.`));
            exitCode = 1;
            continue;
          }
          const resolvedFoundation: ResolvedFoundation = {
            name: entry.name,
            entry,
            npmDeps: entry.dependencies ?? [],
            expoDepsWithVersions: {},
            requiredFoundations: entry.requiresFoundations ?? [],
          };
          const plan = planFoundation(resolvedFoundation, resolved.sourceRoot, {
            projectRoot: cwd,
            componentsPath: config.componentsPath,
            importTransform,
          });
          const applied = applyFoundationPlan(plan, { overwrite: true });
          const failed = applied.files.filter((f) => f.status === "failed");
          if (failed.length > 0) {
            console.log(chalk.red(`  ✖ Échec de la mise à jour de ${label} :`));
            for (const failure of failed) {
              console.log(chalk.red(`    • ${failure.relativePath} : ${failure.reason ?? "échec"}`));
            }
            exitCode = 1;
            continue;
          }
          relativeFiles = applied.files
            .filter((f) => f.status === "written" || f.status === "unchanged")
            .map((f) => relativeToProject(cwd, f.destination));
          if (manifest.assets.length > 0) {
            const assetResults = copyAssetFiles(
              manifest.assets,
              resolved.sourceRoot,
              cwd,
              { overwrite: true },
            );
            const assetFailures = assetResults.filter((r) => r.status === "failed");
            if (assetFailures.length > 0) {
              console.log(chalk.red(`  ✖ Assets de ${label} non installés :`));
              for (const failure of assetFailures) {
                console.log(chalk.red(`    • ${relativeToProject(cwd, failure.destination)} : ${failure.reason ?? "échec"}`));
              }
              exitCode = 1;
              continue;
            }
            relativeFiles.push(...lockFilesFor(assetResults, cwd));
          }
        } else if (ref.type === "template" || ref.type === "widget") {
          if (!installPath) {
            console.log(chalk.red(`  ✖ ${label} : chemin d'installation introuvable.`));
            exitCode = 1;
            continue;
          }
          const sourceDir = ref.type === "template"
            ? join(TEMPLATES_ROOT, ref.id)
            : join(WIDGETS_ROOT, ref.id);
          const artefactTargetDir = join(cwd, installPath);
          results = copyArtefactFiles(
            manifest.files,
            sourceDir,
            artefactTargetDir,
            {
              overwrite: true,
              importTransform,
              sourceRoot: resolved.sourceRoot,
              projectRoot: cwd,
              declaredAssets: manifest.assets,
            },
          );
          const assetResults = manifest.assets.length > 0
            ? copyAssetFiles(manifest.assets, resolved.sourceRoot, cwd, { overwrite: true })
            : [];
          const allResults = [...results, ...assetResults];
          const failures = allResults.filter((r) => r.status === "failed");
          if (failures.length > 0) {
            console.log(chalk.red(`  ✖ Échec de la mise à jour de ${label} :`));
            for (const failure of failures) {
              console.log(chalk.red(`    • ${relativeToProject(cwd, failure.destination)} : ${failure.reason ?? "échec"}`));
            }
            exitCode = 1;
            continue;
          }
          relativeFiles = lockFilesFor(allResults, cwd);
        } else {
          results = copyComponentFiles(manifest.files, resolved.sourceRoot, targetDir, {
            overwrite: true,
            merge: options.merge !== false,
            importTransform,
            projectRoot: cwd,
            declaredAssets: manifest.assets,
          });
          const assetResults = manifest.assets.length > 0
            ? copyAssetFiles(manifest.assets, resolved.sourceRoot, cwd, { overwrite: true })
            : [];
          const allResults = [...results, ...assetResults];
          const failures = allResults.filter((r) => r.status === "failed");
          if (failures.length > 0) {
            console.log(chalk.red(`  ✖ Échec de la mise à jour de ${label} :`));
            for (const failure of failures) {
              console.log(chalk.red(`    • ${relativeToProject(cwd, failure.destination)} : ${failure.reason ?? "échec"}`));
            }
            exitCode = 1;
            continue;
          }
          relativeFiles = lockFilesFor(allResults, cwd);
        }

        recordLock(cwd, ref, manifest, installPath, relativeFiles);

        if (ref.type === "component" || ref.type === "hook" || ref.type === "lib") {
          updatedConfig = markComponentInstalled(
            updatedConfig,
            ref.id,
            manifest.version,
            manifest.registryVersion,
          );
        }

        if (options.skills !== false && ref.type === "component") {
          copyComponentSkill(ref.id, resolved.sourceRoot, cwd, false);
        }

        for (const dep of manifest.dependencies) npmDeps.add(dep);
        for (const dep of manifest.expoDependencies) expoDeps.add(dep);

        console.log(chalk.green(`  ✔ ${label} mis à jour (v${manifest.version})`));
      }

      if (options.dryRun) {
        console.log();
        console.log(chalk.dim("  [dry-run] Aucune modification appliquée."));
        console.log();
        return;
      }

      // ── 7. Dépendances npm/Expo réellement installées ────────────────────
      if (npmDeps.size > 0 || expoDeps.size > 0) {
        const pm = config.packageManager ?? project.packageManager ?? "npm";
        try {
          if (npmDeps.size > 0) {
            installNpmPackages([...npmDeps], pm, cwd);
            console.log(chalk.dim(`    ✔ Dépendances npm synchronisées (${[...npmDeps].join(", ")})`));
          }
          if (expoDeps.size > 0) {
            installExpoPackages([...expoDeps], pm, cwd);
            console.log(chalk.dim(`    ✔ Dépendances Expo synchronisées (${[...expoDeps].join(", ")})`));
          }
        } catch (error) {
          console.log(chalk.red(`  ✖ Installation des dépendances échouée : ${(error as Error).message}`));
          exitCode = 1;
        }
      }

      if (updatedConfig !== config) {
        writeConfig(project.rashwrightConfigPath, updatedConfig);
      }

      if (exitCode === 0) {
        executeHook("post-update", updatedConfig.hooks, cwd, { dryRun: false });
        console.log();
        console.log(chalk.bold.green("  ✔ Smart Update terminé avec succès !"));
        console.log();
        return;
      }

      console.log();
      console.log(chalk.bold.red("  ✖ Smart Update terminé avec des erreurs."));
      console.log();
      process.exit(exitCode);
    });

  return cmd;
}
