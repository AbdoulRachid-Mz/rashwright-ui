import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { confirm, checkbox, Separator } from "@inquirer/prompts";
import { join } from "node:path";
import { existsSync, readFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig, markComponentInstalled, isComponentInstalled, type RashwrightConfig } from "../core/config-manager.js";
import { detectPackageManager, installExpoPackages, installNpmPackages, type PackageManager } from "../core/package-manager.js";
import { resolveDependencies } from "../core/dependency-resolver.js";
import { copyComponentFiles } from "../core/file-manager.js";
import { loadRegistryIndex, getAllComponents, type RegistryEntry, type ResolvedComponent } from "../core/registry.js";
import { REGISTRY_ROOT, SOURCE_ROOT } from "../core/paths.js";
import { generateUiIndex, updateTsconfig } from "../core/starter-generator.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";
import { computeLineDiff, formatDiffOutput } from "../core/diff.js";

export function addCommand(): Command {
  const cmd = new Command("add");
  cmd
    .description("Ajouter un ou plusieurs composants Rashwright UI au projet")
    .argument("[components...]", "Noms des composants à ajouter")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--diff", "Afficher les différences (diff) avant d'écraser un composant déjà existant")
    .option("--all", "Ajouter tous les composants disponibles")
    .option("--force", "Forcer la réinstallation (écraser les fichiers existants)")
    .option("--yes", "Répondre Oui à toutes les questions (mode non interactif)")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .option("--interactive", "Forcer le mode interactif même si des arguments sont passés", true)
    .option("--no-interactive", "Désactiver le prompt interactif (mode CI/script)")
    .option("--non-interactive", "Alias de --no-interactive")
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

      // ── 1b. Résolution du registre (local ou distant) ───────────────────
      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });
      if (resolved.isRemote) {
        console.log(chalk.dim(`  ℹ Source registre : ${resolved.registryUrl}`));
      }

      // ── 2. Resolve component list ──────────────────────────────────────
      let componentNames: string[] = componentArgs;

      const interactive = Boolean(options.interactive) && !options.yes && !options.dryRun && !options.nonInteractive;

      if (options.all) {
        const index = loadRegistryIndex(resolved.registryRoot);
        componentNames = index?.components ?? [];
        console.log(chalk.dim(`  ${componentNames.length} composants disponibles (--all)`));
      }

      // ── 2b. Prompt interactif checkbox si 0 args + mode interactif ──────
      if (componentNames.length === 0) {
        if (!interactive) {
          console.log(chalk.red("  ✖ Aucun composant spécifié."));
          console.log(chalk.dim("    Usage: rs-ui add button card drawer"));
          console.log(chalk.dim("           rs-ui add  (sans argument, mode interactif)"));
          console.log(chalk.dim("           rs-ui add --all"));
          process.exit(1);
        }

        const allComp = getAllComponents(resolved.registryRoot);
        if (allComp.length === 0) {
          console.log(chalk.red("  ✖ Registry vide."));
          process.exit(1);
        }

        // Grouper par catégorie pour un affichage lisible dans la checkbox
        type Choice = {
          name: string;
          value: string;
          checked?: boolean;
          disabled?: string | boolean;
          description?: string;
        };
        const choices: Choice[] = [];
        const categoriesMap = new Map<string, RegistryEntry[]>();
        for (const entry of allComp) {
          const key = entry.category || "Autres";
          if (!categoriesMap.has(key)) categoriesMap.set(key, []);
          categoriesMap.get(key)!.push(entry);
        }
        for (const [cat, entries] of [...categoriesMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
          choices.push({ name: chalk.bold(`── ${cat} ──`), value: `__SEP_${cat}`, disabled: true } as unknown as Choice);
          for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
            const alreadyInstalled = isComponentInstalled(config, e.name);
            const glass = e.supportsGlass ? " [🥽 glass]" : "";
            choices.push({
              name: `${e.name}${" ".repeat(Math.max(1, 26 - e.name.length))}${chalk.dim(e.description || "")}${chalk.cyan(glass)}`,
              value: e.name,
              checked: false,
              disabled: alreadyInstalled ? "déjà installé (utilisez --force pour réinstaller)" : false,
              description: alreadyInstalled ? chalk.gray(`✔ ${e.name}@${e.version} — déjà installé`) : chalk.cyan(`${e.name}@${e.version} · ${e.platforms.join(",")}`),
            });
          }
        }

        try {
          const selected = await checkbox({
            message: "Sélectionnez les composants à installer (↑/↓ naviguer, Espace = cocher, a = tout, Entrée = valider, taper = filtrer)",
            choices,
          });
          componentNames = selected.filter((s): s is string => typeof s === "string" && !s.startsWith("__SEP_"));
        } catch (err) {
          if ((err as { name?: string })?.name === "ExitPromptError") {
            console.log(chalk.dim("  Annulé."));
            return;
          }
          throw err;
        }

        if (componentNames.length === 0) {
          console.log(chalk.dim("  Aucun composant sélectionné."));
          return;
        }
        console.log(chalk.dim(`  → ${componentNames.length} composant(s) sélectionné(s)`));
      }

      // ── 3. Resolve dependencies ────────────────────────────────────────
      const spinner = ora("Résolution des dépendances...").start();

      const pkgJsonPath = join(cwd, "package.json");
      let installedPkgs: Record<string, string> = {};
      if (existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
          installedPkgs = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
        } catch {
          /* ignore */
        }
      }

      const plan = resolveDependencies(componentNames, expo.supportedVersion, resolved.registryRoot, installedPkgs);
      spinner.stop();

      // ── C-2 : Avertissement conflits de versions Expo
      if (plan.versionConflicts.length > 0) {
        console.log(chalk.yellow("  ⚠  Conflits de versions Expo détectés :"));
        for (const c of plan.versionConflicts) {
          console.log(chalk.yellow(`    • ${c.pkg}`) + chalk.dim(` installé: ${c.installed}`) + chalk.red(` ≠ `) + chalk.cyan(`requis: ${c.required}`));
        }
        console.log(chalk.dim("    → Mettez à jour ces packages : npx expo install " + plan.versionConflicts.map((c) => c.pkg).join(" ")));
        console.log();
      }

      // ── 3b. Objectif B : Séparer composants EXPLICITEMENT demandés vs DEPENDANCES TRANSITIVES
      //       (ex: liquid-pressable / text / view ne sont PAS des composants installables
      //        via isComponentInstalled → ce sont des "core files" qui doivent être copiés
      //        si fichier absent, ou systématiquement si --force)

      const requestedSet = new Set(componentNames);

      const requestedComponents: ResolvedComponent[] = plan.components.filter((c) =>
        requestedSet.has(c.name),
      );
      const transitiveDeps: ResolvedComponent[] = plan.components.filter(
        (c) =>
          !requestedSet.has(c.name) &&
          c.entry.files &&
          Array.isArray(c.entry.files) &&
          c.entry.files.length > 0,
      );

      const force = Boolean(options.force);

      // Pour les composants explicitement demandés : respecter isComponentInstalled (sauf --force)
      const newRequestedComponents = requestedComponents.filter(
        (c) => force || !isComponentInstalled(config, c.name),
      );

      // Pour les dépendances transitives (core files / liquid / text / view) :
      // copier si le FICHIER N'EXISTE PAS sur le FS, OU --force.
      const targetDir = join(cwd, config.componentsPath);
      const missingTransitive: ResolvedComponent[] = [];
      for (const t of transitiveDeps) {
        const needIt = force || (t.entry.files || []).some((rel: string) => !existsSync(join(targetDir, rel.replace(/^components\/ui\//, ""))));
        if (needIt) missingTransitive.push(t);
      }

      const newComponents: ResolvedComponent[] = [...newRequestedComponents, ...missingTransitive];

      // ── 4. Show plan ───────────────────────────────────────────────────
      console.log(chalk.bold("  Plan d'installation:"));
      console.log();

      if (newRequestedComponents.length > 0) {
        console.log(chalk.dim("  Composants demandés:"));
        newRequestedComponents.forEach((c) =>
          console.log(chalk.green(`    + ${c.name}@${c.entry.version}`))
        );
      } else if (requestedComponents.length > 0 && !force) {
        requestedComponents.forEach((c) =>
          console.log(chalk.gray(`    ~ ${c.name}@${c.entry.version}  (déjà installé; utiliser --force pour réinstaller)`))
        );
      }

      if (missingTransitive.length > 0) {
        console.log(chalk.dim("  Dépendances transitives / fichiers core manquants:"));
        missingTransitive.forEach((c) =>
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

      if (newComponents.length === 0 && newExpoDeps.length === 0 && plan.allNpmDeps.length === 0) {
        console.log(chalk.green("  ✔ Tous les composants sélectionnés sont déjà installés."));
        console.log(chalk.dim("     → Utilisez `rs-ui add --force <noms>` pour les réinstaller/écraser."));
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
      const pm: PackageManager = config.packageManager || project.packageManager || "npm";

      if (newExpoDeps.length > 0) {
        const depSpinner = ora(`Installation des dépendances Expo via ${pm}...`).start();
        try {
          installExpoPackages(newExpoDeps, pm, cwd, options.dryRun);
          depSpinner.succeed("Dépendances Expo installées");
        } catch (err) {
          depSpinner.fail("Échec de l'installation des dépendances");
          console.error(err);
          process.exit(1);
        }
      }

      // ── 6. Install npm deps ────────────────────────────────────────────
      if (plan.allNpmDeps.length > 0) {
        const npmSpinner = ora(`Installation des dépendances npm via ${pm}...`).start();
        try {
          installNpmPackages(plan.allNpmDeps, pm, cwd, options.dryRun);
          npmSpinner.succeed("Dépendances npm installées");
        } catch (err) {
          npmSpinner.fail("Échec de l'installation npm");
          console.error(err);
        }
      }

      // ── 6b. Point 5 : Assurer les fichiers de logique et utilitaires requis (ex: lib/upload)
      const needsUploadLib = newComponents.some((c) =>
        c.name === "upload-image" || c.name === "upload-video" || (c.entry.files || []).some((f) => f.includes("upload"))
      );
      if (needsUploadLib && !options.dryRun) {
        const useSrc = config.componentsPath.startsWith("src/") || existsSync(join(cwd, "src"));
        const uploadTargetDir = join(cwd, useSrc ? "src/lib/upload" : "lib/upload");
        if (!existsSync(uploadTargetDir)) {
          const uploadSpinner = ora("Copie des utilitaires d'upload (lib/upload)...").start();
          const uploadSourceDir = join(resolved.sourceRoot, "lib", "upload");
          if (existsSync(uploadSourceDir)) {
            const copyDirRecursive = (src: string, dest: string) => {
              if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
              const entries = readdirSync(src, { withFileTypes: true });
              for (const entry of entries) {
                const s = join(src, entry.name);
                const d = join(dest, entry.name);
                if (entry.isDirectory()) {
                  copyDirRecursive(s, d);
                } else if (entry.isFile()) {
                  copyFileSync(s, d);
                }
              }
            };
            copyDirRecursive(uploadSourceDir, uploadTargetDir);
            uploadSpinner.succeed("Utilitaires lib/upload installés");
          }
        }
      }

      // ── 7. Copy component files ────────────────────────────────────────
      let updatedConfig: RashwrightConfig = config;
      const overwrite = Boolean(options.force);

      for (const comp of newComponents) {
        const copySpinner = ora(`Copie de ${comp.name}...`).start();

        if (resolved.isRemote) {
          await ensureComponentDownloaded(comp.name, {
            registryUrl: resolved.registryUrl,
            registryRoot: resolved.registryRoot,
            sourceRoot: resolved.sourceRoot,
          });
        }

        // ── F-3 : Mode --diff (aperçu des différences avant écrasement)
        if (options.diff && Array.isArray(comp.entry.files)) {
          for (const relFile of comp.entry.files) {
            const cleanRel = relFile.replace(/^components\/ui\//, "");
            const localDest = join(targetDir, cleanRel);
            const sourcePath = join(resolved.sourceRoot, relFile);
            if (existsSync(localDest) && existsSync(sourcePath)) {
              const oldCode = readFileSync(localDest, "utf-8");
              const newCode = readFileSync(sourcePath, "utf-8");
              if (oldCode !== newCode) {
                copySpinner.stop();
                console.log(chalk.bold.yellow(`\n  [diff] ${cleanRel} (local vs registre) :`));
                console.log(formatDiffOutput(computeLineDiff(oldCode, newCode)));
                console.log();
                copySpinner.start();
              }
            }
          }
        }

        const results = copyComponentFiles(
          comp.entry.files,
          resolved.sourceRoot,
          targetDir,
          { overwrite, dryRun: options.dryRun },
        );

        const ok = results.every((r) => r.status !== "failed");
        if (ok) {
          // ── Objectif B.2 : SEULS les composants explicitement demandés sont "marqués installés" dans config.components
          if (requestedSet.has(comp.name)) {
            copySpinner.succeed(`${chalk.green("✔")} ${comp.name}@${comp.entry.version} ajouté`);
            updatedConfig = markComponentInstalled(updatedConfig, comp.name, comp.entry.version);
          } else {
            copySpinner.succeed(`${chalk.cyan("…")} ${comp.name}@${comp.entry.version} copié (core / dépendance transitive)`);
          }
        } else {
          copySpinner.fail(`Échec copie ${comp.name}`);
        }
      }

      // ── 8. Régénérer index.ts du dossier UI & synchroniser la config ────
      if (!options.dryRun) {
        generateUiIndex(targetDir, Object.keys(updatedConfig.components), options.dryRun);
        updateTsconfig(cwd, options.dryRun);
        writeConfig(project.rashwrightConfigPath, updatedConfig);
      }

      // ── 9. Summary ─────────────────────────────────────────────────────
      console.log();
      console.log(chalk.bold.green("  ✔ Installation terminée"));
      console.log(chalk.dim(`    ✔ index.ts synchronisé avec ${Object.keys(updatedConfig.components).length} composants`));
      console.log();

      if (plan.requiresRebuild) {
        console.log(chalk.yellow("  ⚠  Native rebuild requis:"));
        console.log(chalk.dim("     npx expo run:ios   ou   npx expo run:android"));
        console.log();
      }
    });

  return cmd;
}
