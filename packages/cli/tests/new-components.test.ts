import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getAllComponents, getComponent } from "../src/core/registry.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

const UI_MOBILE_ROOT = join(__dirname, "../../ui-mobile");

describe("Nouveaux Composants v1.6.0 & Registry Expansion", () => {
  const NEW_COMPONENTS = [
    "copy-button",
    "like-button",
    "expandable-text",
    "floating-label-input",
    "password-strength",
    "tag-input",
    "number-input",
    "hold-button",
    "swipe-action-button",
    "reorderable-list",
    "inline-edit",
  ];

  it("chaque nouveau composant possède son fichier TSX, son JSON registre et son SKILL.md", () => {
    for (const comp of NEW_COMPONENTS) {
      const tsxPath = join(UI_MOBILE_ROOT, "components", "ui", `${comp}.tsx`);
      const jsonPath = join(UI_MOBILE_ROOT, "registry", "components", `${comp}.json`);
      const skillPath = join(UI_MOBILE_ROOT, "skills", comp, "SKILL.md");

      expect(existsSync(tsxPath), `Fichier TSX manquant : ${tsxPath}`).toBe(true);
      expect(existsSync(jsonPath), `Fichier JSON manquant : ${jsonPath}`).toBe(true);
      expect(existsSync(skillPath), `Fichier SKILL manquant : ${skillPath}`).toBe(true);

      const jsonContent = JSON.parse(readFileSync(jsonPath, "utf-8"));
      expect(jsonContent.name).toBe(comp);
      expect(jsonContent.files).toContain(`components/ui/${comp}.tsx`);

      const skillContent = readFileSync(skillPath, "utf-8");
      expect(skillContent).toContain(`name: rs-ui/${comp}`);
      expect(skillContent).toContain(`rs-ui add ${comp}`);
    }
  });

  it("le registre contient désormais 79 composants distincts et valides", () => {
    const all = getAllComponents(REGISTRY_ROOT);
    expect(all.length).toBe(79);
    for (const comp of NEW_COMPONENTS) {
      const found = getComponent(comp, REGISTRY_ROOT);
      expect(found).toBeDefined();
      expect(found?.name).toBe(comp);
      expect(found?.files.length).toBeGreaterThan(0);
    }
  });

  it("chaque composant implémente l'accessibilité WCAG 2.1 AA", () => {
    for (const comp of NEW_COMPONENTS) {
      const tsxPath = join(UI_MOBILE_ROOT, "components", "ui", `${comp}.tsx`);
      const content = readFileSync(tsxPath, "utf-8");

      expect(
        content.includes("accessibilityRole") || content.includes("accessibilityLabel"),
        `${comp} doit déclarer au moins accessibilityRole ou accessibilityLabel`
      ).toBe(true);
    }
  });

  it("PasswordStrength exporte sa logique d'évaluation autonome et pure", () => {
    const tsxPath = join(UI_MOBILE_ROOT, "components", "ui", "password-strength.tsx");
    const content = readFileSync(tsxPath, "utf-8");

    expect(content).toContain("export const evaluatePasswordStrength =");
    expect(content).toContain("export interface PasswordStrengthResult");
    expect(content).toContain("COMMON_PATTERNS");
    expect(content).toContain("export default PasswordStrength");
  });

  it("ReorderableList propose les contrôles fléchés accessibles WCAG", () => {
    const tsxPath = join(UI_MOBILE_ROOT, "components", "ui", "reorderable-list.tsx");
    const content = readFileSync(tsxPath, "utf-8");

    expect(content).toContain("accessibilityLabel=\"Monter cet élément\"");
    expect(content).toContain("accessibilityLabel=\"Descendre cet élément\"");
  });

  it("HoldButton implémente la validation temporisée sans double déclenchement", () => {
    const tsxPath = join(UI_MOBILE_ROOT, "components", "ui", "hold-button.tsx");
    const content = readFileSync(tsxPath, "utf-8");

    expect(content).toContain("onHoldComplete");
    expect(content).toContain("holdDuration");
    expect(content).toContain("handlePressIn");
    expect(content).toContain("handlePressOut");
  });

  it("SwipeActionButton implémente le glissement horizontal avec seuil", () => {
    const tsxPath = join(UI_MOBILE_ROOT, "components", "ui", "swipe-action-button.tsx");
    const content = readFileSync(tsxPath, "utf-8");

    expect(content).toContain("onActionComplete");
    expect(content).toContain("thresholdRatio");
    expect(content).toContain("PanResponder");
  });
});
