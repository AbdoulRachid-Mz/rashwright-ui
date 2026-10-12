import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { addCommand } from "../src/commands/add.js";
import {
  readLockfile,
  writeLockfile,
  recordLockedTemplate,
  checkTemplateIntegrity,
  removeLockedTemplate,
} from "../src/core/lock-manager.js";

describe("addCommand --template option & lockfile templates", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `rs-ui-add-template-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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

  it("exposes -t, --template option on addCommand", () => {
    const cmd = addCommand();
    const opt = cmd.options.find((o) => o.name() === "template" || o.short === "-t");
    expect(opt).toBeDefined();
    expect(opt?.description).toContain("template");
  });

  it("records and verifies locked template integrity in lockfile", () => {
    // Créer un fichier template factice dans le projet
    const tplDir = join(testDir, "src/components/templates/minimal");
    mkdirSync(tplDir, { recursive: true });
    writeFileSync(join(tplDir, "minimal-template.tsx"), "// MinimalTemplate component", "utf-8");

    const lock = recordLockedTemplate(
      testDir,
      "minimal",
      "0.7.0",
      "src/components/templates/minimal",
      ["button", "card"],
      ["src/components/templates/minimal/minimal-template.tsx"]
    );

    expect(lock.templates.minimal).toBeDefined();
    expect(lock.templates.minimal.version).toBe("0.7.0");
    expect(lock.templates.minimal.requiredComponents).toEqual(["button", "card"]);
    expect(lock.templates.minimal.files).toHaveLength(1);

    // Vérifier l'intégrité : doit être clean
    const integrityClean = checkTemplateIntegrity(testDir, "minimal");
    expect(integrityClean.status).toBe("clean");

    // Modifier le fichier et revérifier l'intégrité : doit être modified
    writeFileSync(join(tplDir, "minimal-template.tsx"), "// Modified content", "utf-8");
    const integrityMod = checkTemplateIntegrity(testDir, "minimal");
    expect(integrityMod.status).toBe("modified");
    expect(integrityMod.modifiedFiles).toContain("src/components/templates/minimal/minimal-template.tsx");

    // Supprimer le template du lockfile
    const updated = removeLockedTemplate(testDir, "minimal");
    expect(updated?.templates.minimal).toBeUndefined();
  });
});
