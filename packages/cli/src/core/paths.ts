/**
 * paths.ts — Centralisation des chemins absolus pour le CLI @rashwright/cli.
 *
 * Résout la racine du package @rashwright/ui-mobile (où vit le registry) :
 *   - En PROD (après npm install) : via require.resolve("@rashwright/ui-mobile/package.json")
 *   - En DEV (workspace Bun local) : fallback vers monorepo packages/ui-mobile
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Racine CLI — /.../packages/cli
// ---------------------------------------------------------------------------
export const CLI_PACKAGE_ROOT = join(__dirname, "..", "..");

// ---------------------------------------------------------------------------
// Racine @rashwright/ui-mobile — contient registry + composants source
// ---------------------------------------------------------------------------
let UI_MOBILE_ROOT: string;
try {
  const uiMobilePkgPath = require.resolve("@rashwright/ui-mobile/package.json");
  UI_MOBILE_ROOT = dirname(uiMobilePkgPath);
} catch {
  // Fallback dev : structure monorepo
  // packages/cli/src/core/paths.ts  →  ../../../ui-mobile
  UI_MOBILE_ROOT = join(__dirname, "..", "..", "..", "ui-mobile");
}
export { UI_MOBILE_ROOT };

export const REGISTRY_ROOT = join(UI_MOBILE_ROOT, "registry");
export const SOURCE_ROOT = UI_MOBILE_ROOT;
