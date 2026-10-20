import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectMissingWidgetRequirements } from "../src/core/component-detector.js";
import { getWidgetDefinition } from "../src/core/widgets-registry.js";
import { recordLockedWidget, checkWidgetIntegrity } from "../src/core/lock-manager.js";
import { copyWidgetSkill } from "../src/core/skills-manager.js";
import { UI_MOBILE_ROOT } from "../src/core/paths.js";

describe("E2E Widget Installation & Requirement Detection", () => {
  let testProjectDir: string;

  beforeEach(() => {
    testProjectDir = join(
      tmpdir(),
      `rs-ui-widget-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    mkdirSync(join(testProjectDir, "src/components/ui"), { recursive: true });
    writeFileSync(
      join(testProjectDir, "package.json"),
      JSON.stringify(
        {
          name: "test-app",
          version: "1.0.0",
          dependencies: {
            expo: "~54.0.0",
            react: "18.3.1",
            "react-native": "0.76.0",
          },
        },
        null,
        2
      ),
      "utf-8"
    );
    writeFileSync(
      join(testProjectDir, "rashwright-ui.json"),
      JSON.stringify(
        {
          $schema: "https://rashwright.com/schema.json",
          version: "1.6.0",
          theme: "default",
          componentsPath: "src/components/ui",
          components: {},
        },
        null,
        2
      ),
      "utf-8"
    );
  });

  afterEach(() => {
    if (existsSync(testProjectDir)) {
      try {
        rmSync(testProjectDir, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  });

  it("detects missing component requirements for MetricWidget", () => {
    const plan = detectMissingWidgetRequirements("metric", testProjectDir);
    expect(plan.components).toContain("card");
    expect(plan.components).toContain("badge");
    expect(plan.components).toContain("skeleton");
  });

  it("detects missing component requirements for FinanceWidget", () => {
    const plan = detectMissingWidgetRequirements("finance", testProjectDir);
    expect(plan.components).toContain("card");
    expect(plan.components).toContain("badge");
    expect(plan.components).toContain("button");
    expect(plan.components).toContain("skeleton");
  });

  it("detects missing component requirements for ActivityFeedWidget", () => {
    const plan = detectMissingWidgetRequirements("activity-feed", testProjectDir);
    expect(plan.components).toContain("card");
    expect(plan.components).toContain("avatar");
    expect(plan.components).toContain("badge");
    expect(plan.components).toContain("divider");
    expect(plan.components).toContain("skeleton");
  });

  it("installs widget skill into skills/rs-ui/widgets/<widget>/SKILL.md", () => {
    const ok = copyWidgetSkill("finance", UI_MOBILE_ROOT, testProjectDir);
    expect(ok).toBe(true);

    const skillPath = join(testProjectDir, "skills/rs-ui/widgets/finance/SKILL.md");
    expect(existsSync(skillPath)).toBe(true);

    const content = readFileSync(skillPath, "utf-8");
    expect(content).toContain("FinanceWidget");
    expect(content).toContain("rs-ui add -w finance");
  });

  it("records and validates lockfile integrity for an installed widget", () => {
    const wgtDir = join(testProjectDir, "src/components/widgets/finance");
    mkdirSync(wgtDir, { recursive: true });
    const codeFile = join(wgtDir, "finance-widget.tsx");
    writeFileSync(codeFile, "// export const FinanceWidget", "utf-8");

    const lock = recordLockedWidget(
      testProjectDir,
      "finance",
      "1.0.0",
      "src/components/widgets/finance",
      ["card", "badge", "button", "skeleton"],
      ["src/components/widgets/finance/finance-widget.tsx"]
    );

    expect(lock.widgets?.finance).toBeDefined();
    expect(lock.widgets?.finance.files).toHaveLength(1);

    const check = checkWidgetIntegrity(testProjectDir, "finance");
    expect(check.status).toBe("clean");
  });
});
