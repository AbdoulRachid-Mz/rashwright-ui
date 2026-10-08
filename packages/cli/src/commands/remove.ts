import { Command } from "commander";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import { join } from "node:path";
import { existsSync, unlinkSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig, markComponentRemoved, isComponentInstalled } from "../core/config-manager.js";
import { loadAllComponentEntries } from "../core/dependency-resolver.js";
import { REGISTRY_ROOT } from "../core/paths.js";
import { generateUiIndex } from "../core/starter-generator.js";
import { resolveRegistry } from "../core/remote-registry.js";
import { removeComponentSkill } from "../core/skills-manager.js";

export function removeCommand(): Command {
  const cmd = new Command("remove");
  cmd
    .description("Retirer un composant Rashwright UI du projet")
    .argument("<component>", "Nom du composant à retirer")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--yes", "Confirmer sans demander")
    .option("--dry-run", "Afficher sans exécuter")
    .action(async (name: string, options) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé."));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);

      if (!isComponentInstalled(config, name)) {
        console.log(chalk.yellow(`  ⚠  ${name} n'est pas installé.`));
        return;
      }

      const resolved = await resolveRegistry({ registryUrl: options.registry });

      // Check which components depend on this one
      const allEntries = loadAllComponentEntries(resolved.registryRoot);
      const dependents = allEntries.filter(
        (e) => isComponentInstalled(config, e.name) && e.requiresComponents.includes(name)
      );

      console.log();
      if (dependents.length > 0) {
        console.log(chalk.yellow(`  ⚠  "${name}" est requis par:`));
        dependents.forEach((d) => console.log(chalk.dim(`    • ${d.name}`)));
        console.log();
        console.log(chalk.dim("    Retirez d'abord les composants dépendants."));
        process.exit(1);
      }

      const compPath = join(cwd, config.componentsPath, `${name}.tsx`);
      const fileExists = existsSync(compPath);

      console.log(chalk.bold(`  Retirer "${name}":`));
      if (fileExists) console.log(chalk.dim(`  • Supprimer: ${compPath}`));
      console.log(chalk.dim(`  • Mettre à jour rashwright-ui.json`));
      console.log();

      if (!options.yes && !options.dryRun) {
        const ok = await confirm({ message: "Confirmer la suppression?", default: false });
        if (!ok) { console.log(chalk.dim("  Annulé.")); return; }
      }

      if (!options.dryRun) {
        if (fileExists) {
          unlinkSync(compPath);
          console.log(chalk.dim(`  ✔ Fichier supprimé: ${compPath}`));
        }
        removeComponentSkill(name, cwd, options.dryRun);
        const updated = markComponentRemoved(config, name);
        const targetDir = join(cwd, config.componentsPath);
        generateUiIndex(targetDir, Object.keys(updated.components), options.dryRun);
        writeConfig(project.rashwrightConfigPath, updated);
      }

      console.log(chalk.green(`  ✔ "${name}" retiré.`));
      console.log();
    });

  return cmd;
}
