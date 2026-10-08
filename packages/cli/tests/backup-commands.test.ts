import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { backupCommand } from "../src/commands/backup.js";
import { restoreCommand } from "../src/commands/restore.js";
import { listBackups, getLatestBackup, restoreBackup } from "../src/core/backup-manager.js";

const TEST_DIR = join(process.cwd(), ".tmp-test-backup-commands");

describe("Backup & Restore Commands CLI", () => {
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

  it("backupCommand exposes correct command definition", () => {
    const cmd = backupCommand();
    expect(cmd.name()).toBe("backup");
    expect(cmd.description()).toContain("sauvegarde");
  });

  it("restoreCommand exposes correct command definition and options", () => {
    const cmd = restoreCommand();
    expect(cmd.name()).toBe("restore");
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("latest");
    expect(optionNames).toContain("yes");
    expect(optionNames).toContain("dry-run");
  });

  it("restoreBackup handles non-existent snapshot gracefully", () => {
    expect(() => {
      restoreBackup(TEST_DIR, "inexistent-backup-id");
    }).toThrow(/Backup introuvable/);
  });
});
