/**
 * templates-registry.ts
 *
 * Charge et expose les définitions de templates Rashwright UI depuis les
 * modules autonomes (packages/ui-mobile/templates/<id>/template.json).
 *
 * Remplace à terme la source de vérité de AVAILABLE_TEMPLATES dans
 * templates-manager.ts (les métadonnées, pas generateTemplateScreenCode).
 */

import { join } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { TEMPLATES_ROOT } from "./paths.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TemplateScreenSpec {
  route: string;
  file: string;
  componentName: string;
  title?: string;
}

/** Manifeste d'un template autonome (correspond à template.json). */
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  componentName: string;
  entrypoint: string;
  /** Chemins relatifs au dossier du template. */
  files: string[];
  /** Noms des composants rs-ui requis. */
  requiredComponents: string[];
  /** Dépendances npm (non-Expo). */
  dependencies: string[];
  /** Dépendances Expo. */
  expoDependencies: string[];
  supportsGlass: boolean;
  /** Écrans additionnels pour Expo Router / navigation */
  screens?: TemplateScreenSpec[];
}

// ── Résolution du répertoire source ───────────────────────────────────────────

function resolveDefaultTemplatesRoot(): string {
  return TEMPLATES_ROOT;
}

// ── Lecture d'un template.json ────────────────────────────────────────────────

/**
 * Lit et valide un `template.json` pour un template donné.
 * Retourne `null` si le fichier est absent ou invalide.
 */
function readTemplateJson(
  templateDir: string
): TemplateDefinition | null {
  const manifestPath = join(templateDir, "template.json");

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const raw = readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<TemplateDefinition>;

    // Validation minimale des champs requis
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.componentName !== "string" ||
      typeof parsed.entrypoint !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      description: parsed.description ?? "",
      version: parsed.version ?? "0.0.0",
      componentName: parsed.componentName,
      entrypoint: parsed.entrypoint,
      files: Array.isArray(parsed.files) ? parsed.files : [],
      requiredComponents: Array.isArray(parsed.requiredComponents)
        ? parsed.requiredComponents
        : [],
      dependencies: Array.isArray(parsed.dependencies)
        ? parsed.dependencies
        : [],
      expoDependencies: Array.isArray(parsed.expoDependencies)
        ? parsed.expoDependencies
        : [],
      supportsGlass: parsed.supportsGlass ?? false,
      screens: Array.isArray(parsed.screens) ? parsed.screens : undefined,
    };
  } catch {
    return null;
  }
}

// ── API publique ──────────────────────────────────────────────────────────────

/**
 * Charge tous les templates disponibles en parcourant les sous-dossiers
 * du répertoire `templates/`.
 *
 * @param templatesRoot - Chemin absolu vers le répertoire templates.
 *   Utilise le chemin par défaut (relatif à ce fichier) si non fourni.
 */
export function loadTemplatesRegistry(
  templatesRoot?: string
): TemplateDefinition[] {
  const root = templatesRoot ?? resolveDefaultTemplatesRoot();

  if (!existsSync(root)) {
    return [];
  }

  const entries = readdirSync(root, { withFileTypes: true });

  const definitions: TemplateDefinition[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const templateDir = join(root, entry.name);
    const def = readTemplateJson(templateDir);
    if (def !== null) {
      definitions.push(def);
    }
  }

  // Tri stable par id alphabétique
  return definitions.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Retourne la définition d'un template par son id.
 *
 * @param id - Identifiant du template (ex: "auth", "dashboard").
 * @param templatesRoot - Chemin optionnel vers le répertoire templates.
 */
export function getTemplateDefinition(
  id: string,
  templatesRoot?: string
): TemplateDefinition | null {
  const root = templatesRoot ?? resolveDefaultTemplatesRoot();
  const templateDir = join(root, id.toLowerCase());
  return readTemplateJson(templateDir);
}

/**
 * Retourne la liste des ids de tous les templates disponibles.
 */
export function listTemplateIds(templatesRoot?: string): string[] {
  return loadTemplatesRegistry(templatesRoot).map((t) => t.id);
}

/**
 * Retourne les composants requis pour un template donné.
 */
export function getTemplateRequiredComponents(
  id: string,
  templatesRoot?: string
): string[] {
  const def = getTemplateDefinition(id, templatesRoot);
  return def ? [...def.requiredComponents] : [];
}
