/**
 * server.ts — Serveur Model Context Protocol (MCP) pour Rashwright UI Mobile.
 *
 * Implémente le protocole MCP standard (JSON-RPC 2.0 sur stdio) pour intégrer
 * nativement Rashwright UI avec Cursor, Claude Desktop, VS Code, et autres LLMs.
 */

import { MCP_TOOLS, executeMcpTool } from "./tools.js";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Traite une requête JSON-RPC reçue et produit la réponse correspondante.
 */
export async function handleJsonRpcMessage(message: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const { id, method, params } = message;

  // Si c'est une notification (pas d'id), on ne répond pas
  const isNotification = id === undefined || id === null;

  try {
    switch (method) {
      case "initialize": {
        const response: JsonRpcResponse = {
          jsonrpc: "2.0",
          id: id ?? null,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "rashwright-ui-mcp",
              version: "1.0.0",
            },
          },
        };
        return response;
      }

      case "notifications/initialized":
      case "initialized": {
        return null;
      }

      case "ping": {
        if (isNotification) return null;
        return {
          jsonrpc: "2.0",
          id,
          result: {},
        };
      }

      case "tools/list": {
        if (isNotification) return null;
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: MCP_TOOLS,
          },
        };
      }

      case "tools/call": {
        if (isNotification) return null;
        const toolName = String(params?.name || "");
        const toolArgs = (params?.arguments as Record<string, unknown>) || {};

        const execution = await executeMcpTool(toolName, toolArgs);

        return {
          jsonrpc: "2.0",
          id,
          result: execution,
        };
      }

      default: {
        if (isNotification) return null;
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: `Méthode non trouvée : '${method}'`,
          },
        };
      }
    }
  } catch (err) {
    if (isNotification) return null;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: `Erreur interne serveur : ${msg}`,
      },
    };
  }
}

/**
 * Démarre le serveur MCP en écoutant sur stdio.
 */
export function startMcpStdioServer(): void {
  // En mode MCP, process.stdout est réservé aux trames JSON-RPC.
  // Tout log d'information doit aller dans stderr.
  process.stderr.write("[MCP] Serveur Rashwright UI démarré sur stdio.\n");

  let buffer = "";

  process.stdin.setEncoding("utf-8");

  process.stdin.on("data", async (chunk: string) => {
    buffer += chunk;

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? ""; // garde la ligne partielle dans le buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed) as JsonRpcRequest;
        const response = await handleJsonRpcMessage(parsed);
        if (response) {
          process.stdout.write(JSON.stringify(response) + "\n");
        }
      } catch {
        const parseError: JsonRpcResponse = {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Erreur d'analyse JSON (Parse error)",
          },
        };
        process.stdout.write(JSON.stringify(parseError) + "\n");
      }
    }
  });

  process.stdin.on("end", () => {
    process.stderr.write("[MCP] Flux stdin fermé. Arrêt du serveur.\n");
    process.exit(0);
  });
}
