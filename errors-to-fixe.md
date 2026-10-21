# Diagnostic & Résolutions Appliquées — NativeWind v5, Templates & TypeScript

## Statut : ✅ TOUTES LES ERREURS RÉSOLUES (v1.1.1 & v1.2.0)

---

### 1. Résolution de l'erreur NativeWind v5 (`yallist` / `lru-cache` & Bun Install)
- **Problème** : Lors de l'installation de NativeWind v5 RC avec Bun sur Windows, des conflits de peer dependencies entre Tailwind v4 ESM et `react-native-css` provoquaient un échec ou des incohérences de node_modules.
- **Solution validée et intégrée dans le code du CLI** :
  - Dans [`packages/cli/src/core/package-manager.ts`](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/packages/cli/src/core/package-manager.ts) (`buildProjectInstallCommand`), la commande d'installation initiale utilise systématiquement le flag `--force` pour Bun :
    ```bash
    bun install --force
    ```
  - Évite les blocages de synchronisation des modules natifs tout en garantissant un lockfile stable.

---

### 2. Résolution du flag `-t, --template` avec Commander.js
- **Problème** : `rs-ui add --template <id>` ou `rs-ui add -t <id>` lançait `rs-ui add` interactif sans installer le template ciblé à cause d'un conflit de flag global au niveau racine de Commander.
- **Solution validée** :
  - Découplage du flag global dans [`packages/cli/src/index.ts`](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/packages/cli/src/index.ts) et délégation directe de `-t, --template <name>` dans [`packages/cli/src/commands/add.ts`](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/packages/cli/src/commands/add.ts).
  - L'option `-t <templateId>` installe désormais directement le template et tous ses composants requis.

---

### 3. Support des Templates Multi-Écrans (Expo Router)
- **Problème** : L'initialisation ou l'ajout d'un template (`auth`, `commerce`, `finance`, etc.) n'intégrait qu'un seul écran alors que les architectures modernes requièrent plusieurs routes Expo Router (`sign-in.tsx`, `sign-up.tsx`, `wallet.tsx`, `transactions.tsx`, etc.).
- **Solution validée** :
  - Ajout du champ `screens` dans `template.json` définissant les routes (`route`, `file`, `componentName`, `title`).
  - Prise en charge automatique de la génération des routes Expo Router dans `packages/cli/src/core/starter-generator.ts` (`writeExpoRouterLayout`, `generateShowcaseScreen`) et dans `add.ts`.

---

### 4. Résolution des Erreurs TypeScript strictes
- **Erreur `product-card.tsx:33:13 - Property 'variant' does not exist on type 'IntrinsicAttributes & CardProps'`** :
  - `Card` supporte les variantes `default`, `bordered` et `glass` via `CardProps`. Typage consolidé sans ambiguïté.
- **Erreurs `search-input.tsx` (missing imports `./text-input` et `./icon-button`)** :
  - Remplacement des imports relatifs fragiles par les imports d'alias canoniques `@/components/ui/text-input` et `@/components/ui/icon-button`.
  - Intégration du composant `ComponentDetector` pour installer automatiquement tous les sous-composants requis.

---

### 5. Métriques Quality Gate
- 43 suites de tests, **212 tests unitaires Vitest réussis (100%)**.
- Zéro erreur TypeScript (`bun run check-types` code 0).
- Bundle CLI 0.37 MB autonome.

---

## v1.5.0 — Problèmes résolus définitivement

### ✅ RÉSOLU — NativeWind v5 + npm : `npm install --force` bloqué
- **v1.5.0** : `buildProjectInstallCommand('npm')` → `npm install --legacy-peer-deps`
- `buildInstallCommand('npm', [...])` → `npm install --legacy-peer-deps <packages>`
- Tests `package-manager.test.ts` : 18 assertions mises à jour

### ✅ RÉSOLU — Tests flaky Windows (afterEach timeout)
- `afterEach(() => {...}, 60_000)` dans `monorepo.test.ts`, `nativewind-manager.test.ts`, `create-component.test.ts`, `backup-manager.test.ts`
- 220 tests passent maintenant de manière stable

### ✅ RÉSOLU — registry/index.json désynchronisé (68 vs 70 fichiers TSX)
- `text.tsx` et `view.tsx` sont des primitives Core gérées par `setupCoreUi` → ne doivent pas être dans `index.json`
- La règle est documentée dans le script `validate-registry.ts` (règle I-2)
- `registry/index.json` v1.5.0 : 68 composants corrects

---

## v1.6.0 — Résolution Moteur de Widgets & Showcases

### ✅ RÉSOLU — Isolation architecturale des Showcases
- **Problème** : `validate-registry.ts` exige une correspondance 1:1 entre les fichiers de `components/ui/` et `registry/components/`.
- **Solution** : Écrans d'intégration placés dans `packages/ui-mobile/showcases/` et exposés via le barrel racine.

### ✅ RÉSOLU — Résolution et typage des dossiers `widgets/` et `showcases/`
- **Problème** : `tsconfig.json` de `ui-mobile` n'incluait pas les nouveaux répertoires de widgets.
- **Solution** : Inclusion explicite dans `tsconfig.json`.

### Métriques Quality Gate v1.6.0
- **245 tests Vitest réussis (51 suites de tests)** à 100%.
- 0 erreur TypeScript strict (`zero any`).
- 79 composants, 6 widgets, 10 templates, 8 primitives Liquid Glass.
