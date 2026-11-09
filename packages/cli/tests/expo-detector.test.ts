import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import {
  detectExpo,
  readCompatibilityMatrix,
} from "../src/core/expo-detector.js";
import {
  LATEST_SUPPORTED_SDK,
  SUPPORTED_SDK_VERSIONS,
} from "../src/core/sdk-versions.js";
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

  it("readCompatibilityMatrix loads real matrices for supported SDKs only", () => {
    for (const sdk of SUPPORTED_SDK_VERSIONS) {
      const matrix = readCompatibilityMatrix(sdk, REGISTRY_ROOT);
      expect(matrix, `matrice SDK ${sdk}`).not.toBeNull();
      expect(matrix?.["react-native-reanimated"]).toBeDefined();
      expect(matrix?.["expo-blur"]).toBeDefined();
      expect(matrix?.["expo-router"]).toBeDefined();
      expect(matrix?.["expo-application"]).toBeDefined();
      expect(matrix?.["expo-clipboard"]).toBeDefined();
      expect(matrix?.["expo-device"]).toBeDefined();
    }

    // SDK 59 n'a jamais été publié par Expo : aucune matrice ne doit exister.
    expect(readCompatibilityMatrix(59, REGISTRY_ROOT)).toBeNull();
    expect(readCompatibilityMatrix(42, REGISTRY_ROOT)).toBeNull();
  });

  it("SUPPORTED_SDK_VERSIONS couvre exactement les SDK publiés 54 à 58", () => {
    expect(SUPPORTED_SDK_VERSIONS).toEqual([54, 55, 56, 57, 58]);
    expect(LATEST_SUPPORTED_SDK).toBe(58);
  });

  it("detectExpo refuse un SDK futur non publié (59) sans le déclarer supporté", () => {
    const pkg = {
      name: "app",
      dependencies: { expo: "~59.0.0" },
    };
    writeFileSync(join(tempDir, "package.json"), JSON.stringify(pkg), "utf-8");

    const res = detectExpo(tempDir);
    expect(res.detected).toBe(true);
    expect(res.sdkVersion).toBe(59);
    expect(res.isSupported).toBe(false);
    expect(res.supportedVersion).toBeNull();
  });
});
