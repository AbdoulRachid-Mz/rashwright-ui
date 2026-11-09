/**
 * component-detector.ts — Détecteur automatique et exhaustif de dépendances pour composants, templates et widgets.
 *
 * Fonctionnement inspiré de shadcn/ui :
 * Lors de l'ajout d'un composant (`rs-ui add <composant>`) ou d'un artefact
 * (`rs-ui add -t <template>` / `rs-ui add -w <widget>`), ce module inspecte le
 * code réel et les métadonnées pour identifier :
 *   1. Les composants du registre réellement importés (dépendances transitives).
 *   2. Les fondations internes réellement importées (theme, glass, core-ui,
 *      liquid, responsive, upload, tab-bar) et leurs fichiers.
 *   3. Les dépendances Expo et npm nécessaires.
 *
 * Les mappings ne sont plus une liste statique : ils sont dérivés des fichiers
 * déclarés par les manifestes `registry/foundations/*.json`. Un import interne
 * qui ne correspond à aucun fichier installable est signalé dans
 * `unresolvedImports` ; il n'est jamais ignoré silencieusement.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, posix } from "node:path";
import { getTemplateDefinition } from "./templates-registry.js";
import { getWidgetDefinition } from "./widgets-registry.js";
import {
  REGISTRY_ROOT,
  SOURCE_ROOT,
  TEMPLATES_ROOT,
  WIDGETS_ROOT,
} from "./paths.js";
import {
  loadAllComponentEntries,
  loadAllFoundationEntries,
  type ComponentRegistryEntry,
} from "./dependency-resolver.js";

export interface ComponentRequirementPlan {
  /** Composants du registre à ajouter (avec dépendances transitives). */
  components: string[];
  /** Fondations internes requises (dérivées des imports et des manifestes). */
  foundations: string[];
  /** Fichiers internes à copier depuis la source (relatifs à ui-mobile/ : "hooks/use-responsive.ts", "lib/responsive.ts"). */
  missingInternalFiles: Array<{ sourceRelative: string; destinationRelative: string }>;
  /** Dépendances Expo manquantes dans le package.json cible (ex: ["expo-device", "react-native-reanimated"]). */
  missingExpoDeps: string[];
  /** Dépendances npm manquantes dans le package.json cible (ex: ["zustand", "clsx"]). */
  missingNpmDeps: string[];
  /** Imports internes non résolus : jamais ignorés. */
  unresolvedImports: UnresolvedImport[];
}

export interface UnresolvedImport {
  /** Fichier source relatif à la racine ui-mobile. */
  file: string;
  /** Spécificateur importé tel qu'écrit dans le code. */
  specifier: string;
  reason: string;
}

/**
 * Imports internes volontairement non installables. Chaque entrée doit
 * expliquer pourquoi : une simple absence ne suffit jamais.
 *
 * Ce registre est vide tant qu'aucun cas légitime n'est identifié. Le test
 * exhaustif échoue si un import interne n'est ni résolu, ni installable, ni
 * présent ici avec une justification.
 */
export const WHITELISTED_INTERNAL_IMPORTS: Readonly<Record<string, string>> =
  Object.freeze({});

interface FoundationInfo {
  files: string[];
  expoDeps: string[];
  npmDeps: string[];
  requiresFoundations: string[];
}

interface ComponentInfo {
  files: string[];
  expoDeps: string[];
  npmDeps: string[];
  requiresComponents: string[];
  requiresFoundations: string[];
}

type PackageKind = "npm" | "expo";

interface DetectorIndexes {
  sourceRoot: string;
  registryRoot: string;
  foundationByFile: Map<string, string>;
  foundationInfo: Map<string, FoundationInfo>;
  componentByFile: Map<string, string>;
  componentInfo: Map<string, ComponentInfo>;
  packageKinds: Map<string, PackageKind>;
}

const INDEX_CACHE = new Map<string, DetectorIndexes>();

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function unique(values: Iterable<string>): string[] {
  return Array.from(new Set(values));
}

function collectPackageKinds(
  entry: Pick<
    ComponentRegistryEntry,
    "dependencies" | "expoDependencies" | "optionalExpoDependencies"
  >,
  target: Map<string, PackageKind>,
): void {
  for (const dep of entry.dependencies ?? []) {
    if (!target.has(dep)) target.set(dep, "npm");
  }
  for (const dep of entry.expoDependencies ?? []) {
    target.set(dep, "expo");
  }
  for (const dep of entry.optionalExpoDependencies ?? []) {
    target.set(dep, "expo");
  }
}

function readManifestDependencies(
  registryRoot: string,
  folder: "hooks" | "lib",
  target: Map<string, PackageKind>,
): void {
  const dir = join(registryRoot, folder);
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const parsed = JSON.parse(
        readFileSync(join(dir, file), "utf-8"),
      ) as Partial<ComponentRegistryEntry>;
      collectPackageKinds(
        {
          dependencies: parsed.dependencies ?? [],
          expoDependencies: parsed.expoDependencies ?? [],
          optionalExpoDependencies: parsed.optionalExpoDependencies ?? [],
        },
        target,
      );
    } catch {
      // Un manifeste illisible est déjà bloquant dans le résolveur ; le
      // détecteur ne doit pas inventer de dépendance à partir de rien.
    }
  }
}

function buildIndexes(registryRoot: string, sourceRoot: string): DetectorIndexes {
  const foundationByFile = new Map<string, string>();
  const foundationInfo = new Map<string, FoundationInfo>();
  const componentByFile = new Map<string, string>();
  const componentInfo = new Map<string, ComponentInfo>();
  const packageKinds = new Map<string, PackageKind>();

  const foundations = loadAllFoundationEntries(registryRoot);
  for (const foundation of foundations) {
    const files = (foundation.files ?? []).map(toPosix);
    foundationInfo.set(foundation.name, {
      files,
      expoDeps: unique([
        ...(foundation.expoDependencies ?? []),
        ...(foundation.optionalExpoDependencies ?? []),
      ]),
      npmDeps: unique(foundation.dependencies ?? []),
      requiresFoundations: unique(foundation.requiresFoundations ?? []),
    });
    for (const file of files) {
      if (!foundationByFile.has(file)) foundationByFile.set(file, foundation.name);
    }
    collectPackageKinds(foundation, packageKinds);
  }

  const components = loadAllComponentEntries(registryRoot);
  for (const component of components) {
    const files = (component.files ?? []).map(toPosix);
    componentInfo.set(component.name, {
      files,
      expoDeps: unique([
        ...(component.expoDependencies ?? []),
        ...(component.optionalExpoDependencies ?? []),
      ]),
      npmDeps: unique(component.dependencies ?? []),
      requiresComponents: unique(component.requiresComponents ?? []),
      requiresFoundations: unique(component.requiresFoundations ?? []),
    });
    for (const file of files) {
      if (!componentByFile.has(file)) componentByFile.set(file, component.name);
    }
    collectPackageKinds(component, packageKinds);
  }

  // Primitives Core UI : déclarées par la fondation core-ui, jamais par un
  // manifeste de composant. Elles restent visitables comme composants pour
  // préserver l'API historique (`plan.components` contient text/view).
  for (const core of ["text", "view"]) {
    const file = `components/ui/${core}.tsx`;
    if (!componentInfo.has(core)) {
      componentInfo.set(core, {
        files: [file],
        expoDeps: [],
        npmDeps: [],
        requiresComponents: [],
        requiresFoundations: ["core-ui"],
      });
      if (!componentByFile.has(file)) componentByFile.set(file, core);
    }
  }

  readManifestDependencies(registryRoot, "hooks", packageKinds);
  readManifestDependencies(registryRoot, "lib", packageKinds);

  return {
    sourceRoot,
    registryRoot,
    foundationByFile,
    foundationInfo,
    componentByFile,
    componentInfo,
    packageKinds,
  };
}

function getIndexes(registryRoot: string, sourceRoot: string): DetectorIndexes {
  const key = `${registryRoot}::${sourceRoot}`;
  const cached = INDEX_CACHE.get(key);
  if (cached) return cached;
  const built = buildIndexes(registryRoot, sourceRoot);
  INDEX_CACHE.set(key, built);
  return built;
}

/**
 * Normalise un chemin relatif et refuse toute sortie de la racine du paquet.
 */
function normalizeRelativePath(input: string): string | null {
  const normalized = posix.normalize(input.replace(/\\/g, "/"));
  if (normalized === "." || normalized === "" || normalized === "..") return null;
  if (normalized.startsWith("../")) return null;
  return normalized.replace(/^\.\//, "");
}

const SOURCE_EXTENSIONS = [".tsx", ".ts", ".d.ts"];

/**
 * Cherche un fichier source réel en essayant les extensions et les index.
 * Retourne le chemin relatif à `sourceRoot`, ou `null`.
 */
function findSourceFile(baseRelative: string, sourceRoot: string): string | null {
  const withoutJsExtension = baseRelative.replace(/\.(js|jsx|mjs|cjs)$/, "");
  const candidates = [withoutJsExtension];

  for (const ext of SOURCE_EXTENSIONS) {
    candidates.push(`${withoutJsExtension}${ext}`);
  }
  for (const ext of SOURCE_EXTENSIONS) {
    candidates.push(`${withoutJsExtension}/index${ext}`);
  }

  for (const candidate of candidates) {
    const absolute = join(sourceRoot, candidate);
    if (existsSync(absolute) && statSync(absolute).isFile()) {
      return toPosix(candidate);
    }
  }
  return null;
}

const IMPLICIT_PEERS = new Set(["react", "react-native"]);

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

/** `zustand/middleware` → `zustand`, `@scope/pkg/sub` → `@scope/pkg`. */
function normalizeExternalPackage(specifier: string): string {
  const clean = specifier.trim();
  if (clean.startsWith("@")) {
    return clean.split("/").slice(0, 2).join("/");
  }
  return clean.split("/")[0];
}

function classifyPackage(
  packageName: string,
  indexes: DetectorIndexes,
): PackageKind {
  const known = indexes.packageKinds.get(packageName);
  if (known) return known;
  if (
    packageName === "expo" ||
    packageName.startsWith("expo-") ||
    packageName.startsWith("react-native-") ||
    packageName.startsWith("@expo/") ||
    packageName.startsWith("@react-native")
  ) {
    return "expo";
  }
  return "npm";
}

type SpecifierResolution =
  | { kind: "file"; file: string }
  | { kind: "external"; packageName: string }
  | { kind: "unresolved"; reason: string };

function resolveSpecifier(
  specifier: string,
  importer: string,
  sourceRoot: string,
): SpecifierResolution {
  if (specifier.startsWith(".")) {
    const joined = posix.join(posix.dirname(importer), specifier);
    const base = normalizeRelativePath(joined);
    if (!base) {
      return {
        kind: "unresolved",
        reason: `import relatif hors du paquet (${specifier})`,
      };
    }
    const file = findSourceFile(base, sourceRoot);
    if (!file) {
      return {
        kind: "unresolved",
        reason: `fichier introuvable pour l'import relatif '${specifier}'`,
      };
    }
    return { kind: "file", file };
  }

  if (specifier.startsWith("@/")) {
    const base = normalizeRelativePath(specifier.slice(2));
    if (!base) {
      return {
        kind: "unresolved",
        reason: `alias interne invalide (${specifier})`,
      };
    }
    const file = findSourceFile(base, sourceRoot);
    if (!file) {
      return {
        kind: "unresolved",
        reason: `fichier introuvable pour l'alias '${specifier}'`,
      };
    }
    return { kind: "file", file };
  }

  return {
    kind: "external",
    packageName: normalizeExternalPackage(specifier),
  };
}

interface ClassifiedFile {
  foundation?: string;
  component?: string;
}

function classifyResolvedFile(
  file: string,
  indexes: DetectorIndexes,
): ClassifiedFile {
  return {
    foundation: indexes.foundationByFile.get(file),
    component: indexes.componentByFile.get(file),
  };
}

/**
 * Extrait toutes les cibles d'import statiques d'un contenu TypeScript.
 */
export function extractImportTargets(code: string): string[] {
  const targets = new Set<string>();
  const importRegex =
    /(?:import|export)\s+(?:[\w*\s{},$]+from\s+)?['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(code)) !== null) {
    targets.add(match[1]);
  }

  // Support des imports dynamiques / side-effects
  const sideEffectRegex = /import\s+['"]([^'"]+)['"]/g;
  while ((match = sideEffectRegex.exec(code)) !== null) {
    targets.add(match[1]);
  }

  return Array.from(targets);
}

/**
 * Lit le package.json d'un projet cible et extrait la liste des dépendances installées.
 */
export function getInstalledPackageNames(projectRoot: string): Set<string> {
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath)) return new Set();

  try {
    const raw = readFileSync(pkgPath, "utf-8");
    const json = JSON.parse(raw);
    const deps = Object.keys(json.dependencies || {});
    const devDeps = Object.keys(json.devDependencies || {});
    return new Set([...deps, ...devDeps]);
  } catch {
    return new Set();
  }
}

/**
 * Détermine si le projet cible utilise l'arborescence `src/` pour ses modules.
 */
export function isUsingSrcDirectory(projectRoot: string): boolean {
  return existsSync(join(projectRoot, "src"));
}

/**
 * Collecte les besoins réels d'un ensemble de fichiers. Une même instance est
 * utilisée pour un composant, un template ou un widget : la détection est donc
 * strictement identique dans les trois cas.
 */
class RequirementCollector {
  readonly components = new Set<string>();
  readonly foundations = new Set<string>();
  readonly internalFiles = new Set<string>();
  readonly expoDeps = new Set<string>();
  readonly npmDeps = new Set<string>();
  readonly unresolved: UnresolvedImport[] = [];

  private readonly visitedComponents = new Set<string>();
  private readonly visitedFoundations = new Set<string>();
  private readonly analyzedFiles = new Set<string>();
  private localFiles = new Set<string>();

  constructor(
    private readonly indexes: DetectorIndexes,
    private readonly installedPackages: Set<string>,
  ) {}

  setLocalFiles(files: Iterable<string>): void {
    this.localFiles = new Set(Array.from(files, toPosix));
  }

  visitFoundation(name: string): void {
    if (this.visitedFoundations.has(name)) return;
    this.visitedFoundations.add(name);

    const info = this.indexes.foundationInfo.get(name);
    if (!info) {
      this.unresolved.push({
        file: "<manifeste>",
        specifier: `foundation:${name}`,
        reason: "fondation requise mais manifeste introuvable",
      });
      return;
    }

    this.foundations.add(name);
    for (const file of info.files) this.internalFiles.add(file);
    for (const dep of info.expoDeps) {
      if (!this.installedPackages.has(dep)) this.expoDeps.add(dep);
    }
    for (const dep of info.npmDeps) {
      if (!this.installedPackages.has(dep)) this.npmDeps.add(dep);
    }
    for (const required of info.requiresFoundations) {
      this.visitFoundation(required);
    }
  }

  visitComponent(name: string): void {
    const cleanName = name.toLowerCase().trim();
    if (!cleanName || this.visitedComponents.has(cleanName)) return;
    this.visitedComponents.add(cleanName);
    this.components.add(cleanName);

    const info = this.indexes.componentInfo.get(cleanName);
    if (!info) {
      // Un nom demandé mais absent du registre n'est pas silencieusement
      // inventé : il est signalé, tout en conservant le comportement de
      // recherche historique du fichier `components/ui/<nom>.tsx`.
      this.unresolved.push({
        file: "<manifeste>",
        specifier: `component:${cleanName}`,
        reason: "composant demandé absent du registre",
      });
      this.analyzeFiles([`components/ui/${cleanName}.tsx`]);
      return;
    }

    for (const required of info.requiresComponents) {
      this.visitComponent(required);
    }
    for (const required of info.requiresFoundations) {
      this.visitFoundation(required);
    }
    for (const dep of info.expoDeps) {
      if (!this.installedPackages.has(dep)) this.expoDeps.add(dep);
    }
    for (const dep of info.npmDeps) {
      if (!this.installedPackages.has(dep)) this.npmDeps.add(dep);
    }

    this.analyzeFiles(info.files);
  }

  analyzeFiles(files: Iterable<string>): void {
    for (const rawFile of files) {
      const file = toPosix(rawFile);
      if (this.analyzedFiles.has(file)) continue;
      this.analyzedFiles.add(file);

      const absolute = join(this.indexes.sourceRoot, file);
      if (!existsSync(absolute) || !statSync(absolute).isFile()) {
        this.unresolved.push({
          file,
          specifier: "<source>",
          reason: "fichier source déclaré introuvable",
        });
        continue;
      }

      let content: string;
      try {
        content = readFileSync(absolute, "utf-8");
      } catch (error) {
        this.unresolved.push({
          file,
          specifier: "<source>",
          reason: `lecture impossible (${(error as Error).message})`,
        });
        continue;
      }

      for (const target of extractImportTargets(content)) {
        this.resolveImport(file, target);
      }
    }
  }

  private resolveImport(importer: string, target: string): void {
    const resolution = resolveSpecifier(
      target,
      importer,
      this.indexes.sourceRoot,
    );

    if (resolution.kind === "unresolved") {
      this.unresolved.push({
        file: importer,
        specifier: target,
        reason: resolution.reason,
      });
      return;
    }

    if (resolution.kind === "file") {
      const resolved = resolution.file;
      if (this.localFiles.has(resolved)) return;

      const classified = classifyResolvedFile(resolved, this.indexes);
      if (classified.foundation) this.visitFoundation(classified.foundation);
      if (classified.component) this.visitComponent(classified.component);

      if (!classified.foundation && !classified.component) {
        const justification = WHITELISTED_INTERNAL_IMPORTS[target];
        if (justification) return;
        this.unresolved.push({
          file: importer,
          specifier: target,
          reason: `fichier résolu mais non déclaré par un manifeste installable (${resolved})`,
        });
      }
      return;
    }

    const pkg = resolution.packageName;
    if (!pkg || IMPLICIT_PEERS.has(pkg) || NODE_BUILTINS.has(pkg)) return;

    const kind = classifyPackage(pkg, this.indexes);
    if (this.installedPackages.has(pkg)) return;
    if (kind === "expo") {
      this.expoDeps.add(pkg);
    } else {
      this.npmDeps.add(pkg);
    }
  }

  finalize(projectRoot: string, useSrc: boolean): ComponentRequirementPlan {
    const missingInternalFiles: Array<{
      sourceRelative: string;
      destinationRelative: string;
    }> = [];

    for (const sourceRelative of [...this.internalFiles].sort()) {
      const destinationRelative = useSrc
        ? `src/${sourceRelative}`
        : sourceRelative;
      if (!existsSync(join(projectRoot, destinationRelative))) {
        missingInternalFiles.push({ sourceRelative, destinationRelative });
      }
    }

    return {
      components: [...this.components].sort(),
      foundations: [...this.foundations].sort(),
      missingInternalFiles,
      missingExpoDeps: [...this.expoDeps].sort(),
      missingNpmDeps: [...this.npmDeps].sort(),
      unresolvedImports: [...this.unresolved].sort((a, b) =>
        `${a.file}:${a.specifier}`.localeCompare(`${b.file}:${b.specifier}`),
      ),
    };
  }
}

/**
 * Détecte l'ensemble des besoins pour un ensemble de composants et compare avec le projet cible.
 */
export function detectMissingComponentRequirements(
  componentNames: string[],
  projectRoot: string,
  options: {
    registryRoot?: string;
    sourceRoot?: string;
  } = {},
): ComponentRequirementPlan {
  const registryRoot = options.registryRoot || REGISTRY_ROOT;
  const sourceRoot = options.sourceRoot || SOURCE_ROOT;
  const indexes = getIndexes(registryRoot, sourceRoot);
  const collector = new RequirementCollector(
    indexes,
    getInstalledPackageNames(projectRoot),
  );

  for (const name of componentNames) {
    collector.visitComponent(name);
  }

  return collector.finalize(projectRoot, isUsingSrcDirectory(projectRoot));
}

export interface SourceImportAnalysisInput {
  /** Fichiers à analyser, relatifs à la racine ui-mobile. */
  files: string[];
  /** Fichiers appartenant à l'artefact courant (template/widget) : imports locaux. */
  localFiles?: string[];
}

export interface SourceImportAnalysis {
  files: string[];
  components: string[];
  foundations: string[];
  expoDeps: string[];
  npmDeps: string[];
  unresolved: UnresolvedImport[];
}

/**
 * Analyse des fichiers arbitraires avec la même résolution que l'installation.
 * Utilisé par le test exhaustif : un import interne doit être résolu, installable
 * ou explicitement whitelisté avec justification.
 */
export function analyzeSourceImports(
  input: SourceImportAnalysisInput,
  options: {
    registryRoot?: string;
    sourceRoot?: string;
    projectRoot?: string;
  } = {},
): SourceImportAnalysis {
  const registryRoot = options.registryRoot || REGISTRY_ROOT;
  const sourceRoot = options.sourceRoot || SOURCE_ROOT;
  const indexes = getIndexes(registryRoot, sourceRoot);
  const installed = options.projectRoot
    ? getInstalledPackageNames(options.projectRoot)
    : new Set<string>();

  const collector = new RequirementCollector(indexes, installed);
  collector.setLocalFiles(input.localFiles ?? []);
  collector.analyzeFiles(input.files);

  return {
    files: input.files.map(toPosix),
    components: [...collector.components].sort(),
    foundations: [...collector.foundations].sort(),
    expoDeps: [...collector.expoDeps].sort(),
    npmDeps: [...collector.npmDeps].sort(),
    unresolved: [...collector.unresolved].sort((a, b) =>
      `${a.file}:${a.specifier}`.localeCompare(`${b.file}:${b.specifier}`),
    ),
  };
}

/**
 * Copie les fichiers internes manquants dans le projet cible.
 */
export function copyMissingInternalFiles(
  requirements: ComponentRequirementPlan,
  projectRoot: string,
  options: {
    sourceRoot?: string;
    dryRun?: boolean;
  } = {},
): Array<{ file: string; status: "copied" | "skipped" | "failed" }> {
  const sourceRoot = options.sourceRoot || SOURCE_ROOT;
  const results: Array<{
    file: string;
    status: "copied" | "skipped" | "failed";
  }> = [];

  for (const item of requirements.missingInternalFiles) {
    const absSource = join(sourceRoot, item.sourceRelative);
    const absDest = join(projectRoot, item.destinationRelative);

    if (!existsSync(absSource)) {
      results.push({ file: item.destinationRelative, status: "failed" });
      continue;
    }

    if (options.dryRun) {
      results.push({ file: item.destinationRelative, status: "copied" });
      continue;
    }

    try {
      const destDir = dirname(absDest);
      if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

      copyFileSync(absSource, absDest);
      results.push({ file: item.destinationRelative, status: "copied" });
    } catch {
      results.push({ file: item.destinationRelative, status: "failed" });
    }
  }

  return results;
}

type ArtifactKind = "template" | "widget";

function detectMissingArtifactRequirements(
  kind: ArtifactKind,
  id: string,
  projectRoot: string,
  options: {
    registryRoot?: string;
    sourceRoot?: string;
    templatesRoot?: string;
    widgetsRoot?: string;
  },
): ComponentRequirementPlan {
  const registryRoot = options.registryRoot || REGISTRY_ROOT;
  const sourceRoot = options.sourceRoot || SOURCE_ROOT;
  const indexes = getIndexes(registryRoot, sourceRoot);
  const installed = getInstalledPackageNames(projectRoot);

  const definition =
    kind === "template"
      ? getTemplateDefinition(id, options.templatesRoot || TEMPLATES_ROOT)
      : getWidgetDefinition(id, options.widgetsRoot || WIDGETS_ROOT);

  if (!definition) {
    return {
      components: [],
      foundations: [],
      missingInternalFiles: [],
      missingExpoDeps: [],
      missingNpmDeps: [],
      unresolvedImports: [
        {
          file: "<manifeste>",
          specifier: `${kind}:${id}`,
          reason: `manifeste ${kind} introuvable`,
        },
      ],
    };
  }

  const collector = new RequirementCollector(indexes, installed);

  for (const component of definition.requiredComponents) {
    collector.visitComponent(component);
  }
  for (const foundation of definition.requiresFoundations) {
    collector.visitFoundation(foundation);
  }
  for (const dep of definition.dependencies) {
    if (!installed.has(dep)) collector.npmDeps.add(dep);
  }
  for (const dep of definition.expoDependencies) {
    if (!installed.has(dep)) collector.expoDeps.add(dep);
  }

  const rootPrefix =
    kind === "template" ? `templates/${definition.id}` : `widgets/${definition.id}`;
  const sourceFiles = definition.files
    .filter((file) => /\.(ts|tsx|d\.ts)$/.test(file))
    .map((file) => `${rootPrefix}/${toPosix(file)}`);

  collector.setLocalFiles(sourceFiles);
  collector.analyzeFiles(sourceFiles);

  return collector.finalize(projectRoot, isUsingSrcDirectory(projectRoot));
}

/**
 * Détecte l'ensemble des besoins pour un template complet (composants requis, logiques internes et dépendances).
 */
export function detectMissingTemplateRequirements(
  templateId: string,
  projectRoot: string,
  options: {
    registryRoot?: string;
    sourceRoot?: string;
    templatesRoot?: string;
  } = {},
): ComponentRequirementPlan {
  return detectMissingArtifactRequirements(
    "template",
    templateId,
    projectRoot,
    options,
  );
}

/**
 * Détecte l'ensemble des besoins pour un widget modulaire (composants requis, logiques internes et dépendances).
 */
export function detectMissingWidgetRequirements(
  widgetId: string,
  projectRoot: string,
  options: {
    registryRoot?: string;
    sourceRoot?: string;
    widgetsRoot?: string;
  } = {},
): ComponentRequirementPlan {
  return detectMissingArtifactRequirements(
    "widget",
    widgetId,
    projectRoot,
    options,
  );
}
