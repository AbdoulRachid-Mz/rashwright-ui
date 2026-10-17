/**
 * import-transformer.ts
 *
 * Module AST Transformer pour la réécriture chirurgicale des alias d'imports.
 * Permet d'adapter automatiquement le code source distribué depuis le registre
 * aux configurations de projets personnalisées (ex: ~/components, @app/ui, etc.).
 */

export interface TransformImportOptions {
  fromPrefix?: string; // Défaut: "@/"
  toPrefix?: string;   // Ex: "~/" ou "@custom/"
  aliases?: {
    components?: string;
    contexts?: string;
    hooks?: string;
    lib?: string;
    theme?: string;
    constants?: string;
    stores?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Regex pour capturer les déclarations d'imports et d'exports TypeScript/ESM :
 * - import ... from "..."
 * - import "..."
 * - export ... from "..."
 * - import("...")
 */
const IMPORT_EXPORT_REGEX =
  /(from\s+["']([^"']+)["'])|(import\s*\(\s*["']([^"']+)["']\s*\))|(import\s+["']([^"']+)["'])/g;

/**
 * Réécrit un chemin d'import en fonction des options de transformation.
 */
export function resolveTransformedImportPath(
  importPath: string,
  options: TransformImportOptions
): string {
  const fromPrefix = options.fromPrefix ?? "@/";
  const toPrefix = options.toPrefix;
  const aliases = options.aliases;

  // Si le chemin ne commence pas par le préfixe source, on ne le touche pas
  if (!importPath.startsWith(fromPrefix)) {
    return importPath;
  }

  const subPath = importPath.slice(fromPrefix.length); // ex: "components/ui/button"

  // 1. Vérification des alias ciblés (components, contexts, hooks, lib, theme, etc.)
  if (aliases) {
    if (subPath.startsWith("components/ui/") && aliases.components) {
      const rest = subPath.slice("components/ui/".length);
      const target = aliases.components.endsWith("/")
        ? aliases.components
        : `${aliases.components}/`;
      return `${target}${rest}`;
    }

    if (subPath.startsWith("components/") && aliases.components) {
      const rest = subPath.slice("components/".length);
      const target = aliases.components.endsWith("/")
        ? aliases.components
        : `${aliases.components}/`;
      return `${target}${rest}`;
    }

    for (const [key, targetAlias] of Object.entries(aliases)) {
      if (!targetAlias) continue;
      if (subPath === key || subPath.startsWith(`${key}/`)) {
        const rest = subPath.slice(key.length);
        const cleanTarget = targetAlias.replace(/\/$/, "");
        return `${cleanTarget}${rest}`;
      }
    }
  }

  // 2. Si un toPrefix général est défini (ex: "~/")
  if (toPrefix && toPrefix !== fromPrefix) {
    return `${toPrefix}${subPath}`;
  }

  return importPath;
}

/**
 * Transforme chirurgicalement tous les imports et exports d'un fichier source TSX/TS.
 */
export function transformImports(
  sourceCode: string,
  options: TransformImportOptions = {}
): string {
  if (!options.toPrefix && !options.aliases) {
    return sourceCode;
  }

  return sourceCode.replace(
    IMPORT_EXPORT_REGEX,
    (
      match,
      fromClause,
      fromPath,
      dynamicClause,
      dynamicPath,
      bareClause,
      barePath
    ) => {
      if (fromClause && fromPath) {
        const transformed = resolveTransformedImportPath(fromPath, options);
        if (transformed !== fromPath) {
          const quote = fromClause.includes('"') ? '"' : "'";
          return `from ${quote}${transformed}${quote}`;
        }
      }

      if (dynamicClause && dynamicPath) {
        const transformed = resolveTransformedImportPath(dynamicPath, options);
        if (transformed !== dynamicPath) {
          const quote = dynamicClause.includes('"') ? '"' : "'";
          return `import(${quote}${transformed}${quote})`;
        }
      }

      if (bareClause && barePath) {
        const transformed = resolveTransformedImportPath(barePath, options);
        if (transformed !== barePath) {
          const quote = bareClause.includes('"') ? '"' : "'";
          return `import ${quote}${transformed}${quote}`;
        }
      }

      return match;
    }
  );
}
