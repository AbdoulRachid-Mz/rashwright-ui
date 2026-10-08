import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  version?: string;
  componentVersion?: string;
  category?: string;
  dependencies?: string[];
  expoDependencies?: string[];
  requiresComponents?: string[];
  supportsGlass?: boolean;
}

export interface SkillDiagnosis {
  globalSkillInstalled: boolean;
  globalSkillPath: string;
  componentSkillsCount: number;
  installedComponentSkills: string[];
  missingSkills: string[];
  outdatedSkills: Array<{
    component: string;
    installedVersion: string;
    skillVersion: string;
  }>;
}

/**
 * Extrait le frontmatter YAML d'un fichier SKILL.md.
 */
export function parseSkillFrontmatter(content: string): SkillFrontmatter | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yamlStr = match[1];
  const result: SkillFrontmatter = {};

  for (const line of yamlStr.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    if (key === "version") result.version = value;
    else if (key === "componentVersion") result.componentVersion = value;
    else if (key === "name") result.name = value;
    else if (key === "description") result.description = value;
    else if (key === "category") result.category = value;
    else if (key === "supportsGlass") result.supportsGlass = value === "true";
  }

  return result;
}

/**
 * Installe le Skill IA Global Rashwright UI dans le projet consommateur (skills/rs-ui/SKILL.md).
 */
export function copyGlobalSkill(
  sourceRoot: string,
  targetProjectRoot: string,
  dryRun = false,
): boolean {
  const sourcePath = join(sourceRoot, "skills", "rs-ui", "SKILL.md");
  const destDir = join(targetProjectRoot, "skills", "rs-ui");
  const destPath = join(destDir, "SKILL.md");

  if (!existsSync(sourcePath)) {
    return false;
  }

  if (dryRun) return true;

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  const content = readFileSync(sourcePath, "utf-8");
  writeFileSync(destPath, content, "utf-8");
  return true;
}

/**
 * Installe le Skill IA d'un composant dans skills/rs-ui/<compName>/SKILL.md.
 */
export function copyComponentSkill(
  componentName: string,
  sourceRoot: string,
  targetProjectRoot: string,
  dryRun = false,
): boolean {
  const sourcePath = join(sourceRoot, "skills", componentName, "SKILL.md");
  const destDir = join(targetProjectRoot, "skills", "rs-ui", componentName);
  const destPath = join(destDir, "SKILL.md");

  if (!existsSync(sourcePath)) {
    return false;
  }

  if (dryRun) return true;

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  const content = readFileSync(sourcePath, "utf-8");
  writeFileSync(destPath, content, "utf-8");
  return true;
}

/**
 * Supprime le Skill IA d'un composant retiré.
 */
export function removeComponentSkill(
  componentName: string,
  targetProjectRoot: string,
  dryRun = false,
): boolean {
  const compSkillDir = join(targetProjectRoot, "skills", "rs-ui", componentName);
  const compSkillFile = join(compSkillDir, "SKILL.md");

  if (!existsSync(compSkillFile)) return false;

  if (dryRun) return true;

  try {
    rmSync(compSkillFile, { force: true });
    // Supprimer le sous-dossier s'il est vide
    try {
      const remaining = readdirSync(compSkillDir);
      if (remaining.length === 0) {
        rmSync(compSkillDir, { recursive: true, force: true });
      }
    } catch {
      // Ignorer
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Diagnostique l'état des Skills IA pour rs-ui doctor.
 */
export function diagnoseSkills(
  targetProjectRoot: string,
  installedComponents: Record<string, string | { version: string }>,
): SkillDiagnosis {
  const globalSkillPath = join(targetProjectRoot, "skills", "rs-ui", "SKILL.md");
  const globalSkillInstalled = existsSync(globalSkillPath);

  const installedComponentNames = Object.keys(installedComponents);
  const installedComponentSkills: string[] = [];
  const missingSkills: string[] = [];
  const outdatedSkills: Array<{
    component: string;
    installedVersion: string;
    skillVersion: string;
  }> = [];

  for (const compName of installedComponentNames) {
    const skillPath = join(targetProjectRoot, "skills", "rs-ui", compName, "SKILL.md");
    if (existsSync(skillPath)) {
      installedComponentSkills.push(compName);

      try {
        const content = readFileSync(skillPath, "utf-8");
        const fm = parseSkillFrontmatter(content);
        const compVal = installedComponents[compName];
        const compVersion = typeof compVal === "string" ? compVal : compVal?.version || "1.0.0";
        const skillVersion = fm?.componentVersion || fm?.version || "0.0.0";

        // Comparer versions si disponibles
        if (skillVersion !== "0.3.0" && skillVersion !== compVersion && compVersion !== "1.0.0") {
          outdatedSkills.push({
            component: compName,
            installedVersion: compVersion,
            skillVersion,
          });
        }
      } catch {
        // Ignorer erreur de lecture ponctuelle
      }
    } else {
      missingSkills.push(compName);
    }
  }

  return {
    globalSkillInstalled,
    globalSkillPath,
    componentSkillsCount: installedComponentSkills.length,
    installedComponentSkills,
    missingSkills,
    outdatedSkills,
  };
}
