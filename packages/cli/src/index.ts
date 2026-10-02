#!/usr/bin/env node
import { Command } from "commander";
import { createRequire } from "node:module";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { infoCommand } from "./commands/info.js";
import { doctorCommand } from "./commands/doctor.js";
import { removeCommand } from "./commands/remove.js";
import { updateCommand } from "./commands/update.js";

const require = createRequire(import.meta.url);
const { version: CLI_VERSION, name: CLI_NAME } = require("../package.json") as {
  version: string;
  name: string;
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

program.parse(process.argv);
