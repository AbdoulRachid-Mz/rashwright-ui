import { Command } from "commander";
import chalk from "chalk";
import { detectProject } from "../core/project-detector.js";
import {
  getScopedRegistries,
  addScopedRegistry,
  removeScopedRegistry,
} from "../core/scoped-registry.js";

export function registryCommand(): Command {
  const cmd = new Command("registry");
  cmd.description("Gérer les registres de composants personnalisés ou d'organisation");

  // rs-ui registry list
  cmd
    .command("list")
    .description("Lister les registres configurés pour ce projet")
    .action(() => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(" — Registres configurés"));
      console.log();

      console.log(chalk.bold("  Registre public par défaut :"));
      console.log(chalk.dim("    • official : https://unpkg.com/@rashwright/ui-mobile@latest"));
      console.log();

      const scoped = getScopedRegistries(cwd);
      const entries = Object.values(scoped);

      if (entries.length === 0) {
        console.log(chalk.dim("  Aucun registre d'organisation supplémentaire configuré."));
        console.log(chalk.dim("  Pour en ajouter un : rs-ui registry add <alias> <url>"));
      } else {
        console.log(chalk.bold(`  Registres d'organisation (${entries.length}) :`));
        for (const e of entries) {
          console.log(`    ${chalk.cyan("•")} ${chalk.bold(e.alias)} : ${chalk.dim(e.url)}`);
        }
      }
      console.log();
    });

  // rs-ui registry add <alias> <url>
  cmd
    .command("add <alias> <url>")
    .description("Ajouter une source de registre d'organisation (ex: rs-ui registry add internal https://...)")
    .option("--token <token>", "Jeton d'authentification Bearer optionnel")
    .action((alias: string, url: string, options: { token?: string }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      try {
        const entry = addScopedRegistry(cwd, alias, url, options.token);
        console.log();
        console.log(chalk.green(`  ✔ Registre "${entry.alias}" ajouté avec succès !`));
        console.log(chalk.dim(`    • URL   : ${entry.url}`));
        console.log(chalk.dim(`    • Usage : rs-ui add @${entry.alias}/<composant>`));
        console.log();
      } catch (err) {
        console.log(chalk.red(`  ✖ Erreur : ${(err as Error).message}`));
        process.exit(1);
      }
    });

  // rs-ui registry remove <alias>
  cmd
    .command("remove <alias>")
    .description("Supprimer un registre configuré")
    .action((alias: string) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      const ok = removeScopedRegistry(cwd, alias);
      if (ok) {
        console.log();
        console.log(chalk.green(`  ✔ Registre "${alias}" retiré avec succès.`));
        console.log();
      } else {
        console.log();
        console.log(chalk.yellow(`  ⚠ Registre "${alias}" introuvable.`));
        console.log();
      }
    });

  return cmd;
}
