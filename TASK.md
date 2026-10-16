# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI MOBILE (v0.9.0 → v1.0.0)

> **Fichier de suivi dynamique (`TASK.md`)**  
> Dernière mise à jour : 2026-10-14  
> Statut général : **v0.9.0 Publiée (171 tests Vitest réussis, 35 suites de tests, Quality Gate 100% vert, 0 erreur TypeScript strict)**

---

## 📊 Tableau de bord d'avancement des versions

| Version | Intitulé / Objectif | Statut | Progression |
|---|---|---|:---:|
| **v0.7.0** | Templates Modulaires Autonomes & Découverte CLI | ✅ Validé | 20 / 20 tâches |
| **v0.7.1** | Correctif Ordre d'Installation Expo (`ConfigError`) | ✅ Validé | 4 / 4 tâches |
| **v0.7.2** | Correctif `rs-ui init .` (Scope & Création Expo) | ✅ Validé | 3 / 3 tâches |
| **v0.7.3** | Correctif Dépendances Obligatoires (`expo-router`, Web) | ✅ Validé | 3 / 3 tâches |
| **Patch Tabs** | Audit & Refonte Complète du composant Tabs (Accessibilité, Layout) | ✅ Validé | 6 / 6 tâches |
| **v0.8.0** | Primitives Headless Mobiles & Registre RFC v4 | ✅ Validé | 11 / 11 tâches |
| **v0.9.0** | Intégration NativeWind (v4 & v5) & Indépendance Native | ✅ Publié | 10 / 10 tâches |
| **v1.0.0** | Release Majeure : MCP Server IA, Grille Responsive & Standardisation Finale | ✅ Validé | 8 / 8 tâches |

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

### Phase 2 : Primitives Headless Mobiles & Registre Universel RFC v4 (v0.8.0 ✅ ACHEVÉ)

* [x] **TASK-8.1.1** : Analyse comparative détaillée du fork `shadcn/ui` vs `rashwright-ui` dans `ANALYSIS.md`.
* [x] **TASK-8.1.2** : Rédaction du plan stratégique d'alignement architectural dans `PLAN.md`.
* [x] **TASK-8.1.3** : Créer le module de primitives headless `@/lib/primitives/use-controllable-state.ts` (gestion unifiée contrôlé/non-contrôlé).
* [x] **TASK-8.1.4** : Créer le hook `@/lib/primitives/use-disclosure.ts` pour modales, bottom-sheets et tiroirs.
* [x] **TASK-8.1.5** : Harmoniser l'accessibilité WAI-ARIA mobile (`accessibilityRole`, `accessibilityState`) et appliquer `useControllableState` sur `accordion` et `collapsible`.
* [x] **TASK-8.1.6** : Définir le schéma d'item de registre RFC v4 zéro-dépendance (`packages/cli/src/core/schema.ts`) avec support des types : `registry:ui`, `registry:hook`, `registry:lib`, `registry:block`.
* [x] **TASK-8.1.7** : Écrire la suite de tests unitaires `tests/headless-primitives.test.ts` (5 tests validant les primitives et le validateur de schéma).
* [x] **TASK-8.1.8** : Découpler les hooks autonomes existants (`use-device`, `use-back-handler`, `use-scroll-aware-tab-bar`, `use-controllable-state`, `use-disclosure`) et les libs (`upload`, `primitives`) dans `packages/ui-mobile/registry/hooks/*.json` et `registry/lib/*.json`.
* [x] **TASK-8.1.9** : Résolution universelle des destinations de fichiers (`hooks/` → `src/hooks/`, `lib/` → `src/lib/`, `components/ui/` → `src/components/ui/`) avec support multi-types dans le CLI.
* [x] **TASK-8.1.10** : Mettre à jour `scripts/validate-registry.ts` pour valider hooks, libs et composants sans régression.
* [x] **TASK-8.1.11** : Valider le Quality Gate 100% vert (tests d'installation RFC v4 dans `rfc-registry-install.test.ts`).

---

### Phase 3 : Intégration NativeWind (v4 & v5) & Indépendance Native (v0.9.0 ✅ PUBLIÉ)

* [x] **TASK-9.1.1** : Créer le gestionnaire NativeWind `packages/cli/src/core/nativewind-manager.ts` supportant NativeWind v4 (Tailwind v3.4 classique) et v5 (Tailwind v4 CSS-first sans tailwind.config.js).
* [x] **TASK-9.1.2** : Définir la configuration `nativewind: { enabled, version, css }` dans `RashwrightConfig` (`packages/cli/src/core/config-manager.ts`).
* [x] **TASK-9.1.3** : Intégrer l'option interactive dans `rs-ui init` (prompt avec `confirm` activé par défaut, choix explicite de version v4/v5, flags `--nativewind [version]` et `--no-nativewind`).
* [x] **TASK-9.1.4** : Écrire la suite de tests unitaires `packages/cli/tests/nativewind-manager.test.ts` (6 tests) et tester la détection d'options dans `tests/init.test.ts`.
* [x] **TASK-9.1.5** : Persistance de la configuration NativeWind dans `rashwright-ui.json` (`nativewind.enabled`, `nativewind.version`, `nativewind.css`).
* [x] **TASK-9.1.6** : ESM strict respecté — correction du linter `cli-lint-require` via commentaire `createRequire()` dans `nativewind-manager.ts`.
* [x] **TASK-9.1.7** : Indépendance native absolue garantie — aucun composant du registre ne dépend de NativeWind (100% `StyleSheet.create` + `useTheme()`).
* [x] **TASK-9.1.8** : Validation Quality Gate 100% vert — 35 suites, 171 tests, check-types exit 0, build 0.28 MB, smoke:all OK.
* [x] **TASK-9.1.9** : Mise à jour des versions (v0.9.0) dans `package.json` (root, cli, ui-mobile), `registry/index.json`, README et badges.
* [x] **TASK-9.1.10** : Release v0.9.0 publiée sur npm + tag git `v0.9.0`.

---

### Phase 4 : Release Majeure v1.0.0 & Serveur MCP IA (✅ ACHEVÉ)

* [x] **TASK-10.1.1** : Développer le serveur Model Context Protocol (MCP) `packages/cli/src/mcp/` pour permettre aux assistants IA d'inspecter le registre en temps réel (`list_components`, `get_component`, `search_registry`, `get_theme_tokens`, `get_skill`, `list_templates`).
* [x] **TASK-10.1.2** : Ajouter la commande `rs-ui mcp` et `rs-ui mcp setup` pour enregistrer automatiquement le serveur MCP dans les configurations Cursor / VS Code / Claude Desktop.
* [x] **TASK-10.1.3** : Implémenter la recherche floue `rs-ui search <query>` dans le terminal avec support `--json`, `--components-only` et `--templates-only`.
* [x] **TASK-10.1.4** : Enrichir `rs-ui diff` avec affichage couleur side-by-side, comparaison avec le registre et sortie JSON.
* [x] **TASK-10.1.5** : Implémenter le moteur responsive (`lib/responsive.ts`, `hooks/use-responsive.ts`), props `grid`, `columns` adaptatif (breakpoints `sm`, `md`, `lg`, `xl`, `2xl`), tri (`sortBy`, `sortOrder`, `sortFn`) et insertion native de carrousels pleine largeur dans `view.tsx` et `flat-list.tsx`.
* [x] **TASK-10.1.6** : Mise à jour complète de la documentation et des guides skills (`skills/flat-list/SKILL.md`, `skills/view/SKILL.md`, `skills/carousel/SKILL.md`).
* [x] **TASK-10.1.7** : Audit de typage strict TypeScript (zéro `any`), support NativeWind v4/v5 avec injection `global.css`, et validation Quality Gate 100% vert (194/194 tests Vitest réussis sur 40 suites).
* [x] **TASK-10.1.8** : Release officielle **v1.0.0** (bumps packages et workspace root, alignement dépendances semver).

---

## 📌 Journal des actions effectuées

### 2026-10-16 — Release Majeure v1.0.0
- **Serveur MCP IA (Model Context Protocol)** : Implémentation du serveur JSON-RPC 2.0 stdio (`packages/cli/src/mcp/`) avec outils `list_components`, `get_component`, `search_registry`, `get_theme_tokens`, `get_skill`, `list_templates`, `get_template`.
- **Commandes CLI `rs-ui mcp` & `rs-ui mcp setup`** : Intégration en un clic avec Cursor (`.cursor/mcp.json`), Claude Desktop (`claude_desktop_config.json`) et VS Code (`.vscode/mcp.json`).
- **Commandes `rs-ui search <query>` & `rs-ui diff [component]`** : Recherche floue universelle et comparateur coloré temps réel avec le registre officiel.
- **Moteur Responsive & Grille multi-colonnes** : Breakpoints standard `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1536` (`lib/responsive.ts`, `hooks/use-responsive.ts`).
- **Enrichissement de `view.tsx` & `flat-list.tsx`** : Props `grid`, `columns` responsive `{ sm: 1, md: 2, lg: 3 }`, tri dynamique (`sortBy`, `sortOrder`, `sortFn`), et insertion native de carrousels pleine largeur (`carousels`).
- **Skills IA actualisés** : `skills/flat-list/SKILL.md`, `skills/view/SKILL.md`, `skills/carousel/SKILL.md`.
- **Quality Gate 100% vert** : 40 suites de tests, **194 tests passés sur 194**, zéro erreur TypeScript strict, build CLI 0.33 MB.
- **Bump de version v1.0.0** : `@rashwright/cli`, `@rashwright/ui-mobile`, `package.json` racine et registre.

### 2026-10-14 — Release v0.9.0
- Intégration NativeWind v4 & v5 dans `rs-ui init` : prompt interactif, flags `--nativewind [v4|v5]` / `--no-nativewind`, activation par défaut = Oui.
- Création de `packages/cli/src/core/nativewind-manager.ts` : génération `global.css`, `tailwind.config.js`, `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts` pour v4 et v5.
- Ajout de `nativewind: { enabled, version, css }` dans `RashwrightConfig` et écriture dans `rashwright-ui.json`.
- Tests unitaires NativeWind : 6/6 ✅ dans `tests/nativewind-manager.test.ts`.
- Quality Gate 100% vert : 35 suites, **171 tests passés**, 0 erreur TypeScript strict, bundle 0.28 MB.
- Bump de version v0.9.0 sur `@rashwright/cli`, `@rashwright/ui-mobile`, `registry/index.json`, workspace root.
- Tag git `v0.9.0` et publication npm.

### 2026-10-14 — Phase v0.8.0 (Primitives Headless & RFC v4)
- Primitives headless zéro-dépendance : `use-controllable-state`, `use-disclosure`, `accessibility.ts`.
- Découplage 5 hooks + 2 libs dans le registre RFC v4.
- Résolution universelle des destinations : `hooks/` → `src/hooks/`, `lib/` → `src/lib/`.
- Schéma RFC v4 pur TypeScript dans `packages/cli/src/core/schema.ts`.
- Commits : `3cad391` (RFC v4), `3456cca` (NativeWind v4&v5).

### 2026-10-14 — Correctifs v0.7.x & Patch Tabs
- Audit et refonte complète du composant `Tabs` : suppression de `zIndex: -1`, `width: 100%`, support contrôlé/non-contrôlé, `scrollable`, accessibilité ARIA.
- Correctifs init : ordre d'installation Expo, `rs-ui init .`, dépendances `expo-router`/`react-dom`/`react-native-web`.
