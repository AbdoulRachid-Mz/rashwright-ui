import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { InstallationTransaction } from "../src/core/installation-transaction.js";

describe("InstallationTransaction", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "rs-ui-transaction-test-"));
  });

  afterEach(() => {
    if (existsSync(root)) rmSync(root, { recursive: true, force: true });
  });

  it("restaure un fichier préexistant après une écriture", () => {
    const file = join(root, "button.tsx");
    writeFileSync(file, "original", "utf-8");

    const transaction = new InstallationTransaction();
    transaction.track(file);
    writeFileSync(file, "modifié", "utf-8");

    const report = transaction.rollback();

    expect(report.success).toBe(true);
    expect(report.entries).toEqual([
      { path: file, action: "restored" },
    ]);
    expect(readFileSync(file, "utf-8")).toBe("original");
  });

  it("supprime un fichier créé qui n'existait pas avant", () => {
    const file = join(root, "src", "components", "ui", "card.tsx");

    const transaction = new InstallationTransaction();
    transaction.track(file);
    mkdirSync(join(root, "src", "components", "ui"), { recursive: true });
    writeFileSync(file, "export const Card = () => null;", "utf-8");

    const report = transaction.rollback();

    expect(report.success).toBe(true);
    expect(report.entries).toEqual([{ path: file, action: "removed" }]);
    expect(existsSync(file)).toBe(false);
  });

  it("conserve le premier instantané (idempotence) et ne réécrit pas un fichier intact", () => {
    const file = join(root, "keep.txt");
    writeFileSync(file, "v1", "utf-8");

    const transaction = new InstallationTransaction();
    transaction.track(file);
    writeFileSync(file, "v2", "utf-8");
    transaction.track(file);
    writeFileSync(file, "v1", "utf-8");

    const report = transaction.rollback();

    expect(report.entries).toEqual([]);
    expect(readFileSync(file, "utf-8")).toBe("v1");
  });

  it("enregistre les opérations externes non annulables sans doublon", () => {
    const transaction = new InstallationTransaction();
    transaction.recordExternal({ kind: "expo", packages: ["expo-haptics"] });
    transaction.recordExternal({ kind: "expo", packages: ["expo-haptics"] });
    transaction.recordExternal({ kind: "npm", packages: ["zustand"] });

    const report = transaction.rollback();

    expect(report.externalOperations).toEqual([
      { kind: "expo", packages: ["expo-haptics"] },
      { kind: "npm", packages: ["zustand"] },
    ]);
  });

  it("refuse de suivre un chemin qui existe en tant que dossier", () => {
    const directory = join(root, "components");
    mkdirSync(directory, { recursive: true });

    const transaction = new InstallationTransaction();
    expect(() => transaction.track(directory)).toThrow(/n'est pas un fichier/);
  });
});
