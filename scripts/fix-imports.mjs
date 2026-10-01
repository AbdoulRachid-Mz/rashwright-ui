#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";

const PROJECT_ROOT = process.cwd();
const COMPONENTS_ROOT = join(PROJECT_ROOT, "components", "ui");

function walk(dir, out = []) {
  const entries = readdirSync(dir);
  for (const name of entries) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const files = walk(COMPONENTS_ROOT);

let changedFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const relDir = dirname(relative(COMPONENTS_ROOT, file));
  const depth = relDir === "." ? 0 : relDir.split(sep).length;
  const prefix = "../".repeat(depth + 2);
  const prefixOneLess = depth === 0 ? "./" : "../".repeat(depth);

  let content = readFileSync(file, "utf-8");
  const original = content;

  let replacements = 0;

  content = content.replace(
    /from\s+(["'])@\/contexts\/theme-context\1/g,
    (_, q) => {
      replacements += 1;
      return `from ${q}${prefix}contexts/theme-context${q}`;
    }
  );

  content = content.replace(
    /from\s+(["'])@\/constants\/glass-theme\1/g,
    (_, q) => {
      replacements += 1;
      return `from ${q}${prefix}constants/glass-theme${q}`;
    }
  );

  content = content.replace(
    /from\s+(["'])@\/components\/ui\/text\1/g,
    (_, q) => {
      replacements += 1;
      return `from ${q}${prefixOneLess}text${q}`;
    }
  );

  content = content.replace(
    /from\s+(["'])@\/components\/ui\/view\1/g,
    (_, q) => {
      replacements += 1;
      return `from ${q}${prefixOneLess}view${q}`;
    }
  );

  if (content !== original) {
    writeFileSync(file, content, "utf-8");
    changedFiles += 1;
    totalReplacements += replacements;
    console.log(`✓ ${relative(PROJECT_ROOT, file)}  — ${replacements} replacement(s)`);
  }
}

console.log();
console.log(`Résultat : ${changedFiles} fichier(s) modifié(s), ${totalReplacements} import(s) corrigé(s).`);

// Sanity check: any remaining @/ imports in components/ui?
const remaining = [];
for (const file of walk(COMPONENTS_ROOT)) {
  const c = readFileSync(file, "utf-8");
  if (/from\s+["']@\//.test(c)) remaining.push(file);
}
if (remaining.length > 0) {
  console.log();
  console.log(`⚠  ${remaining.length} fichier(s) contiennent encore des imports @/ :`);
  for (const f of remaining) console.log(`   - ${relative(PROJECT_ROOT, f)}`);
} else {
  console.log("✅ Aucun import @/ résiduel dans components/ui/.");
}
