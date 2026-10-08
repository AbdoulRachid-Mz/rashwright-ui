import { describe, it, expect } from "vitest";
import {
  hasLocalRegistry,
  isCacheValid,
  resolveRegistry,
  getCacheDir,
  ensureComponentDownloaded,
  clearRegistryCache,
  DEFAULT_REMOTE_REGISTRY,
} from "../src/core/remote-registry.js";
import { REGISTRY_ROOT, SOURCE_ROOT } from "../src/core/paths.js";

describe("remote-registry", () => {
  it("hasLocalRegistry returns true when local registry exists", () => {
    expect(hasLocalRegistry()).toBe(true);
  });

  it("resolveRegistry resolves to local registry by default in repo", async () => {
    const resolved = await resolveRegistry();
    expect(resolved.isRemote).toBe(false);
    expect(resolved.registryRoot).toBe(REGISTRY_ROOT);
    expect(resolved.sourceRoot).toBe(SOURCE_ROOT);
  });

  it("resolveRegistry respects forceRemote option", async () => {
    const resolved = await resolveRegistry({ forceRemote: true });
    expect(resolved.isRemote).toBe(true);
    expect(resolved.registryUrl).toBe(DEFAULT_REMOTE_REGISTRY);
    expect(resolved.sourceRoot).toBe(getCacheDir());
  }, 15000);

  it("isCacheValid returns false for unmatched URL", () => {
    expect(isCacheValid("https://unknown-registry-url.dev")).toBe(false);
  });

  it("ensureComponentDownloaded and clearRegistryCache operate correctly", async () => {
    const entry = await ensureComponentDownloaded("button");
    expect(entry).not.toBeNull();
    expect(entry?.name).toBe("button");

    expect(() => clearRegistryCache()).not.toThrow();
  });
});
