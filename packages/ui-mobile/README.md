<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile" width="180" />
</p>

# @rashwright/ui-mobile — v0.3.0

[![npm version](https://img.shields.io/badge/npm-%400.3.0-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/ui-mobile)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54%20→%2059-000000?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict%20%7C%20zero%20any-3178c6?logo=typescript)](#)

> **⚠️ Pour les développeurs UTILISATEURS de Rashwright UI : vous n'avez JAMAIS besoin d'installer ce package directement.**
>
> Installez et utilisez **`@rashwright/cli`** → c'est votre point d'entrée unique `rs-ui`.
>
> ```bash
> bun add -g @rashwright/cli        # ou npm install -g @rashwright/cli
> rs-ui init --yes                  # initialiser dans un projet Expo
> rs-ui add button card accordion   # ajouter des composants et skills IA
> ```

Ce package `@rashwright/ui-mobile` est le **fournisseur de code source** et de **Skills IA** de l'écosystème Rashwright. Il est consommé par `@rashwright/cli` (localement ou via CDN unpkg) pour fournir :
- le **registry JSON central** (61 composants, matrices Expo SDK 54 à 59)
- le **code source TypeScript** de chaque composant (copié directement par le CLI dans votre projet)
- le **catalogue exhaustif de Skills IA** (61 skills composants, 4 modules core, 1 skill global dans `skills/`)
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

## 🆕 Nouveautés de la version v0.3.0

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
