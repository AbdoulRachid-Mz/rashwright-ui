import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";
import { detectProject } from "../core/project-detector.js";
import { readConfig, getInstalledVersion } from "../core/config-manager.js";
import { checkComponentIntegrity } from "../core/lock-manager.js";
import { SKILL_FILENAME } from "../core/skills-manager.js";

export function infoCommand(): Command {
  const cmd = new Command("info");
  cmd
    .description("Afficher les détails et l'état 360° d'un composant (local + registre)")
    .argument("<component>", "Nom du composant")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--json", "Sortie JSON")
    .action(async (name: string, options) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

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
        console.log(chalk.red(`  ✖ Composant "${name}" introuvable dans le registre.`));
        console.log(chalk.dim("    Exécutez 'rs-ui list' pour voir tous les composants disponibles."));
        process.exit(1);
      }

      // Informations locales si le projet est initialisé
      let localInfo: {
        isInstalled: boolean;
        installedVersion?: string;
        integrityStatus?: "clean" | "modified" | "missing" | "untracked";
        hasSkill: boolean;
        localFilePath?: string;
      } | null = null;

      if (project.hasRashwrightConfig) {
        const config = readConfig(project.rashwrightConfigPath);
        const installedVersion = getInstalledVersion(config, name);
        const compRelFile = join(config.componentsPath, `${name}.tsx`);
        const compAbsFile = join(cwd, compRelFile);
        const fileExists = existsSync(compAbsFile);
        const skillPath = join(cwd, "skills", "rs-ui", name, SKILL_FILENAME);
        const hasSkill = existsSync(skillPath);

        const integrity = checkComponentIntegrity(cwd, name);

        localInfo = {
          isInstalled: Boolean(installedVersion || fileExists),
          installedVersion: installedVersion ?? undefined,
          integrityStatus: integrity.status,
          hasSkill,
          localFilePath: fileExists ? compRelFile : undefined,
        };
      }

      if (options.json) {
        console.log(JSON.stringify({ ...entry, local: localInfo }, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold.cyan(`  ${entry.name}`) + chalk.dim(` — Inspecteur 360°`));
      console.log(chalk.dim(`  ${entry.description}`));
      console.log();

      // Section Versions & Registre
      console.log(chalk.bold("  Versions :"));
      console.log(chalk.dim(`    • Registre    : v${entry.version}`));
      if (localInfo) {
        if (localInfo.isInstalled) {
          const verStr = localInfo.installedVersion ? `v${localInfo.installedVersion}` : "inconnue";
          const upToDate = localInfo.installedVersion === entry.version;
          const statusTag = upToDate ? chalk.green(" (à jour)") : chalk.yellow(` (mise à jour dispo: v${entry.version})`);
          console.log(chalk.dim(`    • Locale      : ${verStr}${statusTag}`));
        } else {
          console.log(chalk.dim(`    • Locale      : Non installé`));
        }
      }
      console.log();

      // Section Intégrité locale
      if (localInfo && localInfo.isInstalled) {
        console.log(chalk.bold("  État local :"));
        if (localInfo.localFilePath) {
          console.log(chalk.dim(`    • Fichier     : ${localInfo.localFilePath}`));
        }
        let intMsg = chalk.dim("Non suivi par le lockfile");
        if (localInfo.integrityStatus === "clean") intMsg = chalk.green("✔ Intact (identique à la source)");
        else if (localInfo.integrityStatus === "modified") intMsg = chalk.yellow("⚠ Modifié localement (personnalisé)");
        else if (localInfo.integrityStatus === "missing") intMsg = chalk.red("✖ Fichier manquant");
        console.log(chalk.dim(`    • Intégrité   : `) + intMsg);
        console.log(
          chalk.dim(`    • Skill IA    : `) + (localInfo.hasSkill ? chalk.green("✔ Installé") : chalk.dim("Non installé"))
        );
        console.log();
      }

      console.log(chalk.dim(`  Catégorie: ${entry.category}`));
      console.log();

      if (entry.expoDependencies.length > 0) {
        console.log(chalk.bold("  Dépendances Expo :"));
        entry.expoDependencies.forEach((d) => console.log(chalk.dim(`    • ${d}`)));
        console.log();
      }

      if (entry.optionalExpoDependencies.length > 0) {
        console.log(chalk.bold("  Dépendances optionnelles :"));
        entry.optionalExpoDependencies.forEach((d) => console.log(chalk.dim(`    • ${d} (optionnel)`)));
        console.log();
      }

      if (entry.requiresComponents.length > 0) {
        console.log(chalk.bold("  Composants requis :"));
        entry.requiresComponents.forEach((c) => console.log(chalk.dim(`    • ${c}`)));
        console.log();
      }

      if (entry.providers.length > 0) {
        console.log(chalk.bold("  Providers nécessaires :"));
        entry.providers.forEach((p) => console.log(chalk.dim(`    • ${p}`)));
        console.log();
      }

      console.log(chalk.bold("  Support :"));
      console.log(chalk.dim(`    • Glassmorphism : ${entry.supportsGlass ? chalk.green("✔ supporté") : chalk.dim("non")}`));
      console.log(chalk.dim(`    • Plateformes   : ${entry.platforms.join(", ")}`));
      console.log();

      if (entry.nativeRebuildRequired) {
        console.log(chalk.yellow("  ⚠ Un development build peut être requis après installation."));
        console.log();
      }

      if (entry.notes) {
        console.log(chalk.dim(`  Note : ${entry.notes}`));
        console.log();
      }
    });

  return cmd;
}
