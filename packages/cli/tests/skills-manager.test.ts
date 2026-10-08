import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseSkillFrontmatter,
  copyGlobalSkill,
  copyComponentSkill,
  removeComponentSkill,
  diagnoseSkills,
} from "../src/core/skills-manager.js";

describe("Skills Manager & AI Subsystem", () => {
  let tempTargetDir: string;
  let mockSourceRoot: string;

  beforeEach(() => {
    tempTargetDir = mkdtempSync(join(tmpdir(), "rs-ui-test-target-"));
    mockSourceRoot = mkdtempSync(join(tmpdir(), "rs-ui-test-source-"));

    // Créer mock skills/rs-ui/SKILL.md dans mockSourceRoot
    const mockGlobalDir = join(mockSourceRoot, "skills", "rs-ui");
    mkdirSync(mockGlobalDir, { recursive: true });
    writeFileSync(
      join(mockGlobalDir, "SKILL.md"),
      `---
name: rs-ui
description: Global AI Skill
version: 0.3.0
componentVersion: 0.3.0
category: core
---
# Rashwright UI Mobile Global Skill
`,
      "utf-8"
    );

    // Créer mock skills/drawer/SKILL.md dans mockSourceRoot
    const mockDrawerDir = join(mockSourceRoot, "skills", "drawer");
    mkdirSync(mockDrawerDir, { recursive: true });
    writeFileSync(
      join(mockDrawerDir, "SKILL.md"),
      `---
name: rs-ui/drawer
description: Drawer navigation component
version: 0.3.0
componentVersion: 0.3.0
category: navigation
supportsGlass: true
---
# Drawer Component
`,
      "utf-8"
    );
  });

  afterEach(() => {
    if (existsSync(tempTargetDir)) rmSync(tempTargetDir, { recursive: true, force: true });
    if (existsSync(mockSourceRoot)) rmSync(mockSourceRoot, { recursive: true, force: true });
  });

  it("parseSkillFrontmatter extracts YAML metadata accurately", () => {
    const raw = `---
name: rs-ui/test
description: Test component
version: 0.3.0
componentVersion: 0.3.0
category: Layout
supportsGlass: true
---
# Content`;

    const fm = parseSkillFrontmatter(raw);
    expect(fm).not.toBeNull();
    expect(fm?.name).toBe("rs-ui/test");
    expect(fm?.description).toBe("Test component");
    expect(fm?.version).toBe("0.3.0");
    expect(fm?.componentVersion).toBe("0.3.0");
    expect(fm?.category).toBe("Layout");
    expect(fm?.supportsGlass).toBe(true);
  });

  it("parseSkillFrontmatter returns null when frontmatter is missing", () => {
    const raw = "# No Frontmatter here";
    expect(parseSkillFrontmatter(raw)).toBeNull();
  });

  it("copyGlobalSkill installs skills/rs-ui/SKILL.md into target project", () => {
    const ok = copyGlobalSkill(mockSourceRoot, tempTargetDir);
    expect(ok).toBe(true);

    const dest = join(tempTargetDir, "skills", "rs-ui", "SKILL.md");
    expect(existsSync(dest)).toBe(true);
    const content = readFileSync(dest, "utf-8");
    expect(content).toContain("Rashwright UI Mobile Global Skill");
  });

  it("copyGlobalSkill respects dryRun", () => {
    const ok = copyGlobalSkill(mockSourceRoot, tempTargetDir, true);
    expect(ok).toBe(true);

    const dest = join(tempTargetDir, "skills", "rs-ui", "SKILL.md");
    expect(existsSync(dest)).toBe(false);
  });

  it("copyComponentSkill installs skills/rs-ui/<component>/SKILL.md", () => {
    const ok = copyComponentSkill("drawer", mockSourceRoot, tempTargetDir);
    expect(ok).toBe(true);

    const dest = join(tempTargetDir, "skills", "rs-ui", "drawer", "SKILL.md");
    expect(existsSync(dest)).toBe(true);
    const content = readFileSync(dest, "utf-8");
    expect(content).toContain("Drawer Component");
  });

  it("removeComponentSkill removes component skill file and folder", () => {
    copyComponentSkill("drawer", mockSourceRoot, tempTargetDir);
    const dest = join(tempTargetDir, "skills", "rs-ui", "drawer", "SKILL.md");
    expect(existsSync(dest)).toBe(true);

    const removed = removeComponentSkill("drawer", tempTargetDir);
    expect(removed).toBe(true);
    expect(existsSync(dest)).toBe(false);
  });

  it("diagnoseSkills reports global skill and component skills status", () => {
    // Cas 1 : Rien n'est encore installé
    let diag = diagnoseSkills(tempTargetDir, { drawer: "1.0.0" });
    expect(diag.globalSkillInstalled).toBe(false);
    expect(diag.missingSkills).toContain("drawer");
    expect(diag.componentSkillsCount).toBe(0);

    // Cas 2 : Installer global skill et drawer skill
    copyGlobalSkill(mockSourceRoot, tempTargetDir);
    copyComponentSkill("drawer", mockSourceRoot, tempTargetDir);

    diag = diagnoseSkills(tempTargetDir, { drawer: "1.0.0" });
    expect(diag.globalSkillInstalled).toBe(true);
    expect(diag.missingSkills).toEqual([]);
    expect(diag.componentSkillsCount).toBe(1);
    expect(diag.installedComponentSkills).toContain("drawer");
  });
});
