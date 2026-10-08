import { Command } from "commander";
import chalk from "chalk";
import { loadAllComponentEntries } from "../core/dependency-resolver.js";
import { resolveRegistry } from "../core/remote-registry.js";
import { detectProject } from "../core/project-detector.js";
import { readConfig } from "../core/config-manager.js";

export function whyCommand(): Command {
  const cmd = new Command("why");
  cmd
    .description("Expliquer pourquoi un composant ou un paquet Expo est nécessaire dans le projet")
    .argument("<target>", "Nom du composant ou du paquet Expo")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .action(async (target: string, options) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      const resolved = await resolveRegistry({
        registryUrl: options.registry,
      });

      const allEntries = loadAllComponentEntries(resolved.registryRoot);

      // Si le projet a une config, on filtre sur les composants installés en priorité
      let installedComponents: string[] = [];
      if (project.hasRashwrightConfig) {
        const config = readConfig(project.rashwrightConfigPath);
        installedComponents = Object.keys(config.components);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(` — Analyse inverse : why "${target}" ?`));
      console.log();

      // 1. Est-ce un paquet Expo ?
      const compsRequiringExpo = allEntries.filter((e) =>
        e.expoDependencies.includes(target) || e.optionalExpoDependencies.includes(target)
      );

      // 2. Est-ce un composant requis par d'autres composants ?
      const compsRequiringComp = allEntries.filter((e) => e.requiresComponents.includes(target));

      let matched = false;

      if (compsRequiringExpo.length > 0) {
        matched = true;
        console.log(chalk.bold(`  Le paquet Expo ${chalk.yellow(target)} est requis par :`));
        for (const c of compsRequiringExpo) {
          const isInstalled = installedComponents.includes(c.name);
          const instTag = isInstalled ? chalk.green(" [installé dans votre projet]") : chalk.dim(" [dans le registre]");
          console.log(chalk.dim(`    • `) + chalk.cyan(c.name) + instTag);
        }
        console.log();
      }

      if (compsRequiringComp.length > 0) {
        matched = true;
        console.log(chalk.bold(`  Le composant ${chalk.cyan(target)} est requis par :`));
        for (const c of compsRequiringComp) {
          const isInstalled = installedComponents.includes(c.name);
          const instTag = isInstalled ? chalk.green(" [installé dans votre projet]") : chalk.dim(" [dans le registre]");
          console.log(chalk.dim(`    • `) + chalk.cyan(c.name) + instTag);
        }
        console.log();
      }

      // Si c'est directement un composant installé
      if (installedComponents.includes(target)) {
        matched = true;
        console.log(chalk.green(`  ✔ "${target}" a été explicitement installé dans votre projet (rashwright-ui.json).`));
        console.log();
      }

      if (!matched) {
        console.log(chalk.yellow(`  ⚠ Aucun composant ni dépendance ne semble requérir "${target}".`));
        console.log();
      }
    });

  return cmd;
}
