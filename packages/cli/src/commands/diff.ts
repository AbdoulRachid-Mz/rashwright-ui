import { Command } from "commander";
import chalk from "chalk";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { detectProject } from "../core/project-detector.js";
import { readConfig } from "../core/config-manager.js";
import { REGISTRY_ROOT, SOURCE_ROOT } from "../core/paths.js";
import { getComponent } from "../core/registry.js";
import { computeLineDiff, formatDiffOutput } from "../core/diff.js";

export function diffCommand(): Command {
  const cmd = new Command("diff");

  cmd
    .description("Comparer un ou plusieurs composants locaux avec leur version du registre")
    .argument("[component]", "Nom optionnel du composant à comparer (ex: 'button', 'card')")
    .option("--json", "Sortie JSON des différences")
    .action(async (componentName: string | undefined, options: { json?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.error(chalk.red("\n  ✖ Aucun projet Rashwright UI détecté (fichier rashwright-ui.json absent)."));
        console.error(chalk.dim("    Exécutez `rs-ui init` pour configurer le projet.\n"));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);
      const componentsToCompare: string[] = componentName
        ? [componentName.toLowerCase()]
        : Object.keys(config.components || {});

      if (componentsToCompare.length === 0) {
        console.log(chalk.yellow("\n  ⚠ Aucun composant installé à comparer."));
        console.log(chalk.dim("    Installez des composants avec `rs-ui add <composant>`.\n"));
        return;
      }

      const jsonResults: Array<{
        component: string;
        hasChanges: boolean;
        addedLines: number;
        removedLines: number;
        localFile: string;
      }> = [];

      let changesCount = 0;

      for (const comp of componentsToCompare) {
        const entry = getComponent(comp, REGISTRY_ROOT);
        if (!entry) {
          if (componentName) {
            console.error(chalk.red(`\n  ✖ Composant '${comp}' introuvable dans le registre.\n`));
            process.exit(1);
          }
          continue;
        }

        const primaryFile = entry.files?.[0] || `components/ui/${comp}.tsx`;
        const localPath = join(cwd, config.componentsPath || "components/ui", `${comp}.tsx`);
        const registryPath = join(SOURCE_ROOT, primaryFile);

        if (!existsSync(localPath)) {
          if (componentName) {
            console.error(chalk.red(`\n  ✖ Le fichier local pour '${comp}' n'existe pas : ${localPath}\n`));
            process.exit(1);
          }
          continue;
        }

        if (!existsSync(registryPath)) {
          continue;
        }

        const localContent = readFileSync(localPath, "utf-8");
        const registryContent = readFileSync(registryPath, "utf-8");

        const diffLines = computeLineDiff(registryContent, localContent);
        const added = diffLines.filter((l) => l.type === "added").length;
        const removed = diffLines.filter((l) => l.type === "removed").length;
        const hasChanges = added > 0 || removed > 0;

        if (hasChanges) changesCount++;

        if (options.json) {
          jsonResults.push({
            component: comp,
            hasChanges,
            addedLines: added,
            removedLines: removed,
            localFile: localPath,
          });
        } else {
          console.log();
          console.log(
            chalk.bold.cyan("  Différence pour ") +
              chalk.bold.white(comp) +
              chalk.dim(` (${localPath})`)
          );

          if (!hasChanges) {
            console.log(chalk.green("  ✔ Identique au registre officiel."));
          } else {
            console.log(
              chalk.dim("  Statistiques : ") +
                chalk.green(`+${added} ligne${added > 1 ? "s" : ""}`) +
                chalk.dim(" / ") +
                chalk.red(`-${removed} ligne${removed > 1 ? "s" : ""}`)
            );
            console.log();
            console.log(formatDiffOutput(diffLines, 3));
          }
        }
      }

      if (options.json) {
        console.log(JSON.stringify({ total: jsonResults.length, results: jsonResults }, null, 2));
      } else if (!componentName && changesCount === 0) {
        console.log();
        console.log(chalk.green("  ✔ Tous les composants locaux sont strictement identiques au registre officiel."));
        console.log();
      }
    });

  return cmd;
}
