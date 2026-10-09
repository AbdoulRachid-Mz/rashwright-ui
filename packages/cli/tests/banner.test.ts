import { describe, it, expect, vi } from "vitest";
import { printBanner } from "../src/core/banner.js";

describe("banner", () => {
  it("prints banner without throwing", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(() => printBanner("rs-ui init")).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("prints banner when no command is specified", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(() => printBanner()).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
