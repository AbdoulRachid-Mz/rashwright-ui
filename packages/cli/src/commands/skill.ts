import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { detectProject } from "../core/project-detector.js";
import { readConfig } from "../core/config-manager.js";
import {
  diagnoseSkills,
  copyComponentSkill,
  copyGlobalSkill,
  SKILL_FILENAME,
} from "../core/skills-manager.js";
import { resolveRegistry } from "../core/remote-registry.js";

export function skillCommand(): Command {
  const cmd = new Command("skill");
  cmd.description("Gérer les compétences IA (Skills) de Rashwright UI");

  // rs-ui skill list
  cmd
    .command("list")
    .description("Lister les Skills IA installés et vérifier leur état de synchronisation")
    .action(async () => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(" — Skills IA installés"));
      console.log();

      const config = readConfig(project.rashwrightConfigPath);
      const diag = diagnoseSkills(cwd, config.components);

      console.log(chalk.bold("  Skill Global :"));
      console.log(
        chalk.dim("    • skills/rs-ui/SKILL.md : ") +
          (diag.globalSkillInstalled ? chalk.green("✔ Installé") : chalk.yellow("⚠ Non installé"))
      );
      console.log();

      console.log(chalk.bold(`  Skills de composants (${diag.componentSkillsCount} installés) :`));
      for (const compName of diag.installedComponentSkills) {
        const isOutdated = diag.outdatedSkills.some((o) => o.component === compName);
        const icon = isOutdated ? chalk.yellow("▲") : chalk.green("✔");
        const status = isOutdated ? chalk.yellow("mise à jour disponible") : chalk.dim("synchronisé");
        console.log(`    ${icon} ${compName.padEnd(24)} ${status}`);
      }

      if (diag.missingSkills.length > 0) {
        console.log();
        console.log(chalk.yellow(`  ⚠ Skills manquants pour composants installés (${diag.missingSkills.length}) :`));
        diag.missingSkills.forEach((m) => console.log(chalk.dim(`    • ${m}`)));
      }
      console.log();
    });

  // rs-ui skill update [name]
  cmd
    .command("update [name]")
    .description("Mettre à jour un ou tous les Skills IA sans modifier le code source")
    .option("--all", "Mettre à jour tous les skills installés", false)
    .option("--registry <url>", "URL du registre distant")
    .option("--dry-run", "Simuler la mise à jour des Skills")
    .action(async (name: string | undefined, options: { all?: boolean; registry?: string; dryRun?: boolean }) => {
      const cwd = process.cwd();
      const project = detectProject(cwd);

      if (!project.hasRashwrightConfig) {
        console.log(chalk.red("  ✖ Rashwright UI n'est pas initialisé dans ce projet."));
        process.exit(1);
      }

      const config = readConfig(project.rashwrightConfigPath);
      const resolved = await resolveRegistry({ registryUrl: options.registry });

      console.log();
      console.log(chalk.bold.cyan("  Rashwright UI") + chalk.dim(" — Mise à jour des Skills IA"));
      console.log();

      const toUpdate: string[] = [];
      if (name) {
        toUpdate.push(name);
      } else if (options.all) {
        toUpdate.push(...Object.keys(config.components));
      } else {
        console.log(chalk.yellow("  ⚠ Spécifiez le nom d'un composant ou utilisez l'option --all."));
        return;
      }

      // 1. Mettre à jour le skill global
      copyGlobalSkill(resolved.sourceRoot, cwd, options.dryRun);
      console.log(chalk.green("  ✔ Skill global synchronisé (skills/rs-ui/SKILL.md)"));

      // 2. Mettre à jour chaque skill de composant
      for (const compName of toUpdate) {
        copyComponentSkill(compName, resolved.sourceRoot, cwd, options.dryRun);
        console.log(chalk.green(`  ✔ Skill mis à jour : skills/rs-ui/${compName}/SKILL.md`));
      }

      console.log();
      console.log(chalk.bold.green(`  ✔ ${toUpdate.length} Skill(s) IA mis à jour avec succès !`));
      console.log();
    });

  return cmd;
}
