import { Command } from "commander";
import chalk from "chalk";
import { confirm, checkbox } from "@inquirer/prompts";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig, markComponentInstalled, getInstalledVersion } from "../core/config-manager.js";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { copyComponentFiles } from "../core/file-manager.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";
import { checkComponentIntegrity, recordLockedComponent } from "../core/lock-manager.js";
import { createBackup } from "../core/backup-manager.js";
import { computeLineDiff, formatDiffOutput } from "../core/diff.js";
import { copyComponentSkill } from "../core/skills-manager.js";

interface ComponentUpdateStatus {
  name: string;
  installedVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  isModified: boolean;
  status: "clean" | "modified" | "missing" | "untracked";
  diffStats?: { added: number; removed: number };
}

export function updateCommand(): Command {
  const cmd = new Command("update");
  cmd
    .description("Mettre à jour intelligemment les composants Rashwright UI installés (Smart Update)")
    .argument("[components...]", "Composants spécifiques à mettre à jour (tous si non spécifié)")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--check", "Audit non-destructif : affiche les statuts de mise à jour sans modifier aucun fichier")
    .option("-i, --interactive", "Sélectionner interactivement les composants à mettre à jour", false)
    .option("--diff", "Afficher les différences détaillées avant d'écraser")
    .option("--skills", "Mettre à jour également les Skills IA associés", true)
    .option("--no-skills", "Ne pas mettre à jour les Skills IA")
    .option("--yes", "Écraser sans demander confirmation")
    .option("--dry-run", "Afficher les actions prévues sans les exécuter")
    .action(async (componentArgs: string[], options) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        console.log(chalk.dim("    Exécutez d'abord: rs-ui init"));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);
      const installed = Object.keys(config.components);

      if (installed.length === 0) {
        console.log(chalk.yellow("  ⚠ Aucun composant installé."));
        return;
      }

      const targetList = componentArgs.length > 0 ? componentArgs : installed;

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

      // ── 1. Analyse d'intégrité et de version de chaque composant ─────────
      const statuses: ComponentUpdateStatus[] = [];

      for (const name of targetList) {
        const installedVersion = getInstalledVersion(config, name);
        if (!installedVersion) {
          if (componentArgs.length > 0) {
            console.log(chalk.dim(`  ○ ${name} — non installé, ignoré`));
          }
          continue;
        }

        let entry = loadComponentEntry(name, resolved.registryRoot);
        if (!entry && resolved.isRemote) {
          entry = await ensureComponentDownloaded(name, {
            registryUrl: resolved.registryUrl,
            registryRoot: resolved.registryRoot,
            sourceRoot: resolved.sourceRoot,
          });
        }

        if (!entry) {
          console.log(chalk.yellow(`  ⚠ ${name} — non trouvé dans le registre`));
          continue;
        }

        const integrity = checkComponentIntegrity(cwd, name);
        const hasUpdate = entry.version !== installedVersion;
        const isModified = integrity.status === "modified";

        // Calcul du diff s'il existe
        let diffStats: { added: number; removed: number } | undefined;
        const compPath = join(cwd, config.componentsPath, `${name}.tsx`);
        const srcPath = join(resolved.sourceRoot, `components/ui/${name}.tsx`);
        if (existsSync(compPath) && existsSync(srcPath)) {
          const localCode = readFileSync(compPath, "utf-8");
          const regCode = readFileSync(srcPath, "utf-8");
          const diffLines = computeLineDiff(localCode, regCode);
          diffStats = {
            added: diffLines.filter((l) => l.type === "added").length,
            removed: diffLines.filter((l) => l.type === "removed").length,
          };
        }

        statuses.push({
          name,
          installedVersion,
          latestVersion: entry.version,
          hasUpdate,
          isModified,
          status: integrity.status,
          diffStats,
        });
      }

      if (statuses.length === 0) {
        console.log(chalk.yellow("  ⚠ Aucun composant valide sélectionné."));
        return;
      }

      const updatable = statuses.filter((s) => s.hasUpdate);

      // ── 2. Mode --check (Audit non-destructif) ───────────────────────────
      if (options.check) {
        console.log(chalk.bold(`  État des composants (${statuses.length} analysé(s)) :`));
        console.log();
        for (const s of statuses) {
          const versionTag = `v${s.installedVersion} → v${s.latestVersion}`;
          if (s.hasUpdate) {
            const warningTag = s.isModified ? chalk.yellow(" (⚠ modifications locales)") : chalk.green(" (intact)");
            console.log(`  ${chalk.cyan("▲")} ${chalk.bold(s.name)} : ${chalk.yellow(versionTag)}${warningTag}`);
            if (s.diffStats) {
              console.log(chalk.dim(`    Différence : +${s.diffStats.added} lignes, -${s.diffStats.removed} lignes`));
            }
          } else {
            const statusDetail = s.isModified ? chalk.yellow(" (modifié localement)") : chalk.dim(" (à jour)");
            console.log(`  ${chalk.green("✔")} ${s.name} : v${s.installedVersion}${statusDetail}`);
          }
        }

        console.log();
        if (updatable.length > 0) {
          console.log(chalk.yellow(`  ${updatable.length} composant(s) possèdent des mises à jour.`));
          console.log(chalk.dim("  Exécutez 'rs-ui update' pour les appliquer."));
        } else {
          console.log(chalk.green("  Tous les composants installés sont à jour avec le registre."));
        }
        console.log();
        return;
      }

      // Si aucun composant n'a de mise à jour
      if (updatable.length === 0) {
        console.log(chalk.green("  ✔ Tous les composants ciblés sont déjà à jour avec le registre."));
        console.log();
        return;
      }

      console.log(chalk.bold(`  ${updatable.length} composant(s) possèdent des mises à jour :`));
      for (const s of updatable) {
        const modWarning = s.isModified ? chalk.yellow(" (⚠ modifications locales détectées)") : chalk.dim(" (intact)");
        console.log(chalk.dim(`    • ${s.name} : v${s.installedVersion} → v${s.latestVersion}${modWarning}`));
      }
      console.log();

      // ── 3. Sélection des composants à mettre à jour ──────────────────────
      let selectedNames: string[] = updatable.map((u) => u.name);

      if (options.interactive && !options.yes) {
        const choices = updatable.map((u) => {
          const modNote = u.isModified ? " [MODIFIÉ]" : "";
          const diffNote = u.diffStats ? ` (+${u.diffStats.added}/-${u.diffStats.removed})` : "";
          return {
            name: `${u.name} (v${u.installedVersion} → v${u.latestVersion})${modNote}${diffNote}`,
            value: u.name,
            checked: true,
          };
        });

        selectedNames = await checkbox({
          message: "Sélectionnez les composants à mettre à jour :",
          choices,
        });

        if (selectedNames.length === 0) {
          console.log(chalk.dim("  Aucun composant sélectionné. Opération annulée."));
          return;
        }
      }

      // ── 4. Confirmation si des fichiers modifiés localement sont concernés
      const modifiedSelected = updatable.filter((u) => selectedNames.includes(u.name) && u.isModified);
      if (modifiedSelected.length > 0 && !options.yes && !options.dryRun) {
        console.log(
          chalk.yellow(
            `  ⚠ Attention : ${modifiedSelected.length} composant(s) ont été modifiés localement (${modifiedSelected.map((m) => m.name).join(", ")}).`
          )
        );
        const proceed = await confirm({
          message: "Voulez-vous écraser vos modifications locales pour ces composants ?",
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
          label: `pre-update-${selectedNames.join("-").slice(0, 30)}`,
        });
        if (backup) {
          console.log(chalk.green(`  ✔ Snapshot de sécurité automatique créé (${backup.id})`));
          console.log();
        }
      }

      // ── 6. Application des mises à jour ─────────────────────────────────
      let updatedConfig = config;
      const targetDir = join(cwd, config.componentsPath);

      for (const name of selectedNames) {
        const entry = loadComponentEntry(name, resolved.registryRoot);
        if (!entry) continue;

        if (options.diff) {
          const compPath = join(targetDir, `${name}.tsx`);
          const srcPath = join(resolved.sourceRoot, `components/ui/${name}.tsx`);
          if (existsSync(compPath) && existsSync(srcPath)) {
            const oldCode = readFileSync(compPath, "utf-8");
            const newCode = readFileSync(srcPath, "utf-8");
            console.log(chalk.bold.yellow(`\n  [diff] ${name}.tsx (local vs registre) :`));
            console.log(formatDiffOutput(computeLineDiff(oldCode, newCode)));
            console.log();
          }
        }

        if (!options.dryRun) {
          const results = copyComponentFiles(entry.files, resolved.sourceRoot, targetDir, {
            overwrite: true,
            dryRun: false,
          });

          const ok = results.every((r) => r.status !== "failed");
          if (ok) {
            // Mettre à jour le skill IA si demandé
            if (options.skills !== false) {
              copyComponentSkill(name, resolved.sourceRoot, cwd, false);
            }

            // Enregistrer dans rashwright-ui.lock
            const lockFiles = (entry.files ?? []).map((f: string) => {
              const clean = f.replace(/^components\/ui\//, "");
              return `${config.componentsPath}/${clean}`;
            });
            recordLockedComponent(
              cwd,
              name,
              entry.version,
              lockFiles,
              entry.dependencies ?? [],
              entry.expoDependencies ?? [],
              false
            );

            updatedConfig = markComponentInstalled(updatedConfig, name, entry.version);
            console.log(chalk.green(`  ✔ ${name} mis à jour (v${entry.version})`));

            // Réinstallation des expoDependencies
            if (entry.expoDependencies && entry.expoDependencies.length > 0) {
              const pm = config.packageManager ?? project.packageManager ?? "npm";
              const runner = pm === "bun" ? "bunx" : "npx";
              const depsStr = entry.expoDependencies.join(" ");
              try {
                execSync(`${runner} expo install ${depsStr} -- --non-interactive`, {
                  cwd,
                  stdio: "ignore",
                });
                console.log(chalk.dim(`    ✔ Dépendances Expo synchronisées (${depsStr})`));
              } catch {
                console.log(chalk.yellow(`    ⚠ Échec install auto expo: ${runner} expo install ${depsStr}`));
              }
            }
          } else {
            console.log(chalk.red(`  ✖ Échec de la mise à jour pour ${name}`));
          }
        } else {
          console.log(chalk.dim(`  [dry-run] Serait mis à jour : ${name} → v${entry.version}`));
        }
      }

      if (!options.dryRun) {
        writeConfig(project.rashwrightConfigPath, updatedConfig);
      }

      console.log();
      console.log(chalk.bold.green("  ✔ Smart Update terminé avec succès !"));
      console.log();
    });

  return cmd;
}
