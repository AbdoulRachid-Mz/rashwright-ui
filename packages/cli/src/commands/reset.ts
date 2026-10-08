import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { select, confirm } from "@inquirer/prompts";
import { join, dirname, relative } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { generateUiIndex } from "../core/starter-generator.js";

export interface ResetArtifact {
  relativePath: string;
  absolutePath: string;
  type: "component" | "asset" | "screen";
}

/**
 * Détecte les artefacts d'exemple Rashwright UI dans le projet cible.
 */
export function detectResetArtifacts(cwd: string, componentsPath: string): ResetArtifact[] {
  const candidates: Array<{ rel: string; type: "component" | "asset" | "screen" }> = [
    // Composants démo
    { rel: join(componentsPath, "showcase-screen.tsx"), type: "component" },
    { rel: join(componentsPath, "rashwright-logo.tsx"), type: "component" },
    // Assets démo
    { rel: "assets/primary.png", type: "asset" },
    { rel: "assets/svg/primary.svg", type: "asset" },
    // Écrans d'accueil démo
    { rel: "app/index.tsx", type: "screen" },
    { rel: "src/app/index.tsx", type: "screen" },
    { rel: "App.tsx", type: "screen" },
  ];

  const found: ResetArtifact[] = [];
  for (const c of candidates) {
    const abs = join(cwd, c.rel);
    if (existsSync(abs)) {
      found.push({
        relativePath: c.rel.replace(/\\/g, "/"),
        absolutePath: abs,
        type: c.type,
      });
    }
  }

  return found;
}

/**
 * Génère le contenu d'un écran d'accueil minimal et propre utilisant useTheme.
 */
export function generateMinimalHomeScreen(): string {
  return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

export default function HomeScreen() {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Bienvenue sur votre application
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
        Éditez <Text style={styles.bold}>app/index.tsx</Text> pour commencer à construire votre interface.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
});
`;
}

/**
 * Commande rs-ui reset / rs-ui-reset.
 */
export function resetCommand(): Command {
  const cmd = new Command("reset");
  cmd
    .description("Nettoyer les fichiers de démo et showcase du starter (archive ou suppression)")
    .option("--delete", "Supprimer définitivement les fichiers démo (au lieu d'archiver)")
    .option("--hard", "Alias de --delete (suppression définitive)")
    .option("--yes", "Confirmer sans poser de question")
    .option("--dry-run", "Afficher les actions sans les exécuter")
    .action(async (options) => {
      const cwd = process.cwd();

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI Mobile") + chalk.dim(" — rs-ui reset"));
      console.log();

      const project = detectProject(cwd);
      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce répertoire."));
        console.log(chalk.dim("    Exécutez d'abord: rs-ui init"));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);
      const artifacts = detectResetArtifacts(cwd, config.componentsPath);

      if (artifacts.length === 0) {
        console.log(chalk.green("  ✔ Aucun fichier d'exemple à nettoyer. Le projet est déjà réinitialisé ou propre."));
        return;
      }

      console.log(chalk.bold("  Fichiers d'exemple détectés :"));
      for (const a of artifacts) {
        console.log(chalk.dim(`    • ${a.relativePath} (${a.type})`));
      }
      console.log();

      const isHardDelete = Boolean(options.delete || options.hard);
      let action: "archive" | "delete" = isHardDelete ? "delete" : "archive";

      if (!isHardDelete && !options.yes && !options.dryRun) {
        action = await select<"archive" | "delete">({
          message: "Que souhaitez-vous faire des fichiers d'exemple ?",
          choices: [
            {
              name: "📦 Archiver dans rs-ui-example/ (Recommandé — réversible et sûr)",
              value: "archive",
            },
            {
              name: "🗑️  Supprimer définitivement (Irréversible)",
              value: "delete",
            },
          ],
          default: "archive",
        });
      }

      if (action === "delete" && !options.yes && !options.dryRun) {
        const confirmDelete = await confirm({
          message: chalk.yellow("Êtes-vous certain de vouloir supprimer définitivement ces fichiers ?"),
          default: false,
        });
        if (!confirmDelete) {
          console.log(chalk.dim("  Opération annulée."));
          return;
        }
      }

      const spinner = ora(
        action === "archive"
          ? "Archivage des fichiers d'exemple vers rs-ui-example/..."
          : "Suppression définitive des fichiers d'exemple..."
      ).start();

      if (options.dryRun) {
        spinner.info(`[dry-run] Opération ${action} simulée pour ${artifacts.length} fichiers.`);
        return;
      }

      const archiveBaseDir = join(cwd, "rs-ui-example");

      // ── Traitement des artefacts ─────────────────────────────────────────
      let screenToReset: string | null = null;

      for (const art of artifacts) {
        if (art.type === "screen") {
          // L'écran d'accueil sera réécrit avec HomeScreen minimal, on ne supprime que s'il est archivé
          screenToReset = art.absolutePath;
        }

        if (action === "archive") {
          const destPath = join(archiveBaseDir, art.relativePath);
          const destDir = dirname(destPath);
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

          try {
            copyFileSync(art.absolutePath, destPath);
            if (art.type !== "screen") {
              rmSync(art.absolutePath, { force: true });
            }
          } catch (err) {
            console.warn(`    ⚠ Erreur archivage ${art.relativePath}:`, (err as Error).message);
          }
        } else {
          // Suppression définitive
          if (art.type !== "screen") {
            try {
              rmSync(art.absolutePath, { force: true });
            } catch (err) {
              console.warn(`    ⚠ Erreur suppression ${art.relativePath}:`, (err as Error).message);
            }
          }
        }
      }

      // ── Générer écran minimal d'accueil ──────────────────────────────────
      if (screenToReset && existsSync(screenToReset)) {
        writeFileSync(screenToReset, generateMinimalHomeScreen(), "utf-8");
      }

      // ── Mettre à jour rashwright-ui.json ──────────────────────────────────
      const updatedComponents = { ...config.components };
      delete updatedComponents["showcase-screen"];
      delete updatedComponents["rashwright-logo"];

      config.components = updatedComponents;
      config.starter = {
        installed: true,
        reset: true,
        archived: action === "archive",
        resetAt: new Date().toISOString(),
      };

      writeConfig(project.rashwrightConfigPath, config);

      // ── Mettre à jour l'index des composants UI ──────────────────────────
      const targetDir = join(cwd, config.componentsPath);
      if (existsSync(targetDir)) {
        generateUiIndex(targetDir, Object.keys(updatedComponents), false);
      }

      // ── Ajouter script reset-project dans package.json si non présent ────
      const pkgPath = join(cwd, "package.json");
      if (existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
          if (!pkg.scripts) pkg.scripts = {};
          if (!pkg.scripts["reset-project"]) {
            pkg.scripts["reset-project"] = "rs-ui reset";
            writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
          }
        } catch {
          // Ignorer erreur non bloquante sur package.json
        }
      }

      spinner.succeed(
        action === "archive"
          ? "Fichiers d'exemple archivés avec succès dans rs-ui-example/ !"
          : "Fichiers d'exemple supprimés avec succès !"
      );

      console.log();
      console.log(chalk.bold.green("  ✔ Réinitialisation terminée"));
      if (action === "archive") {
        console.log(chalk.dim("    ✔ Les exemples originaux restent consultables dans : rs-ui-example/"));
      }
      console.log(chalk.dim("    ✔ Écran d'accueil minimal configuré"));
      console.log(chalk.dim("    ✔ Configuration rashwright-ui.json mise à jour"));
      console.log();
    });

  return cmd;
}
