import { Command } from "commander";
import chalk from "chalk";
import { startMcpStdioServer } from "../mcp/server.js";
import {
  installMcpConfig,
  getMcpConfigSnippet,
  getTargetConfigPath,
  type McpClientTarget,
} from "../mcp/config-generator.js";

export function mcpCommand(): Command {
  const cmd = new Command("mcp");

  cmd
    .description("Lancer le serveur Model Context Protocol (MCP) pour les assistants IA ou configurer votre éditeur")
    .action(() => {
      // Action par défaut de `rs-ui mcp` : démarrer le serveur stdio
      startMcpStdioServer();
    });

  const setupCmd = new Command("setup");
  setupCmd
    .description("Générer ou installer automatiquement la configuration MCP pour Cursor, Claude Desktop ou VS Code")
    .argument("[target]", "Cible : cursor, claude, ou vscode", "cursor")
    .option("--write", "Écrire directement dans le fichier de configuration de l'éditeur")
    .action((targetArg: string, options: { write?: boolean }) => {
      const target = (targetArg.toLowerCase() || "cursor") as McpClientTarget;
      if (!["cursor", "claude", "vscode"].includes(target)) {
        console.error(chalk.red(`\n  ✖ Cible invalide : '${targetArg}'. Utilisez 'cursor', 'claude' ou 'vscode'.\n`));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(` — Configuration MCP (${target})`));
      console.log();

      if (options.write) {
        const result = installMcpConfig(target, { write: true });
        if (result.created) {
          console.log(chalk.green(`  ✔ Fichier de configuration créé avec succès :`));
        } else {
          console.log(chalk.green(`  ✔ Configuration mise à jour avec succès :`));
        }
        console.log(chalk.dim(`    ${result.path}\n`));
      } else {
        const targetPath = getTargetConfigPath(target);
        const snippet = getMcpConfigSnippet(target);
        console.log(chalk.dim(`  Fichier cible : ${targetPath}`));
        console.log(chalk.yellow("  Extrait à copier dans votre configuration :"));
        console.log();
        console.log(chalk.cyan(JSON.stringify(snippet, null, 2)));
        console.log();
        console.log(chalk.dim("  Astuce : Utilisez `rs-ui mcp setup " + target + " --write` pour l'écrire automatiquement."));
        console.log();
      }
    });

  cmd.addCommand(setupCmd);

  return cmd;
}
