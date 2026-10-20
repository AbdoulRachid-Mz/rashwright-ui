import { describe, it, expect } from "vitest";
import { widgetCommand } from "../src/commands/widget.js";

describe("Widget Command Subsystem (rs-ui widget)", () => {
  it("exposes widget command and expected subcommands", () => {
    const cmd = widgetCommand();
    expect(cmd.name()).toBe("widget");

    const subcommandNames = cmd.commands.map((c) => c.name());
    expect(subcommandNames).toContain("list");
    expect(subcommandNames).toContain("help");
    expect(subcommandNames).toContain("info");
    expect(subcommandNames).toContain("add");
    expect(subcommandNames).toContain("remove");
  });

  it("handles info subcommand requiring name", () => {
    const cmd = widgetCommand();
    const infoCmd = cmd.commands.find((c) => c.name() === "info");
    expect(infoCmd).toBeDefined();
    expect(infoCmd?.description()).toContain("informations");
  });

  it("handles add subcommand with force, yes and dry-run flags", () => {
    const cmd = widgetCommand();
    const addCmd = cmd.commands.find((c) => c.name() === "add");
    expect(addCmd).toBeDefined();
    const optionNames = addCmd?.options.map((o) => o.name());
    expect(optionNames).toContain("force");
    expect(optionNames).toContain("yes");
    expect(optionNames).toContain("dry-run");
  });
});
