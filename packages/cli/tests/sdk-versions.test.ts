import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  LATEST_SUPPORTED_SDK,
  MINIMUM_SDK_VERSION,
  SUPPORTED_SDK_VERSIONS,
  resolveSdkVersion,
} from "../src/core/sdk-versions.js";
import { readCompatibilityMatrix } from "../src/core/expo-detector.js";
import { REGISTRY_ROOT } from "../src/core/paths.js";

interface ManifestLike {
  expoDependencies?: string[];
  optionalExpoDependencies?: string[];
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf-8")) as Record<string, unknown>;
}

function manifestPaths(): string[] {
  const paths: string[] = [];
  for (const folder of ["components", "foundations", "hooks", "lib"]) {
    const dir = join(REGISTRY_ROOT, folder);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (file.endsWith(".json")) paths.push(join(dir, file));
    }
  }
  for (const folder of ["templates", "widgets"] as const) {
    const dir = join(REGISTRY_ROOT, "..", folder);
    for (const id of readdirSync(dir)) {
      const manifest = join(
        dir,
        id,
        folder === "templates" ? "template.json" : "widget.json",
      );
      if (existsSync(manifest)) paths.push(manifest);
    }
  }
  return paths;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

const versionsDir = join(REGISTRY_ROOT, "versions");

const UnsupportedSdkMessage = /SDK Expo .* non supporté/;

const AUTHORITATIVE_REACT = {
  54: { react: "19.1.0", reactNative: "0.81.5" },
  55: { react: "19.2.0", reactNative: "0.83.10" },
  56: { react: "19.2.3", reactNative: "0.85.3" },
  57: { react: "19.2.3", reactNative: "0.86.3" },
  58: { react: "19.3.0", reactNative: "0.88.1" },
} as const;

describe("versions Expo SDK — source unique et matrices réelles", () => {
  it("la liste supportée correspond exactement aux matrices présentes", () => {
    const files = readdirSync(versionsDir)
      .filter((file) => /^expo-\d+\.json$/.test(file))
      .map((file) => Number.parseInt(file.slice("expo-".length, -".json".length), 10))
      .sort((a, b) => a - b);

    expect(files).toEqual([...SUPPORTED_SDK_VERSIONS]);
    expect(SUPPORTED_SDK_VERSIONS).toEqual([54, 55, 56, 57, 58]);
    expect(MINIMUM_SDK_VERSION).toBe(54);
    expect(LATEST_SUPPORTED_SDK).toBe(58);

    // SDK 59 n'est pas publié : ni matrice, ni support déclaré.
    expect(existsSync(join(versionsDir, "expo-59.json"))).toBe(false);
    expect(readCompatibilityMatrix(59, REGISTRY_ROOT)).toBeNull();
  });

  it("index.json déclare exactement les SDK supportés", () => {
    const index = readJson(join(REGISTRY_ROOT, "index.json"));
    expect(index.sdkVersions).toEqual([...SUPPORTED_SDK_VERSIONS]);
    expect(index.minimumExpoSdk).toBe(MINIMUM_SDK_VERSION);
  });

  it("chaque matrice porte les versions React/React Native réellement publiées", () => {
    for (const sdk of SUPPORTED_SDK_VERSIONS) {
      const matrix = readJson(join(versionsDir, `expo-${sdk}.json`));
      expect(matrix.sdk, `matrice ${sdk}`).toBe(sdk);
      expect(matrix.react, `react SDK ${sdk}`).toBe(AUTHORITATIVE_REACT[sdk].react);
      expect(matrix.reactNative, `react-native SDK ${sdk}`).toBe(
        AUTHORITATIVE_REACT[sdk].reactNative,
      );
      expect(matrix.strategy).toBe("expo-install");
    }
  });

  it("chaque dépendance Expo d'un manifeste est versionnée dans toutes les matrices", () => {
    const used = new Set<string>();
    for (const path of manifestPaths()) {
      const manifest = readJson(path) as ManifestLike;
      for (const dep of [
        ...stringArray(manifest.expoDependencies),
        ...stringArray(manifest.optionalExpoDependencies),
      ]) {
        used.add(dep);
      }
    }

    expect(used.size).toBeGreaterThan(0);
    for (const sdk of SUPPORTED_SDK_VERSIONS) {
      const packages = readCompatibilityMatrix(sdk, REGISTRY_ROOT);
      expect(packages, `matrice SDK ${sdk}`).not.toBeNull();
      const missing = [...used].filter((dep) => !(dep in (packages ?? {})));
      expect(missing, `SDK ${sdk} — dépendances non versionnées`).toEqual([]);
    }
  });

  it("aucune version de matrice n'est vide ou inventée à zéro", () => {
    for (const sdk of SUPPORTED_SDK_VERSIONS) {
      const packages = readCompatibilityMatrix(sdk, REGISTRY_ROOT) ?? {};
      for (const [dep, version] of Object.entries(packages)) {
        expect(typeof version, `${dep} SDK ${sdk}`).toBe("string");
        expect(version.trim(), `${dep} SDK ${sdk}`).not.toBe("");
        expect(version, `${dep} SDK ${sdk}`).not.toBe("latest");
      }
    }
  });

  it("resolveSdkVersion n'accepte que les SDK publiés", () => {
    for (const sdk of SUPPORTED_SDK_VERSIONS) {
      expect(resolveSdkVersion(String(sdk))).toBe(sdk);
      expect(resolveSdkVersion(sdk)).toBe(sdk);
    }
    expect(resolveSdkVersion("latest")).toBe(LATEST_SUPPORTED_SDK);
    expect(resolveSdkVersion(undefined)).toBe(LATEST_SUPPORTED_SDK);
    expect(() => resolveSdkVersion("59")).toThrow(UnsupportedSdkMessage);
    expect(() => resolveSdkVersion("42")).toThrow(UnsupportedSdkMessage);
  });
});
