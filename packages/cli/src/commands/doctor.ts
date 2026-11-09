import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { detectProject } from "../core/project-detector.js";
import { detectExpo } from "../core/expo-detector.js";
import {
  LATEST_SUPPORTED_SDK,
  SUPPORTED_SDK_VERSIONS,
} from "../core/sdk-versions.js";
import {
  readConfig,
} from "../core/config-manager.js";
import { readCompatibilityMatrix } from "../core/expo-detector.js";
import { existsSync as fsExists, readFileSync } from "node:fs";
import { loadComponentEntry } from "../core/dependency-resolver.js";
import { resolveRegistry, ensureCompatibilityMatrixDownloaded } from "../core/remote-registry.js";
import { diagnoseSkills } from "../core/skills-manager.js";
import { readLockfile } from "../core/lock-manager.js";
import {
  getInstalledArtefacts,
  loadArtefact,
  type InstalledArtefact,
} from "../core/artefacts.js";
import { checkImports } from "../core/post-install-verifier.js";

interface CheckResult {
  label: string;
  status: "ok" | "warn" | "error";
  detail?: string;
}

function describeArtefact(artefact: InstalledArtefact): string {
  return artefact.type === "component"
    ? artefact.id
    : `${artefact.type}:${artefact.id}`;
}

function readPackageDependencies(cwd: string): Record<string, string> | null {
  const pkgPath = join(cwd, "package.json");
  if (!fsExists(pkgPath)) return null;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
      ...(pkg.peerDependencies ?? {}),
      ...(pkg.optionalDependencies ?? {}),
    };
  } catch {
    return null;
  }
}

function describeVersionStatus(
  installed: InstalledArtefact,
  registryRoot: string,
): string | null {
  const manifest = loadArtefact(
    { type: installed.type, id: installed.id },
    { registryRoot },
  );
  if (!manifest) return null;

  const registryChanged =
    Boolean(manifest.registryVersion) &&
    manifest.registryVersion !== installed.registryVersion;
  if (manifest.version !== installed.version) {
    return `${describeArtefact(installed)} (v${installed.version} → v${manifest.version})`;
  }
  if (registryChanged) {
    return `${describeArtefact(installed)} (registre ${installed.registryVersion ?? "?"} → ${manifest.registryVersion})`;
  }
  return null;
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
          detail: `SDK ${expo.sdkVersion} non supporté. Versions supportées : ${SUPPORTED_SDK_VERSIONS[0]}–${LATEST_SUPPORTED_SDK}.`,
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

      if (!hasConfig) {
        return finish(checks, options.json);
      }

      const config = readConfig(project.rashwrightConfigPath);

      // ── Components path ────────────────────────────────────────────────
      const compPath = join(cwd, config.componentsPath);
      checks.push({
        label: `Dossier composants: ${config.componentsPath}`,
        status: fsExists(compPath) ? "ok" : "warn",
        detail: fsExists(compPath) ? undefined : "Dossier non créé",
      });

      // ── Lockfile (source de vérité) ────────────────────────────────────
      const lock = readLockfile(cwd);
      const lockEntries = lock
        ? Object.keys(lock.components ?? {}).length +
          Object.keys(lock.foundations ?? {}).length +
          Object.keys(lock.templates ?? {}).length +
          Object.keys(lock.widgets ?? {}).length
        : 0;

      if (!lock) {
        const configured = Object.keys(config.components ?? {}).length;
        checks.push({
          label: "rashwright-ui.lock",
          status: configured > 0 ? "error" : "warn",
          detail:
            configured > 0
              ? "Lockfile absent alors que des composants sont déclarés installés : l'intégrité ne peut pas être vérifiée."
              : "Lockfile absent — aucune installation à vérifier.",
        });
      } else {
        checks.push({
          label: "rashwright-ui.lock",
          status: "ok",
          detail: `${lockEntries} artefact(s) verrouillé(s)`,
        });
      }

      // ── Artefacts réellement installés (lockfile) ──────────────────────
      const installed = getInstalledArtefacts(cwd, {
        registryRoot: resolved.registryRoot,
      });

      const clean: string[] = [];
      const modified: string[] = [];
      const missing: string[] = [];
      const untracked: string[] = [];

      for (const artefact of installed) {
        const label = describeArtefact(artefact);
        switch (artefact.integrity.status) {
          case "clean":
            clean.push(label);
            break;
          case "modified":
            modified.push(`${label} [${artefact.integrity.modifiedFiles.join(", ")}]`);
            break;
          case "missing":
            missing.push(`${label} [${artefact.integrity.missingFiles.join(", ")}]`);
            break;
          case "untracked":
            untracked.push(label);
            break;
        }
      }

      // Composants déclarés dans la config mais absents du lockfile.
      const lockComponentNames = new Set(Object.keys(lock?.components ?? {}));
      for (const name of Object.keys(config.components ?? {})) {
        if (!lockComponentNames.has(name) && !untracked.includes(name)) {
          untracked.push(`${name} (config sans lockfile)`);
        }
      }

      checks.push({
        label: `Artefacts installés: ${installed.length}`,
        status: installed.length > 0 ? "ok" : "warn",
        detail:
          installed.length === 0
            ? "Aucun artefact verrouillé — exécutez: rs-ui add"
            : undefined,
      });

      if (clean.length > 0) {
        checks.push({
          label: `Intégrité: ${clean.length} artefact(s) intacts`,
          status: "ok",
        });
      }
      if (modified.length > 0) {
        checks.push({
          label: `Intégrité: ${modified.length} artefact(s) modifié(s) localement`,
          status: "warn",
          detail: modified.join(" | "),
        });
      }
      if (missing.length > 0) {
        checks.push({
          label: `Intégrité: ${missing.length} artefact(s) avec fichiers manquants`,
          status: "error",
          detail: missing.join(" | "),
        });
      }
      if (untracked.length > 0) {
        checks.push({
          label: `Intégrité: ${untracked.length} artefact(s) non suivi(s) par le lockfile`,
          status: "error",
          detail: `${untracked.join(" | ")} — exécutez: rs-ui add <artefact> --repair`,
        });
      }

      // ── Mises à jour disponibles ───────────────────────────────────────
      const outdated: string[] = [];
      for (const artefact of installed) {
        const status = describeVersionStatus(artefact, resolved.registryRoot);
        if (status) outdated.push(status);
      }
      // Composants historiques sans lockfile : comparés via la config.
      for (const [name, value] of Object.entries(config.components ?? {})) {
        if (lockComponentNames.has(name)) continue;
        const installedVersion = typeof value === "string" ? value : value.version;
        const entry = loadComponentEntry(name, resolved.registryRoot);
        if (entry && entry.version !== installedVersion) {
          outdated.push(`${name} (v${installedVersion} → v${entry.version})`);
        }
      }
      if (outdated.length > 0) {
        checks.push({
          label: "Mises à jour disponibles",
          status: "warn",
          detail: `${outdated.join(", ")} — exécutez: rs-ui update`,
        });
      }

      // ── Skills IA checks ───────────────────────────────────────────────
      const skillsDiag = diagnoseSkills(cwd, config.components);
      checks.push({
        label: "Skill IA Global (skills/rs-ui/SKILL.md)",
        status: skillsDiag.globalSkillInstalled ? "ok" : "warn",
        detail: skillsDiag.globalSkillInstalled ? undefined : "Non installé — exécutez: rs-ui init",
      });

      const compCount = Object.keys(config.components).length;
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

      // ── Dépendances Expo réellement requises ───────────────────────────
      const allDeps = readPackageDependencies(cwd);
      const requiredExpo = new Set<string>();
      const requiredNpm = new Set<string>();
      for (const artefact of installed) {
        const manifest = loadArtefact(
          { type: artefact.type, id: artefact.id },
          { registryRoot: resolved.registryRoot },
        );
        if (!manifest) continue;
        for (const dep of manifest.expoDependencies) requiredExpo.add(dep);
        for (const dep of manifest.dependencies) requiredNpm.add(dep);
      }
      // Dépendances de base toujours nécessaires au runtime UI.
      for (const dep of [
        "react-native-reanimated",
        "react-native-gesture-handler",
        "react-native-safe-area-context",
      ]) {
        requiredNpm.add(dep);
      }
      if (config.glass) {
        requiredExpo.add("expo-blur");
        requiredExpo.add("expo-linear-gradient");
      }

      let matrixAvailable = true;
      if (expo.supportedVersion && resolved.isRemote) {
        matrixAvailable = await ensureCompatibilityMatrixDownloaded(expo.supportedVersion, {
          registryUrl: resolved.registryUrl,
          registryRoot: resolved.registryRoot,
        });
      }
      const matrix = expo.supportedVersion
        ? readCompatibilityMatrix(expo.supportedVersion, resolved.registryRoot)
        : null;
      if (expo.supportedVersion && (!matrixAvailable || !matrix)) {
        checks.push({
          label: `Matrice Expo SDK ${expo.supportedVersion}`,
          status: "warn",
          detail: "Indisponible — les versions natives ne peuvent pas être vérifiées.",
        });
      }

      if (allDeps) {
        const missingDeps: string[] = [];
        for (const dep of [...requiredNpm, ...requiredExpo].sort()) {
          if (!(dep in allDeps)) {
            missingDeps.push(dep);
          }
        }
        if (missingDeps.length > 0) {
          checks.push({
            label: `Dépendances requises: ${missingDeps.length} manquante(s)`,
            status: "error",
            detail: `${missingDeps.join(", ")} — exécutez: rs-ui add --repair ou installez-les`,
          });
        } else {
          checks.push({
            label: `Dépendances requises: ${requiredNpm.size + requiredExpo.size} présentes`,
            status: "ok",
          });
        }

        // Versions natives vs matrice SDK.
        const nativeMismatches: string[] = [];
        if (matrix) {
          for (const dep of requiredNpm) {
            if (!(dep in allDeps)) continue;
            const expected = matrix[dep];
            const actual = allDeps[dep];
            if (!expected) continue;
            const normalize = (v: string): string => v.replace(/^[\^~>=\s]+/, "");
            if (normalize(actual) !== normalize(expected)) {
              nativeMismatches.push(`${dep}: ${actual} (attendu ${expected})`);
            }
          }
        }
        if (nativeMismatches.length > 0) {
          checks.push({
            label: `Versions natives: ${nativeMismatches.length} écart(s) avec la matrice SDK`,
            status: "warn",
            detail: nativeMismatches.join(" | "),
          });
        }
      }

      // ── Résolution réelle des imports installés ────────────────────────
      if (project.hasTypeScript) {
        const installedFiles = installed.flatMap((artefact) =>
          artefact.files.map((file) => join(cwd, file.path.replace(/\\/g, "/"))),
        );
        if (installedFiles.length > 0) {
          const importCheck = checkImports(cwd, installedFiles);
          if (importCheck.issues.length > 0) {
            checks.push({
              label: `Imports: ${importCheck.issues.length} problème(s) sur ${importCheck.checkedImports} import(s)`,
              status: "error",
              detail: importCheck.issues
                .slice(0, 10)
                .map((issue) => issue.message)
                .join(" | "),
            });
          } else {
            checks.push({
              label: `Imports: ${importCheck.checkedImports} import(s) résolus`,
              status: "ok",
            });
          }
        }
      }

      return finish(checks, options.json);
    });

  return cmd;
}

function finish(checks: CheckResult[], json?: boolean): void {
  const errorCount = checks.filter((check) => check.status === "error").length;
  if (errorCount > 0) {
    // `doctor` est un diagnostic : toute erreur doit être visible dans le
    // code de sortie, y compris en mode --json (CI/scripts).
    process.exitCode = 1;
  }

  if (json) {
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
}
