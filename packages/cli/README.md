<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile CLI" width="180" />
</p>

# @rashwright/cli — v1.6.0 · Commande `rs-ui` & `rs-ui-reset`

> CLI officiel **Rashwright UI Mobile** pour React Native / Expo.
> Inspiré de la philosophie shadcn/ui : **tu installes un composant ou un widget, tu possèdes son code source.**
>
> Plus de `node_modules` opaque. Plus de surprise quant à la compatibilité Expo SDK.

[![npm](https://img.shields.io/badge/npm-%40rashwright%2Fcli-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/cli)
[![version](https://img.shields.io/badge/version-1.6.0-blue)](#)
[![GitHub](https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github)](https://github.com/AbdoulRachid-Mz/rashwright-ui)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2058-000020?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](#)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4%20%7C%20v5%20optional-06b6d4?logo=tailwindcss)](#)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](#)
[![Tests](https://img.shields.io/badge/Tests-245%20passed-success)](#)

---

## ⚡ Prise en main en 30 secondes

### 1) Installer le CLI

```bash
# Option A — Global (recommandé)
bun add -g @rashwright/cli
# ou avec npm :
npm install -g @rashwright/cli

# Option B — Exécution directe sans installation
bunx @rashwright/cli <commande>
# ou :
npx @rashwright/cli <commande>
```

### 2) Initialiser Rashwright dans un projet Expo

```bash
# Dans un projet Expo existant :
cd mon-app-expo/
rs-ui init --yes

# Nouveau projet Expo avec thème Cyber Cyan & Liquid Glass :
rs-ui init --glass --theme cyan --sdk 58 --yes

# Initialiser avec un thème personnalisé en ligne de commande :
rs-ui init --theme custom --primary "#00D9FF" --secondary "#1E293B" --dark-primary "#38BDF8"
```

### 3) Ajouter des composants, widgets & Skills IA

```bash
# Ajoute le composant ET son skill IA (skills/rs-ui/drawer/SKILL.md)
rs-ui add drawer

# Ajouter des widgets modulaires autonomes
rs-ui add -w metric finance
# ou via la commande dédiée :
rs-ui widget add chart activity-feed

# Ajouter des templates métiers autonomes
rs-ui add -t dashboard

# Ajouter sans installer le skill IA
rs-ui add drawer --no-skills

# Ajout multiple de composants
rs-ui add button card accordion form otp-input

# Prévisualiser les modifications avant d'écraser un composant personnalisé
rs-ui add button --diff

# Mode interactif avec cases à cocher :
rs-ui add

# Ajouter l'ensemble du catalogue (79 composants atomiques) :
rs-ui add --all
```

### 4) Réinitialiser le projet starter (reset)

```bash
# Mode interactif sécurisé (archive par défaut dans rs-ui-example/) :
rs-ui reset
# ou via l'alias binaire :
rs-ui-reset

# Suppression définitive explicite :
rs-ui reset --delete
```

---

## 📋 Commandes disponibles

```bash
rs-ui --help
```

| Commande | Description |
|---|---|
| `rs-ui init [name]` | Configure Rashwright dans un projet existant ou initialise un nouveau projet Expo avec skill IA global. |
| `rs-ui add [components...]` | Ajoute un ou plusieurs composants, widgets (`-w, --widget`) ou templates autonomes (`-t, --template`) avec résolution automatique des dépendances et Skills IA associés (`--skills`). |
| `rs-ui widget <list\|info\|add\|remove>` | Explore, inspecte ou installe les 6 widgets modulaires autonomes (`metric`, `progress`, `quick-actions`, `chart`, `activity-feed`, `finance`). |
| `rs-ui template <list\|info\|add\|remove>` | Explore, inspecte ou installe les 10 templates métiers autonomes (`auth`, `commerce`, `dashboard`, `minimal`, `onboarding`, `settings`, `showcase`, `chat`, `finance`, `social`). |
| `rs-ui reset` / `rs-ui-reset` | Nettoie les fichiers de démo et showcase du starter (archivage dans `rs-ui-example/` ou suppression `--delete`). |
| `rs-ui list` | Liste les 79 composants disponibles, les 6 widgets ou les 10 templates autonomes avec statut d'installation. |
| `rs-ui info <component>` | Affiche la fiche technique détaillée d'un composant (versions, dépendances, plateformes) avec support d'aperçu de code `--preview`. |
| `rs-ui fix` | Détecte et résout automatiquement les anomalies d'environnement (Babel plugin Reanimated, modules Expo natifs, déclarations CSS NativeWind, Skills IA). |
| `rs-ui showcase` | Lance le storybook mobile et environnement de prévisualisation interactif avec options `--web`, `--port`, `--theme`. |
| `rs-ui doctor` | Évalue l'environnement (SDK, dépendances, types) et diagnostique la présence et validité des Skills IA. |
| `rs-ui remove <component>` | Supprime un composant ou un widget, retire son Skill IA associé et vérifie les dépendances. |
| `rs-ui update [components...]` | Met à jour les composants avec détection de diff par SHA-256 et support 3-Way Merge. |
| `rs-ui upgrade [components...]` | Met à niveau les composants vers la dernière version du registre avec fusion différentielle (3-Way Merge) et réécriture d'alias (`--alias`). |
| `rs-ui search <query>` | Recherche floue haute vitesse à travers tous les composants, widgets et templates avec score de pertinence. |
| `rs-ui diff [component]` | Comparateur visuel side-by-side entre code source local et version officielle du registre. |
| `rs-ui mcp` | Démarre le serveur MCP IA (JSON-RPC 2.0 stdio) avec outils d'inspection, audit a11y et composition assistée. |

---

## 🔧 Options détaillées

### Options pour `rs-ui init`
- `--template <id>` : Sélectionne un template starter initial (`minimal`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`, `showcase`).
- `--theme <preset>` : Preset de couleurs (`default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`, `custom`).
- `--primary <hex>` / `--dark-primary <hex>` : Couleur primaire light / dark personnalisée.
- `--secondary <hex>` / `--dark-secondary <hex>` : Couleur secondaire light / dark personnalisée.
- `--accent <hex>` / `--dark-accent <hex>` : Couleur d'accent light / dark personnalisée.
- `--skills` : Installe le Skill IA Global et les starters (`skills/rs-ui/`) (activé par défaut).
- `--no-skills` : Désactive l'installation des Skills IA.
- `--glass` : Active le moteur Liquid Glass (`expo-blur` et `expo-linear-gradient`).
- `--sdk <version>` : Version cible du SDK Expo (`54` à `58` ou `latest`).

### Options pour `rs-ui add`
- `-w, --widget <name>` : Installe un widget modulaire autonome (`metric`, `progress`, `quick-actions`, `chart`, `activity-feed`, `finance`) dans `src/components/widgets/<name>/`.
- `-t, --template <name>` : Installe un template autonome complet (`auth`, `dashboard`, `commerce`, `settings`, etc.) dans `src/components/templates/<name>/`.
- `--skills` : Installe automatiquement `skills/rs-ui/<component>/SKILL.md` (activé par défaut).
- `--no-skills` : Ignore la copie des Skills IA.
- `--diff` : Affiche un diff textuel (LCS) avant d'écraser un composant existant.
- `--all` : Installe l'intégralité des 79 composants atomiques disponibles.
- `--force` : Réinstalle les composants même s'ils sont déjà présents.
- `--dry-run` : Simule l'installation sans écriture sur disque.

### Options pour `rs-ui reset`
- `--delete` / `--hard` : Supprime définitivement les fichiers démo au lieu de les archiver.
- `--yes` : Confirme l'opération sans confirmation interactive.
- `--dry-run` : Simule la réinitialisation.

---

## 🤖 Système de Skills IA

Rashwright UI Mobile intègre un système complet de documentation et de contexte destiné aux agents de développement IA (Antigravity, Cursor, Gemini CLI, Claude Code, GitHub Copilot) :

```text
mon-projet-expo/
├── skills/
│   └── rs-ui/
│       ├── SKILL.md            # Skill Global (architecture, tokens, Glass UI, règles)
│       ├── button/
│       │   └── SKILL.md        # Skill Button (props, types, code ownership)
│       ├── drawer/
│       │   └── SKILL.md        # Skill Drawer (props, Reanimated, gesture handler)
│       └── widgets/
│           ├── metric/
│           │   └── SKILL.md    # Skill MetricWidget
│           └── finance/
│               └── SKILL.md    # Skill FinanceWidget
```

Chaque `SKILL.md` contient :
- Frontmatter YAML standardisé (`name`, `description`, `version`, `category`, `dependencies`, `supportsGlass`).
- Exemples d'utilisation, Props API typée, pièges fréquents et intégration de thème.
- Diagnostiqué automatiquement via `rs-ui doctor`.

---

## 🔒 Configuration & Lockfile `rashwright-ui.json` / `rashwright.lock`

Le fichier de configuration et le lockfile tracent l'état complet du starter, des thèmes, des composants, widgets et templates :

```json
{
  "version": 1,
  "componentsPath": "src/components/ui",
  "theme": "default",
  "themePreset": "cyan",
  "glass": true,
  "typescript": true,
  "packageManager": "bun",
  "starter": {
    "installed": true,
    "reset": true,
    "archived": true,
    "resetAt": "2026-10-08T10:45:00.000Z"
  },
  "components": {
    "button": "1.0.0",
    "drawer": "1.0.0"
  }
}
```

---

## 🆕 Nouveautés v1.6.0 — Moteur de Widgets Modulaires & Showcases

- 🧩 **Moteur de Widgets Modulaires & Distribuables** :
  - **Couche fonctionnelle autonome** : les widgets représentent des blocs métiers complets, réutilisables et distribuables indépendamment des pages ou templates complets.
  - **Catalogue des 6 widgets officiels** :
    1. `MetricWidget` (`widgets/metric`) : indicateur statistique clé avec tendance, comparaison périodique, icône, état de chargement et support Liquid Glass.
    2. `ProgressWidget` (`widgets/progress`) : progression vers un objectif avec pourcentage calculé, barre animée, état complété et support Liquid Glass.
    3. `QuickActionsWidget` (`widgets/quick-actions`) : grille d'actions rapides configurable (2 à 4 colonnes), icônes, badges et retour haptique.
    4. `ChartWidget` (`widgets/chart`) : visualisation graphique en barres animées, répartition et sparklines avec infobulle interactive sans dépendances lourdes.
    5. `ActivityFeedWidget` (`widgets/activity-feed`) : flux d'activité chronologique avec avatars/icônes, libellés temporels, statuts, montants et interactions.
    6. `FinanceWidget` (`widgets/finance`) : bloc portefeuille financier complet avec solde principal, masquage de confidentialité (`•••• €`), ratio revenus/dépenses, raccourcis et Liquid Glass.
  - **Commandes CLI dédiées** :
    ```bash
    rs-ui widget list              # Lister les widgets disponibles
    rs-ui widget info <id>         # Détail des props et spécifications d'un widget
    rs-ui add -w <id>              # Installer un widget dans votre projet
    rs-ui widget add <id>          # Alias direct d'installation
    rs-ui widget remove <id>       # Désinstaller un widget
    ```
  - **Détection automatique et intégrité** : résolution automatique des composants atomiques requis via `component-detector`, traçabilité par hash SHA-256 dans le lockfile (`checkWidgetIntegrity`), et installation automatique des Skills IA dédiés dans `skills/rs-ui/widgets/<id>/SKILL.md`.
  - **2 Nouveaux Showcases d'Intégration** :
    - `FinanceDashboardShowcase` : tableau de bord financier complet combinant `FinanceWidget`, `MetricWidget`, `QuickActionsWidget`, `ChartWidget`, `ActivityFeedWidget`.
    - `AnalyticsDashboardShowcase` : tableau de bord analytique intégrant métriques, barres de progression et événements.
  - **Quality Gate complet** : 51 suites de tests, **245 tests unitaires Vitest réussis (100% vert)**.

---

## 🆕 Nouveautés v1.5.0 — 79 Composants, WCAG 2.1 AA, NativeWind v5 Fix & Nouveaux Utilitaires

- **11 nouveaux composants UI de pointe** : `LikeButton` (rebond animé, particules), `PasswordStrength` (évaluation d'entropie locale sécurisée, jauge segmentée), `CopyButton` (presse-papiers multi-plateforme), `FloatingLabelInput` (label flottant Reanimated), `HoldButton` (maintien sécurisé anti-clic accidentel), `SwipeActionButton` (slide to confirm), `TagInput` (mots-clés avec badges et filtres), `NumberInput` (contrôle pas-à-pas numérique), `ReorderableList` (liste réordonnable avec contrôles accessibles), `InlineEdit` (édition sur place), `ExpandableText` (tronquage intelligent).
- **Catalogue porté à 79 composants officiels** dans le registre et skills associés.
- **Accessibilité WCAG 2.1 AA** : Tous les composants interactifs ont maintenant `accessibilityRole`, `accessibilityState` et `accessibilityLabel` — `button`, `chip`, `card`, `checkbox`, `modal`, `icon-button`, `slider` et plus.
- **Style Priority** : La prop `style` utilisateur prime systématiquement (`style={[styles.base, internalStyle, style]}`).
- **Fix NativeWind v5 `npm install`** : `--legacy-peer-deps` systématiquement utilisé pour npm (résout les conflits `react-native-css@3.1.0-rc.0` qui bloquaient `--force` indéfiniment).
- **Architecture.md formalisée** : 3 modes d'initialisation documentés (Fresh Expo Router, Existing Expo Router, Expo Classic), flux CLI en diagrammes Mermaid, dépendances inter-packages.
- **Phase 7 — Specs Écrans Expo critiques** : 10 écrans documentés (`PHASE7-EXPO-SCREENS.md`).
- **Tests** : 227 tests Vitest réussis — 47 suites, Quality Gate 100% vert.

---

## 🆕 Nouveautés v1.4.0 — Commande `rs-ui fix`, Showcase & Code Preview

- **Commande `rs-ui fix` (Auto-Remédiation)** : Réparation automatique en un clic de la configuration et de l'environnement (plugin Reanimated Babel, dépendances natives Expo, déclaration CSS NativeWind, synchronisation des fiches IA Skills).
- **Showcase Storybook Mobile (`rs-ui showcase`)** : Environnement de test et prévisualisation mobile/web avec options `--web`, `--port`, `--theme`, `--inject`.
- **Aperçu Code TSX (`rs-ui info --preview`)** : Affichage d'un exemple canonique prêt à copier directement dans la console.
- **Suite de tests E2E Maestro** : 6 flows déclaratifs automatisés (`bun run test:e2e`).
- **Nouveaux composants clés** : Support et synchronisation de 68 composants et 10 templates autonomes.

---

## 🆕 Nouveautés v1.2.0 — Cycle de Vie CLI, 3-Way Merge, Outils MCP IA & Nouveaux Templates

- **🔄 Commande `rs-ui upgrade` & 3-Way Merge** :
  - Mise à jour différentielle intelligente des composants préservant les modifications personnalisées de l'utilisateur.
  - Résolution des conflits avec marqueurs Git standard (`<<<<<<< LOCAL` / `>>>>>>> REGISTRY`) sans écrasement brutal.
  - Drapeau `--no-merge` pour forcer l'écrasement si souhaité.
- **🪄 AST Transformers & Options `--alias`** :
  - Réécriture chirurgicale des alias d'import (`@/` vers `~/` ou `@app/`) sur `rs-ui add`, `rs-ui update` et `rs-ui upgrade`.
  - Adaptation automatique aux conventions de projet existantes (ex: Expo Router `~/components`).
- **🤖 Serveur MCP IA Élargi (`rs-ui mcp`)** :
  - `generate_screen` : composition assistée par IA d'écrans mobiles complets prêts pour la production.
  - `audit_accessibility` : audit automatique ARIA, détection des cibles tactiles trop petites (<44px) et des labels manquants.
  - `convert_styling` : convertisseur bidirectionnel instantané entre `StyleSheet.create` et classes NativeWind Tailwind.
- **📦 3 Nouveaux Templates Métiers Autonomes (10 templates au total)** :
  - `chat` : messagerie instantanée fluide avec bulles Glass, liste de messages et barre de saisie.
  - `finance` : portefeuille financier, carte de solde avec bascule de confidentialité et historique des opérations.
  - `social` : carrousel de stories horizontales et fil d'actualités avec likes interactifs et commentaires.
  - Commande `rs-ui template remove <name>` pour désinstaller proprement les fichiers d'un template.
- **⚡ Bun Install `--force` & Fix NativeWind v5** :
  - Résolution automatique des conflits de verrouillage de dépendances NativeWind v5 RC / Tailwind v4 via `bun install --force`.

---

## 🆕 Nouveautés v1.1.0 — Composants Mobiles Clés (Calendar, DatePicker, SwipeableRow, Popover)

- 📅 **Nouveau composant `Calendar`** (`components/ui/calendar.tsx`) : navigation mensuelle, sélection unique/multiple/plage (`range`), localisation FR native (`Intl`), variant glass.
- 🕒 **Nouveau composant `DatePicker`** (`components/ui/date-picker.tsx`) : modal bottom-sheet avec trigger personnalisé, validation par confirmation, synchronisation draft/value.
- 👆 **Nouveau composant `SwipeableRow`** (`components/ui/swipeable-row.tsx`) : geste tactile de balayage fluide via PanResponder natif, actions personnalisées, haptique.
- 💬 **Nouveau composant `Popover`** (`components/ui/popover.tsx`) : panneau flottant contextuel ancré avec 8 placements, calcul automatique des coordonnées (`measure`), flèche indicatrice.
- 💊 **Nouveaux composants `SegmentedControl`, `Skeleton`, `Shimmer`, `ScreenSkeleton`**.
- 🏆 **Registre étendu à 65 composants** et 212 tests Vitest réussis (100% vert).

---

## 🆕 Nouveautés v1.0.1 — Templates Premium, SDK 58 Stable & Fix NativeWind

- **💎 Templates Autonomes Enrichis** :
  - `auth` : Écrans dédiés séparés `sign-in.tsx` et `sign-up.tsx` + nouveau composant `GoogleAuthButton` vectoriel haptique Glass.
  - `commerce` : Catalogue complet `products-screen.tsx` (recherche, filtres, compteur) et écran détail produit `product-detail-screen.tsx` (`productId`) avec sélection de variantes, notation et bouton panier sticky.
  - `onboarding` : Redirection automatique vers l'écran d'accueil `onboarding-home-screen.tsx` (`HomeScreen`).
  - `dashboard` : Sélecteur de périodes (7j, 30j, 90j, 1 an), barre d'actions rapides et métriques interactives.
  - `settings` : Sélecteur 3 modes d'apparence (Système, Clair, Sombre) relié à `useTheme()`, contrôle Liquid Glass & notifications.
- **🚀 Expo SDK 58 Stable** : Prise en charge officielle de SDK 58 configuré en Recommandé par défaut dans `rs-ui init`.
- **⚙️ Fix NativeWind Dark Mode** : Ajout automatique de `darkMode: "class"` dans `tailwind.config.js` et configuration de `"userInterfaceStyle": "automatic"` + `expo-system-ui`.
- **🧩 Component-Detector Automatique (Modèle shadcn/ui)** :
  - Détection récursive et installation conditionnelle des logiques internes (`hooks/use-responsive.ts`, `lib/responsive.ts`, utilitaires `lib/upload/`) et packages Expo/npm manquants (`expo-device`, `react-native-reanimated`).

---

## 🆕 Nouveautés v1.0.0 — Release Majeure & Serveur MCP IA

- **Serveur Model Context Protocol (MCP) IA (`rs-ui mcp`)** : Serveur stdio JSON-RPC 2.0 pour assistants IA (Cursor, Claude Desktop, VS Code) avec commandes d'inspection temps réel.
- **Moteur Responsive & Grille Multi-Colonnes** : Détecteur de breakpoints standard (`sm`, `md`, `lg`, `xl`, `2xl`) dans `lib/responsive.ts` et `useResponsive()`.
- **Recherche Floue Haute Vitesse (`rs-ui search <query>`)** : Recherche instantanée dans le registre avec suggestions.
- **Comparateur Visuel (`rs-ui diff [component]`)** : Diff side-by-side couleur avec le registre officiel.
- **Dual Engine Styling** : Prise en charge native NativeWind v4/v5 et StyleSheet standardisé.

---

## 🆕 Nouveautés v0.9.0 — Intégration NativeWind & Indépendance Native

- **Support NativeWind v4 & v5 dans `rs-ui init`** :
  - Prompt interactif pour configurer NativeWind lors de l'init.
  - Choix explicite de version : **v4 Stable** (Tailwind v3.4, `tailwind.config.js`) ou **v5 Next-Gen** (Tailwind v4 CSS-first, sans config JS).
  - Flags CLI : `--nativewind [v4|v5]` pour activer, `--no-nativewind` pour désactiver.
  - Génération automatique : `global.css`, `tailwind.config.js` (v4), `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts`.
- **Indépendance native absolue** : Tous les composants restent 100% fonctionnels sans NativeWind (`StyleSheet.create` + `useTheme()` par défaut).
- **Primitives Headless Mobiles** : `useControllableState`, `useDisclosure`, `buildAccessibilityProps` — zéro dépendance externe.
- **Registre RFC v4** : Hooks (`use-device`, etc.) et libs (`primitives`, `upload`) installables via `rs-ui add`.

---

## 🆕 Nouveautés v0.7.3 — Correctif dépendances manquantes (`expo-router`, `react-dom`, `react-native-web`)

- **🐛 Fix : `ConfigError: Cannot resolve entry file` au démarrage** :
  `"main": "expo-router/entry"` était écrit dans `package.json` mais `expo-router` n'était jamais installé. Metro ne pouvait pas résoudre le point d'entrée et refusait de démarrer. `expo-router` est désormais dans `CORE_EXPO_DEPS`.
- **🐛 Fix : `react-dom` et `react-native-web` manquants pour le web** :
  Le `app.json` généré par Expo inclut `"web"`. Sans `react-dom` et `react-native-web`, Expo affichait une erreur de dépendances. Ces deux packages sont désormais dans `CORE_EXPO_DEPS`.

---

## 🆕 Nouveautés v0.7.2 — Correctif `rs-ui init .` (régression 0.7.1)

- **🐛 Fix : `bun install` échoue avec `rs-ui init .`** :
  La v0.7.1 forçait incorrectement `useCurrentDirectory = true` pour l'argument `"."`. Correction apportée pour que `create-expo-app .` crée bien le `package.json` dans le répertoire courant.
- **🐛 Fix : `installProjectDependencies` appelé sur un projet existant** :
  L'étape d'installation est sautée si un projet Expo existe déjà.
- **🐛 Fix : `isFreshProject` hissé dans le scope externe**.

---

## 🆕 Nouveautés v0.7.1 — Correctifs critiques `rs-ui init`

- **🐛 Fix ordre d'installation (`ConfigError: expo is not installed`)** :
  L'ordre des phases d'installation est désormais garanti : `bun install` installe `expo` **avant** que `bunx expo install` ne soit appelé.
- **🐛 Fix `TS2307: Cannot find module './App'`** :
  Le fichier `index.ts` résiduel du template Expo `blank-typescript` est supprimé en mode Expo Router.
- **🐛 Fix fausse réussite** :
  Le CLI distingue une initialisation complète d'une initialisation partielle.
- **🐛 Fix `rs-ui init .`** :
  L'argument `"."` est correctement reconnu comme répertoire courant.

---

## 🆕 Nouveautés v0.7.0 — Templates Engine & Architecture /src

- **Starter Templates Engine (`--template`)** : Choix parmi 7 templates starters complets (`showcase`, `minimal`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`) utilisant exclusivement les composants Rashwright UI Mobile.
- **Single Installation Flow & Clean SDK Resolution** :
  - Bootstrap avec `blank-typescript@<SDK>` avec `--no-install`.
  - Élimination totale de la double installation : une seule phase d'installation finale.
  - Normalisation multiplateforme des chemins sous Windows/macOS/Linux.
- **CLI Hooks Subsystem** : Exécution de hooks shell personnalisés (`post-add`, `post-update`).
- **Multi-Registres Scoped** : Commande `rs-ui registry` et support des composants sous scope (ex: `@equipe/badge`).

---

## 🆕 Nouveautés v0.3.0 — Système de Skills IA, Reset & Thèmes

- **Système de Skills IA** : Distribution de skills composants, skills modules core et skill global avec gestion `--skills` / `--no-skills`.
- **Commande `rs-ui reset` & alias `rs-ui-reset`** : Archivage sécurisé dans `rs-ui-example/` ou suppression définitive `--delete`.
- **Thèmes élargis** : Ajout de 3 nouveaux presets (`green`, `red`, `cyan`) portant le total à 9 presets.
- **Moteur de Thème Personnalisé (Custom Engine)** : Assistant interactif à 2 étapes et options CLI directes.
- **Diagnostic enrichi (`rs-ui doctor`)** : Audit complet de la présence et de la cohérence des Skills IA.

---

## 🆘 Support & Liens

- **Bugs et suggestions** : [GitHub Issues](https://github.com/AbdoulRachid-Mz/rashwright-ui/issues)
- **Documentation contributeur** : [CONTRIBUTOR.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md)
- **Guide de démarrage rapide** : [Quick-Start.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/Quick-Start.md)

---

**Licence MIT · Rashwright office.**
