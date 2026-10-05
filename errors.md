# errors.md — Rashwright UI Mobile v0.1.2 (POST-CORRECTIONS TOTALES)

**Statut** : **3 Bugs 100% corrigés · 4 Objectifs 100% atteints · Zéro `any` dans 100% du code. Publié en v0.1.2.**

Dernière mise à jour : 2026-10-05.

---

## 0. RÉCAPITULATIF HISTORIQUE — Ce qui était cassé

### Bug 1 — `rs-ui init` ne reset pas le projet Expo créé → imports cassés
**Résolution** : ✅ Applique reset des fichiers template Expo (`app/index.tsx`, `app/_layout.tsx`, `app/(tabs)/*`, `components/*`, `hooks/*`, `constants/*`) via `resetExpoProject()`. Génère app/_layout.tsx : `<ThemeProvider><Slot /></ThemeProvider>` ; génère app/index.tsx showcase + babel.config.js plugin reanimated **en dernier**, tsconfig.paths `@/*`, package.json zustand & cie. Flag `--no-reset` préserve projet existant.

### Bug 2 — `rs-ui add safe-area-view` répond "tout déjà installé" → faux positif
**Résolution** : ✅ Séparation 3 ensembles dans `add.ts` :
- `requestedComponents` (demandés explicitement) → vérif `isComponentInstalled` sur config + `--force`.
- `transitiveDeps` (core files liquid/text/view) → vérif `existsSync` du fichier (pas config).
- `missingTransitive` → ceux qui manquent malgré "déjà installé" par config.
Pas de faux positif. `rs-ui add button` puis `safe-area-view` = fonctionne.

### Bug 3 — @rashwright/upload non distribué (workspace:*)
**Résolution** : ✅ Option C.2 (inline). Tout le code source déplacé dans `packages/ui-mobile/lib/upload/` (types, errors, upload-manager, 5 providers, barrel). imports upload-image/upload-video → `import { UploadManager } from "../../lib/upload";` → dependencies [] dans JSON, `ui-mobile package.json → files:["lib/**"]`.

---

## 1. OBJECTIFS (A/B/C/D) — 100%

| Objectif | Critères | Statut |
|---|---|---|
| **A. Reset Expo init** | resetExpoProject + `--no-reset` · writeBabelConfig (Reanimated plugin dernier) · updateTsconfig paths @/* · writeExpoRouterLayout · index showcase | ✅ TOUS |
| **B. rs-ui add correct (pas faux positif + transitives)** | requestedSet vs transitiveDeps vs missingTransitive, `--force`, existsSync vérif fichier réel | ✅ TOUS |
| **C. @rashwright/upload inline PAS workspace:* | `lib/upload/` (8 fichiers), registry dep=[], files[] contient lib/**, CLI dep ^0.1.0 PAS workspace:* | ✅ TOUS |
| **D. rs-ui add interactif @inquirer checkbox** | ↑/↓ · Espace · a (toggle all) · Entrée · filtrage frappe · groupés par catégorie · composants déjà installés disabled · `--no-interactive` alias | ✅ TOUS |

---

## 2. SCRIPTS QUI PASSENT (0 erreur)

- `bun run check-types → exit 0` (CLI + UI)
- `bun run validate-registry → exit 0` (55 composants, 55 sources, 8 contrôles)
- `bun run build:cli → exit 0` (50 modules bundleés → 137 KB, shebang `#!/usr/bin/env node` UNIQUE)
- `node packages/cli/dist/index.js --help → exit 0` (8 commandes Commander)
- `grep "any" packages/ui-mobile/types/ambient.d.ts → 0 match`
- `grep "require(" packages/cli/src → 0 match`

---

## 2. SCRIPTS QUI PASSENT (0 erreur) — v0.1.2 étendue

- `bun run check-types → exit 0` (CLI + UI, mode composite strict)
- `bun run validate-registry → exit 0` (55 composants, 55 sources, 8 contrôles, registry v0.1.2)
- `bun run build:cli → exit 0` (50 modules bundleés → 137 KB, shebang `#!/usr/bin/env node` UNIQUE, version dynamique)
- `node packages/cli/dist/index.js --help → exit 0` (8 commandes Commander)
- `grep "any" packages/ui-mobile/types/ambient.d.ts → 0 match`
- `grep "require(" packages/cli/src → 0 match`
- **NOUVEAU** `bun run --filter @rashwright/ui-mobile lint:any → 0 any` (était 67 en v0.1.1 — 100% éliminés sur 34 fichiers composants/hooks)
- **NOUVEAU** `bun run --filter @rashwright/cli smoke:all → exit 0` (version + lint require + lint shebang + semver dep-ui)

---

## 3. HORS SCOPE (v0.2.0+) — items déplacés depuis v0.1.1 & 0.1.2

### Release Notes v0.1.1 (2026-10-02)
- **Fix [Bug 1]** : `rs-ui init` reset template Expo cassé → `resetExpoProject()` appliqué.
- **Fix [Bug 2]** : `rs-ui add safe-area-view` faux positif "déjà installé" → split `requestedSet` / `transitiveDeps` / `missingTransitive`, vérif `existsSync` fichier réel, flag `--force`.
- **Fix [Bug 3]** : `@rashwright/upload = workspace:*` non distribué → Option C.2 inline `packages/ui-mobile/lib/upload/` (8 fichiers, 5 providers), dependencies=[].
- **Fix CLI bin + tsbuildinfo** : `npm pkg fix` bin[rs-ui] clean, `files[]` exclut `dist/.tsbuildinfo`.
- **Objectifs A/B/C/D** : 4/4 atteints (Reset Expo · Filtrage add · Upload inline · Checkbox interactive).
- **Qualité** : `bun run check-types` ✅ 0 erreur · `validate-registry` ✅ 0 erreur · `build:cli` shebang unique.

### Release Notes v0.1.2 (2026-10-05)
- **Hotfix compilation** : spacer.tsx `Unterminated string literal` — quotes mélangées `["theme']['spacing']` corrigées.
- **75 imports fondations** : Tous `../../contexts|constants|lib` et `../../../liquid` remplacés par alias `@/` (61 fichiers ui-mobile) + détection quotes mélangées sur 1 fichier.
- **Élimination TOTALE des 67 `any`** : 34 fichiers (button/badge/chip/carousel/drawer/modal/icon/icon-button/fab/empty-state/error-state/actions-grid/dropdown-menu/text-input/time-picker/upload-image/upload-video/video/text/view/switch/radio/slider/skeleton/shimmer/safe-area-view/scroll-view/flat-list/activity-indicator/skeleton/liquid-glow/highlight/pressable/surface + hooks/useScrollAwareTabBar)
  - forwardRef<any> → `React.ElementRef<typeof X>`
  - cloneElement<any> → `React.ReactElement<{color?,size?}>`
  - name as any → `satisfies string` (vector-icons IconName = string)
  - style/overlayStyle any → `StyleProp<ViewStyle>`
  - e: any event → `NativeSyntheticEvent<XxxEventData>`
  - useRef<any> → `ReturnType<typeof setInterval> | null` ou View
  - catch err:any → `unknown` + instanceof Error
  - Carousel générique : `CarouselProps<T>` avec `T[]` data/renderItem/onItemPress
- **Architecture CLI renforcée** : `detectProject()` (InitMode new/existing · componentsPath auto-détecté · package manager lock scan · SDK version résolu depuis node_modules) ; `createExpoProject()` (SDK pin 54→58 · bunx/npx runner) ; `mergeRashwrightConfigs()` (fusion profonde existing.components + override) ; `generateShowcaseScreen()` dual mode Expo Router app/_layout.tsx + index.tsx OU App.tsx classique.
- **Version CLI dynamique** : `createRequire(import.meta.url) + ../package.json` au lieu de hardcoded `"0.1.0"` (synchro fiable avec bump).
- **Registry synchro** : `registry/index.json "version": "0.1.2"` (était 0.1.1 désynchronisé).
- **Suite scripts npm** : 8 scripts racine (quality/preflight/dry-run/lint:any/...) + 13 scripts ui-mobile + 18 scripts CLI ; 8 utilitaires `scripts/*.mjs` (zero any / zero require / zero shebang / count / list / smoke).
- **Qualité** : `bun run quality` ⭐ GATE COMPLET = validate-registry → check-types → build:cli → smoke:all = **100% exit 0** sur 4 checks.

| Item | Priorité | Détail | Statut v0.1.2 |
|---|---|---|---|
| ~~`any` résiduels dans ~14 composants UI (badge/carousel/chip/button/drawer/flat-list/icon/actions-grid...) : 67 occurrences~~ | **MOYENNE — RÉSOLU v0.1.2** | Profil utilisateur "refus categorique de any". **100% éliminés : 67 → 0.** | ✅ RÉSOLU |
| P2-5 ambient.d.ts dans le package publié → conflits types user potentiels | FAIBLE | users installent de vrais peerDeps, risque faible. | ⏳ v0.2.0+ |
| P2-6 peerDependencies optionnels à compléter (expo-blur, expo-linear-gradient, vector-icons, expo-haptics, gesture-handler, image, video...) | FAIBLE | le peerDependenciesMeta seulement 2 optional actuellement. | ⏳ v0.2.0+ |
| Ambient : `callbacks onLoad onError` on pourrait rendre encore plus permissifs via génériques  `<T extends (...args: unknown[]) => void>`  | FAIBLE | `check-types` passe déjà, amélioration cosmétique. | ⏳ v0.2.0+ |
| P2-9 : tsconfig paths user non contrôlé par init | FAIBLE | init écrit paths, mais contrôle pas si l'utilisateur l'écrase après. | ⏳ v0.2.0+ |
