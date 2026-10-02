import { readFileSync } from "node:fs";
import { join } from "node:path";

const ambient = join(process.cwd(), "types", "ambient.d.ts");
const c = readFileSync(ambient, "utf8");
const n = (c.match(/\bany\b/g) || []).length;
console.log("types/ambient.d.ts any count = " + n);
if (n !== 0) {
  console.error("❌ FAIL: ambient.d.ts doit contenir 0 any");
  process.exit(1);
}
console.log("✅ Zéro any dans ambient.d.ts");
