import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  copyComponentFiles,
  resolveSourcePath,
  writeFile,
  isFileModified,
} from "../src/core/file-manager.js";

describe("file-manager", () => {
  let tempDir: string;
  let sourceDir: string;
  let targetDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-file-test-"));
    sourceDir = join(tempDir, "source");
    targetDir = join(tempDir, "target");

    // Setup dummy source file
    writeFile(join(sourceDir, "components/ui/test-btn.tsx"), "export const TestBtn = () => null;\n");
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("resolveSourcePath concatenates root and relative file path", () => {
    const resolved = resolveSourcePath("components/ui/btn.tsx", "/root");
    expect(resolved).toBe(join("/root", "components/ui/btn.tsx"));
  });

  it("writeFile creates parent directories and file content", () => {
    const targetFile = join(tempDir, "deep", "nested", "file.txt");
    writeFile(targetFile, "Hello Vitest");
    expect(existsSync(targetFile)).toBe(true);
    expect(readFileSync(targetFile, "utf-8")).toBe("Hello Vitest");
  });

  it("copyComponentFiles copies new component files into target root", () => {
    const results = copyComponentFiles(
      ["components/ui/test-btn.tsx"],
      sourceDir,
      targetDir,
      { overwrite: false, dryRun: false }
    );

    expect(results.length).toBe(1);
    expect(results[0].status).toBe("copied");
    const dest = join(targetDir, "test-btn.tsx");
    expect(existsSync(dest)).toBe(true);
    expect(readFileSync(dest, "utf-8")).toContain("TestBtn");
  });

  it("copyComponentFiles respects dryRun option", () => {
    const dryTarget = join(tempDir, "dry-target");
    const results = copyComponentFiles(
      ["components/ui/test-btn.tsx"],
      sourceDir,
      dryTarget,
      { overwrite: false, dryRun: true }
    );

    expect(results.length).toBe(1);
    expect(results[0].status).toBe("copied");
    expect(existsSync(join(dryTarget, "test-btn.tsx"))).toBe(false);
  });

  it("copyComponentFiles skips existing modified file without overwrite", () => {
    const dest = join(targetDir, "test-btn.tsx");
    writeFile(dest, "// user modified content\n");

    const results = copyComponentFiles(
      ["components/ui/test-btn.tsx"],
      sourceDir,
      targetDir,
      { overwrite: false, dryRun: false }
    );

    expect(results[0].status).toBe("skipped");
    expect(results[0].isModified).toBe(true);
    expect(readFileSync(dest, "utf-8")).toBe("// user modified content\n");
  });

  it("copyComponentFiles overwrites existing file when overwrite is true", () => {
    const dest = join(targetDir, "test-btn.tsx");
    writeFile(dest, "// user modified content\n");

    const results = copyComponentFiles(
      ["components/ui/test-btn.tsx"],
      sourceDir,
      targetDir,
      { overwrite: true, dryRun: false }
    );

    expect(results[0].status).toBe("overwritten");
    expect(readFileSync(dest, "utf-8")).toContain("TestBtn");
  });

  it("isFileModified checks if file matches reference content", () => {
    const testFile = join(tempDir, "check.txt");
    writeFile(testFile, "abc");
    expect(isFileModified(testFile, "abc")).toBe(false);
    expect(isFileModified(testFile, "xyz")).toBe(true);
  });
});
