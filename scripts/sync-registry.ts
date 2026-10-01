#!/usr/bin/env bun
/**
 * sync-registry.ts
 *
 * Synchronise les 5 clés dynamiques des fichiers registry/components/*.json
 * à partir du CODE RÉEL des composants .tsx.
 *
 * Ne modifie JAMAIS les champs statiques : name, version, description, category,
 * files, dependencies, providers, platforms, props.
 *
 * Champs mis à jour (5 exactement) :
 *   1. requiresComponents        — dépendances internes ./xxx vers d'autres composants
 *   2. expoDependencies          — deps Expo/RN obligatoires
 *   3. optionalExpoDependencies  — deps Expo/RN optionnelles (ex: expo-haptics)
 *   4. supportsGlass             — true si composant utilise Liquid ou glass variants
 *   5. nativeRebuildRequired     — true si Gesture.Handler / PanGestureHandler actif
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, basename, extname, dirname, relative, sep } from "node:path";

// ---------------------------------------------------------------------------
// 0. Constantes globales
// ---------------------------------------------------------------------------
const PROJECT_ROOT = process.cwd();
const COMPONENTS_UI_ROOT = join(PROJECT_ROOT, "components", "ui");
const REGISTRY_ROOT = join(PROJECT_ROOT, "registry");
const REGISTRY_COMPONENTS = join(REGISTRY_ROOT, "components");

// Core UI files — NE SONT PAS des composants enregistrables.
const CORE_FILES = new Set([
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

const EXPO_PKGS = new Set([
  "expo-blur",
  "expo-linear-gradient",
  "expo-haptics",
  "expo-image-picker",
  "expo-image-manipulator",
  "expo-image",
  "expo-av",
  "expo-document-picker",
  "expo-file-system",
]);

const RN_PKGS = new Set([
  "react-native-reanimated",
  "react-native-gesture-handler",
  "react-native-safe-area-context",
  "react-native-screens",
]);

const VECTOR = "@expo/vector-icons";
const ASYNC = "@react-native-async-storage/async-storage";

// ---------------------------------------------------------------------------
// 1. Helpers
// ---------------------------------------------------------------------------
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
  const ext = extname(p);
  return ext ? p.slice(0, -ext.length) : p;
}

/**
 * Extrait TOUS les `from "..."` d'un contenu source.
 */
const FROM_RE = /from\s+(["'])([^"']+)\1/g;
function extractAllImports(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  FROM_RE.lastIndex = 0;
  while ((m = FROM_RE.exec(content)) !== null) out.push(m[2]);
  return out;
}

// ---------------------------------------------------------------------------
// 2. Parcours des composants
// ---------------------------------------------------------------------------
if (!existsSync(COMPONENTS_UI_ROOT)) {
  console.error(`❌ Dossier introuvable : ${COMPONENTS_UI_ROOT}`);
  process.exit(1);
}
if (!existsSync(REGISTRY_COMPONENTS)) mkdirSync(REGISTRY_COMPONENTS, { recursive: true });

const allSources = walkTsTsx(COMPONENTS_UI_ROOT);

/** Map<component-name, { internal, external, usesLiquid, content }> */
type Analyse = {
  name: string;
  internalImports: string[];
  externalImports: string[];
  usesLiquid: boolean;
  content: string;
};
const analyses = new Map<string, Analyse>();

for (const abs of allSources) {
  const relFromCompRoot = relative(COMPONENTS_UI_ROOT, abs).split(sep).join("/");
  const noExt = stripExt(relFromCompRoot);

  // Skip les core files
  if (CORE_FILES.has(noExt)) continue;

  const content = readFileSync(abs, "utf-8");
  const allImp = extractAllImports(content);

  const internal: string[] = [];
  const external: string[] = [];

  for (const imp of allImp) {
    if (imp.startsWith(".")) {
      // Relatif : résoudre et convertir en nom composant
      const absImpDir = dirname(abs);
      const resolved = join(absImpDir, imp);
      let rel = relative(COMPONENTS_UI_ROOT, resolved).split(sep).join("/");
      rel = stripExt(rel);
      // Ignorer core files (liquid/*, text, view)
      if (!CORE_FILES.has(rel) && rel !== basename(noExt)) {
        internal.push(rel);
      }
    } else {
      external.push(imp);
    }
  }

  const usesLiquid = internal.some((i) => i.startsWith("liquid/"));

  const name = basename(noExt);
  analyses.set(name, {
    name,
    internalImports: Array.from(new Set(internal)).map((i) => basename(i)),
    externalImports: Array.from(new Set(external)),
    usesLiquid,
    content,
  });
}

// ---------------------------------------------------------------------------
// 3. Mise à jour des JSON
// ---------------------------------------------------------------------------
let updated = 0;
const anomalies: { file: string; reason: string }[] = [];

for (const [name, a] of analyses) {
  const jsonPath = join(REGISTRY_COMPONENTS, `${name}.json`);

  if (!existsSync(jsonPath)) {
    anomalies.push({ file: name, reason: "⚠  JSON MANQUANT dans registry/components/ — aucun champ mis à jour" });
    continue;
  }

  const json = JSON.parse(readFileSync(jsonPath, "utf-8"));

  // ---- requiresComponents ----
  const requiresComponents = Array.from(new Set(a.internalImports.filter((i) => analyses.has(i)))).sort();

  // ---- expoDependencies + optionalExpoDependencies ----
  const expoDeps = new Set<string>();
  const optExpoDeps = new Set<string>();

  for (const pkg of a.externalImports) {
    if (EXPO_PKGS.has(pkg)) {
      if (pkg === "expo-haptics") optExpoDeps.add(pkg);
      else expoDeps.add(pkg);
    } else if (RN_PKGS.has(pkg)) {
      expoDeps.add(pkg);
    } else if (pkg === VECTOR) {
      expoDeps.add(pkg);
    } else if (pkg === ASYNC) {
      expoDeps.add(pkg);
    }
  }

  // Si utilise Liquid → ajouter automatiquement ses deps
  if (a.usesLiquid) {
    expoDeps.add("react-native-reanimated");
    expoDeps.add("expo-linear-gradient");
    expoDeps.add("expo-blur");
  }

  // ---- supportsGlass ----
  const hasGlassKeywords =
    a.content.includes('variant="glass"') ||
    a.content.includes("createGlassTheme") ||
    a.content.includes("glassEnabled") ||
    a.content.includes("variant: \"glass\"") ||
    a.content.includes("variant:'glass'") ||
    a.content.includes("supportsGlass");

  const supportsGlass = a.usesLiquid || hasGlassKeywords;

  // ---- nativeRebuildRequired ----
  // vrai si usage explicite de Gesture.* (hors simple import)
  const hasActiveGesture =
    a.content.includes("Gesture.") &&
    (/Gesture\.\w+\s*\(/.test(a.content) || /PanGestureHandler|TapGestureHandler|LongPressGestureHandler/.test(a.content));
  const nativeRebuildRequired = !!hasActiveGesture;

  // Cas spécial upload-video → forcer false (P1-6)
  if (name === "upload-video" && nativeRebuildRequired === false) {
    /* déjà ok grâce au hasActiveGesture strict */
  }

  // --- Écriture des 5 champs SEULEMENT ---
  const before = JSON.stringify({
    requiresComponents: json.requiresComponents,
    expoDependencies: json.expoDependencies,
    optionalExpoDependencies: json.optionalExpoDependencies,
    supportsGlass: json.supportsGlass,
    nativeRebuildRequired: json.nativeRebuildRequired,
  });

  json.requiresComponents = requiresComponents;
  json.expoDependencies = Array.from(expoDeps).sort();
  json.optionalExpoDependencies = Array.from(optExpoDeps).sort();
  json.supportsGlass = supportsGlass;
  json.nativeRebuildRequired = nativeRebuildRequired;

  const after = JSON.stringify({
    requiresComponents: json.requiresComponents,
    expoDependencies: json.expoDependencies,
    optionalExpoDependencies: json.optionalExpoDependencies,
    supportsGlass: json.supportsGlass,
    nativeRebuildRequired: json.nativeRebuildRequired,
  });

  if (before !== after) {
    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
    updated += 1;
    console.log(`✓ ${name}.json  — mis à jour`);
  } else {
    console.log(`  ${name}.json  — identique (skippé)`);
  }
}

// ---------------------------------------------------------------------------
// 4. Rapport final
// ---------------------------------------------------------------------------
console.log();
console.log(`✅ sync-registry terminé : ${updated} fichier(s) JSON modifié(s).`);

if (anomalies.length > 0) {
  console.log();
  console.log(`⚠  ${anomalies.length} anomalie(s) détectée(s) :`);
  for (const a of anomalies) console.log(`   - ${a.file} : ${a.reason}`);
}
