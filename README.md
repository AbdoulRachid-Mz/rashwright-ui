# Rashwright UI Mobile (`rs-ui`)

> Système moderne de composants distribuables pour **React Native** & **Expo** avec moteur **Liquid Glass UI**, inspiré de la philosophie de distribution de code à la *shadcn/ui*.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](#)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-54%20--%2058%20(beta)-000000.svg?logo=expo)](#)
[![Package Manager](https://img.shields.io/badge/Bun-1.2+-fbf0df.svg?logo=bun)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178c6.svg?logo=typescript)](#)

---

## 📑 Sommaire

1. [Philosophie](#-philosophie)
2. [Prérequis système](#-prérequis-système)
3. [Guide 1 : Développeur Utilisateur (Intégrer dans une application)](#-guide-1--développeur-utilisateur-intégrer-dans-une-application)
   - [Installation du CLI `rs-ui`](#installation-du-cli-rs-ui)
   - [Initialiser un projet (`rs-ui init`)](#initialiser-un-projet-rs-ui-init)
   - [Ajouter des composants (`rs-ui add`)](#ajouter-des-composants-rs-ui-add)
   - [Les 6 thèmes prédéfinis](#les-6-thèmes-prédéfinis)
   - [Composants d'upload et providers](#composants-dupload-et-providers)
   - [Vérification et diagnostic (`rs-ui doctor`)](#vérification-et-diagnostic-rs-ui-doctor)
4. [Guide 2 : Développeur Contributeur (Travailler sur le dépôt `rashwright-ui`)](#-guide-2--développeur-contributeur-travailler-sur-le-dépôt-rashwright-ui)
   - [Cloner et installer](#cloner-et-installer)
   - [Scripts disponibles](#scripts-disponibles)
   - [Vérification TypeScript](#vérification-typescript)
   - [Ajouter un nouveau composant au Registry](#ajouter-un-nouveau-composant-au-registry)
5. [Architecture du système](#-architecture-du-système)
6. [Matrice de compatibilité Expo SDK](#-matrice-de-compatibilité-expo-sdk)
7. [Dépannage & FAQ](#-dépannage--faq)

---

## 🚀 Philosophie

Rashwright UI Mobile n'est **pas une dépendance npm opaque (`node_modules`)** qui enferme votre code. C'est un **système de distribution directe** :

- **Propriété totale du code** : Chaque composant installé (`rs-ui add`) est copié directement dans votre projet (`components/ui/`). Vous pouvez l'éditer, l'adapter et le personnaliser librement sans contrainte de framework.
- **Résolution automatique des dépendances Expo** : Le CLI détecte votre version d'Expo SDK (de SDK 54 à SDK 58) et installe les versions natives exactes et vérifiées (`react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, etc.).
- **Moteur Liquid Glass** : Effets de flou dynamique, reflets lumineux physiques, bordures néon et rebonds tactiles haptiques.
- **6 thèmes inclus & extensibles** : `default` (bleu), `emerald` (émeraude), `violet`, `amber`, `rose`, `slate`.
- **Zéro blocage AsyncStorage** : Détection dynamique de `@react-native-async-storage/async-storage` avec fallback en mémoire sécurisé.

---

## 💻 Prérequis système

Pour faire tourner le CLI et exécuter les projets Expo sur une nouvelle machine :

| Outil | Version minimale | Rôle |
|---|---|---|
| **Bun** (Recommandé) | `>= 1.2.0` | Package manager rapide & runtime |
| **Node.js** | `>= 18.0.0` | Runtime JavaScript alternatif |
| **Git** | Récent | Gestion de version |
| **Watchman** *(macOS / Linux)* | Récent | Surveillance des fichiers pour Metro Bundler |
| **Xcode & CocoaPods** *(macOS)* | Requis pour iOS | Build natif et simulateur iOS |
| **Android Studio & JDK 17** | Requis pour Android | SDK Android, émulateur ou device physique |

---

## 📱 Guide 1 : Développeur Utilisateur (Intégrer dans une application)

### Installation du CLI `rs-ui`

#### Option A : Installation globale avec Bun (recommandé)
```bash
bun add -g @rashwright/cli
```

#### Option B : Installation globale avec npm
```bash
npm install -g @rashwright/cli
```

#### Option C : Exécution directe sans installation globale (via npx / bunx)
```bash
bunx @rashwright/cli <commande>
# ou
npx @rashwright/cli <commande>
```

---

### Initialiser un projet (`rs-ui init`)

La commande `init` est intelligente :
1. **Si vous êtes déjà dans un projet React Native / Expo** : elle configure le système, crée `rashwright-ui.json`, installe les dépendances requises, configure le `ThemeProvider`, et copie l'écran démo interactif ainsi que les logos officiels Rashwright (`assets/primary.png` et `assets/svg/primary.svg`).
2. **Si vous êtes dans un dossier vide** : elle crée automatiquement un nouveau projet Expo configuré avec le SDK spécifié (ou `@latest` par défaut).

```bash
# Initialisation interactive (demande le thème, l'activation du mode Glass, etc.)
rs-ui init

# Mode automatique avec réponses par défaut
rs-ui init --yes

# Spécifier directement un thème de base et activer le Liquid Glass
rs-ui init --theme emerald --glass

# Spécifier une version particulière du SDK Expo
rs-ui init --sdk 57

# Prévisualiser les actions sans modifier les fichiers
rs-ui init --dry-run
```

---

### Ajouter des composants (`rs-ui add`)

Le CLI résout l'arbre complet des dépendances (composants dépendants + modules natifs Expo) :

```bash
# Ajouter un composant
rs-ui add button

# Ajouter plusieurs composants en une seule commande
rs-ui add card modal text-input bottom-sheet

# Ajouter les composants d'upload d'images et vidéos
rs-ui add upload-image upload-video

# Ajouter l'ensemble des 57 composants
rs-ui add --all
```

Pour explorer la bibliothèque :
```bash
# Lister tous les composants disponibles et voir lesquels sont installés
rs-ui list

# Voir les détails, providers requis et dépendances d'un composant
rs-ui info drawer
rs-ui info upload-image
```

---

### Les 6 thèmes prédéfinis

Rashwright UI propose 6 univers visuels complets en modes clair et sombre :

| Thème | Couleur primaire | Usage recommandé |
|---|---|---|
| `default` | Bleu tech (`#2563eb`) | Applications corporate, SaaS, productivité |
| `emerald` | Vert émeraude (`#059669`) | Immobilier, fintech, écologie, santé |
| `violet` | Violet profond (`#7c3aed`) | Créativité, design, IA, divertissement |
| `amber` | Ambre chaud (`#d97706`) | Alimentation, logistique, alertes |
| `rose` | Rose vif (`#e11d48`) | Lifestyle, beauté, e-commerce |
| `slate` | Ardoise neutre (`#475569`) | Minimalisme, luxe sobre, utilitaires |

#### Utilisation dans votre application :

```tsx
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    // Choix du preset au démarrage : "default" | "emerald" | "violet" | "amber" | "rose" | "slate"
    <ThemeProvider initialMode="system" initialPreset="emerald">
      <MainScreen />
    </ThemeProvider>
  );
}

function MainScreen() {
  const { theme, setThemePreset, setMode, isDark } = useTheme();

  return (
    <Button
      variant="default"
      onPress={() => setThemePreset("violet")}
    >
      Changer pour le thème Violet
    </Button>
  );
}
```

---

### Composants d'upload et providers

Les composants `UploadImage` et `UploadVideo` s'interfacent avec `@rashwright/upload` pour gérer le téléversement local ou distant sur vos buckets cloud :

```tsx
import { UploadImage } from "@/components/ui/upload-image";
import { UploadVideo } from "@/components/ui/upload-video";
import { CloudinaryProvider, FirebaseStorageProvider, VercelBlobProvider } from "@rashwright/upload";
import { useState } from "react";

// Exemple avec Firebase Storage
const firebaseUploader = new FirebaseStorageProvider({
  storageBucket: "votre-app.appspot.com",
  basePath: "uploads/images",
});

export function ProfileForm() {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  return (
    <>
      <UploadImage
        value={images}
        onChange={setImages}
        uploader={firebaseUploader}
        maxImages={5}
        autoUpload={true}
        aspectRatio={[1, 1]}
      />

      <UploadVideo
        value={videos}
        onChange={setVideos}
        uploader={firebaseUploader}
        maxVideos={2}
        maxDurationSeconds={60}
      />
    </>
  );
}
```

---

### Vérification et diagnostic (`rs-ui doctor`)

Lance un diagnostic complet de l'environnement, des dépendances natives installées et de la configuration du projet :

```bash
rs-ui doctor
```

Sortie type :
```text
  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 57
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: components/ui
  ✔ Composants installés: 12
  ✔ react-native-reanimated — v~4.3.1
  ✔ react-native-gesture-handler — v~2.31.2
  ✔ react-native-safe-area-context — v~5.7.0
  ✔ expo-blur — v~56.0.4
  ✔ expo-linear-gradient — v~56.0.0

  Tout est en ordre!
```

---

## 🛠 Guide 2 : Développeur Contributeur (Travailler sur le dépôt `rashwright-ui`)

Ce guide est destiné aux développeurs qui souhaitent cloner le dépôt source, enrichir la bibliothèque de composants ou faire évoluer le CLI `rs-ui`.

### Cloner et installer

```bash
# 1. Cloner le repo
git clone https://github.com/AbdoulRachid-Mz/rashwright-ui.git
cd rashwright-ui

# 2. Installer les dépendances avec Bun
bun install
```

### Scripts disponibles

Le dépôt utilise **Bun Workspaces** avec 2 packages : `@rashwright/cli` (packages/cli) et `@rashwright/ui-mobile` (packages/ui-mobile).

```bash
# --- Workspace racine ---

# Compiler le CLI (génère packages/cli/dist/index.js autonome ESM + shebang)
bun run build:cli

# Développer le CLI en mode watch avec rechargement instantané
bun run dev:cli

# Exécuter directement le CLI depuis les sources TypeScript
bun run cli --help
bun run cli list

# Vérifier la validité des types TypeScript sur tout le projet (mode composite)
bun run check-types

# Synchroniser le registry (met à jour 5 champs dynamiques des JSON)
bun run sync-registry

# Valider le registry (8 contrôles : cohérence, existence, permissions)
bun run validate-registry

# --- Sous-package CLI ---
cd packages/cli
bun run build          # build local
bun run dev            # watch
bun run check-types    # TS strict CLI seul
bun run prepublishOnly # (auto avant npm publish)

# --- Sous-package UI Mobile ---
cd packages/ui-mobile
bun run check-types    # TS strict UI seul (composants + registry + contexts + ...)
```

### Vérification TypeScript

Le projet est configuré en **mode composite** (tsconfig.base.json + references). Chaque package possède son propre tsconfig.json.

```bash
# Vérification globale (racine) : CLI + UI Mobile + scripts
npx tsc --noEmit

# Vérification ciblée CLI
cd packages/cli && npx tsc --noEmit

# Vérification ciblée UI Mobile
cd packages/ui-mobile && npx tsc --noEmit

# Sortie attendue : Exit code 0 (zéro erreur)
```

---

### Ajouter un nouveau composant au Registry

Pour créer un nouveau composant `my-component` (tout se fait dans `packages/ui-mobile/`) :

1. **Créer le fichier source** dans `packages/ui-mobile/components/ui/my-component.tsx` en utilisant `useTheme()` pour les couleurs.
2. **Définir son entrée dans le Registry** : créer `packages/ui-mobile/registry/components/my-component.json` :
   ```json
   {
     "name": "my-component",
     "version": "1.0.0",
     "description": "Description concise du composant",
     "category": "Basic",
     "files": ["components/ui/my-component.tsx"],
     "dependencies": [],
     "expoDependencies": ["@expo/vector-icons"],
     "optionalExpoDependencies": ["expo-haptics"],
     "requiresComponents": ["text"],
     "providers": ["ThemeProvider"],
     "supportsGlass": true,
     "platforms": ["ios", "android"],
     "nativeRebuildRequired": false
   }
   ```
3. **Mettre à jour** `packages/ui-mobile/registry/index.json` pour ajouter le composant dans la catégorie correspondante.
4. **Documenter l'usage** dans `packages/ui-mobile/skills/my-component/SKILL.md`.
5. **Synchroniser + valider le registry** :
   ```bash
   bun run sync-registry
   bun run validate-registry
   ```
6. **Recompiler le CLI et tester** :
   ```bash
   bun run build:cli
   bun run cli info my-component
   ```

---

## 🏗 Architecture du système

```text
rashwright-ui/
├── assets/                 # Logo officiel RS (PNG haute résolution + SVG)
│   ├── primary.png
│   └── svg/primary.svg
├── cli/                    # Code source du CLI rs-ui
│   ├── commands/           # Commandes (init, add, list, info, doctor, remove, update)
│   ├── core/               # Détection Expo, résolveur de graphe, package manager
│   ├── index.ts            # Point d'entrée Commander
│   └── dist/               # Binaire compilé (node executable)
├── components/ui/          # 57 composants React Native distribuables
│   ├── liquid/             # Primitives Liquid Glass (surface, glow, border, highlight)
│   ├── button.tsx
│   ├── card.tsx
│   ├── glass-card.tsx
│   ├── upload-image.tsx    # Upload d'images multi-providers (@rashwright/upload)
│   ├── upload-video.tsx    # Upload de vidéos multi-providers (@rashwright/upload)
│   ├── rashwright-logo.tsx # Composant Logo RS thémé
│   └── showcase-screen.tsx # Écran démo avec sélecteur de thèmes et Glass
├── constants/
│   ├── theme.ts            # Définitions de types Theme & palettes light / dark
│   └── glass-theme.ts      # Moteur d'adaptation Liquid Glass
├── contexts/
│   ├── theme-context.tsx   # ThemeProvider + hook useTheme (mode, preset, glass)
│   └── tab-bar-context.tsx # Contexte de navigation fluide
├── registry/               # Metadata et matrices de dépendances
│   ├── components/         # 57 fichiers JSON individuels
│   ├── versions/           # Matrices de compatibilité Expo 54 à 58
│   └── index.json          # Index global
├── skills/                 # Documentation IA & humaine structurée
│   ├── ui-system/
│   ├── ui-component/
│   ├── glass/
│   ├── cli/
│   └── [composant]/        # Skills individuels par composant (props, accessibilité)
├── stores/
│   └── theme-store.ts      # Store Zustand persistant avec fallback sans AsyncStorage
├── theme/                  # Moteur des 6 thèmes
│   ├── tokens/             # colors, spacing, radius, typography, glass
│   └── themes/             # default, emerald, violet, amber, rose, slate
├── types/
│   ├── ambient.d.ts        # Déclarations ambient isolées pour dev sans erreurs TS
│   └── index.ts            # Types publics réexportés
├── package.json
└── tsconfig.json
```

---

## 📊 Matrice de compatibilité Expo SDK

Le CLI `rs-ui` sait exactement quelle version de chaque module installer en fonction de votre SDK Expo :

| Dépendance | SDK 56 (Stable) | SDK 57 (Stable) | SDK 58 (Beta / Latest) |
|---|---|---|---|
| `react` | `19.2.3` | `19.2.3` | `19.2.3` |
| `react-native` | `0.85.3` | `0.85.3` | `0.85.4` |
| `react-native-reanimated` | `~4.3.1` | `~4.3.1` | `~4.3.2` |
| `react-native-gesture-handler` | `~2.31.2` | `~2.31.2` | `~2.31.2` |
| `react-native-safe-area-context` | `~5.7.0` | `~5.7.0` | `~5.7.0` |
| `expo-blur` | `~56.0.4` | `~56.0.4` | `~56.0.5` |
| `expo-linear-gradient` | `~56.0.0` | `~56.0.0` | `~56.0.0` |
| `expo-image-picker` | `~56.0.25` | `~56.0.25` | `~56.0.26` |
| `expo-image-manipulator` | `~56.0.26` | `~56.0.26` | `~56.0.26` |

---

## ❓ Dépannage & FAQ

### 1. `react-native-reanimated` plante au démarrage de l'app
> **Solution** : Ajoutez le plugin Reanimated dans votre `babel.config.js` (ou `metro.config.js`) tout à la fin :
> ```javascript
> module.exports = function (api) {
>   api.cache(true);
>   return {
>     presets: ['babel-preset-expo'],
>     plugins: ['react-native-reanimated/plugin'],
>   };
> };
> ```
> Puis redémarrez le serveur Metro en vidant le cache : `bunx expo start --clear`.

### 2. Le flou `expo-blur` ne s'affiche pas sur Android
> **Explication** : Android n'a pas de support matériel pour le flou translucide temps-réel natif iOS. Rashwright UI applique automatiquement un fallback physique semi-transparent adaptatif (`backgroundFallback`) avec bordure lumineuse pour garantir une lisibilité optimale sur Android sans perte de performances.

### 3. Erreur après avoir installé un composant natif (ex: `drawer`, `bottom-sheet`)
> **Solution** : Les composants marqués `nativeRebuildRequired: true` nécessitent la recompilation des binaires natifs pour iOS et Android :
> ```bash
> bunx expo run:ios
> # ou
> bunx expo run:android
> ```

---

## 📄 Licence

Fait avec ❤️ par l'équipe **Rashwright**. Tous droits réservés.
# rashwright-ui
