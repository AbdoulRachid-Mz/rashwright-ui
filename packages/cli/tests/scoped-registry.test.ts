import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { registryCommand } from "../src/commands/registry.js";
import {
  addScopedRegistry,
  getScopedRegistries,
  removeScopedRegistry,
  parseScopedComponentName,
} from "../src/core/scoped-registry.js";

const TEST_DIR = join(process.cwd(), ".tmp-test-scoped-registry");

describe("Scoped & Multi-Registry Subsystem (rs-ui registry)", () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("parseScopedComponentName parses @scope/component@version accurately", () => {
    expect(parseScopedComponentName("button")).toEqual({
      scope: null,
      name: "button",
      version: undefined,
    });

    expect(parseScopedComponentName("@corp/auth-modal")).toEqual({
      scope: "corp",
      name: "auth-modal",
      version: undefined,
    });

    expect(parseScopedComponentName("@corp/auth-modal@1.2.0")).toEqual({
      scope: "corp",
      name: "auth-modal",
      version: "1.2.0",
    });
  });

  it("addScopedRegistry writes registry entry to rashwright-ui.json", () => {
    writeFileSync(
      join(TEST_DIR, "rashwright-ui.json"),
      JSON.stringify({ version: 1, components: {} }, null, 2)
    );

    const entry = addScopedRegistry(TEST_DIR, "internal", "https://registry.corp.internal/ui");
    expect(entry.alias).toBe("internal");
    expect(entry.url).toBe("https://registry.corp.internal/ui");

    const all = getScopedRegistries(TEST_DIR);
    expect(all["internal"]).toBeDefined();
    expect(all["internal"].url).toBe("https://registry.corp.internal/ui");
  });

  it("removeScopedRegistry deletes registry entry", () => {
    writeFileSync(
      join(TEST_DIR, "rashwright-ui.json"),
      JSON.stringify(
        {
          version: 1,
          registries: {
            internal: { alias: "internal", url: "https://corp.dev", addedAt: "" },
          },
        },
        null,
        2
      )
    );

    const ok = removeScopedRegistry(TEST_DIR, "internal");
    expect(ok).toBe(true);

    const all = getScopedRegistries(TEST_DIR);
    expect(all["internal"]).toBeUndefined();
  });

  it("registryCommand exposes list, add, remove subcommands", () => {
    const cmd = registryCommand();
    expect(cmd.name()).toBe("registry");
    const subNames = cmd.commands.map((c) => c.name());
    expect(subNames).toContain("list");
    expect(subNames).toContain("add");
    expect(subNames).toContain("remove");
  });
});
