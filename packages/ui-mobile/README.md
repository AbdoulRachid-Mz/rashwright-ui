<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile" width="180" />
</p>

# @rashwright/ui-mobile — v1.5.0

[![npm version](https://img.shields.io/badge/npm-%401.5.0-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/ui-mobile)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54%20→%2058-000000?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict%20%7C%20zero%20any-3178c6?logo=typescript)](#)
[![NativeWind](https://img.shields.io/badge/NativeWind-v4%20%7C%20v5-06b6d4?logo=tailwindcss)](#)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](#)

> **⚠️ Pour les développeurs UTILISATEURS de Rashwright UI : vous n'avez JAMAIS besoin d'installer ce package directement.**
>
> Installez et utilisez **`@rashwright/cli`** → c'est votre point d'entrée unique `rs-ui`.
>
> ```bash
> bun add -g @rashwright/cli        # ou npm install -g @rashwright/cli
> rs-ui init --yes                  # initialiser dans un projet Expo
> rs-ui add button card accordion   # ajouter des composants et skills IA
> ```

> ⚠️ Si vous rencontrez une erreur après `npx expo start`, le problème provient généralement d'une incompatibilité entre les dépendances Babel, `lru-cache` et `yallist`, ou d'une installation incohérente des packages (un contexte fréquent avec NativeWind v5). Les erreurs typiques dans les logs sont :
> 
> - `TypeError: Yallist is not a constructor` (problème de version dans l'arbre des dépendances Babel)
> - `TypeError: Cannot read properties of undefined (reading 'transformFile')` (conséquence de l'échec initial du transformer Babel)
> 
> Pour résoudre ce problème, suivez ces étapes :
> 
> **Étape 1 — Vérifiez la cohérence des versions installées**
> Dans PowerShell, à la racine du projet :
> ```powershell
> bun pm ls | findstr "lru-cache yallist"
> bun pm ls | findstr "nativewind react-native-css expo"
> ```
> (NativeWind v5 RC0 requiert notamment `nativewind@5.0.0-rc.0` et `react-native-css@3.1.0-rc.0`)
> 
> **Étape 2 — Réinstallez proprement les dépendances**
> Exécutez ces commandes pour réinitialiser votre installation :
> ```powershell
> Remove-Item -Recurse -Force node_modules
> bun install --force
> bunx expo start --clear
> ```
> Si l'erreur persiste, examinez les versions résolues pour corriger le verrouillage des dépendances.


Ce package `@rashwright/ui-mobile` est le **fournisseur de code source** et de **Skills IA** de l'écosystème Rashwright. Il est consommé par `@rashwright/cli` (localement ou via CDN unpkg) pour fournir :
- le **registry JSON central** (68 composants, matrices Expo SDK 54 à 58)
- le **code source TypeScript** de chaque composant (copié directement par le CLI dans votre projet)
- le **catalogue exhaustif de Skills IA** (68 skills composants, 4 modules core, 1 skill global dans `skills/`)
- les **10 Templates Autonomes Complets** distribuables sous `templates/<id>/` (`auth`, `commerce`, `dashboard`, `minimal`, `onboarding`, `settings`, `showcase`, `chat`, `finance`, `social`)
- le **moteur Liquid Glass** (8 primitives sous `components/ui/liquid/`)
- le **moteur d'upload** Rashwright (`lib/upload/`) avec 5 providers inlinés
- les **tokens de thème** et les **9 presets** (`default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`) + moteur custom
- les **contexts** (`ThemeProvider`, `TabBarProvider`) et le store Zustand (`theme-store`)

---

## 🏗 Philosophie de distribution

Rashwright adopte le modèle shadcn/ui appliqué à React Native :
```text
rs-ui add button
      │
      ├─ Recherche la définition "button.json" dans le registry
      ├─ Copie components/ui/button.tsx et ses dépendances transitives
      ├─ Copie automatiquement son skill IA associé (skills/rs-ui/button/SKILL.md)
      ├─ Détecte la version d'Expo SDK du projet (SDK 54 → 59)
      ├─ Installe les modules natifs requis (reanimated, blur, linear-gradient...)
      └─ Le code source et le contexte IA appartiennent désormais à votre projet.
```

---

## 📦 Contenu distribué dans ce package

```text
@rashwright/ui-mobile@0.3.0/
├── index.ts                     → Barrel principal (thème, contextes, stores, hooks, UI)
├── components/
│   └── ui/                      → 69 fichiers sources
│       ├── liquid/              → 8 primitives Liquid Glass (surface, pressable, highlight, border...)
│       ├── button.tsx · card.tsx · modal.tsx · ... (61 composants au total)
│       └── index.ts             → ThemedView, ThemedText et barrel des 61 composants
│
├── skills/                      → 🆕 Système complet de Skills IA pour agents de code
│   ├── rs-ui/SKILL.md           → Skill Global (architecture, tokens, Glass UI)
│   ├── liquid/SKILL.md          → Skill Core Liquid Glass
│   ├── upload/SKILL.md          → Skill Core Upload & Media
│   ├── theme/SKILL.md           → Skill Core Theme & Presets
│   ├── cli/SKILL.md             → Skill Core CLI rs-ui & reset
│   └── <composant>/SKILL.md     → 61 Skills de composants avec frontmatter YAML
│
├── constants/                   → theme.ts + glass-theme.ts
├── contexts/                    → ThemeProvider + TabBarProvider
├── hooks/                       → use-device · useBackHandler · useScrollAwareTabBar
├── stores/                      → theme-store (Zustand v5)
├── theme/
│   ├── index.ts                 → createTheme + createGlassTheme helpers
│   ├── tokens/                  → colors · spacing · radius · typography · glass · shadows
│   └── themes/                  → 10 presets : default · emerald · violet · amber · rose · slate · green · red · cyan · glass
│
├── types/
│   ├── ambient.d.ts             → ZÉRO any (déclarations ambiantes peerDeps pour le développement)
│   └── index.ts
│
├── registry/                    → Registry JSON synchronisé 1:1 avec les sources
│   ├── index.json               → 61 composants, 10 catégories, SDK 54 à 59, 10 thèmes
│   ├── components/  (61 JSON)   → Définition complète de chaque composant
│   └── versions/  (6 JSON)      → Matrices de compatibilité Expo SDK 54, 55, 56, 57, 58, 59
│
├── lib/upload/                  → Moteur d'upload inliné avec 5 providers
└── assets/                      → primary.png · svg/primary.svg
```

---

## 🆕 Nouveautés v1.5.0 — 79 Composants, WCAG 2.1 AA & Nouveaux Utilitaires

- **11 nouveaux composants UI mobiles** : `LikeButton`, `PasswordStrength`, `CopyButton`, `FloatingLabelInput`, `HoldButton`, `SwipeActionButton`, `TagInput`, `NumberInput`, `ReorderableList`, `InlineEdit`, `ExpandableText`.
- **Catalogue totalisant 79 composants officiels** avec fiches IA Skills synchronisées.
- **Accessibilité WCAG 2.1 AA** : `accessibilityRole`, `accessibilityState`, `accessibilityLabel` sur tous les composants interactifs.
- **Style priority** : La prop `style` passée par l'utilisateur prime toujours sur les styles internes (`style={[styles.base, internalStyle, style]}`).
- **Fix NativeWind v5** : `npm install --legacy-peer-deps` — plus d'installation bloquée sur `--force`.
- **Architecture formalisée** : `architecture.md` documente les 3 modes d'init, les flux CLI, les dépendances inter-packages.
- **Phase 7 specs** : `PHASE7-EXPO-SCREENS.md` — 10 écrans Expo critiques avec dépendances et plan d'implémentation.
- **Tests** : 227/227 Vitest (47 suites 100% vertes).

## 🆕 Nouveautés v0.9.0

- **NativeWind opt-in dans `rs-ui init`** : Choix de NativeWind v4 (Tailwind v3.4 classique, `tailwind.config.js`) ou v5 (Tailwind v4 CSS-first) directement pendant l'initialisation — activé par défaut, désactivable via `--no-nativewind`.
- **Primitives Headless zéro-dépendance** : `useControllableState`, `useDisclosure`, `buildAccessibilityProps` — appliquées sur `accordion` et `collapsible`.
- **Registre RFC v4 complet** : 5 hooks + 2 libs installables via `rs-ui add hook:<name>` / `rs-ui add lib:<name>`.
- **Indépendance native garantie** : 61 composants 100% fonctionnels sans NativeWind (`StyleSheet.create` + `useTheme()`).
- **Schéma RFC v4 pur TypeScript** (`packages/cli/src/core/schema.ts`) — validation sans Zod.
- **Tests** : 35 suites, **171 tests Vitest**, zéro `any`, 0 erreur TypeScript strict.

---

## 🆕 Nouveautés v0.7.1

- **🐛 Fix CLI `rs-ui init` — ordre d'installation** :
  Le CLI installe maintenant `expo` (via `bun install`) **avant** de lancer `expo install` pour les modules natifs. Élimine le `ConfigError: Cannot determine the project's Expo SDK version`.
- **🐛 Fix `TS2307: Cannot find module './App'`** :
  L'`index.ts` résiduel du template Expo est supprimé en mode Expo Router ; `package.json` passe à `"main": "expo-router/entry"`.
- **🐛 Fix fausse réussite du CLI** :
  En cas d'échec d'installation, le CLI affiche une initialisation partielle avec commandes de réparation manuelles au lieu du faux message de succès.
- **🐛 Fix `rs-ui init .`** : L'argument `"."` est correctement interprété comme « répertoire courant ».

## 🆕 Nouveautés v0.7.0

- **7 Templates Autonomes Complets** : `auth`, `commerce`, `dashboard`, `minimal`, `onboarding`, `settings`, `showcase` — chacun sous `templates/<id>/` avec `template.json`, `types.ts`, composants internes et `index.ts`.
- **6 nouveaux composants** : `accordion`, `collapsible`, `otp-input`, `rating`, `data-table`, `form`.
- **Architecture /src standardisée** : Reset automatique du template Expo, génération Expo Router (`src/app/_layout.tsx` + `src/app/index.tsx`).

## 🆕 Nouveautés v1.2.0 — Templates Métiers Spécialisés & Écosystème v1.2.0

- 💬 **Nouveau Template `chat`** : Messagerie instantanée mobile avec bulles Liquid Glass adaptatives, liste de messages et barre de saisie tactile.
- 💳 **Nouveau Template `finance`** : Portefeuille financier, carte de solde avec bascule de visibilité/confidentialité et historique des opérations catégorisé.
- 📱 **Nouveau Template `social`** : Réseau social avec carrousel de stories horizontales animées et fil d'actualités avec likes interactifs.
- 📦 **10 Templates Métiers Autonomes** désormais disponibles et prêts pour l'initialisation ou l'ajout direct via `rs-ui add -t <id>`.
- ⚡ **Support NativeWind v5 et Bun Install `--force`** assurant une résolution fluide des modules natifs.

## 🆕 Nouveautés v1.1.0 — 65 Composants UI & Composants Mobiles Clés

- 📅 **Nouveau composant `Calendar`** (`components/ui/calendar.tsx`) : navigation mensuelle fluide, sélection unique/multiple/plage (`range`), localisation FR native (`Intl`), variant glass.
- 🕒 **Nouveau composant `DatePicker`** (`components/ui/date-picker.tsx`) : modal bottom-sheet avec trigger personnalisé, validation par confirmation, synchronisation draft/value.
- 👆 **Nouveau composant `SwipeableRow`** (`components/ui/swipeable-row.tsx`) : geste tactile de balayage fluide via PanResponder natif (zéro dépendance lourde), actions personnalisées, haptique.
- 💬 **Nouveau composant `Popover`** (`components/ui/popover.tsx`) : panneau flottant contextuel ancré avec 8 placements, calcul automatique des coordonnées d'écran (`measure`), flèche indicatrice.
- 💊 **Nouveaux composants `SegmentedControl`, `Skeleton`, `Shimmer`, `ScreenSkeleton`**.
- 🏆 **Registre étendu à 65 composants** et 212 tests Vitest réussis (100% vert).

## 🆕 Nouveautés v1.0.1

- 💎 **Templates Autonomes Enrichis & Premium** :
  - **`auth`** : 2 écrans séparés (`sign-in.tsx`, `sign-up.tsx`) + composant `GoogleAuthButton` vectoriel haptique Glass.
  - **`commerce`** : catalogue complet `products-screen.tsx` (recherche, filtres, compteur) et écran détail complet `product-detail-screen.tsx` (`productId`) avec sélection de variantes, notation et bouton panier sticky.
  - **`onboarding`** : flow fluide avec redirection automatique vers un écran d'accueil dédié `onboarding-home-screen.tsx` (`HomeScreen`).
  - **`dashboard`** : sélecteur de périodes interactif (7j, 30j, 90j, 1 an), barre d'actions rapides et métriques interactives.
  - **`settings`** : sélecteur d'apparence à 3 modes (Système 🖥️, Clair ☀️, Sombre 🌙) synchronisé avec `ThemeContext` et toggles interactifs.
- 🚀 **Prise en charge Expo SDK 58 Stable** : Matrice de compatibilité certifiée SDK 54 à 58.
- 🧱 **Composant `ThemedView` Auto-Suffisant** : Sous-composant `InlineGridCarousel` intégré directement dans `view.tsx` sans dépendre statiquement de `carousel.tsx`.
- 📦 **Fondations consolidées** : Ingestion automatique de `use-responsive.ts` et `lib/responsive.ts` lors de `setupFoundations`.

## 🆕 Nouveautés v1.0.0

- 🤖 **Serveur Model Context Protocol (MCP) IA** : Serveur JSON-RPC 2.0 stdio complet (`rs-ui mcp`) pour Cursor, Claude Desktop et VS Code.
- 📐 **Moteur Responsive & Grille Multi-Colonnes** : Breakpoints standard (`sm`, `md`, `lg`, `xl`, `2xl`) dans `lib/responsive.ts` et `useResponsive()`.
- 🔍 **Recherche Floue Haute Vitesse** : Commande `rs-ui search <query>` dans le terminal.
- 🎨 **Comparateur Visuel en Ligne de Commande** : Commande `rs-ui diff [component]`.
- 🌪️ **Double Moteur de Style (Dual Engine)** : StyleSheet natif + NativeWind v4/v5 avec injection `global.css`.

## 🆕 Nouveautés v0.3.0

- 🤖 **Système de Skills IA pour composants & modules** :
  - 61 fichiers `SKILL.md` dédiés pour chaque composant du catalogue.
  - 4 skills modules core (`liquid`, `upload`, `theme`, `cli`) et 1 skill global `skills/rs-ui/SKILL.md`.
  - Format standardisé combinant frontmatter YAML et documentation d'intégration.
- 🎨 **Moteur de Thèmes Élargi & Custom Engine** :
  - 3 nouveaux presets : `green` (Forest Green), `red` (Crimson Red), `cyan` (Cyber Cyan).
  - Générateur de thème personnalisé (`theme/themes/custom.ts`) avec assistant interactif 2 étapes.
- 🔄 **Commande `rs-ui reset` / `rs-ui-reset`** :
  - Archivage non destructif par défaut vers `rs-ui-example/` ou suppression définitive `--delete`.
  - Génération d'un écran d'accueil minimal avec `useTheme()`.
- 🩺 **Diagnostic enrichi `rs-ui doctor`** :
  - Vérification de la présence et synchronisation des Skills IA.
- 🛠️ **Correctifs & TypeScript** :
  - Résolution de `ignoreDeprecations: "5.0"` pour TypeScript 5.x.
  - Remplacement de `SafeAreaView` déprécié par `react-native-safe-area-context`.
  - Correction du chemin de logo vers `@/assets/primary.png`.
---

## 🚀 Nouveautés v1.4.0

- 🧩 **3 Nouveaux Composants Mobiles Clés** :
  - `Command` (`components/ui/command.tsx`) : Palette de recherche rapide et d'actions mobiles (cmd+k style), filtres, raccourcis tactiles, état vide et modale dialog Liquid Glass.
  - `ColorPicker` (`components/ui/color-picker.tsx`) : Nuancier tactile 12 presets, aperçu dynamique, champ hexadécimal et retour haptique.
  - `NavigationMenu` (`components/ui/navigation-menu.tsx`) : Menu accordéon hiérarchique avec chevrons rotatifs, capsules actives et badges.
- 📦 **Catalogue étendu à 68 composants** et 10 templates métiers autonomes (`chat`, `finance`, `social`...).
- 🛡️ **Typage 100% strict** : Zéro `any`, intégration parfaite de `createGlassTheme(theme, isDark)`.

---

## 📊 Matrice des dépendances (peerDependencies)

| Dépendance | Version minimale | Statut |
|---|---|---|
| `expo` | `>= 54.0.0` | Obligatoire |
| `react` | `>= 18.3.0` | Obligatoire |
| `react-native` | `>= 0.73.0` | Obligatoire |
| `react-native-reanimated` | `>= 3.0.0` | Optionnel (requis pour Liquid & animations) |
| `react-native-safe-area-context` | `>= 4.0.0` | Optionnel |
| `react-native-gesture-handler` | `>= 2.16.0` | Optionnel (requis pour Drawer, BottomSheet) |
| `expo-blur` | `>= 13.0.0` | Optionnel (requis pour Liquid Glass) |
| `expo-linear-gradient` | `>= 13.0.0` | Optionnel (requis pour Liquid Glass) |
| `expo-haptics` | `>= 13.0.0` | Optionnel |
| `expo-image` | `>= 1.12.0` | Optionnel |
| `expo-video` | `>= 1.0.0` | Optionnel |
| `expo-image-picker` | `>= 15.0.0` | Optionnel |
| `@expo/vector-icons` | `>= 14.0.0` | Optionnel |
| `zustand` | `>= 5.0.0` | Optionnel |

---

## 🔗 Liens utiles

- [Dépôt GitHub officiel](https://github.com/AbdoulRachid-Mz/rashwright-ui)
- [Documentation globale et guide utilisateur](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/README.md)
- [Guide des contributeurs](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md)
- [Rapport d'analyse v0.3.0](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/ANALYSIS.md)

---

**Licence MIT · Rashwright office.**
