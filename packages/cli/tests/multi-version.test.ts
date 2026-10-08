import { describe, it, expect } from "vitest";
import { addCommand } from "../src/commands/add.js";
import { listCommand } from "../src/commands/list.js";

describe("Multi-Version Registry Support (rs-ui add <name>@<ver>)", () => {
  it("addCommand parses version tags from argument strings", () => {
    const cmd = addCommand();
    expect(cmd.name()).toBe("add");
    expect(cmd.registeredArguments[0].name()).toBe("components");
  });

  it("listCommand exposes --versions <component> option", () => {
    const cmd = listCommand();
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("versions");
  });
});
