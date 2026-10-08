import { Command } from "commander";
import chalk from "chalk";
import { createBackup } from "../core/backup-manager.js";
import { detectProject } from "../core/project-detector.js";

export function backupCommand(): Command {
  const cmd = new Command("backup");
  cmd
    .description("Créer un instantané (snapshot) de sauvegarde du projet Rashwright UI")
    .argument("[label]", "Libellé optionnel pour identifier le snapshot")
    .option("--dry-run", "Afficher les opérations sans les exécuter")
    .action(async (label: string | undefined, options: { dryRun?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(" — rs-ui backup"));
      console.log();

      const snapshot = createBackup(cwd, {
        label,
        trigger: "manual",
        dryRun: options.dryRun,
      });

      if (!snapshot) {
        console.log(chalk.red("  ✖ Impossible de créer le snapshot de sauvegarde."));
        process.exit(1);
      }

      console.log(chalk.green(`  ✔ Snapshot créé avec succès !`));
      console.log(chalk.dim(`    • Identifiant  : ${snapshot.id}`));
      if (label) {
        console.log(chalk.dim(`    • Libellé      : ${label}`));
      }
      console.log(chalk.dim(`    • Composants   : ${snapshot.meta.componentsCount}`));
      console.log(chalk.dim(`    • Emplacement  : ${snapshot.path}`));
      console.log();
    });

  return cmd;
}
