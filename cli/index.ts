#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { infoCommand } from "./commands/info.js";
import { doctorCommand } from "./commands/doctor.js";
import { removeCommand } from "./commands/remove.js";
import { updateCommand } from "./commands/update.js";

const program = new Command();

program
  .name("rs-ui")
  .description("Rashwright UI Mobile — Système de composants React Native / Expo")
  .version("0.1.0");

program.addCommand(initCommand());
program.addCommand(addCommand());
program.addCommand(listCommand());
program.addCommand(infoCommand());
program.addCommand(doctorCommand());
program.addCommand(removeCommand());
program.addCommand(updateCommand());

program.parse(process.argv);
