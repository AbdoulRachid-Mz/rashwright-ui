# PLAN DE DÉVELOPPEMENT — Rashwright UI Mobile v0.2.0

> Feuille de route technique et suivi d'exécution vers la version `0.2.0`.
> Statut global : **Phases 1 à 6 complétées à 100% · Prêt pour Phase 7 (Publication npm)**.

---

## ✅ PHASE 1 — Bug fixes critiques & Stabilisation Init (C-1 → C-4)
- [x] **C-1 : Mise à jour par diff hash SHA-256 (`update.ts`)**
  - Calcul de hash normalisé (SHA-256 insensible aux sauts de ligne `\r\n` vs `\n`).
  - Détection exacte des composants modifiés localement avec invite de confirmation pour écrasement (`--force` disponible).
- [x] **C-2 : Détection et résolution des conflits de versions Expo (`dependency-resolver.ts`)**
  - Nouvelle méthode `detectVersionConflicts()` analysant les packages natifs requis vs ceux installés dans le projet.
  - Avertissement visuel clair avant toute installation d'incohérences de versions avec la matrice SDK.
- [x] **C-3 : Validation post-création Expo (`starter-generator.ts`)**
  - Vérification de l'intégrité du projet après `createExpoProject()` (`package.json`, structure minimale, concordance SDK).
- [x] **C-4 : Réinstallation des dépendances Expo lors des mises à jour (`update.ts`)**
  - `rs-ui update` ré-exécute la résolution et l'installation via `expo install` pour garantir la cohérence des versions natives.
- [x] **Correctifs template Expo & reset complet (`prompt.md` / `create-project.md`)**
  - Balayage approfondi de `src/components/` supprimant tous les composants par défaut Expo non-ui (`Collapsible`, `ThemedText`, `ThemedView`, etc.).
  - Nettoyage des routes et fichiers template (`explore.tsx`, `use-theme.ts`, `app-tabs`).
  - Déplacement de `expo-blur` et `expo-linear-gradient` dans `CORE_EXPO_DEPS` d'`init.ts` pour garantir la compilation des primitives Liquid Glass.
  - Configuration de `baseUrl: "."` et `ignoreDeprecations: "6.0"` dans `tsconfig.json` pour éliminer `TS5101`.

---

## ✅ PHASE 2 — Nouveaux composants (6 nouveaux · 61 composants au catalogue)
- [x] **`accordion` (`components/ui/accordion.tsx` + `registry/components/accordion.json`)**
  - Sections dépliables animées via Reanimated (`withTiming`), chevron rotatif, support `multiple` et variantes Glass / Bordered.
- [x] **`collapsible` (`components/ui/collapsible.tsx` + `registry/components/collapsible.json`)**
  - Section simple repliable/dépliable avec en-tête pressable tactile et animations fluides.
- [x] **`data-table` (`components/ui/data-table.tsx` + `registry/components/data-table.json`)**
  - Tableau de données basé sur FlatList avec colonnes redimensionnables/flexibles, tri dynamique (asc/desc/reset), filtrage textuel et support Glass.
- [x] **`form` (`components/ui/form.tsx` + `registry/components/form.json`)**
  - Suite de composants formulaires (`Form`, `FormField`, `FormLabel`, `FormMessage`, `FormDescription`, `useFormField`) compatibles React Hook Form et utilisables standalone.
- [x] **`otp-input` (`components/ui/otp-input.tsx` + `registry/components/otp-input.json`)**
  - Saisie OTP à cases individuelles configurables (défaut 6), navigation auto-focus/backspace, masque sécurisé, retour haptique.
- [x] **`rating` (`components/ui/rating.tsx` + `registry/components/rating.json`)**
  - Système de notation par étoiles interactif avec support des demi-étoiles, animation tactile Reanimated et feedback haptique.
- [x] **Intégration Barrel & Registry**
  - Tous exportés dans `packages/ui-mobile/components/ui/index.ts` et `COMPONENT_EXPORTS_MAP` de `starter-generator.ts`.
  - Zero `any`, typage TypeScript strict, compatibilité Liquid Glass.

---

## ✅ PHASE 3 — Remote Registry & Cache CDN (F-2)
- [x] **Module `remote-registry.ts` (`packages/cli/src/core/remote-registry.ts`)**
  - Résolution hybride : Registry local dans `node_modules/@rashwright/ui-mobile` ou workspace dev, avec fallback automatique vers le CDN unpkg (`https://unpkg.com/@rashwright/ui-mobile@latest`).
  - Cache local sur disque (`~/.rs-ui/cache`) avec TTL de 24 heures.
  - Support de l'option globale `--registry <url>` pour des miroirs personnalisés.
  - Support de l'option `--fresh` pour contourner le cache local et forcer un rafraîchissement réseau.
- [x] **Intégration dans toutes les commandes CLI**
  - `rs-ui add`, `rs-ui list`, `rs-ui info`, `rs-ui doctor`, `rs-ui update`.

---

## ✅ PHASE 4 — Suite de tests unitaires Vitest (T-3)
- [x] **Setup Vitest + `@vitest/coverage-v8` dans `packages/cli`**
  - Fichier de configuration `vitest.config.ts`.
- [x] **10 suites de tests créées (`packages/cli/tests/`)**
  - `config-manager.test.ts` (4 tests) : lecture, écriture, migration v0.1 vers v0.2.
  - `project-detector.test.ts` (5 tests) : détection de projet, identification des templates Expo.
  - `registry.test.ts` (5 tests) : chargement du registry, recherche par nom et catégorie.
  - `dependency-resolver.test.ts` (7 tests) : graphes de dépendances, détection de cycles, conflits de versions Expo.
  - `starter-generator.test.ts` (7 tests) : génération d'index UI, configuration tsconfig, validation SDK.
  - `file-manager.test.ts` (7 tests) : copie de composants, préservation des primitives Liquid.
  - `expo-detector.test.ts` (5 tests) : détection des SDK 54 à 59.
  - `package-manager.test.ts` (7 tests) : exécution des commandes bun/npm/yarn/pnpm, mode dry-run.
  - `diff.test.ts` (3 tests) : algorithme LCS, affichage des ajouts et suppressions.
  - `remote-registry.test.ts` (5 tests) : téléchargement, gestion du cache, fallback CDN.
- [x] **Total : 55 tests passants (100% succès, couverture > 90% sur le cœur de code)**.
- [x] **Intégration directe dans `bun run quality`**.

---

## ✅ PHASE 5 — UX & Améliorations CLI (U-2, U-3, F-3)
- [x] **Prévisualisation par diff avant écrasement (`F-3`)**
  - Moteur de diff LCS sans dépendance externe (`packages/cli/src/core/diff.ts`).
  - Option `rs-ui add <composant> --diff` affichant un aperçu ligne par ligne (+ vert / - rouge) avant d'écraser un composant déjà personnalisé.
- [x] **Lockfile `rashwright-ui.json` versionné (`U-2`)**
  - Évolution du format des composants enregistrés :
    `{ "button": { "version": "0.2.0", "installedAt": "2026-10-07T..." } }`
  - Rétrocompatibilité totale avec les configurations de format tableau string existantes `["button", "card"]`.
- [x] **Affichage enrichi & mode interactif pour `rs-ui list` (`U-3`)**
  - Présentation par catégories avec compteurs, colonnes claires (Statut, Composant, Description, Catégorie).
  - Mode interactif d'exploration : `rs-ui list -i` / `rs-ui list --interactive`.
- [x] **Mise à niveau de `rs-ui doctor`**
  - Détection automatique des composants installés dont la version locale est obsolète par rapport au registry.

---

## ✅ PHASE 6 — peerDependencies & Matrice Expo SDK 59 (T-1, T-2)
- [x] **Matrice Expo SDK 59 (`registry/versions/expo-59.json`)**
  - Définition des versions cibles pour React 19, React Native 0.77+, Reanimated, Blur, Linear Gradient, Safe Area Context, etc.
- [x] **Support SDK 59 dans le détecteur (`expo-detector.ts`)**
  - `SUPPORTED_SDK_VERSIONS = [54, 55, 56, 57, 58, 59]`.
- [x] **Complétion de `peerDependencies` et `peerDependenciesMeta` (`T-1`)**
  - Ajout de flags `optional: true` pour `expo-blur`, `expo-linear-gradient`, `expo-image`, `expo-video`, `expo-image-picker`, `expo-haptics`, `@expo/vector-icons`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `zustand`.
- [x] **Montée de version `0.2.0` généralisée**
  - Synchronisation de la version `0.2.0` dans :
    - Racine `package.json`
    - `packages/cli/package.json` (dépendance `@rashwright/ui-mobile: ^0.2.0`)
    - `packages/ui-mobile/package.json`
    - `packages/ui-mobile/registry/index.json` (`sdkVersions: [54, 55, 56, 57, 58, 59]`)
- [x] **Quality Gate 100% vert** :
  - `bun run quality` exit 0 (Registry OK, TypeScript strict OK, 55 Vitest OK, CLI Build OK, Smoke Tests OK).

---

## 🚀 PHASE 7 — Publication npm & Release Notes
- [ ] **Publication de `@rashwright/ui-mobile@0.2.0` sur npm**
- [ ] **Délai de propagation CDN npm (2 à 5 minutes)**
- [ ] **Publication de `@rashwright/cli@0.2.0` sur npm**
- [ ] **Validation post-publication dans un environnement vierge**
- [ ] **Publication de la Release GitHub v0.2.0 avec notes de version complètes**