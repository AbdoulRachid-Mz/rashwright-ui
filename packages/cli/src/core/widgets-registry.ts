/**
 * widgets-registry.ts
 *
 * Charge et expose les définitions de widgets modulaires Rashwright UI
 * depuis les modules autonomes (packages/ui-mobile/widgets/<id>/widget.json).
 */

import { join } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { WIDGETS_ROOT } from "./paths.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WidgetGridSize {
  cols?: number;
  rows?: number;
}

/** Manifeste d'un widget autonome (correspond à widget.json). */
export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category?: string;
  componentName: string;
  entrypoint: string;
  /** Chemins relatifs au dossier du widget (ex: ["metric-widget.tsx", "types.ts", "index.ts"]). */
  files: string[];
  /** Noms des composants rs-ui requis (ex: ["card", "stat-card", "badge"]). */
  requiredComponents: string[];
  /** Dépendances npm (non-Expo). */
  dependencies: string[];
  /** Dépendances Expo (ex: ["@expo/vector-icons", "expo-haptics"]). */
  expoDependencies: string[];
  supportsGlass: boolean;
  defaultSize?: WidgetGridSize;
  previewProps?: Record<string, unknown>;
}

// ── Résolution du répertoire source ───────────────────────────────────────────

function resolveDefaultWidgetsRoot(): string {
  return WIDGETS_ROOT;
}

// ── Lecture d'un widget.json ──────────────────────────────────────────────────

/**
 * Lit et valide un `widget.json` pour un widget donné.
 * Retourne `null` si le fichier est absent ou invalide.
 */
function readWidgetJson(
  widgetDir: string
): WidgetDefinition | null {
  const manifestPath = join(widgetDir, "widget.json");

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const raw = readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<WidgetDefinition>;

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
      version: parsed.version ?? "1.0.0",
      category: parsed.category ?? "General",
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
      defaultSize: parsed.defaultSize,
      previewProps: parsed.previewProps,
    };
  } catch {
    return null;
  }
}

// ── API publique ──────────────────────────────────────────────────────────────

/**
 * Charge tous les widgets disponibles en parcourant les sous-dossiers
 * du répertoire `widgets/`.
 *
 * @param widgetsRoot - Chemin absolu vers le répertoire widgets.
 */
export function loadWidgetsRegistry(
  widgetsRoot?: string
): WidgetDefinition[] {
  const root = widgetsRoot ?? resolveDefaultWidgetsRoot();

  if (!existsSync(root)) {
    return [];
  }

  const entries = readdirSync(root, { withFileTypes: true });
  const definitions: WidgetDefinition[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const widgetDir = join(root, entry.name);
    const def = readWidgetJson(widgetDir);
    if (def !== null) {
      definitions.push(def);
    }
  }

  // Tri stable par id alphabétique
  return definitions.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Retourne la définition d'un widget par son id.
 * Supporte la recherche insensible à la casse et la forme avec ou sans suffixe "-widget".
 *
 * @param id - Identifiant du widget (ex: "metric", "metric-widget").
 * @param widgetsRoot - Chemin optionnel vers le répertoire widgets.
 */
export function getWidgetDefinition(
  id: string,
  widgetsRoot?: string
): WidgetDefinition | null {
  const root = widgetsRoot ?? resolveDefaultWidgetsRoot();
  const rawId = id.toLowerCase().trim();
  const normalizedId = rawId.endsWith("-widget") ? rawId.slice(0, -7) : rawId;

  // 1. Essai avec id normalisé (ex: "metric")
  let def = readWidgetJson(join(root, normalizedId));
  if (def) return def;

  // 2. Essai avec l'id brut (ex: "metric-widget")
  def = readWidgetJson(join(root, rawId));
  if (def) return def;

  // 3. Fallback en scannant tous les manifests pour matcher def.id
  const all = loadWidgetsRegistry(root);
  return (
    all.find(
      (w) =>
        w.id.toLowerCase() === rawId ||
        w.id.toLowerCase() === normalizedId ||
        `${w.id.toLowerCase()}-widget` === rawId
    ) ?? null
  );
}

/**
 * Retourne la liste des ids de tous les widgets disponibles.
 */
export function listWidgetIds(widgetsRoot?: string): string[] {
  return loadWidgetsRegistry(widgetsRoot).map((w) => w.id);
}

/**
 * Retourne les composants requis pour un widget donné.
 */
export function getWidgetRequiredComponents(
  id: string,
  widgetsRoot?: string
): string[] {
  const def = getWidgetDefinition(id, widgetsRoot);
  return def ? [...def.requiredComponents] : [];
}
