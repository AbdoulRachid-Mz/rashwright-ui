/**
 * file-manager.ts — Copie des fichiers du registre vers le projet cible.
 *
 * Responsabilités :
 *   - routage composants / hooks / libs ;
 *   - copie non destructive (sauf `--force` / `--repair` explicite) ;
 *   - transformation des alias d'imports ;
 *   - copie des assets et réécriture des `require()` d'assets pour qu'ils
 *     pointent vers le fichier réellement installé.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { transformImports, type TransformImportOptions } from "./transformers/import-transformer.js";
import { merge2Way } from "./merge-manager.js";

export interface FileCopyResult {
  source: string;
  destination: string;
  status: "copied" | "skipped" | "overwritten" | "failed";
  isModified?: boolean;
  reason?: string;
}

/** Extensions considérées comme des assets embarqués. */
export const ASSET_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ttf",
  ".otf",
  ".mp4",
  ".mov",
] as const;

export function isAssetFilePath(target: string): boolean {
  const lower = target.toLowerCase();
  return ASSET_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function relativePosix(from: string, to: string): string {
  return toPosix(relative(from, to));
}

/**
 * Resolve the absolute source path for a component file in the rashwright-ui registry.
 * The `registrySourceRoot` is the root of the rashwright-ui project.
 */
export function resolveSourcePath(file: string, registrySourceRoot: string): string {
  return join(registrySourceRoot, file);
}

export interface AssetRewriteOptions {
  /** Racine source du registre (`packages/ui-mobile`). */
  sourceRoot: string;
  /** Fichier source absolu contenant les `require()`. */
  sourceFile: string;
  /** Fichier de destination absolu. */
  destinationFile: string;
  /** Racine du projet cible (les assets vont dans `<projectRoot>/assets`). */
  projectRoot: string;
  /** Assets déclarés par le manifeste, relatifs à `sourceRoot`. */
  declaredAssets?: string[];
}

export interface AssetRewriteResult {
  content: string;
  /** `require()` d'assets qui n'ont pas pu être résolus. */
  unresolved: string[];
}

function resolveSourceAsset(
  target: string,
  sourceRoot: string,
  sourceFile: string
): string | null {
  const candidates: string[] = [];

  if (target.startsWith("@/")) {
    candidates.push(join(sourceRoot, target.slice(2)));
  } else if (target.startsWith(".")) {
    candidates.push(join(dirname(sourceFile), target));
  } else if (target.startsWith("assets/")) {
    candidates.push(join(sourceRoot, target));
  } else {
    return null;
  }

  // Un composant embarqué peut référencer son asset via un chemin relatif
  // valable seulement APRÈS installation (ex: `../../../assets/primary.png`).
  const tail = /(?:^|\/)assets\/(.+)$/.exec(toPosix(target));
  if (tail) candidates.push(join(sourceRoot, "assets", tail[1]));

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * Réécrit les `require("<asset>")` pour pointer vers l'asset installé.
 *
 * Les imports `@/assets/x.png` et les fallbacks relatifs sont tous ramenés à un
 * chemin relatif calculé depuis le fichier de destination réel. Un asset
 * introuvable n'est jamais ignoré en silence : il est retourné dans `unresolved`.
 */
export function rewriteAssetRequires(
  content: string,
  options: AssetRewriteOptions
): AssetRewriteResult {
  const unresolved: string[] = [];
  const declared = new Set((options.declaredAssets ?? []).map(toPosix));
  const requirePattern = /require\(\s*(["'])([^"']+)\1\s*\)/g;

  const rewritten = content.replace(
    requirePattern,
    (match, _quote: string, target: string) => {
      if (!isAssetFilePath(target)) return match;

      const sourceAsset = resolveSourceAsset(target, options.sourceRoot, options.sourceFile);
      if (!sourceAsset) {
        unresolved.push(target);
        return match;
      }

      const sourceRelative = relativePosix(options.sourceRoot, sourceAsset);
      if (!declared.has(sourceRelative) && !sourceRelative.startsWith("assets/")) {
        // Asset présent dans les sources mais non déclaré : ne pas inventer une
        // destination. Le manifeste doit être corrigé.
        unresolved.push(target);
        return match;
      }

      const destinationAsset = join(options.projectRoot, sourceRelative);
      let relativePath = relativePosix(
        dirname(options.destinationFile),
        destinationAsset
      );
      if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;
      return `require("${relativePath}")`;
    }
  );

  return { content: rewritten, unresolved };
}

function readTextFile(path: string): string {
  return readFileSync(path, "utf-8");
}

function compareFiles(source: string, destination: string): boolean {
  return readFileSync(source).equals(readFileSync(destination));
}

/**
 * Destination d'un fichier de composant/hook/lib.
 * Les hooks et libs vont dans `<projectRoot>/[src/]hooks|lib` ; les composants
 * dans `<targetComponentsRoot>`.
 */
export function resolveComponentDestination(
  file: string,
  targetComponentsRoot: string,
  projectRoot: string,
): string {
  const normalizedFile = toPosix(file);
  if (normalizedFile.startsWith("hooks/") || normalizedFile.startsWith("lib/")) {
    const normalizedTarget = toPosix(targetComponentsRoot);
    const hasSrc =
      normalizedTarget.includes("/src/") ||
      normalizedTarget.endsWith("/src") ||
      normalizedTarget.startsWith("src/");
    return join(projectRoot, hasSrc ? "src" : "", normalizedFile);
  }
  const relativeComponentsPath = normalizedFile.replace(
    /^(?:components\/ui|src\/components\/ui)\//,
    ""
  );
  return join(targetComponentsRoot, relativeComponentsPath);
}

/**
 * Copy component files from the registry source to the target project.
 */
export function copyComponentFiles(
  files: string[],
  registrySourceRoot: string,
  targetComponentsRoot: string,
  options: {
    overwrite?: boolean;
    dryRun?: boolean;
    importTransform?: TransformImportOptions;
    merge?: boolean;
    /** Racine du projet cible, nécessaire pour réécrire les assets. */
    projectRoot?: string;
    /** Assets déclarés par le manifeste du composant. */
    declaredAssets?: string[];
  } = {}
): FileCopyResult[] {
  const results: FileCopyResult[] = [];
  const projectRoot =
    options.projectRoot ??
    targetComponentsRoot.replace(
      /[/\\](?:src[/\\])?components[/\\]ui[/\\]?.*$/,
      ""
    );

  for (const file of files) {
    const normalizedFile = file.replace(/\\/g, "/");
    const source = resolveSourcePath(file, registrySourceRoot);
    let destination: string;

    if (normalizedFile.startsWith("hooks/") || normalizedFile.startsWith("lib/")) {
      const normalizedTarget = targetComponentsRoot.replace(/\\/g, "/");
      const hasSrc =
        normalizedTarget.includes("/src/") ||
        normalizedTarget.endsWith("/src") ||
        normalizedTarget.startsWith("src/");
      destination = join(projectRoot, hasSrc ? "src" : "", normalizedFile);
    } else {
      const relativeComponentsPath = normalizedFile.replace(
        /^(?:components\/ui|src\/components\/ui)\//,
        ""
      );
      destination = join(targetComponentsRoot, relativeComponentsPath);
    }

    if (!existsSync(source)) {
      results.push({
        source,
        destination,
        status: "failed",
        reason: "fichier source introuvable",
      });
      continue;
    }

    if (options.dryRun) {
      results.push({ source, destination, status: "copied" });
      continue;
    }

    const destDir = dirname(destination);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    // Check if the destination already exists and was potentially modified
    let isModified = false;
    if (existsSync(destination)) {
      if (!options.overwrite) {
        isModified = !compareFiles(source, destination);
        results.push({ source, destination, status: "skipped", isModified });
        continue;
      }
      isModified = true;
    }

    let content = readTextFile(source);
    if (options.importTransform) {
      content = transformImports(content, options.importTransform);
    }
    const assetRewrite = rewriteAssetRequires(content, {
      sourceRoot: registrySourceRoot,
      sourceFile: source,
      destinationFile: destination,
      projectRoot,
      declaredAssets: options.declaredAssets,
    });
    if (assetRewrite.unresolved.length > 0) {
      results.push({
        source,
        destination,
        status: "failed",
        reason: `asset(s) non résolu(s): ${assetRewrite.unresolved.join(", ")}`,
      });
      continue;
    }
    content = assetRewrite.content;

    if (isModified && options.merge && existsSync(destination)) {
      const localContent = readTextFile(destination);
      const mergeRes = merge2Way(localContent, content);
      content = mergeRes.merged;
    }

    writeFileSync(destination, content, "utf-8");
    results.push({
      source,
      destination,
      status: isModified ? "overwritten" : "copied",
      isModified,
    });
  }

  return results;
}

/**
 * Copie les assets déclarés dans `<projectRoot>/assets/...`.
 */
export function copyAssetFiles(
  assets: string[],
  sourceRoot: string,
  projectRoot: string,
  options: { overwrite?: boolean; dryRun?: boolean } = {}
): FileCopyResult[] {
  const results: FileCopyResult[] = [];

  for (const asset of assets) {
    const normalized = toPosix(asset);
    const source = join(sourceRoot, normalized);
    const destination = join(projectRoot, normalized);

    if (!existsSync(source)) {
      results.push({
        source,
        destination,
        status: "failed",
        reason: "asset source introuvable",
      });
      continue;
    }

    if (options.dryRun) {
      results.push({ source, destination, status: "copied" });
      continue;
    }

    const destDir = dirname(destination);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    if (existsSync(destination)) {
      if (!options.overwrite) {
        results.push({
          source,
          destination,
          status: "skipped",
          isModified: !compareFiles(source, destination),
        });
        continue;
      }
      results.push({ source, destination, status: "overwritten", isModified: true });
      writeFileSync(destination, readFileSync(source));
      continue;
    }

    writeFileSync(destination, readFileSync(source));
    results.push({ source, destination, status: "copied" });
  }

  return results;
}

/**
 * Copie les fichiers d'un template ou d'un widget (dossier autonome).
 * Les imports sont transformés et les assets réécrits, comme pour les composants.
 */
export function copyArtefactFiles(
  files: string[],
  sourceDir: string,
  targetDir: string,
  options: {
    overwrite?: boolean;
    dryRun?: boolean;
    importTransform?: TransformImportOptions;
    sourceRoot?: string;
    projectRoot?: string;
    declaredAssets?: string[];
  } = {}
): FileCopyResult[] {
  const results: FileCopyResult[] = [];
  const sourceRoot = options.sourceRoot ?? sourceDir;

  for (const file of files) {
    const normalized = toPosix(file);
    const source = join(sourceDir, normalized);
    const destination = join(targetDir, normalized);

    if (!existsSync(source)) {
      results.push({
        source,
        destination,
        status: "failed",
        reason: "fichier source introuvable",
      });
      continue;
    }

    if (options.dryRun) {
      results.push({ source, destination, status: "copied" });
      continue;
    }

    const destDir = dirname(destination);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    if (existsSync(destination) && !options.overwrite) {
      results.push({
        source,
        destination,
        status: "skipped",
        isModified: !compareFiles(source, destination),
      });
      continue;
    }

    const isCode = /\.(ts|tsx|js|jsx)$/.test(normalized);
    let content = isCode ? readTextFile(source) : readFileSync(source);

    if (isCode) {
      let code = content as string;
      if (options.importTransform) {
        code = transformImports(code, options.importTransform);
      }
      if (options.sourceRoot && options.projectRoot) {
        const rewrite = rewriteAssetRequires(code, {
          sourceRoot: options.sourceRoot,
          sourceFile: source,
          destinationFile: destination,
          projectRoot: options.projectRoot,
          declaredAssets: options.declaredAssets,
        });
        if (rewrite.unresolved.length > 0) {
          results.push({
            source,
            destination,
            status: "failed",
            reason: `asset(s) non résolu(s): ${rewrite.unresolved.join(", ")}`,
          });
          continue;
        }
        code = rewrite.content;
      }
      content = code;
    }

    writeFileSync(destination, content);
    results.push({
      source,
      destination,
      status: existsSync(destination) ? "overwritten" : "copied",
    });
  }

  return results;
}

/**
 * Write a text file to disk, creating directories as needed.
 */
export function writeFile(path: string, content: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, "utf-8");
}

/**
 * Check if a file exists and has been modified compared to a reference content.
 */
export function isFileModified(path: string, referenceContent: string): boolean {
  if (!existsSync(path)) return false;
  const current = readFileSync(path, "utf-8");
  return current !== referenceContent;
}

// Re-export statSync for consumers that need it
export { statSync };
