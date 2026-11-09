import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { resolveRegistry, ensureComponentDownloaded, ensureFoundationDownloaded } from "../core/remote-registry.js";
import { detectProject } from "../core/project-detector.js";
import { readConfig, getInstalledVersion } from "../core/config-manager.js";
import {
  readLockfile,
  type FileIntegrityStatus,
  type LockedFile,
  type RashwrightLockfile,
} from "../core/lock-manager.js";
import { SKILL_FILENAME } from "../core/skills-manager.js";
import {
  parseArtefactRef,
  loadArtefact,
  checkArtefactIntegrity,
  type ArtefactManifest,
  type ArtefactRef,
} from "../core/artefacts.js";
import { checkImports, type ImportCheckIssue } from "../core/post-install-verifier.js";

interface LocalEntry {
  version: string;
  registryVersion?: string;
  files: LockedFile[];
  installPath?: string;
}

interface LocalInfo {
  isInstalled: boolean;
  installedVersion?: string;
  installedRegistryVersion?: string;
  integrityStatus: FileIntegrityStatus;
  modifiedFiles: string[];
  missingFiles: string[];
  files: string[];
  hasSkill: boolean;
  verification?: {
    checkedFiles: number;
    checkedImports: number;
    issues: ImportCheckIssue[];
  };
}

function displayRef(ref: ArtefactRef): string {
  return ref.type === "component" ? ref.id : `${ref.type}:${ref.id}`;
}

function readLocalEntry(
  lock: RashwrightLockfile | null,
  config: ReturnType<typeof readConfig>,
  ref: ArtefactRef,
): LocalEntry | null {
  switch (ref.type) {
    case "template": {
      const entry = lock?.templates?.[ref.id];
      return entry
        ? { version: entry.version, registryVersion: entry.registryVersion, files: entry.files, installPath: entry.installPath }
        : null;
    }
    case "widget": {
      const entry = lock?.widgets?.[ref.id];
      return entry
        ? { version: entry.version, registryVersion: entry.registryVersion, files: entry.files, installPath: entry.installPath }
        : null;
    }
    case "foundation": {
      const entry = lock?.foundations?.[ref.id];
      return entry
        ? { version: entry.version, registryVersion: entry.registryVersion, files: entry.files }
        : null;
    }
    case "component":
    case "hook":
    case "lib":
    default: {
      const entry = lock?.components?.[ref.id];
      if (entry) {
        return { version: entry.version, registryVersion: entry.registryVersion, files: entry.files };
      }
      const fromConfig = getInstalledVersion(config, ref.id);
      const raw = config.components?.[ref.id];
      return fromConfig
        ? {
            version: fromConfig,
            registryVersion:
              raw && typeof raw !== "string" ? raw.registryVersion : undefined,
            files: [],
          }
        : null;
    }
  }
}

function hasSkill(cwd: string, ref: ArtefactRef): boolean {
  if (ref.type === "component") {
    return existsSync(join(cwd, "skills", "rs-ui", ref.id, SKILL_FILENAME));
  }
  if (ref.type === "widget") {
    const clean = ref.id.replace(/-widget$/, "");
    return [
      join(cwd, "skills", "rs-ui", "widgets", clean, SKILL_FILENAME),
      join(cwd, "skills", "rs-ui", clean, SKILL_FILENAME),
    ].some((path) => existsSync(path));
  }
  return existsSync(join(cwd, "skills", "rs-ui", ref.id, SKILL_FILENAME));
}

function relativeFiles(cwd: string, entry: LocalEntry | null): string[] {
  void cwd;
  return (entry?.files ?? []).map((file) => file.path.replace(/\\/g, "/"));
}

export function infoCommand(): Command {
  const cmd = new Command("info");
  cmd
    .description("Afficher les détails et l'état 360° d'un artefact (local + registre)")
    .argument("<component>", "Artefact (ex: button, foundation:theme, template:auth, widget:metric)")
    .option("--registry <url>", "URL du registre distant (ex: https://unpkg.com/@rashwright/ui-mobile@latest)")
    .option("--fresh", "Forcer le rafraîchissement du registre distant sans utiliser le cache")
    .option("-p, --preview", "Afficher un aperçu et un exemple de code TSX d'utilisation", false)
    .option("--json", "Sortie JSON")
    .action(async (name: string, options: { registry?: string; fresh?: boolean; preview?: boolean; json?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      const resolved = await resolveRegistry({
        registryUrl: options.registry,
        fresh: options.fresh,
      });

      const parsed = parseArtefactRef(name);
      let ref: ArtefactRef = parsed;
      let manifest: ArtefactManifest | null = loadArtefact(ref, {
        registryRoot: resolved.registryRoot,
      });

      // Un nom sans préfixe peut être un hook/lib : on le résout sans deviner.
      if (!manifest && parsed.type === "component") {
        for (const candidate of ["hook", "lib"] as const) {
          const candidateRef: ArtefactRef = { type: candidate, id: parsed.id };
          const candidateManifest = loadArtefact(candidateRef, {
            registryRoot: resolved.registryRoot,
          });
          if (candidateManifest) {
            ref = candidateRef;
            manifest = candidateManifest;
            break;
          }
        }
      }

      if (!manifest && resolved.isRemote) {
        try {
          if (ref.type === "component" || ref.type === "hook" || ref.type === "lib") {
            await ensureComponentDownloaded(ref.id, {
              registryUrl: resolved.registryUrl,
              registryRoot: resolved.registryRoot,
              sourceRoot: resolved.sourceRoot,
            });
          } else if (ref.type === "foundation") {
            await ensureFoundationDownloaded(ref.id, {
              registryUrl: resolved.registryUrl,
              registryRoot: resolved.registryRoot,
              sourceRoot: resolved.sourceRoot,
            });
          }
          manifest = loadArtefact(ref, { registryRoot: resolved.registryRoot });
        } catch (error) {
          console.log(chalk.red(`  ✖ ${(error as Error).message}`));
          process.exit(1);
        }
      }

      if (!manifest) {
        console.log(chalk.red(`  ✖ Artefact "${displayRef(ref)}" introuvable dans le registre.`));
        console.log(chalk.dim("    Exécutez 'rs-ui list' pour voir tous les composants disponibles."));
        process.exit(1);
      }

      // ── État local ─────────────────────────────────────────────────────
      let localInfo: LocalInfo | null = null;

      if (project.hasRashwrightConfig) {
        const config = readConfig(project.rashwrightConfigPath);
        const lock = readLockfile(cwd);
        const entry = readLocalEntry(lock, config, ref);
        const integrity = checkArtefactIntegrity(cwd, ref);
        const files = relativeFiles(cwd, entry);
        const fileExists = files.some((file) => existsSync(join(cwd, file)));

        const verificationFiles = files
          .map((file) => join(cwd, file))
          .filter((file) => existsSync(file));
        const verification =
          project.hasTypeScript && verificationFiles.length > 0
            ? checkImports(cwd, verificationFiles)
            : undefined;

        localInfo = {
          isInstalled: Boolean(entry || fileExists),
          installedVersion: entry?.version,
          installedRegistryVersion: entry?.registryVersion,
          integrityStatus: integrity.status,
          modifiedFiles: integrity.modifiedFiles,
          missingFiles: integrity.missingFiles,
          files,
          hasSkill: hasSkill(cwd, ref),
          verification,
        };
      }

      if (options.json) {
        console.log(
          JSON.stringify({ manifest, local: localInfo }, null, 2),
        );
        return;
      }

      console.log();
      console.log(
        chalk.bold.cyan(`  ${manifest.name}`) +
          chalk.dim(` (${displayRef(ref)} v${manifest.version}) — Inspecteur 360°`),
      );
      if (manifest.description) {
        console.log(chalk.dim(`  ${manifest.description}`));
      }
      console.log();

      // ── Versions ───────────────────────────────────────────────────────
      console.log(chalk.bold("  Versions :"));
      console.log(
        chalk.dim(
          `    • Registre    : v${manifest.version}` +
            (manifest.registryVersion ? ` (registre ${manifest.registryVersion})` : ""),
        ),
      );
      if (localInfo) {
        if (localInfo.isInstalled) {
          const verStr = localInfo.installedVersion
            ? `v${localInfo.installedVersion}`
            : "inconnue";
          const registryChanged =
            Boolean(manifest.registryVersion) &&
            manifest.registryVersion !== localInfo.installedRegistryVersion;
          const upToDate =
            localInfo.installedVersion === manifest.version && !registryChanged;
          const statusTag = upToDate
            ? chalk.green(" (à jour)")
            : chalk.yellow(` (mise à jour dispo: v${manifest.version})`);
          console.log(
            chalk.dim(
              `    • Locale      : ${verStr}` +
                (localInfo.installedRegistryVersion
                  ? ` (registre ${localInfo.installedRegistryVersion})`
                  : "") +
                statusTag,
            ),
          );
        } else {
          console.log(chalk.dim(`    • Locale      : Non installé`));
        }
      }
      console.log();

      // ── Intégrité (hash) et vérification fonctionnelle ────────────────
      if (localInfo && localInfo.isInstalled) {
        console.log(chalk.bold("  État local :"));

        if (localInfo.files.length > 0) {
          console.log(chalk.dim(`    • Fichiers    : ${localInfo.files.length}`));
          for (const file of localInfo.files) {
            const exists = existsSync(join(cwd, file));
            console.log(
              chalk.dim(`        ${exists ? "✔" : "✖"} ${file}`),
            );
          }
        }

        const importIssues = localInfo.verification?.issues.length ?? 0;
        let intMsg = chalk.dim("Non suivi par le lockfile");
        if (localInfo.integrityStatus === "clean") {
          // Un hash identique ne prouve pas que l'installation fonctionne :
          // si un import est non résolu, on ne peut pas afficher « Intact ».
          intMsg =
            importIssues > 0
              ? chalk.yellow(
                  `⚠ Hash intact, mais ${importIssues} import(s) non résolu(s)`,
                )
              : chalk.green("✔ Intact (identique à la source enregistrée)");
        } else if (localInfo.integrityStatus === "modified") {
          intMsg = chalk.yellow(
            `⚠ Modifié localement [${localInfo.modifiedFiles.join(", ")}]`,
          );
        } else if (localInfo.integrityStatus === "missing") {
          intMsg = chalk.red(
            `✖ Fichier(s) manquant(s) [${localInfo.missingFiles.join(", ")}]`,
          );
        }
        console.log(chalk.dim(`    • Intégrité   : `) + intMsg);
        console.log(
          chalk.dim(`    • Skill IA    : `) +
            (localInfo.hasSkill ? chalk.green("✔ Installé") : chalk.dim("Non installé")),
        );

        if (localInfo.verification) {
          const { checkedFiles, checkedImports, issues } = localInfo.verification;
          if (issues.length > 0) {
            console.log(
              chalk.dim(
                `    • Imports     : `,
              ) +
                chalk.red(
                  `${issues.length} problème(s) sur ${checkedImports} import(s) (${checkedFiles} fichier(s))`,
                ),
            );
            for (const issue of issues.slice(0, 10)) {
              console.log(chalk.red(`        ${issue.message}`));
            }
          } else {
            console.log(
              chalk.dim(`    • Imports     : `) +
                chalk.green(
                  `✔ ${checkedImports} import(s) résolus (${checkedFiles} fichier(s))`,
                ),
            );
          }
        }
        console.log();
      }

      // ── Dépendances déclarées ──────────────────────────────────────────
      if (manifest.dependencies.length > 0) {
        console.log(chalk.bold("  Dépendances npm :"));
        manifest.dependencies.forEach((d) => console.log(chalk.dim(`    • ${d}`)));
        console.log();
      }

      if (manifest.expoDependencies.length > 0) {
        console.log(chalk.bold("  Dépendances Expo :"));
        manifest.expoDependencies.forEach((d) => console.log(chalk.dim(`    • ${d}`)));
        console.log();
      }

      if (manifest.optionalExpoDependencies.length > 0) {
        console.log(chalk.bold("  Dépendances optionnelles :"));
        manifest.optionalExpoDependencies.forEach((d) =>
          console.log(chalk.dim(`    • ${d} (optionnel)`)),
        );
        console.log();
      }

      if (manifest.requiresComponents.length > 0) {
        console.log(chalk.bold("  Composants requis :"));
        manifest.requiresComponents.forEach((c) => console.log(chalk.dim(`    • ${c}`)));
        console.log();
      }

      if (manifest.requiresFoundations.length > 0) {
        console.log(chalk.bold("  Fondations requises :"));
        manifest.requiresFoundations.forEach((f) => console.log(chalk.dim(`    • ${f}`)));
        console.log();
      }

      // ── Option -p, --preview : Aperçu ASCII / Code TSX ────────────────
      if (options.preview) {
        console.log(chalk.bold.cyan("  ┌─ Aperçu du code TSX d'exemple ──────────────────────────────┐"));
        const skillPath = join(resolved.sourceRoot, "skills", manifest.id, SKILL_FILENAME);
        let snippet = "";
        if (existsSync(skillPath)) {
          const skillContent = readFileSync(skillPath, "utf-8");
          const codeMatch = skillContent.match(/```tsx?\r?\n([\s\S]*?)\r?\n```/);
          if (codeMatch?.[1]) {
            snippet = codeMatch[1].trim();
          }
        }

        if (!snippet) {
          const componentName = manifest.id
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join("");
          snippet = `import { ${componentName} } from "@/components/ui/${manifest.id}";\n\n// Usage canonique\n<${componentName} />`;
        }

        const lines = snippet.split("\n");
        for (const line of lines) {
          console.log(chalk.dim("  │ ") + chalk.white(line));
        }
        console.log(chalk.bold.cyan("  └─────────────────────────────────────────────────────────────┘"));
        console.log();
      }
    });

  return cmd;
}
