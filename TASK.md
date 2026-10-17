# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI MOBILE (v1.1.0 → v1.1.1 → v1.3.0)

> **Fichier de suivi dynamique (`TASK.md`)**  
> Dernière mise à jour : 2026-10-16  
> Statut général : **v1.1.1 Validée & Prête (Correctif NativeWind v5 bun install --force, multi-écrans Expo Router pour templates auth/commerce/onboarding, résolutions options Commander add -t, 65 composants, 194 tests Vitest réussis, 40 suites de tests, Quality Gate 100% vert, 0 erreur TypeScript strict)**

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
| **v1.0.0** | Release Majeure : MCP Server IA, Grille Responsive & Standardisation Finale | ✅ Publié | 8 / 8 tâches |
| **v1.0.1** | Templates Premium (Auth 2-écrans + Google, Commerce catalogue & détail, Onboarding HomeScreen, Dashboard & Settings 3-mode), SDK 58 Stable & Fix NativeWind | ✅ Validé | 7 / 7 tâches |
| **v1.1.0** | Nouveaux Composants Mobiles Clés (`date-picker`, `calendar`, `swipeable-row`, `segmented-control`, `tooltip`, `popover`, `shimmer`, `skeleton`) | ✅ Publié | 6 / 6 tâches |
| **v1.1.1** | Patch Stabilité : NativeWind v5 `--force`, résolutions options Commander `add -t`, génération multi-écrans Expo Router et typage TS | ✅ Validé | 5 / 5 tâches |
| **v1.2.0 (Phase 8)** | Templates Métiers Spécialisés (`chat`, `finance`, `social`) & Commandes CLI Template | ✅ Validé | 4 / 4 tâches |
| **v1.2.0 (Phase 9)** | Gestion de Cycle de Vie CLI (`rs-ui upgrade`), 3-Way Merge & AST Transformers | ✅ Validé | 3 / 3 tâches |
| **v1.2.0 (Phase 10)** | Outils MCP IA Génératifs (`generate_screen`, `audit_accessibility`, `convert_styling`) | ✅ Validé | 3 / 3 tâches |
| **v1.3.0 (Phase 11)** | Showcase Interactif Storybook (`rs-ui showcase`) & Tests End-to-End Automatisés Maestro (6 flows) | ✅ Validé | 2 / 2 tâches |
| **v1.3.1 (Phase 12)** | Commande `rs-ui fix` (Auto-remédiation de l'environnement, Babel Reanimated, Dépendances, Typages ambiants) | ✅ Validé | 2 / 2 tâches |
| **v1.4.0 (Phase 13)** | Nouveaux Composants Mobiles Avancés (`command`, `color-picker`, `navigation-menu`) — Registre à 68 composants | ✅ Validé | 3 / 3 tâches |
| **v1.4.0 (Phase 14)** | Visualisation CLI enrichie (`rs-ui info <comp> --preview`) avec extrait de code TSX canonique et boîte ASCII | ✅ Validé | 2 / 2 tâches |

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

### Phase 5 : Component-Detector (Modèle shadcn/ui) & Résolution des Imports (✅ ACHEVÉ)

* [x] **TASK-11.1.1** : Résolution de l'erreur TS2882 (`import "../global.css"`) via déclaration ambient `declare module "*.css";` dans `generateNativeWindEnv()` et inclusion dans `tsconfig.json`.
* [x] **TASK-11.1.2** : Résolution des erreurs TS2322 (`Card variant="glass"` et `Avatar source={...}`) dans le template `settings` avec rétro-compatibilité complète.
* [x] **TASK-11.1.3** : Implémentation du module `ComponentDetector` (`packages/cli/src/core/component-detector.ts`) :
  - Détection récursive de toutes les logiques internes (`hooks/use-responsive.ts`, `lib/responsive.ts`, `hooks/use-device.ts`, utilitaires `lib/upload/`, etc.).
  - Détection de toutes les dépendances natives et packages tiers manquants (`expo-device`, `expo-image`, `react-native-reanimated`, etc.).
  - Modèle shadcn/ui strict : installation et copie uniquement du delta manquant sur le projet cible (aucun bloat à l'init).
* [x] **TASK-11.1.4** : Branchement de `ComponentDetector` dans les commandes `rs-ui add` et `rs-ui template add` (`packages/cli/src/commands/add.ts` et `template.ts`).
* [x] **TASK-11.1.5** : Validation de `test-project` avec `bunx tsc --noEmit` : **0 erreur**.
* [x] **TASK-11.1.6** : Nettoyage et synchronisation complète de la documentation (`README.md`, `TASK.md`).

---

### Phase 6 : Release v1.0.1 — Templates Premium, SDK 58 Stable & Fix NativeWind (✅ ACHEVÉ)

* [x] **TASK-12.1.1** : Résolution de l'exception NativeWind dark mode (`errors.md`) via injection automatique de `darkMode: "class"` dans `tailwind.config.js` et configuration de `"userInterfaceStyle": "automatic"` + `expo-system-ui`.
* [x] **TASK-12.1.2** : Prise en charge officielle d'Expo SDK 58 stable (support SDK 54 à 58, SDK 58 Recommandé par défaut dans `rs-ui init`).
* [x] **TASK-12.1.3** : Enrichissement du Template `auth` : deux écrans séparés (`sign-in.tsx`, `sign-up.tsx`) et nouveau composant `GoogleAuthButton` avec haptique et Glass UI.
* [x] **TASK-12.1.4** : Enrichissement du Template `commerce` : écran catalogue `products-screen.tsx` (recherche, filtres, compteur) et écran détail produit `product-detail-screen.tsx` (variantes, rating, sticky add to cart).
* [x] **TASK-12.1.5** : Enrichissement du Template `onboarding` : écran d'arrivée `onboarding-home-screen.tsx` (`HomeScreen`) avec dashboard et actions rapides.
* [x] **TASK-12.1.6** : Enrichissement des Templates `dashboard` (périodes temporelles, actions rapides) et `settings` (sélecteur d'apparence 3 modes Système/Clair/Sombre synchronisé avec `ThemeContext`).
* [x] **TASK-12.1.7** : Découplage de `ThemedView` (`view.tsx`) avec son propre `InlineGridCarousel` intégré (zéro dépendance statique sur `carousel.tsx`), inclusion de `use-responsive.ts` et `lib/responsive.ts` dans les fondations, et validation Quality Gate 100% vert (194/194 tests).

---

### Phase 7 : Nouveaux Composants Mobiles Essentiels (v1.1.0 ✅ ACHEVÉ)

* [x] **TASK-13.1.1** : Développer le composant `Calendar` (`components/ui/calendar.tsx`) avec sélection unique, multiple et plage (`range`), localisation FR et navigation mensuelle fluide.
* [x] **TASK-13.1.2** : Développer le composant `DatePicker` (`components/ui/date-picker.tsx`) en modal bottom-sheet et inline avec intégration du thème et mode Glass.
* [x] **TASK-13.1.3** : Développer le composant `SwipeableRow` (`components/ui/swipeable-row.tsx`) avec gestes de glissement gauche/droite, retour haptique et actions personnalisées (supprimer, archiver).
* [x] **TASK-13.1.4** : Développer le composant `SegmentedControl` (`components/ui/segmented-control.tsx`) avec capsule fluide animée par ressort (`withSpring`) et accessibilité WAI-ARIA `tablist`.
* [x] **TASK-13.1.5** : Développer les composants `Tooltip` et `Popover` (`components/ui/tooltip.tsx`, `components/ui/popover.tsx`) avec calcul des coordonnées d'écran (`measureInWindow`) et flip anti-débordement.
* [x] **TASK-13.1.6** : Développer la suite `ShimmerSkeleton` (`components/ui/skeleton.tsx`, `components/ui/shimmer.tsx`, `components/ui/screen-skeleton.tsx`) avec presets `Skeleton.Card`, `Skeleton.Avatar`, `Skeleton.Text` et animation continue `LinearGradient`.

---

### Phase 7.1 : Patch Stabilité v1.1.1 (✅ ACHEVÉ)

* [x] **TASK-13.2.1** : Ajout du flag `--force` sur `bun install` dans `packages/cli/src/core/package-manager.ts` (`buildProjectInstallCommand`), résolvant le conflit NativeWind v5 / Tailwind v4 ESM.
* [x] **TASK-13.2.2** : Élimination du conflit d'option Commander.js `-t, --template` au niveau racine (`packages/cli/src/index.ts`) permettant l'exécution directe de `rs-ui add --template <id>` et `rs-ui add -t <id>`.
* [x] **TASK-13.2.3** : Prise en charge des templates multi-écrans : définition du champ `screens` dans `template.json` et `templates-manager.ts`, génération automatique des routes Expo Router (`sign-in.tsx`, `sign-up.tsx`, `products.tsx`, `product-detail.tsx`, `home.tsx`) dans `init.ts`, `add.ts` et `starter-generator.ts`.
* [x] **TASK-13.2.4** : Résolution intégrale des erreurs TypeScript :
  - `icon.tsx` : cast `name as any` pour satisfaire les unions strictes `@expo/vector-icons`.
  - `checkbox.tsx` : support simultané de `onValueChange` et `onCheckedChange`.
  - `otp-step.tsx` : support de la prop `onBack`.
  - `commerce/types.ts` & `commerce/index.ts` : props d'écran optionnelles (`onSelectProduct?`, `onBack?`) et export par défaut valide.
* [x] **TASK-13.2.5** : Validation Quality Gate 100% vert (194/194 tests Vitest réussis sur 40 suites, 0 erreur `check-types`, tests test-project validés exit 0).

### Phase 8 : Nouveaux Templates Métiers Spécialisés (v1.2.0 ✅ ACHEVÉ)

* [x] **TASK-14.1.1** : Créer le template `chat` (`templates/chat/`) : messagerie instantanée, liste de messages, bulles Liquid Glass, barre de saisie et écran `conversation-screen.tsx`.
* [x] **TASK-14.1.2** : Créer le template `finance` (`templates/finance/`) : portefeuille crypto/banque, solde avec toggle visibilité, historique catégorisé et raccourcis de transactions.
* [x] **TASK-14.1.3** : Créer le template `social` (`templates/social/`) : fil d'actualité, carrousel de stories, likes animés et espace commentaires.
* [x] **TASK-14.1.4** : Implémenter les commandes CLI du gestionnaire de templates : `rs-ui template list`, `rs-ui template info <id>` et `rs-ui template remove <id>`.

---

### Phase 9 : Gestion de Cycle de Vie & AST Transformers (v1.2.0 ✅ ACHEVÉ)

* [x] **TASK-15.1.1** : Implémenter la commande `rs-ui upgrade` / `rs-ui update` : détection des composants obsolètes via `rashwright-ui.lock`, comparaison différentielle interactive et sauvegarde automatique de secours dans `.rashwright/backups/`.
* [x] **TASK-15.1.2** : Intégrer un module AST Transformers (`packages/cli/src/core/transformers/`) pour réécrire chirurgicalement les alias d'imports lors de la copie si le projet cible utilise `~/` ou un chemin customisé (`--alias`).
* [x] **TASK-15.1.3** : Mettre en place un mécanisme de fusion différentielle (3-Way Merge & 2-Way Merge) pour préserver les modifications personnalisées de l'utilisateur lors des mises à jour.

---

### Phase 10 : Intelligence Artificielle & Serveur MCP Avancé (v1.2.0 ✅ ACHEVÉ)

* [x] **TASK-16.1.1** : Développer l'outil MCP `generate_screen` permettant à l'assistant IA de composer un écran complet conforme aux tokens de thème et bonnes pratiques mobiles.
* [x] **TASK-16.1.2** : Développer l'outil MCP `audit_accessibility` pour analyser un fichier TSX et détecter les anomalies ARIA ou zones de frappe non conformes.
* [x] **TASK-16.1.3** : Développer l'outil MCP `convert_styling` pour convertir automatiquement entre `StyleSheet.create` et classes NativeWind Tailwind.

---

### Phase 11 : Storybook Mobile & Tests End-to-End Maestro (v1.3.0 ✅ ACHEVÉ)

* [x] **TASK-17.1.1** : Déployer un environnement interactif Storybook Mobile / Expo Web Showcase (`rs-ui showcase` / `rs-ui storybook`) pour tester et prévisualiser tous les composants et thèmes en direct avec options `--web`, `--port` et `--inject`.
* [x] **TASK-17.1.2** : Écrire la suite de tests end-to-end automatisés Maestro (`e2e/maestro/`) simulant les gestes tactiles, la navigation, le commerce, l'authentification et le changement de thème, avec le script de validation `bun run validate-maestro` intégré au Quality Gate.

---

### Phase 12 : Commande `rs-ui fix` & Auto-remédiation (v1.3.1 ✅ ACHEVÉ)

* [x] **TASK-18.1.1** : Développer la commande `rs-ui fix` (`packages/cli/src/commands/fix.ts`) pour réparer automatiquement les anomalies de configuration : initialisation de `rashwright-ui.json`, création du dossier de composants, injection du plugin `react-native-reanimated/plugin` dans `babel.config.js`, installation des modules natifs Expo manquants, synchronisation des Skills IA et génération de `nativewind-env.d.ts`.
* [x] **TASK-18.1.2** : Supporter les options `--dry-run`, `-y, --yes` et `--json`, et écrire la suite de tests `packages/cli/tests/fix.test.ts`.

---

### Phase 13 : Nouveaux Composants Mobiles Avancés (v1.4.0 ✅ ACHEVÉ)

* [x] **TASK-19.1.1** : Développer le composant `Command` (`components/ui/command.tsx`) : palette de commande mobile / recherche rapide avec filtres, raccourcis, état vide et modale dialog Liquid Glass. Fiche registre `registry/components/command.json` et documentation skill `skills/command/SKILL.md`.
* [x] **TASK-19.1.2** : Développer le composant `ColorPicker` (`components/ui/color-picker.tsx`) : sélecteur de couleur tactile avec nuancier de 12 palettes, saisie hexadécimale, retour haptique et variante Liquid Glass. Fiche registre `registry/components/color-picker.json` et documentation skill `skills/color-picker/SKILL.md`.
* [x] **TASK-19.1.3** : Développer le composant `NavigationMenu` (`components/ui/navigation-menu.tsx`) : menu de navigation hiérarchique avec sections accordéon, indicateurs d'état actif, badges et support Liquid Glass. Fiche registre `registry/components/navigation-menu.json` et documentation skill `skills/navigation-menu/SKILL.md`.

---

### Phase 14 : Visualisation CLI enrichie (`rs-ui info --preview`) (v1.4.0 ✅ ACHEVÉ)

* [x] **TASK-20.1.1** : Ajouter l'option `-p, --preview` sur `rs-ui info <component>` (`packages/cli/src/commands/info.ts`) pour extraire automatiquement les exemples d'utilisation TSX depuis le Skill IA correspondant et les afficher dans une boîte de terminal élégante avec bordures ASCII.
* [x] **TASK-20.1.2** : Écrire la suite de tests unitaires `packages/cli/tests/info.test.ts` (test argument + options preview/registry/fresh/json).

---

## 📌 Journal des actions effectuées

### 2026-10-17 — Releases v1.3.1 & v1.4.0 (Phases 12, 13, 14 : Commande `rs-ui fix`, 68 composants et Visualisation CLI)
- **Commande `rs-ui fix` (Phase 12)** :
  - Détection et auto-remédiation des anomalies courantes de projets Expo/React Native.
  - Réparation de `babel.config.js` (`react-native-reanimated/plugin`).
  - Installation automatique des modules natifs Expo manquants via le package manager du projet.
  - Déclaration ambient de modules CSS dans `nativewind-env.d.ts`.
  - Flags `--dry-run`, `-y, --yes`, `--json`.
- **Nouveaux Composants Mobiles Clés (Phase 13 — 68 composants au registre)** :
  - `Command` (`components/ui/command.tsx`) : palette de commande contextuelle avec recherche, sections groupées, raccourcis clavier/tactiles, modale overlay Glass.
  - `ColorPicker` (`components/ui/color-picker.tsx`) : sélecteur de couleurs avec grille de presets, aperçu interactif, champ hexadécimal et retour haptique.
  - `NavigationMenu` (`components/ui/navigation-menu.tsx`) : navigation hiérarchique mobile avec sections extensibles, chevrons rotatifs, badges et capsules actives.
  - Fiches de registre et fiches IA Skills synchronisées pour chacun des 3 composants.
  - `COMPONENT_EXPORTS_MAP` synchronisé dans le générateur CLI.
- **Visualisation CLI enrichie (Phase 14)** :
  - Ajout du drapeau `-p, --preview` sur `rs-ui info <component>`.
  - Affichage direct du code TSX d'exemple extrait du `SKILL.md` dans une boîte ASCII formatée.
- **Quality Gate 100% vert** :
  - 46 suites de tests Vitest, **218 tests réussis sur 218**.
  - Zéro erreur TypeScript strict sur `@rashwright/cli` et `@rashwright/ui-mobile`.
  - Validation registre sans faute (68 composants, 68 sources, 8 primitives).
  - Validation des 6 flux Maestro E2E.
  - Bundle CLI de 0.38 MB.

### 2026-10-17 — Phase 11 (Storybook Mobile & Tests End-to-End Maestro)
- **Showcase Interactif & Storybook Mobile** :
  - Implémentation de la commande `rs-ui showcase` (alias `rs-ui storybook`) dans [`packages/cli/src/commands/showcase.ts`](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/packages/cli/src/commands/showcase.ts).
  - Support des options `--web`, `--port`, `--theme` et `--inject` pour intégrer directement la route de prévisualisation dans `src/app/showcase.tsx` ou `src/screens/ShowcaseScreen.tsx`.
- **Suite de Tests E2E Automatisés Maestro** :
  - Déploiement de 6 flux Maestro déclaratifs dans `e2e/maestro/` :
    - `app-launch.yaml` : vérification du premier lancement, logo, badges SDK Expo.
    - `auth-flow.yaml` : saisie email/mot de passe, validation OTP, boutons Google Auth.
    - `commerce-flow.yaml` : navigation boutique, filtres par catégorie, fiche produit et panier.
    - `theme-switch.yaml` : bascule dynamique mode sombre / clair et rendu Liquid Glass.
    - `chat-flow.yaml` : saisie et envoi de message dans la conversation, apparition de bulles.
    - `finance-flow.yaml` : bascule de confidentialité du solde, inspection des transactions.
  - Script de validation automatique `scripts/validate-maestro-flows.ts` intégré à la commande `bun run test:e2e` et au Quality Gate.
- **Augmentation des tests unitaires** : 44 suites de tests, **214 tests Vitest réussis (100% vert)**.
- **Quality Gate 100% vert** : validation registre, validation Maestro, check-types strict, 214 tests, build CLI et smoke tests.

### 2026-10-17 — Release v1.2.0 (Phases 8, 9, 10 : Nouveaux Templates Métiers, Cycle de Vie CLI & MCP Avancé)
- **Phase 8 (Templates Métiers Spécialisés)** :
  - `chat` (`templates/chat/`) : messagerie instantanée mobile avec liste de messages, bulles Liquid Glass adaptatives, barre de saisie tactile, écran `conversation-screen.tsx`.
  - `finance` (`templates/finance/`) : portefeuille financier, carte de solde avec bascule de visibilité/confidentialité, raccourcis d'actions, historique catégorisé avec filtrage dynamique (`wallet-screen.tsx`, `transactions-screen.tsx`).
  - `social` (`templates/social/`) : réseau social avec carrousel horizontal de stories animées (`story-carousel.tsx`), publications réactives avec likes interactifs et fil d'actualités (`feed-screen.tsx`).
  - Commandes CLI template : `rs-ui template list`, `rs-ui template info <id>`, `rs-ui template add <id>`, `rs-ui template remove <id>` avec confirmation interactive et suppression propre.
  - Registre de templates étendu à **10 templates autonomes** prêts à l'emploi.
- **Phase 9 (Gestion de Cycle de Vie & AST Transformers)** :
  - Commande `rs-ui upgrade` : mise à niveau chirurgicale des composants installés vers la dernière version du registre.
  - Moteur de fusion différentielle **3-Way Merge & 2-Way Merge** (`merge-manager.ts`) : préservation des personnalisations utilisateur lors des mises à jour avec génération de marqueurs de conflit Git en cas de divergence directe.
  - Module **AST Transformers** (`import-transformer.ts`) : réécriture des alias d'importation (`@/` vers `~/` ou `@app/`) via l'option `--alias <prefix>` sur `rs-ui add`, `rs-ui update` et `rs-ui upgrade`.
  - Prise en charge des drapeaux `--merge` / `--no-merge` pour contrôler la stratégie d'écrasement ou de fusion.
- **Phase 10 (Intelligence Artificielle & Serveur MCP Avancé)** :
  - Outil MCP `generate_screen` : génération de code TSX complet d'écrans mobiles avec imports modulaires et SafeAreaView.
  - Outil MCP `audit_accessibility` : analyse statique a11y détectant les absences de labels vocaux, les cibles tactiles trop petites (<44px) et les rôles interactifs manquants.
  - Outil MCP `convert_styling` : convertisseur bidirectionnel entre StyleSheet React Native et classes Tailwind NativeWind.
- **Quality Gate 100% vert** :
  - 43 suites de tests, **212 tests Vitest réussis sur 212**.
  - Zéro erreur TypeScript strict sur `@rashwright/cli` et `@rashwright/ui-mobile`.
  - Bundle CLI optimisé de 0.37 MB.
  - Validations smoke tests (ESM strict, shebang unique, version semver) validées.
- **Bumps de version** : Passage officiel en **v1.2.0** sur `@rashwright/cli`, `@rashwright/ui-mobile`, registre et racine.

### 2026-10-16 — Release v1.1.0 (Nouveaux Composants Mobiles Clés & Registre à 65 composants)
- **Nouveaux composants UI autonomes** :
  - `Calendar` (`components/ui/calendar.tsx`) : navigation mensuelle fluide, modes single/multiple/range, localisation FR native (`Intl`), variant glass.
  - `DatePicker` (`components/ui/date-picker.tsx`) : modal bottom-sheet avec trigger personnalisé, validation par confirmation, synchronisation draft/value.
  - `SwipeableRow` (`components/ui/swipeable-row.tsx`) : geste tactile de balayage fluide via PanResponder natif (zéro dépendance lourde), seuils de déclenchement élastiques, haptique expo-haptics.
  - `Popover` (`components/ui/popover.tsx`) : panneau flottant contextuel ancré avec 8 placements, calcul automatique des coordonnées d'écran (`measure`), flèche indicatrice géométrique et fermeture backdrop.
  - `SegmentedControl`, `Skeleton`, `Shimmer`, `ScreenSkeleton` consolidés et référencés.
- **Registre étendu à 65 composants** : `registry/index.json` mis à jour, `COMPONENT_EXPORTS_MAP` synchronisé dans le CLI.
- **Quality Gate 100% vert** : 194/194 tests Vitest réussis (40 suites), zéro erreur TypeScript strict (`tsc --noEmit`), build CLI réussi (0.34 MB), smoke tests validés.
- **Bumps de version** : Passage officiel en **v1.1.0** sur `@rashwright/cli`, `@rashwright/ui-mobile`, registre et racine.

### 2026-10-16 — Release v1.0.1 (Templates Premium & SDK 58 Stable)
- **Templates autonomes enrichis** : Auth double écran (`sign-in.tsx`, `sign-up.tsx`) + `GoogleAuthButton`, Commerce catalogue & détail produit complet, Onboarding avec `HomeScreen` de destination, Dashboard avec sélecteur de périodes & actions rapides, Settings avec sélecteur 3 modes d'apparence.
- **Expo SDK 58 stable** : Intégration et validation dans `package-manager.ts` et `init.ts`.
- **Correction NativeWind v4/v5** : Ajout automatique de `darkMode: "class"` dans `tailwind.config.js` et plugin `expo-system-ui`.
- **Composant View auto-suffisant** : Implémentation de `InlineGridCarousel` éliminant tout blocage de compilation lié à `carousel.tsx`.
- **Fondations consolidées** : Ajout de `hooks/use-responsive.ts` et `lib/responsive.ts` dans `setupFoundations`, et `expo-device` dans `CORE_EXPO_DEPS`.
- **Quality Gate 100% vert** : 194/194 tests Vitest réussis (40 suites), zéro erreur TypeScript strict (`tsc --noEmit`), build CLI réussi (0.34 MB), smoke tests réussis.
- **Bumps de version** : Passage officiel en **v1.0.1** sur `@rashwright/cli`, `@rashwright/ui-mobile`, registre et racine.

### 2026-10-16 — Component-Detector & Stabilisation
- **Implémentation de `ComponentDetector`** : Détecteur intelligent de dépendances internes et externes (modèle shadcn/ui).
- **Résolution intégrale de `errors-to-fixe.md`** : TS2882 (CSS ambient), TS2307 (`use-responsive`, `lib/responsive`, `expo-device`), TS2322 (`Card variant`, `Avatar source`).
- **Validation `test-project`** : 0 erreur TypeScript strict (`bunx tsc --noEmit` exit 0).
- **Quality Gate monorepo 100% vert** : 194 tests Vitest réussis (40 suites), `validate-registry` exit 0, `check-types` exit 0, smoke tests exit 0.
- **Nettoyage documentation** : Synchronisation de `README.md` et `TASK.md`.

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
