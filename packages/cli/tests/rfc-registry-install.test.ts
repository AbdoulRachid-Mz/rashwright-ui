import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadComponentEntry } from "../src/core/dependency-resolver.js";
import { copyComponentFiles } from "../src/core/file-manager.js";

const UI_MOBILE_ROOT = join(__dirname, "../../ui-mobile");
const REGISTRY_ROOT = join(UI_MOBILE_ROOT, "registry");
const TEMP_PROJECT = join(__dirname, "temp-rfc-project");

describe("RFC v4 Registry Multi-Type Resolution (hooks & libs)", () => {
  beforeEach(() => {
    if (existsSync(TEMP_PROJECT)) rmSync(TEMP_PROJECT, { recursive: true, force: true });
    mkdirSync(join(TEMP_PROJECT, "src/components/ui"), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEMP_PROJECT)) rmSync(TEMP_PROJECT, { recursive: true, force: true });
  });

  it("resolves use-device hook via clean name and prefix", () => {
    const entryWithoutPrefix = loadComponentEntry("use-device", REGISTRY_ROOT);
    expect(entryWithoutPrefix).not.toBeNull();
    expect(entryWithoutPrefix?.type).toBe("registry:hook");
    expect(entryWithoutPrefix?.files).toContain("hooks/use-device.ts");

    const entryWithPrefix = loadComponentEntry("hook:use-device", REGISTRY_ROOT);
    expect(entryWithPrefix).not.toBeNull();
    expect(entryWithPrefix?.name).toBe("use-device");
  });

  it("resolves use-controllable-state and use-disclosure primitives", () => {
    const entry = loadComponentEntry("use-controllable-state", REGISTRY_ROOT);
    expect(entry).not.toBeNull();
    expect(entry?.type).toBe("registry:hook");
    expect(entry?.files).toContain("lib/primitives/use-controllable-state.ts");

    const entryDisc = loadComponentEntry("hook:use-disclosure", REGISTRY_ROOT);
    expect(entryDisc).not.toBeNull();
    expect(entryDisc?.name).toBe("use-disclosure");
  });

  it("resolves upload and primitives lib entries via clean name and prefix", () => {
    const uploadEntry = loadComponentEntry("lib:upload", REGISTRY_ROOT);
    expect(uploadEntry).not.toBeNull();
    expect(uploadEntry?.type).toBe("registry:lib");
    expect(uploadEntry?.files.length).toBeGreaterThan(3);

    const primitivesEntry = loadComponentEntry("primitives", REGISTRY_ROOT);
    expect(primitivesEntry).not.toBeNull();
    expect(primitivesEntry?.type).toBe("registry:lib");
  });

  it("copyComponentFiles routes hooks to src/hooks/ and lib to src/lib/ automatically", () => {
    const hookFiles = ["hooks/use-device.ts"];
    const targetUiRoot = join(TEMP_PROJECT, "src/components/ui");

    const results = copyComponentFiles(hookFiles, UI_MOBILE_ROOT, targetUiRoot, {
      overwrite: true,
    });

    expect(results[0]?.status).toBe("copied");
    const expectedDest = join(TEMP_PROJECT, "src/hooks/use-device.ts");
    expect(existsSync(expectedDest)).toBe(true);

    const content = readFileSync(expectedDest, "utf-8");
    expect(content).toContain("export function useDevice");
  });

  it("copyComponentFiles routes primitives lib to src/lib/primitives/ correctly", () => {
    const libFiles = [
      "lib/primitives/use-controllable-state.ts",
      "lib/primitives/use-disclosure.ts",
    ];
    const targetUiRoot = join(TEMP_PROJECT, "src/components/ui");

    const results = copyComponentFiles(libFiles, UI_MOBILE_ROOT, targetUiRoot, {
      overwrite: true,
    });

    expect(results.length).toBe(2);
    expect(existsSync(join(TEMP_PROJECT, "src/lib/primitives/use-controllable-state.ts"))).toBe(true);
    expect(existsSync(join(TEMP_PROJECT, "src/lib/primitives/use-disclosure.ts"))).toBe(true);
  });
});
