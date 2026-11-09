/**
 * install-harness.ts — Harnais E2E de la Phase 0.
 *
 * Objectif : exécuter le vrai CLI dans une fixture Expo temporaire et prouver,
 * indépendamment du lockfile, que les fichiers et imports installés sont utilisables.
 *
 * Ce module ne modifie aucun comportement produit. Il prépare :
 *   - une fixture sous %TEMP% (jamais test-project/) ;
 *   - un HOME/USERPROFILE isolé pour le cache du registre distant ;
 *   - des shims npm/npx déterministes (aucun réseau) qui enregistrent les commandes
 *     et appliquent leurs effets sur le package.json de la fixture ;
 *   - un analyseur d'imports (relatifs, alias tsconfig, packages externes).
 */

import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..", "..", "..");
export const CLI_ENTRY = resolve(REPO_ROOT, "packages", "cli", "src", "index.ts");
export const UI_MOBILE_ROOT = resolve(REPO_ROOT, "packages", "ui-mobile");const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".expo",
  ".e2e-bin",
  ".e2e-meta",
  "dist",
  "build",
  "coverage",
  "skills",
]);

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

export interface FixtureOptions {
  /** Nom lisible utilisé dans le chemin temporaire. */
  name: string;
  /** Structure avec src/ (défaut) ou sans src/. */
  withSrc?: boolean;
  /** Chemin des composants écrit dans rashwright-ui.json. */
  componentsPath?: string;
  /** Aliases écrits dans rashwright-ui.json. */
  aliases?: Record<string, string>;
  /** compilerOptions.paths de la fixture. */
  tsconfigPaths?: Record<string, string[]>;
  /** Dépendances déjà présentes dans package.json. */
  dependencies?: Record<string, string>;
  /** Écrire rashwright-ui.json (défaut true). */
  writeConfig?: boolean;
  /** Config supplémentaire fusionnée. */
  config?: Record<string, unknown>;
}

export interface Fixture {
  root: string;
  metaDir: string;
  homeDir: string;
  binDir: string;
  commandLog: string;
  env: NodeJS.ProcessEnv;
  options: Required<Pick<FixtureOptions, "name" | "withSrc" | "writeConfig">> & FixtureOptions;
}

export interface CliResult {
  status: number;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  output: string;
  args: string[];
}

export interface UnresolvedImport {
  file: string;
  specifier: string;
  kind: "relative" | "alias" | "package";
  reason: string;
}

export interface ImportAnalysis {
  filesChecked: number;
  unresolved: UnresolvedImport[];
  externalPackages: string[];
}

export interface TypeCheckResult {
  status: "ok" | "failed" | "skipped";
  reason?: string;
  output?: string;
}

export interface TreeSnapshot {
  files: Map<string, string>;
  /** Répertoires présents (chemins relatifs), pour détecter une création vide. */
  dirs: Set<string>;
}

const createdFixtures: Fixture[] = [];

export function stripAnsi(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/\u001b\[[0-9;]*m/g, "");
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf-8");
}

function defaultConfig(options: FixtureOptions, componentsPath: string): Record<string, unknown> {
  return {
    version: 1,
    componentsPath,
    theme: "default",
    glass: false,
    typescript: true,
    packageManager: "npm",
    aliases: {
      components: "@/components",
      lib: "@/lib",
      theme: "@/theme",
      ...(options.aliases ?? {}),
    },
    components: {},
    ...(options.config ?? {}),
  };
}

function defaultPaths(withSrc: boolean): Record<string, string[]> {
  return withSrc ? { "@/*": ["src/*"] } : { "@/*": ["*"] };
}

function defaultTsconfigIncludes(withSrc: boolean): string[] {
  return withSrc
    ? ["src"]
    : ["components", "contexts", "constants", "stores", "theme", "hooks", "lib", "types", "widgets", "templates"];
}

/**
 * Crée une fixture Expo minimale. Le package manager est volontairement `npm`
 * pour que les shims npm/npx interceptent les commandes.
 */
export function createFixture(options: FixtureOptions): Fixture {
  const name = options.name.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const root = join(tmpdir(), `rs-ui-e2e-${name}-${stamp}`);
  const metaDir = join(tmpdir(), `rs-ui-e2e-meta-${name}-${stamp}`);
  const homeDir = join(metaDir, "home");
  const binDir = join(metaDir, "bin");
  const withSrc = options.withSrc ?? true;
  const componentsPath = options.componentsPath ?? (withSrc ? "src/components/ui" : "components/ui");

  mkdirSync(root, { recursive: true });
  mkdirSync(homeDir, { recursive: true });
  mkdirSync(binDir, { recursive: true });
  mkdirSync(join(root, componentsPath), { recursive: true });

  if (withSrc) mkdirSync(join(root, "src"), { recursive: true });

  const dependencies: Record<string, string> = {
    expo: "~54.0.0",
    react: "18.3.1",
    "react-native": "0.76.0",
    ...(options.dependencies ?? {}),
  };

  writeJson(join(root, "package.json"), {
    name: `rs-ui-e2e-${name}`,
    version: "1.0.0",
    private: true,
    dependencies,
  });

  writeJson(join(root, "tsconfig.json"), {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-native",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      baseUrl: ".",
      paths: options.tsconfigPaths ?? defaultPaths(withSrc),
    },
    include: defaultTsconfigIncludes(withSrc),
  });

  if (options.writeConfig ?? true) {
    writeJson(join(root, "rashwright-ui.json"), defaultConfig(options, componentsPath));
  }

  // ── Shims npm / npx déterministes ────────────────────────────────────────
  const commandLog = join(metaDir, "pm-commands.log");
  writeFileSync(commandLog, "", "utf-8");
  writeJson(join(metaDir, "fake-pm-package.json"), {});
  writeFileSync(join(binDir, "fake-pm.mjs"), FAKE_PM_SCRIPT, "utf-8");

  const fakeScript = join(binDir, "fake-pm.mjs");
  if (process.platform === "win32") {
    writeFileSync(
      join(binDir, "npm.cmd"),
      `@echo off\r\nnode "${fakeScript}" npm %*\r\n`,
      "utf-8",
    );
    writeFileSync(
      join(binDir, "npx.cmd"),
      `@echo off\r\nnode "${fakeScript}" npx %*\r\n`,
      "utf-8",
    );
  } else {
    for (const bin of ["npm", "npx"]) {
      const shim = join(binDir, bin);
      writeFileSync(shim, `#!/bin/sh\nexec node "${fakeScript}" ${bin} "$@"\n`, "utf-8");
      try {
        // eslint-disable-next-line no-bitwise
        writeFileSync(shim, readFileSync(shim), { mode: 0o755 });
      } catch {
        /* le mode sera appliqué par le système si possible */
      }
    }
  }

  const pathKey = Object.keys(process.env).find((key) => key.toUpperCase() === "PATH") ?? "PATH";
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    [pathKey]: `${binDir}${delimiter}${process.env[pathKey] ?? ""}`,
    HOME: homeDir,
    USERPROFILE: homeDir,
    RS_UI_E2E_PM_LOG: commandLog,
    RS_UI_E2E_PM_PACKAGE_JSON: join(root, "package.json"),
    NO_COLOR: "1",
    FORCE_COLOR: "0",
    CI: "1",
  };

  const fixture: Fixture = {
    root,
    metaDir,
    homeDir,
    binDir,
    commandLog,
    env,
    options: {
      ...options,
      name,
      withSrc,
      writeConfig: options.writeConfig ?? true,
    },
  };

  createdFixtures.push(fixture);
  return fixture;
}

const FAKE_PM_SCRIPT = String.raw`
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const bin = argv.shift() ?? "npm";
const cwd = process.cwd();
const commandLine = [bin, ...argv].join(" ");

const logPath = process.env.RS_UI_E2E_PM_LOG;
if (logPath) {
  appendFileSync(logPath, JSON.stringify({ bin, args: argv, cwd, commandLine }) + "\n");
}

const failMatch = process.env.RS_UI_E2E_PM_FAIL;
if (failMatch && commandLine.includes(failMatch)) {
  console.error("[e2e shim] échec simulé : " + commandLine);
  process.exit(1);
}

function packageName(spec) {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/");
  return spec.split("@")[0];
}

const packages = [];
if (bin === "npx" || bin === "bunx" || bin === "pnpm" || bin === "yarn") {
  const installIndex = argv.indexOf("install");
  if (installIndex >= 0) packages.push(...argv.slice(installIndex + 1));
} else if (argv[0] === "install" || argv[0] === "i" || argv[0] === "add") {
  for (const arg of argv.slice(1)) {
    if (!arg.startsWith("-")) packages.push(arg);
  }
}

const pkgPath = process.env.RS_UI_E2E_PM_PACKAGE_JSON;
if (pkgPath && existsSync(pkgPath) && packages.length > 0) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  pkg.dependencies = pkg.dependencies ?? {};
  pkg.devDependencies = pkg.devDependencies ?? {};
  for (const spec of packages) {
    const name = packageName(spec);
    if (!name) continue;
    if (!(name in pkg.dependencies) && !(name in pkg.devDependencies)) {
      pkg.dependencies[name] = "0.0.0-e2e";
    }
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

process.exit(0);
`;

/** Exécute le vrai CLI dans la fixture. */
export function runCli(fixture: Fixture, args: string[], timeout = 120000): CliResult {
  const bun = process.env.RS_UI_E2E_BUN || process.env.BUN || "bun";
  const result = spawnSync(bun, [CLI_ENTRY, ...args], {
    cwd: fixture.root,
    env: fixture.env,
    encoding: "utf-8",
    timeout,
    windowsHide: true,
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  return {
    status: typeof result.status === "number" ? result.status : -1,
    signal: result.signal,
    stdout,
    stderr,
    output: stripAnsi(`${stdout}\n${stderr}`),
    args,
  };
}

/**
 * Exécute le vrai CLI sans bloquer la boucle d'événements du processus de test.
 *
 * Indispensable pour les scénarios qui lancent un serveur HTTP local dans le
 * même processus : `runCli` (spawnSync) empêcherait le serveur de répondre.
 */
export function runCliAsync(
  fixture: Fixture,
  args: string[],
  timeout = 120000,
): Promise<CliResult> {
  const bun = process.env.RS_UI_E2E_BUN || process.env.BUN || "bun";

  return new Promise<CliResult>((resolvePromise) => {
    const child = spawn(bun, [CLI_ENTRY, ...args], {
      cwd: fixture.root,
      env: fixture.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeout);

    child.stdout?.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolvePromise({
        status: -1,
        signal: null,
        stdout,
        stderr: `${stderr}\n${error.message}`,
        output: stripAnsi(`${stdout}\n${stderr}\n${error.message}`),
        args,
      });
    });

    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const suffix = timedOut
        ? `\n[e2e] processus interrompu après ${timeout} ms`
        : "";
      resolvePromise({
        status: timedOut ? -1 : code ?? -1,
        signal: signal ?? null,
        stdout,
        stderr,
        output: stripAnsi(`${stdout}\n${stderr}${suffix}`),
        args,
      });
    });
  });
}

/** Lit les commandes package manager interceptées. */
export function readPackageManagerCommands(fixture: Fixture): Array<{
  bin: string;
  args: string[];
  cwd: string;
  commandLine: string;
}> {
  if (!existsSync(fixture.commandLog)) return [];
  return readFileSync(fixture.commandLog, "utf-8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export function readJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export function readFixtureJson<T = unknown>(fixture: Fixture, relativePath: string): T {
  return readJson<T>(join(fixture.root, relativePath));
}

export function fixturePath(fixture: Fixture, relativePath: string): string {
  return join(fixture.root, relativePath);
}

export function fixtureExists(fixture: Fixture, relativePath: string): boolean {
  return existsSync(join(fixture.root, relativePath));
}

/** Cherche un fichier par nom dans la fixture (hors node_modules). */
export function findFixtureFile(fixture: Fixture, fileName: string): string | null {
  const visit = (dir: string): string | null => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        const found = visit(join(dir, entry.name));
        if (found) return found;
      } else if (entry.name === fileName) {
        return relative(fixture.root, join(dir, entry.name)).replace(/\\/g, "/");
      }
    }
    return null;
  };
  return visit(fixture.root);
}

export function snapshotTree(root: string): TreeSnapshot {
  const files = new Map<string, string>();
  const dirs = new Set<string>();
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        const abs = join(dir, entry.name);
        dirs.add(`${relative(root, abs).replace(/\\/g, "/")}/`);
        visit(abs);
      } else if (entry.isFile()) {
        const abs = join(dir, entry.name);
        const rel = relative(root, abs).replace(/\\/g, "/");
        files.set(rel, createHash("sha256").update(readFileSync(abs)).digest("hex"));
      }
    }
  };
  visit(root);
  return { files, dirs };
}

export interface SnapshotDiff {
  added: string[];
  removed: string[];
  changed: string[];
  /** Répertoires créés qui n'existaient pas avant (y compris vides). */
  addedDirs: string[];
  /** Répertoires supprimés. */
  removedDirs: string[];
  isEmpty: boolean;
}

export function diffSnapshots(before: TreeSnapshot, after: TreeSnapshot): SnapshotDiff {
  const added = [...after.files.keys()].filter((key) => !before.files.has(key)).sort();
  const removed = [...before.files.keys()].filter((key) => !after.files.has(key)).sort();
  const changed = [...after.files.keys()]
    .filter((key) => before.files.has(key) && before.files.get(key) !== after.files.get(key))
    .sort();
  const addedDirs = [...after.dirs].filter((key) => !before.dirs.has(key)).sort();
  const removedDirs = [...before.dirs].filter((key) => !after.dirs.has(key)).sort();
  return {
    added,
    removed,
    changed,
    addedDirs,
    removedDirs,
    isEmpty:
      added.length +
        removed.length +
        changed.length +
        addedDirs.length +
        removedDirs.length ===
      0,
  };
}

export function formatSnapshotDiff(diff: SnapshotDiff): string {
  const lines: string[] = [];
  if (diff.added.length) lines.push(`ajoutés: ${diff.added.join(", ")}`);
  if (diff.removed.length) lines.push(`supprimés: ${diff.removed.join(", ")}`);
  if (diff.changed.length) lines.push(`modifiés: ${diff.changed.join(", ")}`);
  if (diff.addedDirs.length) lines.push(`dossiers ajoutés: ${diff.addedDirs.join(", ")}`);
  if (diff.removedDirs.length) lines.push(`dossiers supprimés: ${diff.removedDirs.join(", ")}`);
  return lines.length ? lines.join(" | ") : "aucun changement";
}

function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const IMPORT_PATTERN =
  /(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\s*\(\s*["']([^"']+)["']\s*\)/g;

function extractSpecifiers(code: string): string[] {
  const cleaned = stripComments(code);
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  IMPORT_PATTERN.lastIndex = 0;
  while ((match = IMPORT_PATTERN.exec(cleaned)) !== null) {
    const spec = match[1] ?? match[2] ?? match[3];
    if (spec) found.add(spec);
  }
  return [...found];
}

function readTsconfigPaths(root: string): Array<{ pattern: string; targets: string[] }> {
  const tsconfigPath = join(root, "tsconfig.json");
  if (!existsSync(tsconfigPath)) return [];
  try {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
    const rawPaths = tsconfig?.compilerOptions?.paths ?? {};
    return Object.entries(rawPaths).map(([pattern, targets]) => ({
      pattern,
      targets: Array.isArray(targets) ? (targets as string[]) : [String(targets)],
    }));
  } catch {
    return [];
  }
}

function readPackageNames(root: string): Set<string> {
  const pkgPath = join(root, "package.json");
  if (!existsSync(pkgPath)) return new Set();
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...Object.keys(pkg.optionalDependencies ?? {}),
    ]);
  } catch {
    return new Set();
  }
}

function isNodeBuiltin(specifier: string): boolean {
  if (specifier.startsWith("node:")) return true;
  return NODE_BUILTINS.has(specifier.split("/")[0]);
}

function externalPackageName(specifier: string): string {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

function resolveCandidate(root: string, pathValue: string): string | null {
  const absolute = pathValue.startsWith(".") || pathValue.startsWith("/")
    ? resolve(root, pathValue)
    : resolve(root, pathValue);
  const candidates = [
    absolute,
    `${absolute}.ts`,
    `${absolute}.tsx`,
    `${absolute}.js`,
    `${absolute}.jsx`,
    `${absolute}.json`,
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

function resolveAlias(
  specifier: string,
  aliasPatterns: Array<{ pattern: string; targets: string[] }>,
  root: string,
): string | null {
  const exact = aliasPatterns.find((entry) => !entry.pattern.includes("*") && entry.pattern === specifier);
  if (exact) {
    for (const target of exact.targets) {
      const resolved = resolveCandidate(root, target);
      if (resolved) return resolved;
    }
  }

  const wildcard = aliasPatterns
    .filter((entry) => entry.pattern.includes("*"))
    .sort((a, b) => b.pattern.length - a.pattern.length);

  for (const entry of wildcard) {
    const [prefix, suffix] = entry.pattern.split("*");
    if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix ?? "")) continue;
    const middle = specifier.slice(prefix.length, specifier.length - (suffix?.length ?? 0));
    for (const target of entry.targets) {
      const substituted = target.replace("*", middle);
      const resolved = resolveCandidate(root, substituted);
      if (resolved) return resolved;
    }
  }

  return null;
}

/**
 * Analyse indépendante des imports :
 *   - résolution réelle des imports relatifs et des aliases tsconfig ;
 *   - présence des packages externes dans package.json ;
 *   - ne se fie jamais au lockfile.
 */
export function analyzeImports(root: string): ImportAnalysis {
  const aliasPatterns = readTsconfigPaths(root);
  const packageNames = readPackageNames(root);
  const unresolved: UnresolvedImport[] = [];
  const externalPackages = new Set<string>();
  let filesChecked = 0;

  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolute = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) continue;
        visit(absolute);
        continue;
      }
      if (!entry.isFile() || !/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) continue;

      filesChecked += 1;
      const relativeFile = relative(root, absolute).replace(/\\/g, "/");
      const code = readFileSync(absolute, "utf-8");

      for (const specifier of extractSpecifiers(code)) {
        if (specifier.startsWith(".")) {
          const resolved = resolveCandidate(root, join(dirname(relativeFile), specifier));
          if (!resolved) {
            unresolved.push({
              file: relativeFile,
              specifier,
              kind: "relative",
              reason: "fichier introuvable",
            });
          }
          continue;
        }

        if (specifier.startsWith("/")) {
          const resolved = resolveCandidate(root, specifier);
          if (!resolved) {
            unresolved.push({
              file: relativeFile,
              specifier,
              kind: "relative",
              reason: "chemin absolu introuvable",
            });
          }
          continue;
        }

        if (isNodeBuiltin(specifier)) continue;

        const aliasResolved = resolveAlias(specifier, aliasPatterns, root);
        const looksLikeAlias = aliasPatterns.some((entry) => {
          const [prefix, suffix] = entry.pattern.split("*");
          return specifier.startsWith(prefix) && (suffix === undefined || specifier.endsWith(suffix));
        });

        if (aliasResolved) continue;

        if (looksLikeAlias) {
          unresolved.push({
            file: relativeFile,
            specifier,
            kind: "alias",
            reason: "alias déclaré dans tsconfig.paths mais cible introuvable",
          });
          continue;
        }

        const packageName = externalPackageName(specifier);
        if (!packageName) continue;
        externalPackages.add(packageName);
        if (!packageNames.has(packageName)) {
          unresolved.push({
            file: relativeFile,
            specifier,
            kind: "package",
            reason: `package ${packageName} absent de package.json`,
          });
        }
      }
    }
  };

  visit(root);

  return {
    filesChecked,
    unresolved,
    externalPackages: [...externalPackages].sort(),
  };
}

export function formatUnresolvedImports(analysis: ImportAnalysis): string {
  if (analysis.unresolved.length === 0) return "aucun import non résolu";
  return analysis.unresolved
    .map((item) => `- ${item.file}: "${item.specifier}" (${item.kind}) — ${item.reason}`)
    .join("\n");
}

/**
 * Exécute `tsc --noEmit` dans la fixture quand ses dépendances de types sont
 * réellement présentes. Sinon, le skip est explicite : l'analyse d'imports
 * indépendante fait foi, et aucun succès TypeScript n'est inventé.
 */
export function checkTypeScript(root: string, timeout = 120000): TypeCheckResult {
  if (!existsSync(join(root, "node_modules"))) {
    return {
      status: "skipped",
      reason: "node_modules absent — installation npm/Expo non exécutée dans la fixture",
    };
  }
  if (!existsSync(join(root, "node_modules", "typescript"))) {
    return {
      status: "skipped",
      reason: "typescript absent de node_modules",
    };
  }

  const tscBin = join(root, "node_modules", "typescript", "bin", "tsc");
  if (!existsSync(tscBin)) {
    return {
      status: "skipped",
      reason: "binaire tsc introuvable",
    };
  }

  const result = spawnSync(process.execPath, [tscBin, "--noEmit"], {
    cwd: root,
    encoding: "utf-8",
    timeout,
    windowsHide: true,
  });

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

export function cleanupFixtures(): void {
  if (process.env.RS_UI_E2E_KEEP === "1") return;
  for (const fixture of createdFixtures.splice(0)) {
    for (const dir of [fixture.root, fixture.metaDir]) {
      try {
        rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch {
        /* nettoyage best-effort : ne masque pas le résultat du test */
      }
    }
  }
}

/** Chemin source d'un artefact du registre local (pour le serveur distant). */
export function registrySourcePath(relativePath: string): string {
  return join(UI_MOBILE_ROOT, relativePath);
}
