#!/usr/bin/env node
import { Command } from "commander";
import { createRequire } from "node:module";
import { basename } from "node:path";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { infoCommand } from "./commands/info.js";
import { doctorCommand } from "./commands/doctor.js";
import { removeCommand } from "./commands/remove.js";
import { updateCommand } from "./commands/update.js";
import { resetCommand } from "./commands/reset.js";
import { backupCommand } from "./commands/backup.js";
import { restoreCommand } from "./commands/restore.js";
import { depsCommand } from "./commands/deps.js";
import { whyCommand } from "./commands/why.js";

const require = createRequire(import.meta.url);
const { version: CLI_VERSION } = require("../package.json") as {
  version: string;
};

const program = new Command();

program
  .name("rs-ui")
  .description("Rashwright UI Mobile — Système de composants React Native / Expo")
  .version(CLI_VERSION);

program.addCommand(initCommand());
program.addCommand(addCommand());
program.addCommand(listCommand());
program.addCommand(infoCommand());
program.addCommand(doctorCommand());
program.addCommand(removeCommand());
program.addCommand(updateCommand());
program.addCommand(resetCommand());
program.addCommand(backupCommand());
program.addCommand(restoreCommand());
program.addCommand(depsCommand());
program.addCommand(whyCommand());

// Support de l'alias direct binaire `rs-ui-reset`
const invokedBin = basename(process.argv[1] || "");
if (invokedBin === "rs-ui-reset" || invokedBin === "rs-ui-reset.js") {
  const args = [process.argv[0], process.argv[1], "reset", ...process.argv.slice(2)];
  program.parse(args);
} else {
  program.parse(process.argv);
}
