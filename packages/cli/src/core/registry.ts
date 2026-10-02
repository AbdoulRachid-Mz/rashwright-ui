import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentRegistryEntry, ResolvedComponent } from "./dependency-resolver.js";
import { loadAllComponentEntries, loadComponentEntry } from "./dependency-resolver.js";

export type RegistryEntry = ComponentRegistryEntry;
export type { ResolvedComponent };

export interface RegistryIndex {
  version: string;
  minimumExpoSdk: number;
  components: string[];
  categories: Record<string, string[]>;
  themes: string[];
}

/**
 * Load the registry index from the local registry directory.
 */
export function loadRegistryIndex(registryRoot: string): RegistryIndex | null {
  const indexPath = join(registryRoot, "index.json");
  if (!existsSync(indexPath)) return null;
  try {
    return JSON.parse(readFileSync(indexPath, "utf-8")) as RegistryIndex;
  } catch {
    return null;
  }
}

/**
 * Get all component entries from the registry.
 */
export function getAllComponents(registryRoot: string): ComponentRegistryEntry[] {
  return loadAllComponentEntries(registryRoot);
}

/**
 * Get a specific component entry by name.
 */
export function getComponent(name: string, registryRoot: string): ComponentRegistryEntry | null {
  return loadComponentEntry(name, registryRoot);
}

/**
 * Get categories mapping from registry index.
 */
export function getCategories(registryRoot: string): Record<string, string[]> {
  const index = loadRegistryIndex(registryRoot);
  return index?.categories ?? {};
}

/**
 * Get the source root for the registry component files.
 * This is the rashwright-ui project root itself (since the components live in it).
 */
export function getRegistrySourceRoot(cliEntrypoint: string): string {
  // CLI is at cli/dist/index.js — registry source is two dirs up
  // In dev mode (running from cli/index.ts), it's also two dirs up
  return join(cliEntrypoint, "..", "..");
}
