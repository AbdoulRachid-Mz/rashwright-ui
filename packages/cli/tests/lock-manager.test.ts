import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  computeFileHash,
  recordLockedComponent,
  readLockfile,
  removeLockedComponent,
  checkComponentIntegrity,
  LOCKFILE_NAME,
} from "../src/core/lock-manager.js";

describe("Lockfile Manager (rashwright-ui.lock)", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-lock-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("computeFileHash normalizes CRLF and LF to identical SHA-256 hashes", () => {
    const textLF = "export const Button = () => null;\n";
    const textCRLF = "export const Button = () => null;\r\n";

    const hash1 = computeFileHash(textLF);
    const hash2 = computeFileHash(textCRLF);

    expect(hash1).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(hash1).toBe(hash2);
  });

  it("recordLockedComponent writes rashwright-ui.lock with accurate file hashes", () => {
    const compDir = join(tempDir, "components", "ui");
    mkdirSync(compDir, { recursive: true });

    const btnFile = join(compDir, "button.tsx");
    writeFileSync(btnFile, "export const Button = () => 'test';", "utf-8");

    const lock = recordLockedComponent(
      tempDir,
      "button",
      "0.3.0",
      ["components/ui/button.tsx"],
      [],
      ["expo-haptics"],
      false
    );

    expect(existsSync(join(tempDir, LOCKFILE_NAME))).toBe(true);
    expect(lock.lockfileVersion).toBe(1);
    expect(lock.components["button"]).toBeDefined();
    expect(lock.components["button"].version).toBe("0.3.0");
    expect(lock.components["button"].files.length).toBe(1);
    expect(lock.components["button"].files[0].path).toBe("components/ui/button.tsx");
    expect(lock.components["button"].files[0].hash).toMatch(/^sha256:/);
    expect(lock.components["button"].expoDependencies).toEqual(["expo-haptics"]);
  });

  it("checkComponentIntegrity detects clean, modified, and missing files", () => {
    const compDir = join(tempDir, "components", "ui");
    mkdirSync(compDir, { recursive: true });

    const btnFile = join(compDir, "button.tsx");
    writeFileSync(btnFile, "export const Button = () => 'original';", "utf-8");

    recordLockedComponent(tempDir, "button", "0.3.0", ["components/ui/button.tsx"]);

    // Cas 1 : Propre (clean)
    let integrity = checkComponentIntegrity(tempDir, "button");
    expect(integrity.status).toBe("clean");
    expect(integrity.modifiedFiles).toEqual([]);

    // Cas 2 : Modifié par l'utilisateur (modified)
    writeFileSync(btnFile, "export const Button = () => 'customized by user';", "utf-8");
    integrity = checkComponentIntegrity(tempDir, "button");
    expect(integrity.status).toBe("modified");
    expect(integrity.modifiedFiles).toContain("components/ui/button.tsx");

    // Cas 3 : Fichier supprimé (missing)
    rmSync(btnFile);
    integrity = checkComponentIntegrity(tempDir, "button");
    expect(integrity.status).toBe("missing");
    expect(integrity.missingFiles).toContain("components/ui/button.tsx");

    // Cas 4 : Non suivi (untracked)
    integrity = checkComponentIntegrity(tempDir, "unknown-comp");
    expect(integrity.status).toBe("untracked");
  });

  it("removeLockedComponent deletes entry from lockfile", () => {
    const compDir = join(tempDir, "components", "ui");
    mkdirSync(compDir, { recursive: true });
    writeFileSync(join(compDir, "button.tsx"), "// code", "utf-8");

    recordLockedComponent(tempDir, "button", "0.3.0", ["components/ui/button.tsx"]);
    expect(readLockfile(tempDir)?.components["button"]).toBeDefined();

    removeLockedComponent(tempDir, "button");
    const updated = readLockfile(tempDir);
    expect(updated?.components["button"]).toBeUndefined();
  });
});
