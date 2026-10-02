import { readFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist", "index.js");
const c = readFileSync(dist, "utf8");
const lines = c.split(/\n/);
const l1 = lines[0] || "";
const l2 = lines[1] || "";
const okL1 = l1.startsWith("#!/usr/bin/env node");
const okL2 = !l2.startsWith("#!");
console.log(
  "dist/index.js L1 = " +
    JSON.stringify(l1.slice(0, 50)) +
    " — shebang unique : " +
    (okL1 && okL2 ? "OK" : "FAIL")
);
if (!(okL1 && okL2)) {
  console.error(
    "❌ FAIL: dist/index.js doit contenir UN SHEBANG UNIQUE (#!/usr/bin/env node) en L1, pas de doublon en L2."
  );
  process.exit(1);
}
console.log("✅ Shebang unique OK");
