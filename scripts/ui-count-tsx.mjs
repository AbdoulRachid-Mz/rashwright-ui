import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir, n) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, n);
    else if (/\.(ts|tsx)$/.test(entry)) n.value++;
  }
}

const dirs = [
  "components",
  "constants",
  "contexts",
  "hooks",
  "stores",
  "theme",
  "types",
  "lib",
  "registry",
];
const n = { value: 0 };
dirs.forEach((d) => {
  const p = join(process.cwd(), d);
  if (existsSync(p)) walk(p, n);
});
console.log(
  "Fichiers .ts/.tsx (components + constants + contexts + hooks + stores + theme + types + lib + registry) : " +
    n.value
);
