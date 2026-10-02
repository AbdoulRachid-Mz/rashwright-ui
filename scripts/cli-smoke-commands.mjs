import { execSync } from "node:child_process";

const cmd = process.platform === "win32" ? "node dist/index.js" : "node dist/index.js";
const cases = [
  "init --help",
  "add --help",
  "list --json",
  "doctor --help",
  "info button",
  "remove --help",
  "update --help",
];
cases.forEach((c) => {
  const first = c.split(" ")[0];
  console.log("---- rs-ui " + first + " ----");
  try {
    const out = execSync(cmd + " " + c, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const lines = out.split(/\n/).slice(0, 4);
    console.log(lines.join("\n"));
  } catch (e) {
    const msg = (e.stdout || e.stderr || String(e)).split(/\n/)[0];
    console.log("WARN/INFO: " + msg.slice(0, 120));
  }
});
