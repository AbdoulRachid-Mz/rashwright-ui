import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  loadWidgetsRegistry,
  getWidgetDefinition,
  listWidgetIds,
  getWidgetRequiredComponents,
  type WidgetDefinition,
} from "../src/core/widgets-registry.js";

describe("Widgets Registry Subsystem", () => {
  let tempWidgetsRoot: string;

  beforeEach(() => {
    tempWidgetsRoot = join(tmpdir(), `rs-ui-widgets-root-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(tempWidgetsRoot, { recursive: true });

    // Créer deux widgets de test : metric et progress
    const metricDir = join(tempWidgetsRoot, "metric");
    mkdirSync(metricDir, { recursive: true });
    const metricJson: WidgetDefinition = {
      id: "metric",
      name: "Metric Widget",
      description: "Indicateur statistique clé avec tendance",
      version: "1.0.0",
      category: "Analytics",
      componentName: "MetricWidget",
      entrypoint: "metric-widget.tsx",
      files: ["metric-widget.tsx", "types.ts", "index.ts"],
      requiredComponents: ["card", "stat-card", "badge"],
      dependencies: [],
      expoDependencies: ["@expo/vector-icons"],
      supportsGlass: true,
      defaultSize: { cols: 2, rows: 1 },
    };
    writeFileSync(join(metricDir, "widget.json"), JSON.stringify(metricJson, null, 2), "utf-8");

    const progressDir = join(tempWidgetsRoot, "progress");
    mkdirSync(progressDir, { recursive: true });
    const progressJson: WidgetDefinition = {
      id: "progress",
      name: "Progress Widget",
      description: "Indicateur de progression vers un objectif",
      version: "1.0.0",
      category: "Analytics",
      componentName: "ProgressWidget",
      entrypoint: "progress-widget.tsx",
      files: ["progress-widget.tsx", "types.ts", "index.ts"],
      requiredComponents: ["card", "progress", "badge"],
      dependencies: [],
      expoDependencies: [],
      supportsGlass: true,
      defaultSize: { cols: 2, rows: 1 },
    };
    writeFileSync(join(progressDir, "widget.json"), JSON.stringify(progressJson, null, 2), "utf-8");
  });

  afterEach(() => {
    if (existsSync(tempWidgetsRoot)) {
      try {
        rmSync(tempWidgetsRoot, { recursive: true, force: true });
      } catch {
        /* ignore */
      }
    }
  });

  it("discovers all widgets in directory", () => {
    const widgets = loadWidgetsRegistry(tempWidgetsRoot);
    expect(widgets.length).toBe(2);

    const ids = widgets.map((w) => w.id);
    expect(ids).toContain("metric");
    expect(ids).toContain("progress");
  });

  it("loads valid manifest definitions matching the autonomous schema", () => {
    const widgets = loadWidgetsRegistry(tempWidgetsRoot);
    for (const w of widgets) {
      expect(typeof w.id).toBe("string");
      expect(typeof w.name).toBe("string");
      expect(typeof w.description).toBe("string");
      expect(typeof w.version).toBe("string");
      expect(typeof w.componentName).toBe("string");
      expect(typeof w.entrypoint).toBe("string");
      expect(Array.isArray(w.files)).toBe(true);
      expect(w.files.length).toBeGreaterThan(0);
      expect(Array.isArray(w.requiredComponents)).toBe(true);
      expect(typeof w.supportsGlass).toBe("boolean");
      expect(w.defaultSize).toBeDefined();
    }
  });

  it("retrieves a widget definition by id (case insensitive and with -widget suffix)", () => {
    const metric = getWidgetDefinition("metric", tempWidgetsRoot);
    expect(metric).not.toBeNull();
    expect(metric?.name).toBe("Metric Widget");
    expect(metric?.componentName).toBe("MetricWidget");
    expect(metric?.requiredComponents).toContain("stat-card");

    const metricUpper = getWidgetDefinition("METRIC", tempWidgetsRoot);
    expect(metricUpper).not.toBeNull();
    expect(metricUpper?.id).toBe("metric");

    const metricSuffix = getWidgetDefinition("metric-widget", tempWidgetsRoot);
    expect(metricSuffix).not.toBeNull();
    expect(metricSuffix?.id).toBe("metric");
  });

  it("returns null for non-existent widget", () => {
    const unknown = getWidgetDefinition("non-existent-widget", tempWidgetsRoot);
    expect(unknown).toBeNull();
  });

  it("lists widget IDs using listWidgetIds()", () => {
    const ids = listWidgetIds(tempWidgetsRoot);
    expect(ids).toEqual(["metric", "progress"]);
  });

  it("returns required components for a widget", () => {
    const reqs = getWidgetRequiredComponents("metric", tempWidgetsRoot);
    expect(reqs).toEqual(["card", "stat-card", "badge"]);
  });

  it("discovers all 6 official widgets from WIDGETS_ROOT", () => {
    const widgets = loadWidgetsRegistry();
    expect(widgets.length).toBe(6);

    const ids = widgets.map((w) => w.id);
    expect(ids).toContain("metric");
    expect(ids).toContain("progress");
    expect(ids).toContain("quick-actions");
    expect(ids).toContain("chart");
    expect(ids).toContain("activity-feed");
    expect(ids).toContain("finance");
  });

  it("retrieves the finance widget with correct component metadata", () => {
    const finance = getWidgetDefinition("finance");
    expect(finance).not.toBeNull();
    expect(finance?.name).toBe("Finance Widget");
    expect(finance?.componentName).toBe("FinanceWidget");
    expect(finance?.requiredComponents).toContain("card");
    expect(finance?.requiredComponents).toContain("badge");
    expect(finance?.requiredComponents).toContain("button");
    expect(finance?.supportsGlass).toBe(true);
  });
});
