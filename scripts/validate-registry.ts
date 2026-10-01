#!/usr/bin/env bun
/**
 * validate-registry.ts
 *
 * 6 contrôles sur registry :
 *   A. Chaque composant .tsx existe dans components/ui/ (F-1)
 *   B. Chaque JSON component liste les fichiers corrects (F-2)
 *   C. Chaque requiresComponents pointe vers un composant EXISTANT (R-1)
 *   D. Aucun cycle de requiresComponents (R-2)
 *   E. Index registry/index.json contient EXACTEMENT les JSON présents (I-1)
 *   F. liquid/* et text/view sont bien copiés par setupCoreUi (pas dans index.json) (I-2)
 *
 * Retourne code 0 si tout OK, 1 sinon.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename, dirname, extname, relative, sep } from "node:path";

const PROJECT_ROOT = process.cwd();
const UI_ROOT = join(PROJECT_ROOT, "components", "ui");
const REG_ROOT = join(PROJECT_ROOT, "registry");
const REG_COMPONENTS = join(REG_ROOT, "components");
const INDEX = join(REG_ROOT, "index.json");

function walkTsTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walkTsTsx(full, out);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function stripExt(p: string): string {
  const e = extname(p);
  return e ? p.slice(0, -e.length) : p;
}

const CORE_SET = new Set([
  "index",
  "text",
  "view",
  "liquid/liquid-types",
  "liquid/liquid-surface",
  "liquid/liquid-pressable",
  "liquid/liquid-highlight",
  "liquid/liquid-border",
  "liquid/liquid-glow",
  "liquid/liquid-blob",
  "liquid/liquid-shadow",
]);

// ---- Build source index ----
const allSources = walkTsTsx(UI_ROOT).map((p) => {
  const rel = relative(UI_ROOT, p).split(sep).join("/");
  return { abs: p, rel, noExt: stripExt(rel) };
});
const registeredComponents = new Set(
  allSources.filter((s) => !CORE_SET.has(s.noExt)).map((s) => basename(s.noExt))
);

// ---- Build registry index ----
const jsonFiles = readdirSync(REG_COMPONENTS)
  .filter((f) => f.endsWith(".json"))
  .map((f) => ({ name: stripExt(f), path: join(REG_COMPONENTS, f) }));

const registryByName = new Map<string, any>();
for (const j of jsonFiles) {
  registryByName.set(j.name, JSON.parse(readFileSync(j.path, "utf-8")));
}

const errors: string[] = [];
const infos: string[] = [];

// ============ A. F-1: chaque .tsx source a un JSON ============
for (const src of allSources) {
  if (CORE_SET.has(src.noExt)) continue;
  const compName = basename(src.noExt);
  if (!registryByName.has(compName)) {
    errors.push(`F-1  ❌  Composant source '${compName}' (${src.rel}) n'a pas de registry/components/${compName}.json`);
  }
}

// ============ B. F-2: chaque JSON liste des fichiers existants ============
for (const [name, j] of registryByName) {
  for (const f of j.files || []) {
    const abs = join(PROJECT_ROOT, f);
    if (!existsSync(abs)) {
      errors.push(`F-2  ❌  ${name}.json liste '${f}' (n'existe pas)`);
    } else if (!f.startsWith("components/ui/")) {
      errors.push(`F-2  ⚠  ${name}.json liste '${f}' — doit commencer par components/ui/`);
    }
  }
}

// ============ C. R-1: requiresComponents existent ============
for (const [name, j] of registryByName) {
  for (const req of j.requiresComponents || []) {
    if (!registryByName.has(req)) {
      errors.push(`R-1  ❌  ${name}.json requiresComponents['${req}'] — composant inexistant`);
    }
  }
}

// ============ D. R-2: détection de cycles ============
type VisitState = Map<string, "pending" | "done">;
const state: VisitState = new Map();
function dfs(n: string, path: string[]): void {
  if (state.get(n) === "done") return;
  if (state.get(n) === "pending") {
    const cycle = [...path.slice(path.indexOf(n)), n].join(" → ");
    errors.push(`R-2  ❌  Cycle détecté : ${cycle}`);
    return;
  }
  state.set(n, "pending");
  path.push(n);
  const j = registryByName.get(n);
  for (const req of j?.requiresComponents || []) dfs(req, path);
  path.pop();
  state.set(n, "done");
}
for (const n of registryByName.keys()) dfs(n, []);

// ============ E. I-1: registry/index.json = composants présents ============
let index: any = null;
try {
  index = JSON.parse(readFileSync(INDEX, "utf-8"));
  const listedSorted = [...(index.components || [])].sort();
  const realSorted = [...registryByName.keys()].sort();
  const missing = realSorted.filter((c) => !listedSorted.includes(c));
  const extra = listedSorted.filter((c) => !realSorted.includes(c));
  if (missing.length) errors.push(`I-1  ❌  registry/index.json manque : ${missing.join(", ")}`);
  if (extra.length) errors.push(`I-1  ❌  registry/index.json en trop : ${extra.join(", ")}`);
  if (index.version && typeof index.version === "string") {
    infos.push(`I-1  ℹ  Registry version : ${index.version} (${realSorted.length} composants)`);
  }
} catch (e: any) {
  errors.push(`I-1  ❌  Impossible de lire registry/index.json : ${e.message}`);
}

// ============ F. I-2: text/view + liquid/* ne doivent PAS être dans index.json ============
if (index) {
  const forbidden = ["text", "view"].filter((c) => index.components?.includes(c));
  if (forbidden.length) errors.push(`I-2  ❌  index.json contient des primitives UI Core (${forbidden.join(", ")}) : doivent être gérées par setupCoreUi`);
}
// Et inversement : ils doivent exister sur disque (setupCoreUi les copiera)
for (const core of ["text.tsx", "view.tsx"]) {
  if (!existsSync(join(UI_ROOT, core))) errors.push(`I-2  ❌  Primitive UI Core manquante : components/ui/${core}`);
}
if (!existsSync(join(UI_ROOT, "liquid"))) {
  errors.push(`I-2  ❌  Dossier components/ui/liquid/ manquant`);
} else {
  const liquidFiles = walkTsTsx(join(UI_ROOT, "liquid")).length;
  if (liquidFiles < 8) errors.push(`I-2  ⚠  components/ui/liquid/ contient ${liquidFiles} fichiers (attendu ~8-9 primitives)`);
  else infos.push(`I-2  ℹ  components/ui/liquid/ contient ${liquidFiles} primitives`);
}

// ============ G. Champs obligatoires ============
const REQUIRED = [
  "name",
  "version",
  "description",
  "category",
  "files",
  "dependencies",
  "expoDependencies",
  "optionalExpoDependencies",
  "requiresComponents",
  "providers",
  "supportsGlass",
  "platforms",
  "nativeRebuildRequired",
];
for (const [name, j] of registryByName) {
  for (const field of REQUIRED) {
    if (!(field in j)) {
      errors.push(`C-1  ❌  ${name}.json : champ obligatoire '${field}' manquant`);
    }
  }
  if (j.supportsGlass !== undefined && typeof j.supportsGlass !== "boolean") {
    errors.push(`C-1  ❌  ${name}.json : supportsGlass doit être un booléen`);
  }
  if (j.nativeRebuildRequired !== undefined && typeof j.nativeRebuildRequired !== "boolean") {
    errors.push(`C-1  ❌  ${name}.json : nativeRebuildRequired doit être un booléen`);
  }
}

// ============ Rapport ============
infos.forEach((l) => console.log(l));
console.log();
if (errors.length === 0) {
  console.log(`✅ validate-registry : 0 erreur — ${registryByName.size} composants, ${registeredComponents.size} sources`);
  process.exit(0);
} else {
  console.error(`❌ validate-registry : ${errors.length} erreur(s) :`);
  errors.forEach((e) => console.error("  ", e));
  process.exit(1);
}
