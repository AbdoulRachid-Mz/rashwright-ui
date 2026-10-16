import { describe, it, expect } from "vitest";
import {
  buildInstallCommand,
  buildExpoInstallCommand,
  buildProjectInstallCommand,
  runCommand,
  installNpmPackages,
  installExpoPackages,
  installProjectDependencies,
  buildCreateExpoAppCommand,
  resolveSdkVersion,
  SUPPORTED_SDK_VERSIONS,
  MINIMUM_SDK_VERSION,
  LATEST_SUPPORTED_SDK,
} from "../src/core/package-manager.js";

describe("package-manager", () => {
  it("buildInstallCommand returns empty string for empty package list", () => {
    expect(buildInstallCommand("npm", [])).toBe("");
    expect(buildInstallCommand("bun", [])).toBe("");
  });

  it("buildInstallCommand builds correct command for each package manager", () => {
    const pkgs = ["zustand", "clsx"];
    expect(buildInstallCommand("npm", pkgs)).toBe("npm install zustand clsx");
    expect(buildInstallCommand("bun", pkgs)).toBe("bun add zustand clsx");
    expect(buildInstallCommand("pnpm", pkgs)).toBe("pnpm add zustand clsx");
    expect(buildInstallCommand("yarn", pkgs)).toBe("yarn add zustand clsx");
  });

  it("buildExpoInstallCommand returns empty string for empty package list", () => {
    expect(buildExpoInstallCommand("npm", [])).toBe("");
  });

  it("buildExpoInstallCommand builds correct expo install command", () => {
    const pkgs = ["expo-haptics", "expo-blur"];
    expect(buildExpoInstallCommand("npm", pkgs)).toBe("npx expo install expo-haptics expo-blur");
    expect(buildExpoInstallCommand("bun", pkgs)).toBe("bunx expo install expo-haptics expo-blur");
    expect(buildExpoInstallCommand("pnpm", pkgs)).toBe("pnpm dlx expo install expo-haptics expo-blur");
    expect(buildExpoInstallCommand("yarn", pkgs)).toBe("yarn expo install expo-haptics expo-blur");
  });

  it("runCommand does not throw when dryRun is true", () => {
    expect(() => runCommand("non_existent_command_12345", process.cwd(), true)).not.toThrow();
  });

  it("installNpmPackages and installExpoPackages do nothing for empty package array", () => {
    expect(() => installNpmPackages([], "npm", process.cwd())).not.toThrow();
    expect(() => installExpoPackages([], "npm", process.cwd())).not.toThrow();
  });

  it("installNpmPackages and installExpoPackages respect dryRun", () => {
    expect(() => installNpmPackages(["dummy-pkg"], "npm", process.cwd(), true)).not.toThrow();
    expect(() => installExpoPackages(["dummy-pkg"], "npm", process.cwd(), true)).not.toThrow();
  });

  describe("Expo SDK constants and resolution", () => {
    it("exports supported SDK versions correctly", () => {
      expect(SUPPORTED_SDK_VERSIONS).toEqual([54, 55, 56, 57, 58]);
      expect(MINIMUM_SDK_VERSION).toBe(54);
      expect(LATEST_SUPPORTED_SDK).toBe(58);
    });

    it("resolves latest to LATEST_SUPPORTED_SDK (58)", () => {
      expect(resolveSdkVersion("latest")).toBe(58);
      expect(resolveSdkVersion(undefined)).toBe(58);
      expect(resolveSdkVersion("")).toBe(58);
    });

    it("resolves supported SDK numbers correctly", () => {
      expect(resolveSdkVersion("54")).toBe(54);
      expect(resolveSdkVersion("55")).toBe(55);
      expect(resolveSdkVersion("56")).toBe(56);
      expect(resolveSdkVersion("57")).toBe(57);
      expect(resolveSdkVersion("58")).toBe(58);
      expect(resolveSdkVersion(58)).toBe(58);
      expect(resolveSdkVersion(56)).toBe(56);
    });

    it("fallbacks unknown or invalid SDKs to latest", () => {
      expect(resolveSdkVersion("99")).toBe(58);
      expect(resolveSdkVersion("invalid")).toBe(58);
    });
  });

  describe("buildCreateExpoAppCommand", () => {
    it("builds bootstrap command with --no-install and --no-agents-md", () => {
      const bunCmd = buildCreateExpoAppCommand("bun", "my-app", 57);
      expect(bunCmd).toBe("bunx create-expo-app@latest my-app --template blank-typescript@57 --no-install --no-agents-md");

      const npmCmd = buildCreateExpoAppCommand("npm", "my-app", 57);
      expect(npmCmd).toBe("npx create-expo-app@latest my-app --template blank-typescript@57 --no-install --no-agents-md");

      const pnpmCmd = buildCreateExpoAppCommand("pnpm", "my-app", 56);
      expect(pnpmCmd).toBe("pnpm dlx create-expo-app@latest my-app --template blank-typescript@56 --no-install --no-agents-md");

      const yarnCmd = buildCreateExpoAppCommand("yarn", "my-app", 55);
      expect(yarnCmd).toBe("yarn dlx create-expo-app@latest my-app --template blank-typescript@55 --no-install --no-agents-md");
    });
  });

  // ── Tests de non-régression : ordre d'installation correct ───────────────
  //
  //  REGRESSION #1 : ConfigError: Cannot determine the project's Expo SDK version
  //                  because the module `expo` is not installed.
  //
  //  Cause : expo install était lancé AVANT bun install, donc node_modules/expo
  //          n'existait pas encore.
  //
  //  Fix   : buildProjectInstallCommand() + installProjectDependencies() sont
  //          appelés en Étape A, AVANT installExpoPackages() en Étape B.

  describe("REGRESSION: install order — base before expo", () => {
    it("buildProjectInstallCommand returns the correct base install command for each PM", () => {
      expect(buildProjectInstallCommand("bun")).toBe("bun install --force");
      expect(buildProjectInstallCommand("npm")).toBe("npm install");
      expect(buildProjectInstallCommand("pnpm")).toBe("pnpm install");
      expect(buildProjectInstallCommand("yarn")).toBe("yarn install");
    });

    it("installProjectDependencies does not throw in dryRun mode", () => {
      // dryRun=true → ne lance aucune commande réelle, ne doit jamais lever d'exception
      expect(() => installProjectDependencies("bun", process.cwd(), true)).not.toThrow();
      expect(() => installProjectDependencies("npm", process.cwd(), true)).not.toThrow();
      expect(() => installProjectDependencies("pnpm", process.cwd(), true)).not.toThrow();
      expect(() => installProjectDependencies("yarn", process.cwd(), true)).not.toThrow();
    });

    it("CRITICAL: buildProjectInstallCommand output never contains 'expo install' (base install must not trigger expo install)", () => {
      // La commande de base NE DOIT PAS inclure 'expo install' — sinon on reproduit le bug
      for (const pm of ["bun", "npm", "pnpm", "yarn"] as const) {
        const cmd = buildProjectInstallCommand(pm);
        expect(cmd).not.toContain("expo install");
        expect(cmd).not.toContain("bunx expo");
        expect(cmd).not.toContain("npx expo");
      }
    });

    it("CRITICAL: buildExpoInstallCommand always uses a dlx/npx runner (not bare 'expo install')", () => {
      // expo install doit toujours passer par bunx/npx/pnpm dlx/yarn
      // pour éviter qu'il tente de résoudre expo depuis un node_modules vide
      const pkgs = ["expo-haptics", "expo-blur"];
      const bunCmd  = buildExpoInstallCommand("bun", pkgs);
      const npmCmd  = buildExpoInstallCommand("npm", pkgs);
      const pnpmCmd = buildExpoInstallCommand("pnpm", pkgs);
      const yarnCmd = buildExpoInstallCommand("yarn", pkgs);

      expect(bunCmd).toMatch(/^bunx expo install/);
      expect(npmCmd).toMatch(/^npx expo install/);
      expect(pnpmCmd).toMatch(/^pnpm dlx expo install/);
      expect(yarnCmd).toMatch(/^yarn expo install/);

      // Aucun ne doit démarrer par un simple "expo install" sans runner
      for (const cmd of [bunCmd, npmCmd, pnpmCmd, yarnCmd]) {
        expect(cmd).not.toMatch(/^expo install/);
      }
    });
  });
});
