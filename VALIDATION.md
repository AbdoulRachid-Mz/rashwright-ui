# VALIDATION.md — Checklist Release Rashwright UI Mobile v0.2.0

Version cible : **@rashwright/ui-mobile@0.2.0** · **@rashwright/cli@0.2.0**  
Dernière validation : 2026-10-07 (v0.2.0 — Roadmap v0.2.0 complète : 61 composants, SDK 59, Vitest suite, Remote Registry, Diff LCS)

---

## 1. Checklist TypeScript strict & Zéro `any` (OBLIGATOIRE)

```bash
# Global (CLI + UI)
bun run check-types                       # Attendu : exit code 0
```

- [x] **Zéro `any`** : 0 occurrence dans `packages/ui-mobile/types/ambient.d.ts`
- [x] **Zéro `any`** : 0 occurrence dans l'ensemble des 61 composants (tous les `forwardRef`, `cloneElement`, gestionnaires d'événements et hooks typés avec rigueur)
- [x] **ESM strict** : 0 occurrence de `require()` dans `packages/cli/src` (fichiers sans `createRequire`)
- [x] **Shebang unique** : Ligne 1 de `packages/cli/dist/index.js` = `#!/usr/bin/env node`

Statut v0.2.0 : ✅ **PASS** (exit 0, 0 erreur)

---

## 2. Registry (61 composants)

```bash
bun run validate-registry
# Attendu : ✅ validate-registry : 0 erreur — 61 composants, 61 sources
```

Contrôles effectués (script `scripts/validate-registry.ts`) :
- [x] **I-1** : 61 composants listés dans `registry/index.json` correspondant exactement aux 61 fichiers JSON
- [x] **I-2** : Couverture complète par catégories, primitives core (`text`, `view`, `liquid/*`) isolées
- [x] **F-1** : Chaque fichier listé dans `files[]` existe sur le disque
- [x] **F-2** : Chaque composant source TSX possède son JSON associé
- [x] **R-1** : Dépendances internes `requiresComponents` existantes
- [x] **R-2** : Absence totale de cycle dans le graphe de dépendances
- [x] **C-1** : `expoDependencies` validées et autorisées
- [x] **C-2** : Version uniforme `1.0.0` dans les JSON de composants

Statut v0.2.0 : ✅ **PASS** (exit 0)

---

## 3. Tests unitaires Vitest (CLI)

```bash
bun run test
# Attendu : 10 test files passed, 55 tests passed (100%)
```

- [x] `config-manager.test.ts` (4 tests) : lecture, écriture, migration schéma v0.1 vers v0.2
- [x] `project-detector.test.ts` (5 tests) : détection de projet, reconnaissance de template Expo
- [x] `registry.test.ts` (5 tests) : lecture des définitions et filtrage
- [x] `dependency-resolver.test.ts` (7 tests) : résolution d'arbre, cycle detection, conflits de versions Expo
- [x] `starter-generator.test.ts` (7 tests) : reset template, génération layout et tsconfig
- [x] `file-manager.test.ts` (7 tests) : copie de fichiers et respect de l'arborescence liquid
- [x] `expo-detector.test.ts` (5 tests) : détection SDK 54 à 59
- [x] `package-manager.test.ts` (7 tests) : exécution bun/npm/pnpm/yarn et dry-run
- [x] `diff.test.ts` (3 tests) : algorithme LCS textuel
- [x] `remote-registry.test.ts` (5 tests) : cache disque 24h et fallback CDN

Statut v0.2.0 : ✅ **PASS** (55/55 réussis)

---

## 4. Build CLI & Smoke Tests

```bash
bun run build:cli
bun run --filter @rashwright/cli smoke:all
```

- [x] Compilation du CLI vers `packages/cli/dist/index.js` (bundle ESM 174.96 KB)
- [x] `node dist/index.js --version` affiche `0.2.0`
- [x] `cli-lint-require.mjs` confirme l'absence de `require()` anti-pattern
- [x] `cli-lint-shebang.mjs` confirme l'unicité du shebang
- [x] `cli-smoke-dep-ui.mjs` confirme la dépendance `@rashwright/ui-mobile: "^0.2.0"` (pas de `workspace:*`)

Statut v0.2.0 : ✅ **PASS** (exit 0)

---

## 5. Simulation npm publish (Dry-Run)

```bash
bun run dry-run
```

- [x] `@rashwright/ui-mobile` : tarball valide, arborescence complète (`components`, `constants`, `contexts`, `hooks`, `stores`, `theme`, `types`, `registry`, `lib/upload`, `assets`), 0 anomalie.
- [x] `@rashwright/cli` : tarball valide (`dist/index.js`, `README.md`), dépendance semver réelle vers `@rashwright/ui-mobile`.

Statut v0.2.0 : ✅ **PASS**

---

## 6. Synthèse Quality Gate

```bash
bun run quality
```
Exécute d'une seule traite :
1. `validate-registry`
2. `check-types` (CLI + UI-Mobile)
3. `test` (Vitest)
4. `build:cli`
5. `smoke:all`

**Résultat final : 100% vert (exit code 0). Le monorepo est prêt pour la publication npm v0.2.0 (Phase 7).**
