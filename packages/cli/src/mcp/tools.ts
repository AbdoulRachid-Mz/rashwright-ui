/**
 * tools.ts — Définition et exécution des outils MCP pour Rashwright UI Mobile.
 *
 * Ces outils permettent à n'importe quel assistant IA (Cursor, Claude, Copilot, etc.)
 * d'interroger le registre, de lire le code source exact des composants,
 * d'accéder aux tokens de design et de comprendre l'architecture.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTRY_ROOT, SOURCE_ROOT, TEMPLATES_ROOT } from "../core/paths.js";
import { getAllComponents, getComponent, loadRegistryIndex } from "../core/registry.js";
import { loadTemplatesRegistry, getTemplateDefinition } from "../core/templates-registry.js";
import { parseSkillFrontmatter } from "../core/skills-manager.js";
import { lightTheme } from "../../../ui-mobile/constants/theme.js";
import { generateScreenCode } from "./tools/generate-screen.js";
import { auditAccessibility } from "./tools/audit-accessibility.js";
import { convertStyling } from "./tools/convert-styling.js";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: "list_components",
    description: "Liste l'ensemble des composants disponibles dans le registre Rashwright UI Mobile, avec leur catégorie, description, version et capacités (ex: support Liquid Glass).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Filtrer par catégorie optionnelle (ex: 'Layout', 'Forms', 'Data', 'Feedback', 'Navigation').",
        },
        supportsGlass: {
          type: "boolean",
          description: "Filtrer uniquement les composants prenant en charge l'effet Liquid Glass.",
        },
      },
    },
  },
  {
    name: "get_component",
    description: "Récupère les spécifications complètes d'un composant, ses dépendances Expo/npm, ses props et le code source TSX complet.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nom canonique du composant (ex: 'button', 'card', 'flat-list', 'view', 'carousel', 'tabs').",
        },
        includeSource: {
          type: "boolean",
          description: "Inclure le code source TypeScript (.tsx) du composant (vrai par défaut).",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "search_registry",
    description: "Effectue une recherche textuelle ou par mots-clés dans l'ensemble du registre Rashwright UI (composants, templates, hooks).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Terme de recherche (ex: 'grid', 'carousel', 'modal', 'rating', 'theme').",
        },
        type: {
          type: "string",
          enum: ["all", "components", "templates"],
          description: "Type d'éléments à inclure dans les résultats (défaut: 'all').",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_templates",
    description: "Liste tous les templates et écrans prêts à l'emploi (Showcase, Commerce, Settings, Auth, etc.).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_template",
    description: "Récupère le détail d'un template complet, la liste de ses fichiers et ses composants requis.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Identifiant du template (ex: 'commerce', 'settings', 'showcase').",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_theme_tokens",
    description: "Fournit les tokens du thème officiel Rashwright (palette de couleurs light/dark, rayon de bordure, espacements, tokens Liquid Glass).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["colors", "propertyColors", "glass", "all"],
          description: "Catégorie de tokens souhaitée (défaut: 'all').",
        },
      },
    },
  },
  {
    name: "get_skill",
    description: "Récupère le guide de bonnes pratiques et la documentation SKILL.md détaillée pour un composant donné.",
    inputSchema: {
      type: "object",
      properties: {
        component: {
          type: "string",
          description: "Nom du composant dont on souhaite consulter le guide SKILL (ex: 'flat-list', 'view', 'tabs').",
        },
      },
      required: ["component"],
    },
  },
  {
    name: "generate_screen",
    description: "Compose un écran mobile complet et prêt à l'emploi avec navigation, en-tête et composants Rashwright UI.",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Titre de l'écran (ex: 'Tableau de bord', 'Mon Profil', 'Connexion').",
        },
        screenType: {
          type: "string",
          enum: ["dashboard", "list", "form", "profile", "settings", "detail", "empty"],
          description: "Modèle d'écran (défaut: 'dashboard').",
        },
        components: {
          type: "array",
          items: { type: "string" },
          description: "Liste des composants UI à intégrer (ex: ['card', 'button', 'badge']).",
        },
        styleMode: {
          type: "string",
          enum: ["styleSheet", "nativewind"],
          description: "Style d'écriture des styles (défaut: 'styleSheet').",
        },
        useGlass: {
          type: "boolean",
          description: "Activer les variantes Liquid Glass (défaut: true).",
        },
      },
    },
  },
  {
    name: "audit_accessibility",
    description: "Analyse un fichier TSX mobile pour détecter les anomalies d'accessibilité (labels vocaux manquants, cibles tactiles trop petites, rôles ARIA).",
    inputSchema: {
      type: "object",
      properties: {
        sourceCode: {
          type: "string",
          description: "Le code source TSX à auditer.",
        },
      },
      required: ["sourceCode"],
    },
  },
  {
    name: "convert_styling",
    description: "Convertit bidirectionnellement le style entre StyleSheet React Native et classes Tailwind NativeWind.",
    inputSchema: {
      type: "object",
      properties: {
        sourceCode: {
          type: "string",
          description: "Le code source TSX contenant les styles à convertir.",
        },
        target: {
          type: "string",
          enum: ["nativewind", "stylesheet"],
          description: "Cible de la conversion ('nativewind' pour Tailwind, 'stylesheet' pour StyleSheet.create).",
        },
      },
      required: ["sourceCode", "target"],
    },
  },
];

/**
 * Exécute un outil MCP donné et retourne le résultat textuel / JSON.
 */
export async function executeMcpTool(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    switch (toolName) {
      case "list_components": {
        const all = getAllComponents(REGISTRY_ROOT);
        const categoryFilter = typeof args.category === "string" ? args.category.toLowerCase() : null;
        const glassFilter = typeof args.supportsGlass === "boolean" ? args.supportsGlass : null;

        const filtered = all.filter((c) => {
          if (categoryFilter && c.category.toLowerCase() !== categoryFilter) return false;
          if (glassFilter !== null && c.supportsGlass !== glassFilter) return false;
          return true;
        });

        const summary = filtered.map((c) => ({
          name: c.name,
          version: c.version,
          category: c.category,
          description: c.description,
          supportsGlass: c.supportsGlass,
          dependencies: c.dependencies,
          expoDependencies: c.expoDependencies,
          requiresComponents: c.requiresComponents,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: summary.length,
                  components: summary,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_component": {
        const name = String(args.name || "").trim().toLowerCase();
        if (!name) {
          return {
            isError: true,
            content: [{ type: "text", text: "Le paramètre 'name' est requis." }],
          };
        }

        let entry = getComponent(name, REGISTRY_ROOT);
        if (!entry && (name === "view" || name === "text")) {
          entry = {
            name,
            version: "1.0.0",
            description:
              name === "view"
                ? "View thémée responsive avec grille multi-colonnes adaptative, tri d'éléments et carrousels intégrés."
                : "Texte thémé avec variantes typographiques et gestion automatique des couleurs de thème.",
            category: name === "view" ? "Layout" : "Basic",
            files: [`components/ui/${name}.tsx`],
            dependencies: [],
            expoDependencies: name === "view" ? ["react-native-reanimated"] : [],
            optionalExpoDependencies: [],
            requiresComponents: name === "view" ? ["carousel"] : [],
            providers: ["ThemeProvider"],
            supportsGlass: true,
            platforms: ["ios", "android"],
            nativeRebuildRequired: false,
          };
        }

        if (!entry) {
          return {
            isError: true,
            content: [{ type: "text", text: `Composant '${name}' introuvable dans le registre.` }],
          };
        }

        const includeSource = args.includeSource !== false;
        const filesContent: Record<string, string> = {};

        if (includeSource && Array.isArray(entry.files)) {
          for (const relFile of entry.files) {
            const absPath = join(SOURCE_ROOT, relFile);
            if (existsSync(absPath)) {
              filesContent[relFile] = readFileSync(absPath, "utf-8");
            }
          }
        }

        // Lecture de skill si disponible
        const skillPath = join(SOURCE_ROOT, "skills", name, "SKILL.md");
        let skillContent: string | null = null;
        if (existsSync(skillPath)) {
          skillContent = readFileSync(skillPath, "utf-8");
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ...entry,
                  filesContent: includeSource ? filesContent : undefined,
                  skillDocumentation: skillContent,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_registry": {
        const query = String(args.query || "").trim().toLowerCase();
        const type = (args.type as string) || "all";

        const results: Array<{
          type: "component" | "template";
          name: string;
          description: string;
          category?: string;
          score: number;
        }> = [];

        if (type === "all" || type === "components") {
          const components = getAllComponents(REGISTRY_ROOT);
          for (const c of components) {
            let score = 0;
            if (c.name.toLowerCase() === query) score += 100;
            else if (c.name.toLowerCase().includes(query)) score += 50;
            if (c.description.toLowerCase().includes(query)) score += 20;
            if (c.category.toLowerCase().includes(query)) score += 15;

            if (score > 0) {
              results.push({
                type: "component",
                name: c.name,
                description: c.description,
                category: c.category,
                score,
              });
            }
          }
        }

        if (type === "all" || type === "templates") {
          const templates = loadTemplatesRegistry();
          for (const t of templates) {
            let score = 0;
            if (t.id.toLowerCase() === query) score += 100;
            else if (t.id.toLowerCase().includes(query)) score += 50;
            if (t.name.toLowerCase().includes(query)) score += 40;
            if (t.description.toLowerCase().includes(query)) score += 20;

            if (score > 0) {
              results.push({
                type: "template",
                name: t.id,
                description: t.description,
                category: "Template",
                score,
              });
            }
          }
        }

        results.sort((a, b) => b.score - a.score);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query,
                  total: results.length,
                  results,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_templates": {
        const templates = loadTemplatesRegistry();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total: templates.length,
                  templates: templates.map((t) => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    version: t.version,
                    componentName: t.componentName,
                    requiredComponents: t.requiredComponents,
                    supportsGlass: t.supportsGlass,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_template": {
        const id = String(args.id || "").trim().toLowerCase();
        const template = getTemplateDefinition(id);
        if (!template) {
          return {
            isError: true,
            content: [{ type: "text", text: `Template '${id}' introuvable.` }],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(template, null, 2),
            },
          ],
        };
      }

      case "get_theme_tokens": {
        const cat = String(args.category || "all").toLowerCase();
        let tokens: Record<string, unknown> = {};

        if (cat === "colors") {
          tokens = { colors: lightTheme.colors };
        } else if (cat === "propertyColors") {
          tokens = { propertyColors: lightTheme.propertyColors };
        } else {
          tokens = {
            colors: lightTheme.colors,
            propertyColors: lightTheme.propertyColors,
            notes: "Les tokens sombres (dark) inversent le background et les teintes de texte tout en préservant le contraste.",
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tokens, null, 2),
            },
          ],
        };
      }

      case "get_skill": {
        const component = String(args.component || "").trim().toLowerCase();
        const skillPath = join(SOURCE_ROOT, "skills", component, "SKILL.md");
        if (!existsSync(skillPath)) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Aucune documentation SKILL.md trouvée pour le composant '${component}'.`,
              },
            ],
          };
        }

        const raw = readFileSync(skillPath, "utf-8");
        const frontmatter = parseSkillFrontmatter(raw);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  component,
                  frontmatter,
                  markdown: raw,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "generate_screen": {
        const screenCode = generateScreenCode({
          title: typeof args.title === "string" ? args.title : undefined,
          screenType: typeof args.screenType === "string" ? (args.screenType as any) : undefined,
          components: Array.isArray(args.components) ? args.components.map(String) : undefined,
          styleMode: typeof args.styleMode === "string" ? (args.styleMode as any) : undefined,
          useGlass: typeof args.useGlass === "boolean" ? args.useGlass : undefined,
        });

        return {
          content: [
            {
              type: "text",
              text: screenCode,
            },
          ],
        };
      }

      case "audit_accessibility": {
        const sourceCode = String(args.sourceCode || "");
        if (!sourceCode.trim()) {
          return {
            isError: true,
            content: [{ type: "text", text: "Le paramètre 'sourceCode' est requis." }],
          };
        }

        const audit = auditAccessibility(sourceCode);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(audit, null, 2),
            },
          ],
        };
      }

      case "convert_styling": {
        const sourceCode = String(args.sourceCode || "");
        const target = args.target === "nativewind" ? "nativewind" : "stylesheet";

        if (!sourceCode.trim()) {
          return {
            isError: true,
            content: [{ type: "text", text: "Le paramètre 'sourceCode' est requis." }],
          };
        }

        const res = convertStyling(sourceCode, target);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res, null, 2),
            },
          ],
        };
      }

      default:
        return {
          isError: true,
          content: [{ type: "text", text: `Outil inconnu : '${toolName}'` }],
        };
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: `Erreur interne MCP : ${errorMsg}` }],
    };
  }
}
