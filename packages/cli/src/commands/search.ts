import { Command } from "commander";
import chalk from "chalk";
import { REGISTRY_ROOT } from "../core/paths.js";
import { getAllComponents } from "../core/registry.js";
import { loadTemplatesRegistry } from "../core/templates-registry.js";

export function searchCommand(): Command {
  const cmd = new Command("search");

  cmd
    .description("Rechercher des composants, templates et fonctionnalités dans le catalogue Rashwright UI")
    .argument("<query>", "Terme de recherche (nom, mot-clé, tag, cas d'usage)")
    .option("-c, --components-only", "Rechercher uniquement parmi les composants")
    .option("-t, --templates-only", "Rechercher uniquement parmi les templates")
    .option("--json", "Sortie JSON brute pour scripts et outils")
    .action((queryArg: string, options: { componentsOnly?: boolean; templatesOnly?: boolean; json?: boolean }) => {
      const query = queryArg.trim().toLowerCase();

      const results: Array<{
        type: "component" | "template";
        name: string;
        description: string;
        category: string;
        supportsGlass: boolean;
        score: number;
      }> = [];

      const includeComponents = !options.templatesOnly;
      const includeTemplates = !options.componentsOnly;

      if (includeComponents) {
        const components = getAllComponents(REGISTRY_ROOT);
        for (const c of components) {
          let score = 0;
          const nameLower = c.name.toLowerCase();
          const descLower = (c.description || "").toLowerCase();
          const catLower = (c.category || "").toLowerCase();

          if (nameLower === query) score += 100;
          else if (nameLower.startsWith(query)) score += 60;
          else if (nameLower.includes(query)) score += 40;

          if (descLower.includes(query)) score += 25;
          if (catLower.includes(query)) score += 20;

          if (score > 0) {
            results.push({
              type: "component",
              name: c.name,
              description: c.description || "",
              category: c.category || "General",
              supportsGlass: Boolean(c.supportsGlass),
              score,
            });
          }
        }
      }

      if (includeTemplates) {
        const templates = loadTemplatesRegistry();
        for (const t of templates) {
          let score = 0;
          const idLower = t.id.toLowerCase();
          const nameLower = t.name.toLowerCase();
          const descLower = (t.description || "").toLowerCase();

          if (idLower === query) score += 100;
          else if (idLower.startsWith(query)) score += 60;
          else if (idLower.includes(query)) score += 40;

          if (nameLower.includes(query)) score += 35;
          if (descLower.includes(query)) score += 25;

          if (score > 0) {
            results.push({
              type: "template",
              name: t.id,
              description: t.description || "",
              category: "Template",
              supportsGlass: Boolean(t.supportsGlass),
              score,
            });
          }
        }
      }

      results.sort((a, b) => b.score - a.score);

      if (options.json) {
        console.log(JSON.stringify({ query, count: results.length, results }, null, 2));
        return;
      }

      console.log();
      console.log(
        chalk.bold.cyan("  Rashwright UI") +
          chalk.dim(` — Résultats pour la recherche "${chalk.bold(queryArg)}" (${results.length} trouvé${results.length > 1 ? "s" : ""})`)
      );
      console.log();

      if (results.length === 0) {
        console.log(chalk.yellow(`  ✖ Aucun composant ou template ne correspond à "${queryArg}".`));
        console.log(chalk.dim("  Essayez avec des termes plus généraux : 'form', 'card', 'list', 'nav', 'input', 'button'.\n"));
        return;
      }

      for (const item of results) {
        const typeBadge =
          item.type === "template"
            ? chalk.bgMagenta.bold(" TEMPLATE ")
            : chalk.bgBlue.bold(" COMPOSANT ");
        const glassBadge = item.supportsGlass ? chalk.cyan(" [Glass]") : "";
        const installCmd =
          item.type === "template"
            ? `rs-ui template add ${item.name}`
            : `rs-ui add ${item.name}`;

        console.log(`  ${typeBadge} ${chalk.bold.white(item.name)}${glassBadge}  ${chalk.dim(`(${item.category})`)}`);
        console.log(`    ${chalk.dim(item.description)}`);
        console.log(`    ${chalk.green("→")} ${chalk.gray(installCmd)}`);
        console.log();
      }
    });

  return cmd;
}
