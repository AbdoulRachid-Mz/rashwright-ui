import { Command } from "commander";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { detectProject } from "../core/project-detector.js";
import { REGISTERED_MIGRATIONS, runMigrations } from "../core/migration-runner.js";

export function migrateCommand(): Command {
  const cmd = new Command("migrate");
  cmd
    .description("Appliquer les migrations système de Rashwright UI sur le projet")
    .option("--check", "Vérifier les migrations en attente sans les appliquer")
    .option("--yes", "Appliquer directement sans confirmation interactive")
    .option("--dry-run", "Simuler l'exécution des migrations")
    .action(async (options: { check?: boolean; yes?: boolean; dryRun?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce répertoire."));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(" — rs-ui migrate"));
      console.log();

      if (options.check) {
        console.log(chalk.bold(`  Migrations disponibles (${REGISTERED_MIGRATIONS.length}) :`));
        for (const m of REGISTERED_MIGRATIONS) {
          console.log(`  ${chalk.cyan("•")} ${chalk.bold(m.id)} : ${chalk.dim(m.description)}`);
        }
        console.log();
        return;
      }

      console.log(chalk.bold(`  Migrations à exécuter (${REGISTERED_MIGRATIONS.length}) :`));
      for (const m of REGISTERED_MIGRATIONS) {
        console.log(`  ${chalk.cyan("•")} ${chalk.bold(m.id)} (${m.description})`);
      }
      console.log();

      if (!options.yes && !options.dryRun) {
        const ok = await confirm({
          message: "Lancer l'exécution des migrations ? (Un snapshot de sécurité sera créé)",
          default: true,
        });
        if (!ok) {
          console.log(chalk.dim("  Opération annulée."));
          return;
        }
      }

      try {
        const outcome = await runMigrations(cwd, {
          dryRun: options.dryRun,
          logger: {
            info: (msg) => console.log(chalk.dim(`  [info] ${msg}`)),
            warn: (msg) => console.log(chalk.yellow(`  [warn] ${msg}`)),
            success: (msg) => console.log(chalk.green(`  ✔ ${msg}`)),
          },
        });

        console.log();
        console.log(chalk.green(`  ✔ ${outcome.executedCount} migration(s) exécutée(s) avec succès !`));
        for (const r of outcome.results) {
          console.log(chalk.dim(`    • ${r.id} :`));
          r.changes.forEach((c) => console.log(chalk.dim(`      - ${c}`)));
        }
        console.log();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(chalk.red(`  ✖ Erreur lors de la migration : ${msg}`));
        process.exit(1);
      }
    });

  return cmd;
}
