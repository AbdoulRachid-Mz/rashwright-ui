import { describe, it, expect } from "vitest";
import {
  BREAKPOINTS,
  isResponsiveRecord,
  resolveResponsiveValue,
  getBreakpointFromWidth,
  type ResponsiveRecord,
} from "../../ui-mobile/lib/responsive.js";

describe("Responsive Breakpoints System & Grid Resolution", () => {
  it("defines standard breakpoints accurately", () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
    expect(BREAKPOINTS.xl).toBe(1280);
    expect(BREAKPOINTS["2xl"]).toBe(1536);
  });

  it("identifies breakpoint from screen width correctly", () => {
    expect(getBreakpointFromWidth(390)).toBe("sm");
    expect(getBreakpointFromWidth(768)).toBe("md");
    expect(getBreakpointFromWidth(1024)).toBe("lg");
    expect(getBreakpointFromWidth(1280)).toBe("xl");
    expect(getBreakpointFromWidth(1600)).toBe("2xl");
  });

  it("identifies responsive records correctly", () => {
    expect(isResponsiveRecord({ sm: 1, md: 2 })).toBe(true);
    expect(isResponsiveRecord({ lg: 3 })).toBe(true);
    expect(isResponsiveRecord(2)).toBe(false);
    expect(isResponsiveRecord("test")).toBe(false);
    expect(isResponsiveRecord(null)).toBe(false);
    expect(isResponsiveRecord(undefined)).toBe(false);
  });

  it("resolves responsive values with cascade fallback (ex: { sm: 1, md: 1, lg: 2 })", () => {
    const config: ResponsiveRecord<number> = { sm: 1, md: 1, lg: 2 };

    // Mobile sm (< 768) -> 1
    expect(resolveResponsiveValue(config, "sm", 1)).toBe(1);

    // Tablet md (768 - 1023) -> 1
    expect(resolveResponsiveValue(config, "md", 1)).toBe(1);

    // Large screen lg (1024 - 1279) -> 2
    expect(resolveResponsiveValue(config, "lg", 1)).toBe(2);

    // xl (1280 - 1535) falls back to lg -> 2
    expect(resolveResponsiveValue(config, "xl", 1)).toBe(2);

    // 2xl (>= 1536) falls back to lg -> 2
    expect(resolveResponsiveValue(config, "2xl", 1)).toBe(2);
  });

  it("returns raw value directly when not a responsive record", () => {
    expect(resolveResponsiveValue(4, "sm", 1)).toBe(4);
    expect(resolveResponsiveValue(4, "lg", 1)).toBe(4);
  });

  it("returns fallback value when undefined", () => {
    expect(resolveResponsiveValue(undefined, "sm", 3)).toBe(3);
  });

  it("view.tsx declares grid, responsive columns, sorting and carousels props", () => {
    const { readFileSync, existsSync } = require("node:fs");
    const { join } = require("node:path");
    const viewPath = join(__dirname, "../../ui-mobile/components/ui/view.tsx");
    expect(existsSync(viewPath)).toBe(true);

    const content = readFileSync(viewPath, "utf-8");
    expect(content).toContain("grid?: boolean;");
    expect(content).toContain("gridElements?: React.ReactNode[];");
    expect(content).toContain("columns?: ResponsiveValue<number>;");
    expect(content).toContain("sortBy?:");
    expect(content).toContain("sortOrder?:");
    expect(content).toContain("carousels?:");
    expect(content).toContain("className?: string;");
  });

  it("flat-list.tsx declares grid, responsive columns, sorting and carousels props", () => {
    const { readFileSync, existsSync } = require("node:fs");
    const { join } = require("node:path");
    const flatListPath = join(__dirname, "../../ui-mobile/components/ui/flat-list.tsx");
    expect(existsSync(flatListPath)).toBe(true);

    const content = readFileSync(flatListPath, "utf-8");
    expect(content).toContain("grid?: boolean;");
    expect(content).toContain("gridElements?: readonly T[] | null;");
    expect(content).toContain("columns?: ResponsiveValue<number>;");
    expect(content).toContain("sortBy?:");
    expect(content).toContain("sortOrder?:");
    expect(content).toContain("carousels?:");
    expect(content).toContain("className?: string;");
  });
});
