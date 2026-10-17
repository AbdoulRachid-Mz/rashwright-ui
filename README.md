<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile Logo" width="200" />
</p>

# Rashwright UI Mobile (`rs-ui`)

> Système moderne de composants **distribuables** pour **React Native** & **Expo** avec moteur **Liquid Glass UI**, inspiré de la philosophie *shadcn/ui* : **vous copiez les composants dans votre codebase, vous en êtes propriétaire**.

**Statut v1.4.0** : ✅ Version v1.4.0 — `@rashwright/cli@1.4.0` · `@rashwright/ui-mobile@1.4.0`  
**Composants & Templates** : 68 composants UI + 8 primitives Liquid Glass + 10 Templates Autonomes (Auth, Commerce, Onboarding, Dashboard, Settings, Showcase, Minimal, Chat, Finance, Social) · **Cycle de Vie CLI, Auto-Remédiation & 3-Way Merge** : `rs-ui fix`, `rs-ui upgrade`, fusion différentielle sans écrasement et AST Transformers (`--alias`) · **Visualisation & E2E** : `rs-ui showcase` / `rs-ui storybook`, code preview `rs-ui info --preview`, et suite Maestro E2E (6 flows) · **Serveur MCP IA Avancé** : Compatible Cursor, Claude Desktop, VS Code avec 9 outils (`generate_screen`, `audit_accessibility`, `convert_styling`) · **SDK Expo** : SDK 54 à 58 (SDK 58 stable Recommandé) · **Tests** : 218 tests unitaires Vitest · **Typing strict** : Zéro `any`.

<p align="center">
  <a href="https://www.npmjs.com/package/@rashwright/cli"><img src="https://img.shields.io/badge/@rashwright/cli-v1.4.0-cb3837?logo=npm" alt="npm - @rashwright/cli" /></a>
  <a href="https://www.npmjs.com/package/@rashwright/ui-mobile"><img src="https://img.shields.io/badge/@rashwright/ui--mobile-v1.4.0-cb3837?logo=npm" alt="npm - @rashwright/ui-mobile" /></a>
  <a href="https://github.com/AbdoulRachid-Mz/rashwright-ui"><img src="https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2058-000000.svg?logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/MCP%20Server-JSON--RPC%202.0-8A2BE2.svg" alt="MCP Server" />
  <img src="https://img.shields.io/badge/Tests-218%20passed-success.svg" alt="Tests" />
  <img src="https://img.shields.io/badge/TypeScript-strict%20%7C%20zero%20any-3178c6.svg?logo=typescript" alt="TypeScript" />
</p>

---

## ⚡ Quick Start — Prêt en **30 secondes**

```bash
# 1. Installer le CLI (point d'entrée unique pour les développeurs utilisateurs)
bun add -g @rashwright/cli
# ou : npm install -g @rashwright/cli

# 2. Initialiser Rashwright UI Mobile dans un projet Expo existant (ou nouveau)
rs-ui init --glass --theme cyan --yes

# 3. Ajouter des composants (avec leurs Skills IA automatiquement associés)
rs-ui add button drawer
rs-ui add card accordion form otp-input

# 4. Nettoyer les fichiers de démo quand vous êtes prêt
rs-ui reset
```

> 💡 **Rien à comprendre du monorepo.** `@rashwright/cli` est **votre unique point d'entrée** : il va chercher les composants dans le Registry `@rashwright/ui-mobile` (localement ou via CDN distant avec cache de 24h), résout les versions natives compatibles avec votre SDK Expo et copie le code source directement dans votre projet avec sa documentation IA contextuelle (`skills/rs-ui/`). Pas de `node_modules` opaque.

---

## 📑 Sommaire — Guide utilisateur

1. [Pourquoi Rashwright ?](#-pourquoi-rashwright-)
2. [Nouveautés Majeures de la version v1.0.0](#-nouveautés-majeures-de-la-version-v100)
3. [Component-Detector & Modèle shadcn/ui](#-component-detector--modèle-shadcnui)
4. [Serveur MCP IA pour IDEs & Agents](#-serveur-mcp-ia-pour-ides--agents)
5. [Système de Skills IA](#-système-de-skills-ia)
6. [Prérequis](#-prérequis)
7. [Installation du CLI `rs-ui`](#-installation-du-cli-rs-ui)
8. [Initialiser un projet (`rs-ui init`)](#-initialiser-un-projet-rs-ui-init)
9. [Ajouter des composants & Templates (`rs-ui add / template`)](#-ajouter-des-composants-rs-ui-add--list--info)
10. [Réinitialiser le projet starter (`rs-ui reset`)](#-réinitialiser-le-projet-starter-rs-ui-reset)
11. [Les 9 thèmes prédéfinis & Moteur Custom](#-les-9-thèmes-prédéfinis--moteur-custom)
12. [Composants d'upload et providers](#-composants-dupload-et-providers)
13. [Diagnostic (`rs-ui doctor`)](#-diagnostic-rs-ui-doctor)
14. [Matrice de compatibilité Expo SDK](#-matrice-de-compatibilité-expo-sdk)
15. [Architecture & Dépôt `rashwright-ui`](#-architecture--dépôt-rashwright-ui)

> 🛠️ **Vous voulez contribuer ?** → Consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)** et **[Quick-Start.md](./Quick-Start.md)**.

---

## ❓ Pourquoi Rashwright ?

Rashwright UI Mobile n'est **pas une dépendance npm opaque dans `node_modules/`**. C'est un **système de distribution de code source directe** à la *shadcn/ui* enrichi d'un **système de Skills IA** :

- ✅ **Propriété totale du code** : Chaque composant installé via `rs-ui add` est **copié** dans ton projet (`components/ui/`). Tu peux l'éditer, l'adapter, le personnaliser sans contrainte.
- ✅ **Support IA natif** : Chaque composant s'accompagne de son `SKILL.md` (`skills/rs-ui/<component>/`) pour donner le contexte parfait à Antigravity, Cursor, Gemini CLI, Claude Code et Copilot.
- ✅ **Templates Autonomes Complets** : Installez des flux complets (`rs-ui template add auth/dashboard/commerce/settings...` ou `rs-ui add -t <id>`) directement dans votre projet (`src/components/templates/<id>/`).
- ✅ **Component-Detector (shadcn/ui style)** : Détection intelligente et conditionnelle de TOUTES les dépendances (`hooks/use-responsive`, `lib/responsive`, packages Expo/npm) — n'installe que ce qui manque !
- ✅ **Résolution automatique Expo SDK** : Le CLI gère explicitement votre version d'Expo (**SDK 54 à 59**) et installe les versions natives **testées** pour `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, etc.
- ✅ **Moteur Liquid Glass intégré** : Effets de flou dynamique, reflets physiques, bordures translucides, rebonds tactiles haptiques — activable via `--glass` dans `rs-ui init`.
- ✅ **9 thèmes + Custom Engine** : `default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`, et création de thème custom.
- ✅ **Commande `rs-ui reset`** : Archivage ou suppression en une commande des fichiers de démonstration du starter.
- ✅ **68 composants** au catalogue avec typage strict TypeScript et zéro `any`.

## 🌟 Nouveautés de la Version v1.4.0

- 🛠️ **Commande `rs-ui fix` (Auto-Remédiation d'Environnement)** :
  - Détecte et répare automatiquement les anomalies de configuration d'un projet React Native / Expo :
    - Injection du plugin `react-native-reanimated/plugin` dans `babel.config.js`.
    - Installation automatique des modules natifs Expo manquants via le package manager du projet (`bun`, `pnpm`, `yarn`, `npm`).
    - Génération de `nativewind-env.d.ts` avec déclaration ambiante `declare module "*.css";`.
    - Synchronisation des fiches de Skills IA (`skills/rs-ui/`) pour tous les composants installés.
    - Support des drapeaux `--dry-run`, `-y, --yes` et `--json`.

- 💎 **3 Nouveaux Composants Mobiles Avancés (Catalogue porté à 68 composants)** :
  - **`Command`** (`components/ui/command.tsx`) : palette de recherche rapide et d'actions contextuelles (inspiration cmd+k mobile), filtres par sections groupées, raccourcis tactiles, état vide et modale dialog Liquid Glass.
  - **`ColorPicker`** (`components/ui/color-picker.tsx`) : sélecteur de couleurs tactile avec nuancier de 12 presets, champ d'édition hexadécimale directe, aperçu dynamique et haptique.
  - **`NavigationMenu`** (`components/ui/navigation-menu.tsx`) : menu accordéon hiérarchique avec chevrons rotatifs, capsules d'état actif, badges de notification et accessibilité WAI-ARIA `menuitem`.

- 🔍 **Visualisation CLI enrichie (`rs-ui info --preview`)** :
  - Le drapeau `-p, --preview` extrait automatiquement le code TSX d'exemple depuis le Skill IA correspondant et l'affiche dans une boîte de terminal formatée ASCII avant installation.

- 🎪 **Showcase Storybook Mobile (`rs-ui showcase`) & E2E Maestro** :
  - Commande `rs-ui showcase` (alias `rs-ui storybook`) avec options `--web`, `--port`, `--theme`, `--inject`.
  - 6 flows de tests end-to-end automatisés Maestro (`e2e/maestro/`) intégrés au Quality Gate (`bun run validate-maestro`).

## 🌟 Nouveautés de la Version v1.0.1

- 💎 **Enrichissement Premium des Templates Autonomes (`rs-ui template add`)** :
  - **Template `auth`** :
    - Deux écrans autonomes dédiés : `sign-in.tsx` (connexion) et `sign-up.tsx` (création de compte).
    - Nouveau composant `GoogleAuthButton` vectoriel officiel avec retour haptique, animations et mode Liquid Glass.
    - Formulaires enrichis avec séparateur visuel moderne.
  - **Template `commerce`** :
    - Écran catalogue `products-screen.tsx` avec recherche en temps réel, filtres catégories, badges d'état et compteur de panier dynamique.
    - Écran détail produit complet `product-detail-screen.tsx` (`productId`) avec affichage hero, sélecteur de variantes (couleurs, tailles), notation étoilée (`Rating`) et barre d'achat sticky avec sélecteur de quantité.
  - **Template `onboarding`** :
    - Flow d'introduction fluide avec redirection automatique vers un écran d'accueil dédié `onboarding-home-screen.tsx` (`HomeScreen`) présentant un dashboard complet et des actions rapides.
  - **Template `dashboard`** :
    - Sélecteur temporel interactif (7 jours, 30 jours, 3 mois, 1 an).
    - Barre d'actions rapides (Nouveau rapport, Inviter membre, Exporter les données).
    - Métriques interactives avec badges de tendance.
  - **Template `settings`** :
    - Sélecteur d'apparence à 3 modes : Système (🖥️), Clair (☀️), Sombre (🌙), synchronisé en temps réel avec le `ThemeContext`.
    - Toggles interactifs pour les notifications push et l'effet Liquid Glass.

- ⚙️ **Correction NativeWind & Dark Mode (`errors.md`)** :
  - Ajout automatique de `darkMode: "class"` dans `tailwind.config.js` lors de l'initialisation NativeWind v4 (Tailwind v3.4).
  - Élimination de l'exception web : `[Error: Cannot manually set color scheme, as dark mode is type 'media']`.
  - Configuration de `"userInterfaceStyle": "automatic"` et du plugin `expo-system-ui` dans `app.json`.

- 🚀 **Prise en Charge Officielle Expo SDK 58 Stable** :
  - Support certifié pour Expo SDK 54 à 58.
  - SDK 58 configuré comme choix Recommandé par défaut dans `rs-ui init`.

- 🧱 **Composant `ThemedView` Auto-Suffisant** :
  - Sous-composant `InlineGridCarousel` intégré directement dans `view.tsx` pour éliminer toute dépendance statique sur `carousel.tsx`.
  - Copie automatique des modules fondamentaux `use-responsive.ts` et `lib/responsive.ts` dès `setupFoundations`.
  - Ajout de `expo-device` dans `CORE_EXPO_DEPS`.

## 🌟 Nouveautés Majeures de la Version v1.0.0

- 🧩 **Component-Detector Automatique (Modèle shadcn/ui)** :
  - Inspection récursive du code et des registres lors de l'ajout d'un composant (`rs-ui add <name>`) ou d'un template (`rs-ui template add <id>`).
  - Détection automatique et installation conditionnelle des logiques fonctionnelles manquantes : `hooks/use-responsive.ts`, `lib/responsive.ts`, `hooks/use-device.ts`, utilitaires `lib/upload/`, déclarations ambient CSS.
  - Détection et ajout automatique des packages Expo/npm manquants (`expo-device`, `react-native-reanimated`, etc.) dans votre `package.json`.

- 🤖 **Serveur Model Context Protocol (MCP) IA Intégré (`rs-ui mcp`)** :
  - Expose un serveur MCP standard JSON-RPC 2.0 sur `stdio` pour connecter directement vos IDEs et agents IA (**Cursor**, **Claude Desktop**, **VS Code Roo/Cline**, **Gemini Code Assist**).
  - Outils MCP disponibles : `list_components`, `get_component` (avec code source TSX complet), `search_registry`, `get_theme_tokens`, `get_skill`, `list_templates`, `get_template`.
  - Commande `rs-ui mcp setup cursor --write` ou `rs-ui mcp setup claude` pour une installation instantanée en un clic.

- 📐 **Moteur Responsive & Grille Multi-Colonnes Adaptative** :
  - Détecteur de breakpoints standard (`sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1536`) dans `lib/responsive.ts` et hook réactif `useResponsive()`.
  - `ThemedView` et `ThemedFlatList` enrichis avec les props `grid`, `columns={{ sm: 1, md: 2, lg: 3 }}`, `gap`, `rowGap`, `columnGap`.
  - Tri dynamique intégré : `sortBy="asc" | "desc"`, `sortKey`, `sortFn`.
  - Insertion native de carrousels pleine largeur : prop `carousels` dans la grille sans casser la virtualisation ni le layout flexbox.

- 🔍 **Recherche Floue Haute Vitesse (`rs-ui search <query>`)** :
  - Recherche instantanée parmi les 61 composants, 7 templates autonomes et hooks, avec score de pertinence et commande d'installation suggérée.

- 🎨 **Comparateur Visuel en Ligne de Commande (`rs-ui diff [component]`)** :
  - Différentiel side-by-side couleur entre vos composants locaux personnalisés et les versions officielles du registre.

- 🌪️ **Double Moteur de Style (Dual Engine)** :
  - Mode A (Défaut) : `StyleSheet.create` + `useTheme()` — **Zéro dépendance tierce**.
  - Mode B (Optionnel) : NativeWind v4 (Tailwind v3.4) & v5 (CSS-first Tailwind v4) avec injection automatique de `global.css` et déclarations ambient `declare module "*.css"`.

- 🧪 **Quality Gate Absolu & Zéro `any`** :
  - **194 tests unitaires Vitest automatisés (40 suites de tests)** à 100% de réussite.
  - Typage TypeScript strict à 100% sur l'ensemble du monorepo.

---

## 🆕 Historique des Versions Précédentes

### Version v0.7.0

- 🧩 **Refactor Complet du Moteur de Templates (Modules Autonomes)** :
  - **Fin des chaînes TSX en dur dans le CLI** : chaque template est désormais un module indépendant autonome dans `@rashwright/ui-mobile/templates/<id>/` avec son manifeste `template.json`, ses types stricts, ses sous-composants et son index réutilisable.
  - **Distribution directe via le CLI** : `rs-ui add --template <nom>` (ou `-t <nom>`) installe le template complet dans `src/components/templates/<id>/`, résout automatiquement ses composants rs-ui requis et installe les dépendances nécessaires.
  - **Catalogue complet des 7 templates autonomes** :
    - `minimal` : écran d'accueil épuré, card de bienvenue, logo et toggles.
    - `auth` : suite d'authentification complète (LoginForm, RegisterForm, OtpStep).
    - `onboarding` : carrousel d'accueil avec pagination et étapes guidées.
    - `dashboard` : vue métriques avec StatsOverview, ActivityFeed et profil.
    - `commerce` : boutique en ligne avec catalogue, CategoryFilter, ProductCard, notes et panier.
    - `settings` : écran paramètres avec ProfileSection, PreferencesSection (mode sombre, notifications) et déconnexion.
    - `showcase` : vitrine complète avec onglets overview, composants et Liquid Glass.
  - **Inspection des templates** : `rs-ui list --templates` (ou `-t`) affiche la liste complète des templates, leur version, leurs composants requis et leur statut d'installation local.
  - **Suivi d'intégrité SHA-256 dans le Lockfile** : section `templates:` dans `rashwright-ui.lock` avec hash de chaque fichier copié et vérification d'intégrité (`checkTemplateIntegrity`).
  - **143 tests unitaires Vitest automatisés (31 suites de tests)** à 100% passants.

- 🎯 **Starter Templates Engine (`--template`)** :
  - **7 Starters complets** : `showcase` (complet), `minimal` (épuré), `auth` (connexion/inscription/OTP), `onboarding` (carrousel/slides), `dashboard` (statistiques/métriques), `commerce` (boutique/avis), `settings` (préférences/thème).
  - Chaque starter utilise exclusivement des composants Rashwright importés depuis `@/components/ui/` et l'architecture standardisée `/src`.
- ⚡ **Flow `rs-ui init` réorchestré & Installation unique** :
  - `rs-ui` orchestre le bootstrap Expo avec le template minimal `blank-typescript@<SDK>` et les drapeaux `--no-install` et `--no-agents-md`.
  - Élimination totale de la double installation : les composants, la configuration, le babel et tsconfig sont générés en amont, suivis d'une seule phase d'installation des dépendances.
  - Résolution explicite du SDK Expo (54, 55, 56, 57 ou `latest` résolu en SDK 57).
  - Banner ASCII unifié `printBanner`.
- 🪝 **CLI Hooks Subsystem** :
  - Exécution de commandes personnalisées sur les événements (`post-add`, `post-update`).
- 🌐 **Multi-Registres Scoped** :
  - Commande `rs-ui registry` (`add`, `list`, `remove`) et support de composants préfixés `@scope/component`.
- 🛡️ **Normalisation des chemins & Modernisation TypeScript** :
  - Chemins multiplateformes robustes sous Windows, Linux et macOS.
  - Suppression de `baseUrl` et `ignoreDeprecations` obsolètes.
  - **133 tests Vitest automatisés (100% passants)**.

- 🤖 **Système de Skills IA pour agents de code** :
  - **Skill Global** (`skills/rs-ui/SKILL.md`) installé automatiquement par `rs-ui init`.
  - **61 Skills de composants** (`skills/rs-ui/<component>/SKILL.md`) installés automatiquement par `rs-ui add`.
  - Options CLI `--skills` (activé par défaut) et `--no-skills`.
  - 4 skills modules core : `liquid`, `upload`, `theme`, `cli`.
- 🎨 **Moteur de Thèmes Élargi & Custom Engine** :
  - 3 nouveaux presets : `green` (Forest Green), `red` (Crimson Red), `cyan` (Cyber Cyan).
  - Flags CLI `--primary`, `--dark-primary`, `--secondary`, etc. pour injecter vos couleurs en ligne de commande.
  - Assistant interactif à 2 étapes (couleurs obligatoires puis facultatives avec valeurs par défaut).
- 🔄 **Commande `rs-ui reset` & alias `rs-ui-reset`** :
  - Archivage réversible par défaut vers `rs-ui-example/`.
  - Option de suppression définitive `--delete` / `--hard`.
  - Écran minimal d'accueil propre généré avec `useTheme()`.
- 🩺 **Diagnostic enrichi `rs-ui doctor`** :
  - Contrôle automatique de la présence et de la synchronisation des versions des Skills IA.
- 🛠️ **Correctifs & TypeScript** :
  - Correction de l'option `ignoreDeprecations: "5.0"` supportée par TypeScript 5.x.
  - Remplacement de `SafeAreaView` déprécié par `react-native-safe-area-context` dans le starter.
  - Chemin d'asset du logo normalisé vers `@/assets/primary.png`.

---

## 🤖 Système de Skills IA

Rashwright UI Mobile équipe les agents IA d'un contexte de développement exhaustif :

```text
mon-projet-expo/
├── skills/
│   └── rs-ui/
│       ├── SKILL.md            # Skill Global (architecture, tokens, Glass UI)
│       ├── button/
│       │   └── SKILL.md        # Skill Button (props, types, Reanimated)
│       └── drawer/
│           └── SKILL.md        # Skill Drawer (props, gesture handler)
```

Chaque skill contient :
1. Un **frontmatter YAML** exploitable par les outils IA.
2. Une **documentation Markdown** détaillée (props, types, pièges fréquents, exemples d'utilisation).

---

## 💻 Prérequis

| Outil | Version minimale | Rôle |
|---|---|---|
| **Bun** (recommandé) | `>= 1.2.0` | Package manager & runtime (utilisé par défaut par `rs-ui`) |
| **Node.js** | `>= 20.11.0` | Runtime JS (obligatoire pour Expo) |
| **Git** | Récent | Gestion de version |

---

## 📦 Installation du CLI `rs-ui`

### Option A : Installation globale (recommandée)
```bash
bun add -g @rashwright/cli
# ou avec npm :
npm install -g @rashwright/cli
```

### Option B : Exécution ponctuelle
```bash
bunx @rashwright/cli <commande>
# ou :
npx @rashwright/cli <commande>
```

Vérifier l'installation :
```bash
rs-ui --version
# Affiche 1.0.0
```

---

## 🧩 Component-Detector & Modèle shadcn/ui

Contrairement aux frameworks lourds qui installent toutes les dépendances dès le bootstrap, Rashwright UI Mobile adopte une **philosophie modulaire et conditionnelle stricte (style shadcn/ui)** :

1. **Aucun package inutile à l'init** : Votre projet reste ultra-léger et ne contient que les packages indispensables.
2. **Détection récursive à l'ajout (`rs-ui add`)** : Dès que vous ajoutez un composant ou un template, le `ComponentDetector` inspecte :
   - Les **logiques fonctionnelles internes requises** (`hooks/use-responsive.ts`, `lib/responsive.ts`, `hooks/use-device.ts`, etc.) et les copie si elles sont absentes.
   - Les **dépendances natives Expo / npm** requises (`expo-device`, `react-native-reanimated`, etc.) et les installe automatiquement avec votre gestionnaire de paquets (`bun`, `npm`, `pnpm`, `yarn`).
   - Les **composants dépendants** (`requiresComponents`) et résout l'arborescence complète sans doublons.

---

## 🤖 Serveur MCP IA (`rs-ui mcp`)

Connectez directement le catalogue de composants et de templates de Rashwright UI à vos assistants de code IA préférés grâce au protocole standard **Model Context Protocol (MCP)** :

```bash
# Démarrer le serveur MCP en mode stdio (JSON-RPC 2.0)
rs-ui mcp

# Configuration automatique en 1 clic pour votre IDE
rs-ui mcp setup cursor --write    # Pour Cursor (.cursor/mcp.json)
rs-ui mcp setup claude            # Pour Claude Desktop (claude_desktop_config.json)
rs-ui mcp setup vscode            # Pour VS Code / Roo Code / Cline (.vscode/mcp.json)
```

### Outils IA disponibles via MCP :
- `list_components` : Liste les 61 composants avec catégories et support Glass
- `get_component` : Extrait le code TSX complet, les types et les dépendances d'un composant
- `search_registry` : Recherche floue de composants et de templates
- `get_theme_tokens` : Fournit les tokens de design (couleurs, radius, typographie, liquid glass)
- `get_skill` : Récupère la documentation contextuelle IA (`SKILL.md`)
- `list_templates` : Liste les 7 templates modulaires disponibles

---

## 📦 Templates Autonomes (`rs-ui template`)

Rashwright UI Mobile intègre un gestionnaire de templates complets prêts à l'emploi :

```bash
# Afficher l'aide sur les templates
rs-ui template help

# Lister tous les templates disponibles
rs-ui template list
# ou : rs-ui template ls

# Inspecter les détails et fichiers d'un template
rs-ui template info auth
rs-ui template info settings

# Installer un template complet (avec tous ses composants et dépendances manquants)
rs-ui template add auth
rs-ui template add commerce
rs-ui template add settings
# ou via la commande add classique :
rs-ui add -t dashboard
```

---

## 🚀 Initialiser un projet (`rs-ui init`)

```bash
# Mode interactif avec choix de thème, assistant custom et option NativeWind
rs-ui init

# Mode automatique complet avec thème Cyber Cyan & Liquid Glass
rs-ui init --glass --theme cyan --sdk 58 --yes

# Définir le mode de thème par défaut dès l'init
rs-ui init --theme-mode dark
rs-ui init --theme-mode light

# Thème personnalisé en ligne de commande
rs-ui init --theme custom --primary "#00D9FF" --secondary "#1E293B" --dark-primary "#38BDF8"
```

---

## 🧩 Ajouter des composants (`rs-ui add` / `list` / `info`)

```bash
# Ajouter un composant et ses dépendances fonctionnelles automatiques
rs-ui add drawer
rs-ui add flat-list   # Installe automatiquement carousel, use-responsive et lib/responsive

# Ajouter sans installer le skill IA
rs-ui add drawer --no-skills

# Ajouter plusieurs composants
rs-ui add button card modal accordion form

# Prévisualiser les modifications avant écrasement
rs-ui add button --diff

# Ajouter tous les composants disponibles (61)
rs-ui add --all
```

---

## 🔄 Réinitialiser le projet starter (`rs-ui reset`)

Une fois le starter pris en main, supprimez ou archivez le showcase démo en une commande :

```bash
# Mode interactif sûr (archivage par défaut dans rs-ui-example/)
rs-ui reset

# Suppression définitive explicite
rs-ui reset --delete
```

---

## 🎨 Les 9 thèmes prédéfinis & Moteur Custom

| Thème | Couleur primaire | Usage recommandé |
|---|---|---|
| `default` | Bleu tech (`#2563EB` / `#3B82F6`) | Applications corporate, SaaS, productivité |
| `emerald` | Vert émeraude (`#059669` / `#10B981`) | Immobilier, fintech, écologie |
| `violet` | Violet profond (`#7C3AED` / `#8B5CF6`) | Créativité, design, IA |
| `amber` | Ambre chaud (`#D97706` / `#F59E0B`) | Alimentation, logistique, alertes |
| `rose` | Rose vif (`#E11D48` / `#F43F5E`) | Lifestyle, beauté, e-commerce |
| `slate` | Ardoise neutre (`#475569` / `#64748B`) | Minimalisme, luxe sobre, utilitaires |
| `green` | Vert forêt (`#16A34A` / `#22C55E`) | Nature, santé, développement durable |
| `red` | Rouge rubis (`#DC2626` / `#EF4444`) | Urgences, sport, fintech |
| `cyan` | Cyber cyan (`#0891B2` / `#00D9FF`) | Tech, IA, signature Rashwright |
| `custom` | Personnalisé | Votre propre charte graphique générée dynamiquement |

---

## 🛠 Diagnostic (`rs-ui doctor`)

Lance un diagnostic complet de l'environnement, des versions natives et des Skills IA :

```bash
rs-ui doctor
```

```text
  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 58
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: src/components/ui
  ✔ Composants installés: 12 (tous à jour)
  ✔ Skill IA Global (skills/rs-ui/SKILL.md)
  ✔ Skills IA Composants: 12/12 synchronisés
  ✔ react-native-reanimated — v~4.3.2
  ✔ react-native-gesture-handler — v~2.31.2
  ✔ react-native-safe-area-context — v~5.7.0
  ✔ expo-blur — v~56.0.5
  ✔ expo-linear-gradient — v~56.0.0

  Tout est en ordre!
```

---

## 📊 Matrice de compatibilité Expo SDK

| Expo SDK | Statut |
|---|---|
| SDK 54 | 🟢 Tested |
| SDK 55 | 🟢 Tested |
| SDK 56 | 🟢 Tested |
| SDK 57 | 🟢 Tested |
| SDK 58 | 🟢 Tested |
| SDK 59 | 🟡 Experimental (Matrice prête) |

---

## 🏗 Architecture & Monorepo

```text
Dépôt GitHub rashwright-ui             npm registry (public)
           │                                  │
           ├── packages/cli/       ──────▶   @rashwright/cli@1.4.0
           │    └── commandes: rs-ui / rs-ui-reset / rs-ui-mcp / rs-ui fix / rs-ui showcase
           │
           └── packages/ui-mobile/ ──────▶   @rashwright/ui-mobile@1.4.0
                ├── components/ui/              (68 composants sources)
                ├── templates/                  (10 templates autonomes)
                ├── skills/                     (68 skills + modules core)
                ├── registry/                   (métadonnées & matrices SDK 54 à 59)
                ├── liquid/ primitives          (moteur Liquid Glass)
                └── lib/upload/                 (moteur d'upload inliné)
```

---

## 🚀 Nouveautés v1.4.0

- **Commande `rs-ui fix`** : Détection et auto-remédiation de l'environnement (Reanimated Babel, dépendances Expo natives, typages CSS, Skills IA).
- **3 Nouveaux Composants Mobiles Avancés** : `Command`, `ColorPicker`, `NavigationMenu`.
- **Catalogue étendu à 68 composants** et 10 templates autonomes prêts à l'emploi.
- **Visualisation CLI enrichie (`rs-ui info --preview`)** : extrait canonique TSX dans le terminal.
- **Showcase Storybook Mobile & Tests Maestro E2E (6 flows)**.
- **Quality Gate 100% vert** : 46 suites de tests, 218 tests Vitest réussis sur 218.

Pour la documentation dédiée aux contributeurs, consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)**.

---

## 📄 Licence

Licence MIT · Rashwright office. Tous droits réservés.
