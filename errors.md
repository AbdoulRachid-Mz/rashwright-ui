# MISSION

Tu es un ingénieur senior TypeScript/React Native/Node.js. Tu vas refondre le projet **Rashwright UI Mobile** (CLI `rs-ui` + registry + composants RN/Expo) pour le rendre **publiable sur npm** et **fonctionnel chez l'utilisateur final**.

Le projet est actuellement en 0.1.0 et souffre de 7 problèmes bloquants (P0), d'une architecture monolithique (CLI + lib dans un seul package), et d'un registry désynchronisé du code réel.

## OBJECTIFS

1. **Corriger les 7 P0** (bloquants pour `rs-ui add` et pour npm publish).
2. **Splitter le projet en 2 packages npm** : `@rashwright/cli` (Node) + `@rashwright/ui-mobile` (registry + composants).
3. **Régénérer automatiquement les 56 JSON du registry** à partir des imports réels des composants.

## MÉTHODE OBLIGATOIRE

Tu dois suivre **strictement** ces 4 étapes dans l'ordre :

### ÉTAPE 1 — ANALYSE APPROFONDIE (ne rien modifier)

Avant toute modification, tu dois :

1. **Lire l'intégralité du projet** :
   - `package.json`, `tsconfig.json`, `bunfig.toml`, `metro.config.js`, `babel.config.js`
   - `cli/src/**/*.ts` (toutes les commandes + core)
   - `components/ui/**/*.tsx` (tous les composants + primitives liquid)
   - `constants/**/*.ts`, `contexts/**/*.tsx`, `hooks/**/*.ts`, `stores/**/*.ts`, `theme/**/*.ts`
   - `registry/index.json` + `registry/components/*.json` + `registry/versions/*.json`
   - `types/ambient.d.ts`, `types/index.ts`
   - `SKILL.md`, `README.md`, `skills/**/*.md`

2. **Produire un rapport d'analyse** structuré contenant :
   - **Arborescence complète** du projet (avec annotations)
   - **Inventaire** : nb de fichiers par catégorie, nb de composants, nb de JSON
   - **Graphe de dépendances** : pour chaque composant, liste des imports internes (`./xxx`, `../xxx`, `./liquid/xxx`)
   - **Tableau de correspondance** `registry JSON ↔ code réel` : pour chaque composant, comparer `requiresComponents`, `expoDependencies`, `supportsGlass`, `nativeRebuildRequired` avec ce que le code importe/utilise réellement
   - **Liste exhaustive des 7 P0** confirmés avec preuves (fichier + ligne)
   - **Liste exhaustive des P1** (bugs runtime) avec preuves
   - **Liste exhaustive des P2** (dettes) avec preuves
   - **Risques identifiés** pour chaque correction

3. **NE RIEN MODIFIER** à cette étape. Tu produis uniquement le rapport.

**⏸️ Point d'arrêt 1** : présente le rapport à l'utilisateur et attends validation avant de passer à l'étape 2.

---

### ÉTAPE 2 — PLAN DÉTAILLÉ

À partir du rapport validé, tu produis un **plan d'exécution** avec :

1. **Liste ordonnée des tâches** (du plus critique au moins critique), chacune avec :
   - **ID** (ex: `P0-1`, `P0-2`, ..., `SPLIT-1`, `REG-1`)
   - **Titre court**
   - **Fichiers impactés** (chemins exacts)
   - **Description précise** de la modification
   - **Critère de succès** (comment on sait que c'est fait)
   - **Dépendances** (quelles tâches doivent être faites avant)
   - **Estimation** (S/M/L)

2. **Ordre d'exécution recommandé** avec justification :
   - Pourquoi cette tâche avant celle-là
   - Quels regroupements sont logiques (ex: faire tous les fixes CLI ensemble)

3. **Stratégie de test** :
   - Comment vérifier que `rs-ui add button` fonctionne après les fixes
   - Comment vérifier que le registry est cohérent
   - Comment vérifier que le split packages ne casse rien
   - Commandes exactes à exécuter

4. **Stratégie de rollback** :
   - Comment revenir en arrière si une tâche casse quelque chose
   - Quels commits atomiques faire

5. **Risques et mitigations** par tâche

**⏸️ Point d'arrêt 2** : présente le plan à l'utilisateur et attends validation avant de commencer l'exécution.

---

### ÉTAPE 3 — EXÉCUTION PROGRESSIVE

Tu exécutes les tâches **une par une**, dans l'ordre validé. Après **chaque tâche** :

1. Tu marques la tâche comme `[x]` dans le fichier de suivi (voir ci-dessous).
2. Tu affiches un **rapport de tâche** :
   ```
   ✅ TASK P0-1 terminée
   Fichiers modifiés : 
     - cli/src/core/file-manager.ts (+45 -12)
   Tests effectués :
     - bun run check-types → 0 erreur
     - bun test file-manager.test.ts → 5/5 pass
   Critère de succès : ✅ vérifié
   Prochaine tâche : P0-2
   ```
3. Tu attends un **GO** explicite de l'utilisateur avant de passer à la suivante (sauf si l'utilisateur a dit "mode auto").

**Fichier de suivi** : tu maintiens un fichier `TASKS.md` à la racine avec :

```markdown
# Rashwright UI Mobile — Refonte P0 + Split + Registry

## Progression globale
- [ ] ÉTAPE 1 — Analyse
- [ ] ÉTAPE 2 — Plan
- [ ] ÉTAPE 3 — Exécution
  - [ ] P0-1 : ...
  - [ ] P0-2 : ...
  - ...
  - [ ] SPLIT-1 : ...
  - [ ] REG-1 : ...
- [ ] ÉTAPE 4 — Validation finale

## Journal
- 2025-XX-XX : Analyse terminée, 7 P0 confirmés
- 2025-XX-XX : Plan validé
- 2025-XX-XX : P0-1 terminée
- ...
```

---

### ÉTAPE 4 — VALIDATION FINALE

Une fois toutes les tâches terminées :

1. **Exécuter la suite de validation** :
   - `bun run check-types` → 0 erreur
   - `bun test` → tous les tests passent
   - `bun run build:cli` → dist généré
   - `bun run validate-registry` → 0 erreur
   - Test manuel : créer un projet Expo vide, `rs-ui init`, `rs-ui add button card drawer`, vérifier que tout compile
   - Test publish dry-run : `npm publish --dry-run` sur les 2 packages

2. **Produire un rapport final** :
   - Toutes les tâches ✅
   - Liste des fichiers créés/modifiés/supprimés
   - Commandes de test exécutées avec résultats
   - Checklist de publish npm
   - Instructions pour publier

---

## DÉTAIL DES 7 P0 À CORRIGER

### P0-1 — `file-manager.ts` aplatit les sous-dossiers

**Problème** : `copyComponentFiles()` utilise `basename(file)` → `components/ui/liquid/liquid-surface.tsx` est copié dans `targetComponentsRoot/liquid-surface.tsx` au lieu de `targetComponentsRoot/liquid/liquid-surface.tsx`.

**Impact** : `rs-ui add button` → le projet user ne compile pas (imports `./liquid/liquid-surface` cassés).

**Solution** : préserver la structure relative depuis `components/ui/` :
```ts
const relative = file.replace(/^components\/ui\//, "");
const destination = join(targetComponentsRoot, relative);
```
Créer les dossiers intermédiaires avec `mkdirSync(dir, { recursive: true })`.

**Fichier** : `cli/src/core/file-manager.ts`

**Critère de succès** : après `rs-ui add button`, le fichier `components/ui/liquid/liquid-surface.tsx` existe dans le projet user.

---

### P0-2 — Primitives `liquid/*` absentes du registry

**Problème** : `rs-ui add button` copie `button.tsx` mais pas `liquid/liquid-surface.tsx`, `liquid/liquid-pressable.tsx`, `liquid/liquid-highlight.tsx`, `liquid/liquid-border.tsx`, `liquid/liquid-glow.tsx`, `liquid/liquid-blob.tsx`, `liquid/liquid-shadow.ts`, `liquid/liquid-types.ts`.

**Impact** : projet user ne compile pas.

**Solution** : traiter ces fichiers comme **core UI files** toujours copiés par `init.ts` via `setupFoundations()` (dans `cli/src/core/starter-generator.ts`).

Ajouter à `starter-generator.ts` :
```ts
const coreUiFiles = [
  "components/ui/text.tsx",
  "components/ui/view.tsx",
  "components/ui/liquid/liquid-types.ts",
  "components/ui/liquid/liquid-surface.tsx",
  "components/ui/liquid/liquid-pressable.tsx",
  "components/ui/liquid/liquid-highlight.tsx",
  "components/ui/liquid/liquid-border.tsx",
  "components/ui/liquid/liquid-glow.tsx",
  "components/ui/liquid/liquid-blob.tsx",
  "components/ui/liquid/liquid-shadow.ts",
];
```
Et les copier dans `setupFoundations()` (ou nouvelle fonction `setupCoreUi()`).

**Fichiers** : `cli/src/core/starter-generator.ts`, `cli/src/commands/init.ts`

**Critère de succès** : après `rs-ui init`, le projet user contient `components/ui/liquid/*` et `components/ui/text.tsx` + `view.tsx`.

---

### P0-3 — `requiresComponents` sous-déclaré (56 JSON)

**Problème** : les JSON du registry ne listent pas les composants réellement requis (ex: `button.json` a `requiresComponents: []` alors que `button.tsx` importe `./text`, `./liquid/liquid-pressable`, etc.).

**Impact** : `rs-ui add actions-grid` n'installe pas `carousel` ni `text`.

**Solution** : écrire un **script d'analyse** `scripts/sync-registry.ts` qui :
1. Lit chaque `.tsx` dans `components/ui/`
2. Extrait les imports internes via regex/AST (`./xxx`, `../xxx`, `./liquid/xxx`)
3. Convertit chaque import en nom de composant registry (ex: `./text` → `text`, `./liquid/liquid-surface` → **core file**, pas un composant)
4. Met à jour `requiresComponents` dans le JSON correspondant
5. Ignore les imports de primitives `liquid/*` (car core files)
6. Ignore les imports de `text.tsx`, `view.tsx` (core files)

**Fichier** : `scripts/sync-registry.ts` (nouveau)

**Critère de succès** : après exécution, `button.json` a `requiresComponents: []` (car `text` est core), mais `actions-grid.json` a `requiresComponents: ["carousel"]`.

---

### P0-4 — `expoDependencies` incohérent (56 JSON)

**Problème** : les `expoDependencies` ne reflètent pas les imports réels (ex: `button.json` a `[]` alors que `button.tsx` utilise `react-native-reanimated`, `expo-linear-gradient`).

**Impact** : `rs-ui add button` n'installe pas `react-native-reanimated` → crash runtime.

**Solution** : même script `sync-registry.ts` :
1. Détecte les imports externes dans chaque `.tsx` : `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, `expo-haptics`, `expo-image`, `expo-image-picker`, `expo-image-manipulator`, `expo-video`, `@expo/vector-icons`, `react-native-safe-area-context`, `react-native-gesture-handler`, `@rashwright/upload`
2. Met à jour `expoDependencies` (deps non-optionnelles) et `optionalExpoDependencies` (deps optionnelles comme `expo-haptics`)
3. Règle : `react-native-reanimated` est **toujours** en `expoDependencies` si le composant utilise une primitive Liquid

**Fichier** : `scripts/sync-registry.ts`

**Critère de succès** : `button.json` a `expoDependencies: ["react-native-reanimated", "expo-linear-gradient"]`.

---

### P0-5 — `@rashwright/upload` en `workspace:*`

**Problème** : `package.json` déclare `"@rashwright/upload": "workspace:*"` → non publiable sur npm.

**Impact** : `npm publish` échoue.

**Solution** : **inliner** `@rashwright/upload` dans `packages/ui-mobile/upload/` :
- Copier le code source de `@rashwright/upload` dans `components/ui/upload/` (ou `lib/upload/`)
- Remplacer les imports `@rashwright/upload` par des imports relatifs `../../lib/upload`
- Mettre à jour `upload-image.json` et `upload-video.json` pour retirer la dep `@rashwright/upload` et ajouter `requiresComponents: []`
- OU si `@rashwright/upload` doit rester séparé, le publier d'abord sur npm et mettre `"^0.1.0"` dans les deps

**Décision** : **inliner** (plus simple pour un premier publish).

**Fichiers** : `components/ui/upload-image.tsx`, `components/ui/upload-video.tsx`, `lib/upload/*` (nouveau), `registry/components/upload-image.json`, `registry/components/upload-video.json`

**Critère de succès** : `npm publish --dry-run` ne montre plus `workspace:*`.

---

### P0-6 — Barrel exporte `View`/`Text` (collision RN)

**Problème** : `components/ui/index.ts` contient :
```ts
export { default as View, default as ThemedView } from "./view";
export { default as Text, default as ThemedText } from "./text";
```
→ `import { View } from "@/components/ui"` écrase le `View` de React Native.

**Impact** : confusion, bugs subtils.

**Solution** : retirer les exports `View` et `Text` (garder uniquement `ThemedView` et `ThemedText`) :
```ts
export { default as ThemedView } from "./view";
export { default as ThemedText } from "./text";
```
ET : **ne pas publier `components/ui/index.ts` dans le package npm** (le barrel est uniquement pour usage interne / dev). Les composants sont copiés par le CLI, pas importés.

**Fichier** : `components/ui/index.ts`

**Critère de succès** : plus aucune collision de noms avec RN dans le barrel.

---

### P0-7 — `bin` pointe vers un fichier inexistant

**Problème** : `package.json` a `"bin": { "rs-ui": "./cli/dist/index.js" }` mais le source est `cli/src/index.ts`. Le script `build:cli` fait `bun build ./cli/index.ts` (mauvais chemin).

**Impact** : `bun run build:cli` échoue, `rs-ui` n'est pas exécutable après install.

**Solution** : dans le nouveau `packages/cli/package.json` :
```json
"bin": { "rs-ui": "./dist/index.js" },
"scripts": {
  "build": "bun build ./src/index.ts --outdir ./dist --target node --format esm --external commander --external inquirer --external chalk --external ora",
  "prepublishOnly": "bun run build"
}
```
Vérifier que le shebang `#!/usr/bin/env node` est **préservé** par le build (utiliser `--banner` si nécessaire).

**Fichier** : `packages/cli/package.json` (nouveau), `packages/cli/src/index.ts`

**Critère de succès** : après `bun run build`, `dist/index.js` existe et commence par `#!/usr/bin/env node`, et `node dist/index.js --help` fonctionne.

---

## DÉTAIL DU SPLIT EN 2 PACKAGES

### Structure cible

```
rashwright-ui/
├── package.json                    (racine, workspace bun)
├── TASKS.md                        (suivi)
├── README.md
├── LICENSE
├── CHANGELOG.md
├── tsconfig.base.json
├── .github/workflows/publish.yml
│
├── packages/
│   ├── ui-mobile/                  → @rashwright/ui-mobile
│   │   ├── package.json
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── index.ts        (barrel interne, PAS publié)
│   │   │       ├── button.tsx
│   │   │       ├── ...
│   │   │       └── liquid/
│   │   ├── constants/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── theme/
│   │   ├── types/
│   │   ├── assets/
│   │   ├── registry/               ← LE REGISTRY VIT ICI
│   │   │   ├── index.json
│   │   │   ├── components/*.json
│   │   │   └── versions/expo-*.json
│   │   ├── skills/
│   │   ├── lib/upload/             (inliné)
│   │   └── index.ts                (exports publics minimaux)
│   │
│   └── cli/                        → @rashwright/cli
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── commands/*.ts
│       │   └── core/
│       │       ├── paths.ts        (nouveau, centralisé)
│       │       ├── registry.ts
│       │       ├── ...
│       │       └── ...
│       ├── dist/                   (build)
│       └── tsconfig.json
│
└── scripts/
    ├── sync-registry.ts            (nouveau)
    └── validate-registry.ts        (nouveau)
```

### `packages/ui-mobile/package.json`

```json
{
  "name": "@rashwright/ui-mobile",
  "version": "0.1.0",
  "description": "Rashwright UI Mobile — Composants React Native / Expo distribuables",
  "license": "MIT",
  "author": "Rashwright",
  "repository": { "type": "git", "url": "git+https://github.com/rashwright/rashwright-ui.git" },
  "keywords": ["react-native", "expo", "ui", "components", "shadcn", "liquid-glass", "registry"],
  "type": "module",
  "sideEffects": false,
  "files": [
    "components/**",
    "constants/**",
    "contexts/**",
    "hooks/**",
    "stores/**",
    "theme/**",
    "types/**",
    "assets/**",
    "registry/**",
    "skills/**",
    "lib/**",
    "index.ts",
    "README.md"
  ],
  "peerDependencies": {
    "expo": ">=54.0.0",
    "react": ">=18.3.0",
    "react-native": ">=0.73.0",
    "react-native-reanimated": ">=3.0.0",
    "react-native-safe-area-context": ">=4.0.0",
    "zustand": ">=5.0.0"
  },
  "peerDependenciesMeta": {
    "react-native-reanimated": { "optional": true },
    "react-native-safe-area-context": { "optional": true },
    "zustand": { "optional": true }
  }
}
```

### `packages/cli/package.json`

```json
{
  "name": "@rashwright/cli",
  "version": "0.1.0",
  "description": "CLI rs-ui pour Rashwright UI Mobile",
  "license": "MIT",
  "author": "Rashwright",
  "repository": { "type": "git", "url": "git+https://github.com/rashwright/rashwright-ui.git" },
  "type": "module",
  "engines": { "node": ">=20.11.0" },
  "bin": { "rs-ui": "./dist/index.js" },
  "files": ["dist/**", "README.md"],
  "scripts": {
    "build": "bun build ./src/index.ts --outdir ./dist --target node --format esm --external commander --external inquirer --external chalk --external ora --banner '#!/usr/bin/env node'",
    "dev": "bun run --watch src/index.ts",
    "prepublishOnly": "bun run build && bun run check-types",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@rashwright/ui-mobile": "^0.1.0",
    "chalk": "^5.3.0",
    "commander": "^12.1.0",
    "inquirer": "^12.5.0",
    "ora": "^8.1.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.5.0"
  }
}
```

### `paths.ts` centralisé (nouveau)

Remplacer tous les `join(import.meta.dirname, "..", "..", "registry")` par :

```ts
// packages/cli/src/core/paths.ts
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Résoudre la racine de @rashwright/ui-mobile (où vit le registry)
const uiMobilePkgPath = require.resolve("@rashwright/ui-mobile/package.json");
export const UI_MOBILE_ROOT = dirname(uiMobilePkgPath);
export const REGISTRY_ROOT = join(UI_MOBILE_ROOT, "registry");
export const SOURCE_ROOT = UI_MOBILE_ROOT;
export const PACKAGE_ROOT = join(__dirname, "..", "..");
```

**Attention** : en dev (avant publish), `@rashwright/ui-mobile` n'est pas dans `node_modules`. Il faut un fallback :
```ts
let UI_MOBILE_ROOT: string;
try {
  UI_MOBILE_ROOT = dirname(require.resolve("@rashwright/ui-mobile/package.json"));
} catch {
  // Fallback dev : monorepo
  UI_MOBILE_ROOT = join(__dirname, "..", "..", "..", "ui-mobile");
}
```

---

## DÉTAIL DE LA RÉGÉNÉRATION DES 56 JSON

### Script `scripts/sync-registry.ts`

**Entrées** :
- `packages/ui-mobile/components/ui/*.tsx` (les composants)
- `packages/ui-mobile/registry/components/*.json` (les JSON à mettre à jour)

**Sorties** :
- JSON mis à jour avec `requiresComponents`, `expoDependencies`, `optionalExpoDependencies`, `supportsGlass`, `nativeRebuildRequired`

**Algorithme** :

```ts
// 1. Pour chaque composant .tsx
for (const file of componentFiles) {
  const name = basename(file, ".tsx"); // "button"
  const content = readFileSync(file, "utf-8");

  // 2. Extraire les imports internes
  const internalImports = extractInternalImports(content);
  // ex: ["./text", "./liquid/liquid-surface", "./card"]

  // 3. Filtrer les core files (text, view, liquid/*)
  const CORE_FILES = new Set([
    "text", "view",
    "liquid/liquid-types", "liquid/liquid-surface", "liquid/liquid-pressable",
    "liquid/liquid-highlight", "liquid/liquid-border", "liquid/liquid-glow",
    "liquid/liquid-blob", "liquid/liquid-shadow",
  ]);
  const requiredComponents = internalImports
    .map(imp => imp.replace(/^\.\//, "").replace(/\.tsx?$/, ""))
    .filter(imp => !CORE_FILES.has(imp))
    .filter(imp => imp !== name); // pas d'auto-référence

  // 4. Extraire les imports externes
  const externalImports = extractExternalImports(content);
  // ex: ["react-native-reanimated", "expo-linear-gradient", "@expo/vector-icons"]

  // 5. Classifier expo deps
  const EXPO_PKGS = ["expo-blur", "expo-linear-gradient", "expo-haptics",
                     "expo-image", "expo-image-picker", "expo-image-manipulator",
                     "expo-video", "expo-device", "expo-application",
                     "expo-local-authentication", "expo-secure-store"];
  const RN_PKGS = ["react-native-reanimated", "react-native-gesture-handler",
                   "react-native-safe-area-context", "react-native-screens"];
  const VECTOR = "@expo/vector-icons";

  const expoDeps: string[] = [];
  const optionalExpoDeps: string[] = [];

  for (const imp of externalImports) {
    if (EXPO_PKGS.includes(imp) || RN_PKGS.includes(imp) || imp === VECTOR) {
      // expo-haptics est toujours optionnel
      if (imp === "expo-haptics") {
        optionalExpoDeps.push(imp);
      } else {
        expoDeps.push(imp);
      }
    }
  }

  // 6. Si le composant utilise une primitive Liquid, ajouter reanimated + linear-gradient
  const usesLiquid = internalImports.some(i => i.includes("liquid/"));
  if (usesLiquid) {
    if (!expoDeps.includes("react-native-reanimated")) expoDeps.push("react-native-reanimated");
    if (!expoDeps.includes("expo-linear-gradient")) expoDeps.push("expo-linear-gradient");
    if (!expoDeps.includes("expo-blur")) expoDeps.push("expo-blur");
  }

  // 7. supportsGlass
  const supportsGlass = usesLiquid ||
    content.includes("liquidGlassEnabled") ||
    content.includes("variant=\"glass\"") ||
    content.includes("createGlassTheme");

  // 8. nativeRebuildRequired
  const nativeRebuildRequired =
    content.includes("react-native-gesture-handler") &&
    (content.includes("Gesture.") || content.includes("PanGestureHandler"));

  // 9. Mettre à jour le JSON
  const jsonPath = join(registryRoot, "components", `${name}.json`);
  const json = JSON.parse(readFileSync(jsonPath, "utf-8"));
  json.requiresComponents = [...new Set(requiredComponents)].sort();
  json.expoDependencies = [...new Set(expoDeps)].sort();
  json.optionalExpoDependencies = [...new Set(optionalExpoDeps)].sort();
  json.supportsGlass = supportsGlass;
  json.nativeRebuildRequired = nativeRebuildRequired;

  writeFileSync(jsonPath, JSON.stringify(json, null, 2) + "\n");
}
```

**Helpers** :
- `extractInternalImports(content)` : regex `/from\s+["'](\.[^"']+)["']/g`
- `extractExternalImports(content)` : regex `/from\s+["']([^."][^"']*)["']/g` (exclut les chemins relatifs)

### Script `scripts/validate-registry.ts`

Vérifie :
1. Chaque `requiresComponents` pointe vers un composant existant dans le registry
2. Chaque `files[]` pointe vers un fichier existant
3. Chaque composant a un JSON
4. Chaque JSON a un composant
5. `index.json` liste tous les composants
6. `categories` dans `index.json` couvre tous les composants (inclure `Overlay`)
7. Aucun `expoDependencies` invalide
8. `version` cohérente

**Sortie** : 0 si tout OK, 1 sinon avec détails.

---

## CONTRAINTES GLOBALES

1. **Ne rien casser** : chaque tâche doit être testable indépendamment.
2. **Commits atomiques** : 1 tâche = 1 commit (ou 1 série de commits liés).
3. **Pas de régression TypeScript** : `bun run check-types` doit passer après chaque tâche.
4. **Préserver la compatibilité** : les composants doivent continuer à fonctionner avec l'API publique actuelle.
5. **Documenter chaque changement** : dans `TASKS.md` et dans le commit message.
6. **Ne pas toucher** aux composants UI eux-mêmes (sauf `upload-*.tsx` pour P0-5). Les P0 sont des fixes structurels CLI + registry.
7. **Utiliser Bun** comme package manager et runtime (déjà configuré).
8. **ESM uniquement** : pas de `require()` dans le code source, utiliser `createRequire` si nécessaire.
9. **Node >= 20.11** : utiliser `import.meta.dirname` est OK, mais fournir un fallback `fileURLToPath(import.meta.url)` pour compatibilité.
10. **Ne pas publier** : à la fin, juste `npm publish --dry-run` pour vérifier.

---

## LIVRABLES FINAUX

À la fin de l'ÉTAPE 4, tu dois avoir produit :

1. **`ANALYSIS.md`** — rapport d'analyse complet (étape 1)
2. **`PLAN.md`** — plan d'exécution détaillé (étape 2)
3. **`TASKS.md`** — suivi de progression avec toutes les tâches cochées
4. **`VALIDATION.md`** — rapport final de validation
5. **Le projet refactoré** :
   - `packages/cli/` fonctionnel
   - `packages/ui-mobile/` fonctionnel
   - `scripts/sync-registry.ts` + `scripts/validate-registry.ts`
   - Les 7 P0 corrigés
   - Les 56 JSON régénérés
6. **`.github/workflows/publish.yml`** — CI de publish

---

## COMMANDES UTILES

```bash
# Installation
bun install

# Analyse
bun run scripts/analyze-project.ts        # (à créer si besoin)

# Sync registry
bun run scripts/sync-registry.ts

# Validate registry
bun run scripts/validate-registry.ts

# Check types
cd packages/cli && bun run check-types
cd packages/ui-mobile && bunx tsc --noEmit

# Build CLI
cd packages/cli && bun run build

# Test CLI
node packages/cli/dist/index.js --help
node packages/cli/dist/index.js list
node packages/cli/dist/index.js info button

# Test add (dans un projet Expo vide)
cd /tmp/test-expo-app
bunx rs-ui init --yes
bunx rs-ui add button card drawer
bunx tsc --noEmit

# Publish dry-run
cd packages/ui-mobile && npm publish --dry-run
cd packages/cli && npm publish --dry-run
```

---

## COMMENCE MAINTENANT

**ÉTAPE 1** : Lis tout le projet, produis `ANALYSIS.md`, et **arrête-toi** pour validation.

Ne passe pas à l'étape 2 sans un GO explicite de l'utilisateur.

Sois exhaustif, précis, et cite les fichiers + lignes exactes dans ton analyse.