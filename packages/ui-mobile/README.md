<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile" width="180" />
</p>

# @rashwright/ui-mobile — v0.2.0

[![npm version](https://img.shields.io/badge/npm-%400.2.0-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/ui-mobile)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54%20→%2059-000000?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict%20%7C%20zero%20any-3178c6?logo=typescript)](#)

> **⚠️ Pour les développeurs UTILISATEURS de Rashwright UI : vous n'avez JAMAIS besoin d'installer ce package directement.**
>
> Installez et utilisez **`@rashwright/cli`** → c'est votre point d'entrée unique `rs-ui`.
>
> ```bash
> bun add -g @rashwright/cli        # ou npm install -g @rashwright/cli
> rs-ui init --yes                  # initialiser dans un projet Expo
> rs-ui add button card accordion   # ajouter des composants
> ```

Ce package `@rashwright/ui-mobile` est le **fournisseur de code source** de l'écosystème Rashwright. Il est consommé par `@rashwright/cli` (localement ou via CDN unpkg) pour fournir :
- le **registry JSON central** (61 composants, matrices Expo SDK 54 à 59)
- le **code source TypeScript** de chaque composant (copié directement par le CLI dans votre projet)
- le **moteur Liquid Glass** (8 primitives sous `components/ui/liquid/`)
- le **moteur d'upload** Rashwright (`lib/upload/`) avec 5 providers inlinés (Cloudinary, Firebase Storage, Vercel Blob, Local, Mock)
- les **tokens de thème** et les 6 presets (default, emerald, violet, amber, rose, slate)
- les **contexts** (`ThemeProvider`, `TabBarProvider`) et le store Zustand (`theme-store`)

---

## 🏗 Philosophie de distribution

Rashwright adopte le modèle shadcn/ui appliqué à React Native :
```
rs-ui add button
      │
      ├─ Recherche la définition "button.json" dans le registry
      ├─ Copie components/ui/button.tsx et ses dépendances transitives
      ├─ Détecte la version d'Expo SDK du projet (SDK 54 → 59)
      ├─ Installe les modules natifs requis (reanimated, blur, linear-gradient...)
      └─ Le code source appartient désormais à votre projet (components/ui/button.tsx).
```

---

## 📦 Contenu distribué dans ce package

```
@rashwright/ui-mobile@0.2.0/
├── index.ts                     → Barrel principal (thème, contextes, stores, hooks, UI)
├── components/
│   └── ui/                      → 69 fichiers sources
│       ├── liquid/              → 8 primitives Liquid Glass (surface, pressable, highlight, border...)
│       ├── accordion.tsx        → 🆕 Sections dépliables Reanimated
│       ├── collapsible.tsx      → 🆕 Section repliable individuelle
│       ├── data-table.tsx       → 🆕 Tableau FlatList avec tri et filtrage
│       ├── form.tsx             → 🆕 Primitives de formulaire (Form, Field, Label, Message...)
│       ├── otp-input.tsx        → 🆕 Champ OTP à focus automatique
│       ├── rating.tsx           → 🆕 Étoiles interactives et demi-étoiles
│       ├── upload-image.tsx · upload-video.tsx
│       ├── button.tsx · card.tsx · modal.tsx · ... (61 composants au total)
│       └── index.ts             → ThemedView, ThemedText et barrel des 61 composants
│
├── constants/                   → theme.ts + glass-theme.ts
├── contexts/                    → ThemeProvider + TabBarProvider
├── hooks/                       → use-device · useBackHandler · useScrollAwareTabBar
├── stores/                      → theme-store (Zustand v5)
├── theme/
│   ├── index.ts                 → createTheme + createGlassTheme helpers
│   ├── tokens/                  → colors · spacing · radius · typography · glass · shadows
│   └── themes/                  → 7 presets : default · emerald · violet · amber · rose · slate · glass
│
├── types/
│   ├── ambient.d.ts             → ZÉRO any (déclarations ambiantes peerDeps pour le développement)
│   └── index.ts
│
├── registry/                    → Registry JSON synchronisé 1:1 avec les sources
│   ├── index.json               → 61 composants, 10 catégories, SDK 54 à 59
│   ├── components/  (61 JSON)   → Définition complète de chaque composant
│   └── versions/  (6 JSON)      → Matrices de compatibilité Expo SDK 54, 55, 56, 57, 58, 59
│
├── lib/upload/                  → Moteur d'upload inliné avec 5 providers
└── assets/                      → primary.png · svg/primary.svg
```

---

## 🆕 Nouveautés de la version v0.2.0

- 🧩 **6 Nouveaux composants** :
  - `accordion` : Sections accordéon avec animation fluide Reanimated et support Glass.
  - `collapsible` : Section repliable individuelle avec en-tête pressable.
  - `data-table` : Tableau basé sur FlatList avec colonnes triables, filtre de recherche et striped rows.
  - `form` : Primitives formulaires prêtes à l'emploi compatibles React Hook Form ou en mode autonome.
  - `otp-input` : Saisie sécurisée de code OTP avec auto-focus, gestion du backspace et retour haptique.
  - `rating` : Composant de notation avec demi-étoiles, retour haptique et échelle animée.
- 📱 **Support d'Expo SDK 59** : Ajout de la matrice de compatibilité native `expo-59.json`.
- 🌐 **Compatibilité Remote Registry** : Structure du package optimisée pour la distribution via CDN unpkg.
- 📦 **Exhaustivité des peerDependenciesMeta** : Déclaration de toutes les dépendances natives secondaires comme optionnelles (`optional: true`).

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
- [Rapport d'analyse v0.2.0](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/ANALYSIS.md)

---

**Licence MIT · Rashwright office.**
