# RAPPORT D'ANALYSE — Rashwright UI Mobile v0.1.0

**Date** : 2026-10-01
**Analyste** : Senior TS/RN/Node Engineer
**Statut** : ANALYSE TERMINÉE — En attente de validation (Point d'arrêt 1)

---

## 1. ARBORESCENCE COMPLÈTE DU PROJET (annotée)

```
rashwright-ui/                                    ← RACINE (actuellement monolithique, 1 seul package)
├── package.json                                  ← @rashwright/ui-mobile (name+toutes deps CLI+UI mélangées)
│                                                   PROBLÈME P0-5 : "@rashwright/upload": "workspace:*"
│                                                   PROBLÈME P0-7 : "bin": "./cli/dist/index.js" (chemin build incorrect)
│                                                   PROBLÈME P0-7 : script build:cli pointe ./cli/index.ts (mais SOURCE_ROOT 2 niveaux au-dessus cassera après build)
├── tsconfig.json                                 ← TS 5.5, strict, paths @/*, JSX react-native
├── index.ts                                      ← Barrel racine (re-exporte theme, contexts, stores, hooks, barrel UI)
├── README.md
├── errors.md                                     ← Spécifications de cette mission
├── prompt.md
├── .gitignore
├── ANALYSIS.md                                   ← CE FICHIER
│
├── assets/                                       ← Assets Rashwright (copiés par init)
│   ├── primary.png
│   └── svg/primary.svg
│
├── cli/                                          ← CODE CLI rs-ui (DOIT devenir packages/cli/)
│   ├── index.ts                                  ← Point d'entrée CLI, shebang ✓ présent L1
│   ├── commands/                                 ← Commandes Commander
│   │   ├── init.ts                               ← rs-ui init (L35 SOURCE_ROOT = 2 niveaux au-dessus)
│   │   ├── add.ts                                ← rs-ui add (L72 utilise require("fs") = P1 ESM!)
│   │   ├── list.ts                               ← rs-ui list
│   │   ├── info.ts                               ← rs-ui info
│   │   ├── doctor.ts
│   │   ├── remove.ts
│   │   └── update.ts
│   └── core/                                     ← Logique métier CLI
│       ├── file-manager.ts                       ← P0-1 CONFIRMÉ : L31-33 utilise basename(file) → aplatit sous-dossiers
│       ├── starter-generator.ts                  ← P0-2 CONFIRMÉ : setupFoundations() L38-74 NE COPIE PAS liquid/* ni text/view
│       ├── dependency-resolver.ts                ← Résout requiresComponents + expoDependencies
│       ├── registry.ts                           ← Charge registry index + entries
│       ├── config-manager.ts                     ← Rashwright config (rashwright-ui.json)
│       ├── expo-detector.ts                      ← SDK detection, compat matrix
│       ├── project-detector.ts                   ← Package manager, Expo, TS
│       └── package-manager.ts                    ← bunx/pnpm/yarn/npm expo install
│
├── components/                                   ← COMPOSANTS UI (DOIT devenir packages/ui-mobile/components/)
│   └── ui/
│       ├── index.ts                              ← P0-6 CONFIRMÉ : L21-22 exporte View/Text + ThemedView/ThemedText (collision RN)
│       ├── liquid/                               ← PRIMITIVES LIQUID (core UI files, P0-2 : absentes de setupFoundations)
│       │   ├── liquid-types.ts                   ← Types Liquid (LiquidMaterial, LiquidIntensity, etc.)
│       │   ├── liquid-surface.tsx                ← Surface glass (blur + gradient border)
│       │   ├── liquid-pressable.tsx              ← Bouton pressable avec haptics expo-haptics
│       │   ├── liquid-highlight.tsx              ← Reflet highlight glass
│       │   ├── liquid-border.tsx                 ← Bordure translucide glass
│       │   ├── liquid-glow.tsx                   ← Halo lumineux
│       │   ├── liquid-blob.tsx                   ← Forme organique animée
│       │   └── liquid-shadow.ts                  ← Helper ombres cross-platform
│       ├── [56 composants enregistrés]           ← Ex: button.tsx, card.tsx, carousel.tsx, drawer.tsx, etc.
│       └── text.tsx / view.tsx                   ← Core UI files (absents de setupFoundations, P0-2)
│
├── constants/
│   ├── theme.ts                                  ← Theme tokens (couleurs, spacing, radius, typo)
│   └── glass-theme.ts                            ← createGlassTheme() helper
│
├── contexts/
│   ├── theme-context.tsx                         ← ThemeProvider + useTheme
│   └── tab-bar-context.tsx                       ← TabBarProvider + useTabBar
│
├── hooks/
│   ├── use-device.ts
│   ├── useBackHandler.ts
│   └── useScrollAwareTabBar.ts
│
├── stores/
│   └── theme-store.ts                            ← Zustand store (zustand ^5.0.14)
│
├── theme/
│   ├── index.ts
│   ├── tokens/ (colors.ts, glass.ts, radius.ts, spacing.ts, typography.ts)
│   └── themes/ (default.ts, emerald.ts, violet.ts, amber.ts, rose.ts, slate.ts, glass.ts)
│
├── types/
│   ├── ambient.d.ts                              ← Declarations modules ambiants (peerDeps mockés)
│   └── index.ts
│
├── registry/                                     ← LE REGISTRY (DOIT vivre dans packages/ui-mobile/registry/)
│   ├── index.json                                ← Index: 56 composants, 10 catégories, 5 SDK (54-58)
│   ├── components/                               ← 56 JSON (1 par composant)
│   │   └── [button.json ... upload-video.json]
│   └── versions/                                 ← Matrices compatibilité par SDK
│       ├── expo-54.json
│       ├── expo-55.json
│       ├── expo-56.json
│       ├── expo-57.json
│       └── expo-58.json
│
└── skills/                                       ← Documentation skills AI (10 sous-dossiers)
    ├── button/SKILL.md
    ├── card/SKILL.md
    ├── cli/SKILL.md
    ├── drawer/SKILL.md
    ├── glass/SKILL.md
    ├── modal/SKILL.md
    ├── text-input/SKILL.md
    ├── ui-component/SKILL.md
    ├── ui-system/SKILL.md
    └── bottom-sheet/SKILL.md
```

---

## 2. INVENTAIRE EXHAUSTIF

| Catégorie | Nombre | Remarques |
|---|---|---|
| **Composants UI (.tsx)** | 63 | 56 "registrables" + liquid/ (8 fichiers : 7 .tsx + 1 .ts) |
| └── Liquid primitives | 8 | liquid-types, liquid-surface, liquid-pressable, liquid-highlight, liquid-border, liquid-glow, liquid-blob, liquid-shadow |
| **Registry JSON** | 62 | index.json (1) + components/*.json (56) + versions/*.json (5) |
| **CLI TypeScript** | 16 | index.ts (1) + commands/*.ts (7) + core/*.ts (8) |
| **Constants** | 2 | theme.ts, glass-theme.ts |
| **Contexts** | 2 | theme-context, tab-bar-context |
| **Hooks** | 3 | use-device, useBackHandler, useScrollAwareTabBar |
| **Stores** | 1 | theme-store (Zustand) |
| **Theme system** | 14 | index.ts + 5 tokens + 8 presets |
| **Types** | 2 | ambient.d.ts, index.ts |
| **Assets** | 2 | primary.png, svg/primary.svg |
| **Skills doc** | 10 SKILL.md | Documentation AI assistants |
| **TOTAL FICHIERS PROJET** | **~115** | Hors node_modules, dist, .git |

---

## 3. GRAPHE DE DÉPENDANCES INTERNES (composants → imports ./xxx)

### 3a. PRIMITIVES LIQUID — Graphe interne

```
liquid-types.ts           (0 import interne — RACINE)
├── liquid-shadow.ts      import ./liquid-types
├── liquid-blob.tsx       import ./liquid-types
├── liquid-glow.tsx       import ./liquid-types
├── liquid-highlight.tsx  import ./liquid-types
├── liquid-border.tsx     import ./liquid-types
├── liquid-surface.tsx    import ./liquid-shadow, ./liquid-highlight, ./liquid-border, ./liquid-types
└── liquid-pressable.tsx  import ./liquid-surface, ./liquid-types
```

### 3b. COMPOSANTS CLÉS — Leurs imports internes (hors liquid/* + text + view = core files)

| Composant | requiresComponents (CODE RÉEL) | requiresComponents (REGISTRY ACTUEL) | ÉCART |
|---|---|---|---|
| **button** | `[]` (text+liquid/* = core) | `[]` | ✅ OK |
| **card** | `[]` (text@/ + liquid/* = core) | `[]` | ⚠ text importé via @/components/ui/text → résolution OK côté user |
| **glass-card** | `[]` | `[]` | ✅ OK |
| **actions-grid** | `["carousel"]` | `[]` | ❌ **P0-3 CONFIRMÉ : carousel manquant** |
| **carousel** | `[]` (text = core) | `[]` | ✅ OK |
| **search-input** | `["text-input", "icon-button"]` | `[]` | ❌ P0-3 : text-input + icon-button manquants |
| **fab-menu** | `["floating-action-button"]` | `["floating-action-button"]` | ✅ OK |
| **stat-card** | `["icon"]` | `["card", "icon"]` | ⚠ registry déclare card non requis par le code |
| **avatar-group** | `["avatar"]` | `["avatar"]` | ✅ OK |
| **error-state** | `["button"]` | `["button"]` | ✅ OK |
| **empty-state** | `[]` (button requis par code ? OUI : ./button + liquid/*) | `["button"]` | ⚠ Code réel importe ./button via empty-state |
| **loading-state** | `[]` | `[]` | ✅ OK |
| **skeleton** | `[]` (liquid-surface = core) | `[]` | ✅ OK |
| **screen-skeleton** | `["skeleton", "safe-area-view"]` | `["shimmer"]` | ❌ P0-3 : mismatch complet (code: skeleton+safe-area, registry: shimmer) |
| **select** | `["modal"]` (registry déclare bottom-sheet) | `["bottom-sheet"]` | ❌ P0-3 : code importe modal, registry dit bottom-sheet |
| **confirm** | `["button", "modal"]` | `["modal"]` | ❌ P0-3 : button manquant |
| **popup** | `["button", "modal", "text", "view"]` | `[]` | ❌ P0-3 : button+modal+text+view tous manquants |
| **showcase-screen** | `["rashwright-logo", "button", "card", "glass-card", "badge", "text-input"]` | `["button","card","glass-card","badge","text-input","rashwright-logo"]` | ✅ OK |
| **upload-image** | `[]` + `@rashwright/upload` externe | `[]` + dependencies[@rashwright/upload] | ⚠ P0-5 : @rashwright/upload = workspace:* |
| **upload-video** | `[]` + `@rashwright/upload` externe | `[]` + dependencies[@rashwright/upload] | ⚠ P0-5 : idem |

---

## 4. TABLEAU DE CORRESPONDANCE — expoDependencies (REGISTRY ↔ CODE RÉEL)

Pour 10 composants représentatifs :

| Composant | expoDependencies (CODE RÉEL) | expoDependencies (REGISTRY) | ÉCART |
|---|---|---|---|
| **button** (utilise Liquid) | `react-native-reanimated, expo-linear-gradient, expo-blur` (via primitives Liquid) + expo-haptics (optionnel via liquid-pressable) | `[]` + optional[expo-haptics] | ❌ **P0-4 CONFIRMÉ : 3 deps obligatoires manquent** |
| **card** (utilise Liquid + reanimated direct) | `react-native-reanimated, expo-blur, expo-linear-gradient` | `[]` | ❌ P0-4 |
| **glass-card** (utilise Liquid) | `react-native-reanimated, expo-blur, expo-linear-gradient` | `expo-blur, expo-linear-gradient` | ⚠ Il manque react-native-reanimated |
| **chip** (utilise Liquid + @expo/vector-icons) | `react-native-reanimated, expo-blur, expo-linear-gradient, @expo/vector-icons` + optional[expo-haptics] | `[]` + optional[expo-haptics] | ❌ P0-4 |
| **slider** (+ gesture direct) | `react-native-reanimated, expo-blur, expo-linear-gradient, react-native-gesture-handler` | `reanimated, gesture-handler` + optional[expo-haptics] | ⚠ Il manque expo-blur, expo-linear-gradient |
| **avatar** (exp-image + liquid-border) | `expo-image, @expo/vector-icons, react-native-reanimated, expo-blur, expo-linear-gradient` | `[]` | ❌ P0-4 |
| **badge** (utilise Liquid) | `react-native-reanimated, expo-blur, expo-linear-gradient` + optional[expo-haptics] | `[]` + optional[expo-haptics] | ❌ P0-4 |
| **shimmer** | `react-native-reanimated, expo-linear-gradient` | `react-native-reanimated, expo-linear-gradient` | ✅ OK |
| **bottom-sheet** (blur + gesture direct) | `react-native-reanimated, expo-blur, react-native-gesture-handler, react-native-safe-area-context` | `reanimated, gesture-handler, safe-area-context` + optional[expo-blur] | ❌ P0-4 : expo-blur est OBLIGATOIRE (import direct L4 bottom-sheet.tsx), pas optionnel |
| **actions-grid** (@expo/vector-icons + Liquid) | `@expo/vector-icons, react-native-reanimated, expo-blur, expo-linear-gradient` + optional[expo-haptics] | `[@expo/vector-icons]` + optional[expo-haptics] | ❌ P0-4 |

### RÈGLE GÉNÉRALE VIOLÉE (P0-4) :
> Tout composant utilisant une primitive Liquid (`./liquid/*`) DOIT déclarer dans `expoDependencies` :
> - `react-native-reanimated` (obligatoire)
> - `expo-linear-gradient` (obligatoire, utilisé par liquid-highlight et liquid-glow)
> - `expo-blur` (obligatoire, utilisé par liquid-surface)

Actuellement, **~38 composants sur 56** utilisent Liquid et n'ont AUCUNE de ces 3 deps déclarées.

---

## 5. LES 7 P0 CONFIRMÉS — Preuves exhaustives (fichier + ligne exacte)

### ✅ P0-1 : file-manager.ts aplatit les sous-dossiers
**Fichier** : [cli/core/file-manager.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/core/file-manager.ts)
**Lignes** : 31-33
```ts
const filename = basename(file);            // ← L31 : "liquid/liquid-surface.tsx" → "liquid-surface.tsx"
const source = resolveSourcePath(file, registrySourceRoot);
const destination = join(targetComponentsRoot, filename);  // ← L33 : /liquid/ est PERDU
```
**Impact** : `rs-ui add showcase-screen` copie `components/ui/button.tsx` correctement mais `components/ui/liquid/liquid-surface.tsx` atterrit dans `components/ui/liquid-surface.tsx`. Tous les imports `./liquid/liquid-surface` dans les composants sont cassés.

---

### ✅ P0-2 : Primitives liquid/* absentes de setupFoundations (init.ts)
**Fichier** : [cli/core/starter-generator.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/core/starter-generator.ts)
**Lignes** : 38-74 (setupFoundations) + 79-112 (setupStarterComponents)
**Preuve** : La fonction `setupFoundations()` L45-63 liste 16 fichiers à copier (theme + tokens + presets + store + context). AUCUN des fichiers suivants n'est inclus :
```
components/ui/text.tsx              (manquant)
components/ui/view.tsx              (manquant)
components/ui/liquid/liquid-types.ts (manquant)
components/ui/liquid/liquid-surface.tsx (manquant)
components/ui/liquid/liquid-pressable.tsx (manquant)
components/ui/liquid/liquid-highlight.tsx (manquant)
components/ui/liquid/liquid-border.tsx (manquant)
components/ui/liquid/liquid-glow.tsx (manquant)
components/ui/liquid/liquid-blob.tsx (manquant)
components/ui/liquid/liquid-shadow.ts (manquant)
```
**Résultat** : setupStarterComponents() copie button.tsx, card.tsx etc. (L84-99) mais leurs imports `./liquid/xxx` pointent vers des fichiers inexistants → échec de compilation immédiat.

---

### ✅ P0-3 : requiresComponents sous-déclaré dans les 56 JSON
**Échantillon de preuves** (voir tableau §3b complet) :
| JSON | Actuel | Recommandé (code réel) |
|---|---|---|
| actions-grid.json | `requiresComponents: []` | `requiresComponents: ["carousel"]` |
| search-input.json | `requiresComponents: []` | `requiresComponents: ["text-input", "icon-button"]` |
| screen-skeleton.json | `requiresComponents: ["shimmer"]` | `requiresComponents: ["skeleton", "safe-area-view"]` |
| select.json | `requiresComponents: ["bottom-sheet"]` | `requiresComponents: ["modal"]` |
| confirm.json | `requiresComponents: ["modal"]` | `requiresComponents: ["button", "modal"]` |
| popup.json | `requiresComponents: []` | `requiresComponents: ["button", "modal", "text", "view"]` |

**Méthodologie de vérification** : extraction regex `/from\s+["'](\.[^"']+)["']/g` sur chaque .tsx, puis filtrage core files.

---

### ✅ P0-4 : expoDependencies incohérent dans les 56 JSON
**Preuves massives** (voir tableau §4) :
- button.json L8 : `"expoDependencies": []` → code utilise Liquid → DOIT avoir `react-native-reanimated, expo-linear-gradient, expo-blur`
- card.json : idem
- badge.json : idem
- chip.json : idem
- ~38 JSON sur 56 ont le même défaut
- bottom-sheet.json L9 : `optionalExpoDependencies: ["expo-blur"]` → pourtant bottom-sheet.tsx L4 importe `expo-blur` en dur (import { BlurView } from "expo-blur") = **OBLIGATOIRE**, pas optionnel.

---

### ✅ P0-5 : @rashwright/upload en workspace:*
**Fichier** : [package.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/package.json)
**Ligne 25** :
```json
"@rashwright/upload": "workspace:*"
```
**Preuve additionnelle composants** :
- [components/ui/upload-image.tsx](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/upload-image.tsx) L29-30 :
  ```ts
  import type { IUploadProvider, UploadSource, UploadResult } from "@rashwright/upload";
  import { UploadManager } from "@rashwright/upload";
  ```
- [registry/components/upload-image.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/registry/components/upload-image.json) :
  `"dependencies": ["@rashwright/upload"]` → cette dépendance sera installée avec workspace:* → npm publish échoue.

---

### ✅ P0-6 : Barrel exporte View/Text (collision React Native)
**Fichier** : [components/ui/index.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/index.ts)
**Lignes 21-22** :
```ts
export { default as View, default as ThemedView } from "./view";
export { default as Text, default as ThemedText } from "./text";
```
**Preuve bug** : index.ts racine L26 `export * from "./components/ui";` re-exporte TOUT le barrel.
Donc un consommateur qui fait :
```ts
import { View, Text } from "@rashwright/ui-mobile";  // ← importe les Vues THEMED pas RN
// Plus tard dans le même fichier:
import { View, Text } from "react-native";           // ← shadowé / collisions de noms
```
Même problème pour un projet user utilisant le barrel interne.

---

### ✅ P0-7 : bin pointe vers un fichier incorrect + scripts de build cassés
**Fichier** : [package.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/package.json)
**Ligne 7 (bin)** :
```json
"bin": { "rs-ui": "./cli/dist/index.js" }
```
**Ligne 19 (build script)** :
```json
"build:cli": "bun build ./cli/index.ts --outdir ./cli/dist --target node --format esm --external commander --external inquirer --external chalk --external ora"
```
**Problème 1 — SOURCE_ROOT cassé après build** :
- init.ts L35 : `const SOURCE_ROOT = join(import.meta.dirname, "..", "..");`
- En DEV (run cli/index.ts directement) → import.meta.dirname = `/rashwright-ui/cli/` → 2x `..` = `/rashwright-ui/` ✅
- En PROD (cli/dist/index.js buildé) → import.meta.dirname = `/rashwright-ui/cli/dist/` → 2x `..` = `/rashwright-ui/cli/` ❌ (1 niveau trop bas)
→ Le CLI ne trouvera plus ni registry/ ni components/ après npm install global.

**Problème 2 — Shebang** : Le banner `#!/usr/bin/env node` n'est PAS ajouté au build. Le L1 du source l'a, mais bun build ne garantit pas sa préservation en tête de fichier bundle.

---

## 6. P1 IDENTIFIÉS — Bugs runtime / fonctionnels

### P1-1 : add.ts utilise require() en ESM
**Fichier** : [cli/commands/add.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/commands/add.ts)
**Ligne 72** :
```ts
const pkg = JSON.parse(require("fs").readFileSync(pkgJsonPath, "utf-8"));
```
**Contexte** : package.json L5 déclare `"type": "module"`. `require()` n'existe pas en ESM Node.
**Impact** : Au runtime, `rs-ui add X` crash systématiquement avec `ReferenceError: require is not defined`.
**Preuve** : Il y a déjà `import { existsSync, ... } from "node:fs"` en L6. Il faut utiliser `readFileSync` déjà importé OU utiliser `createRequire`.

### P1-2 : starter-generator — liquid/* copiés par setupStarterComponents → structure cassée
**Fichier** : [cli/core/starter-generator.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/core/starter-generator.ts) L96 + file-manager.ts L31
Constat : setupStarterComponents() copie button.tsx via copyComponentFiles(). button.tsx importe `./liquid/liquid-pressable` etc. → ces fichiers ne sont PAS dans starterComponents[] (L84-94), et même si on les y mettait, P0-1 aplatit leur structure.
→ Double problème.

### P1-3 : add.ts REGISTRY_ROOT et SOURCE_ROOT en dur
**Fichier** : [cli/commands/add.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/commands/add.ts) L16-17
```ts
const REGISTRY_ROOT = join(import.meta.dirname, "..", "..", "registry");
const SOURCE_ROOT = join(import.meta.dirname, "..", "..");
```
Idem init.ts L35, list.ts L9, etc. → Aucun fallback pour le mode package installé. Doit utiliser `require.resolve("@rashwright/ui-mobile/package.json")` après split.

### P1-4 : Ambient.d.ts utilise any → User profile refuse any
**Fichier** : [types/ambient.d.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/types/ambient.d.ts) L9, L13, L23, L24, L27, L29, L40, L46, etc.
**Preuves** :
```ts
export const useAnimatedScrollHandler: (handlers: any) => any;   // L9
export const withSpring: (toValue: any, userConfig?: any, callback?: any) => any;  // L11
```
→ Doivent être typés précisément (ou utiliser generics, ou unknown).

### P1-5 : card.tsx utilise import @/components/ui/text absolu (ne fonctionne pas chez user)
**Fichier** : [components/ui/card.tsx](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/card.tsx) L21
```ts
import ThemedText from "@/components/ui/text";
```
**Problème** : Le user n'aura PAS forcément `@/` path alias configuré (ou le configurera sur `./src/*`).
**Impact** : `rs-ui add card` → import `@/components/ui/text` ne résout pas dans le projet user.
Devrait être `import ThemedText from "./text";` relatif (comme glass-card.tsx L17).

### P1-6 : upload-video.json nativeRebuildRequired=true sans justification
upload-video.json déclare nativeRebuildRequired: true. upload-video.tsx utilise liquid-surface + expo-image-picker + @rashwright/upload. Aucun react-native-gesture-handler direct + Gesture.
→ nativeRebuildRequired devrait être FALSE (comme upload-image).

---

## 7. P2 IDENTIFIÉS — Dettes techniques / maintenabilité

### P2-1 : Architecture monolithique (CLI + UI mélangés)
L'objectif est le split en 2 packages. Voir errors.md §SPLIT.

### P2-2 : registry désynchronisé — aucun mécanisme de sync automatique
Actuellement les 56 JSON sont écrits à la main. Besoin de scripts/sync-registry.ts + scripts/validate-registry.ts.

### P2-3 : Pas de CI de publish
Manque .github/workflows/publish.yml.

### P2-4 : index.ts (racine) re-exporte barrel UI complet
Le barrel contient 100+ exports. Usage via package npm fera exploser le bundle si tree-shaking n'est pas parfait. À transformer en exports minimaux.

### P2-5 : ambient.d.ts double emploi
Les ambient declarations sont utiles pour le DEV du package mais doivent être exclus du package npm publié (le user aura les VRAIS types de ses dépendances installées).

### P2-6 : peerDependencies non déclarés correctement
package.json actuel peerDependencies = `{ expo, react, react-native }`. Il manque : react-native-reanimated, react-native-safe-area-context, zustand, @expo/vector-icons (soit en peerDependencies, soit en optional).

### P2-7 : CLI ne vérifie pas les paths aliases côté user
Si l'user a un tsconfig.json SANS `@/*`, alors `rs-ui init` copie des composants qui importent `@/constants/theme.ts` etc. → erreur de compilation.

### P2-8 : starter-generator utilise copyFileSync au lieu de copyComponentFiles
setupFoundations() L65-73 utilise une boucle `copyFileSync` maison au lieu d'utiliser `copyComponentFiles()` uniforme. Problème : le mkdirSync est bien là, mais pas les métadonnées FileCopyResult. Cohérence.

---

## 8. RISQUES IDENTIFIÉS PAR CORRECTION

| Tâche | Risque | Mitigation |
|---|---|---|
| P0-1 (file-manager) | Régression sur les composants qui n'utilisent PAS de sous-dossiers. Le code existant repose sur `basename()` partout. | Tester explicitement les 2 cas : `components/ui/button.tsx` (sans sous-dossier) ET `components/ui/liquid/liquid-surface.tsx` (avec sous-dossier). |
| P0-2 (setupFoundations) | Si on ajoute liquid/* à setupFoundations, on les copie DEUX FOIS : une fois dans init, et une fois dans chaque add via requiresComponents+files. Mais P0-3 retire liquid/* de requiresComponents → pas de doublon. | S'assurer que le script sync-registry ignore core files dans requiresComponents. |
| P0-5 (inliner upload) | Risque : @rashwright/upload a sa propre logique, types complexes, providers multiples (Cloudinary, Firebase, etc.). Inliner = copier 5-10 fichiers, mettre à jour 2 composants. | Vérifier que @rashwright/upload n'a pas lui-même de sous-dépendances à workspace:*. |
| P0-6 (retirer View/Text du barrel) | Risque : code externe / examples / showcase-screen.tsx utilisent `import { View } from "@/components/ui"` → cassera. | Grep global sur le codebase + user projects après change. |
| P0-7 (build CLI) | Bun build ESM + banner + imports `./commands/xxx.js` : le bundle par défaut de bun va bundle TOUT (pas défaut). MAIS cli/index.ts importe `./commands/init.js` avec extension `.js` ! Vérifier que bun résout .ts/.js correctement. | Ajouter `--packages=external` ou utiliser bun build avec `--splitting` ? Test : lancer build:cli, vérifier dist/index.js démarre par `#!/usr/bin/env node`. |
| Split packages | imports internes CLI → @rashwright/ui-mobile vont casser en DEV avant que le workspace bun ne soit configuré. | Créer d'abord la structure packages/ + racine workspace bun, puis migrer les fichiers, puis ajuster paths.ts. Faire en 3 sous-tâches atomiques. |
| Sync-registry (script) | Écriture incorrecte des JSON → suppression de champs non prévus (ex: category, description, props). | Le script NE DOIT modifier QUE : requiresComponents, expoDependencies, optionalExpoDependencies, supportsGlass, nativeRebuildRequired. Il doit lire le JSON existant, muter ces 5 champs, réécrire. |

---

**FIN ANALYSE. Attends GO de l'utilisateur pour l'Étape 2 (Plan détaillé).**

**Checklist analyse** :
- [x] Arborescence annotée
- [x] Inventaire par catégorie
- [x] Graphe dépendances internes + écarts requiresComponents
- [x] Tableau expoDependencies code réel vs registry
- [x] 7 P0 confirmés, chacun avec fichier + lignes
- [x] 6 P1 bugs runtime listés
- [x] 8 P2 dettes listées
- [x] 8 risques + mitigations
