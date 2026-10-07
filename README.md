<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile Logo" width="200" />
</p>

# Rashwright UI Mobile (`rs-ui`)

> Système moderne de composants **distribuables** pour **React Native** & **Expo** avec moteur **Liquid Glass UI**, inspiré de la philosophie *shadcn/ui* : **vous copiez les composants dans votre codebase, vous en êtes propriétaire**.

**Statut v0.2.0** : ✅ Version v0.2.0 — `@rashwright/cli@0.2.0` · `@rashwright/ui-mobile@0.2.0`  
**Composants** : 61 composants UI + 8 primitives Liquid Glass · **SDK Expo** : SDK 54 à 59 · **Tests** : 55 tests unitaires Vitest · **Typing strict** : Zéro `any`.

<p align="center">
  <a href="https://www.npmjs.com/package/@rashwright/cli"><img src="https://img.shields.io/badge/@rashwright/cli-v0.2.0-cb3837?logo=npm" alt="npm - @rashwright/cli" /></a>
  <a href="https://www.npmjs.com/package/@rashwright/ui-mobile"><img src="https://img.shields.io/badge/@rashwright/ui--mobile-v0.2.0-cb3837?logo=npm" alt="npm - @rashwright/ui-mobile" /></a>
  <a href="https://github.com/AbdoulRachid-Mz/rashwright-ui"><img src="https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2059-000000.svg?logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/Bun-1.4%2B-fbf0df.svg?logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/TypeScript-5.5%2B-3178c6.svg?logo=typescript" alt="TypeScript" />
</p>

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
rs-ui add card accordion form otp-input

# ✅ C'est prêt. Plus besoin de comprendre l'architecture interne.
```

> 💡 **Rien à comprendre du monorepo.** `@rashwright/cli` est **votre unique point d'entrée** : il va chercher les composants dans le Registry `@rashwright/ui-mobile` (localement ou via CDN distant avec cache de 24h), résout les versions natives compatibles avec votre SDK Expo et copie le code source directement dans votre projet. Pas de `node_modules` opaque.

---

## 📑 Sommaire — Guide utilisateur

1. [Pourquoi Rashwright ?](#-pourquoi-rashwright-)
2. [Nouveautés de la version v0.2.0](#-nouveautés-de-la-version-v020)
3. [Prérequis](#-prérequis)
4. [Installation du CLI `rs-ui`](#-installation-du-cli-rs-ui)
5. [Initialiser un projet (`rs-ui init`)](#-initialiser-un-projet-rs-ui-init)
6. [Ajouter des composants (`rs-ui add / list / info`)](#-ajouter-des-composants-rs-ui-add--list--info)
7. [Les 6 thèmes prédéfinis](#-les-6-thèmes-prédéfinis)
8. [Composants d'upload et providers](#-composants-dupload-et-providers)
9. [Diagnostic (`rs-ui doctor`)](#-diagnostic-rs-ui-doctor)
10. [Matrice de compatibilité Expo SDK](#-matrice-de-compatibilité-expo-sdk)
11. [Dépannage & FAQ](#-dépannage--faq)
12. [Architecture & Dépôt `rashwright-ui`](#-architecture--dépôt-rashwright-ui)

> 🛠️ **Vous voulez contribuer (ajouter un composant, faire évoluer le CLI) ?** → Consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)** et **[Quick-Start.md](./Quick-Start.md)**.

---

## ❓ Pourquoi Rashwright ?

Rashwright UI Mobile n'est **pas une dépendance npm opaque dans `node_modules/`**. C'est un **système de distribution de code source directe** à la *shadcn/ui* :

- ✅ **Propriété totale du code** : Chaque composant installé via `rs-ui add` est **copié** dans ton projet (`components/ui/`). Tu peux l'éditer, l'adapter, le personnaliser sans contrainte.
- ✅ **Résolution automatique Expo SDK** : Le CLI détecte ta version d'Expo (**SDK 54 à 59**) et installe les versions natives **testées** pour `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, etc.
- ✅ **Moteur Liquid Glass intégré** : Effets de flou dynamique, reflets physiques, bordures translucides, rebonds tactiles haptiques — activable via `--glass` dans `rs-ui init`.
- ✅ **6 thèmes prêts à l'emploi (clair + sombre)** : `default` · `emerald` · `violet` · `amber` · `rose` · `slate`.
- ✅ **Zéro blocage persistance** : Détection dynamique de `@react-native-async-storage/async-storage` avec fallback mémoire sécurisé.
- ✅ **61 composants** au catalogue avec typage strict TypeScript et zéro `any`.

---

## 🆕 Nouveautés de la version v0.2.0

- 🧩 **6 Nouveaux composants (61 total)** :
  - `accordion` : Sections repliables avec animations fluides Reanimated et options multi-items.
  - `collapsible` : Section repliable individuelle interactive.
  - `data-table` : Tableau de données FlatList avec tri par colonnes, filtre de recherche et style Glass.
  - `form` : Primitives de formulaire typées (`Form`, `FormField`, `FormLabel`, `FormMessage`, etc.).
  - `otp-input` : Saisie OTP à cases individuelles avec focus automatique et retour haptique.
  - `rating` : Notation par étoiles interactive (support des demi-étoiles).
- 🌐 **Remote Registry & Cache CDN** : Fallback automatique vers le CDN unpkg (`https://unpkg.com/@rashwright/ui-mobile@latest`) avec cache local sur disque (`~/.rs-ui/cache`, TTL 24h) et options `--registry <url>` / `--fresh`.
- 🔍 **Prévisualisation par Diff (`rs-ui add --diff`)** : Comparaison ligne par ligne avant d'écraser un composant existant.
- 📱 **Support d'Expo SDK 59** : Ajout de la matrice de compatibilité `expo-59.json` pour React Native 0.77+.
- 🧪 **Suite de tests Vitest** : 55 tests unitaires intégrés au pipeline de validation.
- 🔒 **Lockfile `rashwright-ui.json` versionné** : Stockage du numéro de version et de la date d'installation de chaque composant.
- 🎨 **Exploration interactive** : `rs-ui list -i` pour naviguer dans le catalogue par catégorie.

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
# Affiche 0.2.0
```

---

## 🚀 Initialiser un projet (`rs-ui init`)

`rs-ui init` prend en charge deux contextes :
1. **Dans un projet Expo existant** : configure Rashwright, crée `rashwright-ui.json`, installe les dépendances natives compatibles SDK, pose `ThemeProvider` et copie l'écran démo interactif.
2. **Dans un dossier vide** : initialise un projet Expo propre (SDK 54 à 59) puis configure Rashwright.

```bash
# Mode interactif
rs-ui init

# Mode automatique complet (Liquid Glass + thème émeraude + SDK 58)
rs-ui init --glass --theme emerald --sdk 58 --yes

# Simulation sans toucher aux fichiers
rs-ui init --dry-run
```

---

## 🧩 Ajouter des composants (`rs-ui add` / `list` / `info`)

Le CLI résout automatiquement tout l'arbre de dépendances (composants enfants, modules natifs Expo et providers) :

```bash
# Ajouter un composant
rs-ui add button

# Ajouter plusieurs composants
rs-ui add card modal text-input accordion form

# Prévisualiser les modifications avant écrasement
rs-ui add button --diff

# Ajouter tous les composants disponibles (61)
rs-ui add --all
```

**Explorer le catalogue :**
```bash
# Catalogue standard par catégorie
rs-ui list

# Mode interactif
rs-ui list -i

# Format JSON pour scripts et CI
rs-ui list --json

# Détails complets d'un composant
rs-ui info accordion
rs-ui info data-table
```

---

## 🎨 Les 6 thèmes prédéfinis

| Thème | Couleur primaire | Usage recommandé |
|---|---|---|
| `default` | Bleu tech (`#2563eb`) | Applications corporate, SaaS, productivité |
| `emerald` | Vert émeraude (`#059669`) | Immobilier, fintech, écologie, santé |
| `violet` | Violet profond (`#7c3aed`) | Créativité, design, IA, divertissement |
| `amber` | Ambre chaud (`#d97706`) | Alimentation, logistique, alertes |
| `rose` | Rose vif (`#e11d48`) | Lifestyle, beauté, e-commerce |
| `slate` | Ardoise neutre (`#475569`) | Minimalisme, luxe sobre, utilitaires |

```tsx
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <ThemeProvider initialMode="system" initialPreset="emerald">
      <MainScreen />
    </ThemeProvider>
  );
}

function MainScreen() {
  const { setThemePreset } = useTheme();

  return (
    <Button variant="default" onPress={() => setThemePreset("violet")}>
      Changer pour le thème Violet
    </Button>
  );
}
```

---

## 📤 Composants d'upload et providers

Les composants `UploadImage` et `UploadVideo` embarquent directement le moteur d'upload Rashwright inliné dans `lib/upload/` (aucun package externe requis). 5 providers sont fournis : **Cloudinary**, **Firebase Storage**, **Vercel Blob**, **Local FS**, **Mock**.

```tsx
import { UploadImage } from "@/components/ui/upload-image";
import { FirebaseStorageProvider } from "@/lib/upload";
import { useState } from "react";

const firebaseUploader = new FirebaseStorageProvider({
  storageBucket: "votre-app.appspot.com",
  basePath: "uploads/images",
});

export function ProfileForm() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <UploadImage
      value={images}
      onChange={setImages}
      uploader={firebaseUploader}
      maxImages={5}
      autoUpload={true}
    />
  );
}
```

---

## 🛠 Diagnostic (`rs-ui doctor`)

Lance un diagnostic complet de l'environnement, des versions natives et de l'état des composants installés :

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
  ✔ Dossier composants: components/ui
  ✔ Composants installés: 18 (tous à jour)
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

La matrice complète est disponible dans `registry/versions/expo-{54,55,56,57,58,59}.json`.

---

## ❓ Dépannage & FAQ

### 1. `react-native-reanimated` plante au démarrage
> **Solution** : Placez le plugin Reanimated dans votre `babel.config.js` **impérativement en dernier** :
> ```javascript
> module.exports = function (api) {
>   api.cache(true);
>   return {
>     presets: ['babel-preset-expo'],
>     plugins: ['react-native-reanimated/plugin'],
>   };
> };
> ```
> Puis redémarrez Metro : `bunx expo start --clear`.

### 2. Le flou ne s'affiche pas sur Android
> Android ne disposant pas de support matériel temps réel identique à iOS, Rashwright UI applique automatiquement un repli visuel semi-transparent adaptatif (`backgroundFallback`) avec bordure lumineuse pour garantir une lisibilité optimale sans baisse de performance.

---

## 🏗 Architecture & Monorepo

```text
Dépôt GitHub rashwright-ui             npm registry (public)
           │                                  │
           ├── packages/cli/       ──────▶   @rashwright/cli@0.2.0
           │    └── commande: rs-ui              (point d'entrée unique pour les développeurs)
           │
           └── packages/ui-mobile/ ──────▶   @rashwright/ui-mobile@0.2.0
                ├── components/ui/              (61 composants sources)
                ├── registry/                   (métadonnées & matrices SDK 54 à 59)
                ├── liquid/ primitives          (moteur Liquid Glass)
                └── lib/upload/                 (moteur d'upload inliné)
```

Pour la documentation dédiée aux contributeurs, consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)**.

---

## 📄 Licence

Licence MIT · Rashwright office. Tous droits réservés.
