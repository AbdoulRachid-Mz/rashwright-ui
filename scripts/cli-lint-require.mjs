import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

function walk(dir, hits) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walk(full, hits);
    } else if (/\.ts$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      const usesCreateRequire = /createRequire\(/.test(content);
      if (usesCreateRequire) continue;
      const lines = content.split(/\n/);
      lines.forEach((l, i) => {
        if (/\brequire\s*\(/.test(l)) {
          hits.push(
            relative(process.cwd(), full) +
              ":" +
              (i + 1) +
              ": " +
              l.trim().slice(0, 140)
          );
        }
      });
    }
  }
}

const hits = [];
walk(join(process.cwd(), "src"), hits);
console.log(
  "ESM strict — occurrences require() anti-pattern (fichiers SANS createRequire) dans src/: " + hits.length
);
hits.forEach((h) => console.log("  -", h));
if (hits.length > 0) {
  console.error(
    "❌ FAIL: src/ doit contenir 0 require() (ESM strict). Utilise import/export."
  );
  process.exit(1);
}
console.log("✅ Aucun require() dans src/ — ESM strict respecté");
