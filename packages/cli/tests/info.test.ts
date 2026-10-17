import { describe, it, expect } from "vitest";
import { infoCommand } from "../src/commands/info.js";

describe("Info Command (rs-ui info)", () => {
  it("exposes command name info and component argument", () => {
    const cmd = infoCommand();
    expect(cmd.name()).toBe("info");
    expect(cmd.description()).toContain("360°");
    expect(cmd.registeredArguments.length).toBeGreaterThan(0);
    expect(cmd.registeredArguments[0].name()).toBe("component");
  });

  it("exposes options: --preview, --registry, --fresh, --json", () => {
    const cmd = infoCommand();
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("preview");
    expect(optionNames).toContain("registry");
    expect(optionNames).toContain("fresh");
    expect(optionNames).toContain("json");
  });
});
