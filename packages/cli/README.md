<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile CLI" width="180" />
</p>

# @rashwright/cli — v1.6.0 · Commande `rs-ui` & `rs-ui-reset`

> CLI officiel **Rashwright UI Mobile** pour React Native / Expo.
> Inspiré de la philosophie shadcn/ui : **tu installes un composant, tu possèdes son code source.**
>
> Plus de `node_modules` opaque. Plus de surprise quant à la compatibilité Expo SDK.

[![npm](https://img.shields.io/badge/npm-%40rashwright%2Fcli-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/cli)
[![version](https://img.shields.io/badge/version-1.6.0-blue)](#)
[![GitHub](https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github)](https://github.com/AbdoulRachid-Mz/rashwright-ui)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2058-000020?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](#)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4%20%7C%20v5%20optional-06b6d4?logo=tailwindcss)](#)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](#)

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

### 3) Ajouter des composants & Skills IA

```bash
# Ajoute le composant ET son skill IA (skills/rs-ui/drawer/SKILL.md)
rs-ui add drawer

# Ajouter sans installer le skill IA
rs-ui add drawer --no-skills

# Ajout multiple
rs-ui add button card accordion form

# Prévisualiser les modifications avant d'écraser un composant personnalisé
rs-ui add button --diff

# Mode interactif avec cases à cocher :
rs-ui add

# Ajouter l'ensemble du catalogue (61 composants) :
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
| `rs-ui add [components...]` | Ajoute un ou plusieurs composants ou templates autonomes (`-t, --template`) avec leurs dépendances natives et Skills IA associés (`--skills`). |
| `rs-ui reset` / `rs-ui-reset` | Nettoie les fichiers de démo et showcase du starter (archivage dans `rs-ui-example/` ou suppression `--delete`). |
| `rs-ui list` | Liste les composants disponibles ou les templates autonomes (`-t, --templates`) avec statut d'installation. |
| `rs-ui info <component>` | Affiche la fiche technique détaillée d'un composant (versions, dépendances, plateformes, etc.). |
| `rs-ui doctor` | Évalue l'environnement (SDK, dépendances, types) et diagnostique la présence et validité des Skills IA. |
| `rs-ui remove <component>` | Supprime un composant, retire son Skill IA associé et vérifie les dépendances. |
| `rs-ui update [components...]` | Met à jour les composants avec détection de diff par SHA-256 et support 3-Way Merge. |
| `rs-ui upgrade [components...]` | Met à niveau les composants vers la dernière version du registre avec fusion différentielle (3-Way Merge) et réécriture d'alias (`--alias`). |
| `rs-ui widget <list\|info\|add\|remove>` | Explore, inspecte ou installe les widgets modulaires autonomes (`metric`, `progress`, `quick-actions`, `chart`, `activity-feed`, `finance`). |
| `rs-ui template <list\|info\|remove>` | Explore, inspecte ou nettoie les 10 templates métiers autonomes (`chat`, `finance`, `social`, etc.). |
| `rs-ui mcp` | Démarre le serveur MCP IA (JSON-RPC 2.0 stdio) avec 9 outils d'assistance (génération, audit a11y, conversion styling). |

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
- `--sdk <version>` : Version cible du SDK Expo (`54` à `57` ou `latest`).

### Options pour `rs-ui add`
- `-t, --template <name>` : Installe un template autonome complet (`auth`, `dashboard`, `commerce`, `settings`, etc.) dans `src/components/templates/<name>/`.
- `-w, --widget <name>` : Installe un widget modulaire autonome (`metric`, `progress`, `quick-actions`, `chart`, `activity-feed`, `finance`) dans `src/components/widgets/<name>/`.
- `--skills` : Installe automatiquement `skills/rs-ui/<component>/SKILL.md` (activé par défaut).
- `--no-skills` : Ignore la copie des Skills IA.
- `--diff` : Affiche un diff textuel (LCS) avant d'écraser un composant existant.
- `--all` : Installe l'intégralité des 61 composants disponibles.
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
│       └── drawer/
│           └── SKILL.md        # Skill Drawer (props, Reanimated, gesture handler)
```

Chaque `SKILL.md` contient :
- Frontmatter YAML standardisé (`name`, `description`, `version`, `category`, `dependencies`, `supportsGlass`).
- Exemples d'utilisation, Props API typée, pièges fréquents et intégration de thème.
- Diagnostiqué automatiquement via `rs-ui doctor`.

---

## 🔒 Configuration & Lockfile `rashwright-ui.json`

Le fichier de configuration trace l'état complet du starter, des thèmes et des composants :

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

## 🆕 Nouveautés v0.7.3 — Correctif dépendances manquantes (`expo-router`, `react-dom`, `react-native-web`)

- **🐛 Fix : `ConfigError: Cannot resolve entry file` au démarrage** :
  `"main": "expo-router/entry"` était écrit dans `package.json` mais `expo-router` n'était jamais installé (absent de `CORE_EXPO_DEPS`). Metro ne pouvait pas résoudre le point d'entrée et refusait de démarrer. `expo-router` est désormais la première entrée de `CORE_EXPO_DEPS`.
- **🐛 Fix : `react-dom` et `react-native-web` manquants pour le web** :
  Le `app.json` généré par Expo inclut `"web"` dans sa configuration, ce qui active le mode web. Sans `react-dom` et `react-native-web`, Expo affichait *"It looks like you're trying to use web support but don't have the required dependencies installed"*. Ces deux packages sont désormais dans `CORE_EXPO_DEPS` et installés via `expo install` pour garantir des versions compatibles SDK.

Pour réparer un projet existant généré par une version antérieure :
```bash
bunx expo install expo-router react-dom react-native-web
```

## 🆕 Nouveautés v0.7.2 — Correctif `rs-ui init .` (régression 0.7.1)

- **🐛 Fix : `bun install` échoue avec `rs-ui init .`** :
  La v0.7.1 forçait incorrectement `useCurrentDirectory = true` pour l'argument `"."`, ce qui sautait l'étape `create-expo-app .` et laissait le projet sans `package.json`. La commande `bun install` échouait alors avec *"Bun could not find a package.json file to install from"*.
  **Correction** : `projectName = "."` + `useCurrentDirectory = false` → `targetDir = join(cwd, ".") = cwd` → `create-expo-app .` crée bien le `package.json` dans le répertoire courant avant `bun install`.
- **🐛 Fix : `installProjectDependencies` appelé sur un projet existant** :
  L'étape A (`bun install`) est désormais conditionnée à `isFreshProject` : elle est sautée si un projet Expo existe déjà (qui a déjà ses `node_modules`).
- **🐛 Fix : `isFreshProject` hissé dans le scope externe** :
  La variable est maintenant accessible en Phase 10 (installation), quelle que soit la branche de création choisie.

## 🆕 Nouveautés v0.7.1 — Correctifs critiques `rs-ui init`

- **🐛 Fix ordre d'installation (`ConfigError: expo is not installed`)** :
  L'ordre des phases d'installation est désormais garanti : `bun install` (Étape A) installe `expo` dans `node_modules` **avant** que `bunx expo install` (Étape B) ne soit appelé. Cela élimine le `ConfigError: Cannot determine the project's Expo SDK version because the module expo is not installed`.
- **🐛 Fix `TS2307: Cannot find module './App'`** :
  Le fichier `index.ts` résiduel du template Expo `blank-typescript` (qui importait `./App`) est maintenant supprimé lors de la génération en mode Expo Router. Le `package.json` est mis à jour vers `"main": "expo-router/entry"`.
- **🐛 Fix fausse réussite** :
  Le CLI distingue désormais une initialisation **complète** d'une initialisation **partielle**. Si une étape d'installation échoue, le résumé affiche `⚠ Initialisation partielle` avec les commandes exactes pour réparer manuellement — plus de faux `✔ Rashwright UI Mobile est opérationnel !`.
- **🐛 Fix `rs-ui init .`** :
  L'argument `"."` est correctement reconnu comme « installer dans le répertoire courant » en mode interactif et `--yes`, sans créer de sous-dossier `"."` ni redemander inutilement.
- **🧪 Tests de non-régression** :
  4 nouveaux tests CRITICAL/REGRESSION dans `package-manager.test.ts` et `init.test.ts` verrouillent ces comportements.

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
- **🧪 Quality Gate 100% Vert** :
  - 43 suites de tests, **212 tests unitaires Vitest réussis sur 212**, 0 erreur TypeScript strict (`check-types` exit 0).

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
- **🧪 Quality Gate 100% Vert** : 194 tests Vitest passés sur 40 suites, 0 erreur TypeScript strict (`bunx tsc --noEmit` exit 0).

## 🆕 Nouveautés v1.5.0 — 79 Composants, WCAG 2.1 AA, NativeWind v5 Fix & Nouveaux Utilitaires

- **11 nouveaux composants UI de pointe** : `LikeButton` (rebond animé, particules), `PasswordStrength` (évaluation d'entropie locale sécurisée, jauge segmentée), `CopyButton` (presse-papiers multi-plateforme), `FloatingLabelInput` (label flottant Reanimated), `HoldButton` (maintien sécurisé anti-clic accidentel), `SwipeActionButton` (slide to confirm), `TagInput` (mots-clés avec badges et filtres), `NumberInput` (contrôle pas-à-pas numérique), `ReorderableList` (liste réordonnable avec contrôles accessibles), `InlineEdit` (édition sur place), `ExpandableText` (tronquage intelligent).
- **Catalogue porté à 79 composants officiels** dans le registre et skills associés.
- **Accessibilité WCAG 2.1 AA** : Tous les composants interactifs ont maintenant `accessibilityRole`, `accessibilityState` et `accessibilityLabel` — `button`, `chip`, `card`, `checkbox`, `modal`, `icon-button`, `slider` et plus.
- **Fix NativeWind v5 `npm install`** : `--legacy-peer-deps` systématiquement utilisé pour npm (résout les conflits `react-native-css@3.1.0-rc.0` qui bloquaient `--force` indéfiniment).
- **Architecture.md formalisée** : 3 modes d'initialisation documentés (Fresh Expo Router, Existing Expo Router, Expo Classic), flux CLI en diagrammes Mermaid, dépendances inter-packages.
- **Phase 7 — Specs Écrans Expo critiques** : 10 écrans documentés (SplashScreen, PermissionGate, Push Notifications, Deep Linking, BiometricAuth, AppState, FileDownloader, QRScanner, MapView, DocumentPicker).
- **227 tests Vitest** réussis — 47 suites, Quality Gate 100% vert.

## 🆕 Nouveautés v1.4.0 — Commande `rs-ui fix`, Showcase & Code Preview

- **Commande `rs-ui fix` (Auto-Remédiation)** : Réparation automatique en un clic de la configuration et de l'environnement (plugin Reanimated Babel, dépendances natives Expo, déclaration CSS NativeWind, synchronisation des fiches IA Skills).
- **Showcase Storybook Mobile (`rs-ui showcase`)** : Environnement de test et prévisualisation mobile/web avec options `--web`, `--port`, `--theme`, `--inject`.
- **Aperçu Code TSX (`rs-ui info --preview`)** : Affichage d'un exemple canonique prêt à copier directement dans la console.
- **Suite de tests E2E Maestro** : 6 flows déclaratifs automatisés (`bun run test:e2e`).
- **Nouveaux composants clés** : Support et synchronisation de 68 composants et 10 templates autonomes.

## 🆕 Nouveautés v1.0.0 — Release Majeure & Serveur MCP IA

- **Serveur Model Context Protocol (MCP) IA (`rs-ui mcp`)** : Serveur stdio JSON-RPC 2.0 pour assistants IA (Cursor, Claude Desktop, VS Code) avec commandes d'inspection temps réel.
- **Moteur Responsive & Grille Multi-Colonnes** : Détecteur de breakpoints standard (`sm`, `md`, `lg`, `xl`, `2xl`) dans `lib/responsive.ts` et `useResponsive()`.
- **Recherche Floue Haute Vitesse (`rs-ui search <query>`)** : Recherche instantanée dans le registre avec suggestions.
- **Comparateur Visuel (`rs-ui diff [component]`)** : Diff side-by-side couleur avec le registre officiel.
- **Dual Engine Styling** : Prise en charge native NativeWind v4/v5 et StyleSheet standardisé.

## 🆕 Nouveautés v0.9.0 — Intégration NativeWind & Indépendance Native

- **Support NativeWind v4 & v5 dans `rs-ui init`** :
  - Prompt interactif `confirm` (activé par défaut) pour configurer NativeWind lors de l'init.
  - Choix explicite de version : **v4 Stable** (Tailwind v3.4, `tailwind.config.js`) ou **v5 Next-Gen** (Tailwind v4 CSS-first, sans config JS).
  - Flags CLI : `--nativewind [v4|v5]` pour activer, `--no-nativewind` pour désactiver.
  - Génération automatique : `global.css`, `tailwind.config.js` (v4), `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts`.
  - Persistance dans `rashwright-ui.json` : `nativewind.enabled`, `nativewind.version`, `nativewind.css`.
- **Indépendance native absolue** : Tous les 61 composants restent 100% fonctionnels sans NativeWind (`StyleSheet.create` + `useTheme()` par défaut). NativeWind est toujours opt-in.
- **Primitives Headless Mobiles** (v0.8.0 inclus) : `useControllableState`, `useDisclosure`, `buildAccessibilityProps` — zéro dépendance externe.
- **Registre RFC v4** : Hooks (`use-device`, `use-back-handler`, etc.) et libs (`primitives`, `upload`) installables via `rs-ui add`.
- **Quality Gate** : 35 suites de tests, **171 tests Vitest**, 0 erreur TypeScript strict.

---

## 🆕 Nouveautés v0.7.0 — Templates Engine & Architecture /src
 
- **Starter Templates Engine (`--template`)** : Choix parmi 7 templates starters complets (`showcase`, `minimal`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`) utilisant exclusivement les composants Rashwright UI Mobile et l'architecture standardisée.
- **Single Installation Flow & Clean SDK Resolution** :
  - `rs-ui` prend le contrôle complet du bootstrap : sélection explicite du SDK Expo (54, 55, 56, 57).
  - Utilisation du squelette minimal `blank-typescript@<SDK>` avec `--no-install` et `--no-agents-md`.
  - Élimination totale de la double installation : une seule phase d'installation finale pour toutes les dépendances Expo et NPM.
  - Normalisation multiplateforme robuste des chemins sous Windows/macOS/Linux.
- **CLI Hooks Subsystem** : Exécution de hooks shell personnalisés (`post-add`, `post-update`, etc.) configurables dans `rashwright-ui.json` (`hooks`).
- **Multi-Registres Scoped** : Commande `rs-ui registry` (`add`, `list`, `remove`) et support des composants sous scope (ex: `@equipe/badge`).
- **TypeScript 5.x/6.x Modernisation** : Suppression définitive de `baseUrl` et `ignoreDeprecations` obsolètes.
- **Branding CLI unifié** : Banner ASCII art Rashwright (`printBanner`) partagé et testé.
 
 ---

## 🆕 Nouveautés v0.3.0

- **Système de Skills IA** : Distribution de 61 skills composants, 4 skills modules core et 1 skill global avec gestion `--skills` / `--no-skills`.
- **Commande `rs-ui reset` & alias `rs-ui-reset`** : Archivage sécurisé dans `rs-ui-example/` ou suppression définitive `--delete`, génération d'un écran d'accueil minimal avec `useTheme()`.
- **Thèmes élargis** : Ajout de 3 nouveaux presets (`green`, `red`, `cyan`) portant le total à 9 presets.
- **Moteur de Thème Personnalisé (Custom Engine)** : Assistant interactif à 2 étapes (couleurs obligatoires puis facultatives) et options CLI directes (`--primary`, `--secondary`, etc.).
- **Diagnostic enrichi (`rs-ui doctor`)** : Audit complet de la présence et de la cohérence des Skills IA.
- **Résolution TypeScript TS5101** : Fix du flag `ignoreDeprecations: "5.0"` supporté en TypeScript 5.x.

---

## 🆘 Support & Liens

- **Bugs et suggestions** : [GitHub Issues](https://github.com/AbdoulRachid-Mz/rashwright-ui/issues)
- **Documentation contributeur** : [CONTRIBUTOR.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md)
- **Guide de démarrage rapide** : [Quick-Start.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/Quick-Start.md)

---

**Licence MIT · Rashwright office.**
