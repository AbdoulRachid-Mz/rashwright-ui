import { describe, it, expect } from "vitest";
import { executeHook } from "../src/core/hooks-manager.js";

describe("CLI Hooks Subsystem (hooks-manager.ts)", () => {
  it("executeHook returns not executed when hook is not configured", () => {
    const res = executeHook("post-add", undefined, process.cwd());
    expect(res.executed).toBe(false);
    expect(res.success).toBe(true);
  });

  it("executeHook respects dryRun option without running shell command", () => {
    const res = executeHook(
      "post-add",
      { "post-add": "echo 'HOOK_RUNNING'" },
      process.cwd(),
      { dryRun: true }
    );
    expect(res.executed).toBe(true);
    expect(res.command).toBe("echo 'HOOK_RUNNING'");
    expect(res.success).toBe(true);
  });

  it("executeHook executes shell command when valid", () => {
    const res = executeHook(
      "pre-update",
      { "pre-update": "node -e \"console.log('hook test')\"" },
      process.cwd(),
      { dryRun: false }
    );
    expect(res.executed).toBe(true);
    expect(res.success).toBe(true);
  });

  it("executeHook catches failure gracefully without throwing unhandled error", () => {
    const res = executeHook(
      "post-update",
      { "post-update": "non_existent_command_xyz123" },
      process.cwd(),
      { dryRun: false }
    );
    expect(res.executed).toBe(true);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
