import { describe, it, expect } from "vitest";
import {
  loadTemplatesRegistry,
  getTemplateDefinition,
  listTemplateIds,
  getTemplateRequiredComponents,
  type TemplateDefinition,
} from "../src/core/templates-registry.js";
import { TEMPLATES_ROOT } from "../src/core/paths.js";

describe("Templates Registry Subsystem", () => {
  it("discovers all 10 autonomous templates", () => {
    const templates = loadTemplatesRegistry(TEMPLATES_ROOT);
    expect(templates.length).toBe(10);

    const ids = templates.map((t) => t.id);
    expect(ids).toContain("auth");
    expect(ids).toContain("commerce");
    expect(ids).toContain("dashboard");
    expect(ids).toContain("minimal");
    expect(ids).toContain("onboarding");
    expect(ids).toContain("settings");
    expect(ids).toContain("showcase");
    expect(ids).toContain("chat");
    expect(ids).toContain("finance");
    expect(ids).toContain("social");
  });

  it("loads valid manifest definitions matching the autonomous schema", () => {
    const templates = loadTemplatesRegistry(TEMPLATES_ROOT);
    for (const t of templates) {
      expect(typeof t.id).toBe("string");
      expect(typeof t.name).toBe("string");
      expect(typeof t.description).toBe("string");
      expect(typeof t.version).toBe("string");
      expect(typeof t.componentName).toBe("string");
      expect(typeof t.entrypoint).toBe("string");
      expect(Array.isArray(t.files)).toBe(true);
      expect(t.files.length).toBeGreaterThan(0);
      expect(Array.isArray(t.requiredComponents)).toBe(true);
      expect(typeof t.supportsGlass).toBe("boolean");
    }
  });

  it("retrieves a template definition by id (case insensitive)", () => {
    const auth = getTemplateDefinition("auth", TEMPLATES_ROOT);
    expect(auth).not.toBeNull();
    expect(auth?.name).toBe("Authentication Suite");
    expect(auth?.componentName).toBe("AuthTemplate");
    expect(auth?.requiredComponents).toContain("otp-input");
    expect(auth?.files).toContain("auth-template.tsx");

    const authUpper = getTemplateDefinition("AUTH", TEMPLATES_ROOT);
    expect(authUpper).not.toBeNull();
    expect(authUpper?.id).toBe("auth");
  });

  it("returns null for non-existent template", () => {
    const unknown = getTemplateDefinition("non-existent-template", TEMPLATES_ROOT);
    expect(unknown).toBeNull();
  });

  it("lists template IDs using listTemplateIds()", () => {
    const ids = listTemplateIds(TEMPLATES_ROOT);
    expect(ids).toHaveLength(10);
    expect(ids).toContain("dashboard");
    expect(ids).toContain("commerce");
  });

  it("returns required components for a template", () => {
    const reqCommerce = getTemplateRequiredComponents("commerce", TEMPLATES_ROOT);
    expect(reqCommerce).toContain("card");
    expect(reqCommerce).toContain("rating");

    const reqUnknown = getTemplateRequiredComponents("invalid", TEMPLATES_ROOT);
    expect(reqUnknown).toEqual([]);
  });
});
