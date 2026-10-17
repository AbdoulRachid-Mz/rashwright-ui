import { describe, it, expect } from "vitest";
import { merge3Way, merge2Way } from "../src/core/merge-manager.js";

describe("merge-manager (3-Way Merge & 2-Way Merge)", () => {
  describe("merge3Way", () => {
    it("returns localText when remote has not changed compared to base", () => {
      const base = "line 1\nline 2";
      const local = "line 1\nline 2 modified by user";
      const remote = "line 1\nline 2";

      const res = merge3Way(base, local, remote);
      expect(res.hasConflict).toBe(false);
      expect(res.conflictsCount).toBe(0);
      expect(res.merged).toBe(local);
    });

    it("returns remoteText when local has not changed compared to base", () => {
      const base = "line 1\nline 2";
      const local = "line 1\nline 2";
      const remote = "line 1\nline 2 updated by upstream";

      const res = merge3Way(base, local, remote);
      expect(res.hasConflict).toBe(false);
      expect(res.conflictsCount).toBe(0);
      expect(res.merged).toBe(remote);
    });

    it("returns identical text when local and remote made identical modifications", () => {
      const base = "line 1\nline 2";
      const local = "line 1\nline 2 both changed";
      const remote = "line 1\nline 2 both changed";

      const res = merge3Way(base, local, remote);
      expect(res.hasConflict).toBe(false);
      expect(res.merged).toBe(local);
    });

    it("generates Git-style conflict markers when both changed divergently", () => {
      const base = "const color = 'blue';";
      const local = "const color = 'red'; // user custom";
      const remote = "const color = 'green'; // upstream update";

      const res = merge3Way(base, local, remote);
      expect(res.hasConflict).toBe(true);
      expect(res.conflictsCount).toBeGreaterThan(0);
      expect(res.merged).toContain("<<<<<<< LOCAL (vos modifications)");
      expect(res.merged).toContain("const color = 'red'; // user custom");
      expect(res.merged).toContain("=======");
      expect(res.merged).toContain("const color = 'green'; // upstream update");
      expect(res.merged).toContain(">>>>>>> REGISTRY (mise à jour)");
    });
  });

  describe("merge2Way", () => {
    it("returns same content when local and remote match", () => {
      const code = "export default function Component() {}";
      const res = merge2Way(code, code);
      expect(res.hasConflict).toBe(false);
      expect(res.merged).toBe(code);
    });

    it("detects divergence and adds conflict markers when local differs from remote", () => {
      const local = "const localA = 1;";
      const remote = "const remoteB = 2;";

      const res = merge2Way(local, remote);
      expect(res.hasConflict).toBe(true);
      expect(res.merged).toContain("<<<<<<< LOCAL");
      expect(res.merged).toContain("const localA = 1;");
      expect(res.merged).toContain("=======");
      expect(res.merged).toContain("const remoteB = 2;");
      expect(res.merged).toContain(">>>>>>> REGISTRY");
    });
  });
});
