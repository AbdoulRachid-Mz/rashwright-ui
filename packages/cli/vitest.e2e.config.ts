import { defineConfig } from "vitest/config";

/**
 * Configuration dédiée aux tests E2E d'installation (Phase 0).
 *
 * Ces tests sont volontairement rouges avant correction et ne font donc pas
 * partie de `bun run test`. Exécution explicite : `bun run test:install-e2e`.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/e2e/**/*.e2e.ts"],
    testTimeout: 120000,
    hookTimeout: 120000,
    fileParallelism: false,
    coverage: {
      enabled: false,
    },
  },
});
