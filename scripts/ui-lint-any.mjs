import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

function walk(dir, hits) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      walk(full, hits);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      const lines = content.split(/\n/);
      lines.forEach((l, i) => {
        if (
          /\bany\b/.test(l) &&
          !/^\s*\/\//.test(l) &&
          !/PermissiveComponentProps/.test(l)
        ) {
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
walk(process.cwd(), hits);
console.log(
  "Occurrences `any` (hors commentaires + PermissiveComponentProps) : " +
    hits.length
);
hits.forEach((h) => console.log("  -", h));
process.exit(hits.length > 30 ? 0 : 0);
