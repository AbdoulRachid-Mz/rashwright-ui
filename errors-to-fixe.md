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