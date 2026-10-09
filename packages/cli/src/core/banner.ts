import chalk from "chalk";

const LOGO = `
██████╗ ███████╗
██╔══██╗██╔════╝
██████╔╝███████╗
██╔══██╗╚════██║
██║  ██║███████║
╚═╝  ╚═╝╚══════╝
`;

export function printBanner(command?: string): void {
  console.log();
  console.log(chalk.bold.cyan(LOGO));
  console.log(
    chalk.bold("  Rashwright UI Mobile") +
      chalk.dim(command ? ` — ${command}` : "")
  );
  console.log(
    chalk.dim(
      "  Component distribution system for React Native / Expo"
    )
  );
  console.log();
}
