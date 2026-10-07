import { describe, it, expect } from "vitest";
import {
  buildInstallCommand,
  buildExpoInstallCommand,
  runCommand,
  installNpmPackages,
  installExpoPackages,
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
});
