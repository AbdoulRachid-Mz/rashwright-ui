import { describe, it, expect } from "vitest";
import { listCommand } from "../src/commands/list.js";

describe("listCommand options", () => {
  it("exposes -t, --templates option to list templates", () => {
    const cmd = listCommand();
    const opt = cmd.options.find((o) => o.name() === "templates" || o.short === "-t");
    expect(opt).toBeDefined();
    expect(opt?.description).toContain("templates");
  });

  it("exposes --json and --interactive options", () => {
    const cmd = listCommand();
    const jsonOpt = cmd.options.find((o) => o.name() === "json");
    expect(jsonOpt).toBeDefined();

    const interactiveOpt = cmd.options.find((o) => o.name() === "interactive" || o.short === "-i");
    expect(interactiveOpt).toBeDefined();
  });
});
