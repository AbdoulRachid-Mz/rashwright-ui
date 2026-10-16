import { describe, it, expect } from "vitest";
import { handleJsonRpcMessage, type JsonRpcRequest } from "../src/mcp/server.js";
import { MCP_TOOLS, executeMcpTool } from "../src/mcp/tools.js";
import { getMcpConfigSnippet, getTargetConfigPath } from "../src/mcp/config-generator.js";

describe("MCP Server (Model Context Protocol)", () => {
  it("exposes standard MCP tools list", () => {
    expect(MCP_TOOLS.length).toBeGreaterThanOrEqual(6);
    const names = MCP_TOOLS.map((t) => t.name);
    expect(names).toContain("list_components");
    expect(names).toContain("get_component");
    expect(names).toContain("search_registry");
    expect(names).toContain("list_templates");
    expect(names).toContain("get_theme_tokens");
    expect(names).toContain("get_skill");
  });

  it("handles 'initialize' method compliant with MCP spec", async () => {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: "req-1",
      method: "initialize",
      params: { protocolVersion: "2024-11-05" },
    };

    const response = await handleJsonRpcMessage(request);
    expect(response).not.toBeNull();
    expect(response?.id).toBe("req-1");
    expect((response?.result as any)?.serverInfo?.name).toBe("rashwright-ui-mcp");
    expect((response?.result as any)?.serverInfo?.version).toBe("1.0.0");
    expect((response?.result as any)?.capabilities?.tools).toBeDefined();
  });

  it("handles 'ping' method", async () => {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: "ping-1",
      method: "ping",
    };

    const response = await handleJsonRpcMessage(request);
    expect(response?.result).toEqual({});
  });

  it("handles 'tools/list' method returning MCP tools", async () => {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: "tools-list-1",
      method: "tools/list",
    };

    const response = await handleJsonRpcMessage(request);
    const tools = (response?.result as any)?.tools;
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThanOrEqual(6);
  });

  it("executes 'list_components' tool", async () => {
    const result = await executeMcpTool("list_components", { category: "Layout" });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.components.some((c: any) => c.name === "card")).toBe(true);
  });

  it("executes 'get_component' tool with source code", async () => {
    const result = await executeMcpTool("get_component", { name: "view", includeSource: true });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.name).toBe("view");
    expect(parsed.category).toBe("Layout");
    expect(parsed.filesContent).toBeDefined();
    expect(Object.keys(parsed.filesContent).length).toBeGreaterThan(0);
  });

  it("executes 'search_registry' tool", async () => {
    const result = await executeMcpTool("search_registry", { query: "carousel" });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.results.some((r: any) => r.name === "carousel")).toBe(true);
  });

  it("executes 'get_theme_tokens' tool", async () => {
    const result = await executeMcpTool("get_theme_tokens", { category: "colors" });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.colors).toBeDefined();
    expect(parsed.colors.primary).toBeDefined();
  });

  it("executes 'get_skill' tool for flat-list and view", async () => {
    const result = await executeMcpTool("get_skill", { component: "flat-list" });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.component).toBe("flat-list");
    expect(parsed.markdown).toContain("ThemedFlatList");
  });

  it("generates correct MCP configuration snippets for Cursor and Claude", () => {
    const cursorConfig = getMcpConfigSnippet("cursor", "bun");
    expect(cursorConfig.mcpServers).toBeDefined();
    expect((cursorConfig.mcpServers as any)["rashwright-ui"].command).toBe("bunx");

    const claudePath = getTargetConfigPath("claude");
    expect(claudePath).toContain("claude_desktop_config.json");
  });
});
