import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  AVAILABLE_TEMPLATES,
  listTemplates,
  getTemplate,
  getTemplateComponents,
  generateTemplateScreenCode,
  setupStarterTemplate,
  type TemplateType,
} from "../src/core/templates-manager.js";
import { initCommand } from "../src/commands/init.js";
import { generateShowcaseScreen, writeExpoRouterLayout } from "../src/core/starter-generator.js";

describe("Templates Engine Subsystem (rs-ui init --template)", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `rs-ui-template-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      try {
        rmSync(testDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  });

  it("lists all 7 standardized templates", () => {
    const list = listTemplates();
    expect(list).toHaveLength(7);
    const ids = list.map((t) => t.id);
    expect(ids).toContain("minimal");
    expect(ids).toContain("showcase");
    expect(ids).toContain("auth");
    expect(ids).toContain("onboarding");
    expect(ids).toContain("dashboard");
    expect(ids).toContain("commerce");
    expect(ids).toContain("settings");
  });

  it("retrieves template metadata and handles unknown templates", () => {
    const auth = getTemplate("auth");
    expect(auth).not.toBeNull();
    expect(auth?.name).toBe("Authentication Suite");
    expect(auth?.screenComponentName).toBe("RashwrightAuthScreen");
    expect(auth?.requiredComponents).toContain("text-input");
    expect(auth?.requiredComponents).toContain("otp-input");

    const unknown = getTemplate("non-existent");
    expect(unknown).toBeNull();
  });

  it("returns required components for each template", () => {
    const minimalComps = getTemplateComponents("minimal");
    expect(minimalComps).toEqual(["button", "card", "badge", "rashwright-logo"]);

    const dashboardComps = getTemplateComponents("dashboard");
    expect(dashboardComps).toContain("stat-card");
    expect(dashboardComps).toContain("avatar");
    expect(dashboardComps).toContain("data-table");

    const commerceComps = getTemplateComponents("commerce");
    expect(commerceComps).toContain("rating");
    expect(commerceComps).toContain("search-input");
  });

  it("generates valid TSX code using useTheme and rs-ui components", () => {
    const templates: TemplateType[] = ["minimal", "auth", "onboarding", "dashboard", "commerce", "settings"];

    for (const t of templates) {
      const code = generateTemplateScreenCode(t);
      expect(code.length).toBeGreaterThan(100);
      expect(code).toContain("useTheme");
      expect(code).toContain("export function");
      expect(code).toContain("StyleSheet.create");
      expect(code).toContain("SafeAreaView");
    }
  });

  it("setupStarterTemplate generates the screen file and updates index.ts", () => {
    // Créer une arborescence fictive sourceRoot
    const sourceRoot = join(testDir, "source");
    mkdirSync(join(sourceRoot, "components/ui"), { recursive: true });
    // Fichiers factices pour button, card, badge, rashwright-logo
    for (const comp of ["button", "card", "badge", "rashwright-logo"]) {
      writeFileSync(join(sourceRoot, `components/ui/${comp}.tsx`), `export const ${comp} = true;`, "utf-8");
    }

    const targetProject = join(testDir, "target");
    mkdirSync(targetProject, { recursive: true });

    const result = setupStarterTemplate(sourceRoot, targetProject, "minimal", {
      componentsPath: "components/ui",
    });

    expect(result.installedComponents).toContain("minimal-screen");
    expect(existsSync(join(targetProject, "components/ui/minimal-screen.tsx"))).toBe(true);
    const content = readFileSync(join(targetProject, "components/ui/minimal-screen.tsx"), "utf-8");
    expect(content).toContain("RashwrightMinimalScreen");
  });

  it("generateShowcaseScreen and writeExpoRouterLayout support custom screenComponent specs", () => {
    const targetProject = join(testDir, "expo-project");
    mkdirSync(join(targetProject, "app"), { recursive: true });

    writeExpoRouterLayout(targetProject, "components/ui", "default", false, {
      importFile: "auth-screen",
      componentName: "RashwrightAuthScreen",
    });

    const indexContent = readFileSync(join(targetProject, "app/index.tsx"), "utf-8");
    expect(indexContent).toContain('import { RashwrightAuthScreen } from "@/components/ui/auth-screen";');
    expect(indexContent).toContain("<RashwrightAuthScreen />");
  });

  it("initCommand exposes --template option with showcase default", () => {
    const cmd = initCommand();
    const opt = cmd.options.find((o) => o.name() === "template");
    expect(opt).toBeDefined();
    expect(opt?.defaultValue).toBe("showcase");
  });
});
