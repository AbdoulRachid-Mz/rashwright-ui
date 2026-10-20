import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { confirm, checkbox, Separator } from "@inquirer/prompts";
import { join, dirname } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig, markComponentInstalled, isComponentInstalled, type RashwrightConfig } from "../core/config-manager.js";
import { detectPackageManager, installExpoPackages, installNpmPackages, type PackageManager } from "../core/package-manager.js";
import { resolveDependencies } from "../core/dependency-resolver.js";
import { copyComponentFiles } from "../core/file-manager.js";
import { loadRegistryIndex, getAllComponents, type RegistryEntry, type ResolvedComponent } from "../core/registry.js";
import { REGISTRY_ROOT, SOURCE_ROOT, TEMPLATES_ROOT, WIDGETS_ROOT } from "../core/paths.js";
import { generateUiIndex, updateTsconfig } from "../core/starter-generator.js";
import { resolveRegistry, ensureComponentDownloaded } from "../core/remote-registry.js";
import { computeLineDiff, formatDiffOutput } from "../core/diff.js";
import { copyComponentSkill, copyWidgetSkill } from "../core/skills-manager.js";
import { recordLockedComponent, recordLockedTemplate, recordLockedWidget } from "../core/lock-manager.js";
import { executeHook } from "../core/hooks-manager.js";
import { parseScopedComponentName, getScopedRegistries } from "../core/scoped-registry.js";
import { getTemplateDefinition, listTemplateIds, type TemplateDefinition } from "../core/templates-registry.js";
import { getWidgetDefinition, listWidgetIds, type WidgetDefinition } from "../core/widgets-registry.js";
import {
  detectMissingComponentRequirements,
  detectMissingTemplateRequirements,
  detectMissingWidgetRequirements,
  copyMissingInternalFiles,
} from "../core/component-detector.js";

export function addCommand(): Command {
  const cmd = new Command("add");
  cmd
    .description("Ajouter un ou plusieurs composants Rashwright UI au projet")
    .argument("[components...]", "Noms des composants à ajouter")
    .option("-t, --template <name>", "Ajouter un template autonome complet (ex: auth, dashboard, commerce...)")
    .option("-w, --widget <name>", "Ajouter un widget autonome modulaire (ex: metric, progress, quick-actions, finance, chart, activity-feed)")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("--diff", "Afficher les différences (diff) avant d'écraser un composant déjà existant")
    .option("--all", "Ajouter tous les composants disponibles")
    .option("--skills", "Installer automatiquement le skill IA associé au composant", true)
    .option("--no-skills", "Désactiver l'installation des skills IA")
    .option("--force", "Forcer la réinstallation (écraser les fichiers existants)")
    .option("--yes", "Répondre Oui à toutes les questions (mode non interactif)")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .option("--interactive", "Forcer le mode interactif même si des arguments sont passés", true)
    .option("--alias <prefix>", "Réécrire les alias d'import (ex: ~/ ou @app/)")
    .option("--no-interactive", "Désactiver le prompt interactif (mode CI/script)")
    .option("--non-interactive", "Alias de --no-interactive")
    .action(async (componentArgs: string[], options: {
      template?: string;
      widget?: string;
      registry?: string;
      fresh?: boolean;
      diff?: boolean;
      all?: boolean;
      skills?: boolean;
      force?: boolean;
      yes?: boolean;
      dryRun?: boolean;
      interactive?: boolean;
      nonInteractive?: boolean;
      alias?: string;
    }, cmd?: Command) => {
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

      // ── 2. Resolve component list & version tags (ex: button@0.3.0, @scope/button) ───
      const requestedVersions = new Map<string, string>();
      const scopedRegistries = getScopedRegistries(cwd);
      let componentNames: string[] = componentArgs.map((arg) => {
        const parsed = parseScopedComponentName(arg);
        if (parsed.version) {
          requestedVersions.set(parsed.name, parsed.version);
        }
        if (parsed.scope) {
          const regKey = parsed.scope.startsWith("@") ? parsed.scope.slice(1) : parsed.scope;
          const regEntry = scopedRegistries[regKey] || scopedRegistries[`@${regKey}`];
          if (regEntry) {
            console.log(chalk.dim(`  ℹ Composant scoped @${regKey} dirigé vers : ${regEntry.url}`));
          }
        }
        return parsed.name;
      });

      // ── 2a. Résolution de l'option --template ──────────────────────────
      const requestedTemplate = options.template || (cmd?.parent?.opts()?.template as string | undefined);
      let templateDef: TemplateDefinition | null = null;
      if (requestedTemplate) {
        templateDef = getTemplateDefinition(requestedTemplate, TEMPLATES_ROOT);
        if (!templateDef) {
          const avail = listTemplateIds(TEMPLATES_ROOT);
          console.log(chalk.red(`  ✖ Template "${requestedTemplate}" introuvable.`));
          console.log(chalk.dim(`    Templates disponibles : ${avail.join(", ")}`));
          process.exit(1);
        }
        console.log(chalk.bold.magenta(`  📦 Template sélectionné : ${templateDef.name} (${templateDef.id})`));
        console.log(chalk.dim(`     ${templateDef.description}`));
        // Fusionner les composants requis du template
        for (const req of templateDef.requiredComponents) {
          if (!componentNames.includes(req)) {
            componentNames.push(req);
          }
        }
      }

      // ── 2a-bis. Résolution de l'option --widget ou détection automatique ─────────
      let requestedWidget = options.widget || (cmd?.parent?.opts()?.widget as string | undefined);
      if (!requestedWidget && componentNames.length === 1 && !requestedTemplate) {
        const potentialWidget = getWidgetDefinition(componentNames[0], WIDGETS_ROOT);
        if (potentialWidget) {
          requestedWidget = potentialWidget.id;
          componentNames = [];
        }
      }

      let widgetDef: WidgetDefinition | null = null;
      if (requestedWidget) {
        widgetDef = getWidgetDefinition(requestedWidget, WIDGETS_ROOT);
        if (!widgetDef) {
          const avail = listWidgetIds(WIDGETS_ROOT);
          console.log(chalk.red(`  ✖ Widget "${requestedWidget}" introuvable.`));
          console.log(chalk.dim(`    Widgets disponibles : ${avail.join(", ")}`));
          process.exit(1);
        }
        console.log(chalk.bold.blue(`  🧩 Widget sélectionné : ${widgetDef.name} (${widgetDef.id})`));
        console.log(chalk.dim(`     ${widgetDef.description}`));
        // Fusionner les composants requis du widget
        for (const req of widgetDef.requiredComponents) {
          if (!componentNames.includes(req)) {
            componentNames.push(req);
          }
        }
      }

      const interactive = Boolean(options.interactive) && !options.yes && !options.dryRun && !options.nonInteractive && !requestedTemplate && !requestedWidget;

      if (options.all) {
        const index = loadRegistryIndex(resolved.registryRoot);
        componentNames = index?.components ?? [];
        console.log(chalk.dim(`  ${componentNames.length} composants disponibles (--all)`));
      }

      // ── 2b. Prompt interactif checkbox si 0 args + mode interactif ──────
      if (componentNames.length === 0 && !widgetDef && !templateDef) {
        if (!interactive) {
          console.log(chalk.red("  ✖ Aucun composant, widget ou template spécifié."));
          console.log(chalk.dim("    Usage: rs-ui add button card drawer"));
          console.log(chalk.dim("           rs-ui add -w metric"));
          console.log(chalk.dim("           rs-ui add -t dashboard"));
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

      // ── 3c. Détection exhaustive de toutes les dépendances via ComponentDetector (shadcn/ui model) ───
      const compNamesToInspect = newComponents.map((c) => c.name);
      const componentRequirements = templateDef
        ? detectMissingTemplateRequirements(templateDef.id, cwd, {
            registryRoot: resolved.registryRoot,
            sourceRoot: resolved.sourceRoot,
            templatesRoot: TEMPLATES_ROOT,
          })
        : detectMissingComponentRequirements(compNamesToInspect, cwd, {
            registryRoot: resolved.registryRoot,
            sourceRoot: resolved.sourceRoot,
          });

      const expoKeys = Object.keys(plan.allExpoDeps);
      const newExpoDeps = expoKeys.filter((d) => !(d in installedPkgs));
      for (const d of componentRequirements.missingExpoDeps) {
        if (!newExpoDeps.includes(d) && !(d in installedPkgs)) {
          newExpoDeps.push(d);
        }
      }

      for (const d of componentRequirements.missingNpmDeps) {
        if (!plan.allNpmDeps.includes(d) && !(d in installedPkgs)) {
          plan.allNpmDeps.push(d);
        }
      }

      if (newExpoDeps.length > 0) {
        console.log();
        console.log(chalk.dim("  Dépendances Expo (expo install):"));
        newExpoDeps.forEach((d) =>
          console.log(chalk.dim(`    + ${d}${plan.allExpoDeps[d] ? `@${plan.allExpoDeps[d]}` : ""}`))
        );
      }

      if (plan.allNpmDeps.length > 0) {
        console.log();
        console.log(chalk.dim("  Dépendances npm:"));
        plan.allNpmDeps.forEach((d) => console.log(chalk.dim(`    + ${d}`)));
      }

      if (componentRequirements.missingInternalFiles.length > 0) {
        console.log();
        console.log(chalk.dim("  Logiques fonctionnelles & utilitaires (shadcn/ui auto-import) :"));
        componentRequirements.missingInternalFiles.forEach((f) =>
          console.log(chalk.cyan(`    + ${f.destinationRelative}`))
        );
      }

      if (plan.requiresRebuild) {
        console.log();
        console.log(chalk.yellow("  ⚠  Certains composants nécessitent un development build."));
      }

      console.log();

      if (
        newComponents.length === 0 &&
        newExpoDeps.length === 0 &&
        plan.allNpmDeps.length === 0 &&
        componentRequirements.missingInternalFiles.length === 0
      ) {
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

      // ── 6b. Copie des logiques & fichiers internes requis (ex: hooks, lib/responsive, lib/upload)
      if (componentRequirements.missingInternalFiles.length > 0 && !options.dryRun) {
        const intSpinner = ora("Copie des utilitaires et logiques fonctionnelles requises...").start();
        copyMissingInternalFiles(componentRequirements, cwd, {
          sourceRoot: resolved.sourceRoot,
          dryRun: options.dryRun,
        });
        intSpinner.succeed(`Logiques internes installées (${componentRequirements.missingInternalFiles.length} fichier(s))`);
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
          {
            overwrite,
            dryRun: options.dryRun,
            importTransform: options.alias
              ? { toPrefix: options.alias }
              : (config.aliases ? { aliases: config.aliases } : undefined),
          },
        );

        const ok = results.every((r) => r.status !== "failed");
        if (ok) {
          if (options.skills !== false) {
            copyComponentSkill(comp.name, resolved.sourceRoot, cwd, options.dryRun);
          }
          // ── Lockfile : enregistrement SHA-256 de TOUS les fichiers copiés (requestedSet + transitifs)
          const targetVersion = requestedVersions.get(comp.name) || comp.entry.version || "1.0.0";
          const lockFiles = (comp.entry.files ?? []).map((f: string) => {
            const clean = f.replace(/^components\/ui\//, "");
            return `${config.componentsPath}/${clean}`;
          });
          recordLockedComponent(
            cwd,
            comp.name,
            targetVersion,
            lockFiles,
            comp.entry.dependencies ?? [],
            comp.entry.expoDependencies ?? [],
            options.dryRun,
          );
          // ── Objectif B.2 : SEULS les composants explicitement demandés sont "marqués installés" dans config.components
          if (requestedSet.has(comp.name)) {
            copySpinner.succeed(`${chalk.green("✔")} ${comp.name}@${targetVersion} ajouté`);
            updatedConfig = markComponentInstalled(updatedConfig, comp.name, targetVersion);
          } else {
            copySpinner.succeed(`${chalk.cyan("…")} ${comp.name}@${comp.entry.version} copié (core / dépendance transitive)`);
          }
        } else {
          copySpinner.fail(`Échec copie ${comp.name}`);
        }
      }

      // ── 7b. Copie des fichiers du template autonome si spécifié ─────────
      let templateTargetRel = "";
      if (templateDef) {
        const tplSpinner = ora(`Installation des fichiers du template ${templateDef.id}...`).start();
        const baseNorm = config.componentsPath.replace(/\\/g, "/");
        const templatesBaseRel = baseNorm.endsWith("/ui")
          ? baseNorm.slice(0, -3) + "/templates"
          : baseNorm + "/templates";
        templateTargetRel = `${templatesBaseRel}/${templateDef.id}`;
        const templateTargetDir = join(cwd, templateTargetRel);
        const templateSourceDir = join(TEMPLATES_ROOT, templateDef.id);

        const copiedTemplateFiles: string[] = [];

        for (const relFile of templateDef.files) {
          const srcFile = join(templateSourceDir, relFile);
          const dstFile = join(templateTargetDir, relFile);
          if (!options.dryRun && existsSync(srcFile)) {
            const parentDir = dirname(dstFile);
            if (!existsSync(parentDir)) {
              mkdirSync(parentDir, { recursive: true });
            }
            copyFileSync(srcFile, dstFile);
          }
          copiedTemplateFiles.push(`${templateTargetRel}/${relFile}`);
        }

        recordLockedTemplate(
          cwd,
          templateDef.id,
          templateDef.version,
          templateTargetRel,
          templateDef.requiredComponents,
          copiedTemplateFiles,
          templateDef.dependencies,
          templateDef.expoDependencies,
          options.dryRun,
        );

        tplSpinner.succeed(`Template ${templateDef.id} installé dans ${templateTargetRel}`);

        // Génération automatique des routes Expo Router si le dossier app existe
        if (templateDef.screens && templateDef.screens.length > 0) {
          const useSrc = config.componentsPath.startsWith("src/") || existsSync(join(cwd, "src"));
          const appDir = join(cwd, useSrc ? "src/app" : "app");
          if (existsSync(appDir)) {
            const importAlias = templateTargetRel.startsWith("src/")
              ? `@/${templateTargetRel.slice(4)}`
              : `@/${templateTargetRel}`;
            for (const s of templateDef.screens) {
              const cleanRoute = s.route.replace(/^\//, "").replace(/\.tsx$/, "");
              const screenFilePath = join(appDir, `${cleanRoute}.tsx`);
              if (!existsSync(screenFilePath) || options.force) {
                if (!existsSync(dirname(screenFilePath))) {
                  mkdirSync(dirname(screenFilePath), { recursive: true });
                }
                const routeContent = `import React from "react";
import { ${s.componentName} } from "${importAlias}";

export default function ${s.componentName}Route() {
  return <${s.componentName} />;
}
`;
                if (!options.dryRun) {
                  writeFileSync(screenFilePath, routeContent, "utf-8");
                }
                console.log(chalk.green(`    ✔ Route écran créée : ${useSrc ? "src/app" : "app"}/${cleanRoute}.tsx (${s.componentName})`));
              }
            }
          }
        }
      }

      // ── 7c. Copie des fichiers du widget modulaire si spécifié ─────────
      let widgetTargetRel = "";
      if (widgetDef) {
        const wgtSpinner = ora(`Installation des fichiers du widget ${widgetDef.id}...`).start();
        const baseNorm = config.componentsPath.replace(/\\/g, "/");
        const widgetsBaseRel = baseNorm.endsWith("/ui")
          ? baseNorm.slice(0, -3) + "/widgets"
          : baseNorm + "/widgets";
        widgetTargetRel = `${widgetsBaseRel}/${widgetDef.id}`;
        const widgetTargetDir = join(cwd, widgetTargetRel);
        const widgetSourceDir = join(WIDGETS_ROOT, widgetDef.id);

        const copiedWidgetFiles: string[] = [];

        for (const relFile of widgetDef.files) {
          const srcFile = join(widgetSourceDir, relFile);
          const dstFile = join(widgetTargetDir, relFile);
          if (!options.dryRun && existsSync(srcFile)) {
            const parentDir = dirname(dstFile);
            if (!existsSync(parentDir)) {
              mkdirSync(parentDir, { recursive: true });
            }
            copyFileSync(srcFile, dstFile);
          }
          copiedWidgetFiles.push(`${widgetTargetRel}/${relFile}`);
        }

        recordLockedWidget(
          cwd,
          widgetDef.id,
          widgetDef.version,
          widgetTargetRel,
          widgetDef.requiredComponents,
          copiedWidgetFiles,
          widgetDef.dependencies,
          widgetDef.expoDependencies,
          options.dryRun,
        );

        if (options.skills !== false) {
          copyWidgetSkill(widgetDef.id, resolved.sourceRoot, cwd, options.dryRun);
        }

        wgtSpinner.succeed(`Widget ${widgetDef.id} installé dans ${widgetTargetRel}`);
      }

      // ── 8. Régénérer index.ts du dossier UI & synchroniser la config ────
      if (!options.dryRun) {
        generateUiIndex(targetDir, Object.keys(updatedConfig.components), options.dryRun);
        updateTsconfig(cwd, options.dryRun);
        writeConfig(project.rashwrightConfigPath, updatedConfig);

        // ── Exécution du hook post-add si configuré
        executeHook("post-add", updatedConfig.hooks, cwd, { dryRun: options.dryRun });
      }

      // ── 9. Summary ─────────────────────────────────────────────────────
      console.log();
      console.log(chalk.bold.green("  ✔ Installation terminée"));
      console.log(chalk.dim(`    ✔ index.ts synchronisé avec ${Object.keys(updatedConfig.components).length} composants`));
      console.log();

      if (widgetDef) {
        console.log(chalk.bold.blue(`  🧩 Widget "${widgetDef.id}" prêt à l'emploi :`));
        console.log(chalk.dim(`     Emplacement : ${widgetTargetRel}`));
        const importAlias = widgetTargetRel.startsWith("src/")
          ? `@/${widgetTargetRel.slice(4)}`
          : `@/${widgetTargetRel}`;
        console.log(chalk.cyan(`     import { ${widgetDef.componentName} } from "${importAlias}";`));
        console.log(chalk.dim(`     Documentation & IA Skill : skills/rs-ui/widgets/${widgetDef.id}/SKILL.md`));
        console.log();
      }

      if (templateDef) {
        console.log(chalk.bold.magenta(`  📦 Template "${templateDef.id}" prêt à l'emploi :`));
        console.log(chalk.dim(`     Emplacement : ${templateTargetRel}`));
        const importAlias = templateTargetRel.startsWith("src/")
          ? `@/${templateTargetRel.slice(4)}`
          : `@/${templateTargetRel}`;
        console.log(chalk.cyan(`     import { ${templateDef.componentName} } from "${importAlias}";`));
        console.log();
      }

      if (plan.requiresRebuild) {
        console.log(chalk.yellow("  ⚠  Native rebuild requis:"));
        console.log(chalk.dim("     npx expo run:ios   ou   npx expo run:android"));
        console.log();
      }
    });

  return cmd;
}
