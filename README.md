<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile Logo" width="200" />
</p>

# Rashwright UI Mobile (`rs-ui`)

> Système moderne de composants et de widgets **distribuables** pour **React Native** & **Expo** avec moteur **Liquid Glass UI**, inspiré de la philosophie *shadcn/ui* : **vous copiez le code source dans votre projet, vous en êtes propriétaire**.

**Statut v1.6.0** : ✅ Version v1.6.0 — `@rashwright/cli@1.6.0` · `@rashwright/ui-mobile@1.6.0`  
**Moteur de Widgets Modulaires & Showcases** : 6 Widgets autonomes (`MetricWidget`, `ProgressWidget`, `QuickActionsWidget`, `ChartWidget`, `ActivityFeedWidget`, `FinanceWidget`) + 2 Showcases d'intégration (`FinanceDashboardShowcase`, `AnalyticsDashboardShowcase`) · **Commandes dédiées** : `rs-ui widget list/info/add/remove` et `rs-ui add -w <id>` avec détection automatique et résolution de dépendances · **Composants & Templates** : 79 composants UI + 8 primitives Liquid Glass + 10 Templates Autonomes · **Accessibilité WCAG 2.1 AA** : `accessibilityRole`, `accessibilityState`, `accessibilityLabel` sur tous les composants et widgets · **Tests** : 245 tests unitaires Vitest (51 suites, 100% vert) · **Typing strict** : Zéro `any`.

<p align="center">
  <a href="https://www.npmjs.com/package/@rashwright/cli"><img src="https://img.shields.io/badge/@rashwright/cli-v1.6.0-cb3837?logo=npm" alt="npm - @rashwright/cli" /></a>
  <a href="https://www.npmjs.com/package/@rashwright/ui-mobile"><img src="https://img.shields.io/badge/@rashwright/ui--mobile-v1.6.0-cb3837?logo=npm" alt="npm - @rashwright/ui-mobile" /></a>
  <a href="https://github.com/AbdoulRachid-Mz/rashwright-ui"><img src="https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2058-000000.svg?logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/MCP%20Server-JSON--RPC%202.0-8A2BE2.svg" alt="MCP Server" />
  <img src="https://img.shields.io/badge/Tests-245%20passed-success.svg" alt="Tests" />
  <img src="https://img.shields.io/badge/WCAG-2.1%20AA-blue.svg" alt="WCAG 2.1 AA" />
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

# 3. Ajouter des composants atomiques (avec leurs Skills IA automatiquement associés)
rs-ui add button drawer card accordion form otp-input

# 4. Ajouter des widgets modulaires autonomes
rs-ui add -w metric finance quick-actions
# ou via la commande dédiée :
rs-ui widget add chart activity-feed

# 5. Nettoyer les fichiers de démo quand vous êtes prêt
rs-ui reset
```

> 💡 **Rien à comprendre du monorepo.** `@rashwright/cli` est **votre unique point d'entrée** : il va chercher les composants et widgets dans le Registry `@rashwright/ui-mobile` (localement ou via CDN distant avec cache), résout les versions natives compatibles avec votre SDK Expo et copie le code source directement dans votre projet avec sa documentation IA contextuelle (`skills/rs-ui/`). Pas de `node_modules` opaque.

---

## 📑 Sommaire — Guide utilisateur

1. [Pourquoi Rashwright ?](#-pourquoi-rashwright-)
2. [Nouveautés de la Version v1.6.0](#-nouveautés-de-la-version-v160)
3. [Nouveautés de la Version v1.5.0](#-nouveautés-de-la-version-v150)
4. [Moteur de Widgets Modulaires (`rs-ui widget`)](#-moteur-de-widgets-modulaires-rs-ui-widget)
5. [Templates Autonomes Complets (`rs-ui template`)](#-templates-autonomes-rs-ui-template)
6. [Component-Detector & Modèle shadcn/ui](#-component-detector--modèle-shadcnui)
7. [Serveur MCP IA pour IDEs & Agents (`rs-ui mcp`)](#-serveur-mcp-ia-rs-ui-mcp)
8. [Système de Skills IA](#-système-de-skills-ia)
9. [Prérequis & Installation du CLI](#-prérequis)
10. [Initialiser un projet (`rs-ui init`)](#-initialiser-un-projet-rs-ui-init)
11. [Ajouter des composants & Widgets (`rs-ui add`)](#-ajouter-des-composants-rs-ui-add--list--info)
12. [Réinitialiser le projet starter (`rs-ui reset`)](#-réinitialiser-le-projet-starter-rs-ui-reset)
13. [Les 9 thèmes prédéfinis & Moteur Custom](#-les-9-thèmes-prédéfinis--moteur-custom)
14. [Diagnostic (`rs-ui doctor`)](#-diagnostic-rs-ui-doctor)
15. [Matrice de compatibilité Expo SDK](#-matrice-de-compatibilité-expo-sdk)
16. [Architecture & Monorepo](#-architecture--monorepo)
17. [Historique des Versions Précédentes (v1.4.0 → v0.3.0)](#-historique-des-versions-précédentes)

> 🛠️ **Vous voulez contribuer ?** → Consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)** et **[Quick-Start.md](./Quick-Start.md)**.

---

## ❓ Pourquoi Rashwright ?

Rashwright UI Mobile n'est **pas une dépendance npm opaque dans `node_modules/`**. C'est un **système de distribution de code source directe** à la *shadcn/ui* enrichi d'un **système de Skills IA** :

- ✅ **Propriété totale du code** : Chaque composant et widget installé via `rs-ui add` est **copié** dans ton projet (`components/ui/` ou `components/widgets/`). Tu peux l'éditer, l'adapter et le personnaliser sans contrainte.
- ✅ **Support IA natif** : Chaque composant et widget s'accompagne de son `SKILL.md` (`skills/rs-ui/`) pour donner le contexte parfait à Antigravity, Cursor, Gemini CLI, Claude Code et Copilot.
- ✅ **Moteur de Widgets Modulaires** : Blocs métiers distribuables (`MetricWidget`, `FinanceWidget`, `ProgressWidget`, `QuickActionsWidget`, `ChartWidget`, `ActivityFeedWidget`) avec intégration lockfile SHA-256.
- ✅ **10 Templates Autonomes Complets** : Installez des flux complets (`rs-ui template add auth/dashboard/commerce/settings...` ou `rs-ui add -t <id>`) directement dans votre projet (`src/components/templates/<id>/`).
- ✅ **Component-Detector (shadcn/ui style)** : Détection intelligente et conditionnelle de TOUTES les dépendances (`hooks/use-responsive`, `lib/responsive`, packages Expo/npm) — n'installe que ce qui manque !
- ✅ **Résolution automatique Expo SDK** : Le CLI gère explicitement votre version d'Expo (**SDK 54 à 58**) et installe les versions natives **testées** pour `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, etc.
- ✅ **Moteur Liquid Glass intégré** : Effets de flou dynamique, reflets physiques, bordures translucides, rebonds tactiles haptiques — activable via `--glass` dans `rs-ui init`.
- ✅ **9 thèmes + Custom Engine** : `default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`, et création de thème personnalisé.
- ✅ **Commande `rs-ui reset`** : Archivage ou suppression en une commande des fichiers de démonstration du starter.
- ✅ **79 composants atomiques** au catalogue avec typage strict TypeScript et zéro `any`.

---

## 🆕 Nouveautés de la Version v1.6.0

- 🧩 **Nouveau Moteur de Widgets Modulaires & Distribuables** :
  - **Couche fonctionnelle autonome** : les widgets représentent des blocs métiers complets, réutilisables et distribuables indépendamment des pages ou templates complets.
  - **Catalogue des 6 widgets officiels** :
    1. `MetricWidget` (`widgets/metric`) : indicateur statistique clé avec tendance (+/-%), comparaison périodique, icône, état de chargement et support Liquid Glass.
    2. `ProgressWidget` (`widgets/progress`) : progression vers un objectif avec pourcentage calculé, barre animée, état complété et support Liquid Glass.
    3. `QuickActionsWidget` (`widgets/quick-actions`) : grille d'actions rapides configurable (2 à 4 colonnes), icônes, badges et retour haptique.
    4. `ChartWidget` (`widgets/chart`) : visualisation graphique en barres animées, répartition et sparklines avec infobulle interactive sans dépendances lourdes.
    5. `ActivityFeedWidget` (`widgets/activity-feed`) : flux d'activité chronologique avec avatars/icônes, libellés temporels, statuts, montants et interactions.
    6. `FinanceWidget` (`widgets/finance`) : bloc portefeuille financier complet avec solde principal, masquage de confidentialité (`•••• €`), ratio revenus/dépenses, raccourcis et Liquid Glass.
  - **Commandes dédiées** :
    ```bash
    rs-ui widget list              # Lister les widgets disponibles
    rs-ui widget info <id>         # Détail des props et spécifications d'un widget
    rs-ui add -w <id>              # Installer un widget dans votre projet
    rs-ui widget add <id>          # Alias direct d'installation
    rs-ui widget remove <id>       # Désinstaller un widget
    ```
  - **Détection automatique et intégrité** : résolution automatique des composants de base requis via `component-detector`, traçabilité par hash SHA-256 dans le lockfile (`checkWidgetIntegrity`), et copie automatique des skills IA dans `skills/rs-ui/widgets/<id>/SKILL.md`.
  - **2 Nouveaux Showcases d'intégration** :
    - `FinanceDashboardShowcase` : tableau de bord financier complet intégrant `FinanceWidget`, `MetricWidget`, `QuickActionsWidget`, `ChartWidget`, `ActivityFeedWidget`.
    - `AnalyticsDashboardShowcase` : tableau de bord analytique combinant statistiques, graphiques semestriels et événements système.
  - **Quality Gate complet** : 51 suites de tests, **245 tests unitaires Vitest réussis (100% vert)**.

---

## 🌟 Nouveautés de la Version v1.5.0

- 💎 **11 Nouveaux Composants UI de Pointe (Catalogue porté à 79 composants)** :
  - **`LikeButton`** (`components/ui/like-button.tsx`) : bouton d'interaction sociale animé avec micro-rebond tactile, explosion de particules, support Glass et compteur incrémental.
  - **`PasswordStrength`** (`components/ui/password-strength.tsx`) : analyseur d'entropie locale sécurisée, jauge segmentée animée, checklist d'exigences et score de robustesse sans dépendances réseau.
  - **`CopyButton`** (`components/ui/copy-button.tsx`) : bouton de copie dans le presse-papiers avec feedback visuel temporaire, états succès/erreur et support multiplateforme.
  - **`FloatingLabelInput`** (`components/ui/floating-label-input.tsx`) : champ de saisie moderne avec label animé flottant Reanimated, états focus/erreur/disabled et support Glass.
  - **`HoldButton`** (`components/ui/hold-button.tsx`) : bouton à maintien prolongé avec jauge de progression circulaire ou linéaire anti-action accidentelle destructive.
  - **`SwipeActionButton`** (`components/ui/swipe-action-button.tsx`) : glissière horizontale "slide to confirm" avec seuil de déclenchement, retour élastique et haptique.
  - **`TagInput`** (`components/ui/tag-input.tsx`) : saisie et gestion dynamique de mots-clés, badges amovibles, validation anti-doublon et suppression au clavier.
  - **`NumberInput`**, **`ReorderableList`**, **`InlineEdit`**, **`ExpandableText`**.
- ♿ **Accessibilité Universelle WCAG 2.1 AA** :
  - Ajout des attributs `accessibilityRole`, `accessibilityState`, `accessibilityLabel` sur tous les composants interactifs.
  - Règle de priorité des styles : `style={[styles.base, internalStyle, style]}` — la personnalisation de l'utilisateur prime systématiquement.
- ⚙️ **Correctif NativeWind v5 `npm install`** :
  - Détection automatique et utilisation de `--legacy-peer-deps` pour npm (résout les conflits `react-native-css` qui bloquaient indéfiniment `--force`).
- 📐 **Architecture Formalisée & Specs Expo Critiques** :
  - Documentation approfondie de l'architecture (`architecture.md`) et spécifications de 10 écrans Expo critiques (`PHASE7-EXPO-SCREENS.md`).
- 🧪 **227 tests unitaires Vitest (47 suites de tests, 100% vert)**.

---

## 🧩 Moteur de Widgets Modulaires (`rs-ui widget`)

Les widgets modulaires comblent l'espace entre les composants UI atomiques (`Button`, `Card`, `Badge`) et les templates de pages complètes (`Auth`, `Dashboard`) :

```bash
# Lister les widgets disponibles
rs-ui widget list

# Obtenir des informations détaillées sur un widget
rs-ui widget info metric
rs-ui widget info finance

# Installer un ou plusieurs widgets avec leurs dépendances atomiques
rs-ui add -w metric progress chart
# ou :
rs-ui widget add finance quick-actions
```

| Widget | Dossier source | Composants atomiques requis | Description |
|---|---|---|---|
| `MetricWidget` | `widgets/metric/` | `card`, `badge` | Affiche une métrique clé (KPI), variation %, label, icône et Liquid Glass |
| `ProgressWidget` | `widgets/progress/` | `card`, `progress` | Suivi d'objectif multi-étapes avec jalons et statut visuel |
| `QuickActionsWidget` | `widgets/quick-actions/` | `card`, `button`, `badge` | Grille d'actions rapides 2 à 4 colonnes avec retour tactile |
| `ChartWidget` | `widgets/chart/` | `card`, `badge` | Barres verticales et horizontales avec infobulles, zéro dépendance lourde |
| `ActivityFeedWidget` | `widgets/activity-feed/` | `card`, `avatar`, `badge` | Flux chronologique avec avatars, montants, statuts et timestamps |
| `FinanceWidget` | `widgets/finance/` | `card`, `button`, `badge` | Solde avec confidentialité masquable (`•••• €`), flux revenus/dépenses et raccourcis |

---

## 📦 Templates Autonomes (`rs-ui template`)

Rashwright UI Mobile intègre 10 templates complets prêts à l'emploi :

```bash
# Lister tous les templates disponibles
rs-ui template list

# Inspecter les détails d'un template
rs-ui template info auth
rs-ui template info finance

# Installer un template complet (avec composants et dépendances requis)
rs-ui template add auth
rs-ui template add commerce
rs-ui add -t dashboard
```

Catalogue des 10 templates : `minimal`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`, `showcase`, `chat`, `finance`, `social`.

---

## 🧩 Component-Detector & Modèle shadcn/ui

Contrairement aux frameworks lourds qui installent toutes les dépendances dès le bootstrap, Rashwright UI Mobile adopte une **philosophie modulaire et conditionnelle stricte (style shadcn/ui)** :

1. **Aucun package inutile à l'init** : Votre projet reste ultra-léger et ne contient que les packages indispensables.
2. **Détection récursive à l'ajout (`rs-ui add`)** : Dès que vous ajoutez un composant, un widget ou un template, le `ComponentDetector` inspecte :
   - Les **logiques fonctionnelles internes requises** (`hooks/use-responsive.ts`, `lib/responsive.ts`, `hooks/use-device.ts`, etc.) et les copie si elles sont absentes.
   - Les **dépendances natives Expo / npm** requises (`expo-device`, `react-native-reanimated`, etc.) et les installe automatiquement avec votre gestionnaire de paquets (`bun`, `npm`, `pnpm`, `yarn`).
   - Les **composants dépendants** (`requiresComponents`) et résout l'arborescence complète sans doublons.

---

## 🤖 Serveur MCP IA (`rs-ui mcp`)

Connectez directement le catalogue de composants, de widgets et de templates de Rashwright UI à vos assistants de code IA préférés grâce au protocole standard **Model Context Protocol (MCP)** :

```bash
# Démarrer le serveur MCP en mode stdio (JSON-RPC 2.0)
rs-ui mcp

# Configuration automatique en 1 clic pour votre IDE
rs-ui mcp setup cursor --write    # Pour Cursor (.cursor/mcp.json)
rs-ui mcp setup claude            # Pour Claude Desktop (claude_desktop_config.json)
rs-ui mcp setup vscode            # Pour VS Code / Roo Code / Cline (.vscode/mcp.json)
```

### Outils IA disponibles via MCP :
- `list_components` : Liste les 79 composants avec catégories et support Glass
- `get_component` : Extrait le code TSX complet, les types et les dépendances d'un composant
- `search_registry` : Recherche floue de composants, widgets et templates
- `get_theme_tokens` : Fournit les tokens de design (couleurs, radius, typographie, liquid glass)
- `get_skill` : Récupère la documentation contextuelle IA (`SKILL.md`)
- `list_templates` : Liste les 10 templates modulaires disponibles
- `generate_screen` : Composition assistée d'écrans mobiles complets
- `audit_accessibility` : Audit automatique d'accessibilité ARIA et tailles tactiles
- `convert_styling` : Conversion automatique entre StyleSheet et Tailwind NativeWind

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
│       ├── drawer/
│       │   └── SKILL.md        # Skill Drawer (props, gesture handler)
│       └── widgets/
│           ├── metric/
│           │   └── SKILL.md    # Skill MetricWidget
│           └── finance/
│               └── SKILL.md    # Skill FinanceWidget
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
# Affiche 1.6.0
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
rs-ui add button card modal accordion form otp-input

# Prévisualiser les modifications avant écrasement
rs-ui add button --diff

# Ajouter tous les composants disponibles (79)
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
           ├── packages/cli/       ──────▶   @rashwright/cli@1.6.0
           │    └── commandes: rs-ui / rs-ui-reset / rs-ui-mcp / rs-ui fix / rs-ui showcase / rs-ui widget
           │
           └── packages/ui-mobile/ ──────▶   @rashwright/ui-mobile@1.6.0
                ├── components/ui/              (79 composants sources)
                ├── widgets/                    (6 widgets modulaires)
                ├── showcases/                  (2 dashboards d'intégration)
                ├── templates/                  (10 templates autonomes)
                ├── skills/                     (79 skills atomiques + 6 skills widgets + core)
                ├── registry/                   (métadonnées & matrices SDK 54 à 58)
                ├── liquid/ primitives          (moteur Liquid Glass)
                └── lib/upload/                 (moteur d'upload inliné)
```

---

## 📜 Historique des Versions Précédentes

### Version v1.4.0

- 🛠️ **Commande `rs-ui fix` (Auto-Remédiation d'Environnement)** :
  - Détecte et répare automatiquement les anomalies de configuration d'un projet React Native / Expo :
    - Injection du plugin `react-native-reanimated/plugin` dans `babel.config.js`.
    - Installation automatique des modules natifs Expo manquants via le package manager du projet (`bun`, `pnpm`, `yarn`, `npm`).
    - Génération de `nativewind-env.d.ts` avec déclaration ambiante `declare module "*.css";`.
    - Synchronisation des fiches de Skills IA (`skills/rs-ui/`) pour tous les composants installés.
- 💎 **3 Nouveaux Composants Mobiles Clés** :
  - **`Command`** : palette de recherche rapide et d'actions contextuelles (cmd+k style).
  - **`ColorPicker`** : sélecteur de couleurs tactile avec nuancier 12 presets et champ hexadécimal.
  - **`NavigationMenu`** : menu accordéon hiérarchique avec chevrons rotatifs et badges.
- 🔍 **Visualisation CLI enrichie (`rs-ui info --preview`)** : extrait canonique TSX dans le terminal.
- 🎪 **Showcase Storybook Mobile (`rs-ui showcase`) & E2E Maestro (6 flows déclaratifs)**.

### Version v1.2.0

- **🔄 Commande `rs-ui upgrade` & 3-Way Merge** :
  - Mise à jour différentielle intelligente préservant les modifications personnalisées de l'utilisateur.
  - Résolution des conflits avec marqueurs Git standard (`<<<<<<< LOCAL` / `>>>>>>> REGISTRY`).
- **🪄 AST Transformers & Options `--alias`** :
  - Réécriture chirurgicale des alias d'import (`@/` vers `~/` ou `@app/`).
- **🤖 Serveur MCP IA Élargi (`rs-ui mcp`)** :
  - Outils `generate_screen`, `audit_accessibility`, `convert_styling`.
- **📦 3 Nouveaux Templates Métiers Autonomes (10 templates au total)** :
  - `chat`, `finance`, `social`.
- **⚡ Bun Install `--force` & Fix NativeWind v5**.

### Version v1.1.0

- 📅 **Nouveaux composants mobiles clés** :
  - `Calendar`, `DatePicker`, `SwipeableRow`, `Popover`, `SegmentedControl`, `Skeleton`, `Shimmer`, `ScreenSkeleton`.
- 🏆 **Registre étendu à 65 composants** et 212 tests Vitest réussis (100% vert).

### Version v1.0.1

- 💎 **Enrichissement Premium des Templates Autonomes** :
  - `auth` : écrans dédiés séparés `sign-in.tsx` et `sign-up.tsx` + `GoogleAuthButton`.
  - `commerce` : catalogue `products-screen.tsx` et détail `product-detail-screen.tsx`.
  - `onboarding` : flow fluide et redirection vers `HomeScreen`.
  - `dashboard` : sélecteur de périodes et métriques interactives.
  - `settings` : sélecteur 3 modes d'apparence (Système, Clair, Sombre).
- 🚀 **Prise en Charge Officielle Expo SDK 58 Stable**.
- ⚙️ **Correction NativeWind & Dark Mode**.
- 🧱 **Composant `ThemedView` Auto-Suffisant** (`InlineGridCarousel` inliné).

### Version v1.0.0

- 🧩 **Component-Detector Automatique (Modèle shadcn/ui)** :
  - Inspection récursive du code et des registres lors de l'ajout d'un composant (`rs-ui add <name>`) ou d'un template.
  - Installation conditionnelle des logiques fonctionnelles manquantes (`hooks/use-responsive.ts`, `lib/responsive.ts`, etc.).
- 🤖 **Serveur Model Context Protocol (MCP) IA Intégré (`rs-ui mcp`)** :
  - Expose un serveur MCP standard JSON-RPC 2.0 sur `stdio` pour Cursor, Claude Desktop et VS Code.
- 📐 **Moteur Responsive & Grille Multi-Colonnes Adaptative**.
- 🔍 **Recherche Floue Haute Vitesse (`rs-ui search <query>`)**.
- 🎨 **Comparateur Visuel en Ligne de Commande (`rs-ui diff [component]`)**.
- 🌪️ **Double Moteur de Style (Dual Engine)** : StyleSheet natif + NativeWind v4/v5.

### Versions Antérieures (v0.9.0 → v0.3.0)

- **v0.9.0** : Support NativeWind v4 & v5 opt-in dans `rs-ui init`, primitives headless (`useControllableState`, `useDisclosure`, `buildAccessibilityProps`), registre RFC v4.
- **v0.7.3** : Correctif dépendances manquantes `expo-router`, `react-dom`, `react-native-web`.
- **v0.7.2** : Correctif `rs-ui init .` et `isFreshProject`.
- **v0.7.1** : Correctifs critiques d'ordre d'installation des modules natifs Expo.
- **v0.7.0** : Refactor complet du moteur de templates autonomes (7 starters), Single Installation Flow, CLI Hooks subsystem, multi-registres scoped.
- **v0.3.0** : Introduction du système de Skills IA pour 61 composants + modules core, commande `rs-ui reset`, 9 presets de thèmes et Custom Engine.

---

## 📄 Licence

Licence MIT · Rashwright office. Tous droits réservés.
