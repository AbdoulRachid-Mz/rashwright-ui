import { execSync } from "node:child_process";
import chalk from "chalk";

export type HookName =
  | "pre-add"
  | "post-add"
  | "pre-update"
  | "post-update"
  | "pre-remove"
  | "post-remove"
  | "pre-reset"
  | "post-reset";

export interface HooksConfig {
  [hookName: string]: string | undefined;
}

/**
 * Exécute un hook configuré dans rashwright-ui.json
 */
export function executeHook(
  hookName: HookName,
  hooksConfig: HooksConfig | undefined,
  projectRoot: string,
  options: {
    dryRun?: boolean;
    env?: Record<string, string>;
  } = {}
): { executed: boolean; command?: string; success: boolean; error?: string } {
  if (!hooksConfig || !hooksConfig[hookName]) {
    return { executed: false, success: true };
  }

  const command = hooksConfig[hookName]!.trim();
  if (!command) {
    return { executed: false, success: true };
  }

  if (options.dryRun) {
    console.log(chalk.dim(`  [hook:dry-run] ${hookName} → ${command}`));
    return { executed: true, command, success: true };
  }

  console.log(chalk.cyan(`  ↻ Exécution du hook "${hookName}" : `) + chalk.dim(command));

  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        ...(options.env || {}),
        RASHWRIGHT_HOOK: hookName,
      },
    });
    return { executed: true, command, success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.log(chalk.yellow(`  ⚠ Avertissement : le hook "${hookName}" a retourné une erreur.`));
    return { executed: true, command, success: false, error: errorMsg };
  }
}
