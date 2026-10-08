import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { detectProject } from "../core/project-detector.js";
import { readConfig, isComponentInstalled, getInstalledVersion } from "../core/config-manager.js";
import { loadRegistryIndex, getAllComponents } from "../core/registry.js";
import type { ComponentRegistryEntry } from "../core/dependency-resolver.js";
import { REGISTRY_ROOT } from "../core/paths.js";
import { resolveRegistry } from "../core/remote-registry.js";

export function listCommand(): Command {
  const cmd = new Command("list");
  cmd
    .description("Afficher les composants Rashwright UI disponibles")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("-i, --interactive", "Mode interactif : parcourir et inspecter un composant")
    .option("--versions <component>", "Afficher les versions disponibles d'un composant")
    .option("--json", "Sortie JSON")
    .action(async (options: { registry?: string; fresh?: boolean; interactive?: boolean; versions?: string; json?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);
      const config = project.hasRashwrightConfig ? readConfig(project.rashwrightConfigPath) : { components: {}, componentsPath: "", version: 1, theme: "default" as const, glass: false, typescript: true, aliases: { components: "@/components", lib: "@/lib", theme: "@/theme" } };

      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });

      // ── Option --versions <component> ──────────────────────────────────
      if (options.versions) {
        const compName = options.versions;
        const all = getAllComponents(resolved.registryRoot);
        const entry = all.find((c) => c.name === compName);
        console.log();
        console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(` — Versions disponibles pour ${compName}`));
        console.log();
        if (!entry) {
          console.log(chalk.red(`  ✖ Composant "${compName}" introuvable dans le registre.`));
        } else {
          const installedVer = getInstalledVersion(config, compName);
          console.log(`  ${chalk.green("•")} v${entry.version} (latest / registre)${installedVer === entry.version ? chalk.green(" [installé]") : ""}`);
          if (installedVer && installedVer !== entry.version) {
            console.log(`  ${chalk.dim("•")} v${installedVer} [installé localement]`);
          }
        }
        console.log();
        return;
      }

      const index = loadRegistryIndex(resolved.registryRoot);
      const allEntries = getAllComponents(resolved.registryRoot);

      if (options.json) {
        const data = allEntries.map((e) => ({
          name: e.name,
          version: e.version,
          category: e.category,
          installed: isComponentInstalled(config, e.name),
          installedVersion: getInstalledVersion(config, e.name),
        }));
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Composants disponibles"));
      if (resolved.isRemote) {
        console.log(chalk.dim(`  ℹ Source registre : ${resolved.registryUrl}`));
      }
      console.log();

      if (!index) {
        console.log(chalk.red("  ✖ Registry non trouvé."));
        return;
      }

      const byCategory = index.categories;
      const entryMap = new Map(allEntries.map((e) => [e.name, e]));

      for (const [category, names] of Object.entries(byCategory)) {
        console.log(chalk.bold(`  ${category} (${names.length})`));
        for (const name of names) {
          const entry = entryMap.get(name);
          const installed = isComponentInstalled(config, name);
          const version = getInstalledVersion(config, name);
          const icon = installed ? chalk.green("✔") : chalk.dim("○");
          const nameStr = installed ? chalk.white(name.padEnd(22)) : chalk.dim(name.padEnd(22));
          const statusStr = installed
            ? chalk.green(`v${version || "1.0.0"}`.padEnd(8)) + chalk.dim("── installed")
            : chalk.dim("".padEnd(8) + "── not installed");
          const glassStr = entry?.supportsGlass ? chalk.cyan(" [🥽 glass]") : "";
          console.log(`    ${icon} ${nameStr} ${statusStr}${glassStr}`);
        }
        console.log();
      }

      const total = allEntries.length;
      const installedCount = allEntries.filter((e) => isComponentInstalled(config, e.name)).length;
      console.log(chalk.dim(`  ${installedCount}/${total} composants installés`));
      console.log();

      // ── U-2 : Mode interactif
      if (options.interactive) {
        const { select } = await import("@inquirer/prompts");
        try {
          const selectedComponent = await select({
            message: "Sélectionnez un composant pour voir ses détails :",
            choices: allEntries.map((e) => {
              const installed = isComponentInstalled(config, e.name);
              return {
                name: `${installed ? "✔ " : "○ "}${e.name} — ${e.description || e.category}`,
                value: e.name,
              };
            }),
          });
          const entry = entryMap.get(selectedComponent);
          if (entry) {
            console.log();
            console.log(chalk.bold.cyan(`  ${entry.name}`) + chalk.dim(` v${entry.version}`));
            console.log(chalk.dim(`  ${entry.description}`));
            console.log(chalk.dim(`  Catégorie : ${entry.category}`));
            console.log(chalk.dim(`  Fichiers  : ${entry.files.join(", ")}`));
            if (entry.expoDependencies?.length > 0) {
              console.log(chalk.dim(`  Expo deps : ${entry.expoDependencies.join(", ")}`));
            }
            console.log();
          }
        } catch {
          // Annulation silencieuse
        }
      }
    });

  return cmd;
}
