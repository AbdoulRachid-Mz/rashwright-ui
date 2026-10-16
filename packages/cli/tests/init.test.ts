import { describe, it, expect } from "vitest";
import { initCommand } from "../src/commands/init.js";
import {
  buildCreateExpoAppCommand,
  buildProjectInstallCommand,
  SUPPORTED_SDK_VERSIONS,
  LATEST_SUPPORTED_SDK,
  resolveSdkVersion,
} from "../src/core/package-manager.js";

describe("initCommand and bootstrap pipeline", () => {
  it("defines init command with all expected options", () => {
    const cmd = initCommand();
    expect(cmd.name()).toBe("init");

    const optionNames = cmd.options.map((o) => o.long);
    expect(optionNames).toContain("--sdk");
    expect(optionNames).toContain("--theme");
    expect(optionNames).toContain("--theme-mode");
    expect(optionNames).toContain("--template");
    expect(optionNames).toContain("--primary");
    expect(optionNames).toContain("--glass");
    expect(optionNames).toContain("--pm");
    expect(optionNames).toContain("--skills");
    expect(optionNames).toContain("--no-skills");
    expect(optionNames).toContain("--showcase");
    expect(optionNames).toContain("--no-showcase");
    expect(optionNames).toContain("--nativewind");
    expect(optionNames).toContain("--no-nativewind");
    expect(optionNames).toContain("--yes");
    expect(optionNames).toContain("--no-reset");
    expect(optionNames).toContain("--dry-run");
  });

  it("CRITICAL: bootstrap command guarantees --no-install and --no-agents-md (no double installation)", () => {
    for (const pm of ["bun", "pnpm", "yarn", "npm"] as const) {
      for (const sdk of SUPPORTED_SDK_VERSIONS) {
        const cmdStr = buildCreateExpoAppCommand(pm, "test-app", sdk);
        // Doit utiliser le template blank-typescript@SDK
        expect(cmdStr).toContain(`--template blank-typescript@${sdk}`);
        // Doit impérativement contenir --no-install pour empêcher la double installation
        expect(cmdStr).toContain("--no-install");
        // Doit impérativement contenir --no-agents-md
        expect(cmdStr).toContain("--no-agents-md");
        // Ne doit jamais utiliser le template 'default'
        expect(cmdStr).not.toContain("--template default");
      }
    }
  });

  it("resolves SDK options correctly for latest and specific versions", () => {
    expect(resolveSdkVersion("latest")).toBe(LATEST_SUPPORTED_SDK);
    expect(resolveSdkVersion("57")).toBe(57);
    expect(resolveSdkVersion("56")).toBe(56);
    expect(resolveSdkVersion("55")).toBe(55);
    expect(resolveSdkVersion("54")).toBe(54);
    expect(resolveSdkVersion(undefined)).toBe(LATEST_SUPPORTED_SDK);
  });

  // ── Tests de non-régression : ordre d'installation ─────────────────────
  //
  //  REGRESSION #1 : ConfigError: Cannot determine the project's Expo SDK version
  //  Fix : installProjectDependencies (Étape A) DOIT précéder installExpoPackages (Étape B)
  //
  //  Ce test vérifie que les fonctions exposées par package-manager.ts permettent
  //  bien d'implémenter cet ordre (les tests d'intégration réels seraient dans e2e/).

  it("REGRESSION: buildProjectInstallCommand produces a non-expo base install for all PMs", () => {
    const pms = ["bun", "npm", "pnpm", "yarn"] as const;
    for (const pm of pms) {
      const cmd = buildProjectInstallCommand(pm);
      // La commande de base ne doit PAS déclencher expo install
      expect(cmd).not.toContain("expo");
      // Elle doit être la commande d'install du PM
      if (pm === "bun")  expect(cmd).toBe("bun install");
      if (pm === "npm")  expect(cmd).toBe("npm install");
      if (pm === "pnpm") expect(cmd).toBe("pnpm install");
      if (pm === "yarn") expect(cmd).toBe("yarn install");
    }
  });

  it("REGRESSION: create-expo-app '.' sets a valid target — buildCreateExpoAppCommand with '.' as projectName works", () => {
    // rs-ui init . → projectName = "." → create-expo-app@latest . --template ...
    const cmd = buildCreateExpoAppCommand("bun", ".", 56);
    expect(cmd).toBe("bunx create-expo-app@latest . --template blank-typescript@56 --no-install --no-agents-md");
    // Le "." doit être présent dans la commande
    expect(cmd).toContain(" . ");
  });
});
