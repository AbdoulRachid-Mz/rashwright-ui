import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { confirm, input, select } from "@inquirer/prompts";
import { basename, join } from "node:path";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { detectPackageManager, installExpoPackages } from "../core/package-manager.js";
import {
  copyRashwrightAssets,
  setupFoundations,
  setupStarterComponents,
  generateShowcaseScreen,
} from "../core/starter-generator.js";

const CORE_EXPO_DEPS = [
  "react-native-reanimated",
  "react-native-gesture-handler",
  "react-native-safe-area-context",
  "@expo/vector-icons",
  "expo-haptics",
  "@react-native-async-storage/async-storage",
  "expo-image-picker",
  "expo-image-manipulator",
];

const GLASS_EXTRA_DEPS = [
  "expo-blur",
  "expo-linear-gradient",
];

const SOURCE_ROOT = join(import.meta.dirname, "..", "..");

function isDirectoryEmpty(dir: string): boolean {
  if (!existsSync(dir)) return true;
  try {
    const entries = readdirSync(dir).filter((name) => {
      if (name.startsWith(".git")) return false;
      const full = join(dir, name);
      const stat = statSync(full);
      void stat;
      return true;
    });
    return entries.length === 0;
  } catch {
    return false;
  }
}

function suggestUniqueProjectName(cwd: string, baseName: string): string {
  let candidate = baseName;
  let counter = 2;
  while (existsSync(join(cwd, candidate)) && !isDirectoryEmpty(join(cwd, candidate))) {
    candidate = `${baseName}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export function initCommand(): Command {
  const cmd = new Command("init");
  cmd
    .description("Initialiser Rashwright UI Mobile (configure un projet existant ou en crée un nouveau)")
    .argument("[project-name]", "Nom du projet Expo à créer (si aucun projet React Native existant)")
    .option("--sdk <version>", "Version Expo SDK pour un nouveau projet (ex: 57, 58 ou 'latest')", "latest")
    .option("--theme <preset>", "Choisir parmi les 6 thèmes : default, emerald, violet, amber, rose, slate", "default")
    .option("--glass", "Activer le thème Glass UI (expo-blur, expo-linear-gradient)")
    .option("--all", "Installer tous les composants après initialisation")
    .option("--showcase", "Générer un écran d'accueil avec Rashwright UI & logo RS")
    .option("--no-showcase", "Ne pas générer l'écran de démo")
    .option("--yes", "Répondre Oui à toutes les questions (mode non-interactif)")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .action(async (projectNameArg: string | undefined, options) => {
      let cwd = process.cwd();

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui init"));
      console.log();

      // ── 1. Vérifier si un projet React Native existe déjà ────────────────
      const spinner = ora("Analyse de l'environnement...").start();
      let project = detectProject(cwd);
      let expo = detectExpo(cwd);
      spinner.stop();

      const hasReactNativeProject =
        project.hasPackageJson && (project.isExpo || !!project.reactNativeVersion);

      // ── 2. Si aucun projet React Native n'est en place : le créer ────────
      if (!hasReactNativeProject) {
        console.log(chalk.yellow("  ℹ Aucun projet React Native / Expo détecté dans le répertoire courant."));
        console.log();

        const currentDirIsEmpty = isDirectoryEmpty(cwd);
        const defaultProjectName = suggestUniqueProjectName(cwd, "rashwright-expo-app");

        let shouldCreate = true;
        let projectName = projectNameArg;
        let useCurrentDirectory = false;

        if (!options.yes) {
          shouldCreate = await confirm({
            message: "Créer un nouveau projet Expo avec Rashwright UI configuré ?",
            default: true,
          });

          if (!shouldCreate) {
            console.log(chalk.dim("  Annulé."));
            return;
          }

          if (!currentDirIsEmpty) {
            console.log();
            console.log(chalk.yellow("  ⚠  Le répertoire courant contient déjà des fichiers."));
            console.log(chalk.dim(`     (${basename(cwd)}/ n'est pas vide)`));
            console.log();
            useCurrentDirectory = await confirm({
              message: "Installer Rashwright UI dans le répertoire courant (risque d'écrasement) ?",
              default: false,
            });

            if (!useCurrentDirectory) {
              projectName = await input({
                message: "Nom du dossier du projet Expo à créer :",
                default: defaultProjectName,
              });
            }
          } else if (!projectName) {
            projectName = await input({
              message: "Nom du dossier du projet Expo :",
              default: defaultProjectName,
            });
          }
        } else {
          projectName = projectNameArg || defaultProjectName;
          useCurrentDirectory = false;
        }

        let targetDir: string;

        if (useCurrentDirectory) {
          targetDir = cwd;
          console.log();
          console.log(chalk.yellow(`  ⚠  Installation dans le répertoire courant : ${chalk.bold(targetDir)}`));
        } else {
          const sdkFlag = options.sdk === "latest" ? "latest" : options.sdk;
          targetDir = join(cwd, projectName!);
          const pm = detectPackageManager(cwd);
          const runner = pm === "bun" ? "bunx" : "npx";

          if (existsSync(targetDir) && !isDirectoryEmpty(targetDir)) {
            if (!options.yes) {
              console.log();
              console.log(chalk.yellow(`  ⚠  Le dossier ${chalk.bold(projectName!)} existe déjà et n'est pas vide.`));
              const overwrite = await confirm({
                message: "Continuer quand même (create-expo-app refusera probablement) ?",
                default: false,
              });
              if (!overwrite) {
                console.log(chalk.dim("  Annulé. Choisissez un autre nom de projet."));
                return;
              }
            } else {
              console.log(chalk.yellow(`  ⚠  Le dossier ${chalk.bold(projectName!)} existe déjà ; create-expo-app pourrait échouer.`));
            }
          }

          console.log();
          console.log(chalk.bold(`  Création du projet Expo dans le dossier (${chalk.cyan(projectName!)}) SDK ${chalk.green(sdkFlag)}...`));

          const createCmd = `${runner} create-expo-app@${sdkFlag} ${projectName!} --template default`;

          if (options.dryRun) {
            console.log(chalk.yellow(`  [dry-run] ${createCmd}`));
            console.log(chalk.yellow(`  [dry-run] Dossier cible : ${targetDir}`));
          } else {
            const createSpinner = ora(`Exécution de ${createCmd}...`).start();
            try {
              execSync(createCmd, { cwd, stdio: "inherit" });
              createSpinner.succeed(`Projet Expo créé dans le dossier ${projectName!} avec succès`);
            } catch (err) {
              createSpinner.fail("Échec de la création du projet Expo");
              console.error(err);
              process.exit(1);
            }
          }
        }

        cwd = targetDir;
        project = detectProject(cwd);
        expo = detectExpo(cwd);
      } else {
        console.log(chalk.green("  ✔ Projet React Native / Expo existant détecté"));
        if (expo.sdkVersion) {
          console.log(chalk.green(`  ✔ Expo SDK ${expo.sdkVersion}`));
        }
      }

      // ── 3. Options interactives (Thème, Glass, dossier composants) ──────
      let glassEnabled = options.glass ?? false;
      let themePreset = options.theme || "default";
      let componentsPath = project.componentsPath || "components/ui";

      if (!options.yes) {
        if (!options.glass) {
          const style = await select({
            message: "Choisir le style UI :",
            choices: [
              { name: "Glass (Recommandé — Liquid Glass, expo-blur, expo-linear-gradient)", value: "glass" },
              { name: "Default (Standard flat design)", value: "default" },
            ],
          });
          glassEnabled = style === "glass";
        }

        if (options.theme === "default") {
          themePreset = await select({
            message: "Choisir le thème de base :",
            choices: [
              { name: "Rashwright Blue (Default)", value: "default" },
              { name: "Emerald Mint (Nature & Fresh)", value: "emerald" },
              { name: "Violet Tech (Futuriste & Purple)", value: "violet" },
              { name: "Amber Luxury (Chaud & Gold)", value: "amber" },
              { name: "Rose Vibrant (Énergique & Pink)", value: "rose" },
              { name: "Slate Monochrome (Minimaliste & Épuré)", value: "slate" },
            ],
          });
        }

        componentsPath = await input({
          message: "Chemin d'installation des composants UI :",
          default: componentsPath,
        });
      } else {
        glassEnabled = options.glass !== undefined ? options.glass : true;
      }

      // ── 4. Plan des dépendances ──────────────────────────────────────────
      const depsToInstall = [
        ...CORE_EXPO_DEPS,
        ...(glassEnabled ? GLASS_EXTRA_DEPS : []),
      ];

      console.log();
      console.log(chalk.bold("  Configuration appliquée :"));
      console.log(chalk.dim(`  • Dossier : ${componentsPath}`));
      console.log(chalk.dim(`  • Thème : ${themePreset}`));
      console.log(chalk.dim(`  • Style : ${glassEnabled ? "Liquid Glass" : "Default"}`));
      console.log(chalk.dim(`  • Dépendances Expo : ${depsToInstall.join(", ")}`));
      console.log();

      if (options.dryRun) {
        console.log(chalk.yellow("  [dry-run] Aucune modification effectuée."));
        return;
      }

      // ── 5. Installer les dépendances ─────────────────────────────────────
      const installSpinner = ora("Installation des dépendances Expo compatibles...").start();
      try {
        installExpoPackages(depsToInstall, project.packageManager, cwd, options.dryRun);
        installSpinner.succeed("Dépendances installées");
      } catch (err) {
        installSpinner.fail("Échec de l'installation des dépendances");
        console.error(err);
      }

      // ── 6. Copier les fondations (Theme, Store, Context + Core UI text, view, liquid/*) ──────
      const foundationSpinner = ora("Mise en place des fondations Rashwright (tokens, thème, store, contexte + primitives UI)...").start();
      setupFoundations(SOURCE_ROOT, cwd, componentsPath, options.dryRun);
      foundationSpinner.succeed("Fondations du thème, store & primitives UI installées");

      // ── 7. Copier les assets (SVG RS + PNG) ──────────────────────────────
      const assetsSpinner = ora("Copie des assets Rashwright (Logo RS SVG + PNG)...").start();
      copyRashwrightAssets(SOURCE_ROOT, cwd, options.dryRun);
      assetsSpinner.succeed("Assets Rashwright installés dans assets/");

      // ── 8. Mettre en place les composants UI de base ────────────────────
      const compSpinner = ora("Installation des composants starters (Button, Card, GlassCard, Logo, etc.)...").start();
      const targetComponentsDir = join(cwd, componentsPath);
      if (!existsSync(targetComponentsDir)) mkdirSync(targetComponentsDir, { recursive: true });
      const installedStarterComps = setupStarterComponents(SOURCE_ROOT, targetComponentsDir, options.dryRun);
      compSpinner.succeed(`${installedStarterComps.length} composants starters configurés`);

      // ── 9. Générer l'écran de démo Rashwright UI Showcase ────────────────
      const shouldGenerateShowcase = options.showcase !== false;
      let showcaseFile: string | null = null;
      if (shouldGenerateShowcase) {
        const showcaseSpinner = ora("Génération de l'écran démo Rashwright UI Showcase...").start();
        showcaseFile = generateShowcaseScreen(cwd, componentsPath, options.dryRun);
        showcaseSpinner.succeed(`Écran de démo configuré (${showcaseFile ? showcaseFile.replace(cwd, "") : "App"})`);
      }

      // ── 10. Enregistrer la configuration rashwright-ui.json ──────────────
      const componentsRecord: Record<string, string> = {};
      for (const comp of installedStarterComps) {
        componentsRecord[comp] = "1.0.0";
      }

      const config = {
        ...readConfig(join(cwd, "rashwright-ui.json")),
        componentsPath,
        theme: (glassEnabled ? "glass" : "default") as "glass" | "default",
        themePreset,
        glass: glassEnabled,
        typescript: project.hasTypeScript,
        components: componentsRecord,
      };
      writeConfig(join(cwd, "rashwright-ui.json"), config);

      // ── 11. Résumé & instructions ────────────────────────────────────────
      console.log();
      console.log(chalk.bold.green("  ✔ Rashwright UI Mobile est opérationnel !"));
      console.log();
      console.log(chalk.dim("  Éléments prêts :"));
      console.log(chalk.dim(`    ✔ ${componentsPath}/ (Bouton, Card, GlassCard, Badge, Input, Logo RS)`));
      console.log(chalk.dim(`    ✔ theme/ (Tokens, presets Light/Dark/Glass)`));
      console.log(chalk.dim(`    ✔ contexts/theme-context.tsx & stores/theme-store.ts`));
      console.log(chalk.dim(`    ✔ assets/svg/primary.svg & assets/primary.png`));
      if (showcaseFile) {
        console.log(chalk.dim(`    ✔ Écran de démo actif avec logo RS et contrôles interactifs`));
      }
      console.log();
      console.log(chalk.bold("  Commandes utiles :"));
      console.log(chalk.cyan("    rs-ui add drawer"));
      console.log(chalk.cyan("    rs-ui add tabs modal"));
      console.log(chalk.cyan("    rs-ui list"));
      console.log(chalk.cyan("    rs-ui doctor"));
      console.log();

      if (glassEnabled) {
        console.log(chalk.yellow("  ⚠  Note Native :"));
        console.log(chalk.dim("     Le mode Glass utilise expo-blur et des animations natives."));
        console.log(chalk.dim("     Pour un rendu optimal, lancez un development build :"));
        console.log(chalk.dim("     npx expo run:ios  ou  npx expo run:android"));
        console.log();
      }
    });

  return cmd;
}
