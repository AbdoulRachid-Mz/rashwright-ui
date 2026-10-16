import { describe, it, expect } from "vitest";
import { templateCommand } from "../src/commands/template.js";

describe("Template Command Subsystem (rs-ui template)", () => {
  it("exposes template command and expected subcommands", () => {
    const cmd = templateCommand();
    expect(cmd.name()).toBe("template");

    const subcommandNames = cmd.commands.map((c) => c.name());
    expect(subcommandNames).toContain("list");
    expect(subcommandNames).toContain("help");
    expect(subcommandNames).toContain("info");
  });

  it("handles info subcommand requiring name", () => {
    const cmd = templateCommand();
    const infoCmd = cmd.commands.find((c) => c.name() === "info");
    expect(infoCmd).toBeDefined();
    expect(infoCmd?.description()).toContain("informations");
  });
});
