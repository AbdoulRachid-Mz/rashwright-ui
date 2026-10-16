// packages/cli/src/commands/template.ts
import { Command } from "commander";
import chalk from "chalk";
import {
  loadTemplatesRegistry,
  getTemplateDefinition,
  type TemplateDefinition,
} from "../core/templates-registry.js";

/**
 * Affiche la liste complète des templates disponibles dans le registre.
 */
export function displayTemplateList(): void {
  console.log();
  console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Templates disponibles"));
  console.log();

  const templates = loadTemplatesRegistry();

  if (templates.length === 0) {
    console.log(chalk.yellow("  Aucun template disponible pour le moment."));
    console.log();
    return;
  }

  templates.forEach((t) => {
    console.log(
      `  ${chalk.bold.green(t.id.padEnd(14))} ${chalk.white(t.name)} ${chalk.dim(`(v${t.version})`)}`
    );
    console.log(`    ${chalk.dim(t.description)}`);
    console.log(
      `    ${chalk.dim("Composants :")} ${t.requiredComponents.map((c) => chalk.cyan(c)).join(", ")}`
    );
    if (t.supportsGlass) {
      console.log(`    ${chalk.magenta("✦ Support Liquid Glass natif")}`);
    }
    console.log();
  });

  console.log(chalk.dim("  Pour initialiser un projet avec un template :"));
  console.log(chalk.cyan("    rs-ui init --template <id>"));
  console.log(chalk.dim("  Pour ajouter un template à un projet existant :"));
  console.log(chalk.cyan("    rs-ui add -t <id>"));
  console.log();
}

/**
 * Affiche l'aide et le guide d'utilisation des templates.
 */
export function displayTemplateHelp(): void {
  console.log();
  console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Guide des Templates"));
  console.log();
  console.log("  Les templates sont des écrans et parcours complets prêts à l'emploi.");
  console.log("  Ils installent automatiquement tous leurs composants requis et dépendances.");
  console.log();
  console.log(chalk.bold("  Commandes disponibles :"));
  console.log();
  console.log(
    `    ${chalk.cyan("rs-ui template list")}              ${chalk.dim("Lister tous les templates disponibles")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui --template list")}            ${chalk.dim("Alias avec option")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui template help")}              ${chalk.dim("Afficher cette aide")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui --template help")}            ${chalk.dim("Alias avec option")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui template info <id>")}         ${chalk.dim("Inspecter les détails d'un template spécifique")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui add -t <id>")}                ${chalk.dim("Installer un template complet dans votre application")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui init --template <id>")}       ${chalk.dim("Créer un nouveau projet directement avec ce template")}`
  );
  console.log();
  console.log(chalk.bold("  Exemples d'utilisation :"));
  console.log(chalk.dim("    $ rs-ui init my-app --template commerce"));
  console.log(chalk.dim("    $ rs-ui add -t auth"));
  console.log(chalk.dim("    $ rs-ui add -t dashboard --yes"));
  console.log();
}

/**
 * Affiche le détail d'un template précis.
 */
export function displayTemplateInfo(id: string): void {
  const t = getTemplateDefinition(id);
  if (!t) {
    console.log(chalk.red(`  ✖ Template "${id}" introuvable.`));
    console.log(chalk.dim("    Exécutez `rs-ui template list` pour voir les options valides."));
    return;
  }

  console.log();
  console.log(chalk.bold.cyan(`  Template : ${t.name}`) + chalk.dim(` (${t.id} v${t.version})`));
  console.log(`  ${t.description}`);
  console.log();
  console.log(`  ${chalk.bold("Composant :")} ${t.componentName} (${t.entrypoint})`);
  console.log(`  ${chalk.bold("Composants requis :")} ${t.requiredComponents.join(", ")}`);
  if (t.dependencies.length > 0) {
    console.log(`  ${chalk.bold("Dépendances npm :")} ${t.dependencies.join(", ")}`);
  }
  if (t.expoDependencies.length > 0) {
    console.log(`  ${chalk.bold("Dépendances Expo :")} ${t.expoDependencies.join(", ")}`);
  }
  console.log(`  ${chalk.bold("Fichiers inclus :")} ${t.files.length} fichiers`);
  t.files.forEach((f) => console.log(`    - ${f}`));
  console.log();
}

/**
 * Commande `rs-ui template`
 */
export function templateCommand(): Command {
  const cmd = new Command("template");

  cmd
    .description("Gérer et inspecter les templates complets Rashwright UI")
    .argument("[action]", "Action à exécuter : list, help, info")
    .argument("[name]", "Nom du template (pour l'action info)")
    .action((action?: string, name?: string) => {
      if (!action || action === "list" || action === "ls") {
        displayTemplateList();
      } else if (action === "help") {
        displayTemplateHelp();
      } else if (action === "info") {
        if (!name) {
          console.log(chalk.red("  ✖ Spécifiez le nom du template : rs-ui template info <id>"));
          return;
        }
        displayTemplateInfo(name);
      } else {
        // Si l'utilisateur passe directement un nom de template (ex: rs-ui template auth)
        displayTemplateInfo(action);
      }
    });

  cmd
    .command("list")
    .description("Lister tous les templates disponibles")
    .action(() => {
      displayTemplateList();
    });

  cmd
    .command("help")
    .description("Afficher l'aide relative à l'utilisation des templates")
    .action(() => {
      displayTemplateHelp();
    });

  cmd
    .command("info <name>")
    .description("Afficher les informations détaillées d'un template")
    .action((name: string) => {
      displayTemplateInfo(name);
    });

  return cmd;
}
