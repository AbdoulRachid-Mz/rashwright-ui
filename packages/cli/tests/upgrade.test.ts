import { describe, it, expect } from "vitest";
import { upgradeCommand } from "../src/commands/upgrade.js";

describe("Lifecycle Upgrade Command (rs-ui upgrade)", () => {
  it("exposes command name upgrade and accurate description", () => {
    const cmd = upgradeCommand();
    expect(cmd.name()).toBe("upgrade");
    expect(cmd.description()).toContain("3-Way Merge");
  });

  it("exposes options: --merge, --no-merge, --alias, --check, --diff", () => {
    const cmd = upgradeCommand();
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("merge");
    expect(optionNames).toContain("no-merge");
    expect(optionNames).toContain("alias");
    expect(optionNames).toContain("check");
    expect(optionNames).toContain("diff");
    expect(optionNames).toContain("skills");
  });
});
