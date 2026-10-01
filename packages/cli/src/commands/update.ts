import { Command } from "commander";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig, markComponentInstalled, getInstalledVersion } from "../core/config-manager.js";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { copyComponentFiles } from "../core/file-manager.js";
import { REGISTRY_ROOT, SOURCE_ROOT } from "../core/paths.js";

export function updateCommand(): Command {
  const cmd = new Command("update");
  cmd
    .description("Mettre à jour les composants Rashwright UI installés")
    .argument("[components...]", "Composants à mettre à jour (tous si non spécifié)")
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

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui update"));
      console.log();

      let updatedConfig = config;

      for (const name of toUpdate) {
        const installedVersion = getInstalledVersion(config, name);
        if (!installedVersion) {
          console.log(chalk.dim(`  ○ ${name} — non installé, ignoré`));
          continue;
        }

        const entry = loadComponentEntry(name, REGISTRY_ROOT);
        if (!entry) {
          console.log(chalk.yellow(`  ⚠ ${name} — non trouvé dans le registry`));
          continue;
        }

        if (entry.version === installedVersion) {
          console.log(chalk.dim(`  ✔ ${name} — déjà à jour (v${entry.version})`));
          continue;
        }

        // Check if the local file was modified
        const targetDir = join(cwd, config.componentsPath);
        const compFile = join(targetDir, `${name}.tsx`);
        let isModified = false;

        if (existsSync(compFile)) {
          const localContent = readFileSync(compFile, "utf-8");
          const srcPath = join(SOURCE_ROOT, `components/ui/${name}.tsx`);
          if (existsSync(srcPath)) {
            const srcContent = readFileSync(srcPath, "utf-8");
            isModified = localContent !== srcContent;
          }
        }

        console.log(chalk.bold(`  ${name}`) + chalk.dim(` v${installedVersion} → v${entry.version}`));

        if (isModified && !options.yes) {
          console.log(chalk.yellow("    ⚠ Modifications locales détectées."));
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
          const results = copyComponentFiles(entry.files, SOURCE_ROOT, targetDir, {
            overwrite: true,
            dryRun: false,
          });
          const ok = results.every((r) => r.status !== "failed");
          if (ok) {
            updatedConfig = markComponentInstalled(updatedConfig, name, entry.version);
            console.log(chalk.green(`    ✔ Mis à jour`));
          } else {
            console.log(chalk.red(`    ✖ Échec de la mise à jour`));
          }
        } else {
          console.log(chalk.dim(`    [dry-run] Serait mis à jour`));
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
