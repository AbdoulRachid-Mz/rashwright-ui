# VALIDATION.md — Checklist Release Rashwright UI Mobile (v0.7.3+)

Version cible : **@rashwright/ui-mobile@0.7.1** · **@rashwright/cli@0.7.3**  
Dernière validation : 2026-10-14 (155 tests Vitest, 32 suites, Quality Gate 100% vert, 0 erreur TypeScript strict)

---

## 1. Checklist TypeScript strict & Zéro `any` (OBLIGATOIRE)

```bash
bun run check-types                       # Attendu : exit code 0
```

- [x] **Zéro `any`** : 0 occurrence dans `packages/ui-mobile/types/ambient.d.ts`
- [x] **Zéro `any`** : 0 occurrence dans l'ensemble des 61 composants et 7 templates modulaires
- [x] **ESM strict** : 0 occurrence de `require()` dans `packages/cli/src` (fichiers sans `createRequire`)
- [x] **Shebang unique** : Ligne 1 de `packages/cli/dist/index.js` = `#!/usr/bin/env node`
- [x] **Composant Tabs** : Typage ViewStyle rigoureux, mode contrôlé/non-contrôlé typé, support scrollable

Statut : ✅ **PASS** (exit 0, 0 erreur)

---

## 2. Registry (61 composants + 7 templates)

```bash
bun run validate-registry
# Attendu : ✅ validate-registry : 0 erreur — 61 composants, 61 sources
```

Contrôles effectués (`scripts/validate-registry.ts`) :
- [x] **I-1** : 61 composants listés dans `registry/index.json` correspondant exactement aux 61 fichiers JSON
- [x] **I-2** : Couverture complète par catégories, primitives core (`text`, `view`, `liquid/*`) isolées
- [x] **F-1** : Chaque fichier listé dans `files[]` existe sur le disque
- [x] **F-2** : Chaque composant source TSX possède son JSON associé
- [x] **R-1** : Dépendances internes `requiresComponents` existantes et validées
- [x] **R-2** : Absence totale de cycle dans le graphe de dépendances
- [x] **C-1** : `expoDependencies` validées et autorisées
- [x] **C-2** : Version uniforme dans les JSON de composants
- [x] **T-1** : 7 manifestes `template.json` autonomes valides dans `packages/ui-mobile/templates/`

Statut : ✅ **PASS** (exit 0)

---

## 3. Tests unitaires Vitest (CLI & Composants)

```bash
bun run test
# Attendu : 32 test files passed, 155 tests passed (100%)
```

- [x] `tabs-component.test.ts` (6 tests) : non-régression layout Tabs, pas de `flex: 1` racine, pas de `zIndex: -1`, accessibilité ARIA, registre et skill
- [x] `add-template.test.ts` (2 tests) : option `-t / --template` et scellement lockfile
- [x] `templates-registry.test.ts` (6 tests) : découverte et validation des 7 templates autonomes
- [x] `templates-manager.test.ts` (7 tests) : génération et copie modulaire des templates
- [x] `package-manager.test.ts` (16 tests) : exécution bun/npm/pnpm/yarn, ordre d'installation base avant expo
- [x] `init.test.ts` (5 tests) : initialisation de nouveau projet et arguments de chemin
- [x] `lock-manager.test.ts` (4 tests) : intégrité SHA-256 composants et templates
- [x] `hooks-manager.test.ts` (4 tests) : exécution des hooks pré/post
- [x] `backup-manager.test.ts` (5 tests) : snapshots de sécurité et restauration
- [x] `backup-commands.test.ts` (3 tests) : commandes CLI backup/restore
- [x] `migration-runner.test.ts` (5 tests) : migrations de schéma système
- [x] `create-component.test.ts` (5 tests) : scaffolding de composant projet et skill IA
- [x] `scoped-registry.test.ts` (4 tests) : registres scopés distants
- [x] `skills-manager.test.ts` (7 tests) : parsing frontmatter YAML et validation des compétences IA
- [x] `skill-command.test.ts` (2 tests) : commandes `rs-ui skill list/update`
- [x] `config-manager.test.ts` (4 tests) : lecture et écriture `rashwright-ui.json`
- [x] `project-detector.test.ts` (5 tests) : détection de projet React Native / Expo
- [x] `expo-detector.test.ts` (5 tests) : détection SDK 54 à 59
- [x] `dependency-resolver.test.ts` (7 tests) : résolution d'arbre de dépendances
- [x] `starter-generator.test.ts` (7 tests) : reset de template Expo et architecture /src
- [x] `file-manager.test.ts` (8 tests) : préservation arborescence sous-dossiers liquid
- [x] `theme.test.ts` (5 tests) : 10 thèmes presets et custom theme engine
- [x] `diff.test.ts` (3 tests) : algorithme LCS textuel
- [x] `inspector.test.ts` (5 tests) : commandes info, deps, why
- [x] `smart-update.test.ts` (2 tests) : détection de changements et diff
- [x] `multi-version.test.ts` (2 tests) : support des versions explicites `@ver`
- [x] `monorepo.test.ts` (3 tests) : détection monorepos Bun/pnpm/yarn/npm
- [x] `remote-registry.test.ts` (5 tests) : cache disque 24h et fallback CDN
- [x] `reset.test.ts` (4 tests) : commande `rs-ui reset` et archivage réversible
- [x] `list.test.ts` (2 tests) : commande `rs-ui list` et catalogue templates
- [x] `banner.test.ts` (2 tests) : rendu visuel bannière CLI
- [x] `registry.test.ts` (5 tests) : inspection du registre de composants

Statut : ✅ **PASS** (155/155 réussis)

---

## 4. Build CLI & Smoke Tests

```bash
bun run build:cli
bun run --filter @rashwright/cli smoke:all
```

- [x] Compilation du CLI vers `packages/cli/dist/index.js` (bundle ESM autonome ~280 KB)
- [x] `node dist/index.js --version` affiche `0.7.3`
- [x] `cli-lint-require.mjs` confirme l'absence de `require()` anti-pattern
- [x] `cli-lint-shebang.mjs` confirme l'unicité du shebang
- [x] `cli-smoke-dep-ui.mjs` confirme la dépendance semver réelle `@rashwright/ui-mobile: "^0.7.1"`

Statut : ✅ **PASS** (exit 0)

---

## 5. Synthèse Quality Gate

```bash
bun run quality
```
Exécute d'une seule traite :
1. `validate-registry`
2. `check-types` (CLI + UI-Mobile)
3. `test` (155 tests Vitest)
4. `build:cli`
5. `smoke:all`

**Résultat final : 100% vert (exit code 0). Le monorepo est entièrement validé.**
