import { describe, it, expect } from "vitest";
import { searchCommand } from "../src/commands/search.js";

describe("searchCommand", () => {
  it("initializes search command with expected arguments and options", () => {
    const cmd = searchCommand();
    expect(cmd.name()).toBe("search");
    expect(cmd.description()).toContain("Rechercher");

    const optionFlags = cmd.options.map((o) => o.flags);
    expect(optionFlags.some((f) => f.includes("--components-only"))).toBe(true);
    expect(optionFlags.some((f) => f.includes("--templates-only"))).toBe(true);
    expect(optionFlags.some((f) => f.includes("--json"))).toBe(true);
  });
});
