import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { validateRegistryItem } from "../src/core/schema.js";

const UI_MOBILE_ROOT = join(__dirname, "../../ui-mobile");

describe("Headless Primitives & RFC v4 Schema", () => {
  it("use-controllable-state.ts exists and provides clean state hook without external deps", () => {
    const file = join(UI_MOBILE_ROOT, "lib/primitives/use-controllable-state.ts");
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, "utf-8");
    expect(content).toContain("export function useControllableState");
    expect(content).not.toContain("any");
  });

  it("use-disclosure.ts exists and provides open/close/toggle handlers", () => {
    const file = join(UI_MOBILE_ROOT, "lib/primitives/use-disclosure.ts");
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, "utf-8");
    expect(content).toContain("export function useDisclosure");
    expect(content).toContain("onToggle");
  });

  it("accessibility.ts exists and formats WAI-ARIA mobile props", () => {
    const file = join(UI_MOBILE_ROOT, "lib/primitives/accessibility.ts");
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, "utf-8");
    expect(content).toContain("export function buildAccessibilityProps");
  });

  it("validateRegistryItem validates standard and rich RFC v4 registry entries", () => {
    const validEntry = {
      name: "custom-modal",
      type: "registry:ui",
      version: "1.0.0",
      description: "Modal accessible",
      category: "Feedback",
      files: ["components/ui/modal.tsx"],
      dependencies: [],
      expoDependencies: ["react-native-reanimated"],
      optionalExpoDependencies: [],
      requiresComponents: [],
      providers: ["ThemeProvider"],
      supportsGlass: true,
      platforms: ["ios", "android"],
      nativeRebuildRequired: false,
    };

    const parsed = validateRegistryItem(validEntry);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe("registry:ui");
    }
  });

  it("validateRegistryItem defaults type to registry:ui if omitted", () => {
    const entryWithoutType = {
      name: "button",
      description: "Button",
      files: ["components/ui/button.tsx"],
    };

    const parsed = validateRegistryItem(entryWithoutType);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.type).toBe("registry:ui");
    }
  });
});
