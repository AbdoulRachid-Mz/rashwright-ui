import { execSync } from "node:child_process";

const cmd = process.platform === "win32" ? "node dist/index.js" : "node dist/index.js";
const cases = [
  "init --help",
  "add --help",
  "list --help",
  "doctor --help",
  "info --help",
  "remove --help",
  "update --help",
  "why --help",
];
cases.forEach((c) => {
  const first = c.split(" ")[0];
  console.log("---- rs-ui " + first + " ----");
  const out = execSync(cmd + " " + c, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const lines = out.split(/\n/).slice(0, 3);
  console.log(lines.join("\n"));
});
