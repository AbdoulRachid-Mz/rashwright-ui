# PLAN STRATÉGIQUE DE REFONTE — Rashwright UI Mobile (Roadmap v0.8.0 → v1.0.0)

> **Document de référence stratégique et technique.**  
> Inspiré de l'analyse comparative du fork officiel **shadcn/ui** appliquée à l'écosystème React Native / Expo.

---

## 0. Vision & Principes Fondateurs

Rashwright UI Mobile a prouvé sa viabilité (61 composants, 7 templates autonomes, CLI robuste sous Bun/NPM/Yarn/PNPM, 155 tests Vitest).  
L'objectif de la présente refonte est d'élever l'écosystème au niveau de maturité, d'accessibilité et de flexibilité de **shadcn/ui en Web**, tout en respectant les spécificités incontournables du mobile (Expo SDK, React Native Reanimated, Safe Area, Haptics, gestes tactiles).

### Les 4 Piliers de la Refonte

```text
┌────────────────────────────────────────────────────────────────────────┐
│             RASHWRIGHT UI MOBILE (ARCHITECTURE CIBLE v1.0)             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Headless Primitives Mobile                                          │
│    - useControllableState (état canonique contrôlé / non-contrôlé)    │
│    - WAI-ARIA Mobile complet (accessibilityRole, accessibilityState)   │
│    - Compound Components Pattern (Slots découplés, zéro layout forcé) │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Dual Styling Engine (StyleSheet Pur & NativeWind v4)               │
│    - Mode A (Défaut) : StyleSheet.create + useTheme() (Zéro dépendance)│
│    - Mode B (Optionnel) : NativeWind v4 + CVA + cn() (Tailwind Mobile)│
├────────────────────────────────────────────────────────────────────────┤
│ 3. Registre Universel Déclaratif (Spec RFC v4)                         │
│    - registry:ui, registry:hook, registry:lib, registry:block         │
│    - Téléchargement distant multi-registres décentralisé               │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Moteur CLI Intelligent avec AST Transformers                        │
│    - Réécriture chirurgicale des alias (@/components, @/lib, etc.)     │
│    - Standardisation de `rashwright-ui.json` compatible components.json│
│    - Intégration Model Context Protocol (MCP) pour assistants IA       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. PILIER 1 : MOTEUR DE PRIMITIVES HEADLESS MOBILES

### Problème actuel
Comme mis en évidence lors de l'audit du composant `Tabs`, de nombreux composants gèrent leur état interne de manière ad-hoc, avec des risques de désynchronisation entre mode contrôlé et non contrôlé, des re-renders inutiles et des lacunes d'accessibilité vocale.

### Actions & Spécifications
1. **Création du package ou dossier core `@/lib/primitives`** :
   - `useControllableState` : gestion unifiée pour tous les composants à état double (`Tabs`, `Accordion`, `Collapsible`, `Select`, `Dialog/Modal`, `Switch`, `Rating`).
   - `useDisclosure` : gestion générique ouverture/fermeture pour tiroirs, modales et menus.
   - `useFocusTrap` / `useKeyboardHandling` : gestion adaptée au clavier virtuel mobile.
2. **Standardisation WAI-ARIA Mobile** :
   - Tout composant interactif doit obligatoirement déclarer :
     - `accessibilityRole` (`tab`, `button`, `switch`, `combobox`, `dialog`, etc.).
     - `accessibilityState` (`selected`, `disabled`, `expanded`, `checked`).
     - `accessibilityLabel` et `accessibilityHint` prévisibles.
3. **Compound Components sans layout imposé** :
   - Aucun composant racine ne doit imposer `flex: 1` ou une taille fixe en dur.
   - Largeur par défaut prévisible (`width: "100%"` ou `alignSelf: "stretch"`).

---

## 2. PILIER 2 : REGISTRE UNIVERSEL DÉCLARATIF (SPEC RFC v4)

### Problème actuel
Le registre actuel est limité aux seuls composants unitaires et templates écrans. Il manque la capacité de distribuer des hooks autonomes (`use-device`, `use-back-handler`), des bibliothèques utilitaires (`utils.ts`, `cn.ts`) ou des sections d'UI (Blocks).

### Actions & Spécifications
1. **Adoption de la typologie normalisée shadcn** :
   - `registry:ui` : composants atomiques (Boutons, Cards, Inputs, Tabs).
   - `registry:hook` : hooks React Native réutilisables.
   - `registry:lib` : fonctions utilitaires et primitives de calcul.
   - `registry:block` : templates et sections d'écrans complètes.
2. **Schéma Zod unifié (`registry-item.json`)** :
   - Validation stricte des dépendances npm, devDependencies, `registryDependencies` (composants requis) et fichiers sources.
3. **Ouverture aux registres décentralisés et privés** :
   - Support de la syntaxe `@scope/item` dans `rs-ui add` pointant vers des URL distantes configurées dans `rashwright-ui.json`.

---

## 3. PILIER 3 : DUAL STYLING ENGINE (STYLESHEET + NATIVEWIND v4)

### Problème actuel
Certains développeurs React Native préfèrent la rapidité et la concision de Tailwind CSS via NativeWind v4, tandis que d'autres exigent une solution sans runtime de build Tailwind (StyleSheet React Native standard).

### Actions & Spécifications
1. **Conservation du mode par défaut (StyleSheet + useTheme)** :
   - Le moteur actuel reste la référence zéro-dépendance avec tokens typés (`theme.colors`, `theme.borderRadius`, Liquid Glass).
2. **Introduction d'une option de configuration `styleEngine`** :
   - Dans `rashwright-ui.json` :
     ```json
     {
       "styleEngine": "nativewind" | "stylesheet",
       "tailwind": {
         "config": "tailwind.config.js",
         "css": "global.css"
       }
     }
     ```
3. **Création de la fonction utilitaire `cn` (`packages/ui-mobile/lib/utils.ts`)** :
   - Combinaison `clsx` + `tailwind-merge` pour les projets configurés en NativeWind.

---

## 4. PILIER 4 : AST TRANSFORMERS & RESOLUTION D'ALIAS DANS LE CLI

### Problème actuel
Le CLI se contente actuellement de copier des fichiers en dur. Si l'utilisateur a configuré des alias TypeScript différents dans son `tsconfig.json` (ex: `~/components` au lieu de `@/components`), des erreurs d'import TS2307 peuvent apparaître.

### Actions & Spécifications
1. **Module `packages/cli/src/core/transformers/`** :
   - Utilisation d'un parseur/transformateur AST TypeScript léger.
   - **Transform Imports** : réécriture automatique des chemins `@/components/ui/` vers l'alias réel configuré dans `tsconfig.json` ou `rashwright-ui.json`.
   - **Transform Icons** : adaptation des imports d'icônes (`@expo/vector-icons`, Lucide Icons ou icônes custom).
2. **Validation pré-écriture** :
   - Empêcher l'écrasement de fichiers personnalisés sans l'accord explicite du développeur (protection par hash SHA-256 dans le lockfile).

---

## 5. PILIER 5 : EXPÉRIENCE DÉVELOPPEUR & INTÉGRATION IA (MCP)

1. **Commande `rs-ui diff [composant]` enrichie** :
   - Comparaison visuelle couleur dans le terminal entre le composant local modifié et la dernière version du registre.
2. **Recherche floue `rs-ui search <query>`** :
   - Recherche rapide dans le catalogue par nom, mot-clé, catégorie ou cas d'usage.
3. **Support Model Context Protocol (MCP)** :
   - Exposer un serveur local MCP (`rs-ui mcp`) permettant aux IDEs IA (Cursor, Windsurf, Claude Code, Gemini) d'interroger directement le catalogue de composants, de lire les documentations `SKILL.md` et de générer du code parfaitement conforme aux tokens Rashwright.

---

## 6. Calendrier des Releases Prévisionnelles

| Version | Cible principale | Date estimée |
|---|---|:---:|
| **v0.7.4** | Validation en conditions réelles, stabilisation des 7 templates autonomes | Octobre 2026 |
| **v0.8.0** | Primitives Headless Mobiles (`useControllableState`) & Schéma Registry v4 | Novembre 2026 |
| **v0.9.0** | AST Transformers dans le CLI & support expérimental NativeWind v4 | Décembre 2026 |
| **v1.0.0** | Release Majeure : Dual Styling Engine stable, CLI unifié, Serveur MCP IA | Janvier 2027 |
