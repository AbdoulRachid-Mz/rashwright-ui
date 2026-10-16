import { describe, it, expect } from "vitest";
import { diffCommand } from "../src/commands/diff.js";

describe("diffCommand", () => {
  it("initializes diff command with expected arguments and options", () => {
    const cmd = diffCommand();
    expect(cmd.name()).toBe("diff");
    expect(cmd.description()).toContain("Comparer");

    const optionFlags = cmd.options.map((o) => o.flags);
    expect(optionFlags.some((f) => f.includes("--json"))).toBe(true);
  });
});
