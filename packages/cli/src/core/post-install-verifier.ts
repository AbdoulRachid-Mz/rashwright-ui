/**
 * post-install-verifier.ts — Vérification indépendante du lockfile.
 *
 * Le lockfile décrit ce que le CLI *croit* avoir installé. Ce module vérifie ce
 * qui est réellement sur le disque :
 *   - présence de tous les fichiers et assets attendus ;
 *   - résolution effective des imports locaux (relatifs et alias `tsconfig`) ;
 *   - présence des packages externes importés dans `package.json` ;
 *   - cohérence des alias déclarés dans `rashwright-ui.json` ;
 *   - cohérence config/lockfile/disque, y compris les chemins de hooks/libs ;
 *   - compilation TypeScript ciblée quand `tsc` est réellement disponible.
 *
 * Aucune conclusion de succès ne doit reposer sur le seul lockfile.
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import type { RashwrightConfig } from "./config-manager.js";
import {
  computeFileHash,
  getLockfilePath,
  readLockfile,
  type RashwrightLockfile,
} from "./lock-manager.js";

export type VerificationSeverity = "error" | "warning";

export interface VerificationIssue {
  severity: VerificationSeverity;
  code:
    | "missing-file"
    | "missing-asset"
    | "unresolved-import"
    | "unresolved-alias"
    | "missing-package"
    | "invalid-package-json"
    | "invalid-tsconfig"
    | "alias-not-configured"
    | "config-not-marked"
    | "config-file-missing"
    | "lockfile-invalid"
    | "lockfile-without-entry"
    | "lockfile-file-missing"
    | "lockfile-modified"
    | "lockfile-bad-path"
    | "typescript-error"
    | "typescript-warning";
  message: string;
  path?: string;
}

export interface VerificationTarget {
  /** Libellé lisible : « composant button », « fondation theme »... */
  label: string;
  /** Fichiers absolus qui doivent exister après l'installation. */
  files: string[];
  /** Assets absolus qui doivent exister après l'installation. */
  assets: string[];
}

export interface VerificationReport {
  ok: boolean;
  checkedFiles: number;
  checkedImports: number;
  issues: VerificationIssue[];
  typescript: {
    status: "ok" | "failed" | "skipped";
    reason?: string;
  };
}

export interface VerifyInstallationOptions {
  projectRoot: string;
  config: RashwrightConfig;
  configPath: string;
  targets: VerificationTarget[];
  /** Packages npm/Expo requis par le plan (noms normalisés). */
  expectedPackages?: string[];
  /** Composants qui doivent être marqués installés dans la config. */
  expectedComponents?: string[];
  /** Fondations qui doivent avoir une entrée de lockfile. */
  expectedFoundations?: string[];
  /** Templates/widgets qui doivent avoir une entrée de lockfile. */
  expectedTemplates?: string[];
  expectedWidgets?: string[];
  /** Lance `tsc --noEmit` si TypeScript est présent dans le projet. */
  checkTypeScript?: boolean;
}

const NODE_BUILTINS = new Set([
  "assert",
  "buffer",
  "child_process",
  "crypto",
  "events",
  "fs",
  "http",
  "https",
  "module",
  "net",
  "os",
  "path",
  "process",
  "stream",
  "string_decoder",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "zlib",
]);

/** Pairs implicites : jamais déclarés ni signalés par le registre. */
const IMPLICIT_PEERS = new Set(["react", "react-native"]);

const CODE_EXTENSION = /\.(?:ts|tsx|js|jsx)$/i;

const IMPORT_PATTERN =
  /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\s*\(\s*["']([^"']+)["']\s*\)/g;

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function isNodeBuiltin(specifier: string): boolean {
  if (specifier.startsWith("node:")) return true;
  return NODE_BUILTINS.has(specifier.split("/")[0]);
}

function externalPackageName(specifier: string): string {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }
  return specifier.split("/")[0];
}

/**
 * Supprime les commentaires `//` et `/* *\/` en respectant les chaînes de
 * caractères.
 *
 * Un simple regex casse les JSON/TS contenant des globs : `"@/*"` et
 * `"**\/*.ts"` contiennent la séquence `/*`, qui serait interprétée comme le
 * début d'un commentaire et avalerait la suite du fichier. On scanne donc le
 * texte en gardant l'état « dans une chaîne ».
 */
function stripComments(code: string): string {
  let result = "";
  let index = 0;
  let quote: '"' | "'" | "`" | null = null;

  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];

    if (quote) {
      result += char;
      if (char === "\\" && next !== undefined) {
        result += next;
        index += 2;
        continue;
      }
      if (char === quote) quote = null;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      result += char;
      index += 1;
      continue;
    }

    if (char === "/" && next === "/") {
      index += 2;
      while (index < code.length && code[index] !== "\n") index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (
        index < code.length &&
        !(code[index] === "*" && code[index + 1] === "/")
      ) {
        // Conserve les retours à la ligne pour ne pas décaler les numéros.
        if (code[index] === "\n") result += "\n";
        index += 1;
      }
      index += 2;
      continue;
    }

    result += char;
    index += 1;
  }

  return result;
}

export function extractSpecifiers(code: string): string[] {
  const cleaned = stripComments(code);
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  IMPORT_PATTERN.lastIndex = 0;
  while ((match = IMPORT_PATTERN.exec(cleaned)) !== null) {
    const specifier = match[1] ?? match[2] ?? match[3];
    if (specifier) found.add(specifier);
  }
  return [...found];
}

export interface TsconfigPaths {
  baseUrl: string;
  patterns: Array<{ pattern: string; targets: string[] }>;
  /** Renseigné quand `tsconfig.json` existe mais n'est pas exploitable. */
  error?: string;
}

export function readTsconfigPaths(projectRoot: string): TsconfigPaths {
  const tsconfigPath = join(projectRoot, "tsconfig.json");
  if (!existsSync(tsconfigPath)) return { baseUrl: projectRoot, patterns: [] };

  try {
    const raw = stripComments(readFileSync(tsconfigPath, "utf-8"));
    const parsed = JSON.parse(raw) as {
      compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
      };
    };
    const baseUrl = parsed.compilerOptions?.baseUrl
      ? resolve(projectRoot, parsed.compilerOptions.baseUrl)
      : projectRoot;
    const rawPaths = parsed.compilerOptions?.paths ?? {};
    return {
      baseUrl,
      patterns: Object.entries(rawPaths).map(([pattern, targets]) => ({
        pattern,
        targets: (Array.isArray(targets) ? targets : [String(targets)]).map(
          (target) => resolve(baseUrl, target),
        ),
      })),
    };
  } catch (error) {
    return {
      baseUrl: projectRoot,
      patterns: [],
      error: (error as Error).message,
    };
  }
}

export function resolveCandidate(absolute: string): string | null {
  const candidates = [
    absolute,
    `${absolute}.ts`,
    `${absolute}.tsx`,
    `${absolute}.js`,
    `${absolute}.jsx`,
    `${absolute}.json`,
    `${absolute}.d.ts`,
    join(absolute, "index.ts"),
    join(absolute, "index.tsx"),
    join(absolute, "index.js"),
    join(absolute, "index.jsx"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function patternMatches(pattern: string, specifier: string): boolean {
  if (!pattern.includes("*")) return pattern === specifier;
  const [prefix, suffix] = pattern.split("*");
  return (
    specifier.startsWith(prefix) &&
    (suffix === undefined || specifier.endsWith(suffix))
  );
}

export function resolveAlias(
  specifier: string,
  aliasPatterns: TsconfigPaths["patterns"],
): string | null {
  const exact = aliasPatterns.find(
    (entry) => !entry.pattern.includes("*") && entry.pattern === specifier,
  );
  if (exact) {
    for (const target of exact.targets) {
      const resolved = resolveCandidate(target);
      if (resolved) return resolved;
    }
  }

  const wildcards = aliasPatterns
    .filter((entry) => entry.pattern.includes("*"))
    .sort((a, b) => b.pattern.length - a.pattern.length);

  for (const entry of wildcards) {
    if (!patternMatches(entry.pattern, specifier)) continue;
    const [prefix, suffix] = entry.pattern.split("*");
    const middle = specifier.slice(
      prefix.length,
      specifier.length - (suffix?.length ?? 0),
    );
    for (const target of entry.targets) {
      const substituted = target.replace("*", middle);
      const resolved = resolveCandidate(substituted);
      if (resolved) return resolved;
    }
  }

  return null;
}

export function readPackageNames(projectRoot: string): {
  names: Set<string>;
  error?: string;
} {
  const packageJsonPath = join(projectRoot, "package.json");
  if (!existsSync(packageJsonPath)) {
    return { names: new Set(), error: "package.json absent" };
  }
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as Record<
      string,
      Record<string, string> | undefined
    >;
    const names = new Set<string>([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...Object.keys(pkg.optionalDependencies ?? {}),
    ]);
    return { names };
  } catch (error) {
    return { names: new Set(), error: (error as Error).message };
  }
}

/**
 * Déduit les préfixes d'alias à déclarer dans `tsconfig.paths` à partir des
 * alias projet (`@/components` → `@/`, `~/components` → `~/`).
 */
export function deriveAliasPrefixes(
  aliases: Record<string, string | undefined> | undefined,
): string[] {
  const prefixes = new Set<string>();
  for (const value of Object.values(aliases ?? {})) {
    if (!value) continue;
    const clean = value.trim().replace(/\\/g, "/");
    const lastSlash = clean.lastIndexOf("/");
    if (lastSlash <= 0) continue;
    const prefix = clean.slice(0, lastSlash + 1);
    if (prefix && prefix !== "/") prefixes.add(prefix);
  }
  return [...prefixes].sort();
}

function patternCoversPrefix(pattern: string, prefix: string): boolean {
  if (!pattern.includes("*")) return pattern.startsWith(prefix);
  const [start] = pattern.split("*");
  return start.startsWith(prefix) || prefix.startsWith(start);
}

interface TypeScriptRun {
  status: "ok" | "failed" | "skipped";
  reason?: string;
  output?: string;
}

function runTypeScriptCheck(projectRoot: string): TypeScriptRun {
  const nodeModules = join(projectRoot, "node_modules");
  if (!existsSync(nodeModules)) {
    return {
      status: "skipped",
      reason: "node_modules absent — vérification TypeScript non exécutable",
    };
  }

  const tscBin = join(nodeModules, "typescript", "bin", "tsc");
  if (!existsSync(tscBin)) {
    return {
      status: "skipped",
      reason: "typescript absent de node_modules",
    };
  }

  const result = spawnSync(
    process.execPath,
    [tscBin, "--noEmit", "--incremental", "false"],
    {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 120000,
      windowsHide: true,
    },
  );

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
  if (result.error) {
    return { status: "failed", reason: result.error.message, output };
  }
  if (result.status === 0) {
    return { status: "ok", output };
  }
  return {
    status: "failed",
    reason: `tsc a retourné ${result.status ?? "un statut inconnu"}`,
    output,
  };
}

function readLockfileStrict(projectRoot: string): {
  lock: RashwrightLockfile | null;
  issue?: VerificationIssue;
} {
  const lockPath = getLockfilePath(projectRoot);
  if (!existsSync(lockPath)) return { lock: null };

  const lock = readLockfile(projectRoot);
  if (!lock) {
    return {
      lock: null,
      issue: {
        severity: "error",
        code: "lockfile-invalid",
        message:
          "rashwright-ui.lock existe mais est illisible ou invalide — impossible de vérifier la cohérence.",
        path: lockPath,
      },
    };
  }
  return { lock };
}

/**
 * Vérifie la résolution des imports d'un ensemble de fichiers.
 *
 * Contrairement à `verifyInstallation`, cette fonction ne suppose aucun plan :
 * elle inspecte uniquement des fichiers réels et leur résolution (imports
 * relatifs, alias `tsconfig`, packages externes). Elle est utilisée par
 * `doctor` et `info` pour confirmer qu'un artefact est réellement utilisable.
 */
export interface ImportCheckIssue {
  code:
    | "unresolved-import"
    | "unresolved-alias"
    | "missing-package"
    | "invalid-package-json"
    | "invalid-tsconfig";
  /** Chemin absolu du fichier concerné. */
  file: string;
  specifier?: string;
  message: string;
}

export interface ImportCheckResult {
  checkedFiles: number;
  checkedImports: number;
  issues: ImportCheckIssue[];
}

export function checkImports(
  projectRoot: string,
  files: string[],
): ImportCheckResult {
  const issues: ImportCheckIssue[] = [];
  const tsconfig = readTsconfigPaths(projectRoot);
  const packageInfo = readPackageNames(projectRoot);

  if (packageInfo.error) {
    issues.push({
      code: "invalid-package-json",
      file: join(projectRoot, "package.json"),
      message: `package.json illisible : ${packageInfo.error}`,
    });
  }

  if (tsconfig.error) {
    issues.push({
      code: "invalid-tsconfig",
      file: join(projectRoot, "tsconfig.json"),
      message: `tsconfig.json illisible : ${tsconfig.error}`,
    });
  }

  let checkedFiles = 0;
  let checkedImports = 0;

  for (const file of files) {
    if (!CODE_EXTENSION.test(file)) continue;
    if (!existsSync(file) || !statSync(file).isFile()) continue;
    checkedFiles += 1;

    const code = readFileSync(file, "utf-8");
    for (const specifier of extractSpecifiers(code)) {
      checkedImports += 1;

      if (specifier.startsWith(".") || specifier.startsWith("/")) {
        const base = specifier.startsWith("/")
          ? resolve(projectRoot, `.${specifier}`)
          : resolve(dirname(file), specifier);
        if (!resolveCandidate(base)) {
          issues.push({
            code: "unresolved-import",
            file,
            specifier,
            message: `Import local non résolu dans ${toPosix(relative(projectRoot, file))} : "${specifier}"`,
          });
        }
        continue;
      }

      if (isNodeBuiltin(specifier)) continue;

      const aliasResolved = resolveAlias(specifier, tsconfig.patterns);
      const looksLikeAlias = tsconfig.patterns.some((entry) =>
        patternMatches(entry.pattern, specifier),
      );
      if (aliasResolved) continue;
      if (looksLikeAlias) {
        issues.push({
          code: "unresolved-alias",
          file,
          specifier,
          message: `Alias non résolu dans ${toPosix(relative(projectRoot, file))} : "${specifier}"`,
        });
        continue;
      }

      const packageName = externalPackageName(specifier);
      if (!packageName) continue;
      if (IMPLICIT_PEERS.has(packageName)) continue;
      if (!packageInfo.names.has(packageName)) {
        issues.push({
          code: "missing-package",
          file,
          specifier,
          message: `Package "${packageName}" importé par ${toPosix(relative(projectRoot, file))} mais absent de package.json.`,
        });
      }
    }
  }

  return { checkedFiles, checkedImports, issues };
}

/**
 * Vérifie qu'un plan d'installation correspond réellement au disque.
 * Aucun accès réseau, aucune écriture.
 */
export function verifyInstallation(
  options: VerifyInstallationOptions,
): VerificationReport {
  const {
    projectRoot,
    config,
    targets,
    expectedPackages = [],
    expectedComponents = [],
    expectedFoundations = [],
    expectedTemplates = [],
    expectedWidgets = [],
    checkTypeScript = false,
  } = options;

  const issues: VerificationIssue[] = [];
  const addIssue = (
    severity: VerificationSeverity,
    code: VerificationIssue["code"],
    message: string,
    path?: string,
  ): void => {
    issues.push({ severity, code, message, path });
  };

  // ── 1. Existence des fichiers et assets attendus ────────────────────────
  let checkedFiles = 0;
  const codeFiles = new Set<string>();

  for (const target of targets) {
    for (const file of target.files) {
      if (!existsSync(file) || !statSync(file).isFile()) {
        addIssue(
          "error",
          "missing-file",
          `${target.label} : fichier manquant → ${toPosix(relative(projectRoot, file))}`,
          file,
        );
      } else {
        checkedFiles += 1;
        if (CODE_EXTENSION.test(file)) codeFiles.add(resolve(file));
      }
    }
    for (const asset of target.assets) {
      if (!existsSync(asset) || !statSync(asset).isFile()) {
        addIssue(
          "error",
          "missing-asset",
          `${target.label} : asset manquant → ${toPosix(relative(projectRoot, asset))}`,
          asset,
        );
      }
    }
  }

  // ── 2. Résolution réelle des imports ────────────────────────────────────
  const tsconfig = readTsconfigPaths(projectRoot);
  const packageInfo = readPackageNames(projectRoot);
  if (packageInfo.error) {
    addIssue(
      "error",
      "invalid-package-json",
      `package.json illisible : ${packageInfo.error}`,
      join(projectRoot, "package.json"),
    );
  }

  if (tsconfig.error) {
    addIssue(
      "error",
      "invalid-tsconfig",
      `tsconfig.json illisible : ${tsconfig.error}`,
      join(projectRoot, "tsconfig.json"),
    );
  }

  let checkedImports = 0;
  for (const file of codeFiles) {
    if (!existsSync(file)) continue;
    const code = readFileSync(file, "utf-8");

    for (const specifier of extractSpecifiers(code)) {
      checkedImports += 1;

      if (specifier.startsWith(".") || specifier.startsWith("/")) {
        const base = specifier.startsWith("/")
          ? resolve(projectRoot, `.${specifier}`)
          : resolve(dirname(file), specifier);
        if (!resolveCandidate(base)) {
          addIssue(
            "error",
            "unresolved-import",
            `Import local non résolu dans ${toPosix(relative(projectRoot, file))} : "${specifier}"`,
            file,
          );
        }
        continue;
      }

      if (isNodeBuiltin(specifier)) continue;

      const aliasResolved = resolveAlias(specifier, tsconfig.patterns);
      const looksLikeAlias = tsconfig.patterns.some((entry) =>
        patternMatches(entry.pattern, specifier),
      );

      if (aliasResolved) continue;
      if (looksLikeAlias) {
        addIssue(
          "error",
          "unresolved-alias",
          `Alias non résolu dans ${toPosix(relative(projectRoot, file))} : "${specifier}"`,
          file,
        );
        continue;
      }

      const packageName = externalPackageName(specifier);
      if (!packageName) continue;
      if (IMPLICIT_PEERS.has(packageName)) continue;
      if (!packageInfo.names.has(packageName)) {
        addIssue(
          "error",
          "missing-package",
          `Package "${packageName}" importé par ${toPosix(relative(projectRoot, file))} mais absent de package.json.`,
          file,
        );
      }
    }
  }

  // ── 3. Packages déclarés par le plan ────────────────────────────────────
  for (const packageName of expectedPackages) {
    if (!packageName) continue;
    if (!packageInfo.names.has(packageName)) {
      addIssue(
        "error",
        "missing-package",
        `Dépendance du plan absente de package.json : "${packageName}".`,
        join(projectRoot, "package.json"),
      );
    }
  }

  // ── 4. Alias configurés vs tsconfig.paths ───────────────────────────────
  for (const prefix of deriveAliasPrefixes(config.aliases)) {
    const covered = tsconfig.patterns.some((entry) =>
      patternCoversPrefix(entry.pattern, prefix),
    );
    if (!covered) {
      addIssue(
        "error",
        "alias-not-configured",
        `Alias "${prefix}" utilisé par la config mais absent de tsconfig.json#compilerOptions.paths.`,
        join(projectRoot, "tsconfig.json"),
      );
    }
  }

  // ── 5. Config / lockfile / disque ───────────────────────────────────────
  const { lock, issue: lockIssue } = readLockfileStrict(projectRoot);
  if (lockIssue) issues.push(lockIssue);

  for (const name of expectedComponents) {
    if (!(name in (config.components ?? {}))) {
      addIssue(
        "error",
        "config-not-marked",
        `Composant "${name}" installé mais absent de rashwright-ui.json#components.`,
        options.configPath,
      );
    }
  }

  if (!lock && !lockIssue) {
    if (
      expectedComponents.length > 0 ||
      expectedFoundations.length > 0 ||
      expectedTemplates.length > 0 ||
      expectedWidgets.length > 0
    ) {
      addIssue(
        "warning",
        "lockfile-without-entry",
        "rashwright-ui.lock absent : l'installation ne peut pas être vérifiée par hash.",
        getLockfilePath(projectRoot),
      );
    }
  }

  const componentsPath = toPosix(config.componentsPath).replace(/\/$/, "");

  const checkLockedFiles = (
    label: string,
    entry: { files: Array<{ path: string; hash: string }> },
  ): void => {
    for (const file of entry.files) {
      const posix = toPosix(file.path);
      if (
        posix.startsWith("/") ||
        /^[a-zA-Z]:/.test(posix) ||
        posix.split("/").includes("..")
      ) {
        addIssue(
          "error",
          "lockfile-bad-path",
          `${label} : chemin de lockfile invalide (absolu ou hors projet) → ${posix}`,
          getLockfilePath(projectRoot),
        );
        continue;
      }
      if (
        posix.includes(`${componentsPath}/hooks/`) ||
        posix.includes(`${componentsPath}/lib/`)
      ) {
        addIssue(
          "error",
          "lockfile-bad-path",
          `${label} : hook/lib verrouillé sous ${componentsPath} → ${posix} (attendu : src/hooks ou src/lib)`,
          getLockfilePath(projectRoot),
        );
      }

      const absolute = join(projectRoot, posix);
      if (!existsSync(absolute)) {
        addIssue(
          "error",
          "lockfile-file-missing",
          `${label} : fichier verrouillé absent du disque → ${posix}`,
          absolute,
        );
        continue;
      }

      const currentHash = computeFileHash(readFileSync(absolute, "utf-8"));
      if (currentHash !== file.hash) {
        addIssue(
          "warning",
          "lockfile-modified",
          `${label} : fichier modifié localement depuis l'installation → ${posix}`,
          absolute,
        );
      }
    }
  };

  if (lock) {
    for (const [name, entry] of Object.entries(lock.components ?? {})) {
      checkLockedFiles(`composant ${name}`, entry);
    }
    for (const [name, entry] of Object.entries(lock.foundations ?? {})) {
      checkLockedFiles(`fondation ${name}`, entry);
    }
    for (const [name, entry] of Object.entries(lock.templates ?? {})) {
      checkLockedFiles(`template ${name}`, entry);
    }
    for (const [name, entry] of Object.entries(lock.widgets ?? {})) {
      checkLockedFiles(`widget ${name}`, entry);
    }

    for (const name of expectedFoundations) {
      if (!lock.foundations?.[name]) {
        addIssue(
          "warning",
          "lockfile-without-entry",
          `Fondation "${name}" installée mais absente du lockfile.`,
          getLockfilePath(projectRoot),
        );
      }
    }
    for (const name of expectedTemplates) {
      if (!lock.templates?.[name]) {
        addIssue(
          "warning",
          "lockfile-without-entry",
          `Template "${name}" installé mais absent du lockfile.`,
          getLockfilePath(projectRoot),
        );
      }
    }
    for (const name of expectedWidgets) {
      if (!lock.widgets?.[name]) {
        addIssue(
          "warning",
          "lockfile-without-entry",
          `Widget "${name}" installé mais absent du lockfile.`,
          getLockfilePath(projectRoot),
        );
      }
    }
    for (const name of expectedComponents) {
      if (!lock.components?.[name]) {
        addIssue(
          "warning",
          "lockfile-without-entry",
          `Composant "${name}" marqué installé mais absent du lockfile.`,
          getLockfilePath(projectRoot),
        );
      }
    }
  }

  // Une config qui déclare un composant doit être adossée à des fichiers réels.
  for (const [name, value] of Object.entries(config.components ?? {})) {
    void value;
    if (expectedComponents.includes(name)) continue;
    const locked = lock?.components?.[name];
    if (!locked) {
      addIssue(
        "warning",
        "lockfile-without-entry",
        `Composant "${name}" déclaré dans rashwright-ui.json sans entrée de lockfile vérifiable.`,
        options.configPath,
      );
      continue;
    }
    for (const file of locked.files) {
      if (!existsSync(join(projectRoot, toPosix(file.path)))) {
        addIssue(
          "error",
          "config-file-missing",
          `Composant "${name}" déclaré installé mais fichier absent → ${toPosix(file.path)}`,
          join(projectRoot, toPosix(file.path)),
        );
      }
    }
  }

  // ── 6. TypeScript (si réellement disponible) ────────────────────────────
  let typescript: VerificationReport["typescript"] = {
    status: "skipped",
    reason: "vérification TypeScript désactivée",
  };
  if (checkTypeScript) {
    const run = runTypeScriptCheck(projectRoot);
    typescript = { status: run.status, reason: run.reason };

    if (run.status === "failed" && run.output) {
      const installedPaths = [...codeFiles].map((file) =>
        toPosix(relative(projectRoot, file)),
      );
      const touchesInstalled = installedPaths.some((installed) =>
        run.output!.includes(installed),
      );
      addIssue(
        touchesInstalled ? "error" : "warning",
        touchesInstalled ? "typescript-error" : "typescript-warning",
        touchesInstalled
          ? "TypeScript signale une erreur dans un fichier installé :\n" +
            run.output.split(/\r?\n/).filter(Boolean).slice(0, 20).join("\n")
          : "TypeScript signale des erreurs hors des fichiers installés :\n" +
            run.output.split(/\r?\n/).filter(Boolean).slice(0, 10).join("\n"),
      );
    }
  }

  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    checkedFiles,
    checkedImports,
    issues,
    typescript,
  };
}
