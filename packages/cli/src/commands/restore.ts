import { Command } from "commander";
import chalk from "chalk";
import { select, confirm } from "@inquirer/prompts";
import { listBackups, getLatestBackup, restoreBackup } from "../core/backup-manager.js";
import { detectProject } from "../core/project-detector.js";

export function restoreCommand(): Command {
  const cmd = new Command("restore");
  cmd
    .description("Restaurer un snapshot de sauvegarde du projet Rashwright UI")
    .argument("[id]", "Identifiant spécifique du snapshot à restaurer")
    .option("--latest", "Restaurer immédiatement le dernier snapshot sans invite interactive")
    .option("--yes", "Confirmer la restauration sans invite de validation")
    .option("--dry-run", "Simuler la restauration sans modifier les fichiers")
    .action(async (idArg: string | undefined, options: { latest?: boolean; yes?: boolean; dryRun?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(" — rs-ui restore"));
      console.log();

      const backups = listBackups(cwd);
      if (backups.length === 0) {
        console.log(chalk.yellow("  ⚠ Aucun snapshot de sauvegarde trouvé dans .rashwright/backups/"));
        return;
      }

      let targetId: string;

      if (idArg) {
        targetId = idArg;
      } else if (options.latest) {
        const latest = getLatestBackup(cwd);
        if (!latest) {
          console.log(chalk.yellow("  ⚠ Aucun snapshot disponible."));
          return;
        }
        targetId = latest.id;
      } else {
        const choices = backups.map((b) => {
          const dateStr = b.meta.timestamp ? new Date(b.meta.timestamp).toLocaleString() : b.id;
          const labelStr = b.meta.label ? ` [${b.meta.label}]` : "";
          const trigStr = b.meta.trigger ? ` (${b.meta.trigger})` : "";
          return {
            name: `${b.id} — ${dateStr}${labelStr}${trigStr} (${b.meta.componentsCount} comps)`,
            value: b.id,
          };
        });

        targetId = await select({
          message: "Sélectionnez le snapshot à restaurer :",
          choices,
        });
      }

      if (!options.yes && !options.dryRun) {
        const ok = await confirm({
          message: `Confirmez-vous la restauration du snapshot "${targetId}" ? (Les fichiers locaux seront écrasés)`,
          default: false,
        });
        if (!ok) {
          console.log(chalk.dim("  Opération annulée."));
          return;
        }
      }

      try {
        const result = restoreBackup(cwd, targetId, { dryRun: options.dryRun });
        console.log(chalk.green(`  ✔ Snapshot "${result.restoredId}" restauré avec succès !`));
        console.log(chalk.dim(`    • Composants restaurés : ${result.restoredComponents}`));
        console.log();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(chalk.red(`  ✖ Erreur lors de la restauration : ${msg}`));
        process.exit(1);
      }
    });

  return cmd;
}
