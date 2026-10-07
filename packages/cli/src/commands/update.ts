import { Command } from "commander";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig, markComponentInstalled, getInstalledVersion } from "../core/config-manager.js";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { copyComponentFiles } from "../core/file-manager.js";
import { REGISTRY_ROOT, SOURCE_ROOT } from "../core/paths.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";

/**
 * C-1 — Comparaison par hash normalisé.
 * Strip les commentaires line-comment et normalise les espaces avant de hacher.
 * Évite les faux positifs quand l'utilisateur ajoute des commentaires ou reformate.
 */
function contentHash(s: string): string {
  return createHash("sha256")
    .update(s.replace(/\/\/.*$/gm, "").replace(/\s+/g, " ").trim())
    .digest("hex");
}

export function updateCommand(): Command {
  const cmd = new Command("update");
  cmd
    .description("Mettre à jour les composants Rashwright UI installés")
    .argument("[components...]", "Composants à mettre à jour (tous si non spécifié)")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--yes", "Écraser sans demander")
    .option("--dry-run", "Afficher sans exécuter")
    .action(async (componentArgs: string[], options) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé."));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);
      const installed = Object.keys(config.components);

      if (installed.length === 0) {
        console.log(chalk.dim("  Aucun composant installé."));
        return;
      }

      const toUpdate = componentArgs.length > 0 ? componentArgs : installed;

      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui update"));
      if (resolved.isRemote) {
        console.log(chalk.dim(`  ℹ Source registre : ${resolved.registryUrl}`));
      }
      console.log();

      let updatedConfig = config;

      for (const name of toUpdate) {
        const installedVersion = getInstalledVersion(config, name);
        if (!installedVersion) {
          console.log(chalk.dim(`  ○ ${name} — non installé, ignoré`));
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
          console.log(chalk.yellow(`  ⚠ ${name} — non trouvé dans le registry`));
          continue;
        }

        if (entry.version === installedVersion) {
          console.log(chalk.dim(`  ✔ ${name} — déjà à jour (v${entry.version})`));
          continue;
        }

        // ── C-1 : Comparaison par hash normalisé (strip commentaires + whitespace)
        const targetDir = join(cwd, config.componentsPath);
        const compFile = join(targetDir, `${name}.tsx`);
        let isModified = false;

        if (resolved.isRemote) {
          await ensureComponentDownloaded(name, {
            registryUrl: resolved.registryUrl,
            registryRoot: resolved.registryRoot,
            sourceRoot: resolved.sourceRoot,
          });
        }

        if (existsSync(compFile)) {
          const localContent = readFileSync(compFile, "utf-8");
          const srcPath = join(resolved.sourceRoot, `components/ui/${name}.tsx`);
          if (existsSync(srcPath)) {
            const srcContent = readFileSync(srcPath, "utf-8");
            isModified = contentHash(localContent) !== contentHash(srcContent);
          }
        }

        console.log(chalk.bold(`  ${name}`) + chalk.dim(` v${installedVersion} → v${entry.version}`));

        if (isModified && !options.yes) {
          console.log(chalk.yellow("    ⚠ Modifications locales détectées (contenu fonctionnel différent)."));
          const choice = await confirm({
            message: `    Écraser ${name}.tsx?`,
            default: false,
          });
          if (!choice) {
            console.log(chalk.dim("    Ignoré — modifications conservées."));
            continue;
          }
        }

        if (!options.dryRun) {
          const results = copyComponentFiles(entry.files, resolved.sourceRoot, targetDir, {
            overwrite: true,
            dryRun: false,
          });
          const ok = results.every((r) => r.status !== "failed");
          if (ok) {
            updatedConfig = markComponentInstalled(updatedConfig, name, entry.version);
            console.log(chalk.green(`    ✔ Mis à jour`));

            // ── C-4 : Re-résoudre et réinstaller les expoDependencies si le composant a changé
            if (entry.expoDependencies.length > 0) {
              const pm = config.packageManager ?? project.packageManager ?? "npm";
              const runner = pm === "bun" ? "bunx" : "npx";
              const depsToInstall = entry.expoDependencies.join(" ");
              console.log(chalk.dim(`    ↻ Réinstallation des expoDeps : ${depsToInstall}`));
              try {
                execSync(`${runner} expo install ${depsToInstall} -- --non-interactive`, {
                  cwd,
                  stdio: "inherit",
                });
              } catch {
                console.log(chalk.yellow(`    ⚠ Réinstallation expoDeps échouée — lancez manuellement : ${runner} expo install ${depsToInstall}`));
              }
            }
          } else {
            console.log(chalk.red(`    ✖ Échec de la mise à jour`));
          }
        } else {
          console.log(chalk.dim(`    [dry-run] Serait mis à jour`));
          if (entry.expoDependencies.length > 0) {
            console.log(chalk.dim(`    [dry-run] Re-installerait expoDeps : ${entry.expoDependencies.join(", ")}`));
          }
        }
      }

      if (!options.dryRun) {
        writeConfig(project.rashwrightConfigPath, updatedConfig);
      }

      console.log();
      console.log(chalk.green("  ✔ Mise à jour terminée."));
      console.log();
    });

  return cmd;
}
