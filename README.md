# Rashwright UI Mobile (`rs-ui`)

> Système moderne de composants **distribuables** pour **React Native** & **Expo** avec moteur **Liquid Glass UI**, inspiré de la philosophie *shadcn/ui* : **vous copiez les composants dans votre codebase, vous en êtes propriétaire**.

**Statut v0.1.1** : ✅ Publié sur npm — `@rashwright/cli@0.1.1` · `@rashwright/ui-mobile@0.1.1`
**P0/P1** : 13/13 résolus. **Objectifs errors.md A/B/C/D** : 4/4 atteints.

[![npm - @rashwright/cli](https://img.shields.io/badge/@rashwright/cli-v0.1.1-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/cli)
[![npm - @rashwright/ui-mobile](https://img.shields.io/badge/@rashwright/ui--mobile-v0.1.1-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/ui-mobile)
[![GitHub](https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github)](https://github.com/AbdoulRachid-Mz/rashwright-ui)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2058-000000.svg?logo=expo)](#)
[![Package Manager](https://img.shields.io/badge/Bun-1.2%2B-fbf0df.svg?logo=bun)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5%2B-3178c6.svg?logo=typescript)](#)

---

## ⚡ Quick Start — Prêt en **30 secondes**

```bash
# 1. Installer le CLI (point d'entrée unique pour les développeurs utilisateurs)
bun add -g @rashwright/cli
# ou : npm install -g @rashwright/cli

# 2. Initialiser Rashwright UI Mobile dans un projet Expo existant (ou nouveau)
rs-ui init --glass --theme emerald --yes

# 3. Ajouter des composants
rs-ui add button
rs-ui add card drawer

# ✅ C'est prêt. Plus besoin de comprendre l'architecture interne.
```

> 💡 **Rien à comprendre du monorepo.** `@rashwright/cli` est **votre unique point d'entrée** : il va chercher les composants dans le Registry `@rashwright/ui-mobile`, résout les versions natives compatibles avec votre SDK Expo et copie le code source directement dans votre projet. Pas de node_modules opaque.

---

## 📑 Sommaire — Guide utilisateur

1. [Pourquoi Rashwright ?](#-pourquoi-rashwright-)
2. [Prérequis](#-prérequis)
3. [Installation du CLI `rs-ui`](#-installation-du-cli-rs-ui)
4. [Initialiser un projet (`rs-ui init`)](#-initialiser-un-projet-rs-ui-init)
5. [Ajouter des composants (`rs-ui add / list / info`)](#-ajouter-des-composants-rs-ui-add--list--info)
6. [Les 6 thèmes prédéfinis](#-les-6-thèmes-prédéfinis)
7. [Composants d'upload et providers](#-composants-dupload-et-providers)
8. [Diagnostic (`rs-ui doctor`)](#-diagnostic-rs-ui-doctor)
9. [Matrice de compatibilité Expo SDK](#-matrice-de-compatibilité-expo-sdk)
10. [Dépannage & FAQ](#-dépannage--faq)
11. [Architecture & Dépôt `rashwright-ui`](#-architecture--dépôt-rashwright-ui)

> 🛠️ **Vous voulez contribuer (ajouter un composant, faire évoluer le CLI) ?** → Tout a été déplacé dans **[CONTRIBUTOR.md](./CONTRIBUTOR.md)**. Ce README-ci est destiné au **développeur utilisateur** qui intègre Rashwright dans son app.

---

## ❓ Pourquoi Rashwright ?

Rashwright UI Mobile n'est **pas une dépendance npm opaque dans `node_modules/`**. C'est un **système de distribution de code source directe** à la *shadcn/ui* :

- ✅ **Propriété totale du code** : Chaque composant installé via `rs-ui add` est **copié** dans ton projet (`components/ui/`). Tu peux l'éditer, adapter, customiser sans contrainte de framework.
- ✅ **Résolution automatique Expo SDK** : Le CLI détecte ta version d'Expo (SDK 54 à 58) et installe les versions natives **testées** pour `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, etc.
- ✅ **Moteur Liquid Glass intégré** : Effets de flou dynamique, reflets physiques, bordures néon, rebonds tactiles haptiques — activable via `--glass` dans `rs-ui init`.
- ✅ **6 thèmes prêts à l'emploi (clair + sombre)** : `default` · `emerald` · `violet` · `amber` · `rose` · `slate`.
- ✅ **Zéro blocage persistance** : Détection dynamique de `@react-native-async-storage/async-storage` avec fallback mémoire sécurisé.
- ✅ **55 composants** dans la version `0.1.0` (voir `rs-ui list --json` pour le nombre à jour).

---

## 💻 Prérequis

Pour installer `@rashwright/cli` et exécuter un projet Expo :

| Outil | Version minimale | Rôle |
|---|---|---|
| **Bun** (recommandé) | `>= 1.2.0` | Package manager & runtime (utilisé par défaut par `rs-ui`) |
| **Node.js** | `>= 18.0.0` | Runtime JS (obligatoire pour Expo)
| **Git** | Récent | Gestion de version |

---

## 📦 Installation du CLI `rs-ui`

⚠️ **Pour les développeurs utilisateurs** : tu n'as **jamais** besoin d'installer `@rashwright/ui-mobile` manuellement. C'est **`@rashwright/cli`** qui s'occupe de tout.

### Option A : Installation globale (recommandée — commande `rs-ui` disponible partout)
```bash
bun add -g @rashwright/cli
# ou avec npm :
npm install -g @rashwright/cli
```

### Option B : Exécution ponctuelle (pas d'installation globale)
```bash
bunx @rashwright/cli <commande>
# ou :
npx @rashwright/cli <commande>
```

Vérifier l'installation :
```bash
rs-ui --version
# doit afficher 0.1.1 (ou + récent)
```

---

## 🚀 Initialiser un projet (`rs-ui init`)

`rs-ui init` est **intelligent** :
1. **Dans un projet Expo/React Native existant** → configure Rashwright, crée `rashwright-ui.json`, installe les deps natives compatibles, pose `ThemeProvider`, copie l'écran démo interactif + les logos RS (`assets/primary.png`, `assets/svg/primary.svg`).
2. **Dans un dossier vide** → crée un **nouveau projet Expo** (SDK latest ou `--sdk XX`) puis procède comme ci-dessus.

```bash
# Mode interactif (recommandé au début)
rs-ui init

# Mode automatique (réponses par défaut)
rs-ui init --yes

# Mode complet : Liquid Glass + thème émeraude + SDK 57, zéro question
rs-ui init --glass --theme emerald --sdk 57 --yes

# Preview : montre ce qui va être fait, sans toucher aux fichiers
rs-ui init --dry-run
```

---

## 🧩 Ajouter des composants (`rs-ui add` / `list` / `info`)

Le CLI résout **automatiquement** tout l'arbre de dépendances (composants enfants + modules natifs Expo + providers) :

```bash
# Ajouter un composant
rs-ui add button

# Ajouter plusieurs composants
rs-ui add card modal text-input bottom-sheet

# Uploads
rs-ui add upload-image upload-video

# Ajouter TOUS les composants disponibles (nombre à jour selon version)
rs-ui add --all
# → 55 composants dans la version 0.1.1
```

**Explorer la bibliothèque avant d'ajouter :**
```bash
# Catalogue interactif + statut installé / non installé
rs-ui list

# Catalogue machine (pour scripts / IA)
rs-ui list --json

# Détails complets d'un composant : deps, providers, plateformes, rebuild requis
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

Les composants `UploadImage` et `UploadVideo` embarquent **directement** le moteur d'upload Rashwright (il n'y a plus de package npm séparé — tout est inliné dans `lib/upload/`). Vous pouvez brancher : **Cloudinary**, **Firebase Storage**, **Vercel Blob**, **Local FS**, **Mock (test)**.

```tsx
import { UploadImage } from "@/components/ui/upload-image";
import { UploadVideo } from "@/components/ui/upload-video";
import {
  CloudinaryProvider,
  FirebaseStorageProvider,
  VercelBlobProvider,
  LocalUploadProvider,
  MockUploadProvider,
} from "@/lib/upload";
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

## 🛠 Diagnostic (`rs-ui doctor`)

Avant de soumettre un bug, ou avant un rebuild natif, lance un diagnostic complet de ton install :

```bash
rs-ui doctor
# ou en JSON pour scripts :
rs-ui doctor --json
```

Exemple de sortie en cas de succès :
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

## 📊 Matrice de compatibilité Expo SDK

> 🧪 Les versions marquées **🟢 Tested** ont été exécutées dans un build physique (SDK 54 → 56 en test d'intégration). **🟡 Experimental** = Registry fourni, mais combinaison non testée sur device physique par l'équipe Rashwright.

### Versions testées par Rashwright

| Expo SDK | Statut |
|---|---|
| SDK 54 | 🟢 Tested |
| SDK 55 | 🟢 Tested |
| SDK 56 | 🟢 Tested |
| SDK 57 | 🟡 Experimental |
| SDK 58 | 🟡 Experimental |

### Versions résolues par le CLI (selon ton SDK)

Le CLI `rs-ui` sait **exactement** quelle version installer en fonction de ton SDK Expo. Exemple (extrait `registry/versions/expo-56.json`) :

| Dépendance | SDK 56 | SDK 57 | SDK 58 |
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

La matrice complète est consultable dans : `registry/versions/expo-{54,55,56,57,58}.json` du package `@rashwright/ui-mobile`.

---

## 🏗 Architecture & Dépôt `rashwright-ui`

Rashwright UI Mobile est un **monorepo Bun Workspaces** (1 dépôt GitHub = 2 packages npm) :

```text
Dépôt GitHub rashwright-ui             npm registry (public)
           │                                  │
           ├── packages/cli/       ──────▶   @rashwright/cli
           │    └── commande: rs-ui              (pour les devs utilisateurs : entrypoint)
           │
           └── packages/ui-mobile/ ──────▶   @rashwright/ui-mobile
                ├── components/ui/              (Registry + sources composants)
                ├── registry/                   (metadata)
                ├── liquid/ primitives
                ├── contexts / stores / theme
                └── skills / types / constants
```

**Comment ça marche concrètement pour le dev utilisateur :**
```text
rs-ui init
     │
     ▼
@rashwright/cli cherche
     │
     ├── @rashwright/ui-mobile@latest   (Registry + composants)
     │     (fallback workspace si on est dans le repo contributor)
     ▼
Résout Expo SDK (54 → 58)
     │
     ├── Copie les composants dans ton app (components/ui/)
     ├── Install les versions natives compatibles via bun/expo install
     ├── Pose ThemeProvider + rashwright-ui.json
     └── Copie l'écran démo + assets officiels
```

La **documentation complète du contributeur** (scripts workspace, tsconfig composite, ajouter un composant au registry, publier, CI/CD) → **[CONTRIBUTOR.md](./CONTRIBUTOR.md)**.

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
