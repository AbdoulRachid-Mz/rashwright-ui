/**
 * showcase.ts — Commande `rs-ui showcase` / `rs-ui storybook`
 *
 * Déploie et lance l'environnement interactif de prévisualisation (Showcase & Storybook Mobile)
 * pour tester et manipuler en direct tous les composants, presets de thème et variantes Liquid Glass.
 */

import { Command } from "commander";
import chalk from "chalk";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { detectProject } from "../core/project-detector.js";
import { readConfig } from "../core/config-manager.js";
import { runCommand } from "../core/package-manager.js";

export function showcaseCommand(): Command {
  const cmd = new Command("showcase");

  cmd
    .description("Lancer l'environnement interactif de prévisualisation (Storybook Mobile & Expo Showcase)")
    .alias("storybook")
    .option("-w, --web", "Ouvrir directement la prévisualisation dans le navigateur web", false)
    .option("-p, --port <number>", "Port pour le serveur Expo Web", "8081")
    .option("--inject", "Générer la route showcase dans le dossier des écrans de l'application", false)
    .option("--theme <preset>", "Preset de thème par défaut (ex: cyan, emerald, violet)")
    .action(async (options: { web?: boolean; port?: string; inject?: boolean; theme?: string }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — Showcase & Storybook Mobile"));
      console.log(chalk.dim("  Environnement interactif de test et manipulation des composants"));
      console.log();

      if (!project.hasRashwrightConfig) {
        console.log(chalk.yellow("  ⚠ Rashwright UI n'est pas encore initialisé dans ce répertoire."));
        console.log(chalk.dim("    Exécutez d'abord : rs-ui init"));
        console.log();
      }

      // Si l'utilisateur demande l'injection de la route dans son projet
      if (options.inject) {
        const targetRouteDir = project.hasExpoRouter
          ? join(cwd, "src", "app")
          : join(cwd, "src", "screens");

        if (!existsSync(targetRouteDir)) {
          mkdirSync(targetRouteDir, { recursive: true });
        }

        const showcaseRouteFile = project.hasExpoRouter
          ? join(targetRouteDir, "showcase.tsx")
          : join(targetRouteDir, "ShowcaseScreen.tsx");

        const showcaseCode = `// Route Showcase générée automatiquement par \`rs-ui showcase --inject\`
import React from "react";
import ShowcaseTemplate from "@/components/templates/showcase";

export default function ShowcaseRoute() {
  return <ShowcaseTemplate />;
}
`;
        writeFileSync(showcaseRouteFile, showcaseCode, "utf-8");
        console.log(chalk.green(`  ✔ Route Showcase injectée avec succès :`));
        console.log(chalk.dim(`    ${showcaseRouteFile}`));
        console.log();
      }

      console.log(chalk.bold("  🚀 Démarrage du serveur Expo Showcase..."));
      const pm = project.packageManager || "bun";
      const runner = pm === "bun" ? "bunx" : "npx";
      const cmdArgs = [runner, "expo", "start"];

      if (options.web) {
        cmdArgs.push("--web");
      }
      if (options.port) {
        cmdArgs.push("--port", options.port);
      }

      console.log(chalk.dim(`  Commande : ${cmdArgs.join(" ")}`));
      console.log(chalk.dim("  Appuyez sur 'w' pour ouvrir dans le navigateur, 'a' pour Android, 'i' pour iOS."));
      console.log();

      try {
        runCommand(cmdArgs.join(" "), cwd, false);
      } catch (err) {
        console.error(chalk.red("  ✖ Échec du lancement d'Expo :"), err);
      }
    });

  return cmd;
}
