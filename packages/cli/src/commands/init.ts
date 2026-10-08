import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { confirm, input, select } from "@inquirer/prompts";
import { basename, join } from "node:path";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { detectProject, isDefaultExpoTemplate } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig, mergeRashwrightConfigs } from "../core/config-manager.js";
import { detectPackageManager, installExpoPackages, installNpmPackages, type PackageManager } from "../core/package-manager.js";
import {
  copyRashwrightAssets,
  resetExpoProject,
  setupFoundations,
  setupStarterComponents,
  generateShowcaseScreen,
  writeBabelConfig,
  updateTsconfig,
  generateCustomTheme,
  type CustomThemeColors,
} from "../core/starter-generator.js";
import { copyGlobalSkill, copyComponentSkill } from "../core/skills-manager.js";
import { recordLockedComponent } from "../core/lock-manager.js";
import { SOURCE_ROOT } from "../core/paths.js";

const CORE_EXPO_DEPS = [
  "react-native-reanimated",
  "react-native-gesture-handler",
  "react-native-safe-area-context",
  "@expo/vector-icons",
  "expo-haptics",
  "@react-native-async-storage/async-storage",
  "expo-image-picker",
  "expo-image-manipulator",
  "expo-application",
  "expo-blur",
  "expo-linear-gradient",
];

const GLASS_EXTRA_DEPS: string[] = [];

// Dépendances npm (non Expo) installées systématiquement (store zustand)
const CORE_NPM_DEPS = ["zustand"];

const SUPPORTED_PACKAGE_MANAGERS: PackageManager[] = ["npm", "bun", "pnpm", "yarn"];

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
    .option("--theme <preset>", "Choisir parmi les thèmes : default, emerald, violet, amber, rose, slate, green, red, cyan, custom", "default")
    .option("--primary <color>", "Couleur primaire personnalisée en hexadécimal (ex: #2563EB)")
    .option("--dark-primary <color>", "Couleur primaire sombre personnalisée (ex: #3B82F6)")
    .option("--secondary <color>", "Couleur secondaire personnalisée (ex: #F1F5F9)")
    .option("--dark-secondary <color>", "Couleur secondaire sombre personnalisée (ex: #1E293B)")
    .option("--accent <color>", "Couleur d'accent personnalisée (ex: #F59E0B)")
    .option("--dark-accent <color>", "Couleur d'accent sombre personnalisée (ex: #FBBF24)")
    .option("--glass", "Activer le thème Glass UI (expo-blur, expo-linear-gradient)")
    .option("--pm <manager>", "Gestionnaire de paquets à utiliser : npm, bun, pnpm, yarn (défaut : npm)")
    .option("--all", "Installer tous les composants après initialisation")
    .option("--skills", "Installer automatiquement les Skills IA pour les agents et le skill global", true)
    .option("--no-skills", "Désactiver l'installation des Skills IA")
    .option("--showcase", "Générer un écran d'accueil avec Rashwright UI & logo RS")
    .option("--no-showcase", "Ne pas générer l'écran de démo")
    .option("--yes", "Répondre Oui à toutes les questions (mode non-interactif)")
    .option("--no-reset", "Ne pas écraser le template Expo (pour projets existants intégrés)")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .action(async (projectNameArg: string | undefined, options) => {
      let cwd = process.cwd();

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui init"));
      console.log();

      // ── 0. Sélection du gestionnaire de paquets (Point 3) ────────────────
      let selectedPm: PackageManager = "npm";
      if (options.pm) {
        const pmCandidate = options.pm.toLowerCase() as PackageManager;
        if (SUPPORTED_PACKAGE_MANAGERS.includes(pmCandidate)) {
          selectedPm = pmCandidate;
        } else {
          console.log(chalk.yellow(`  ⚠ Gestionnaire "${options.pm}" non reconnu. Utilisation de "npm".`));
          selectedPm = "npm";
        }
      } else if (!options.yes) {
        selectedPm = await select<PackageManager>({
          message: "Choisir le gestionnaire de paquets :",
          choices: [
            { name: "npm (Recommandé par défaut)", value: "npm" },
            { name: "bun", value: "bun" },
            { name: "pnpm", value: "pnpm" },
            { name: "yarn", value: "yarn" },
          ],
          default: "npm",
        });
      } else {
        selectedPm = detectPackageManager(cwd);
      }

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
          const runner = selectedPm === "bun" ? "bunx" : "npx";

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
          console.log(chalk.bold(`  Création du projet Expo dans le dossier (${chalk.cyan(projectName!)}) SDK ${chalk.green(sdkFlag)} via ${chalk.magenta(selectedPm)}...`));

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

        const isFreshProject = !useCurrentDirectory ? true : false;

        cwd = targetDir;
        project = detectProject(cwd);
        expo = detectExpo(cwd);

        // ── 2bis. Objectif A / Point 1 : reset template Expo & standardisation /src
        const shouldResetTemplate = options.reset !== false && (isFreshProject || useCurrentDirectory);
        if (!options.dryRun && shouldResetTemplate) {
          const resetSpinner = ora("Nettoyage du template Expo et mise en place de l'architecture /src (architecture.md)...").start();
          resetExpoProject(cwd, options.dryRun);
          resetSpinner.succeed("Template Expo par défaut nettoyé et architecture /src en place");
        }

        // ── 2ter. Toujours : writeBabelConfig + updateTsconfig
        if (!options.dryRun) {
          const cfgSpinner = ora("Configuration babel.config.js + tsconfig.json (Reanimated, @/ paths)...").start();
          writeBabelConfig(cwd, options.dryRun);
          updateTsconfig(cwd, options.dryRun);
          cfgSpinner.succeed("babel.config.js + tsconfig.json configurés");
        }
      } else {
        console.log(chalk.green("  ✔ Projet React Native / Expo existant détecté"));
        if (expo.sdkVersion) {
          console.log(chalk.green(`  ✔ Expo SDK ${expo.sdkVersion}`));
        }

        // ── Point 1 : Détection d'un template standard officiel sur projet existant
        const isDefaultTemplate = isDefaultExpoTemplate(cwd);
        if (isDefaultTemplate && options.reset !== false) {
          console.log(chalk.cyan("  ℹ Template standard par défaut détecté (éléments d'exemple Expo natifs)."));
          let doReset = true;
          if (!options.yes) {
            doReset = await confirm({
              message: "Nettoyer les fichiers d'exemple par défaut d'Expo et appliquer l'architecture standardisée /src ?",
              default: true,
            });
          }
          if (doReset && !options.dryRun) {
            const resetSpinner = ora("Réinitialisation selon expo-rn-reset & architecture.md...").start();
            resetExpoProject(cwd, options.dryRun);
            resetSpinner.succeed("Projet réinitialisé et architecture /src en place");
          }
        }

        if (!options.dryRun) {
          const cfgSpinner = ora("Vérification babel.config.js + tsconfig.json...").start();
          writeBabelConfig(cwd, options.dryRun);
          updateTsconfig(cwd, options.dryRun);
          cfgSpinner.succeed("babel.config.js + tsconfig.json vérifiés/mis à jour");
        }
      }

      // ── 3. Options interactives (Thème, Glass, dossier composants) ──────
      let glassEnabled = options.glass ?? false;
      let themePreset = options.theme || "default";

      // Si le projet a un dossier src/ (ou vient d'être réinitialisé), default: src/components/ui
      const hasSrc = existsSync(join(cwd, "src"));
      let defaultComponentsPath = hasSrc ? "src/components/ui" : (project.componentsPath || "components/ui");
      let componentsPath = defaultComponentsPath;

      function isValidHex(color: string): boolean {
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
      }

      let customColors: CustomThemeColors | null = null;
      if (options.primary) {
        themePreset = "custom";
        customColors = {
          primaryLight: options.primary,
          primaryDark: options.darkPrimary || options.primary,
          secondaryLight: options.secondary || "#F1F5F9",
          secondaryDark: options.darkSecondary || "#1E293B",
          accentLight: options.accent,
          accentDark: options.darkAccent,
        };
      } else if (options.theme && options.theme !== "default") {
        themePreset = options.theme;
      }

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

        if (options.theme === "default" && !options.primary) {
          themePreset = await select({
            message: "Choisir le thème de base :",
            choices: [
              { name: "Rashwright Blue (Default)", value: "default" },
              { name: "Emerald Mint (Nature & Fresh)", value: "emerald" },
              { name: "Violet Tech (Futuriste & Purple)", value: "violet" },
              { name: "Amber Luxury (Chaud & Gold)", value: "amber" },
              { name: "Rose Vibrant (Énergique & Pink)", value: "rose" },
              { name: "Slate Monochrome (Minimaliste & Épuré)", value: "slate" },
              { name: "Forest Green (Vert Naturel)", value: "green" },
              { name: "Crimson Red (Rouge Énergique)", value: "red" },
              { name: "Cyber Cyan (Tech Signature)", value: "cyan" },
              { name: "🎨 Custom (Personnalisé — définir vos propres couleurs)", value: "custom" },
            ],
          });
        }

        if (themePreset === "custom" && !customColors) {
          console.log();
          console.log(chalk.bold.magenta("  🎨 Assistant Thème Personnalisé"));
          console.log(chalk.dim("  Étape 1 : Couleurs obligatoires (format hexadécimal, ex: #2563EB)"));

          const primaryLight = await input({
            message: "Primary Color [Light mode] :",
            validate: (val) => (isValidHex(val) ? true : "Veuillez entrer un code hexadécimal valide (ex: #2563EB)"),
          });

          const primaryDark = await input({
            message: "Primary Color [Dark mode] :",
            validate: (val) => (isValidHex(val) ? true : "Veuillez entrer un code hexadécimal valide (ex: #3B82F6)"),
          });

          const secondaryLight = await input({
            message: "Secondary Color [Light mode] :",
            validate: (val) => (isValidHex(val) ? true : "Veuillez entrer un code hexadécimal valide (ex: #F1F5F9)"),
          });

          const secondaryDark = await input({
            message: "Secondary Color [Dark mode] :",
            validate: (val) => (isValidHex(val) ? true : "Veuillez entrer un code hexadécimal valide (ex: #1E293B)"),
          });

          console.log();
          console.log(chalk.dim("  Étape 2 : Couleurs facultatives (Appuyez sur Entrée pour la valeur par défaut)"));

          const accentLight = await input({
            message: `Accent Color [Light mode] (défaut: ${primaryLight}) :`,
            default: primaryLight,
          });

          const accentDark = await input({
            message: `Accent Color [Dark mode] (défaut: ${primaryDark}) :`,
            default: primaryDark,
          });

          const backgroundLight = await input({
            message: "Background Color [Light mode] (défaut: #F8FAFC) :",
            default: "#F8FAFC",
          });

          const backgroundDark = await input({
            message: "Background Color [Dark mode] (défaut: #0F172A) :",
            default: "#0F172A",
          });

          const cardLight = await input({
            message: "Card / Surface [Light mode] (défaut: #FFFFFF) :",
            default: "#FFFFFF",
          });

          const cardDark = await input({
            message: "Card / Surface [Dark mode] (défaut: #1E293B) :",
            default: "#1E293B",
          });

          customColors = {
            primaryLight,
            primaryDark,
            secondaryLight,
            secondaryDark,
            accentLight: isValidHex(accentLight) ? accentLight : primaryLight,
            accentDark: isValidHex(accentDark) ? accentDark : primaryDark,
            backgroundLight: isValidHex(backgroundLight) ? backgroundLight : "#F8FAFC",
            backgroundDark: isValidHex(backgroundDark) ? backgroundDark : "#0F172A",
            cardLight: isValidHex(cardLight) ? cardLight : "#FFFFFF",
            cardDark: isValidHex(cardDark) ? cardDark : "#1E293B",
          };
        }

        componentsPath = await input({
          message: "Chemin d'installation des composants UI :",
          default: defaultComponentsPath,
        });
      } else {
        glassEnabled = options.glass !== undefined ? options.glass : true;
        if (themePreset === "custom" && !customColors) {
          customColors = {
            primaryLight: options.primary || "#2563EB",
            primaryDark: options.darkPrimary || "#3B82F6",
            secondaryLight: options.secondary || "#F1F5F9",
            secondaryDark: options.darkSecondary || "#1E293B",
            accentLight: options.accent,
            accentDark: options.darkAccent,
          };
        }
      }

      // ── 4. Plan des dépendances ──────────────────────────────────────────
      const expoDepsToInstall = [
        ...CORE_EXPO_DEPS,
        ...(glassEnabled ? GLASS_EXTRA_DEPS : []),
      ];
      const npmDepsToInstall = [...CORE_NPM_DEPS];

      console.log();
      console.log(chalk.bold("  Configuration appliquée :"));
      console.log(chalk.dim(`  • Gestionnaire    : ${selectedPm}`));
      console.log(chalk.dim(`  • Dossier composants : ${componentsPath}`));
      console.log(chalk.dim(`  • Thème           : ${themePreset}`));
      console.log(chalk.dim(`  • Style           : ${glassEnabled ? "Liquid Glass" : "Default"}`));
      console.log(chalk.dim(`  • Dépendances Expo : ${expoDepsToInstall.join(", ")}`));
      console.log(chalk.dim(`  • Dépendances NPM  : ${npmDepsToInstall.join(", ")}`));
      console.log();

      if (options.dryRun) {
        console.log(chalk.yellow("  [dry-run] Aucune modification effectuée."));
        return;
      }

      // ── 5. Installer les dépendances Expo (1/2) + npm (2/2) ────────────────
      const installSpinner = ora(`Installation des dépendances Expo compatibles via ${selectedPm}...`).start();
      try {
        installExpoPackages(expoDepsToInstall, selectedPm, cwd, options.dryRun);
        installSpinner.succeed("Dépendances Expo installées");
      } catch (err) {
        installSpinner.fail("Échec de l'installation des dépendances Expo");
        console.error(err);
      }

      if (npmDepsToInstall.length > 0) {
        const npmInstallSpinner = ora(`Installation des dépendances NPM (zustand, ...) via ${selectedPm}...`).start();
        try {
          installNpmPackages(npmDepsToInstall, selectedPm, cwd, options.dryRun);
          npmInstallSpinner.succeed(`Dépendances NPM installées (${npmDepsToInstall.join(", ")})`);
        } catch (err) {
          npmInstallSpinner.fail("Échec installation dépendances NPM");
          console.error(err);
        }
      }

      // ── 6. Copier les fondations (Theme, Store, Context + Core UI text, view, liquid/*) ──────
      const foundationSpinner = ora("Mise en place des fondations Rashwright (tokens, thème, store, contexte + primitives UI)...").start();
      setupFoundations(SOURCE_ROOT, cwd, componentsPath, options.dryRun);
      foundationSpinner.succeed("Fondations du thème, store & primitives UI installées");

      if (themePreset === "custom" && customColors) {
        const customThemeSpinner = ora("Génération du thème personnalisé (theme/themes/custom.ts)...").start();
        generateCustomTheme(cwd, componentsPath, customColors, options.dryRun);
        customThemeSpinner.succeed("Thème personnalisé généré dans theme/themes/custom.ts");
      }

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

      // ── 8b. Mettre en place les Skills IA (Global + Starters) ────────────
      if (options.skills !== false) {
        const skillsSpinner = ora("Installation des Skills IA (skills/rs-ui/)...").start();
        copyGlobalSkill(SOURCE_ROOT, cwd, options.dryRun);
        for (const comp of installedStarterComps) {
          copyComponentSkill(comp, SOURCE_ROOT, cwd, options.dryRun);
        }
        skillsSpinner.succeed("Skills IA installés dans skills/rs-ui/ (Skill Global & starters)");
      }

      // ── 9. Générer l'écran de démo Rashwright UI Showcase ────────────────
      const shouldGenerateShowcase = options.showcase !== false;
      let showcaseFile: string | null = null;
      if (shouldGenerateShowcase) {
        const showcaseSpinner = ora("Génération de l'écran démo Rashwright UI Showcase...").start();
        showcaseFile = generateShowcaseScreen(cwd, componentsPath, themePreset, options.dryRun);
        showcaseSpinner.succeed(`Écran de démo configuré (${showcaseFile ? showcaseFile.replace(cwd, "") : "App"})`);
      }

      // ── 10. Enregistrer la configuration rashwright-ui.json ──────────────
      const componentsRecord: Record<string, string> = {};
      for (const comp of installedStarterComps) {
        componentsRecord[comp] = "1.0.0";
      }

      const existingConfig = readConfig(join(cwd, "rashwright-ui.json"));
      const config = mergeRashwrightConfigs(existingConfig, {
        componentsPath,
        theme: (glassEnabled ? "glass" : "default") as "glass" | "default",
        themePreset,
        ...(customColors ? { customColors: customColors as unknown as Record<string, string> } : {}),
        glass: glassEnabled,
        typescript: project.hasTypeScript,
        packageManager: selectedPm,
        starter: { installed: true, reset: false },
        components: componentsRecord,
      });
      writeConfig(join(cwd, "rashwright-ui.json"), config);

      // ── 10b. Enregistrer l'état initial dans rashwright-ui.lock ───────────
      for (const comp of installedStarterComps) {
        recordLockedComponent(
          cwd,
          comp,
          "0.3.0",
          [`${componentsPath}/${comp}.tsx`],
          [],
          [],
          options.dryRun
        );
      }

      // ── 11. Résumé & instructions ────────────────────────────────────────
      console.log();
      console.log(chalk.bold.green("  ✔ Rashwright UI Mobile est opérationnel !"));
      console.log();
      console.log(chalk.dim("  Éléments prêts :"));
      console.log(chalk.dim(`    ✔ ${componentsPath}/ (Bouton, Card, GlassCard, Badge, Input, Logo RS)`));
      console.log(chalk.dim(`    ✔ index.ts exportant les composants configurés`));
      console.log(chalk.dim(`    ✔ rashwright-ui.lock (Signatures SHA-256 et état réel)`));
      console.log(chalk.dim(`    ✔ Gest. de paquets : ${selectedPm}`));
      console.log(chalk.dim(`    ✔ theme/ (Tokens, presets Light/Dark/Glass)`));
      console.log(chalk.dim(`    ✔ contexts/theme-context.tsx & stores/theme-store.ts`));
      console.log(chalk.dim(`    ✔ assets/svg/primary.svg & assets/primary.png`));
      if (options.skills !== false) {
        console.log(chalk.dim(`    ✔ skills/rs-ui/ (Skill IA Global & documentation composants)`));
      }
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
