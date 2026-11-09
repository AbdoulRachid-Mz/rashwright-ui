/**
 * foundations-manager.ts — Installation des fondations internes du registre.
 *
 * Les fondations (`registry/foundations/*.json`) ne sont pas de simples
 * composants : leurs fichiers vivent à plusieurs endroits du projet cible
 * (`components/ui`, `constants`, `theme`, `hooks`, `lib`, `contexts`...).
 *
 * Ce module :
 *   - calcule la destination réelle de chaque fichier ;
 *   - compare le contenu attendu (imports transformés, assets réécrits) au
 *     contenu installé ;
 *   - expose un état explicite : `missing`, `partial`, `modified`, `installed` ;
 *   - ne détruit jamais un fichier modifié sans `overwrite` (--force/--repair) ;
 *   - échoue explicitement si une source ou un asset est introuvable.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import type {
  FoundationRegistryEntry,
  ResolvedFoundation,
} from "./dependency-resolver.js";
import {
  copyAssetFiles,
  isAssetFilePath,
  rewriteAssetRequires,
  type FileCopyResult,
} from "./file-manager.js";
import {
  transformImports,
  type TransformImportOptions,
} from "./transformers/import-transformer.js";

export type FoundationState = "missing" | "partial" | "modified" | "installed" | "invalid";

export type FoundationFileStatus = "missing" | "modified" | "installed" | "error";

export interface FoundationFilePlan {
  foundation: string;
  source: string;
  destination: string;
  /** Chemin POSIX relatif à la racine du projet cible. */
  relativePath: string;
  status: FoundationFileStatus;
  reason?: string;
  /** Contenu attendu après transformations (jamais écrit tel quel par le CLI). */
  expected?: string | Buffer;
}

export interface FoundationPlan {
  name: string;
  entry: FoundationRegistryEntry;
  state: FoundationState;
  files: FoundationFilePlan[];
  /** Assets déclarés par la fondation, relatifs à la racine source. */
  assets: string[];
  errors: string[];
}

export interface FoundationPlanOptions {
  projectRoot: string;
  componentsPath: string;
  /** Transformation des alias d'imports (`@/` → alias projet). */
  importTransform?: TransformImportOptions;
  /** Assets déclarés explicitement (par défaut ceux du manifeste). */
  declaredAssets?: string[];
}

export interface FoundationFileResult {
  foundation: string;
  source: string;
  destination: string;
  relativePath: string;
  status: "written" | "unchanged" | "modified" | "failed";
  reason?: string;
}

export interface FoundationInstallResult {
  name: string;
  entry: FoundationRegistryEntry;
  state: FoundationState;
  files: FoundationFileResult[];
  assets: FileCopyResult[];
  writtenFiles: string[];
  modifiedFiles: string[];
  missingFiles: string[];
  errors: string[];
  /** Vrai si des fichiers modifiés doivent être réparés avec --repair/--force. */
  needsRepair: boolean;
}

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function relativePosix(from: string, to: string): string {
  return toPosix(relative(from, to));
}

/** Le projet range-t-il ses modules dans `src/` ? */
export function projectUsesSrc(projectRoot: string, componentsPath: string): boolean {
  return (
    toPosix(componentsPath).startsWith("src/") ||
    existsSync(join(projectRoot, "src"))
  );
}

/**
 * Destination d'un fichier de fondation.
 *
 *   - `components/ui/*` → `<componentsPath>/*` (le dossier UI du projet)
 *   - `assets/*`         → `<projectRoot>/assets/*` (assets partagés à la racine)
 *   - tout le reste      → `<projectRoot>[/src]/<chemin source>`
 */
export function resolveFoundationDestination(
  file: string,
  projectRoot: string,
  componentsPath: string,
): string {
  const rel = toPosix(file);
  if (rel.startsWith("components/ui/")) {
    return join(projectRoot, componentsPath, rel.slice("components/ui/".length));
  }
  if (rel.startsWith("assets/")) {
    return join(projectRoot, rel);
  }
  const basePrefix = projectUsesSrc(projectRoot, componentsPath) ? "src" : "";
  return join(projectRoot, basePrefix, rel);
}

function isTextFile(file: string): boolean {
  return /\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|txt|css)$/i.test(file);
}

function contentsEqual(expected: string | Buffer, actual: string | Buffer): boolean {
  if (typeof expected === "string" && typeof actual === "string") {
    return expected === actual;
  }
  if (Buffer.isBuffer(expected) && Buffer.isBuffer(actual)) {
    return expected.equals(actual);
  }
  return false;
}

function readExpectedContent(
  source: string,
  destination: string,
  sourceRoot: string,
  projectRoot: string,
  importTransform: TransformImportOptions | undefined,
  declaredAssets: string[],
): { content: string | Buffer; unresolved: string[] } {
  const raw = readFileSync(source);
  if (!isTextFile(source)) {
    return { content: raw, unresolved: [] };
  }

  let content = raw.toString("utf-8");
  if (importTransform) {
    content = transformImports(content, importTransform);
  }

  const rewrite = rewriteAssetRequires(content, {
    sourceRoot,
    sourceFile: source,
    destinationFile: destination,
    projectRoot,
    declaredAssets,
  });

  return { content: rewrite.content, unresolved: rewrite.unresolved };
}

function computeState(files: FoundationFilePlan[], errors: string[]): FoundationState {
  if (errors.length > 0) return "invalid";
  if (files.length === 0) return "invalid";

  const missing = files.filter((file) => file.status === "missing").length;
  const present = files.length - missing;
  const modified = files.filter((file) => file.status === "modified").length;

  if (missing === files.length) return "missing";
  if (missing > 0 && present > 0) return "partial";
  if (modified > 0) return "modified";
  return "installed";
}

/**
 * Calcule le plan d'installation d'une fondation sans rien écrire.
 * Une source manquante ou un `require()` d'asset non résolu est une erreur
 * fatale : l'appelant doit refuser d'installer un plan invalide.
 */
export function planFoundation(
  foundation: ResolvedFoundation,
  sourceRoot: string,
  options: FoundationPlanOptions,
): FoundationPlan {
  const entry = foundation.entry;
  const declaredAssets =
    options.declaredAssets ?? (Array.isArray(entry.assets) ? entry.assets : []);

  const files: FoundationFilePlan[] = [];
  const errors: string[] = [];

  for (const file of entry.files) {
    const normalized = toPosix(file);
    const source = join(sourceRoot, normalized);
    const destination = resolveFoundationDestination(
      normalized,
      options.projectRoot,
      options.componentsPath,
    );
    const relativePath = relativePosix(options.projectRoot, destination);

    if (!existsSync(source) || !statSync(source).isFile()) {
      files.push({
        foundation: foundation.name,
        source,
        destination,
        relativePath,
        status: "error",
        reason: "fichier source introuvable",
      });
      errors.push(`${foundation.name}: fichier source introuvable → ${normalized}`);
      continue;
    }

    const expected = readExpectedContent(
      source,
      destination,
      sourceRoot,
      options.projectRoot,
      options.importTransform,
      declaredAssets,
    );

    if (expected.unresolved.length > 0) {
      files.push({
        foundation: foundation.name,
        source,
        destination,
        relativePath,
        status: "error",
        reason: `asset(s) non résolu(s): ${expected.unresolved.join(", ")}`,
      });
      errors.push(
        `${foundation.name}: asset(s) non résolu(s) dans ${normalized} → ${expected.unresolved.join(", ")}`,
      );
      continue;
    }

    if (!existsSync(destination)) {
      files.push({
        foundation: foundation.name,
        source,
        destination,
        relativePath,
        status: "missing",
        expected: expected.content,
      });
      continue;
    }

    const actual = isTextFile(destination)
      ? readFileSync(destination, "utf-8")
      : readFileSync(destination);
    files.push({
      foundation: foundation.name,
      source,
      destination,
      relativePath,
      status: contentsEqual(expected.content, actual) ? "installed" : "modified",
      expected: expected.content,
    });
  }

  // Les assets déclarés doivent exister : une fondation incomplète ne doit pas
  // être présentée comme installée.
  for (const asset of declaredAssets) {
    const assetSource = join(sourceRoot, toPosix(asset));
    if (!existsSync(assetSource) || !statSync(assetSource).isFile()) {
      errors.push(`${foundation.name}: asset déclaré introuvable → ${asset}`);
    }
  }

  return {
    name: foundation.name,
    entry,
    state: computeState(files, errors),
    files,
    assets: declaredAssets,
    errors,
  };
}

export function planFoundations(
  foundations: ResolvedFoundation[],
  sourceRoot: string,
  options: FoundationPlanOptions,
): FoundationPlan[] {
  return foundations.map((foundation) => planFoundation(foundation, sourceRoot, options));
}

function ensureParent(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/**
 * Applique un plan. `overwrite` (--force/--repair) est le seul moyen d'écraser
 * un fichier modifié localement. Les fichiers absents sont toujours installés.
 */
export function applyFoundationPlan(
  plan: FoundationPlan,
  options: { overwrite?: boolean; dryRun?: boolean } = {},
): FoundationInstallResult {
  const overwrite = Boolean(options.overwrite);
  const dryRun = Boolean(options.dryRun);

  const files: FoundationFileResult[] = [];
  const writtenFiles: string[] = [];
  const modifiedFiles: string[] = [];
  const missingFiles: string[] = [];
  const errors = [...plan.errors];

  for (const file of plan.files) {
    if (file.status === "error") {
      files.push({
        foundation: plan.name,
        source: file.source,
        destination: file.destination,
        relativePath: file.relativePath,
        status: "failed",
        reason: file.reason,
      });
      continue;
    }

    if (file.status === "installed") {
      files.push({
        foundation: plan.name,
        source: file.source,
        destination: file.destination,
        relativePath: file.relativePath,
        status: "unchanged",
      });
      continue;
    }

    if (file.status === "modified") {
      modifiedFiles.push(file.relativePath);
      if (!overwrite) {
        files.push({
          foundation: plan.name,
          source: file.source,
          destination: file.destination,
          relativePath: file.relativePath,
          status: "modified",
        });
        continue;
      }
    } else {
      missingFiles.push(file.relativePath);
    }

    if (dryRun) {
      files.push({
        foundation: plan.name,
        source: file.source,
        destination: file.destination,
        relativePath: file.relativePath,
        status: "written",
      });
      continue;
    }

    ensureParent(file.destination);
    if (file.expected === undefined) {
      files.push({
        foundation: plan.name,
        source: file.source,
        destination: file.destination,
        relativePath: file.relativePath,
        status: "failed",
        reason: "contenu attendu non calculé",
      });
      errors.push(`${plan.name}: contenu attendu absent pour ${file.relativePath}`);
      continue;
    }

    writeFileSync(file.destination, file.expected);
    writtenFiles.push(file.relativePath);
    files.push({
      foundation: plan.name,
      source: file.source,
      destination: file.destination,
      relativePath: file.relativePath,
      status: "written",
    });
  }

  const assetResults: FileCopyResult[] = [];

  return {
    name: plan.name,
    entry: plan.entry,
    state: plan.state,
    files,
    assets: assetResults,
    writtenFiles,
    modifiedFiles,
    missingFiles,
    errors,
    needsRepair: modifiedFiles.length > 0,
  };
}

/**
 * Applique une liste de plans. Les assets sont copiés depuis `sourceRoot` vers
 * la racine du projet, de façon non destructive sauf `overwrite`.
 */
export function applyFoundationPlans(
  plans: FoundationPlan[],
  sourceRoot: string,
  projectRoot: string,
  options: { overwrite?: boolean; dryRun?: boolean } = {},
): FoundationInstallResult[] {
  return plans.map((plan) => {
    const result = applyFoundationPlan(plan, options);
    if (plan.assets.length > 0) {
      result.assets = copyAssetFiles(plan.assets, sourceRoot, projectRoot, {
        overwrite: Boolean(options.overwrite),
        dryRun: Boolean(options.dryRun),
      });
      for (const asset of result.assets) {
        if (asset.status === "failed") {
          result.errors.push(
            `${plan.name}: échec de copie de l'asset ${relativePosix(sourceRoot, asset.source)}${asset.reason ? ` (${asset.reason})` : ""}`,
          );
        }
      }
    }
    return result;
  });
}

/** Réexport utilitaire pour les tests et les appelants. */
export { isAssetFilePath };
