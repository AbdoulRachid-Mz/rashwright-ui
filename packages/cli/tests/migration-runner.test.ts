import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { migrateCommand } from "../src/commands/migrate.js";
import {
  REGISTERED_MIGRATIONS,
  runMigrations,
  migration030to040,
  migration040to050,
} from "../src/core/migration-runner.js";

const TEST_DIR = join(process.cwd(), ".tmp-test-migrations");

describe("System Migration Engine (rs-ui migrate)", () => {
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

  it("migrateCommand exposes correct command definition and options", () => {
    const cmd = migrateCommand();
    expect(cmd.name()).toBe("migrate");
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("check");
    expect(optionNames).toContain("yes");
    expect(optionNames).toContain("dry-run");
  });

  it("REGISTERED_MIGRATIONS contains 0.3.0-to-0.4.0 and 0.4.0-to-0.5.0", () => {
    const ids = REGISTERED_MIGRATIONS.map((m) => m.id);
    expect(ids).toContain("0.3.0-to-0.4.0");
    expect(ids).toContain("0.4.0-to-0.5.0");
  });

  it("migration 0.3.0-to-0.4.0 generates missing lockfile and starter metadata", async () => {
    const initialConfig = {
      version: 1,
      componentsPath: "components/ui",
      components: { button: "0.3.0" },
    };
    const configPath = join(TEST_DIR, "rashwright-ui.json");
    const lockfilePath = join(TEST_DIR, "rashwright-ui.lock");
    writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));

    const result = await migration030to040.up({
      projectRoot: TEST_DIR,
      configPath,
      lockfilePath,
      dryRun: false,
      logger: { info: () => {}, warn: () => {}, success: () => {} },
    });

    expect(result.success).toBe(true);
    expect(existsSync(lockfilePath)).toBe(true);

    const updatedConfig = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(updatedConfig.starter).toBeDefined();
    expect(updatedConfig.starter.installed).toBe(true);
  });

  it("migration 0.4.0-to-0.5.0 adds projectComponents and skills fields", async () => {
    const configV4 = {
      version: 1,
      componentsPath: "components/ui",
      components: { button: "0.4.0" },
    };
    const configPath = join(TEST_DIR, "rashwright-ui.json");
    const lockfilePath = join(TEST_DIR, "rashwright-ui.lock");
    writeFileSync(configPath, JSON.stringify(configV4, null, 2));

    const result = await migration040to050.up({
      projectRoot: TEST_DIR,
      configPath,
      lockfilePath,
      dryRun: false,
      logger: { info: () => {}, warn: () => {}, success: () => {} },
    });

    expect(result.success).toBe(true);
    const updatedConfig = JSON.parse(readFileSync(configPath, "utf-8"));
    expect(updatedConfig.projectComponents).toBeDefined();
    expect(updatedConfig.skills).toBeDefined();
  });

  it("runMigrations executes sequentially and creates automatic backup", async () => {
    const configPath = join(TEST_DIR, "rashwright-ui.json");
    writeFileSync(
      configPath,
      JSON.stringify({ version: 1, componentsPath: "components/ui", components: {} }, null, 2)
    );

    const outcome = await runMigrations(TEST_DIR, { dryRun: false });
    expect(outcome.executedCount).toBe(REGISTERED_MIGRATIONS.length);
    expect(existsSync(join(TEST_DIR, ".rashwright/backups"))).toBe(true);
  });
});
