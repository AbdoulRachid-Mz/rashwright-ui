import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

export interface FileCopyResult {
  source: string;
  destination: string;
  status: "copied" | "skipped" | "overwritten" | "failed";
  isModified?: boolean;
}

/**
 * Resolve the absolute source path for a component file in the rashwright-ui registry.
 * The `registrySourceRoot` is the root of the rashwright-ui project.
 */
export function resolveSourcePath(file: string, registrySourceRoot: string): string {
  return join(registrySourceRoot, file);
}

/**
 * Copy component files from the registry source to the target project.
 */
export function copyComponentFiles(
  files: string[],
  registrySourceRoot: string,
  targetComponentsRoot: string,
  options: { overwrite?: boolean; dryRun?: boolean } = {}
): FileCopyResult[] {
  const results: FileCopyResult[] = [];

  for (const file of files) {
    const relativeComponentsPath = file.replace(/^components\/ui\//, "");
    const source = resolveSourcePath(file, registrySourceRoot);
    const destination = join(targetComponentsRoot, relativeComponentsPath);

    if (!existsSync(source)) {
      results.push({ source, destination, status: "failed" });
      continue;
    }

    if (options.dryRun) {
      results.push({ source, destination, status: "copied" });
      continue;
    }

    const destDir = dirname(destination);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    // Check if the destination already exists and was potentially modified
    let isModified = false;
    if (existsSync(destination)) {
      if (!options.overwrite) {
        const destContent = readFileSync(destination, "utf-8");
        const srcContent = readFileSync(source, "utf-8");
        isModified = destContent !== srcContent;
        results.push({ source, destination, status: "skipped", isModified });
        continue;
      }
      isModified = true;
    }

    try {
      copyFileSync(source, destination);
      results.push({
        source,
        destination,
        status: isModified ? "overwritten" : "copied",
        isModified,
      });
    } catch {
      results.push({ source, destination, status: "failed" });
    }
  }

  return results;
}

/**
 * Write a text file to disk, creating directories as needed.
 */
export function writeFile(path: string, content: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, "utf-8");
}

/**
 * Check if a file exists and has been modified compared to a reference content.
 */
export function isFileModified(path: string, referenceContent: string): boolean {
  if (!existsSync(path)) return false;
  const current = readFileSync(path, "utf-8");
  return current !== referenceContent;
}
