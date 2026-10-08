import { describe, it, expect } from "vitest";
import { skillCommand } from "../src/commands/skill.js";

describe("Decoupled AI Skills Management (rs-ui skill list / update)", () => {
  it("skillCommand exposes list and update subcommands", () => {
    const cmd = skillCommand();
    expect(cmd.name()).toBe("skill");

    const listSub = cmd.commands.find((c) => c.name() === "list");
    expect(listSub).toBeDefined();
    expect(listSub?.description()).toContain("Lister");

    const updateSub = cmd.commands.find((c) => c.name() === "update");
    expect(updateSub).toBeDefined();
    expect(updateSub?.description()).toContain("Mettre à jour");
  });

  it("skill update subcommand exposes --all and --dry-run options", () => {
    const cmd = skillCommand();
    const updateSub = cmd.commands.find((c) => c.name() === "update");
    const optionNames = updateSub?.options.map((o) => o.name());
    expect(optionNames).toContain("all");
    expect(optionNames).toContain("dry-run");
  });
});
