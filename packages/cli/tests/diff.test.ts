import { describe, it, expect } from "vitest";
import { computeLineDiff, formatDiffOutput } from "../src/core/diff.js";

describe("diff", () => {
  it("computeLineDiff detects additions and removals correctly", () => {
    const oldCode = 'const x = 1;\nconst y = 2;\nconsole.log(x);';
    const newCode = 'const x = 1;\nconst y = 3;\nconsole.log(x);';

    const diff = computeLineDiff(oldCode, newCode);
    expect(diff.length).toBeGreaterThan(0);

    const removed = diff.find((d) => d.type === "removed");
    const added = diff.find((d) => d.type === "added");

    expect(removed?.line).toBe("const y = 2;");
    expect(added?.line).toBe("const y = 3;");
  });

  it("formatDiffOutput outputs colorized diff", () => {
    const oldCode = 'line 1\nline 2';
    const newCode = 'line 1\nline 2 updated';

    const diff = computeLineDiff(oldCode, newCode);
    const formatted = formatDiffOutput(diff);
    expect(formatted).toContain("- line 2");
    expect(formatted).toContain("+ line 2 updated");
  });

  it("formatDiffOutput reports no differences when strings are identical", () => {
    const code = 'const hello = "world";';
    const diff = computeLineDiff(code, code);
    const formatted = formatDiffOutput(diff);
    expect(formatted).toContain("Aucune différence");
  });
});
