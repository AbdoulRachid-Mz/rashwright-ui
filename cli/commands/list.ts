import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { detectProject } from "../core/project-detector.js";
import { readConfig, isComponentInstalled } from "../core/config-manager.js";
import { loadRegistryIndex, getAllComponents } from "../core/registry.js";
import type { ComponentRegistryEntry } from "../core/dependency-resolver.js";

const REGISTRY_ROOT = join(import.meta.dirname, "..", "..", "registry");

export function listCommand(): Command {
  const cmd = new Command("list");
  cmd
    .description("Afficher les composants Rashwright UI disponibles")
    .option("--json", "Sortie JSON")
    .action((options) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);
      const config = project.hasRashwrightConfig ? readConfig(project.rashwrightConfigPath) : { components: {} as Record<string, string>, componentsPath: "", version: 1, theme: "default" as const, glass: false, typescript: true, aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" } };
      const index = loadRegistryIndex(REGISTRY_ROOT);
      const allEntries = getAllComponents(REGISTRY_ROOT);

      if (options.json) {
        const data = allEntries.map((e) => ({
          name: e.name,
          version: e.version,
          category: e.category,
          installed: isComponentInstalled(config, e.name),
          installedVersion: config.components[e.name] ?? null,
        }));
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Composants disponibles"));
      console.log();

      if (!index) {
        console.log(chalk.red("  ✖ Registry non trouvé."));
        return;
      }

      const byCategory = index.categories;
      const entryMap = new Map(allEntries.map((e) => [e.name, e]));

      for (const [category, names] of Object.entries(byCategory)) {
        console.log(chalk.bold(`  ${category}`));
        for (const name of names) {
          const entry = entryMap.get(name);
          const installed = isComponentInstalled(config, name);
          const version = config.components[name];
          const icon = installed ? chalk.green("✔") : chalk.dim("○");
          const nameStr = installed ? chalk.white(name) : chalk.dim(name);
          const versionStr = installed ? chalk.dim(` v${version}`) : "";
          const glassStr = entry?.supportsGlass ? chalk.blue(" [glass]") : "";
          console.log(`    ${icon} ${nameStr}${versionStr}${glassStr}`);
        }
        console.log();
      }

      const total = allEntries.length;
      const installed = allEntries.filter((e) => isComponentInstalled(config, e.name)).length;
      console.log(chalk.dim(`  ${installed}/${total} composants installés`));
      console.log();
    });

  return cmd;
}
