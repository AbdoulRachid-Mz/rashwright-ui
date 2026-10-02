# errors.md — Rashwright UI Mobile v0.1.1 (POST-CORRECTIONS)

**Statut** : **3 Bugs 100% corrigés · 4 Objectifs 100% atteints. Publié en v0.1.1.**

Dernière mise à jour : 2026-10-02.

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

## 3. CHOSES ENCORE À FAIRE (HORS SCOPE errors.md — v0.2.0+)
### Release Notes v0.1.1 (2026-10-02)
- **Fix [Bug 1]** : `rs-ui init` reset template Expo cassé → `resetExpoProject()` appliqué.
- **Fix [Bug 2]** : `rs-ui add safe-area-view` faux positif "déjà installé" → split `requestedSet` / `transitiveDeps` / `missingTransitive`, vérif `existsSync` fichier réel, flag `--force`.
- **Fix [Bug 3]** : `@rashwright/upload = workspace:*` non distribué → Option C.2 inline `packages/ui-mobile/lib/upload/` (8 fichiers, 5 providers), dependencies=[].
- **Fix CLI bin + tsbuildinfo** : `npm pkg fix` bin[rs-ui] clean, `files[]` exclut `dist/.tsbuildinfo`.
- **Objectifs A/B/C/D** : 4/4 atteints (Reset Expo · Filtrage add · Upload inline · Checkbox interactive).
- **Qualité** : `bun run check-types` ✅ 0 erreur · `validate-registry` ✅ 0 erreur · `build:cli` shebang unique.

| Item | Priorité | Détail |
|---|---|---|
| `any` résiduels dans ~14 composants UI (badge/carousel/chip/button/drawer/flat-list/icon/actions-grid/...) — environ 30 occurrences de `any` dans le code original | MOYENNE | Profil utilisateur "refus categorique de any". Ces any étaient hors scope errors.md mais identifiés. |
| P2-5 ambient.d.ts dans le package publié → conflits types user potentiels | FAIBLE | users installent de vrais peerDeps, risque faible. |
| P2-6 peerDependencies optionnels à compléter (expo-blur, expo-linear-gradient, vector-icons, expo-haptics, gesture-handler, image, video...) | FAIBLE | le peerDependenciesMeta seulement 2 optional actuellement. |
| Ambient : `callbacks onLoad onError` on pourrait rendre encore plus permissifs via génériques  <T extends (...args: unknown[]) => void>`  | FAIBLE | `check-types` passe déjà, amélioration cosmétique. |
| P2-9 : tsconfig paths user non contrôlé par init | FAIBLE | init écrit paths, mais contrôle pas si l'utilisateur l'écrase après. |
