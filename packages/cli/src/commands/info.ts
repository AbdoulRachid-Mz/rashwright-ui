import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { REGISTRY_ROOT } from "../core/paths.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";

export function infoCommand(): Command {
  const cmd = new Command("info");
  cmd
    .description("Afficher les détails d'un composant")
    .argument("<component>", "Nom du composant")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--json", "Sortie JSON")
    .action(async (name: string, options) => {
      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });

      let entry = loadComponentEntry(name, resolved.registryRoot);
      if (!entry && resolved.isRemote) {
        entry = await ensureComponentDownloaded(name, {
          registryUrl: resolved.registryUrl,
          registryRoot: resolved.registryRoot,
          sourceRoot: resolved.sourceRoot,
        });
      }

      if (!entry) {
        console.log(chalk.red(`  ✖ Composant "${name}" introuvable dans le registry.`));
        console.log(chalk.dim("    rs-ui list"));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(entry, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold.cyan(`  ${entry.name}`) + chalk.dim(` v${entry.version}`));
      console.log(chalk.dim(`  ${entry.description}`));
      console.log();
      console.log(chalk.dim(`  Catégorie: ${entry.category}`));
      console.log();

      if (entry.expoDependencies.length > 0) {
        console.log(chalk.bold("  Dépendances Expo (expo install):"));
        entry.expoDependencies.forEach((d) => console.log(chalk.dim(`    • ${d}`)));
        console.log();
      }

      if (entry.optionalExpoDependencies.length > 0) {
        console.log(chalk.bold("  Dépendances optionnelles:"));
        entry.optionalExpoDependencies.forEach((d) =>
          console.log(chalk.dim(`    • ${d} (optionnel)`))
        );
        console.log();
      }

      if (entry.requiresComponents.length > 0) {
        console.log(chalk.bold("  Composants requis:"));
        entry.requiresComponents.forEach((c) => console.log(chalk.dim(`    • ${c}`)));
        console.log();
      }

      if (entry.providers.length > 0) {
        console.log(chalk.bold("  Providers nécessaires:"));
        entry.providers.forEach((p) => console.log(chalk.dim(`    • ${p}`)));
        console.log();
      }

      console.log(chalk.bold("  Support:"));
      console.log(
        chalk.dim(`    Glass: ${entry.supportsGlass ? chalk.green("✔ supporté") : chalk.dim("non")}`)
      );
      console.log(chalk.dim(`    Plateformes: ${entry.platforms.join(", ")}`));
      console.log();

      if (entry.nativeRebuildRequired) {
        console.log(chalk.yellow("  ⚠  Un development build peut être requis après installation."));
        console.log();
      }

      if (entry.notes) {
        console.log(chalk.dim(`  Note: ${entry.notes}`));
        console.log();
      }
    });

  return cmd;
}
