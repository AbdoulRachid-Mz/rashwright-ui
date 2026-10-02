import { readFileSync } from "node:fs";
import { join } from "node:path";

const idx = JSON.parse(
  readFileSync(join(process.cwd(), "registry", "index.json"), "utf8")
);
const total = Array.isArray(idx.components) ? idx.components.length : 0;
const cats = idx.categories || {};
const catCount = Object.keys(cats).length;
console.log(
  "Registry index: " +
    total +
    " composants · " +
    catCount +
    " catégories"
);
Object.entries(cats).forEach(([k, v]) =>
  console.log("  - " + k + ": " + (Array.isArray(v) ? v.length : v) + " composants")
);
