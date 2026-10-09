import { describe, it, expect } from "vitest";
import {
  buildInstallCommand,
  buildExpoInstallCommand,
  runCommand,
  installNpmPackages,
  installExpoPackages,
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
      expect(SUPPORTED_SDK_VERSIONS).toEqual([54, 55, 56, 57]);
      expect(MINIMUM_SDK_VERSION).toBe(54);
      expect(LATEST_SUPPORTED_SDK).toBe(57);
    });

    it("resolves latest to LATEST_SUPPORTED_SDK (57)", () => {
      expect(resolveSdkVersion("latest")).toBe(57);
      expect(resolveSdkVersion(undefined)).toBe(57);
      expect(resolveSdkVersion("")).toBe(57);
    });

    it("resolves supported SDK numbers correctly", () => {
      expect(resolveSdkVersion("54")).toBe(54);
      expect(resolveSdkVersion("55")).toBe(55);
      expect(resolveSdkVersion("56")).toBe(56);
      expect(resolveSdkVersion("57")).toBe(57);
      expect(resolveSdkVersion(56)).toBe(56);
    });

    it("fallbacks unknown or invalid SDKs to latest", () => {
      expect(resolveSdkVersion("99")).toBe(57);
      expect(resolveSdkVersion("invalid")).toBe(57);
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
});
