import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { scaffoldProjectComponent } from "../core/component-scaffolder.js";
import { recordLockedComponent } from "../core/lock-manager.js";
import { generateUiIndex } from "../core/starter-generator.js";

export function createCommand(): Command {
  const cmd = new Command("create");
  cmd.description("Créer de nouveaux éléments dans le projet Rashwright UI");

  cmd
    .command("component <name>")
    .description("Générer un composant personnalisé propre au projet avec son Skill IA associé")
    .option("--category <cat>", "Catégorie du composant", "Custom")
    .option("--glass", "Inclure le support Liquid Glass", false)
    .option("--description <desc>", "Description fonctionnelle du composant")
    .option("--dry-run", "Simuler la création sans écrire les fichiers")
    .action(async (name: string, options: { category?: string; glass?: boolean; description?: string; dryRun?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(` — rs-ui create component "${name}"`));
      console.log();

      const config = readConfig(project.rashwrightConfigPath);
      const compFileRel = `${config.componentsPath}/${name}.tsx`;
      const compFileAbs = join(cwd, compFileRel);

      if (existsSync(compFileAbs)) {
        console.log(chalk.yellow(`  ⚠ Le composant "${name}" existe déjà à l'emplacement : ${compFileRel}`));
        process.exit(1);
      }

      const { componentFile, skillFile } = scaffoldProjectComponent(
        cwd,
        config.componentsPath,
        {
          name,
          category: options.category,
          supportsGlass: options.glass,
          description: options.description,
        },
        options.dryRun
      );

      if (!options.dryRun) {
        // Enregistrer dans le Lockfile
        recordLockedComponent(cwd, name, "1.0.0", [compFileRel], [], [], false);

        // Enregistrer sous projectComponents dans rashwright-ui.json
        const updatedConfig = { ...config };
        if (!updatedConfig.projectComponents) {
          updatedConfig.projectComponents = {};
        }
        updatedConfig.projectComponents[name] = {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          category: options.category || "Custom",
        };
        writeConfig(project.rashwrightConfigPath, updatedConfig);

        // Régénérer index.ts
        const allComps = [
          ...Object.keys(updatedConfig.components || {}),
          ...Object.keys(updatedConfig.projectComponents || {}),
        ];
        generateUiIndex(join(cwd, config.componentsPath), allComps, false);
      }

      console.log(chalk.green(`  ✔ Composant "${name}" généré avec succès !`));
      console.log(chalk.dim(`    • Composant TSX : ${componentFile}`));
      console.log(chalk.dim(`    • Skill IA      : ${skillFile}`));
      console.log(chalk.dim(`    • Enregistré    : rashwright-ui.json (projectComponents)`));
      console.log(chalk.dim(`    • Lockfile      : rashwright-ui.lock (SHA-256 scellé)`));
      console.log();
    });

  return cmd;
}
