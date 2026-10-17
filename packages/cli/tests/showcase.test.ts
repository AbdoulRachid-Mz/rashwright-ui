import { describe, it, expect } from "vitest";
import { showcaseCommand } from "../src/commands/showcase.js";

describe("Showcase & Storybook Command (rs-ui showcase)", () => {
  it("exposes command name showcase and storybook alias", () => {
    const cmd = showcaseCommand();
    expect(cmd.name()).toBe("showcase");
    expect(cmd.aliases()).toContain("storybook");
    expect(cmd.description()).toContain("Showcase");
  });

  it("exposes options: --web, --port, --inject, --theme", () => {
    const cmd = showcaseCommand();
    const optionNames = cmd.options.map((o) => o.name());
    expect(optionNames).toContain("web");
    expect(optionNames).toContain("port");
    expect(optionNames).toContain("inject");
    expect(optionNames).toContain("theme");
  });
});
