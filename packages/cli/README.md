# @rashwright/cli — v0.1.1 · Commande `rs-ui`

> CLI officiel **Rashwright UI Mobile** pour React Native / Expo.
> Inspiré de la philosophie shadcn/ui : **tu installes un composant, tu possèdes son code source.**
>
> Plus de node_modules opaque. Plus de surprise quant à la compatibilité Expo SDK.

[![npm](https://img.shields.io/badge/npm-%40rashwright%2Fcli-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/cli)
[![GitHub](https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github)](https://github.com/AbdoulRachid-Mz/rashwright-ui)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2058-000020?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](#)

---

## ⚡ Installer + Prêt en 30 secondes

### 1) Installer le CLI

```bash
# Option A — Global (recommandé : commande rs-ui disponible partout)
bun add -g @rashwright/cli
# ou :
npm install -g @rashwright/cli

# Option B — Exécution ponctuelle
bunx @rashwright/cli --help
npx @rashwright/cli --help
```

### 2) Initialiser Rashwright dans un projet Expo

```bash
# Dans un projet Expo existant :
cd ton-app-expo/
rs-ui init --yes

# Nouveau projet Expo, thème Glass + Emerald, zéro question :
rs-ui init --glass --theme emerald --yes
```

### 3) Ajouter des composants

```bash
rs-ui add button card drawer text-input
# Ou interactif (coche multi-sélection) :
rs-ui add
# (↑ / ↓ pour naviguer, ESPACE cocher, A tout cocher, ENTRÉE installer)

# Ajouter TOUS les composants :
rs-ui add --all
```

---

## 📋 Toutes les commandes

```bash
rs-ui --help
```

| Commande | Usage typique |
|---|---|
| `rs-ui init [project-name]` | Initialiser Rashwright (dans un projet existant) ou créer un nouveau projet Expo + initialiser. |
| `rs-ui add [components...]` | Ajouter un ou plusieurs composants. Résout automatiquement composants transitifs + dépendances Expo natives COMPATIBLES SDK. Sans argument → mode interactif checkbox. |
| `rs-ui list` | Catalogue interactif : composants installés ✔ / non installés ○. `rs-ui list --json` → machine-readable. |
| `rs-ui info <component>` | Détails : version, deps, providers, plateformes, `nativeRebuildRequired` ou pas. |
| `rs-ui doctor` | Diagnostic complet de l'installation + environnement Expo SDK + package manager + TS. |
| `rs-ui remove <component>` | Retirer un composant (AVERTIT si d'autres composants en dépendent). |
| `rs-ui update [components...]` | Mettre à jour un ou plusieurs composants installés. Garde les modifications locales si tu en as fait. |
| `rs-ui help <commande>` | Aide détaillée par commande. |

---

## 🔧 Options utiles (à connaître)

### Pour `rs-ui init`

| Option | Valeur par défaut | Rôle |
|---|---|---|
| `--sdk <version>` | `latest` | SDK Expo pour nouveau projet (54, 55, 56, 57, 58). |
| `--theme <preset>` | `default` | Un parmi 6 prêts à l'emploi : `default` · `emerald` · `violet` · `amber` · `rose` · `slate`. |
| `--glass` | `false` | Activer le moteur Liquid Glass (ajoute expo-blur + expo-linear-gradient). |
| `--all` | `false` | Installer tous les composants Rashwright immédiatement après init. |
| `--showcase` / `--no-showcase` | activé | Générer un écran d'accueil `app/index.tsx` avec showcase Rashwright + logo RS. |
| `--yes` | désactivé | Répondre OUI à TOUT (mode CI/script). |
| `--no-reset` | désactivé | **Très important** : si tu utilises Rashwright sur un projet EXISTANT, ne PAS écraser le template Expo. |
| `--dry-run` | désactivé | Montrer ce qui va être fait, sans toucher aux fichiers. |

### Pour `rs-ui add`

| Option | Rôle |
|---|---|
| `--all` | Ajouter TOUS les composants disponibles. |
| `--force` | Réinstaller les composants même si déjà installés (perte des modifications locales éventuelles). |
| `--yes` | Mode non interactif (pas de confirmation). |
| `--dry-run` | Montrer le plan d'installation, sans toucher aux fichiers. |
| `--interactive` / `--no-interactive` | Par défaut interactif si pas d'arguments. `--non-interactive` est un alias de `--no-interactive`. |

---

## 🧩 Ce que `rs-ui init` installe concrètement

Le CLI ne se contente PAS d'installer un npm package. Il prépare un projet Rashwright cohérent :

```
ton-projet-expo/
├── app/
│   ├── _layout.tsx              ← <ThemeProvider initialMode="system"><Slot /></ThemeProvider>
│   └── index.tsx                ← Écran showcase Rashwright (--no-showcase pour sauter)
├── components/
│   └── ui/
│       ├── text.tsx · view.tsx  ← ThemedText / ThemedView
│       ├── liquid/ (8 fichiers) ← Liquid Glass primitives
│       └── (autres composants si --all)
├── constants/
│   ├── theme.ts · glass-theme.ts
├── contexts/
│   ├── theme-context.tsx        ← ThemeProvider (clair/sombre/Glass)
│   └── tab-bar-context.tsx
├── hooks/ · stores/ · theme/
├── lib/upload/ (8 fichiers)     ← UploadManager + 5 providers (Cloudinary, Firebase, Vercel Blob, Local, Mock)
├── assets/ (logo RS)
├── rashwright-ui.json           ← Fichier de configuration Rashwright
├── tsconfig.json                ← paths {"@/*": ["./*"]} + jsx react-native
├── babel.config.js              ← plugin reanimated EN DERNIER (obligatoire Metro)
└── package.json                 ← zustand, reanimated, gesture-handler, safe-area-context, expo-blur, expo-haptics, vector-icons, async-storage... installés en versions COMPATIBLES SDK.
```

---

## 👁️‍🗨️ Diagnostic avant de rapporter un bug

Lance :
```bash
rs-ui doctor
```

Réponse type si tout va bien :
```
✔ package.json
✔ Expo SDK 57
✔ Package manager detected: bun
✔ TypeScript
✔ rashwright-ui.json trouvée
✔ Dossier composants: components/ui
✔ 12 composants Rashwright installés
✔ react-native-reanimated ~4.3.1
✔ react-native-gesture-handler ~2.31.2
✔ react-native-safe-area-context ~5.7.0
✔ expo-blur ~56.0.4
✔ expo-linear-gradient ~56.0.0
Tout est en ordre!
```

En cas de doute, `rs-ui doctor --json` donne le résultat brut en JSON (scripts / IA).

---

## 🪛 Problèmes fréquents

### 1. Reanimated plante au démarrage de l'app

**Solution** : Le plugin Babel `react-native-reanimated/plugin` **doit être le dernier des plugins**. Rashwright l'écrit déjà en dernier quand tu fais `rs-ui init`. Si tu as modifié `babel.config.js`, vérifie :

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... tes autres plugins (tsconfig-paths/resolver/etc.)
      'react-native-reanimated/plugin',  // ← DOIT rester dernier
    ],
  };
};
```
Puis relancer Metro en vidant le cache : `bunx expo start --clear`

### 2. Ajout d'un composant qui utilise react-native-gesture-handler : Drawer, BottomSheet, Slider…

Rashwright installera `react-native-gesture-handler` automatiquement. Si tu rencontres un crash au toucher, il faut **envelopper ton app avec GestureHandlerRootView**. Rashwright pose `ThemeProvider` dans `_layout.tsx`. Pour plus de sécurité, enveloppe le tout :

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@/contexts/theme-context";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider initialMode="system" initialPreset="default">
        <Slot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

### 3. Un composant "glass" ne fait pas de flou sur Android

C'est normal. Android n'a pas de support matériel natif UIVisualEffectView comme iOS. Rashwright applique **automatiquement un fallback physique semi-transparent adaptatif** (couleur de fond + bordure translucide) pour garantir une lisibilité parfaite sans perte de performance. Tu n'as rien à faire.

### 4. Après ajout d'un composant natif : crash "Invariant Violation"

Les composants marqués `nativeRebuildRequired: true` (Drawer, BottomSheet...) ont besoin d'un rebuild natif. Quand Rashwright signale ce warning, utilise :

```bash
bunx expo run:ios       # ou
bunx expo run:android
```

---

## 📚 Les 6 thèmes Rashwright

```
default  → Bleu tech #2563eb  (corporate, SaaS)
emerald  → Vert #059669        (immobilier, fintech, écologie)
violet   → Violet profond #7c3aed (design, IA, créatif, divertissement)
amber    → Ambre #d97706        (logistique, food, alertes)
rose     → Rose #e11d48         (lifestyle, e-commerce, beauté)
slate    → Neutre #475569       (minimal, sobre, luxe discret)
```

Et **Glass UI** en plus (`--glass` dans init) — chaque thème peut être combiné avec Glass.

---

## 🧠 Modèle économique / philosophie

> À la shadcn/ui : **tu payes 0 abonnement**. Tu récupères les fichiers sources. Tu es propriétaire. Tu modifies librement.

Tu veux renommer 16 tokens de couleurs ? Forker un `Button` en 3 variants business différents ? Rashwright est fait pour ça.

Le CLI est juste l'installeur. **La connaissance t'appartient.**

---

## 🆘 Support / Contribution

- **Bugs / Questions** : [GitHub Issues](https://github.com/AbdoulRachid-Mz/rashwright-ui/issues)
- **Contribuer (ajouter un composant / corriger un bug)** : [CONTRIBUTOR.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md) + [Quick-Start.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/Quick-Start.md)
- **Spécifications v0.1.0 et corrections 13 P0/P1** : [ANALYSIS.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/ANALYSIS.md) · [errors.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/errors.md)

---

**Licence MIT · Fait avec ❤️ par l'équipe Rashwright office.**
