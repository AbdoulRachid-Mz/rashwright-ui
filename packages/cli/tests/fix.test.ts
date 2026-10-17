import { describe, it, expect } from "vitest";
import { fixCommand } from "../src/commands/fix.js";

describe("Fix Command (rs-ui fix)", () => {
  it("exposes command name fix and description", () => {
    const cmd = fixCommand();
    expect(cmd.name()).toBe("fix");
    expect(cmd.description()).toContain("réparer");
  });

  it("exposes options: --yes, --dry-run, --registry, --json", () => {
    const cmd = fixCommand();
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("yes");
    expect(optionNames).toContain("dry-run");
    expect(optionNames).toContain("registry");
    expect(optionNames).toContain("json");
  });
});
