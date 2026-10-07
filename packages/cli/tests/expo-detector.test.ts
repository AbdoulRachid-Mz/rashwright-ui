import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  detectExpo,
  readCompatibilityMatrix,
  SUPPORTED_SDKS,
} from "../src/core/expo-detector.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

describe("expo-detector", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "rs-ui-expo-test-"));
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("detectExpo returns detected: false when no expo package", () => {
    const res = detectExpo(tempDir);
    expect(res.detected).toBe(false);
    expect(res.isSupported).toBe(false);
  });

  it("detectExpo detects supported SDK from package.json", () => {
    const pkg = {
      name: "app",
      dependencies: {
        expo: "~54.0.0",
      },
    };
    writeFileSync(join(tempDir, "package.json"), JSON.stringify(pkg), "utf-8");

    const res = detectExpo(tempDir);
    expect(res.detected).toBe(true);
    expect(res.sdkVersion).toBe(54);
    expect(res.supportedVersion).toBe(54);
    expect(res.isSupported).toBe(true);
  });

  it("detectExpo detects unsupported SDK version", () => {
    const pkg = {
      name: "app",
      dependencies: {
        expo: "~49.0.0",
      },
    };
    writeFileSync(join(tempDir, "package.json"), JSON.stringify(pkg), "utf-8");

    const res = detectExpo(tempDir);
    expect(res.detected).toBe(true);
    expect(res.isSupported).toBe(false);
  });

  it("readCompatibilityMatrix loads matrix for SDK 54 and SDK 59", () => {
    const matrix54 = readCompatibilityMatrix(54, REGISTRY_ROOT);
    expect(matrix54).not.toBeNull();
    expect(matrix54?.["react-native-reanimated"]).toBeDefined();
    expect(matrix54?.["expo-blur"]).toBeDefined();

    const matrix59 = readCompatibilityMatrix(59, REGISTRY_ROOT);
    expect(matrix59).not.toBeNull();
    expect(matrix59?.["react-native-reanimated"]).toBeDefined();
    expect(matrix59?.["expo-blur"]).toBeDefined();
  });

  it("SUPPORTED_SDK_VERSIONS includes SDK 54 through 59", async () => {
    const { SUPPORTED_SDK_VERSIONS } = await import("../src/core/expo-detector.js");
    expect(SUPPORTED_SDK_VERSIONS).toContain(54);
    expect(SUPPORTED_SDK_VERSIONS).toContain(58);
    expect(SUPPORTED_SDK_VERSIONS).toContain(59);
  });
});
