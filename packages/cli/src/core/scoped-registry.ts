import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface ScopedRegistryEntry {
  alias: string;
  url: string;
  token?: string;
  addedAt: string;
}

export interface RegistriesConfig {
  registries?: Record<string, ScopedRegistryEntry>;
}

/**
 * Lit les registres configurés dans rashwright-ui.json
 */
export function getScopedRegistries(projectRoot: string): Record<string, ScopedRegistryEntry> {
  const configPath = join(projectRoot, "rashwright-ui.json");
  if (!existsSync(configPath)) return {};

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.registries || {};
  } catch {
    return {};
  }
}

/**
 * Ajoute ou met à jour un registre scoped dans rashwright-ui.json
 */
export function addScopedRegistry(
  projectRoot: string,
  alias: string,
  url: string,
  token?: string
): ScopedRegistryEntry {
  const configPath = join(projectRoot, "rashwright-ui.json");
  if (!existsSync(configPath)) {
    throw new Error("Projet non initialisé (rashwright-ui.json introuvable)");
  }

  const raw = readFileSync(configPath, "utf-8");
  const config = JSON.parse(raw);

  if (!config.registries) {
    config.registries = {};
  }

  const entry: ScopedRegistryEntry = {
    alias,
    url: url.replace(/\/$/, ""),
    token,
    addedAt: new Date().toISOString(),
  };

  config.registries[alias] = entry;
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  return entry;
}

/**
 * Supprime un registre scoped
 */
export function removeScopedRegistry(projectRoot: string, alias: string): boolean {
  const configPath = join(projectRoot, "rashwright-ui.json");
  if (!existsSync(configPath)) return false;

  const raw = readFileSync(configPath, "utf-8");
  const config = JSON.parse(raw);

  if (!config.registries || !config.registries[alias]) {
    return false;
  }

  delete config.registries[alias];
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  return true;
}

/**
 * Analyse une cible de composant pour détecter un scope (@scope/nom)
 */
export function parseScopedComponentName(target: string): {
  scope: string | null;
  name: string;
  version?: string;
} {
  let clean = target;
  let version: string | undefined;

  if (clean.includes("@") && !clean.startsWith("@")) {
    const parts = clean.split("@");
    clean = parts[0];
    version = parts[1];
  } else if (clean.startsWith("@")) {
    const secondAt = clean.indexOf("@", 1);
    if (secondAt !== -1) {
      version = clean.slice(secondAt + 1);
      clean = clean.slice(0, secondAt);
    }
  }

  if (clean.startsWith("@") && clean.includes("/")) {
    const slashIdx = clean.indexOf("/");
    const scope = clean.slice(1, slashIdx);
    const name = clean.slice(slashIdx + 1);
    return { scope, name, version };
  }

  return { scope: null, name: clean, version };
}
