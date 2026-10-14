import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const UI_MOBILE_ROOT = join(__dirname, "../../ui-mobile");

describe("Tabs component & registry compliance", () => {
  const tabsTsxPath = join(UI_MOBILE_ROOT, "components/ui/tabs.tsx");
  const tabsJsonPath = join(UI_MOBILE_ROOT, "registry/components/tabs.json");
  const tabsSkillPath = join(UI_MOBILE_ROOT, "skills/tabs/SKILL.md");

  it("tabs.tsx exists and exports Tabs, TabsList, TabsTrigger, TabsContent, useTabs", () => {
    expect(existsSync(tabsTsxPath)).toBe(true);
    const content = readFileSync(tabsTsxPath, "utf-8");

    expect(content).toContain("export const Tabs =");
    expect(content).toContain("export const TabsList =");
    expect(content).toContain("export const TabsTrigger =");
    expect(content).toContain("export const TabsContent =");
    expect(content).toContain("export const useTabs =");
    expect(content).toContain("export default Tabs;");
  });

  it("Tabs root does NOT impose hardcoded flex: 1 to prevent layout clipping", () => {
    const content = readFileSync(tabsTsxPath, "utf-8");
    // Ne doit pas contenir [{ flex: 1 }, style] sur la racine
    expect(content).not.toContain("[{ flex: 1 }, style]");
    expect(content).toContain("styles.tabsRoot");
  });

  it("TabsTrigger does NOT use negative zIndex to prevent clipping on Android and Glass surfaces", () => {
    const content = readFileSync(tabsTsxPath, "utf-8");
    expect(content).not.toContain("zIndex: -1");
    expect(content).toContain('accessibilityRole="tab"');
  });

  it("Tabs handles both controlled and uncontrolled states predictably", () => {
    const content = readFileSync(tabsTsxPath, "utf-8");
    expect(content).toContain("const isControlled = value !== undefined;");
    expect(content).toContain("onValueChange?.(newValue);");
  });

  it("tabs.json declares supportsGlass: true and valid registry fields", () => {
    expect(existsSync(tabsJsonPath)).toBe(true);
    const raw = JSON.parse(readFileSync(tabsJsonPath, "utf-8"));

    expect(raw.name).toBe("tabs");
    expect(raw.supportsGlass).toBe(true);
    expect(raw.expoDependencies).toContain("react-native-reanimated");
  });

  it("tabs SKILL.md contains correct usage and non-empty examples", () => {
    expect(existsSync(tabsSkillPath)).toBe(true);
    const skillContent = readFileSync(tabsSkillPath, "utf-8");

    expect(skillContent).toContain("rs-ui add tabs");
    expect(skillContent).toContain("<Tabs defaultValue=");
    expect(skillContent).toContain("<TabsList");
    expect(skillContent).toContain("<TabsTrigger");
    expect(skillContent).toContain("<TabsContent");
    expect(skillContent).not.toContain("<Tabs />");
  });
});
