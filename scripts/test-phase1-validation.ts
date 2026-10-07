import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { isDefaultExpoTemplate } from "../packages/cli/src/core/project-detector.ts";
import {
  resetExpoProject,
  setupFoundations,
  setupStarterComponents,
  generateUiIndex,
  updateTsconfig,
  generateShowcaseScreen,
} from "../packages/cli/src/core/starter-generator.ts";

const SOURCE_ROOT = resolve("packages/ui-mobile");
const TEST_DIR = resolve("test-sandbox-phase1");

if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
mkdirSync(TEST_DIR, { recursive: true });

// ── Test 1 : Détection template standard Expo
console.log("\n1️⃣  Test de détection du template standard Expo...");
mkdirSync(join(TEST_DIR, "scripts"), { recursive: true });
writeFileSync(join(TEST_DIR, "scripts/reset-project.js"), "// reset");
mkdirSync(join(TEST_DIR, "app/(tabs)"), { recursive: true });
writeFileSync(join(TEST_DIR, "app/(tabs)/index.tsx"), "// tab");
mkdirSync(join(TEST_DIR, "components"), { recursive: true });
writeFileSync(join(TEST_DIR, "components/Collapsible.tsx"), "// collapsible");
writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify({ name: "test", dependencies: { expo: "~54.0.0", "react-native": "0.76.0" } }));

const detected = isDefaultExpoTemplate(TEST_DIR);
if (!detected) { console.error("❌ isDefaultExpoTemplate a échoué !"); process.exit(1); }
console.log("  ✅ isDefaultExpoTemplate détecte correctement le template officiel.");

// ── Test 2 : Reset du template
console.log("\n2️⃣  Test de resetExpoProject (nettoyage + structuration /src)...");
writeFileSync(join(TEST_DIR, "App.tsx"), "// old App.tsx");
writeFileSync(join(TEST_DIR, "components/ThemedText.tsx"), "// template");
mkdirSync(join(TEST_DIR, "constants"), { recursive: true });
writeFileSync(join(TEST_DIR, "constants/Colors.ts"), "// template");
mkdirSync(join(TEST_DIR, "hooks"), { recursive: true });
writeFileSync(join(TEST_DIR, "hooks/useColorScheme.ts"), "// template");

resetExpoProject(TEST_DIR);

const shouldBeGone = ["scripts/reset-project.js", "components/Collapsible.tsx", "App.tsx", "app/(tabs)"];
for (const f of shouldBeGone) {
  if (existsSync(join(TEST_DIR, f))) { console.error("❌ Résidu non nettoyé:", f); process.exit(1); }
}
const expectedDirs = ["src/app", "src/components/ui", "src/constants", "src/contexts", "src/stores", "src/lib/upload"];
for (const d of expectedDirs) {
  if (!existsSync(join(TEST_DIR, d))) { console.error("❌ Dossier /src manquant:", d); process.exit(1); }
}
console.log("  ✅ Reset complet, architecture /src en place.");

// ── Test 3 : tsconfig.json
console.log("\n3️⃣  Test updateTsconfig (@/* avec baseUrl)...");
updateTsconfig(TEST_DIR);
const tsconfig = JSON.parse(readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8"));
const paths = tsconfig.compilerOptions?.paths?.["@/*"];
const baseUrl = tsconfig.compilerOptions?.baseUrl;
if (baseUrl !== ".") { console.error("❌ baseUrl incorrect:", baseUrl); process.exit(1); }
if (!Array.isArray(paths)) { console.error("❌ @/* paths incorrect:", paths); process.exit(1); }
console.log("  ✅ tsconfig.json avec baseUrl='.' et @/* paths:", paths);

// ── Test 4 : setupFoundations dans /src
console.log("\n4️⃣  Test setupFoundations (copie dans /src)...");
setupFoundations(SOURCE_ROOT, TEST_DIR, "src/components/ui");
const foundationFiles = ["src/constants/theme.ts", "src/contexts/theme-context.tsx", "src/stores/theme-store.ts", "src/components/ui/text.tsx"];
for (const f of foundationFiles) {
  if (!existsSync(join(TEST_DIR, f))) { console.error("❌ Fichier fondation manquant:", f); process.exit(1); }
}
console.log("  ✅ Fondations copiées correctement sous /src.");

// ── Test 5 : index.ts dynamique
console.log("\n5️⃣  Test generateUiIndex (exports sélectifs)...");
const targetDir = join(TEST_DIR, "src/components/ui");
const installedComps = setupStarterComponents(SOURCE_ROOT, targetDir);
const indexContent = readFileSync(join(targetDir, "index.ts"), "utf-8");
if (!indexContent.includes('"./button"') || !indexContent.includes('"./card"')) {
  console.error("❌ index.ts ne contient pas les starters !"); process.exit(1);
}
const shouldNotHave = ['"./image"', '"./spacer"', '"./dot"', '"./slider"', '"./tabs"'];
for (const comp of shouldNotHave) {
  if (indexContent.includes(comp)) { console.error("❌ index.ts exporte un composant non installé:", comp); process.exit(1); }
}
console.log("  ✅ index.ts dynamique: exporte UNIQUEMENT les", installedComps.length, "composants installés.");

// ── Test 6 : Update index.ts après ajout d'un composant
console.log("\n6️⃣  Test mise à jour index.ts après rs-ui add...");
generateUiIndex(targetDir, [...installedComps, "actions-grid", "tabs"]);
const updated = readFileSync(join(targetDir, "index.ts"), "utf-8");
if (!updated.includes('ActionsGrid') || !updated.includes('TabsList')) {
  console.error("❌ index.ts pas mis à jour avec les nouveaux composants !"); process.exit(1);
}
console.log("  ✅ index.ts synchronisé avec les nouveaux composants: ActionsGrid, Tabs.");

// ── Test 7 : Showcase Screen avec bon chemin d'import
console.log("\n7️⃣  Test generateShowcaseScreen avec /src...");
generateShowcaseScreen(TEST_DIR, "src/components/ui");
const srcApp = join(TEST_DIR, "src/app");
if (!existsSync(join(srcApp, "_layout.tsx"))) { console.error("❌ src/app/_layout.tsx manquant !"); process.exit(1); }
if (!existsSync(join(srcApp, "index.tsx"))) { console.error("❌ src/app/index.tsx manquant !"); process.exit(1); }
const appIndex = readFileSync(join(srcApp, "index.tsx"), "utf-8");
if (!appIndex.includes('@/components/ui/showcase-screen')) {
  console.error("❌ Import showcase incorrect dans src/app/index.tsx:", appIndex); process.exit(1);
}
console.log("  ✅ Showcase configuré sous src/app/ avec import @/components/ui/showcase-screen.");

rmSync(TEST_DIR, { recursive: true, force: true });
console.log("\n🎉 === TOUS LES 7 TESTS DE VALIDATION PHASE 1 RÉUSSIS ! ===\n");
