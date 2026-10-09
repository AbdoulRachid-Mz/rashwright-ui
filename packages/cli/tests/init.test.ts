import { describe, it, expect } from "vitest";
import { initCommand } from "../src/commands/init.js";
import {
  buildCreateExpoAppCommand,
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
    expect(optionNames).toContain("--template");
    expect(optionNames).toContain("--primary");
    expect(optionNames).toContain("--glass");
    expect(optionNames).toContain("--pm");
    expect(optionNames).toContain("--skills");
    expect(optionNames).toContain("--no-skills");
    expect(optionNames).toContain("--showcase");
    expect(optionNames).toContain("--no-showcase");
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
});
