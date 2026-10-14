# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI MOBILE (v0.8.0 → v1.0.0)

> **Fichier de suivi dynamique (`TASK.md`)**  
> Dernière mise à jour : 2026-10-14  
> Statut général : **v0.7.3 Validée (155 tests Vitest réussis, 32 suites de tests, Quality Gate 100% vert, 0 erreur TypeScript strict)**

---

## 📊 Tableau de bord d'avancement des versions

| Version | Intitulé / Objectif | Statut | Progression |
|---|---|---|:---:|
| **v0.7.0** | Templates Modulaires Autonomes & Découverte CLI | ✅ Validé | 20 / 20 tâches |
| **v0.7.1** | Correctif Ordre d'Installation Expo (`ConfigError`) | ✅ Validé | 4 / 4 tâches |
| **v0.7.2** | Correctif `rs-ui init .` (Scope & Création Expo) | ✅ Validé | 3 / 3 tâches |
| **v0.7.3** | Correctif Dépendances Obligatoires (`expo-router`, Web) | ✅ Validé | 3 / 3 tâches |
| **Patch Tabs** | Audit & Refonte Complète du composant Tabs (Accessibilité, Layout) | ✅ Validé | 6 / 6 tâches |
| **v0.8.0** | Primitives Headless Mobiles & Registre RFC v4 | 🔄 En cours | 2 / 12 tâches |
| **v0.9.0** | AST Transformers & Dual Styling Engine (NativeWind v4) | ⏳ Planifié | 0 / 10 tâches |
| **v1.0.0** | Release Majeure : MCP Server IA & Standardisation Finale | ⏳ Planifié | 0 / 8 tâches |

---

## 📝 Détail des tâches par Phase

### Phase 1 : Correctifs Critiques v0.7.1 à v0.7.3 & Patch Tabs (✅ ACHEVÉ)

* [x] **TASK-7.3.1** : Résoudre l'ordre d'installation des dépendances dans `init.ts` (Étape A: `bun install`, Étape B: `expo install`, Étape C: `bun add`).
* [x] **TASK-7.3.2** : Corriger le comportement de l'argument `.` dans `rs-ui init .` pour ne pas sauter `create-expo-app` et hisser `isFreshProject` au scope externe.
* [x] **TASK-7.3.3** : Ajouter dans `CORE_EXPO_DEPS` : `expo-router`, `react-native-screens`, `expo-constants`, `expo-linking`, ainsi que `react-dom` et `react-native-web`.
* [x] **TASK-7.3.4** : Auditer et refondre le composant `Tabs` :
  - Suppression de `zIndex: -1` sur `activeCapsule`.
  - Suppression de `flex: 1` sur la racine au profit de `width: "100%"`.
  - Implémentation du mode contrôlé/non-contrôlé canonique (`isControlled`).
  - Ajout de la prop `scrollable` sur `TabsList`.
  - Ajout des attributs d'accessibilité `accessibilityRole="tab"` et `accessibilityState`.
* [x] **TASK-7.3.5** : Écrire la suite de tests de non-régression `tests/tabs-component.test.ts` (6 tests).
* [x] **TASK-7.3.6** : Mettre à jour `skills/tabs/SKILL.md` et `registry/components/tabs.json` (`supportsGlass: true`).

---

### Phase 2 : Primitives Headless Mobiles & Registre Universel RFC v4 (v0.8.0)

* [x] **TASK-8.1.1** : Analyse comparative détaillée du fork `shadcn/ui` vs `rashwright-ui` dans `ANALYSIS.md`.
* [x] **TASK-8.1.2** : Rédaction du plan stratégique d'alignement architectural dans `PLAN.md`.
* [x] **TASK-8.1.3** : Créer le module de primitives headless `@/lib/primitives/use-controllable-state.ts` (gestion unifiée contrôlé/non-contrôlé).
* [x] **TASK-8.1.4** : Créer le hook `@/lib/primitives/use-disclosure.ts` pour modales, bottom-sheets et tiroirs.
* [x] **TASK-8.1.5** : Harmoniser l'accessibilité WAI-ARIA mobile (`accessibilityRole`, `accessibilityState`) et appliquer `useControllableState` sur `accordion` et `collapsible`.
* [x] **TASK-8.1.6** : Définir le schéma d'item de registre RFC v4 zéro-dépendance (`packages/cli/src/core/schema.ts`) avec support des types : `registry:ui`, `registry:hook`, `registry:lib`, `registry:block`.
* [x] **TASK-8.1.7** : Écrire la suite de tests unitaires `tests/headless-primitives.test.ts` (5 tests validant les primitives et le validateur de schéma).
* [ ] **TASK-8.1.8** : Découpler les hooks autonomes existants (`use-device`, `use-back-handler`, `use-scroll-aware-tab-bar`) dans le registre comme des items installables via `rs-ui add hook:<name>`.
* [ ] **TASK-8.1.9** : Ajouter la commande `rs-ui add <type>:<nom>` dans le CLI pour gérer tous les types d'items.
* [ ] **TASK-8.1.10** : Mettre à jour `scripts/validate-registry.ts` pour valider les nouveaux types d'items.
* [ ] **TASK-8.1.11** : Valider le Quality Gate 100% vert (160 tests Vitest) et préparer la release v0.8.0.

---

### Phase 3 : AST Transformers & Dual Styling Engine (v0.9.0)

* [ ] **TASK-9.1.1** : Créer le moteur de transformation AST `packages/cli/src/core/transformers/transform-imports.ts` pour réécrire dynamiquement les alias d'imports selon le `tsconfig.json` local.
* [ ] **TASK-9.1.2** : Définir la configuration `styleEngine` dans `rashwright-ui.json` (`"stylesheet"` | `"nativewind"`).
* [ ] **TASK-9.1.3** : Implémenter l'utilitaire `cn` (`clsx` + `tailwind-merge`) dans `packages/ui-mobile/lib/utils.ts`.
* [ ] **TASK-9.1.4** : Créer les variantes NativeWind v4 pour les composants basiques (`button`, `card`, `badge`, `text-input`).
* [ ] **TASK-9.1.5** : Ajouter le support de `cva` (class-variance-authority) pour les variantes de composants mobiles.
* [ ] **TASK-9.1.6** : Adapter `rs-ui init` avec prompt de choix du moteur de style (StyleSheet pur vs NativeWind Tailwind).
* [ ] **TASK-9.1.7** : Écrire les tests unitaires des Transformers AST dans `packages/cli/tests/transformers.test.ts`.
* [ ] **TASK-9.1.8** : Valider la compatibilité avec Expo SDK 54 à 59 en mode NativeWind.
* [ ] **TASK-9.1.9** : Documenter le guide de migration StyleSheet → NativeWind.
* [ ] **TASK-9.1.10** : Release v0.9.0.

---

### Phase 4 : Release Majeure v1.0.0 & Serveur MCP IA

* [ ] **TASK-10.1.1** : Développer le serveur Model Context Protocol (MCP) `packages/cli/src/mcp/` pour permettre aux assistants IA d'inspecter le registre en temps réel.
* [ ] **TASK-10.1.2** : Ajouter la commande `rs-ui mcp` pour enregistrer automatiquement le serveur MCP dans les configurations Cursor / VS Code / Claude Desktop.
* [ ] **TASK-10.1.3** : Implémenter la recherche floue `rs-ui search <query>` dans le terminal.
* [ ] **TASK-10.1.4** : Enrichir `rs-ui diff` avec affichage couleur side-by-side et patch interactif.
* [ ] **TASK-10.1.5** : Finaliser le catalogue complet des 61 composants en double mode (StyleSheet / NativeWind).
* [ ] **TASK-10.1.6** : Refonte du site de documentation et showcase interactif Expo Snack / Web.
* [ ] **TASK-10.1.7** : Audit de sécurité, de performance et validation finale de l'idempotence.
* [ ] **TASK-10.1.8** : Release officielle **v1.0.0**.

---

## 📌 Journal des actions effectuées

### 2026-10-14
- Audit et refonte complète du composant `Tabs` (`packages/ui-mobile/components/ui/tabs.tsx`) : suppression de `zIndex: -1`, `width: 100%`, support contrôlé/non-contrôlé, `scrollable`, accessibilité ARIA.
- Mise à jour de `packages/ui-mobile/skills/tabs/SKILL.md` et `packages/ui-mobile/registry/components/tabs.json` (`supportsGlass: true`).
- Création du test unitaire `packages/cli/tests/tabs-component.test.ts` (6 tests).
- Exécution de la suite Vitest : **155 tests passés (32 suites)**, typecheck strict 100% vert.
- Rédaction du rapport de correction dans `errors.md`.
- Analyse comparative détaillée du fork `chadcn-ui-fork` dans `ANALYSIS.md`.
- Élaboration du plan stratégique inspiré de shadcn dans `PLAN.md`.
