# PROMPT TYPE — DÉVELOPPEMENT & MAINTENANCE RASHWRIGHT UI MOBILE

Ce document définit les directives, contraintes et conventions à respecter pour toute intervention sur le dépôt `AbdoulRachid-Mz/rashwright-ui`.

---

## 1. Objectifs Généraux
1. Maintenir et faire évoluer le système de distribution de composants React Native / Expo inspiré de la philosophie **shadcn/ui**.
2. Garantir une expérience d'initialisation (`rs-ui init`) et d'ajout (`rs-ui add`) fluide, idempotente et sans friction sur tout environnement Expo SDK (SDK 54 à 59).
3. Préserver la séparation claire entre primitives core réutilisables, composants atomiques, templates modulaires et configuration du projet utilisateur.
4. Tolérance zéro pour le type `any` : TypeScript strict sur 100% du monorepo.
5. Ne jamais déclarer un correctif réussi sans avoir exécuté les tests de non-régression et le Quality Gate (`bun run quality`).

---

## 2. Contraintes Techniques Essentielles

### A. Initialisation & Dépendances
- Respecter l'ordre impératif d'installation en 3 étapes :
  1. `installProjectDependencies` : installe les paquets de base (`expo`, `react-native`, etc.) pour créer `node_modules/expo`.
  2. `installExpoPackages` : installe les dépendances natives compatibles via `expo install` (`expo-router`, `react-native-screens`, `expo-constants`, `expo-linking`, `react-native-reanimated`, etc.).
  3. `installNpmPackages` : installe les bibliothèques pures JavaScript (`zustand`, etc.).
- Pour `rs-ui init .` : `useCurrentDirectory = false` doit être conservé afin que `create-expo-app .` s'exécute bien dans le dossier courant et génère le `package.json`.
- Gérer systématiquement les dépendances web Expo (`react-dom`, `react-native-web`) lorsque `app.json` supporte la plateforme web.

### B. Primitives & Composants UI
- Ne jamais imposer de `flex: 1` sur la racine d'un composant de layout sans justification stricte (privilégier `width: "100%"` ou `alignSelf: "stretch"`).
- Ne jamais utiliser de `zIndex` négatif (`zIndex: -1`) pour les capsules ou arrière-plans animés : cela casse le contexte d'empilement sur Android et sous `LiquidSurface`.
- Supporter systématiquement les deux modes React pour les composants à état :
  - **Mode non contrôlé** : avec `defaultValue` et state interne.
  - **Mode contrôlé** : avec `value` et `onValueChange`.
- Exposer obligatoirement les attributs d'accessibilité vocale WAI-ARIA mobile :
  - `accessibilityRole` (`tab`, `button`, `switch`, `dialog`, etc.).
  - `accessibilityState` (`selected`, `disabled`, `expanded`, etc.).

### C. Registry & Documentation IA
- Tout nouveau composant ou modification majeure doit synchroniser :
  1. Le fichier source TSX dans `packages/ui-mobile/components/ui/`.
  2. La fiche JSON dans `packages/ui-mobile/registry/components/<name>.json` (avec `supportsGlass`, `requiresComponents`, `expoDependencies`).
  3. Le guide IA dans `packages/ui-mobile/skills/<name>/SKILL.md` avec un exemple complet et fonctionnel.
  4. L'export dans `packages/ui-mobile/components/ui/index.ts` et `starter-generator.ts`.

---

## 3. Workflow de Validation Obligatoire

Avant de soumettre tout changement :
```bash
# 1. Validation de l'intégrité du registre
bun run validate-registry

# 2. Vérification TypeScript strict
bun run check-types

# 3. Exécution de la suite Vitest (32 suites, 155+ tests)
bun run test

# 4. Compilation du CLI
bun run build:cli

# 5. Quality Gate complet
bun run quality
```