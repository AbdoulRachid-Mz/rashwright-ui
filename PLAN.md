# PLAN D'EXÉCUTION DÉTAILLÉ — Rashwright UI Mobile v0.1.0 → v0.2.0

**Date** : 2026-10-01
**Basé sur** : ANALYSIS.md (7 P0 confirmés, 6 P1, 8 P2)
**Statut** : PLAN EN ATTENTE DE VALIDATION (Point d'arrêt 2)

---

## 0. PRINCIPES DIRECTEURS

1. **Commits atomiques** : 1 tâche logique = 1 commit
2. **TS strict zéro** : `npx tsc --noEmit` (user profile) après CHAQUE tâche
3. **ESM seul** : pas de `require()` dans le source ; `createRequire` seulement si indispensable
4. **Pas de `any`** : respect strict du user profile (refus catégorique du type `any`)
5. **Pas de touch aux composants UI** : sauf upload-image/video.tsx pour P0-5, et card.tsx pour P1-5 (import @/)
6. **Dégradation zéro** : chaque tâche testable indépendamment avant de passer à la suivante

---

## 1. LISTE ORDONNÉE DES TÂCHES

### ORDRE RECOMMANDÉ : CLI P0 → P1 CRITIQUE → COMPOSANTS P0/P1 → REGISTRY SYNC → SPLIT PACKAGES → VALIDATION

---

### GROUPE 1 — FIXES CLI P0 (rendent rs-ui FONCTIONNEL immédiatement)

---

#### 🟥 TÂCHE P0-1 : file-manager — préserver la structure relative des sous-dossiers
- **ID** : `P0-1`
- **Priorité** : BLOQUANTE (casse add/init pour tout composant qui dépend de liquid/*)
- **Fichiers impactés** :
  - [cli/core/file-manager.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/core/file-manager.ts)
- **Description précise** :
  Remplacer, dans `copyComponentFiles()`, L31-33 :
  ```ts
  const filename = basename(file);           // ANCIEN — perd le préfixe liquid/
  const destination = join(targetComponentsRoot, filename);
  ```
  par :
  ```ts
  const relative = file.replace(/^components\/ui\//, "");  // "liquid/liquid-surface.tsx" ou "button.tsx"
  const destination = join(targetComponentsRoot, relative);
  ```
  Le `mkdirSync(destDir, { recursive: true })` L46 existe déjà, donc la création des dossiers intermédiaires est garantie.
- **Critère de succès** :
  - Simulation JS : `copyComponentFiles(["components/ui/liquid/liquid-surface.tsx"], ..., "/tmp/proj/components/ui")` → doit produire `/tmp/proj/components/ui/liquid/liquid-surface.tsx` ET `/tmp/proj/components/ui/liquid/` existe.
  - `npx tsc --noEmit` → 0 erreur.
- **Dépendances** : AUCUNE (peut être faite indépendamment)
- **Taille** : S (~10 lignes modifiées)
- **Risques** : 🟢 faible — si le prefix `components/ui/` n'est pas présent, `replace` ne fait rien → le fichier garde son chemin original (rétrocompatible avec des paths absolus).

---

#### 🟥 TÂCHE P0-2 : setupFoundations — copier core UI files (text, view, liquid/*)
- **ID** : `P0-2`
- **Priorité** : BLOQUANTE (sans liquid/*, aucun composant utilisant Liquid ne compile dans projet user)
- **Fichiers impactés** :
  - [cli/core/starter-generator.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/core/starter-generator.ts)
  - [cli/commands/init.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/commands/init.ts) (si besoin d'appeler nouvelle fonction)
- **Description précise** :
  1. Ajouter une constante `CORE_UI_FILES` dans `starter-generator.ts` :
     ```ts
     const CORE_UI_FILES = [
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
  2. Créer fonction `setupCoreUi(sourceRoot, targetComponentsRoot, dryRun)` qui appelle `copyComponentFiles(CORE_UI_FILES, ...)` avec overwrite:true.
  3. Appeler `setupCoreUi()` dans `setupFoundations()` (après les fichiers theme/store/context), OU directement depuis init.ts après setupFoundations, avec pour targetComponentsRoot = `join(cwd, componentsPath)`.
  4. Important : setupCoreUi doit exister même pour rs-ui add lorsque le projet user a déjà été init (vérifier que le CLI n'essaie pas de re-copier les core files à chaque add). Idéal : ces fichiers sont copiés UNIQUEMENT par init.
- **Critère de succès** :
  Après exécution `setupFoundations()` + `setupCoreUi()` :
  - `ls <proj>/components/ui/liquid/` contient les 8 fichiers
  - `ls <proj>/components/ui/` contient `text.tsx` et `view.tsx`
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : P0-1 (car copyComponentFiles doit préserver liquid/*)
- **Taille** : S (~25 lignes ajoutées)
- **Risques** : 🟢 faible — P0-1 garanti la structure.

---

#### 🟥 TÂCHE P1-1 (CRITICAL) : Remplacer require() par readFileSync dans add.ts
- **ID** : `P1-1`
- **Priorité** : BLOQUANTE (crash runtime garanti sinon)
- **Fichiers impactés** :
  - [cli/commands/add.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/cli/commands/add.ts) L72
- **Description précise** :
  Remplacer L70-77 :
  ```ts
  let installedPkgs: Record<string, string> = {};
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(require("fs").readFileSync(pkgJsonPath, "utf-8"));
      installedPkgs = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    } catch { /* ignore */ }
  }
  ```
  par (note : readFileSync EST DÉJÀ IMPORTÉ via destructuration L6 mais pas dans l'import, il faut vérifier. En réalité L6 de add.ts ne liste pas readFileSync explicitement — il faut l'ajouter).
  Donc :
  1. Mettre à jour L6 : `import { existsSync, readFileSync } from "node:fs";`
  2. Remplacer `require("fs").readFileSync` par `readFileSync`.
- **Critère de succès** :
  - `grep "require(" cli/commands/add.ts` → 0 résultat
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : AUCUNE
- **Taille** : S (~3 lignes)
- **Risques** : 🟢 faible — 1 ligne.

---

### GROUPE 2 — FIXES P0 COMPOSANTS + BARREL

---

#### 🟥 TÂCHE P0-6 : Barrel UI — retirer exports View/Text (collision RN)
- **ID** : `P0-6`
- **Priorité** : MOYENNE (pas crash runtime mais bug source confusion)
- **Fichiers impactés** :
  - [components/ui/index.ts](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/index.ts) L21-22
- **Description précise** :
  Remplacer :
  ```ts
  export { default as View, default as ThemedView } from "./view";
  export { default as Text, default as ThemedText } from "./text";
  ```
  par :
  ```ts
  export { default as ThemedView } from "./view";
  export { default as ThemedText } from "./text";
  ```
- **Critère de succès** :
  - `grep -E "export \{.*(View|Text)(?!.*Themed)" components/ui/index.ts | grep -v Themed` → 0 résultat
  - Barrel n'exporte plus View ou Text (uniquement ThemedView/ThemedText)
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : AUCUNE
- **Taille** : S (2 lignes modifiées)
- **Risques** : 🟡 moyen — recherche de toutes les références `./components/ui` qui utilisent `View`/`Text` non préfixés Themed. A vérifier : showcase-screen.tsx, popup.tsx, time-picker.tsx.
  → Vérification pre-change :
  - `popup.tsx` : `import { button, modal, text, view } from "./";` → lowercase, pas impacté
  - `time-picker.tsx` : import `@/components/ui/text` et `view` → utilisent paths absolus pas barrel, OK
  - `showcase-screen.tsx` : pas de View/Text direct non-thématisé.
  → RAS si ces composants n'utilisent pas le barrel. A confirmer par grep.

---

#### 🟨 TÂCHE P1-5 : card.tsx — remplacer import @/ absolu par import relatif
- **ID** : `P1-5`
- **Priorité** : MOYENNE (projet user sans alias @/ ne compile pas)
- **Fichiers impactés** :
  - [components/ui/card.tsx](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/card.tsx) L21
- **Description précise** :
  Remplacer :
  ```ts
  import ThemedText from "@/components/ui/text";
  ```
  par :
  ```ts
  import ThemedText from "./text";
  ```
- **Critère de succès** :
  - `grep '@/components/ui' components/ui/card.tsx` → 0 résultat
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : AUCUNE
- **Taille** : S (1 ligne)
- **Risques** : 🟢 faible

---

#### 🟥 TÂCHE P0-5 : Inliner @rashwright/upload dans packages (→ fichier composants + dossier lib/upload)
- **ID** : `P0-5`
- **Priorité** : BLOQUANTE (npm publish impossible avec workspace:*)
- **Note** : ATTENTION — le code de @rashwright/upload n'est PAS dans ce repo monorepo visible. Si le code source de @rashwright/upload n'existe pas, il faut :
  **Option de repli (la plus sûre)** :
  - Supprimer l'import `@rashwright/upload` des 2 composants et remplacer par une API locale `UploadManager` minimaliste (mock) dans `lib/upload/`.
  - MAIS errors.md L238-244 spécifie "inliner @rashwright/upload". Il faut soit :
    a) Récupérer le package @rashwright/upload à partir du workspace parent si c'est un monorepo bun, soit
    b) S'il n'existe pas, créer un stub UploadManager compatible API-minimum + commentaire TODO.
- **Fichiers impactés** :
  - [components/ui/upload-image.tsx](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/upload-image.tsx) L29-30
  - [components/ui/upload-video.tsx](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/components/ui/upload-video.tsx) (même pattern)
  - `lib/upload/index.ts` (NOUVEAU)
  - [registry/components/upload-image.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/registry/components/upload-image.json) — retirer `"@rashwright/upload"` de `dependencies`
  - [registry/components/upload-video.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/registry/components/upload-video.json) — idem
  - [package.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/package.json) L25 — supprimer ligne `"@rashwright/upload": "workspace:*"`
- **Description précise** :
  1. **Explorer** si un dossier upload existe dans `..` (niveau rashwright-office parent). Si c'est le cas : copier le code source de @rashwright/upload vers `rashwright-ui/lib/upload/`
  2. **Sinon** : créer `lib/upload/index.ts` contenant un stub minimaliste avec les types et classes utilisés :
     ```ts
     export interface IUploadProvider { upload(...): Promise<{success, url?}> }
     export interface UploadSource { name, type, uri }
     export interface UploadResult { success, url?, error? }
     export class UploadManager {
       constructor({ provider }: { provider: IUploadProvider }) {}
       async upload(source: UploadSource, opts?: { folder?: string }): Promise<UploadResult> { return this.provider.upload(source, opts); }
     }
     ```
  3. Remplacer dans upload-image.tsx L29-30 :
     ```ts
     import type { IUploadProvider, UploadSource, UploadResult } from "@rashwright/upload";
     import { UploadManager } from "@rashwright/upload";
     ```
     par :
     ```ts
     import type { IUploadProvider, UploadSource, UploadResult } from "../../lib/upload";
     import { UploadManager } from "../../lib/upload";
     ```
     Et upload-video.tsx : même pattern (vérifier ligne exacte).
  4. Supprimer `"@rashwright/upload": "workspace:*"` du package.json racine.
  5. Dans upload-image.json / upload-video.json : remplacer `"dependencies": ["@rashwright/upload"]` par `"dependencies": []`.
- **Critère de succès** :
  - `grep -r "workspace:" package.json` → 0 résultat
  - `grep -r "@rashwright/upload" components/ registry/` → 0 résultat
  - `ls lib/upload/index.ts` → existe
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : AUCUNE (peut être faite avant le split ; après split, `lib/upload/` sera déplacé dans `packages/ui-mobile/lib/upload/`)
- **Taille** : M (~3 fichiers + ~80 lignes de stub)
- **Risques** : 🟡 moyen — si @rashwright/upload a des types particuliers utilisés par le composant (ex: CloudinaryProvider config), le stub peut être incomplet. Solution : typescript strict attrapera les erreurs.

---

### GROUPE 3 — REGISTRY : SCRIPT SYNC + VALIDATE

---

#### 🟦 TÂCHE REG-1 : Créer scripts/sync-registry.ts
- **ID** : `REG-1`
- **Priorité** : BLOQUANTE (résout à la fois P0-3 ET P0-4)
- **Fichiers impactés** :
  - `scripts/sync-registry.ts` (NOUVEAU)
  - éventuellement : [package.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/package.json) — ajouter script `"sync-registry": "bun run scripts/sync-registry.ts"`
- **Description précise** (algorithme 1:1 avec errors.md §« Détail de la régénération ») :
  1. Constantes globales :
     - `COMPONENTS_UI_ROOT` = `join(process.cwd(), "components", "ui")`
     - `REGISTRY_ROOT` = `join(process.cwd(), "registry")`
     - `CORE_FILES = new Set(["text","view","liquid/liquid-types","liquid/liquid-surface",...])` (10 fichiers)
     - `EXPO_PKGS`, `RN_PKGS`, `VECTOR = "@expo/vector-icons"`
  2. Helper `extractInternalImports(content: string): string[]` — regex `/from\s+["'](\.[^"']+)["']/g`
  3. Helper `extractExternalImports(content: string): string[]` — regex `/from\s+["']([^."\/@][^"']*)["']/g` (non relatif, non @rashwright) + capture de `@expo/vector-icons`, `@rashwright/*` séparément
  4. Pour chaque `.tsx` dans `COMPONENTS_UI_ROOT` (récursive, mais dans liquid on n'enregistre pas — on skip les fichiers dans `liquid/`) :
     a. Extraire nom composant : `button` depuis `button.tsx`
     b. Lire contenu
     c. internalImports → convertir en noms (strip ./ + extension) → filtrer core files → retirer self → `requiredComponents`
     d. externalImports → classifier : EXPO_PKGS, RN_PKGS, VECTOR → expoDeps (non optionnel) / optionalExpoDeps (expo-haptics seul)
     e. `usesLiquid = internalImports.some(i => i.includes("liquid/"))`
     f. Si usesLiquid : ajouter reanimated + linear-gradient + expo-blur à expoDeps (si pas présents)
     g. `supportsGlass = usesLiquid || content.includes("liquidGlassEnabled") || content.includes("variant=\"glass\"") || content.includes("createGlassTheme")`
     h. `nativeRebuildRequired = content.includes("react-native-gesture-handler") && (content.includes("Gesture.") || content.includes("PanGestureHandler"))`
     i. Lire JSON correspondant, **mettre à jour SEULEMENT** ces 5 clés :
        - `requiresComponents`
        - `expoDependencies`
        - `optionalExpoDependencies`
        - `supportsGlass`
        - `nativeRebuildRequired`
     j. `writeFileSync(jsonPath, JSON.stringify(json, null, 2) + "\n")`
  5. Traitement spécial `files[]` — le script peut également mettre à jour `files` pour chaque composant :
     - pour `button` → files = `["components/ui/button.tsx"]` (déjà OK)
  6. Traitement upload-video.json : remettre `nativeRebuildRequired: false` (P1-6).
- **Critère de succès** :
  - Après exécution `bun run scripts/sync-registry.ts` :
    - `button.json` L8 → `"expoDependencies": ["expo-blur", "expo-linear-gradient", "react-native-reanimated"]` et `optionalExpoDependencies: ["expo-haptics"]`
    - `actions-grid.json` → `"requiresComponents": ["carousel"]`
    - `card.json` → `"expoDependencies": ["expo-blur", "expo-linear-gradient", "react-native-reanimated"]`
    - upload-video.json → `nativeRebuildRequired: false`
    - `ls registry/components/` → 56 fichiers existent toujours, aucun supprimé.
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : AUCUNE (peut tourner tout de suite ; après split il faut ajuster les paths mais le script reste même logique)
- **Taille** : L (~150 lignes TS)
- **Risques** : 🟡 moyen — champ `files[]` incorrect ? Stratégie : ne PAS toucher `files[]` au premier passage (uniquement les 5 champs listés).

---

#### 🟦 TÂCHE REG-2 : Exécuter sync-registry.ts et corriger anomalies mineures
- **ID** : `REG-2`
- **Priorité** : BLOQUANTE
- **Fichiers impactés** : Tous les 56 JSON (modifiés par script)
- **Description précise** :
  1. Exécuter `bun run scripts/sync-registry.ts`
  2. Vérifier visuellement 10 JSON représentatifs
  3. Corriger à la main les cas limites détectés (ex: showcase-screen qui importe button/card etc via ./xxx ; upload-image.json dep @rashwright/upload déjà retiré par P0-5)
- **Critère de succès** :
  - Tous les 56 JSON `requiresComponents` cohérents graphe deps ANALYSIS.md §3b
  - Tous les 56 JSON `expoDependencies` cohérents tableau §4
- **Dépendances** : REG-1
- **Taille** : S (validation + corrections à la main)
- **Risques** : 🟢 faible

---

#### 🟦 TÂCHE REG-3 : Créer scripts/validate-registry.ts
- **ID** : `REG-3`
- **Priorité** : MOYENNE (garantie qualité CI)
- **Fichiers impactés** :
  - `scripts/validate-registry.ts` (NOUVEAU)
  - [package.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/package.json) — ajouter `"validate-registry": "bun run scripts/validate-registry.ts"`
- **Description précise** (1:1 errors.md §« Script validate-registry ») :
  Vérifier :
  1. Chaque `requiresComponents[]` → composant existe dans registry
  2. Chaque `files[]` → fichier existe sur disque
  3. Chaque .tsx (non liquid, non text, non view) → un JSON existe
  4. Chaque JSON → un .tsx correspondant
  5. `index.json.components[]` couvre tous les JSON (56 exactement)
  6. `index.json.categories` couvre tous les composants (chercher doublons + orphelins ; vérifier que Overlay est OK ou à créer)
  7. `expoDependencies[]` contient uniquement pkg autorisés (liste EXPO_PKGS, RN_PKGS, @expo/vector-icons)
  8. `version` = "1.0.0" dans chaque JSON
- **Critère de succès** :
  - `bun run scripts/validate-registry.ts` → `exit code 0` + message "✅ Registry valide : 56 composants, 56 fichiers, ..."
  - `npx tsc --noEmit` → 0 erreur
- **Dépendances** : REG-2
- **Taille** : M (~100 lignes)
- **Risques** : 🟢 faible

---

### GROUPE 4 — SPLIT PACKAGES (monolithe → 2 packages npm)

---

#### 🟧 TÂCHE SPLIT-1 : Créer structure packages/ + package.json racine workspace
- **ID** : `SPLIT-1`
- **Priorité** : BLOQUANTE (détermine architecture finale)
- **Fichiers impactés** :
  - `packages/` (NOUVEAU dossier)
  - `packages/cli/package.json` (NOUVEAU)
  - `packages/ui-mobile/package.json` (NOUVEAU)
  - [package.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/package.json) (MODIF)
- **Description précise** :
  1. Modifier `package.json` RACINE :
     - Remplacer name par `"rashwright-ui-workspace"` ou `"@rashwright/workspace-root"`
     - Ajouter `"workspaces": ["packages/*"]`
     - Retirer `name`, `description`, `bin`, `exports`, `dependencies` (ces champs deviennent ceux des sous-packages)
     - Garder : `devDependencies: { "@types/node": "...", "typescript": "..." }` + `packageManager: "bun@1.4.2"` + scripts racine utiles (`check-types`, `sync-registry`, `validate-registry`)
  2. Créer `packages/ui-mobile/package.json` — 1:1 errors.md §`packages/ui-mobile/package.json` avec :
     - name: `@rashwright/ui-mobile`
     - version: `0.1.0`
     - type: `module`
     - files: [ "components/**", "constants/**", "contexts/**", "hooks/**", "stores/**", "theme/**", "types/**", "assets/**", "registry/**", "skills/**", "lib/**", "index.ts", "README.md" ]
     - peerDependencies: expo>=54, react>=18.3, react-native>=0.73, react-native-reanimated>=3, react-native-safe-area-context>=4, zustand>=5
     - peerDependenciesMeta: 3 optional
     - dependencies: `@react-native-async-storage/async-storage: "^2.1.0"` (car pas peerDep, utilisé direct)
  3. Créer `packages/cli/package.json` — 1:1 errors.md §`packages/cli/package.json` :
     - name: `@rashwright/cli`
     - version: `0.1.0`
     - engines: `node>=20.11.0`
     - bin: `{ "rs-ui": "./dist/index.js" }`
     - files: `["dist/**", "README.md"]`
     - scripts: build, dev, prepublishOnly, check-types
     - dependencies: `@rashwright/ui-mobile: "^0.1.0"`, chalk ^5.3, commander ^12.1, inquirer ^12.5, ora ^8.1
     - devDependencies: `@types/node`, `typescript`
- **Critère de succès** :
  - `ls packages/` → `cli/ ui-mobile/`
  - `ls packages/ui-mobile/package.json packages/cli/package.json` → existent
  - Racine package.json possède `"workspaces": ["packages/*"]`
  - `bun install` (dry run mental) ne signale pas d'erreur de structure
- **Dépendances** : AUCUNE (peut être fait même avant REG-*, après P0/P1 fixes)
- **Taille** : M (~3 fichiers JSON)
- **Risques** : 🟡 moyen — dépend aux installations bun workspace. Mitigation : tester avec `bun install` réel si possible.

---

#### 🟧 TÂCHE SPLIT-2 : Déplacer code UI → packages/ui-mobile/
- **ID** : `SPLIT-2`
- **Priorité** : BLOQUANTE
- **Fichiers impactés** : Déplacement physique de dossiers
  - Déplacer : `components/` → `packages/ui-mobile/components/`
  - Déplacer : `constants/` → `packages/ui-mobile/constants/`
  - Déplacer : `contexts/` → `packages/ui-mobile/contexts/`
  - Déplacer : `hooks/` → `packages/ui-mobile/hooks/`
  - Déplacer : `stores/` → `packages/ui-mobile/stores/`
  - Déplacer : `theme/` → `packages/ui-mobile/theme/`
  - Déplacer : `types/` → `packages/ui-mobile/types/`
  - Déplacer : `assets/` → `packages/ui-mobile/assets/`
  - Déplacer : `registry/` → `packages/ui-mobile/registry/`
  - Déplacer : `skills/` → `packages/ui-mobile/skills/`
  - Déplacer : `lib/upload/` (créé P0-5) → `packages/ui-mobile/lib/upload/`
  - Déplacer : `index.ts` (racine) → `packages/ui-mobile/index.ts` (ajuster imports relatifs : remplacer `./components` → `./components` car on est dans packages/ui-mobile/ directement — aucun changement requis !)
- **Critère de succès** :
  - `ls packages/ui-mobile/` contient tous les dossiers déplacés
  - les chemins dans `index.ts` (L9, L10, etc.) restent valides (car index.ts était à la racine ; il est maintenant à packages/ui-mobile/ et les fichiers ./components sont au même endroit relatif)
- **Dépendances** : SPLIT-1
- **Taille** : S (mv / renommage de dossiers)
- **Risques** : 🟡 moyen — les scripts sync-registry doivent être mis à jour vers le nouveau chemin. Régler dans SPLIT-4.

---

#### 🟧 TÂCHE SPLIT-3 : Déplacer code CLI → packages/cli/ + créer paths.ts centralisé
- **ID** : `SPLIT-3`
- **Priorité** : BLOQUANTE
- **Fichiers impactés** :
  - Déplacer dossier `cli/` → `packages/cli/src/` (donc packages/cli/src/index.ts, packages/cli/src/commands/*.ts, packages/cli/src/core/*.ts)
  - Créer `packages/cli/src/core/paths.ts` (NOUVEAU)
  - Modifier TOUS les fichiers CLI (add.ts, init.ts, list.ts, etc.) qui utilisaient `join(import.meta.dirname, "..", "..", "registry")` pour utiliser `REGISTRY_ROOT` de paths.ts
- **Description précise** :
  1. Déplacer tout le contenu de `cli/` dans `packages/cli/src/`
     - ex: `cli/index.ts` → `packages/cli/src/index.ts`
     - ex: `cli/commands/add.ts` → `packages/cli/src/commands/add.ts`
  2. Créer `packages/cli/tsconfig.json` (hérité de la racine, adapté à `include: ["src/**/*.ts"]`)
  3. Créer `packages/cli/src/core/paths.ts` exactement comme errors.md §« paths.ts centralisé » :
     - try `require.resolve("@rashwright/ui-mobile/package.json")` → UI_MOBILE_ROOT
     - fallback dev (workspace) : `join(__dirname, "..", "..", "..", "ui-mobile")`
     - exporter `REGISTRY_ROOT = join(UI_MOBILE_ROOT, "registry")`, `SOURCE_ROOT = UI_MOBILE_ROOT`, `PACKAGE_ROOT`
  4. Update tous les fichiers CLI :
     - [packages/cli/src/commands/add.ts] L16-17 : remplacer REGISTRY_ROOT/SOURCE_ROOT calculés manuellement par `import { REGISTRY_ROOT, SOURCE_ROOT } from "../core/paths.js";`
     - [packages/cli/src/commands/init.ts] L35 : remplacer SOURCE_ROOT par import depuis paths
     - [packages/cli/src/commands/list.ts] L9 : idem
     - [packages/cli/src/commands/info.ts] (si utilisé) : idem
     - [packages/cli/src/commands/doctor.ts] : idem
     - [packages/cli/src/commands/remove.ts] : idem
     - [packages/cli/src/commands/update.ts] : idem
  5. Vérifier : dans starter-generator.ts, `setupCoreUi` doit maintenant trouver `components/ui/` dans `SOURCE_ROOT` (= UI_MOBILE_ROOT).
- **Critère de succès** :
  - `ls packages/cli/src/` → `index.ts, commands/, core/`
  - `ls packages/cli/src/core/paths.ts` → existe
  - Plus AUCUNE occurrence de `join(import.meta.dirname, "..", "..", "registry")` dans le CLI
  - `npx tsc --noEmit -p packages/cli/tsconfig.json` → 0 erreur
- **Dépendances** : SPLIT-2
- **Taille** : M (paths.ts + mise à jour 8 fichiers CLI)
- **Risques** : 🟡 moyen — si fallback dev monorepo pas correct, CLI ne démarre pas en mode workspace. Test prévu.

---

#### 🟧 TÂCHE SPLIT-4 : Mettre à jour scripts (sync-registry + validate) vers nouveaux paths
- **ID** : `SPLIT-4`
- **Priorité** : MOYENNE (ces scripts doivent fonctionner après split)
- **Fichiers impactés** :
  - `scripts/sync-registry.ts` (mis à jour SPLIT-2 précédent mais paths à ajuster vers packages/ui-mobile/components & registry)
  - `scripts/validate-registry.ts` : idem
- **Description précise** :
  Remplacer `COMPONENTS_UI_ROOT` et `REGISTRY_ROOT` :
  ```ts
  const PROJECT_ROOT = process.cwd();
  const UI_MOBILE_ROOT = join(PROJECT_ROOT, "packages", "ui-mobile");
  const COMPONENTS_UI_ROOT = join(UI_MOBILE_ROOT, "components", "ui");
  const REGISTRY_ROOT = join(UI_MOBILE_ROOT, "registry");
  ```
- **Critère de succès** :
  - `bun run scripts/sync-registry.ts` → fonctionne sans FileNotFound
  - `bun run scripts/validate-registry.ts` → 0 erreur
- **Dépendances** : SPLIT-3 + REG-1 + REG-3
- **Taille** : S (8 lignes x 2 fichiers)
- **Risques** : 🟢 faible

---

#### 🟧 TÂCHE SPLIT-5 : Mettre à jour tsconfigs + racine tsconfig.base.json
- **ID** : `SPLIT-5`
- **Priorité** : MOYENNE
- **Fichiers impactés** :
  - `tsconfig.base.json` (NOUVEAU) — options communes
  - [tsconfig.json](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/tsconfig.json) (MODIF) — references
  - `packages/ui-mobile/tsconfig.json` (NOUVEAU)
  - `packages/cli/tsconfig.json` (créé SPLIT-3, déjà mentionné)
- **Description précise** :
  - tsconfig.base.json : target, module, moduleResolution, strict, skipLibCheck, paths
  - tsconfig racine : `"references": [{ "path": "./packages/cli" }, { "path": "./packages/ui-mobile" }]`
  - packages/ui-mobile/tsconfig.json : extends "../tsconfig.base.json", include = ["**/*.ts", "**/*.tsx"], exclude = ["node_modules", "dist"]
  - packages/cli/tsconfig.json : extends "../tsconfig.base.json", compilerOptions.jsx peut être omit (CLI pas de JSX), include = ["src/**/*.ts"]
- **Critère de succès** :
  - `cd packages/cli && npx tsc --noEmit` → 0 erreur
  - `cd packages/ui-mobile && npx tsc --noEmit` → 0 erreur
  - `npx tsc --noEmit` à la racine → 0 erreur (mode composite)
- **Dépendances** : SPLIT-4
- **Taille** : S (4 fichiers JSON)
- **Risques** : 🟢 faible

---

#### 🟥 TÂCHE P0-7 : Build CLI correct (packages/cli/src/index.ts → dist)
- **ID** : `P0-7`
- **Priorité** : BLOQUANTE (rs-ui non exécutable après publish)
- **Fichiers impactés** :
  - [packages/cli/package.json](file:///...) — déjà écrit dans SPLIT-1 mais on vérifie `scripts.build` + `prepublishOnly`
  - `packages/cli/src/index.ts` — DOIT avoir shebang L1 (déjà le cas dans cli/index.ts ; après mv vers src, vérifier)
  - `.gitignore` (racine) — ajouter `packages/cli/dist`
- **Description précise** :
  1. Vérifier packages/cli/package.json scripts :
     ```json
     "build": "bun build ./src/index.ts --outdir ./dist --target node --format esm --external commander --external inquirer --external chalk --external ora --banner '#!/usr/bin/env node'",
     "prepublishOnly": "bun run build && bun run check-types"
     ```
  2. Exécuter `cd packages/cli && bun run build`
  3. Vérifier :
     - `head -n 1 packages/cli/dist/index.js` = `#!/usr/bin/env node`
     - `node packages/cli/dist/index.js --help` → affiche l'aide Commander et n'a pas d'erreur de résolution paths (test en workspace, grâce au fallback)
- **Critère de succès** (cf errors.md L294) :
  - Après build, dist/index.js existe ET commence par `#!/usr/bin/env node`
  - `node dist/index.js --help` fonctionne (affiche liste commandes, exit 0)
- **Dépendances** : SPLIT-3 (CLI déplacé + paths.ts)
- **Taille** : S
- **Risques** : 🟡 moyen — banner préservé même en bun build ? Si non, alternative : `echo '#!/usr/bin/env node\n' > dist/index.js && bun build ... >> dist/index.js`

---

### GROUPE 5 — CI + FINALISATION

---

#### 🟪 TÂCHE CI-1 : Créer .github/workflows/publish.yml
- **ID** : `CI-1`
- **Priorité** : FAIBLE (pour publish npm automatique)
- **Fichiers impactés** :
  - `.github/workflows/publish.yml` (NOUVEAU, errors.md L310 mentionné)
- **Description précise** :
  - Trigger : `push` sur tag `v*`
  - Jobs :
    1. `check` : runs-on ubuntu-latest, steps : checkout, bun setup, bun install, `npx tsc --noEmit` dans les 2 packages, `bun run scripts/validate-registry.ts`, tests s'ils y en a
    2. `publish-ui-mobile` : dépend de check, needs check, si tag : checkout, bun install, `cd packages/ui-mobile && npm publish --access public` (NPM_TOKEN secret)
    3. `publish-cli` : dépend de publish-ui-mobile, checkout, bun install, bun run build (cli), `cd packages/cli && npm publish --access public`
- **Critère de succès** :
  - YAML syntaxe valide (yamllint mental)
  - Bon ordre de publish (ui-mobile AVANT cli, car CLI dépend de @rashwright/ui-mobile)
- **Dépendances** : AUCUNE (peut être créé à tout moment)
- **Taille** : S
- **Risques** : 🟢 faible

---

#### 🟩 TÂCHE P2-1 + FINAL : Mise à jour racine README.md + fichiers publiés
- **ID** : `FINAL-1`
- **Priorité** : FAIBLE
- **Fichiers impactés** :
  - `README.md` racine (mise à jour structure monorepo, installation via npm, etc.)
  - Copier README.md dans `packages/ui-mobile/README.md` et `packages/cli/README.md` (ou spécifiques)
- **Dépendances** : toutes les tâches avant
- **Taille** : M

---

## 2. ORDRE D'EXÉCUTION RECOMMANDÉ (avec justification)

```
(1) P1-1  →  (2) P0-1  →  (3) P0-2  →  (4) P0-6  →  (5) P1-5  →  (6) P0-5
  CLI       CLI         CLI         Barrel      Card UI     Upload inline
  CRASH     Structure   Core files  Collision   @/ alias    workspace:*
  (indep)   ↙           ↙
            (7) REG-1  →  (8) REG-2  →  (9) REG-3
              Sync script  Apply it    Validate
            ↙
            (10) SPLIT-1  →  (11) SPLIT-2  →  (12) SPLIT-3  →  (13) SPLIT-4  →  (14) SPLIT-5
              Workspace     Move UI         Move CLI+paths  Scripts paths   TS configs
            ↙
            (15) P0-7  →  (16) CI-1  →  (17) FINAL-1
              Build CLI   CI/CD         READMEs
```

**Justification** :
- **P1-1 en PREMIER** : Parce que sinon le CLI crash à chaque `rs-ui add` dès qu'on veut tester. C'est le bug le plus violent.
- **P0-1 + P0-2** : Rend l'install fonctionnelle (copie correcte fichiers liquid/*). Sans ça, aucun test utilisateur n'est possible.
- **P0-6 + P1-5 + P0-5** : Tous indépendants des précédents mais impactent les composants eux-mêmes. On les fait avant sync-registry car sync-registry lit le code des composants.
- **REG-1/2/3** : Doivent être fait après modifications de code composants (P1-5, P0-5). Après REG-2, on a un registry propre 100% synchronisé.
- **SPLIT-1 à SPLIT-5** : On garde le split APRÈS fixes P0/P1 + registry propre → permet d'éviter les doublons de corrections (avant/après déplacement). Stratégie "fixer d'abord, puis déménager".
- **P0-7** : Nécessite CLI déplacé.
- **CI-1 + FINAL-1** : Fin, peu de risques.

---

## 3. STRATÉGIE DE TEST

### 3a. Tests unitaires / qualité (après CHAQUE tâche)
```bash
# 1. TypeScript strict (user profile obligation)
npx tsc --noEmit
# Après split :
cd packages/cli && npx tsc --noEmit
cd packages/ui-mobile && npx tsc --noEmit

# 2. Registry
bun run scripts/validate-registry.ts    # exit 0 attendu
```

### 3b. Tests CLI (après P1-1 + P0-1 + P0-2 + P0-5 + P0-6 + P1-5)
```bash
# Dry run build CLI (avant split, avec ancien path)
bun run build:cli

# Test --help (mode DEV direct)
bun run cli/index.ts --help
# Output attendu : liste commandes Commander (init, add, list, info, etc.)

# Test list --json (doit retourner 56 composants, pas crash)
bun run cli/index.ts list --json | jq 'length'
# Attendu : 56
```

### 3c. Test `rs-ui add` (après SPLIT + P0-7, dans un projet Expo vide)
```bash
# Prérequis : avoir build CLI + npm link localement
cd packages/cli && npm link        # lien global rs-ui
cd packages/ui-mobile && npm link  # lien @rashwright/ui-mobile

# Créer projet Expo test
cd /tmp
bunx create-expo-app test-rs-ui --template default --yes
cd test-rs-ui

# 1. init
rs-ui init --yes --glass --theme emerald
# Vérifications (doivent exister) :
ls components/ui/liquid/liquid-surface.tsx
ls components/ui/text.tsx
ls components/ui/view.tsx
ls constants/theme.ts
ls stores/theme-store.ts
ls contexts/theme-context.tsx
cat rashwright-ui.json | jq '.theme == "glass" and .themePreset == "emerald"'  # true

# 2. add button
rs-ui add button --yes
# Vérification pas de crash require()
# Vérification import liquid existe toujours
cat components/ui/button.tsx | grep -q "liquid-pressable"  # 0
ls components/ui/liquid/   # toujours 8 fichiers

# 3. add actions-grid (requiresComponents carousel — P0-3)
rs-ui add actions-grid --yes
# Attendu : dans plan d'installation, on doit voir "+ carousel@..."
ls components/ui/carousel.tsx   # DOIT exister

# 4. Vérification TS finale
bunx tsc --noEmit
# Attendu : 0 erreur
```

### 3d. Test publish dry-run (APRES split + P0-7 + P0-5)
```bash
cd packages/ui-mobile && npm publish --dry-run --access public 2>&1 | grep -v "workspace:"
# Attendu : pas d'erreur de workspace, pas de tarball corrompu
echo "exit: $?"  # 0

cd packages/cli && npm publish --dry-run --access public
# Attendu : dry-run success, package.json contient dependencies[@rashwright/ui-mobile] avec "^0.1.0" pas "workspace:*"
```

---

## 4. STRATÉGIE DE ROLLBACK

### Principe général : CHAQUE TÂCHE = 1 COMMIT ATOMIQUE

```
git checkout -b refonte-p0-split-registry
# Base propre
git commit --allow-empty -m "START: refonte P0 + split + registry"

# Après CHAQUE tâche réussie (tests passent)
git add -A
git commit -m "fix(P0-1): file-manager preserve subdirs via relative path"
# => commit atomique 1: P0-1 seul

# etc.
```

### Rollback d'1 tâche spécifique :
```bash
# Si REG-1 (script sync) a cassé des JSON
git show HEAD~3 --stat           # retrouver REG-1 = commit W
git revert <commit-hash-REG-1>   # revert W sans toucher les suivants
```

### Rollback global :
```bash
# Si tout va mal : revenir à base
git reset --hard HEAD~N          # N = nb de commits depuis START
# OU
git stash && git checkout main
```

### Sauvegarde registry avant sync :
```bash
# Dans REG-2 (avant exécuter sync) :
cp -r registry/ registry.BKP.PRE-SYNC/
# => permet de restaurer les JSON d'origine 1 par 1 si besoin
```

---

## 5. RISQUES ET MITIGATIONS PAR TÂCHE (tableau résumé)

| Tâche | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| P1-1 (require) | Aucun | 0 | 0 | 1 ligne |
| P0-1 (file-manager) | Path sans prefix `components/ui/` | Faible | Faible | Pattern `.replace()` est no-op si pas de match |
| P0-2 (core files) | Doublons liquid/* copiés par rs-ui add ensuite | Moyen | Faible | sync-registry ignore core files dans requiresComponents |
| P0-6 (View/Text barrel) | Code interne utilise `{ View }` du barrel | Moyenne | Moyenne | grep pré-change sur tout le codebase |
| P1-5 (card.tsx @/) | Autres composants avec même souci | Moyenne | Moyenne | grep `from "@/components` dans components/ui/ LORS de la tâche |
| P0-5 (inline upload) | @rashwright/upload a une API complexe, stub incomplet | Moyenne | Moyenne | TS strict attrape les erreurs ; ajuster stub |
| REG-1 (sync script) | Écrase des champs non prévus dans JSON | Faible | Critique | Script lit JSON existant, ne met à jour QUE 5 champs listés explicitement |
| REG-2 | Anomalies cas limites (showcase-screen) | Faible | Faible | Vérif visuelle sur 10 JSON + validate-registry |
| SPLIT-1 (workspace) | Bun workspace non résolu | Moyenne | Critique | bun doit être installé (1.4.2) ; path `packages/*` standard bun |
| SPLIT-3 (paths.ts) | Fallback dev faux (chemin monorepo) | Moyenne | Haute | Tester EN DEV : `bun run packages/cli/src/index.ts list --json` avec fallback activé |
| P0-7 (build CLI) | Shebang mal placé par bun | Moyenne | Haute | Vérifier `head -n 1 dist/index.js` ; sinon concat manuel via `echo + >>` |
| CI-1 / FINAL-1 | (faible) | — | — | — |

---

## 6. DURÉE ESTIMÉE GLOBALE

| Groupe | Tâches | Effort total |
|---|---|---|
| Groupe 1 (CLI P0 + P1) | P1-1 + P0-1 + P0-2 | 3 x S = M |
| Groupe 2 (Composants P0/P1) | P0-6 + P1-5 + P0-5 | 2 x S + 1 x M = M |
| Groupe 3 (Registry) | REG-1 + REG-2 + REG-3 | 1 x L + 2 x S = L |
| Groupe 4 (Split) | SPLIT-1/2/3/4/5 + P0-7 | 5 x S + 1 x M = L |
| Groupe 5 (Final) | CI-1 + FINAL-1 | 2 x S = S |
| **TOTAL** | **17 tâches** | **~4L + 2M + 3S** |

Équivalent temps-homme estimé : **1 à 2 jours** en mode itératif, selon tests et découvertes.

---

**FIN PLAN. Attends validation utilisateur avant ÉTAPE 3.**
