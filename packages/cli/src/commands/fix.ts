import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { resolveRegistry } from "../core/remote-registry.js";
import { diagnoseSkills, copyGlobalSkill, copyComponentSkill } from "../core/skills-manager.js";
import { installExpoPackages } from "../core/package-manager.js";
import { generateNativeWindEnv } from "../core/nativewind-manager.js";

export interface FixAction {
  id: string;
  title: string;
  description: string;
  applied: boolean;
  error?: string;
}

export function fixCommand(): Command {
  const cmd = new Command("fix");
  cmd
    .description("Détecter et réparer automatiquement les problèmes d'environnement et de configuration")
    .option("-y, --yes", "Appliquer automatiquement toutes les réparations sans confirmation", false)
    .option("--dry-run", "Simuler les réparations sans modifier les fichiers", false)
    .option("--registry <url>", "URL du registre distant personnalisé")
    .option("--json", "Sortie au format JSON", false)
    .action(async (options: { yes: boolean; dryRun: boolean; registry?: string; json: boolean }) => {
      const cwd = process.cwd();
      const actions: FixAction[] = [];

      const resolved = await resolveRegistry({ registryUrl: options.registry });
      const project = detectProject(cwd);
      const expo = detectExpo(cwd);

      // ─────────────────────────────────────────────────────────────────────
      // 1. rashwright-ui.json manquant
      // ─────────────────────────────────────────────────────────────────────
      if (!project.hasRashwrightConfig) {
        const action: FixAction = {
          id: "config",
          title: "Initialisation de rashwright-ui.json",
          description: "Création du fichier de configuration standard Rashwright UI",
          applied: false,
        };
        if (!options.dryRun) {
          try {
            const initialCfg = readConfig(project.rashwrightConfigPath);
            writeConfig(project.rashwrightConfigPath, initialCfg);
            action.applied = true;
          } catch (err: unknown) {
            action.error = err instanceof Error ? err.message : String(err);
          }
        } else {
          action.applied = true;
        }
        actions.push(action);
      }

      // Recharger la configuration
      const config = project.hasRashwrightConfig || actions.find((a) => a.id === "config" && a.applied)
        ? readConfig(project.rashwrightConfigPath)
        : null;

      // ─────────────────────────────────────────────────────────────────────
      // 2. Dossier des composants manquant
      // ─────────────────────────────────────────────────────────────────────
      if (config) {
        const compDir = join(cwd, config.componentsPath);
        if (!existsSync(compDir)) {
          const action: FixAction = {
            id: "components-dir",
            title: `Création du dossier de composants (${config.componentsPath})`,
            description: `Dossier cible pour les composants UI : ${compDir}`,
            applied: false,
          };
          if (!options.dryRun) {
            try {
              mkdirSync(compDir, { recursive: true });
              action.applied = true;
            } catch (err: unknown) {
              action.error = err instanceof Error ? err.message : String(err);
            }
          } else {
            action.applied = true;
          }
          actions.push(action);
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 3. Plugin Reanimated dans babel.config.js
      // ─────────────────────────────────────────────────────────────────────
      const babelPath = join(cwd, "babel.config.js");
      if (existsSync(babelPath)) {
        try {
          const babelContent = readFileSync(babelPath, "utf-8");
          if (!babelContent.includes("react-native-reanimated/plugin")) {
            const action: FixAction = {
              id: "babel-reanimated",
              title: "Injection de react-native-reanimated/plugin dans babel.config.js",
              description: "Requis pour les animations Reanimated et les capsules fluides",
              applied: false,
            };

            if (!options.dryRun) {
              // Injection chirurgicale dans plugins: [...]
              let updatedBabel = babelContent;
              if (babelContent.includes("plugins:")) {
                updatedBabel = babelContent.replace(
                  /plugins:\s*\[([\s\S]*?)\]/,
                  (_match, p1) => {
                    const existing = p1.trim();
                    const insertion = existing.length > 0 ? `${existing},\n    "react-native-reanimated/plugin"` : '"react-native-reanimated/plugin"';
                    return `plugins: [\n    ${insertion}\n  ]`;
                  }
                );
              } else if (babelContent.includes("return {")) {
                updatedBabel = babelContent.replace(
                  "return {",
                  'return {\n    plugins: ["react-native-reanimated/plugin"],'
                );
              }

              writeFileSync(babelPath, updatedBabel, "utf-8");
              action.applied = true;
            } else {
              action.applied = true;
            }
            actions.push(action);
          }
        } catch {
          // Si lecture ou parsing échoue, on continue
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 4. Dépendances natives Expo manquantes
      // ─────────────────────────────────────────────────────────────────────
      const pkgPath = join(cwd, "package.json");
      if (existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
          const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
          const missingNativeDeps: string[] = [];

          const requiredCore = [
            "react-native-reanimated",
            "react-native-gesture-handler",
            "react-native-safe-area-context",
          ];

          if (config?.glass) {
            requiredCore.push("expo-blur", "expo-linear-gradient");
          }

          for (const dep of requiredCore) {
            if (!(dep in allDeps)) {
              missingNativeDeps.push(dep);
            }
          }

          if (missingNativeDeps.length > 0) {
            const action: FixAction = {
              id: "native-deps",
              title: `Installation des modules natifs Expo manquants (${missingNativeDeps.join(", ")})`,
              description: `Synchronisation des dépendances requises via ${project.packageManager}`,
              applied: false,
            };

            if (!options.dryRun) {
              try {
                installExpoPackages(missingNativeDeps, project.packageManager, cwd, false);
                action.applied = true;
              } catch (err: unknown) {
                action.error = err instanceof Error ? err.message : String(err);
              }
            } else {
              action.applied = true;
            }
            actions.push(action);
          }
        } catch {
          // Erreur lecture package.json
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 5. Skills IA (Global & Composants)
      // ─────────────────────────────────────────────────────────────────────
      if (config) {
        const skillsDiag = diagnoseSkills(cwd, config.components);

        if (!skillsDiag.globalSkillInstalled) {
          const action: FixAction = {
            id: "global-skill",
            title: "Installation du Skill IA Global (skills/rs-ui/SKILL.md)",
            description: "Permet aux IDEs IA (Cursor, Claude) de comprendre l'architecture Rashwright UI",
            applied: false,
          };
          if (!options.dryRun) {
            action.applied = copyGlobalSkill(resolved.registryRoot, cwd, false);
          } else {
            action.applied = true;
          }
          actions.push(action);
        }

        const missingOrOutdatedSkills = [
          ...skillsDiag.missingSkills,
          ...skillsDiag.outdatedSkills.map((o) => o.component),
        ];

        if (missingOrOutdatedSkills.length > 0) {
          const action: FixAction = {
            id: "component-skills",
            title: `Synchronisation des Skills IA (${missingOrOutdatedSkills.length} composant(s))`,
            description: `Mise à jour des fiches IA pour : ${missingOrOutdatedSkills.join(", ")}`,
            applied: false,
          };
          if (!options.dryRun) {
            let ok = true;
            for (const comp of missingOrOutdatedSkills) {
              const res = copyComponentSkill(comp, resolved.registryRoot, cwd, false);
              if (!res) ok = false;
            }
            action.applied = ok;
          } else {
            action.applied = true;
          }
          actions.push(action);
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 6. Typages ambiants CSS (NativeWind)
      // ─────────────────────────────────────────────────────────────────────
      if (config?.nativewind?.enabled) {
        const envFile = join(cwd, "nativewind-env.d.ts");
        const needsEnv = !existsSync(envFile) || !readFileSync(envFile, "utf-8").includes('declare module "*.css"');
        if (needsEnv) {
          const action: FixAction = {
            id: "nativewind-env",
            title: "Création/Mise à jour de nativewind-env.d.ts",
            description: "Ajout des déclarations ambiantes CSS et types NativeWind pour TypeScript",
            applied: false,
          };
          if (!options.dryRun) {
            try {
              const envContent = generateNativeWindEnv(config.nativewind.version ?? "v4");
              writeFileSync(envFile, envContent, "utf-8");
              action.applied = true;
            } catch (err: unknown) {
              action.error = err instanceof Error ? err.message : String(err);
            }
          } else {
            action.applied = true;
          }
          actions.push(action);
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 7. Avertissement npm + NativeWind v5 (--force bloque, --legacy-peer-deps requis)
      // ─────────────────────────────────────────────────────────────────────
      const isNativeWindV5 = config?.nativewind?.enabled && config?.nativewind?.version === "v5";
      if (isNativeWindV5 && project.packageManager === "npm") {
        const action: FixAction = {
          id: "npm-legacy-peer-deps",
          title: "Avertissement : npm + NativeWind v5 détecté",
          description:
            "NativeWind v5 requiert react>=19 et react-native>=0.81 comme peerDependencies. " +
            "Utilisez 'npm install --legacy-peer-deps' (jamais --force qui bloque indéfiniment). " +
            "Rashwright utilise automatiquement --legacy-peer-deps lors de l'init.",
          applied: true, // Informatif uniquement — pas d'action corrective nécessaire
        };
        actions.push(action);
      }

      // ─────────────────────────────────────────────────────────────────────
      // Résultat & Affichage
      // ─────────────────────────────────────────────────────────────────────
      if (options.json) {
        console.log(JSON.stringify({ dryRun: options.dryRun, total: actions.length, actions }, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui fix"));
      if (options.dryRun) {
        console.log(chalk.yellow("  ℹ Mode simulation (--dry-run) : aucune modification n'a été effectuée."));
      }
      console.log();

      if (actions.length === 0) {
        console.log(chalk.green("  ✔ Aucun problème détecté. Votre projet est parfaitement configuré !"));
        console.log();
        return;
      }

      for (const action of actions) {
        const icon = action.applied ? chalk.green("✔") : chalk.red("✖");
        const status = options.dryRun
          ? chalk.yellow("[à appliquer]")
          : action.applied
          ? chalk.green("[corrigé]")
          : chalk.red("[échec]");
        console.log(`  ${icon} ${chalk.bold(action.title)} ${status}`);
        console.log(`     ${chalk.dim(action.description)}`);
        if (action.error) {
          console.log(`     ${chalk.red("Erreur : " + action.error)}`);
        }
        console.log();
      }

      const countApplied = actions.filter((a) => a.applied).length;
      if (options.dryRun) {
        console.log(chalk.cyan(`  ${actions.length} correction(s) identifiée(s). Exécutez 'rs-ui fix' pour les appliquer.`));
      } else {
        console.log(chalk.green(`  ${countApplied}/${actions.length} problème(s) corrigé(s) avec succès !`));
      }
      console.log();
    });

  return cmd;
}
