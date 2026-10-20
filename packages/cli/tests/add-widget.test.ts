import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { addCommand } from "../src/commands/add.js";
import {
  readLockfile,
  recordLockedWidget,
  checkWidgetIntegrity,
  removeLockedWidget,
} from "../src/core/lock-manager.js";

describe("addCommand --widget option & lockfile widgets", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `rs-ui-add-widget-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      try {
        rmSync(testDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  });

  it("exposes -w, --widget option on addCommand", () => {
    const cmd = addCommand();
    const opt = cmd.options.find((o) => o.name() === "widget" || o.short === "-w");
    expect(opt).toBeDefined();
    expect(opt?.description).toContain("widget");
  });

  it("records and verifies locked widget integrity in lockfile", () => {
    // Créer un fichier widget factice dans le projet de test
    const wgtDir = join(testDir, "src/components/widgets/metric");
    mkdirSync(wgtDir, { recursive: true });
    writeFileSync(join(wgtDir, "metric-widget.tsx"), "// MetricWidget component", "utf-8");

    const lock = recordLockedWidget(
      testDir,
      "metric",
      "1.0.0",
      "src/components/widgets/metric",
      ["card", "stat-card", "badge"],
      ["src/components/widgets/metric/metric-widget.tsx"]
    );

    expect(lock.widgets).toBeDefined();
    expect(lock.widgets?.metric).toBeDefined();
    expect(lock.widgets?.metric.version).toBe("1.0.0");
    expect(lock.widgets?.metric.requiredComponents).toEqual(["card", "stat-card", "badge"]);
    expect(lock.widgets?.metric.files).toHaveLength(1);

    // Vérifier l'intégrité : doit être clean
    const integrityClean = checkWidgetIntegrity(testDir, "metric");
    expect(integrityClean.status).toBe("clean");

    // Modifier le fichier et revérifier l'intégrité : doit être modified
    writeFileSync(join(wgtDir, "metric-widget.tsx"), "// Modified content", "utf-8");
    const integrityMod = checkWidgetIntegrity(testDir, "metric");
    expect(integrityMod.status).toBe("modified");
    expect(integrityMod.modifiedFiles).toContain("src/components/widgets/metric/metric-widget.tsx");

    // Supprimer le widget du lockfile
    const updated = removeLockedWidget(testDir, "metric");
    expect(updated?.widgets?.metric).toBeUndefined();
  });
});
