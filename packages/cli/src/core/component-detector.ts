/**
 * component-detector.ts — Détecteur automatique et exhaustif de dépendances pour composants et templates.
 *
 * Fonctionnement inspiré de shadcn/ui :
 * Lors de l'ajout d'un composant (`rs-ui add <composant>`) ou d'un template (`rs-ui template add <template>`),
 * ce module inspecte le code réel et les métadonnées pour identifier :
 *   1. Les fichiers internes requis (hooks, lib, types, constants, contexts, primitives liquid)
 *   2. Les composants enfants / requis (requiresComponents)
 *   3. Les dépendances Expo et npm nécessaires
 *
 * Il compare ensuite avec le projet cible et n'installe / ne copie QUE le delta manquant.
 */

import { existsSync, readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { getComponent } from "./registry.js";
import { getTemplateDefinition } from "./templates-registry.js";
import { getWidgetDefinition } from "./widgets-registry.js";
import { REGISTRY_ROOT, SOURCE_ROOT, TEMPLATES_ROOT, WIDGETS_ROOT } from "./paths.js";

export interface ComponentRequirementPlan {
  /** Composants du registre à ajouter (avec dépendances transitives). */
  components: string[];
  /** Fichiers internes à copier depuis la source (relatifs à ui-mobile/ : "hooks/use-responsive.ts", "lib/responsive.ts"). */
  missingInternalFiles: Array<{ sourceRelative: string; destinationRelative: string }>;
  /** Dépendances Expo manquantes dans le package.json cible (ex: ["expo-device", "react-native-reanimated"]). */
  missingExpoDeps: string[];
  /** Dépendances npm manquantes dans le package.json cible (ex: ["zustand", "clsx"]). */
  missingNpmDeps: string[];
}

/**
 * Mapping des imports de code connus vers leurs fichiers sources dans @rashwright/ui-mobile
 * et leurs packages externes requis.
 */
interface InternalMapping {
  /** Chemins relatifs à la racine de packages/ui-mobile */
  sourceFiles: string[];
  /** Packages expo obligatoires si cette logique est requise */
  expoDeps?: string[];
  /** Packages npm obligatoires si cette logique est requise */
  npmDeps?: string[];
}

const KNOWN_INTERNAL_MAPPINGS: Record<string, InternalMapping> = {
  // Hooks
  "@/hooks/use-responsive": {
    sourceFiles: ["hooks/use-responsive.ts", "lib/responsive.ts"],
  },
  "@/lib/responsive": {
    sourceFiles: ["lib/responsive.ts"],
  },
  "@/hooks/use-device": {
    sourceFiles: ["hooks/use-device.ts"],
    expoDeps: ["expo-device"],
  },
  "@/hooks/useBackHandler": {
    sourceFiles: ["hooks/useBackHandler.ts"],
  },
  "@/hooks/useScrollAwareTabBar": {
    sourceFiles: ["hooks/useScrollAwareTabBar.ts"],
  },
  "@/hooks/use-controllable-state": {
    sourceFiles: ["hooks/use-controllable-state.ts"],
  },
  "@/hooks/use-disclosure": {
    sourceFiles: ["hooks/use-disclosure.ts"],
  },

  // Libs & Primitives
  "@/lib/upload": {
    sourceFiles: [
      "lib/upload/index.ts",
      "lib/upload/types.ts",
      "lib/upload/errors.ts",
      "lib/upload/upload-manager.ts",
      "lib/upload/providers/local-provider.ts",
      "lib/upload/providers/mock-provider.ts",
      "lib/upload/providers/cloudinary-provider.ts",
      "lib/upload/providers/firebase-provider.ts",
      "lib/upload/providers/vercel-blob-provider.ts",
    ],
    expoDeps: ["expo-image-picker", "expo-file-system", "expo-document-picker"],
  },
  "@/lib/primitives/use-controllable-state": {
    sourceFiles: ["lib/primitives/use-controllable-state.ts"],
  },
  "@/lib/primitives/use-disclosure": {
    sourceFiles: ["lib/primitives/use-disclosure.ts"],
  },

  // Types
  "@/types/nativewind-ambient": {
    sourceFiles: ["types/nativewind-ambient.d.ts"],
  },
  "@/types/ambient": {
    sourceFiles: ["types/ambient.d.ts"],
  },
};

/**
 * Extrait toutes les cibles d'import statiques d'un contenu TypeScript.
 */
export function extractImportTargets(code: string): string[] {
  const targets = new Set<string>();
  const importRegex = /(?:import|export)\s+(?:[\w*\s{},$]+from\s+)?['"]([^'"]+)['"]/g;

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
 * Détecte l'ensemble des besoins pour un ensemble de composants et compare avec le projet cible.
 */
export function detectMissingComponentRequirements(
  componentNames: string[],
  projectRoot: string,
  options: {
    registryRoot?: string;
    sourceRoot?: string;
  } = {}
): ComponentRequirementPlan {
  const registryRoot = options.registryRoot || REGISTRY_ROOT;
  const sourceRoot = options.sourceRoot || SOURCE_ROOT;
  const installedPackages = getInstalledPackageNames(projectRoot);
  const useSrc = isUsingSrcDirectory(projectRoot);

  const resolvedComponents = new Set<string>();
  const internalFilesToEnsure = new Set<string>();
  const expoDepsToInstall = new Set<string>();
  const npmDepsToInstall = new Set<string>();

  // Fonction récursive de résolution des composants
  const visitComponent = (compName: string, visited = new Set<string>()) => {
    const cleanName = compName.toLowerCase().trim();
    if (visited.has(cleanName)) return;
    visited.add(cleanName);
    resolvedComponents.add(cleanName);

    // Cas spécial Core UI primitives (view, text)
    let files: string[] = [];
    if (cleanName === "view") {
      files = ["components/ui/view.tsx"];
    } else if (cleanName === "text") {
      files = ["components/ui/text.tsx"];
    } else {
      const entry = getComponent(cleanName, registryRoot);
      if (entry) {
        files = entry.files || [`components/ui/${cleanName}.tsx`];
        // Dépendances de composants déclarées
        for (const req of entry.requiresComponents || []) {
          visitComponent(req, visited);
        }
        // Dépendances Expo / npm déclarées
        for (const dep of entry.expoDependencies || []) {
          if (!installedPackages.has(dep)) expoDepsToInstall.add(dep);
        }
        for (const dep of entry.dependencies || []) {
          if (!installedPackages.has(dep)) npmDepsToInstall.add(dep);
        }
      } else {
        files = [`components/ui/${cleanName}.tsx`];
      }
    }

    // Inspecter le code source des fichiers du composant pour détecter les imports internes non déclarés
    for (const relFile of files) {
      const absPath = join(sourceRoot, relFile);
      if (!existsSync(absPath)) continue;

      try {
        const content = readFileSync(absPath, "utf-8");
        const targets = extractImportTargets(content);

        for (const target of targets) {
          // 1. Détection de hooks / lib / types connus
          for (const [importKey, mapping] of Object.entries(KNOWN_INTERNAL_MAPPINGS)) {
            if (target === importKey || target.startsWith(importKey + "/") || target.endsWith(importKey.replace("@/", ""))) {
              for (const f of mapping.sourceFiles) {
                internalFilesToEnsure.add(f);
              }
              for (const dep of mapping.expoDeps || []) {
                if (!installedPackages.has(dep)) expoDepsToInstall.add(dep);
              }
              for (const dep of mapping.npmDeps || []) {
                if (!installedPackages.has(dep)) npmDepsToInstall.add(dep);
              }
            }
          }

          // 2. Détection d'imports relatifs vers d'autres composants
          if (target.startsWith("./") && !target.includes("/liquid/") && !target.includes("/providers/")) {
            const childComp = target.replace(/^\.\//, "").replace(/\.tsx?$/, "");
            if (childComp && childComp !== "view" && childComp !== "text" && !childComp.includes("/")) {
              visitComponent(childComp, visited);
            }
          }

          // 3. Détection d'imports @/components/ui/<autre>
          if (target.startsWith("@/components/ui/")) {
            const childComp = target.replace("@/components/ui/", "").replace(/\.tsx?$/, "");
            if (childComp && childComp !== "view" && childComp !== "text" && !childComp.includes("/")) {
              visitComponent(childComp, visited);
            }
          }

          // 4. Détection directe de packages externes utilisés dans le code
          if (target === "expo-device" && !installedPackages.has("expo-device")) {
            expoDepsToInstall.add("expo-device");
          }
          if (target === "expo-image" && !installedPackages.has("expo-image")) {
            expoDepsToInstall.add("expo-image");
          }
          if (target === "expo-haptics" && !installedPackages.has("expo-haptics")) {
            expoDepsToInstall.add("expo-haptics");
          }
          if (target === "expo-blur" && !installedPackages.has("expo-blur")) {
            expoDepsToInstall.add("expo-blur");
          }
          if (target === "expo-linear-gradient" && !installedPackages.has("expo-linear-gradient")) {
            expoDepsToInstall.add("expo-linear-gradient");
          }
        }
      } catch {
        // En cas d'erreur de lecture ponctuelle, on continue
      }
    }
  };

  for (const name of componentNames) {
    visitComponent(name);
  }

  // Filtrer les fichiers internes qui n'existent pas encore dans le projet cible
  const missingInternalFiles: Array<{ sourceRelative: string; destinationRelative: string }> = [];

  for (const relFile of internalFilesToEnsure) {
    const destRel = useSrc ? `src/${relFile}` : relFile;
    const absDest = join(projectRoot, destRel);

    if (!existsSync(absDest)) {
      missingInternalFiles.push({
        sourceRelative: relFile,
        destinationRelative: destRel,
      });
    }
  }

  return {
    components: Array.from(resolvedComponents),
    missingInternalFiles,
    missingExpoDeps: Array.from(expoDepsToInstall),
    missingNpmDeps: Array.from(npmDepsToInstall),
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
  } = {}
): Array<{ file: string; status: "copied" | "skipped" | "failed" }> {
  const sourceRoot = options.sourceRoot || SOURCE_ROOT;
  const results: Array<{ file: string; status: "copied" | "skipped" | "failed" }> = [];

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
  } = {}
): ComponentRequirementPlan {
  const templatesRoot = options.templatesRoot || TEMPLATES_ROOT;
  const def = getTemplateDefinition(templateId, templatesRoot);
  const baseComponents = def ? def.requiredComponents : [];

  const plan = detectMissingComponentRequirements(baseComponents, projectRoot, options);

  if (def && Array.isArray(def.files)) {
    const installedPackages = getInstalledPackageNames(projectRoot);
    const sourceDir = join(templatesRoot, def.id);
    const useSrc = isUsingSrcDirectory(projectRoot);

    for (const relFile of def.files) {
      const absPath = join(sourceDir, relFile);
      if (!existsSync(absPath)) continue;

      try {
        const content = readFileSync(absPath, "utf-8");
        const targets = extractImportTargets(content);

        for (const target of targets) {
          for (const [importKey, mapping] of Object.entries(KNOWN_INTERNAL_MAPPINGS)) {
            if (target === importKey || target.startsWith(importKey + "/") || target.endsWith(importKey.replace("@/", ""))) {
              for (const f of mapping.sourceFiles) {
                const destRel = useSrc ? `src/${f}` : f;
                if (!existsSync(join(projectRoot, destRel))) {
                  if (!plan.missingInternalFiles.some((m) => m.destinationRelative === destRel)) {
                    plan.missingInternalFiles.push({
                      sourceRelative: f,
                      destinationRelative: destRel,
                    });
                  }
                }
              }
              for (const dep of mapping.expoDeps || []) {
                if (!installedPackages.has(dep) && !plan.missingExpoDeps.includes(dep)) {
                  plan.missingExpoDeps.push(dep);
                }
              }
              for (const dep of mapping.npmDeps || []) {
                if (!installedPackages.has(dep) && !plan.missingNpmDeps.includes(dep)) {
                  plan.missingNpmDeps.push(dep);
                }
              }
            }
          }
        }
      } catch {
        // Non-bloquant
      }
    }
  }

  return plan;
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
  } = {}
): ComponentRequirementPlan {
  const widgetsRoot = options.widgetsRoot || WIDGETS_ROOT;
  const def = getWidgetDefinition(widgetId, widgetsRoot);
  const baseComponents = def ? def.requiredComponents : [];

  const plan = detectMissingComponentRequirements(baseComponents, projectRoot, options);

  if (def && Array.isArray(def.files)) {
    const installedPackages = getInstalledPackageNames(projectRoot);
    const sourceDir = join(widgetsRoot, def.id);
    const useSrc = isUsingSrcDirectory(projectRoot);

    for (const relFile of def.files) {
      const absPath = join(sourceDir, relFile);
      if (!existsSync(absPath)) continue;

      try {
        const content = readFileSync(absPath, "utf-8");
        const targets = extractImportTargets(content);

        for (const target of targets) {
          for (const [importKey, mapping] of Object.entries(KNOWN_INTERNAL_MAPPINGS)) {
            if (target === importKey || target.startsWith(importKey + "/") || target.endsWith(importKey.replace("@/", ""))) {
              for (const f of mapping.sourceFiles) {
                const destRel = useSrc ? `src/${f}` : f;
                if (!existsSync(join(projectRoot, destRel))) {
                  if (!plan.missingInternalFiles.some((m) => m.destinationRelative === destRel)) {
                    plan.missingInternalFiles.push({
                      sourceRelative: f,
                      destinationRelative: destRel,
                    });
                  }
                }
              }
              for (const dep of mapping.expoDeps || []) {
                if (!installedPackages.has(dep) && !plan.missingExpoDeps.includes(dep)) {
                  plan.missingExpoDeps.push(dep);
                }
              }
              for (const dep of mapping.npmDeps || []) {
                if (!installedPackages.has(dep) && !plan.missingNpmDeps.includes(dep)) {
                  plan.missingNpmDeps.push(dep);
                }
              }
            }
          }
        }
      } catch {
        // Non-bloquant
      }
    }
  }

  return plan;
}
