# @rashwright/ui-mobile — v0.1.1

> **⚠️ Pour les développeurs UTILISATEURS de Rashwright UI : vous n'avez JAMAIS besoin d'installer ce package directement.**
>
> Installez et utilisez **`@rashwright/cli`** → c'est votre point d'entrée unique `rs-ui`.
>
> ```bash
> bun add -g @rashwright/cli        # ou npm install -g @rashwright/cli
> rs-ui init --yes                  # initialiser dans un projet Expo
> rs-ui add button card drawer      # ajouter des composants
> ```

Ce package `@rashwright/ui-mobile` est un **package fournisseur de code source**. Il est utilisé en interne par `@rashwright/cli` pour livrer :
- le **registry JSON central** (55 composants, 5 matrices Expo SDK)
- le **code source TypeScript** de chaque composant (copié par le CLI dans le projet de l'utilisateur)
- le **moteur Liquid Glass** (8 primitives sous `components/ui/liquid/`)
- le **moteur d'upload** Rashwright (`lib/upload/`) avec 5 providers inlinés (Cloudinary, Firebase Storage, Vercel Blob, Local, Mock)
- les **tokens de thème** + 6 presets (default, emerald, violet, amber, rose, slate)
- les **contexts** (`ThemeProvider`, `TabBarProvider`) et store Zustand (`theme-store`)

---

## À quoi sert ce package ?

Le fonctionnement général de Rashwright est "shadcn/ui pour React Native". Le CLI (`rs-ui`) :

```
rs-ui add button
      │
      ├─ recherche "button.json" dans le registry @rashwright/ui-mobile
      ├─ copie components/ui/button.tsx + requiresComponents transitifs
      ├─ détecte Expo SDK du projet et installe versions natives COMPATIBLES
      │   (react-native-reanimated, expo-blur, expo-linear-gradient...)
      └─ le code BUTTON.tsx est maintenant DANS le projet user — il le possède.
```

Ce modèle de distribution (**code copié, pas de dépendance opaque npm**) permet de customiser complètement les composants.

---

## Contenu détaillé publié dans ce package

```
@rashwright/ui-mobile@0.1.0/
├── index.ts                     → Barrel (theme tokens, contexts, stores, hooks, UI barrel)
├── components/
│   └── ui/                      → 63 fichiers
│       ├── liquid/              → 8 primitives Liquid Glass
│       │   ├── liquid-types.ts · liquid-shadow.ts
│       │   ├── liquid-surface.tsx · liquid-pressable.tsx
│       │   ├── liquid-highlight.tsx · liquid-border.tsx
│       │   ├── liquid-glow.tsx · liquid-blob.tsx
│       ├── upload-image.tsx · upload-video.tsx
│       ├── card.tsx · button.tsx · drawer.tsx · modal.tsx · ... (55 total)
│       └── index.ts             → ThemedView/ThemedText (plus View/Text collision RN)
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
│   ├── ambient.d.ts             → 🚩 ZÉRO any — déclarations ambiantes peerDeps mockées (mode DEV ui-mobile, sans que reanimated/expo-blur/... soient installés)
│   └── index.ts
│
├── registry/                    → Registry JSON synchronisé 1:1 avec code source
│   ├── index.json               → 55 composants, 10 catégories, 5 SDK (54→58)
│   ├── components/  (55 JSON)   → 1 par composant
│   └── versions/  (5 JSON)      → matrices compatibilité Expo SDK 54 · 55 · 56 · 57 · 58
│
├── lib/upload/                  → Moteur Upload Rashwright INLINE (plus de package séparé)
│   ├── types.ts                 → IUploadProvider · UploadSource · UploadResult
│   ├── errors.ts                → UploadError
│   ├── upload-manager.ts        → UploadManager orchestrateur
│   ├── index.ts                 → barrel providers + types
│   └── providers/               → Cloudinary · Firebase Storage · Vercel Blob · Local · Mock
│
├── skills/ (10 dossiers)        → SKILL.md par composant (guides IA + documentation)
└── assets/                      → primary.png · svg/primary.svg (logo Rashwright)
```

Tous les fichiers ci-dessus sont déclarés dans `files:[]` de `package.json` et sont **accessibles après `npm install @rashwright/ui-mobile`**.

---

## Bonnes pratiques

1. **Ne jamais coder de logique métier dans ce package** : c'est un catalogue distribuable. Les logiques spécifiques (PropertyCard, UserProfileCard...) appartiennent aux projets consommateurs.
2. **Si tu es contributeur** → docs racine monorepo : [CONTRIBUTOR.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md) · [Quick-Start.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/Quick-Start.md).
3. **Si tu rencontres un bug avec `rs-ui`** → ouvrir une issue sur [GitHub AbdoulRachid-Mz/rashwright-ui](https://github.com/AbdoulRachid-Mz/rashwright-ui/issues).

---

## Compatibilité Expo SDK

Matrices de compatibilité testées : Expo SDK 54, 55, 56 (status 🟢 Tested). SDK 57/58 → 🟡 Experimental (registry fourni mais tests physiques en cours).

| Package peer | Version min recommandée |
|---|---|
| `expo` | >= 54.0.0 |
| `react` | >= 18.3.0 |
| `react-native` | >= 0.73.0 |
| `react-native-reanimated` | >= 3.0.0 (optionnel peerDepMeta) |
| `react-native-safe-area-context` | >= 4.0.0 (optionnel peerDepMeta) |
| `zustand` | >= 5.0.0 |

---

## Liens utiles

- [Dépôt GitHub source](https://github.com/AbdoulRachid-Mz/rashwright-ui)
- [Guide utilisateur (README monorepo racine)](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/README.md)
- [ANALYSIS.md — architecture + corrections P0/P1 appliquées](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/ANALYSIS.md)
- [VALIDATION.md — checklist release 0.1.0](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/VALIDATION.md)

---

**Licence MIT · Fait avec ❤️ par l'équipe Rashwright office.**
