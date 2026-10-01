import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { confirm } from "@inquirer/prompts";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig, markComponentInstalled, isComponentInstalled } from "../core/config-manager.js";
import { detectPackageManager, installExpoPackages, installNpmPackages } from "../core/package-manager.js";
import { resolveDependencies } from "../core/dependency-resolver.js";
import { copyComponentFiles } from "../core/file-manager.js";
import { loadRegistryIndex, getAllComponents } from "../core/registry.js";

// Path to the rashwright-ui project root (where components live)
const REGISTRY_ROOT = join(import.meta.dirname, "..", "..", "registry");
const SOURCE_ROOT = join(import.meta.dirname, "..", "..");

export function addCommand(): Command {
  const cmd = new Command("add");
  cmd
    .description("Ajouter un ou plusieurs composants Rashwright UI au projet")
    .argument("[components...]", "Noms des composants à ajouter")
    .option("--all", "Ajouter tous les composants disponibles")
    .option("--yes", "Répondre Oui à toutes les questions")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .action(async (componentArgs: string[], options) => {
      const cwd = process.cwd();

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui add"));
      console.log();

      // ── 1. Check project ───────────────────────────────────────────────
      const project = detectProject(cwd);
      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé."));
        console.log(chalk.dim("    Exécutez d'abord: rs-ui init"));
        process.exit(1);
      }

      const expo = detectExpo(cwd);
      if (!expo.isSupported || expo.supportedVersion === null) {
        console.log(chalk.red(`  ✖ Expo SDK ${expo.sdkVersion} non supporté.`));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);

      // ── 2. Resolve component list ──────────────────────────────────────
      let componentNames: string[] = componentArgs;

      if (options.all) {
        const index = loadRegistryIndex(REGISTRY_ROOT);
        componentNames = index?.components ?? [];
        console.log(chalk.dim(`  ${componentNames.length} composants disponibles`));
      }

      if (componentNames.length === 0) {
        console.log(chalk.red("  ✖ Aucun composant spécifié."));
        console.log(chalk.dim("    Usage: rs-ui add button  |  rs-ui add --all"));
        process.exit(1);
      }

      // ── 3. Resolve dependencies ────────────────────────────────────────
      const spinner = ora("Résolution des dépendances...").start();

      const pkgJsonPath = join(cwd, "package.json");
      let installedPkgs: Record<string, string> = {};
      if (existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(require("fs").readFileSync(pkgJsonPath, "utf-8"));
          installedPkgs = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
        } catch {
          /* ignore */
        }
      }

      const plan = resolveDependencies(componentNames, expo.supportedVersion, REGISTRY_ROOT, installedPkgs);
      spinner.stop();

      // Filter already installed components from config
      const newComponents = plan.components.filter(
        (c) => !isComponentInstalled(config, c.name)
      );

      // ── 4. Show plan ───────────────────────────────────────────────────
      console.log(chalk.bold("  Plan d'installation:"));
      console.log();

      if (newComponents.length > 0) {
        console.log(chalk.dim("  Composants:"));
        newComponents.forEach((c) =>
          console.log(chalk.dim(`    + ${c.name}@${c.entry.version}`))
        );
      }

      const expoKeys = Object.keys(plan.allExpoDeps);
      const newExpoDeps = expoKeys.filter((d) => !(d in installedPkgs));

      if (newExpoDeps.length > 0) {
        console.log();
        console.log(chalk.dim("  Dépendances Expo (expo install):"));
        newExpoDeps.forEach((d) =>
          console.log(chalk.dim(`    + ${d}@${plan.allExpoDeps[d]}`))
        );
      }

      if (plan.allNpmDeps.length > 0) {
        console.log();
        console.log(chalk.dim("  Dépendances npm:"));
        plan.allNpmDeps.forEach((d) => console.log(chalk.dim(`    + ${d}`)));
      }

      if (plan.requiresRebuild) {
        console.log();
        console.log(chalk.yellow("  ⚠  Certains composants nécessitent un development build."));
      }

      console.log();

      if (newComponents.length === 0 && newExpoDeps.length === 0) {
        console.log(chalk.green("  ✔ Tous les composants sont déjà installés."));
        return;
      }

      if (!options.yes && !options.dryRun) {
        const ok = await confirm({ message: "Continuer?", default: true });
        if (!ok) {
          console.log(chalk.dim("  Annulé."));
          return;
        }
      }

      // ── 5. Install Expo deps ───────────────────────────────────────────
      if (newExpoDeps.length > 0) {
        const depSpinner = ora("Installation des dépendances Expo...").start();
        try {
          installExpoPackages(newExpoDeps, project.packageManager, cwd, options.dryRun);
          depSpinner.succeed("Dépendances Expo installées");
        } catch (err) {
          depSpinner.fail("Échec de l'installation des dépendances");
          console.error(err);
          process.exit(1);
        }
      }

      // ── 6. Install npm deps ────────────────────────────────────────────
      if (plan.allNpmDeps.length > 0) {
        const npmSpinner = ora("Installation des dépendances npm...").start();
        try {
          installNpmPackages(plan.allNpmDeps, project.packageManager, cwd, options.dryRun);
          npmSpinner.succeed("Dépendances npm installées");
        } catch (err) {
          npmSpinner.fail("Échec de l'installation npm");
          console.error(err);
        }
      }

      // ── 7. Copy component files ────────────────────────────────────────
      const targetDir = join(cwd, config.componentsPath);
      let updatedConfig = config;

      for (const comp of newComponents) {
        const copySpinner = ora(`Copie de ${comp.name}...`).start();
        const results = copyComponentFiles(
          comp.entry.files,
          SOURCE_ROOT,
          targetDir,
          { overwrite: false, dryRun: options.dryRun }
        );

        const ok = results.every((r) => r.status !== "failed");
        if (ok) {
          copySpinner.succeed(`${comp.name} ajouté`);
          updatedConfig = markComponentInstalled(updatedConfig, comp.name, comp.entry.version);
        } else {
          copySpinner.fail(`Échec copie ${comp.name}`);
        }
      }

      // ── 8. Update config ───────────────────────────────────────────────
      if (!options.dryRun) {
        writeConfig(project.rashwrightConfigPath, updatedConfig);
      }

      // ── 9. Summary ─────────────────────────────────────────────────────
      console.log();
      console.log(chalk.bold.green("  ✔ Installation terminée"));
      console.log();

      if (plan.requiresRebuild) {
        console.log(chalk.yellow("  ⚠  Native rebuild requis:"));
        console.log(chalk.dim("     npx expo run:ios   ou   npx expo run:android"));
        console.log();
      }
    });

  return cmd;
}
