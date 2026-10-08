import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import { readConfig } from "../core/config-manager.js";
import { readCompatibilityMatrix } from "../core/expo-detector.js";
import { existsSync as fsExists, readFileSync } from "node:fs";
import { REGISTRY_ROOT } from "../core/paths.js";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { resolveRegistry, ensureCompatibilityMatrixDownloaded } from "../core/remote-registry.js";
import { diagnoseSkills } from "../core/skills-manager.js";

interface CheckResult {
  label: string;
  status: "ok" | "warn" | "error";
  detail?: string;
}

export function doctorCommand(): Command {
  const cmd = new Command("doctor");
  cmd
    .description("Diagnostiquer l'état de Rashwright UI dans le projet courant")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--json", "Sortie JSON")
    .action(async (options) => {
      const cwd = process.cwd();
      const checks: CheckResult[] = [];
      const resolved = await resolveRegistry({ registryUrl: options.registry });

      // ── Project checks ─────────────────────────────────────────────────
      const project = detectProject(cwd);
      checks.push({
        label: "package.json",
        status: project.hasPackageJson ? "ok" : "error",
        detail: project.hasPackageJson ? undefined : "Aucun package.json trouvé",
      });

      // ── Expo checks ────────────────────────────────────────────────────
      const expo = detectExpo(cwd);
      if (!expo.detected) {
        checks.push({ label: "Expo", status: "error", detail: "Expo non détecté" });
      } else if (!expo.isSupported) {
        checks.push({
          label: `Expo SDK ${expo.sdkVersion}`,
          status: "error",
          detail: `SDK ${expo.sdkVersion} non supporté. Minimum requis: SDK 54`,
        });
      } else {
        checks.push({ label: `Expo SDK ${expo.sdkVersion}`, status: "ok" });
      }

      // ── Package manager ────────────────────────────────────────────────
      checks.push({ label: `Package manager: ${project.packageManager}`, status: "ok" });

      // ── TypeScript ─────────────────────────────────────────────────────
      checks.push({
        label: "TypeScript",
        status: project.hasTypeScript ? "ok" : "warn",
        detail: project.hasTypeScript ? undefined : "tsconfig.json non trouvé (optionnel)",
      });

      // ── Rashwright config ──────────────────────────────────────────────
      const hasConfig = project.hasRashwrightConfig;
      checks.push({
        label: "rashwright-ui.json",
        status: hasConfig ? "ok" : "warn",
        detail: hasConfig ? undefined : "Non initialisé — exécutez: rs-ui init",
      });

      if (hasConfig) {
        const config = readConfig(project.rashwrightConfigPath);

        // ── Components path ──────────────────────────────────────────────
        const compPath = join(cwd, config.componentsPath);
        checks.push({
          label: `Dossier composants: ${config.componentsPath}`,
          status: fsExists(compPath) ? "ok" : "warn",
          detail: fsExists(compPath) ? undefined : "Dossier non créé",
        });

        // ── Installed components ─────────────────────────────────────────
        const compCount = Object.keys(config.components).length;
        checks.push({
          label: `Composants installés: ${compCount}`,
          status: compCount > 0 ? "ok" : "warn",
          detail: compCount === 0 ? "Aucun composant installé — exécutez: rs-ui add" : undefined,
        });

        // ── U-3 : Vérification des versions des composants installés (lockfile check)
        const outdated: string[] = [];
        for (const [name, val] of Object.entries(config.components)) {
          const installedVer = typeof val === "string" ? val : val.version;
          const regEntry = loadComponentEntry(name, resolved.registryRoot);
          if (regEntry && regEntry.version !== installedVer) {
            outdated.push(`${name} (v${installedVer} → v${regEntry.version})`);
          }
        }
        if (outdated.length > 0) {
          checks.push({
            label: "Mises à jour disponibles",
            status: "warn",
            detail: `${outdated.join(", ")} — exécutez: rs-ui update`,
          });
        }

        // ── Skills IA checks ─────────────────────────────────────────────
        const skillsDiag = diagnoseSkills(cwd, config.components);
        checks.push({
          label: "Skill IA Global (skills/rs-ui/SKILL.md)",
          status: skillsDiag.globalSkillInstalled ? "ok" : "warn",
          detail: skillsDiag.globalSkillInstalled ? undefined : "Non installé — exécutez: rs-ui init",
        });

        if (compCount > 0) {
          if (skillsDiag.missingSkills.length === 0 && skillsDiag.outdatedSkills.length === 0) {
            checks.push({
              label: `Skills IA Composants: ${skillsDiag.componentSkillsCount}/${compCount} synchronisés`,
              status: "ok",
            });
          } else {
            const issues: string[] = [];
            if (skillsDiag.missingSkills.length > 0) {
              issues.push(`Manquants: ${skillsDiag.missingSkills.join(", ")}`);
            }
            if (skillsDiag.outdatedSkills.length > 0) {
              issues.push(`Obsolètes: ${skillsDiag.outdatedSkills.map((o) => o.component).join(", ")}`);
            }
            checks.push({
              label: `Skills IA Composants: ${skillsDiag.componentSkillsCount}/${compCount}`,
              status: "warn",
              detail: issues.join(" | "),
            });
          }
        }

        // ── Key native deps ──────────────────────────────────────────────
        const pkgPath = join(cwd, "package.json");
        if (fsExists(pkgPath)) {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
          const allDeps: Record<string, string> = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
          if (expo.supportedVersion && resolved.isRemote) {
            await ensureCompatibilityMatrixDownloaded(expo.supportedVersion, {
              registryUrl: resolved.registryUrl,
              registryRoot: resolved.registryRoot,
            });
          }
          const matrix = expo.supportedVersion
            ? readCompatibilityMatrix(expo.supportedVersion, resolved.registryRoot)
            : null;

          const checkDep = (dep: string) => {
            if (dep in allDeps) {
              const installedVer = allDeps[dep];
              const expectedVer = matrix?.[dep];
              checks.push({
                label: dep,
                status: "ok",
                detail: `v${installedVer}${expectedVer ? ` (attendu: ${expectedVer})` : ""}`,
              });
            } else {
              checks.push({ label: dep, status: "warn", detail: "Non installé" });
            }
          };

          checkDep("react-native-reanimated");
          checkDep("react-native-gesture-handler");
          checkDep("react-native-safe-area-context");

          if (config.glass) {
            checkDep("expo-blur");
            checkDep("expo-linear-gradient");
          }
        }
      }

      // ── Output ─────────────────────────────────────────────────────────
      if (options.json) {
        console.log(JSON.stringify(checks, null, 2));
        return;
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui doctor"));
      console.log();

      for (const check of checks) {
        const icon =
          check.status === "ok"
            ? chalk.green("✔")
            : check.status === "warn"
            ? chalk.yellow("⚠")
            : chalk.red("✖");
        const label =
          check.status === "ok"
            ? chalk.white(check.label)
            : check.status === "warn"
            ? chalk.yellow(check.label)
            : chalk.red(check.label);
        const detail = check.detail ? chalk.dim(` — ${check.detail}`) : "";
        console.log(`  ${icon} ${label}${detail}`);
      }

      console.log();
      const errors = checks.filter((c) => c.status === "error").length;
      const warns = checks.filter((c) => c.status === "warn").length;
      if (errors === 0 && warns === 0) {
        console.log(chalk.green("  Tout est en ordre!"));
      } else {
        if (errors > 0) console.log(chalk.red(`  ${errors} erreur(s) à corriger.`));
        if (warns > 0) console.log(chalk.yellow(`  ${warns} avertissement(s).`));
      }
      console.log();
    });

  return cmd;
}
