/**
 * config-generator.ts — Génération de configuration MCP pour IDEs et assistants IA.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import os from "node:os";

export type McpClientTarget = "cursor" | "claude" | "vscode";

export interface SetupOptions {
  cwd?: string;
  write?: boolean;
}

export function getMcpConfigSnippet(target: McpClientTarget, packageManager: "bun" | "npm" = "bun"): Record<string, unknown> {
  const runner = packageManager === "bun" ? "bunx" : "npx";
  const runnerArgs = packageManager === "bun" ? ["@rashwright/cli", "mcp"] : ["-y", "@rashwright/cli", "mcp"];

  if (target === "vscode") {
    return {
      servers: {
        "rashwright-ui": {
          command: runner,
          args: runnerArgs,
        },
      },
    };
  }

  return {
    mcpServers: {
      "rashwright-ui": {
        command: runner,
        args: runnerArgs,
      },
    },
  };
}

export function getTargetConfigPath(target: McpClientTarget, cwd: string = process.cwd()): string {
  switch (target) {
    case "cursor":
      return join(cwd, ".cursor", "mcp.json");
    case "vscode":
      return join(cwd, ".vscode", "mcp.json");
    case "claude": {
      if (process.platform === "win32") {
        const appData = process.env.APPDATA || join(os.homedir(), "AppData", "Roaming");
        return join(appData, "Claude", "claude_desktop_config.json");
      }
      if (process.platform === "darwin") {
        return join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
      }
      return join(os.homedir(), ".config", "Claude", "claude_desktop_config.json");
    }
  }
}

export function installMcpConfig(
  target: McpClientTarget,
  options: SetupOptions = {}
): { path: string; config: Record<string, unknown>; created: boolean; updated: boolean } {
  const cwd = options.cwd ?? process.cwd();
  const filePath = getTargetConfigPath(target, cwd);
  const snippet = getMcpConfigSnippet(target);

  if (!options.write) {
    return { path: filePath, config: snippet, created: false, updated: false };
  }

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let finalConfig: Record<string, any> = snippet;
  let updated = false;
  let created = false;

  if (existsSync(filePath)) {
    try {
      const existing = JSON.parse(readFileSync(filePath, "utf-8"));
      if (target === "vscode") {
        existing.servers = existing.servers || {};
        existing.servers["rashwright-ui"] = (snippet as any).servers["rashwright-ui"];
      } else {
        existing.mcpServers = existing.mcpServers || {};
        existing.mcpServers["rashwright-ui"] = (snippet as any).mcpServers["rashwright-ui"];
      }
      finalConfig = existing;
      updated = true;
    } catch {
      finalConfig = snippet;
      created = true;
    }
  } else {
    created = true;
  }

  writeFileSync(filePath, JSON.stringify(finalConfig, null, 2) + "\n", "utf-8");
  return { path: filePath, config: finalConfig, created, updated };
}
