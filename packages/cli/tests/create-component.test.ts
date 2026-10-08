import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { createCommand } from "../src/commands/create.js";
import {
  toPascalCase,
  generateComponentTemplate,
  generateSkillTemplate,
  scaffoldProjectComponent,
} from "../src/core/component-scaffolder.js";

const TEST_DIR = join(process.cwd(), ".tmp-test-create-component");

describe("Project Component Scaffolder & Create Command (rs-ui create component)", () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it("toPascalCase converts kebab-case to PascalCase accurately", () => {
    expect(toPascalCase("product-card")).toBe("ProductCard");
    expect(toPascalCase("custom-hero-banner")).toBe("CustomHeroBanner");
  });

  it("generateComponentTemplate outputs valid TSX with theme tokens", () => {
    const code = generateComponentTemplate({
      name: "product-card",
      category: "Commerce",
      supportsGlass: true,
      description: "Carte produit e-commerce",
    });

    expect(code).toContain("export const ProductCard");
    expect(code).toContain("useTheme");
    expect(code).toContain("LiquidGlassView");
  });

  it("generateSkillTemplate outputs standard YAML frontmatter and documentation", () => {
    const doc = generateSkillTemplate({
      name: "product-card",
      category: "Commerce",
      supportsGlass: true,
      description: "Carte produit",
    });

    expect(doc).toContain('name: "product-card"');
    expect(doc).toContain('category: "Commerce"');
    expect(doc).toContain("supportsGlass: true");
    expect(doc).toContain("## Props API");
  });

  it("scaffoldProjectComponent writes TSX and SKILL.md files to disk", () => {
    const { componentFile, skillFile } = scaffoldProjectComponent(
      TEST_DIR,
      "src/components/ui",
      {
        name: "product-card",
        category: "Commerce",
      },
      false
    );

    expect(existsSync(componentFile)).toBe(true);
    expect(existsSync(skillFile)).toBe(true);

    const content = readFileSync(componentFile, "utf-8");
    expect(content).toContain("ProductCard");
  });

  it("createCommand exposes create and component subcommands", () => {
    const cmd = createCommand();
    expect(cmd.name()).toBe("create");
    const subCmd = cmd.commands.find((c) => c.name() === "component");
    expect(subCmd).toBeDefined();
    expect(subCmd?.description()).toContain("personnalisé");
  });
});
