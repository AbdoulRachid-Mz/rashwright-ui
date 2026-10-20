// packages/cli/src/commands/widget.ts
import { Command } from "commander";
import chalk from "chalk";
import {
  loadWidgetsRegistry,
  getWidgetDefinition,
  type WidgetDefinition,
} from "../core/widgets-registry.js";
import { addCommand } from "./add.js";

/**
 * Affiche la liste complète des widgets modulaires disponibles dans le registre.
 */
export function displayWidgetList(): void {
  console.log();
  console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Widgets modulaires disponibles"));
  console.log();

  const widgets = loadWidgetsRegistry();

  if (widgets.length === 0) {
    console.log(chalk.yellow("  Aucun widget disponible pour le moment."));
    console.log();
    return;
  }

  widgets.forEach((w) => {
    console.log(
      `  ${chalk.bold.blue(w.id.padEnd(16))} ${chalk.white(w.name)} ${chalk.dim(`(v${w.version})`)}`
    );
    console.log(`    ${chalk.dim(w.description)}`);
    console.log(
      `    ${chalk.dim("Composants requis :")} ${w.requiredComponents.map((c) => chalk.cyan(c)).join(", ")}`
    );
    if (w.supportsGlass) {
      console.log(`    ${chalk.magenta("✦ Support Liquid Glass natif")}`);
    }
    console.log();
  });

  console.log(chalk.dim("  Pour inspecter les détails d'un widget :"));
  console.log(chalk.cyan("    rs-ui widget info <id>"));
  console.log(chalk.dim("  Pour installer un widget modulaire dans votre projet :"));
  console.log(chalk.cyan("    rs-ui add -w <id>"));
  console.log(chalk.dim("  ou directement :"));
  console.log(chalk.cyan("    rs-ui widget add <id>"));
  console.log();
}

/**
 * Affiche l'aide et le guide d'utilisation des widgets.
 */
export function displayWidgetHelp(): void {
  console.log();
  console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Guide des Widgets Modulaires"));
  console.log();
  console.log("  Les widgets sont des blocs fonctionnels autonomes, réutilisables et distribuables.");
  console.log("  Ils composent les composants de base pour offrir des statistiques, graphiques,");
  console.log("  actions rapides, flux d'activités et résumés financiers prêts à l'emploi.");
  console.log();
  console.log(chalk.bold("  Commandes disponibles :"));
  console.log();
  console.log(
    `    ${chalk.cyan("rs-ui widget list")}               ${chalk.dim("Lister tous les widgets disponibles")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui --widget list")}             ${chalk.dim("Alias avec option")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui widget help")}               ${chalk.dim("Afficher cette aide")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui --widget help")}             ${chalk.dim("Alias avec option")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui widget info <id>")}          ${chalk.dim("Inspecter les détails et props d'un widget")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui add -w <id>")}               ${chalk.dim("Installer un widget modulaire dans votre application")}`
  );
  console.log(
    `    ${chalk.cyan("rs-ui widget add <id>")}           ${chalk.dim("Alias d'installation de widget")}`
  );
  console.log();
  console.log(chalk.bold("  Exemples d'utilisation :"));
  console.log(chalk.dim("    $ rs-ui add -w metric"));
  console.log(chalk.dim("    $ rs-ui add -w finance --yes"));
  console.log(chalk.dim("    $ rs-ui widget info activity-feed"));
  console.log();
}

/**
 * Affiche le détail d'un widget précis.
 */
export function displayWidgetInfo(id: string): void {
  const w = getWidgetDefinition(id);
  if (!w) {
    console.log(chalk.red(`  ✖ Widget "${id}" introuvable.`));
    console.log(chalk.dim("    Exécutez `rs-ui widget list` pour voir les options valides."));
    return;
  }

  console.log();
  console.log(chalk.bold.blue(`  Widget : ${w.name}`) + chalk.dim(` (${w.id} v${w.version})`));
  console.log(`  ${w.description}`);
  console.log();
  console.log(`  ${chalk.bold("Composant principal :")} ${w.componentName} (${w.entrypoint})`);
  console.log(`  ${chalk.bold("Catégorie :")} ${w.category || "Général"}`);
  console.log(`  ${chalk.bold("Composants requis :")} ${w.requiredComponents.join(", ")}`);
  if (w.dependencies.length > 0) {
    console.log(`  ${chalk.bold("Dépendances npm :")} ${w.dependencies.join(", ")}`);
  }
  if (w.expoDependencies.length > 0) {
    console.log(`  ${chalk.bold("Dépendances Expo :")} ${w.expoDependencies.join(", ")}`);
  }
  if (w.defaultSize) {
    console.log(`  ${chalk.bold("Dimensions par défaut :")} ${w.defaultSize.cols ?? 2} colonnes x ${w.defaultSize.rows ?? 1} ligne(s)`);
  }
  console.log(`  ${chalk.bold("Fichiers inclus :")} ${w.files.length} fichiers`);
  w.files.forEach((f) => console.log(`    - ${f}`));
  console.log();
  console.log(chalk.dim(`  Pour installer : rs-ui add -w ${w.id}`));
  console.log();
}

/**
 * Commande `rs-ui widget`
 */
export function widgetCommand(): Command {
  const cmd = new Command("widget");

  cmd
    .description("Gérer et inspecter les widgets modulaires Rashwright UI")
    .argument("[action]", "Action à exécuter : list, help, info")
    .argument("[name]", "Nom du widget (pour l'action info)")
    .action((action?: string, name?: string) => {
      if (!action || action === "list" || action === "ls") {
        displayWidgetList();
      } else if (action === "help") {
        displayWidgetHelp();
      } else if (action === "info") {
        if (!name) {
          console.log(chalk.red("  ✖ Spécifiez le nom du widget : rs-ui widget info <id>"));
          return;
        }
        displayWidgetInfo(name);
      } else {
        // Si l'utilisateur passe directement un nom de widget (ex: rs-ui widget metric)
        displayWidgetInfo(action);
      }
    });

  cmd
    .command("list")
    .description("Lister tous les widgets modulaires disponibles")
    .action(() => {
      displayWidgetList();
    });

  cmd
    .command("help")
    .description("Afficher l'aide relative à l'utilisation des widgets")
    .action(() => {
      displayWidgetHelp();
    });

  cmd
    .command("info <name>")
    .description("Afficher les informations détaillées d'un widget")
    .action((name: string) => {
      displayWidgetInfo(name);
    });

  cmd
    .command("add <name>")
    .description("Installer un widget autonome avec ses composants requis et dépendances")
    .option("--force", "Forcer la réinstallation (écraser les fichiers existants)")
    .option("--yes", "Répondre Oui à toutes les questions")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .action(async (name: string, opts: { force?: boolean; yes?: boolean; dryRun?: boolean }) => {
      const add = addCommand();
      const args = ["node", "rs-ui", "-w", name];
      if (opts.force) args.push("--force");
      if (opts.yes) args.push("--yes");
      if (opts.dryRun) args.push("--dry-run");
      await add.parseAsync(args);
    });

  cmd
    .command("remove <name>")
    .description("Supprimer les fichiers d'un widget installé dans le projet")
    .option("--yes", "Confirmer la suppression sans prompt")
    .option("--dry-run", "Afficher les suppressions sans les exécuter")
    .action(async (name: string, opts: { yes?: boolean; dryRun?: boolean }) => {
      const cwd = process.cwd();
      const { rmSync, existsSync } = await import("node:fs");
      const { join } = await import("node:path");
      const { confirm } = await import("@inquirer/prompts");
      const { removeLockedWidget } = await import("../core/lock-manager.js");

      const candidates = [
        join(cwd, "components", "widgets", name),
        join(cwd, "src", "components", "widgets", name),
      ];

      const targetPath = candidates.find((p) => existsSync(p));
      if (!targetPath) {
        console.log(chalk.yellow(`  ⚠ Widget "${name}" introuvable dans ce projet.`));
        return;
      }

      console.log(chalk.bold(`  Suppression du widget "${name}":`));
      console.log(chalk.dim(`    Dossier : ${targetPath}`));
      console.log();

      if (!opts.yes && !opts.dryRun) {
        const ok = await confirm({
          message: `Confirmer la suppression du widget "${name}" ?`,
          default: false,
        });
        if (!ok) {
          console.log(chalk.dim("  Annulé."));
          return;
        }
      }

      if (!opts.dryRun) {
        rmSync(targetPath, { recursive: true, force: true });
        removeLockedWidget(cwd, name);
        console.log(chalk.green(`  ✔ Widget "${name}" supprimé avec succès.`));
      } else {
        console.log(chalk.dim(`  [dry-run] Suppression récursive de ${targetPath}`));
      }
    });

  return cmd;
}
