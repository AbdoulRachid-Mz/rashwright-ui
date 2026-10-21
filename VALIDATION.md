# VALIDATION.md — Checklist Release Rashwright UI Mobile (v1.6.0)

Version cible : **@rashwright/ui-mobile@1.6.0** · **@rashwright/cli@1.6.0**  
Dernière validation : 2026-10-21 (245 tests Vitest, 51 suites, Quality Gate 100% vert, 0 erreur TypeScript strict)

---

## 1. Checklist TypeScript strict & Zéro `any` (OBLIGATOIRE)

```bash
bun run check-types                       # Attendu : exit code 0
```

- [x] **Zéro `any`** : 0 occurrence dans `packages/ui-mobile/types/ambient.d.ts`
- [x] **Zéro `any`** : 0 occurrence dans l'ensemble des 79 composants atomiques, 6 widgets modulaires, 2 showcases et 10 templates modulaires
- [x] **ESM strict** : 0 occurrence de `require()` dans `packages/cli/src` (fichiers sans `createRequire`)
- [x] **Shebang unique** : Ligne 1 de `packages/cli/dist/index.js` = `#!/usr/bin/env node`
- [x] **Typage Widgets** : Types stricts exportés pour chaque widget (`MetricWidgetProps`, `FinanceWidgetProps`, etc.)
- [x] **Accessibilité WCAG 2.1 AA** : `accessibilityRole`, `accessibilityState`, `accessibilityLabel` sur tous les composants interactifs et widgets

Statut : ✅ **PASS** (exit 0, 0 erreur)

---

## 2. Registry (79 composants + 6 widgets + 10 templates)

```bash
bun run validate-registry
# Attendu : ✅ validate-registry : 0 erreur — 79 composants, 79 sources
```

Contrôles effectués (`scripts/validate-registry.ts`) :
- [x] **I-1** : 79 composants listés dans `registry/index.json` correspondant exactement aux 79 fichiers JSON
- [x] **I-2** : Primitives core (`text`, `view`, `liquid/*`) isolées
- [x] **F-1** : Chaque fichier listé dans `files[]` existe sur le disque
- [x] **F-2** : Chaque composant source TSX possède son JSON associé
- [x] **R-1** : Dépendances internes `requiresComponents` existantes et validées
- [x] **R-2** : Absence totale de cycle dans le graphe de dépendances
- [x] **C-1** : `expoDependencies` validées et autorisées
- [x] **C-2** : Version uniforme dans les JSON de composants (1.6.0)
- [x] **W-1** : 6 widgets modulaires (`widgets/*/widget.json`) valides et découvrables
- [x] **T-1** : 10 manifestes `template.json` autonomes valides dans `packages/ui-mobile/templates/`

Statut : ✅ **PASS** (exit 0)

---

## 3. Validation Maestro E2E (6 flows)

```bash
bun run validate-maestro
```

- [x] `app-launch.yaml` validé
- [x] `auth-flow.yaml` validé
- [x] `chat-flow.yaml` validé
- [x] `commerce-flow.yaml` validé
- [x] `finance-flow.yaml` validé
- [x] `theme-switch.yaml` validé

Statut : ✅ **PASS** (exit 0)

---

## 4. Tests unitaires Vitest (51 suites, 245 tests)

```bash
bun run test
# Attendu : 51 test files passed, 245 tests passed (100%)
```

- [x] `widgets-registry.test.ts` (8 tests) : découverte, lookup avec/sans suffixe, résolution de dépendances
- [x] `widget-command.test.ts` (3 tests) : commandes `rs-ui widget list/info/help`
- [x] `add-widget.test.ts` (2 tests) : options `-w / --widget` et installation conditionnelle
- [x] `e2e-widget-install.test.ts` (5 tests) : scénario complet d'installation de widget dans projet simulé
- [x] `tabs-component.test.ts` (6 tests)
- [x] `add-template.test.ts` (2 tests)
- [x] `templates-registry.test.ts` (6 tests)
- [x] `templates-manager.test.ts` (7 tests)
- [x] `package-manager.test.ts` (18 tests) : `--legacy-peer-deps` pour npm
- [x] `nativewind-manager.test.ts` (7 tests) : v4 et v5
- [x] `lock-manager.test.ts` (4 tests) : intégrité SHA-256 composants, widgets et templates
- [x] `hooks-manager.test.ts` (4 tests)
- [x] `backup-manager.test.ts` (5 tests)
- [x] `mcp.test.ts` (13 tests)
- [x] `init.test.ts` (5 tests)
- [x] `new-components.test.ts` (7 tests) : validation des 11 utilitaires mobiles v1.5.0

Statut : ✅ **PASS** (245/245 réussis)

---

## 5. Build CLI & Smoke Tests

```bash
bun run build:cli
bun run --filter @rashwright/cli smoke:all
```

- [x] Compilation du CLI vers `packages/cli/dist/index.js` (bundle ESM autonome ~0.40 MB)
- [x] `node dist/index.js --version` affiche `1.6.0`
- [x] `cli-lint-require.mjs` confirme l'absence de `require()` anti-pattern (0 occurrence)
- [x] `cli-lint-shebang.mjs` confirme l'unicité du shebang (`#!/usr/bin/env node`)
- [x] `cli-smoke-dep-ui.mjs` confirme que `@rashwright/ui-mobile` est une version semver valide (`^1.0.0`)

Statut : ✅ **PASS** (exit 0)
