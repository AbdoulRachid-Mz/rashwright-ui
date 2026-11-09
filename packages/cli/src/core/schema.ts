// packages/cli/src/core/schema.ts

/**
 * Types d'items conformes à la spécification universelle du registre shadcn RFC v4.
 */
export type RegistryItemType =
  | "registry:ui"         // Composant d'interface utilisateur (Button, Tabs, Modal...)
  | "registry:hook"       // Hook React Native réutilisable (useControllableState, useDevice...)
  | "registry:lib"        // Bibliothèque ou utilitaire (upload, primitives...)
  | "registry:block"      // Template ou widget autonome (Commerce, Auth, Dashboard...)
  | "registry:foundation"; // Fondation interne partagée (theme, liquid, core-ui...)

export const VALID_REGISTRY_ITEM_TYPES: readonly RegistryItemType[] = [
  "registry:ui",
  "registry:hook",
  "registry:lib",
  "registry:block",
  "registry:foundation",
] as const;

export interface RegistryItem {
  name: string;
  type?: RegistryItemType;
  /**
   * Version propre de l'artefact (composant, hook, lib...). Peut évoluer
   * indépendamment du registre.
   */
  version?: string;
  /**
   * Version du registre qui a produit ce manifeste (alignée sur
   * `registry/index.json#version`). Distincte de `version`.
   */
  registryVersion?: string;
  description: string;
  category?: string;
  files: string[];
  /** Assets embarqués (images, polices, vidéos), relatifs à `packages/ui-mobile`. */
  assets?: string[];
  dependencies?: string[];
  expoDependencies?: string[];
  optionalExpoDependencies?: string[];
  requiresComponents?: string[];
  /** Fondations requises (`theme`, `glass`, `core-ui`, `liquid`, `responsive`, `upload`, `tab-bar`). */
  requiresFoundations?: string[];
  providers?: string[];
  supportsGlass?: boolean;
  platforms?: string[];
  nativeRebuildRequired?: boolean;
  notes?: string;
  props?: Record<string, unknown>;
}

/**
 * Validation TypeScript pure sans dépendance externe.
 */
export function validateRegistryItem(data: unknown): { success: true; data: RegistryItem } | { success: false; error: string } {
  if (typeof data !== "object" || data === null) {
    return { success: false, error: "L'item de registre doit être un objet." };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== "string" || obj.name.trim().length === 0) {
    return { success: false, error: "Le champ 'name' est requis et doit être une chaîne." };
  }

  if (typeof obj.description !== "string") {
    return { success: false, error: "Le champ 'description' est requis." };
  }

  if (!Array.isArray(obj.files) || obj.files.length === 0) {
    return { success: false, error: "Le champ 'files' doit être un tableau non vide." };
  }

  let resolvedType: RegistryItemType = "registry:ui";
  if (obj.type !== undefined) {
    if (!VALID_REGISTRY_ITEM_TYPES.includes(obj.type as RegistryItemType)) {
      return { success: false, error: `Type '${obj.type}' invalide. Attendu : ${VALID_REGISTRY_ITEM_TYPES.join(", ")}` };
    }
    resolvedType = obj.type as RegistryItemType;
  }

  const item: RegistryItem = {
    name: obj.name,
    type: resolvedType,
    version: typeof obj.version === "string" ? obj.version : "1.0.0",
    registryVersion: typeof obj.registryVersion === "string" ? obj.registryVersion : undefined,
    description: obj.description,
    category: typeof obj.category === "string" ? obj.category : "Custom",
    files: obj.files.filter((f): f is string => typeof f === "string"),
    assets: Array.isArray(obj.assets) ? obj.assets.filter((a): a is string => typeof a === "string") : [],
    dependencies: Array.isArray(obj.dependencies) ? obj.dependencies.filter((d): d is string => typeof d === "string") : [],
    expoDependencies: Array.isArray(obj.expoDependencies) ? obj.expoDependencies.filter((d): d is string => typeof d === "string") : [],
    optionalExpoDependencies: Array.isArray(obj.optionalExpoDependencies) ? obj.optionalExpoDependencies.filter((d): d is string => typeof d === "string") : [],
    requiresComponents: Array.isArray(obj.requiresComponents) ? obj.requiresComponents.filter((c): c is string => typeof c === "string") : [],
    requiresFoundations: Array.isArray(obj.requiresFoundations) ? obj.requiresFoundations.filter((c): c is string => typeof c === "string") : [],
    providers: Array.isArray(obj.providers) ? obj.providers.filter((p): p is string => typeof p === "string") : [],
    supportsGlass: Boolean(obj.supportsGlass),
    platforms: Array.isArray(obj.platforms) ? obj.platforms.filter((p): p is string => typeof p === "string") : ["ios", "android"],
    nativeRebuildRequired: Boolean(obj.nativeRebuildRequired),
    notes: typeof obj.notes === "string" ? obj.notes : undefined,
    props: typeof obj.props === "object" && obj.props !== null ? (obj.props as Record<string, unknown>) : undefined,
  };

  return { success: true, data: item };
}
