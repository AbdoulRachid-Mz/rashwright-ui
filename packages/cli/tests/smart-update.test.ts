import { describe, it, expect } from "vitest";
import { updateCommand } from "../src/commands/update.js";

describe("Smart Update Command (rs-ui update)", () => {
  it("exposes correct command name and description", () => {
    const cmd = updateCommand();
    expect(cmd.name()).toBe("update");
    expect(cmd.description()).toContain("Smart Update");
  });

  it("exposes all key options: --check, -i/--interactive, --diff, --skills", () => {
    const cmd = updateCommand();
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("check");
    expect(optionNames).toContain("interactive");
    expect(optionNames).toContain("diff");
    expect(optionNames).toContain("skills");
    expect(optionNames).toContain("yes");
    expect(optionNames).toContain("dry-run");
  });
});
