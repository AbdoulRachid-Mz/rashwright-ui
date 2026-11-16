import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { confirm, checkbox } from "@inquirer/prompts";
import { join, dirname, relative } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig, markComponentInstalled, isComponentInstalled, type RashwrightConfig } from "../core/config-manager.js";
import { detectPackageManager, installExpoPackages, installNpmPackages, type PackageManager } from "../core/package-manager.js";
import { resolveDependencies, validatePlanSources, type DependencyPlan } from "../core/dependency-resolver.js";
import {
  copyAssetFiles,
  copyArtefactFiles,
  copyComponentFiles,
  resolveComponentDestination,
  type FileCopyResult,
} from "../core/file-manager.js";
import {
  applyFoundationPlans,
  planFoundations,
  type FoundationPlan,
} from "../core/foundations-manager.js";
import { loadRegistryIndex, getAllComponents, type RegistryEntry, type ResolvedComponent } from "../core/registry.js";
import { TEMPLATES_ROOT, WIDGETS_ROOT } from "../core/paths.js";
import { generateUiIndex, updateTsconfig } from "../core/starter-generator.js";
import {
  resolveRegistry,
  ensureComponentDownloaded,
  ensureFoundationDownloaded,
  ensureCompatibilityMatrixDownloaded,
} from "../core/remote-registry.js";
import { computeLineDiff, formatDiffOutput } from "../core/diff.js";
import { copyComponentSkill, copyWidgetSkill } from "../core/skills-manager.js";
import {
  recordLockedComponent,
  recordLockedFoundation,
  recordLockedTemplate,
  recordLockedWidget,
  getLockfilePath,
} from "../core/lock-manager.js";
import { executeHook } from "../core/hooks-manager.js";
import { parseScopedComponentName, getScopedRegistries } from "../core/scoped-registry.js";
import { getTemplateDefinition, listTemplateIds, type TemplateDefinition } from "../core/templates-registry.js";
import { getWidgetDefinition, listWidgetIds, type WidgetDefinition } from "../core/widgets-registry.js";
import {
  InstallationTransaction,
  type RollbackReport,
} from "../core/installation-transaction.js";
import {
  deriveAliasPrefixes,
  verifyInstallation,
  type VerificationReport,
  type VerificationTarget,
} from "../core/post-install-verifier.js";
import type { TransformImportOptions } from "../core/transformers/import-transformer.js";

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function relativeToProject(projectRoot: string, absolute: string): string {
  return toPosix(relative(projectRoot, absolute));
}

function artefactBaseRel(componentsPath: string, folder: "templates" | "widgets"): string {
  const baseNorm = toPosix(componentsPath);
  const componentsBase = baseNorm.endsWith("/ui") ? baseNorm.slice(0, -3) : baseNorm;
  return `${componentsBase}/${folder}`;
}

/**
 * Affiche le résultat de la vérification indépendante. Un rapport vide reste
 * visible : le CLI ne doit jamais laisser croire que rien n'a été vérifié.
 */
function printVerificationReport(report: VerificationReport): void {
  const errors = report.issues.filter((issue) => issue.severity === "error");
  const warnings = report.issues.filter((issue) => issue.severity === "warning");

  console.log();
  console.log(chalk.bold("  Vérification post-installation (indépendante du lockfile) :"));
  console.log(
    chalk.dim(
      `    ${report.checkedFiles} fichier(s) et ${report.checkedImports} import(s) analysés`,
    ),
  );

  if (report.typescript.status === "ok") {
    console.log(chalk.green("    ✔ TypeScript : compilation réussie"));
  } else if (report.typescript.status === "failed") {
    console.log(
      chalk.red(`    ✖ TypeScript : ${report.typescript.reason ?? "échec de compilation"}`),
    );
  } else {
    console.log(
      chalk.dim(`    • TypeScript : ${report.typescript.reason ?? "non exécuté"}`),
    );
  }

  for (const warning of warnings) {
    console.log(chalk.yellow(`    ⚠ ${warning.message}`));
  }
  for (const error of errors) {
    console.log(chalk.red(`    ✖ ${error.message}`));
  }
}

/** Affiche ce que le rollback a réellement restauré, supprimé ou échoué. */
function printRollbackReport(report: RollbackReport, projectRoot: string): void {
  console.log();
  console.log(chalk.yellow("  ⚠ Rollback de l'installation locale :"));

  if (report.entries.length === 0) {
    console.log(chalk.dim("    • Aucun fichier local n'avait été modifié."));
  }
  for (const entry of report.entries) {
    const relativePath = relativeToProject(projectRoot, entry.path);
    if (entry.action === "restored") {
      console.log(chalk.dim(`    ↺ restauré : ${relativePath}`));
    } else if (entry.action === "removed") {
      console.log(chalk.dim(`    − supprimé : ${relativePath}`));
    } else {
      console.log(
        chalk.red(
          `    ✖ rollback impossible : ${relativePath} (${entry.reason ?? "raison inconnue"})`,
        ),
      );
    }
  }

  if (report.externalOperations.length > 0) {
    console.log(
      chalk.yellow("    → Opérations externes demandées, non annulables :"),
    );
    for (const operation of report.externalOperations) {
      console.log(
        chalk.dim(`      • ${operation.kind} : ${operation.packages.join(", ")}`),
      );
    }
  }
}

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
    .option("--repair", "Restaurer les fichiers de fondation/composants modifiés localement")
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
      repair?: boolean;
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
        if (resolved.stale) {
          console.log(
            chalk.yellow(
              "  ⚠ Registre distant injoignable : utilisation du cache local expiré.",
            ),
          );
        }
        // La matrice Expo doit être disponible AVANT la résolution : sans elle,
        // les versions ne sont pas résolues et l'échec serait silencieux.
        const matrixAvailable = await ensureCompatibilityMatrixDownloaded(expo.supportedVersion, {
          registryUrl: resolved.registryUrl,
          registryRoot: resolved.registryRoot,
        });
        if (!matrixAvailable) {
          console.log(
            chalk.yellow(
              `  ⚠ Matrice Expo SDK ${expo.supportedVersion} indisponible sur le registre distant.`,
            ),
          );
          console.log(
            chalk.dim(
              "    → Les dépendances natives critiques seront bloquées ; aucune version ne sera inventée.",
            ),
          );
        }
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
            pageSize: Math.max(10, (process.stdout.rows ?? 30) - 6),
            loop: false,
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

      const force = Boolean(options.force);
      const repair = Boolean(options.repair);
      const overwrite = force || repair;
      const dryRun = Boolean(options.dryRun);

      const importTransform: TransformImportOptions | undefined = options.alias
        ? { toPrefix: options.alias }
        : (config.aliases ? { aliases: config.aliases } : undefined);

      // Préfixes réellement utilisés par la transformation d'imports : les
      // alias projet, complétés par `--alias` le cas échéant.
      const aliasPrefixes = deriveAliasPrefixes({
        ...(config.aliases ?? {}),
        ...(options.alias ? { cli: options.alias } : {}),
      });

      const targetDir = join(cwd, config.componentsPath);
      const requestedSet = new Set(componentNames);

      // ── 2c. Dépendances externes apportées par un template/widget ───────
      const extraFoundations = new Set<string>();
      const extraNpmDeps = new Set<string>();
      const extraExpoDeps = new Set<string>();
      for (const def of [templateDef, widgetDef]) {
        if (!def) continue;
        for (const foundation of def.requiresFoundations ?? []) extraFoundations.add(foundation);
        for (const dep of def.dependencies ?? []) extraNpmDeps.add(dep);
        for (const dep of def.expoDependencies ?? []) extraExpoDeps.add(dep);
      }

      // ── 3. Installed packages + resolution ─────────────────────────────
      const spinner = ora("Résolution des dépendances...").start();

      const pkgJsonPath = join(cwd, "package.json");
      const installedPkgs: Record<string, string> = {};
      if (existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
          Object.assign(installedPkgs, pkg.dependencies ?? {}, pkg.devDependencies ?? {});
        } catch (err) {
          spinner.stop();
          console.log(chalk.red("  ✖ package.json illisible."));
          console.log(chalk.dim(`    ${(err as Error).message}`));
          process.exit(1);
        }
      }

      const resolvePlan = (): DependencyPlan =>
        resolveDependencies(
          componentNames,
          expo.supportedVersion,
          resolved.registryRoot,
          installedPkgs,
          {
            extraFoundations: [...extraFoundations],
            extraNpmDeps: [...extraNpmDeps],
            extraExpoDeps: [...extraExpoDeps],
          },
        );

      let plan = resolvePlan();

      // ── 3a. Mode distant : télécharger manifestes + fichiers manquants ──
      if (resolved.isRemote) {
        spinner.text = "Téléchargement des artefacts manquants...";
        try {
          const attempted = new Set<string>();
          const remoteOptions = {
            registryUrl: resolved.registryUrl,
            registryRoot: resolved.registryRoot,
            sourceRoot: resolved.sourceRoot,
          };

          for (let attempt = 0; attempt < 10; attempt++) {
            const missing = [
              ...plan.diagnostics.missingComponents,
              ...plan.diagnostics.missingFoundations,
            ].filter((dep) => !attempted.has(`${dep.kind}:${dep.name}`));

            if (missing.length === 0) break;

            let progressed = false;
            for (const dep of missing) {
              const key = `${dep.kind}:${dep.name}`;
              if (attempted.has(key)) continue;
              attempted.add(key);

              if (dep.kind === "foundation") {
                await ensureFoundationDownloaded(dep.name, remoteOptions);
              } else {
                await ensureComponentDownloaded(dep.name, remoteOptions);
              }
              progressed = true;
            }

            if (!progressed) break;
            plan = resolvePlan();
          }

          // Garantit que TOUS les fichiers des artefacts du plan sont présents,
          // même lorsque le manifeste était déjà en cache.
          for (const foundation of plan.foundations) {
            await ensureFoundationDownloaded(foundation.name, remoteOptions);
          }
          for (const component of plan.components) {
            await ensureComponentDownloaded(component.name, remoteOptions);
          }
        } catch (err) {
          spinner.stop();
          console.log(chalk.red("  ✖ Téléchargement distant incomplet."));
          console.log(chalk.dim(`    ${(err as Error).message}`));
          process.exit(1);
        }
      }

      spinner.stop();

      // ── 3b. Diagnostics de résolution : jamais ignorés ──────────────────
      const diagnostics = plan.diagnostics;

      if (diagnostics.invalidManifests.length > 0) {
        console.log(chalk.red("  ✖ Manifestes invalides dans le registre :"));
        for (const issue of diagnostics.invalidManifests) {
          console.log(
            chalk.red(
              `    • ${issue.kind} '${issue.name}' : ${issue.reason}`,
            ),
          );
        }
        process.exit(1);
      }

      if (
        diagnostics.missingComponents.length > 0 ||
        diagnostics.missingFoundations.length > 0 ||
        diagnostics.cycles.length > 0
      ) {
        console.log(chalk.red("  ✖ Résolution des dépendances incomplète :"));
        for (const dep of diagnostics.missingComponents) {
          console.log(chalk.red(`    • composant '${dep.name}' introuvable (requis par ${dep.requiredBy})`));
        }
        for (const dep of diagnostics.missingFoundations) {
          console.log(chalk.red(`    • fondation '${dep.name}' introuvable (requise par ${dep.requiredBy})`));
        }
        for (const cycle of diagnostics.cycles) {
          console.log(chalk.red(`    • cycle détecté : ${cycle}`));
        }
        process.exit(1);
      }

      // Un plan vide n'est jamais un succès : la demande doit produire au moins
      // un artefact installable.
      if (
        plan.components.length === 0 &&
        plan.foundations.length === 0 &&
        !templateDef &&
        !widgetDef
      ) {
        console.log(chalk.red("  ✖ Plan d'installation vide : aucun artefact résolu."));
        process.exit(1);
      }

      // ── 3c. Fichiers déclarés : existence réelle avant toute écriture ───
      const missingSourceFiles = validatePlanSources(plan, resolved.sourceRoot);
      if (missingSourceFiles.length > 0) {
        console.log(chalk.red("  ✖ Fichiers déclarés introuvables dans le registre :"));
        for (const missing of missingSourceFiles) {
          console.log(
            chalk.red(
              `    • ${missing.kind} '${missing.name}' → ${missing.file}`,
            ),
          );
        }
        console.log(
          chalk.dim(
            "    → Le plan est incomplet : aucune installation n'a été effectuée.",
          ),
        );
        process.exit(1);
      }

      // ── 3d. Dépendances natives critiques non résolues : blocage ───────
      if (diagnostics.unversionedCriticalExpoDeps.length > 0) {
        console.log(chalk.red("  ✖ Dépendances natives critiques sans version compatible connue :"));
        console.log(chalk.red(`    ${diagnostics.unversionedCriticalExpoDeps.join(", ")}`));
        console.log(
          chalk.dim(
            `    → Matrice Expo SDK ${expo.supportedVersion} incomplète ou indisponible.`,
          ),
        );
        console.log(
          chalk.dim(
            "    → Aucune version n'est inventée. Mettez à jour la matrice ou installez ces modules manuellement après validation.",
          ),
        );
        process.exit(1);
      }

      // ── C-2 : Avertissement conflits de versions Expo
      if (plan.versionConflicts.length > 0) {
        console.log(chalk.yellow("  ⚠  Conflits de versions Expo détectés :"));
        for (const c of plan.versionConflicts) {
          console.log(chalk.yellow(`    • ${c.pkg}`) + chalk.dim(` installé: ${c.installed}`) + chalk.red(` ≠ `) + chalk.cyan(`requis: ${c.required}`));
        }
        console.log(chalk.dim("    → Mettez à jour ces packages : npx expo install " + plan.versionConflicts.map((c) => c.pkg).join(" ")));
        console.log();
      }

      if (diagnostics.unversionedExpoDeps.length > 0) {
        console.log(chalk.yellow("  ⚠  Dépendances Expo sans version dans la matrice SDK :"));
        console.log(chalk.dim(`    ${diagnostics.unversionedExpoDeps.join(", ")}`));
        console.log(chalk.dim("    → `expo install` choisira la version compatible du SDK. Aucune version n'est inventée."));
        console.log();
      }

      // ── 4. Plan des fondations (avant les composants) ──────────────────
      const foundationPlans: FoundationPlan[] = planFoundations(
        plan.foundations,
        resolved.sourceRoot,
        {
          projectRoot: cwd,
          componentsPath: config.componentsPath,
          importTransform,
        },
      );

      const invalidFoundations = foundationPlans.filter((p) => p.errors.length > 0);
      if (invalidFoundations.length > 0) {
        console.log(chalk.red("  ✖ Fondations invalides :"));
        for (const fp of invalidFoundations) {
          for (const error of fp.errors) {
            console.log(chalk.red(`    • ${error}`));
          }
        }
        process.exit(1);
      }

      // ── 5. Sélection des composants à copier (destinations réelles) ────
      const componentsToCopy: ResolvedComponent[] = [];
      const alreadyInstalledComponents: ResolvedComponent[] = [];
      for (const comp of plan.components) {
        const filesMissing = (comp.entry.files ?? []).some(
          (file) => !existsSync(resolveComponentDestination(file, targetDir, cwd)),
        );
        const assetsMissing = (comp.entry.assets ?? []).some(
          (asset) => !existsSync(join(cwd, toPosix(asset))),
        );
        const requested = requestedSet.has(comp.name);
        const tracked = isComponentInstalled(config, comp.name);
        const needsCopy =
          overwrite || filesMissing || assetsMissing || (requested && !tracked);
        if (needsCopy) componentsToCopy.push(comp);
        else alreadyInstalledComponents.push(comp);
      }

      // ── 6. Cibles et fichiers des templates/widgets ────────────────────
      const templateTargetRel = templateDef
        ? `${artefactBaseRel(config.componentsPath, "templates")}/${templateDef.id}`
        : "";
      const widgetTargetRel = widgetDef
        ? `${artefactBaseRel(config.componentsPath, "widgets")}/${widgetDef.id}`
        : "";

      const templateNeedsWork = templateDef
        ? templateDef.files.some(
            (file) => overwrite || !existsSync(join(cwd, templateTargetRel, file)),
          ) ||
          (templateDef.assets ?? []).some(
            (asset) => overwrite || !existsSync(join(cwd, toPosix(asset))),
          )
        : false;
      const widgetNeedsWork = widgetDef
        ? widgetDef.files.some(
            (file) => overwrite || !existsSync(join(cwd, widgetTargetRel, file)),
          ) ||
          (widgetDef.assets ?? []).some(
            (asset) => overwrite || !existsSync(join(cwd, toPosix(asset))),
          )
        : false;

      const newExpoDeps = Object.keys(plan.allExpoDeps).filter((dep) => !(dep in installedPkgs));
      const newNpmDeps = plan.allNpmDeps.filter((dep) => !(dep in installedPkgs));

      const foundationsNeedWork = foundationPlans.some(
        (fp) =>
          fp.state !== "installed" ||
          fp.assets.some((asset) => !existsSync(join(cwd, toPosix(asset)))),
      );

      // ── 7. Affichage du plan ───────────────────────────────────────────
      console.log(chalk.bold("  Plan d'installation:"));
      console.log();

      if (foundationPlans.length > 0) {
        console.log(chalk.dim("  Fondations internes:"));
        for (const fp of foundationPlans) {
          const stateLabel =
            fp.state === "installed"
              ? chalk.gray("déjà installée")
              : fp.state === "modified"
                ? chalk.yellow("modifiée localement")
                : fp.state === "partial"
                  ? chalk.yellow("partielle")
                  : chalk.green("à installer");
          const missing = fp.files.filter((f) => f.status === "missing").length;
          const fileCount = (fp.entry.files ?? []).length + (fp.entry.assets ?? []).length;
          const detail = missing > 0 ? chalk.dim(` (${missing} fichier(s) manquant(s))`) : "";
          console.log(`    + ${fp.name} ${stateLabel}${detail} ${chalk.dim(`[${fileCount} fichier(s)]`)}`);
        }
        console.log();
      }

      const requestedToCopy = componentsToCopy.filter((c) => requestedSet.has(c.name));
      const transitiveToCopy = componentsToCopy.filter((c) => !requestedSet.has(c.name));

      if (requestedToCopy.length > 0) {
        console.log(chalk.dim("  Composants demandés:"));
        requestedToCopy.forEach((c) => {
          const fileCount = (c.entry.files ?? []).length + (c.entry.assets ?? []).length;
          console.log(chalk.green(`    + ${c.name}@${c.entry.version} ${chalk.dim(`[${fileCount} fichier(s)]`)}`));
        });
        console.log();
      }

      if (transitiveToCopy.length > 0) {
        console.log(chalk.dim("  Dépendances transitives:"));
        transitiveToCopy.forEach((c) => {
          const fileCount = (c.entry.files ?? []).length + (c.entry.assets ?? []).length;
          console.log(chalk.dim(`    + ${c.name}@${c.entry.version} [${fileCount} fichier(s)]`));
        });
        console.log();
      }

      if (alreadyInstalledComponents.length > 0) {
        console.log(chalk.dim("  Déjà installés:"));
        alreadyInstalledComponents.forEach((c) =>
          console.log(chalk.gray(`    ~ ${c.name}@${c.entry.version}  (utiliser --force pour réinstaller)`)),
        );
        console.log();
      }

      if (templateNeedsWork && templateDef) {
        console.log(chalk.dim("  Template:"));
        console.log(chalk.green(`    + ${templateDef.id}@${templateDef.version} → ${templateTargetRel}`));
        console.log();
      }

      if (widgetNeedsWork && widgetDef) {
        console.log(chalk.dim("  Widget:"));
        console.log(chalk.green(`    + ${widgetDef.id}@${widgetDef.version} → ${widgetTargetRel}`));
        console.log();
      }

      if (newExpoDeps.length > 0) {
        console.log(chalk.dim("  Dépendances Expo (expo install):"));
        newExpoDeps.forEach((dep) => {
          const version = plan.allExpoDeps[dep];
          console.log(chalk.dim(`    + ${dep}${version ? `@${version}` : ""}`));
        });
        console.log();
      }

      if (newNpmDeps.length > 0) {
        console.log(chalk.dim("  Dépendances npm:"));
        newNpmDeps.forEach((dep) => console.log(chalk.dim(`    + ${dep}`)));
        console.log();
      }

      if (plan.allProviders.length > 0) {
        console.log(chalk.dim("  Intégrations système (providers React):"));
        plan.allProviders.forEach((provider) => console.log(chalk.dim(`    • ${provider}`)));
        console.log();
      }

      if (plan.requiresRebuild) {
        console.log(chalk.yellow("  ⚠  Certains composants nécessitent un development build."));
        console.log();
      }

      // ── 7b. Cibles réelles de vérification (indépendantes du lockfile) ──
      const verificationTargets: VerificationTarget[] = [];
      for (const comp of plan.components) {
        verificationTargets.push({
          label: `composant ${comp.name}`,
          files: (comp.entry.files ?? []).map((file) =>
            resolveComponentDestination(file, targetDir, cwd),
          ),
          assets: (comp.entry.assets ?? []).map((asset) =>
            join(cwd, toPosix(asset)),
          ),
        });
      }
      for (const fp of foundationPlans) {
        verificationTargets.push({
          label: `fondation ${fp.name}`,
          files: fp.files.map((file) => file.destination),
          assets: fp.assets.map((asset) => join(cwd, toPosix(asset))),
        });
      }
      if (templateDef) {
        verificationTargets.push({
          label: `template ${templateDef.id}`,
          files: templateDef.files.map((file) =>
            join(cwd, templateTargetRel, file),
          ),
          assets: (templateDef.assets ?? []).map((asset) =>
            join(cwd, toPosix(asset)),
          ),
        });
      }
      if (widgetDef) {
        verificationTargets.push({
          label: `widget ${widgetDef.id}`,
          files: widgetDef.files.map((file) =>
            join(cwd, widgetTargetRel, file),
          ),
          assets: (widgetDef.assets ?? []).map((asset) =>
            join(cwd, toPosix(asset)),
          ),
        });
      }

      const expectedPackages = [
        ...Object.keys(plan.allExpoDeps),
        ...plan.allNpmDeps,
      ];

      const verifyOptions = (currentConfig: RashwrightConfig) => ({
        projectRoot: cwd,
        config: currentConfig,
        configPath: project.rashwrightConfigPath,
        targets: verificationTargets,
        expectedPackages,
        expectedComponents: [...requestedSet].filter((name) =>
          isComponentInstalled(currentConfig, name),
        ),
        expectedFoundations: plan.foundations.map((foundation) => foundation.name),
        expectedTemplates: templateDef ? [templateDef.id] : [],
        expectedWidgets: widgetDef ? [widgetDef.id] : [],
      });

      if (
        componentsToCopy.length === 0 &&
        !foundationsNeedWork &&
        newExpoDeps.length === 0 &&
        newNpmDeps.length === 0 &&
        !templateNeedsWork &&
        !widgetNeedsWork
      ) {
        // Rien à écrire : l'installation existante doit tout de même être
        // vérifiée sur le disque avant d'annoncer un succès.
        const existingVerification = verifyInstallation({
          ...verifyOptions(config),
          checkTypeScript: false,
        });
        printVerificationReport(existingVerification);

        if (!existingVerification.ok) {
          console.log();
          console.log(
            chalk.red(
              "  ✖ Installation existante incohérente : aucun succès affiché.",
            ),
          );
          console.log(
            chalk.dim("     → Lancez `rs-ui doctor` pour le diagnostic complet."),
          );
          process.exitCode = 1;
          return;
        }

        console.log(chalk.green("  ✔ Tous les composants sélectionnés sont déjà installés."));
        console.log(chalk.dim("     → Utilisez `rs-ui add --force <noms>` pour les réinstaller/écraser."));
        return;
      }

      if (!options.yes && !dryRun) {
        const ok = await confirm({ message: "Continuer?", default: true });
        if (!ok) {
          console.log(chalk.dim("  Annulé."));
          return;
        }
      }

      if (dryRun) {
        console.log(chalk.bold.cyan("  [dry-run] Aucun fichier ne sera écrit, aucune dépendance installée."));
        console.log();
      }

      // ── 7c. Transaction locale : instantané AVANT toute écriture ───────
      const transaction = dryRun ? null : new InstallationTransaction();

      const trackAll = (paths: Iterable<string>): void => {
        if (transaction) transaction.trackAll(paths);
      };

      if (transaction) {
        const destinations: string[] = [];

        for (const fp of foundationPlans) {
          for (const file of fp.files) destinations.push(file.destination);
          for (const asset of fp.assets) destinations.push(join(cwd, toPosix(asset)));
        }

        for (const comp of componentsToCopy) {
          for (const file of comp.entry.files ?? []) {
            destinations.push(resolveComponentDestination(file, targetDir, cwd));
          }
          for (const asset of comp.entry.assets ?? []) {
            destinations.push(join(cwd, toPosix(asset)));
          }
          if (options.skills !== false) {
            destinations.push(
              join(cwd, "skills", "rs-ui", comp.name, "SKILL.md"),
            );
          }
        }

        if (templateDef && templateNeedsWork) {
          for (const file of templateDef.files) {
            destinations.push(join(cwd, templateTargetRel, file));
          }
          for (const asset of templateDef.assets ?? []) {
            destinations.push(join(cwd, toPosix(asset)));
          }
          if (templateDef.screens && templateDef.screens.length > 0) {
            const useSrc =
              config.componentsPath.startsWith("src/") ||
              existsSync(join(cwd, "src"));
            const appDir = join(cwd, useSrc ? "src/app" : "app");
            if (existsSync(appDir)) {
              for (const screen of templateDef.screens) {
                const cleanRoute = screen.route
                  .replace(/^\//, "")
                  .replace(/\.tsx$/, "");
                destinations.push(join(appDir, `${cleanRoute}.tsx`));
              }
            }
          }
        }

        if (widgetDef && widgetNeedsWork) {
          for (const file of widgetDef.files) {
            destinations.push(join(cwd, widgetTargetRel, file));
          }
          for (const asset of widgetDef.assets ?? []) {
            destinations.push(join(cwd, toPosix(asset)));
          }
          if (options.skills !== false) {
            destinations.push(
              join(
                cwd,
                "skills",
                "rs-ui",
                "widgets",
                widgetDef.id.replace(/-widget$/, ""),
                "SKILL.md",
              ),
            );
          }
        }

        destinations.push(
          join(targetDir, "index.ts"),
          join(cwd, "tsconfig.json"),
          project.rashwrightConfigPath,
          getLockfilePath(cwd),
        );

        trackAll(destinations);
      }

      const rollbackAndFail = (reason: string): void => {
        console.log();
        console.log(chalk.red(`  ✖ ${reason}`));

        if (transaction) {
          const report = transaction.rollback();
          printRollbackReport(report, cwd);
          if (!report.success) {
            console.log(
              chalk.red(
                "  ✖ Le rollback lui-même a échoué : vérifiez les fichiers listés ci-dessus.",
              ),
            );
          }
        } else {
          console.log(chalk.dim("    → dry-run : aucune écriture locale à annuler."));
        }

        console.log(
          chalk.dim(
            "    → Aucun succès d'installation n'est affiché tant que l'état disque n'est pas cohérent.",
          ),
        );
        process.exitCode = 1;
      };

      // ── 8. Installation des dépendances Expo puis npm ──────────────────
      const pm: PackageManager = config.packageManager || project.packageManager || "npm";

      if (newExpoDeps.length > 0) {
        transaction?.recordExternal({ kind: "expo", packages: newExpoDeps });
        const depSpinner = ora(`Installation des dépendances Expo via ${pm}...`).start();
        try {
          installExpoPackages(newExpoDeps, pm, cwd, dryRun);
          depSpinner.succeed("Dépendances Expo installées");
        } catch (err) {
          depSpinner.fail("Échec de l'installation des dépendances Expo");
          console.error(err);
          rollbackAndFail("Échec de l'installation des dépendances Expo.");
          return;
        }
      }

      if (newNpmDeps.length > 0) {
        transaction?.recordExternal({ kind: "npm", packages: newNpmDeps });
        const npmSpinner = ora(`Installation des dépendances npm via ${pm}...`).start();
        try {
          installNpmPackages(newNpmDeps, pm, cwd, dryRun);
          npmSpinner.succeed("Dépendances npm installées");
        } catch (err) {
          npmSpinner.fail("Échec de l'installation npm");
          console.error(err);
          rollbackAndFail("Échec de l'installation des dépendances npm.");
          return;
        }
      }

      // ── 9. Application des fondations (avant les composants) ───────────
      const needsRepairFoundations = new Set<string>();
      if (foundationPlans.length > 0) {
        const foundationSpinner = ora("Installation des fondations internes...").start();
        const results = applyFoundationPlans(foundationPlans, resolved.sourceRoot, cwd, {
          overwrite,
          dryRun,
        });

        let failed = false;
        for (const result of results) {
          const fileFailures = result.files.filter((f) => f.status === "failed");
          const assetFailures = result.assets.filter((a) => a.status === "failed");
          if (result.errors.length > 0 || fileFailures.length > 0 || assetFailures.length > 0) {
            failed = true;
            for (const error of result.errors) console.log(chalk.red(`    ✖ ${error}`));
            for (const failure of fileFailures) {
              console.log(chalk.red(`    ✖ ${failure.relativePath}: ${failure.reason ?? "échec"}`));
            }
            for (const failure of assetFailures) {
              console.log(chalk.red(`    ✖ ${relativeToProject(cwd, failure.destination)}: ${failure.reason ?? "échec"}`));
            }
            continue;
          }

          const modifiedFiles = result.files.filter((f) => f.status === "modified");
          const assetConflicts = result.assets.filter(
            (a) => a.status === "skipped" && a.isModified,
          );
          if (modifiedFiles.length > 0 || assetConflicts.length > 0) {
            needsRepairFoundations.add(result.name);
            continue;
          }

          // Lockfile basé sur les destinations réelles uniquement.
          const lockFiles = [
            ...result.files
              .filter((f) => f.status === "written" || f.status === "unchanged")
              .map((f) => f.relativePath),
            ...result.assets
              .filter(
                (a) =>
                  a.status === "copied" ||
                  a.status === "overwritten" ||
                  (a.status === "skipped" && !a.isModified),
              )
              .map((a) => relativeToProject(cwd, a.destination)),
          ];
          if (lockFiles.length > 0) {
            recordLockedFoundation(
              cwd,
              result.name,
              result.entry.version,
              lockFiles,
              result.entry.dependencies ?? [],
              result.entry.expoDependencies ?? [],
              dryRun,
              result.entry.registryVersion,
            );
          }
        }

        if (failed) {
          foundationSpinner.fail("Échec de l'installation des fondations");
          rollbackAndFail("Certains fichiers de fondation n'ont pas pu être installés.");
          return;
        }
        foundationSpinner.succeed(`Fondations traitées (${results.length})`);
      }

      // ── 10. Copie des composants ───────────────────────────────────────
      let updatedConfig: RashwrightConfig = config;
      let failedComponents = false;
      let requestedConflicts = false;

      for (const comp of componentsToCopy) {
        const copySpinner = ora(`Copie de ${comp.name}...`).start();

        // ── F-3 : Mode --diff (aperçu des différences avant écrasement)
        if (options.diff) {
          for (const relFile of comp.entry.files ?? []) {
            const localDest = resolveComponentDestination(relFile, targetDir, cwd);
            const sourcePath = join(resolved.sourceRoot, relFile.replace(/\\/g, "/"));
            if (existsSync(localDest) && existsSync(sourcePath)) {
              const oldCode = readFileSync(localDest, "utf-8");
              const newCode = readFileSync(sourcePath, "utf-8");
              if (oldCode !== newCode) {
                copySpinner.stop();
                console.log(chalk.bold.yellow(`\n  [diff] ${relativeToProject(cwd, localDest)} (local vs registre) :`));
                console.log(formatDiffOutput(computeLineDiff(oldCode, newCode)));
                console.log();
                copySpinner.start();
              }
            }
          }
        }

        const declaredAssets = comp.entry.assets ?? [];
        const results = copyComponentFiles(
          comp.entry.files,
          resolved.sourceRoot,
          targetDir,
          {
            overwrite,
            dryRun,
            importTransform,
            projectRoot: cwd,
            declaredAssets,
          },
        );

        const assets = declaredAssets.length > 0
          ? copyAssetFiles(declaredAssets, resolved.sourceRoot, cwd, { overwrite, dryRun })
          : [];
        const allResults: FileCopyResult[] = [...results, ...assets];

        const failures = allResults.filter((r) => r.status === "failed");
        if (failures.length > 0) {
          failedComponents = true;
          copySpinner.fail(`Échec de la copie de ${comp.name}`);
          for (const failure of failures) {
            console.log(chalk.red(`    ✖ ${relativeToProject(cwd, failure.destination)}: ${failure.reason ?? "échec"}`));
          }
          continue;
        }

        const conflicts = allResults.filter(
          (r) => r.status === "skipped" && r.isModified,
        );
        if (conflicts.length > 0) {
          if (requestedSet.has(comp.name)) requestedConflicts = true;
          copySpinner.warn(
            `${comp.name} : ${conflicts.length} fichier(s) modifié(s) localement, non écrasé(s). Utilisez --force/--repair.`,
          );
          for (const conflict of conflicts) {
            console.log(chalk.yellow(`    ⚠ ${relativeToProject(cwd, conflict.destination)}`));
          }
          continue;
        }

        if (options.skills !== false) {
          copyComponentSkill(comp.name, resolved.sourceRoot, cwd, dryRun);
        }

        const targetVersion = requestedVersions.get(comp.name) || comp.entry.version || "1.0.0";
        const lockFiles = allResults.map((r) => relativeToProject(cwd, r.destination));
        if (lockFiles.length > 0) {
          recordLockedComponent(
            cwd,
            comp.name,
            targetVersion,
            lockFiles,
            comp.entry.dependencies ?? [],
            comp.entry.expoDependencies ?? [],
            dryRun,
            comp.entry.registryVersion,
          );
        }

        if (requestedSet.has(comp.name)) {
          copySpinner.succeed(`${chalk.green("✔")} ${comp.name}@${targetVersion} ajouté`);
          updatedConfig = markComponentInstalled(
            updatedConfig,
            comp.name,
            targetVersion,
            comp.entry.registryVersion,
          );
        } else {
          copySpinner.succeed(`${chalk.cyan("…")} ${comp.name}@${comp.entry.version} copié (dépendance transitive)`);
        }
      }

      if (failedComponents) {
        console.log(chalk.red("  ✖ Certains fichiers n'ont pas pu être installés."));
        rollbackAndFail("Installation des composants incomplète.");
        return;
      }

      // ── 11. Copie des fichiers du template autonome ────────────────────
      if (templateDef && templateNeedsWork) {
        const tplSpinner = ora(`Installation des fichiers du template ${templateDef.id}...`).start();
        const templateSourceDir = join(TEMPLATES_ROOT, templateDef.id);
        const templateTargetDir = join(cwd, templateTargetRel);

        const templateAssets = templateDef.assets ?? [];
        const results = copyArtefactFiles(
          templateDef.files,
          templateSourceDir,
          templateTargetDir,
          {
            overwrite,
            dryRun,
            importTransform,
            sourceRoot: resolved.sourceRoot,
            projectRoot: cwd,
            declaredAssets: templateAssets,
          },
        );
        const assets = templateAssets.length > 0
          ? copyAssetFiles(templateAssets, resolved.sourceRoot, cwd, { overwrite, dryRun })
          : [];
        const allResults: FileCopyResult[] = [...results, ...assets];

        const failures = allResults.filter((r) => r.status === "failed");
        if (failures.length > 0) {
          tplSpinner.fail(`Échec de l'installation du template ${templateDef.id}`);
          for (const failure of failures) {
            console.log(chalk.red(`    ✖ ${relativeToProject(cwd, failure.destination)}: ${failure.reason ?? "échec"}`));
          }
          rollbackAndFail(`Installation du template ${templateDef.id} incomplète.`);
          return;
        }

        const conflicts = allResults.filter((r) => r.status === "skipped" && r.isModified);
        if (conflicts.length > 0) {
          tplSpinner.warn(
            `Template ${templateDef.id} : ${conflicts.length} fichier(s) modifié(s) localement, non écrasé(s).`,
          );
        }

        recordLockedTemplate(
          cwd,
          templateDef.id,
          templateDef.version,
          templateTargetRel,
          templateDef.requiredComponents,
          allResults
            .filter((r) => !(r.status === "skipped" && r.isModified))
            .map((r) => relativeToProject(cwd, r.destination)),
          templateDef.dependencies,
          templateDef.expoDependencies,
          dryRun,
          templateDef.registryVersion,
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
            for (const screen of templateDef.screens) {
              const cleanRoute = screen.route.replace(/^\//, "").replace(/\.tsx$/, "");
              const screenFilePath = join(appDir, `${cleanRoute}.tsx`);
              if (!existsSync(screenFilePath) || overwrite) {
                if (!existsSync(dirname(screenFilePath))) {
                  mkdirSync(dirname(screenFilePath), { recursive: true });
                }
                const routeContent = `import React from "react";
import { ${screen.componentName} } from "${importAlias}";

export default function ${screen.componentName}Route() {
  return <${screen.componentName} />;
}
`;
                if (!dryRun) {
                  writeFileSync(screenFilePath, routeContent, "utf-8");
                }
                console.log(chalk.green(`    ✔ Route écran créée : ${useSrc ? "src/app" : "app"}/${cleanRoute}.tsx (${screen.componentName})`));
              }
            }
          }
        }
      }

      // ── 12. Copie des fichiers du widget modulaire ─────────────────────
      if (widgetDef && widgetNeedsWork) {
        const wgtSpinner = ora(`Installation des fichiers du widget ${widgetDef.id}...`).start();
        const widgetSourceDir = join(WIDGETS_ROOT, widgetDef.id);
        const widgetTargetDir = join(cwd, widgetTargetRel);

        const widgetAssets = widgetDef.assets ?? [];
        const results = copyArtefactFiles(
          widgetDef.files,
          widgetSourceDir,
          widgetTargetDir,
          {
            overwrite,
            dryRun,
            importTransform,
            sourceRoot: resolved.sourceRoot,
            projectRoot: cwd,
            declaredAssets: widgetAssets,
          },
        );
        const assets = widgetAssets.length > 0
          ? copyAssetFiles(widgetAssets, resolved.sourceRoot, cwd, { overwrite, dryRun })
          : [];
        const allResults: FileCopyResult[] = [...results, ...assets];

        const failures = allResults.filter((r) => r.status === "failed");
        if (failures.length > 0) {
          wgtSpinner.fail(`Échec de l'installation du widget ${widgetDef.id}`);
          for (const failure of failures) {
            console.log(chalk.red(`    ✖ ${relativeToProject(cwd, failure.destination)}: ${failure.reason ?? "échec"}`));
          }
          rollbackAndFail(`Installation du widget ${widgetDef.id} incomplète.`);
          return;
        }

        const conflicts = allResults.filter((r) => r.status === "skipped" && r.isModified);
        if (conflicts.length > 0) {
          wgtSpinner.warn(
            `Widget ${widgetDef.id} : ${conflicts.length} fichier(s) modifié(s) localement, non écrasé(s).`,
          );
        }

        recordLockedWidget(
          cwd,
          widgetDef.id,
          widgetDef.version,
          widgetTargetRel,
          widgetDef.requiredComponents,
          allResults
            .filter((r) => !(r.status === "skipped" && r.isModified))
            .map((r) => relativeToProject(cwd, r.destination)),
          widgetDef.dependencies,
          widgetDef.expoDependencies,
          dryRun,
          widgetDef.registryVersion,
        );

        if (options.skills !== false) {
          copyWidgetSkill(widgetDef.id, resolved.sourceRoot, cwd, dryRun);
        }

        wgtSpinner.succeed(`Widget ${widgetDef.id} installé dans ${widgetTargetRel}`);
      }

      // ── 13. Régénérer index.ts du dossier UI & synchroniser la config ──
      if (!dryRun) {
        generateUiIndex(targetDir, Object.keys(updatedConfig.components), dryRun);
        updateTsconfig(cwd, dryRun, aliasPrefixes);
        writeConfig(project.rashwrightConfigPath, updatedConfig);

        // ── 14. Vérification indépendante du lockfile ────────────────────
        // Aucun succès n'est affiché si le disque ne correspond pas au plan.
        const verification = verifyInstallation({
          ...verifyOptions(updatedConfig),
          checkTypeScript: true,
        });
        printVerificationReport(verification);

        if (!verification.ok) {
          rollbackAndFail(
            "Vérification post-installation échouée : l'installation n'est pas déclarée réussie.",
          );
          return;
        }

        // Le hook post-add ne s'exécute qu'après une installation vérifiée.
        executeHook("post-add", updatedConfig.hooks, cwd, { dryRun });
      }

      // ── 15. Summary ────────────────────────────────────────────────────
      if (dryRun) {
        console.log();
        console.log(
          chalk.bold.cyan(
            "  ✔ Simulation terminée (dry-run) — aucun fichier écrit, aucune dépendance installée.",
          ),
        );
        console.log(
          chalk.dim("     → Relancez sans --dry-run pour appliquer ce plan."),
        );
        console.log();
        return;
      }

      if (needsRepairFoundations.size > 0) {
        console.log();
        console.log(chalk.yellow("  ⚠  Fondations partiellement modifiées localement :"));
        for (const name of needsRepairFoundations) {
          console.log(chalk.yellow(`    • ${name}`));
        }
        console.log(chalk.dim("    → Les fichiers modifiés n'ont pas été écrasés. Relancez avec `--repair` pour les restaurer."));
        console.log(chalk.dim("    → Ces fondations ne sont pas enregistrées comme intactes dans rashwright-ui.lock."));
      }

      if (requestedConflicts) {
        console.log();
        console.log(chalk.yellow("  ⚠  Des fichiers demandés existent déjà et ont été modifiés localement."));
        console.log(chalk.dim("    → Utilisez --diff pour inspecter, puis --force/--repair pour les remplacer."));
        console.log();
        console.log(
          chalk.red(
            "  ✖ Installation incomplète : des fichiers demandés n'ont pas été installés.",
          ),
        );
        process.exitCode = 1;
        return;
      }

      console.log();
      if (needsRepairFoundations.size > 0) {
        console.log(chalk.bold.yellow("  ⚠ Installation terminée avec avertissements"));
      } else {
        console.log(chalk.bold.green("  ✔ Installation terminée"));
      }
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
