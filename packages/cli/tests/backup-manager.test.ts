import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import {
  createBackup,
  listBackups,
  getLatestBackup,
  restoreBackup,
  generateBackupId,
  BACKUPS_DIR_REL,
} from "../src/core/backup-manager.js";

const TEST_DIR = join(process.cwd(), ".tmp-test-backup-mgr");

describe("Backup Manager (.rashwright/backups/)", () => {
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

  it("generateBackupId generates valid timestamp format YYYY-MM-DD-HH-MM-SS", () => {
    const id = generateBackupId();
    expect(id).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
  });

  it("createBackup returns null if rashwright-ui.json does not exist", () => {
    const result = createBackup(TEST_DIR);
    expect(result).toBeNull();
  });

  it("createBackup creates snapshot directory with components, lockfile and meta.json", () => {
    // Setup dummy project
    const config = {
      version: 1,
      componentsPath: "src/components/ui",
      components: { button: "0.3.0", badge: "0.3.0" },
    };
    writeFileSync(join(TEST_DIR, "rashwright-ui.json"), JSON.stringify(config, null, 2));
    writeFileSync(join(TEST_DIR, "rashwright-ui.lock"), JSON.stringify({ lockfileVersion: 1 }, null, 2));

    const compDir = join(TEST_DIR, "src/components/ui");
    mkdirSync(compDir, { recursive: true });
    writeFileSync(join(compDir, "button.tsx"), "export const Button = () => null;");

    const backup = createBackup(TEST_DIR, { label: "pre-test", trigger: "manual" });
    expect(backup).not.toBeNull();
    expect(backup?.meta.label).toBe("pre-test");
    expect(backup?.meta.componentsCount).toBe(2);
    expect(backup?.meta.components).toContain("button");

    // Check files on disk
    expect(existsSync(join(backup!.path, "rashwright-ui.json"))).toBe(true);
    expect(existsSync(join(backup!.path, "rashwright-ui.lock"))).toBe(true);
    expect(existsSync(join(backup!.path, "meta.json"))).toBe(true);
    expect(existsSync(join(backup!.path, "components", "button.tsx"))).toBe(true);
  });

  it("listBackups and getLatestBackup sort snapshots chronologically descending", () => {
    writeFileSync(
      join(TEST_DIR, "rashwright-ui.json"),
      JSON.stringify({ version: 1, components: {} }, null, 2)
    );

    // Create 2 backup dirs directly
    const b1Dir = join(TEST_DIR, BACKUPS_DIR_REL, "2026-10-08-10-00-00");
    const b2Dir = join(TEST_DIR, BACKUPS_DIR_REL, "2026-10-08-11-00-00");
    mkdirSync(b1Dir, { recursive: true });
    mkdirSync(b2Dir, { recursive: true });

    writeFileSync(join(b1Dir, "meta.json"), JSON.stringify({ id: "2026-10-08-10-00-00", componentsCount: 1 }));
    writeFileSync(join(b2Dir, "meta.json"), JSON.stringify({ id: "2026-10-08-11-00-00", componentsCount: 2 }));

    const all = listBackups(TEST_DIR);
    expect(all.length).toBe(2);
    expect(all[0].id).toBe("2026-10-08-11-00-00");
    expect(all[1].id).toBe("2026-10-08-10-00-00");

    const latest = getLatestBackup(TEST_DIR);
    expect(latest?.id).toBe("2026-10-08-11-00-00");
  });

  it("restoreBackup restores config, lockfile and component files to project root", () => {
    const configInitial = {
      version: 1,
      componentsPath: "components/ui",
      components: { button: "0.3.0" },
    };
    writeFileSync(join(TEST_DIR, "rashwright-ui.json"), JSON.stringify(configInitial, null, 2));

    const compDir = join(TEST_DIR, "components/ui");
    mkdirSync(compDir, { recursive: true });
    writeFileSync(join(compDir, "button.tsx"), "INITIAL_BUTTON_CONTENT");

    const backup = createBackup(TEST_DIR, { trigger: "manual" });
    expect(backup).not.toBeNull();

    // Now modify the project
    writeFileSync(join(compDir, "button.tsx"), "MODIFIED_BUTTON_CONTENT");
    writeFileSync(
      join(TEST_DIR, "rashwright-ui.json"),
      JSON.stringify({ version: 1, components: { button: "0.4.0" } }, null, 2)
    );

    // Restore
    const res = restoreBackup(TEST_DIR, backup!.id);
    expect(res.restoredComponents).toBe(1);

    // Verify content reverted
    const restoredBtn = readFileSync(join(compDir, "button.tsx"), "utf-8");
    expect(restoredBtn).toBe("INITIAL_BUTTON_CONTENT");

    const restoredConfig = JSON.parse(readFileSync(join(TEST_DIR, "rashwright-ui.json"), "utf-8"));
    expect(restoredConfig.components.button).toBe("0.3.0");
  });
});
