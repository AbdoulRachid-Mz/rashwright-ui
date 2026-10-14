# RAPPORT D'ANALYSE COMPARATIVE & ÉTAT DES LIEUX — Rashwright UI Mobile (v0.7.3+)

> **Date** : 2026-10-14  
> **Version actuelle** : `@rashwright/ui-mobile@0.7.1` · `@rashwright/cli@0.7.3`  
> **Statut global** : STABLE · **Zéro `any` · 61 Composants · 7 Templates · 155 Tests Vitest (100% pass) · 32 Suites · Quality Gate exit 0**

---

## 1. Synthèse des dernières corrections majeures (v0.7.0 → v0.7.3)

| Version | Problème résolu | Cause racine | Solution appliquée |
|---|---|---|---|
| **v0.7.0** | Templates monolithiques en chaînes brutes | Chaînes de caractères TSX de 640 lignes en dur dans le CLI | Modularisation complète dans `templates/<id>/` avec manifestes `template.json`, commande `rs-ui add --template` et scellement dans `rashwright-ui.lock`. |
| **v0.7.1** | `ConfigError: Cannot determine Expo SDK` | `expo install` exécuté sur un projet sans `node_modules` | Pipeline d'installation en 3 étapes ordonnées : (A) `bun install` de base → (B) `expo install` des modules natifs → (C) `bun add` des packages NPM. |
| **v0.7.2** | `Bun could not find a package.json` avec `rs-ui init .` | L'argument `.` forçait à tort `useCurrentDirectory = true`, sautant la commande `create-expo-app .` | Préservation de `useCurrentDirectory = false` pour `.` afin que `create-expo-app .` s'exécute, tout en ciblant le répertoire courant ; hissage de `isFreshProject` dans le scope externe. |
| **v0.7.3** | `ConfigError: Cannot resolve entry file` & crash Web au démarrage | `expo-router` et ses peer deps n'étaient pas déclarés dans `CORE_EXPO_DEPS` | Ajout dans `CORE_EXPO_DEPS` de : `expo-router`, `react-native-screens`, `expo-constants`, `expo-linking`, ainsi que `react-dom` et `react-native-web` pour le support web Expo. |
| **Patch Tabs** | Clipping du premier onglet et layout forcé | `zIndex: -1` sur `activeCapsule`, `flex: 1` sur la racine, gestion asymétrique de `onValueChange` | Suppression du `zIndex` négatif, racine à `width: 100%`, mode contrôlé/non-contrôlé canonique, ajout de `scrollable` et accessibilité ARIA complète (`accessibilityRole="tab"`). |

---

## 2. Analyse approfondie du fork `shadcn/ui` (Web)

L'étude du dépôt de référence `chadcn-ui-fork` (version v4 / monorepo Turbo + pnpm) met en lumière l'architecture et la philosophie qui ont fait le succès mondial de shadcn en environnement Web :

### 2.1 Philosophie fondamentale de shadcn/ui
1. **Code Ownership absolu (Anti-library)** :
   - Aucun paquet `npm install @shadcn/ui`. Le code source est téléchargé et copié directement dans le dossier du projet (`src/components/ui/`).
   - Le développeur possède, lit, adapte et débugge le code sans passer par une boîte noire dans `node_modules`.
2. **Architecture en 3 couches distinctes** :
   ```text
   ┌────────────────────────────────────────────────────────┐
   │             Composant shadcn utilisateur              │
   ├────────────────────────────┬───────────────────────────┤
   │ Primitives Headless        │ Couche de Style           │
   │ (Radix UI / React Aria)    │ (Tailwind CSS v4 + CVA)   │
   │ - Accessibilité WAI-ARIA   │ - Tokens CSS Variables    │
   │ - Gestion Focus & Clavier  │ - Variantes & Tailles     │
   │ - État & Modales / Portals │ - Fonction cn() (Merge)   │
   └────────────────────────────┴───────────────────────────┘
   ```
3. **Registry universel (Schéma RFC v4)** :
   - Manifestes JSON normalisés (`registryItemSchema`) gérant les types :
     - `registry:ui` : composants atomiques de base.
     - `registry:block` : sections et écrans complexes (ex. dashboards, auth, commerce).
     - `registry:hook` : hooks réutilisables (ex. `use-mobile`, `use-media-query`).
     - `registry:lib` : fonctions utilitaires (ex. `utils.ts`, `cn`).
     - `registry:theme` / `registry:style` : configurations globales de thèmes.
   - Support des registres distants et privés (`components.json` avec clé `registries: { "@acme": "https://..." }`).
4. **AST Transformers & Codemods (CLI)** :
   - Le CLI shadcn ne fait pas de copie de texte brute. Il analyse l'AST (via Babel / Recast / ts-morph) lors de l'installation pour :
     - Réécrire les chemins d'importation selon les alias déclarés dans le `components.json` du projet (`@/components`, `@/lib/utils`, etc.).
     - Adapter les composants au framework hôte (Next.js App Router RSC, Vite SPA, Remix, etc.).
     - Injecter ou convertir les classes Tailwind selon le préfixe configuré.

---

## 3. Matrice comparative : shadcn/ui (Web) vs Rashwright UI (Mobile actuel)

| Dimension | shadcn/ui (Web) | Rashwright UI Mobile (Actuel v0.7.3) | Statut / Diagnostic |
|---|---|---|:---:|
| **Distribution du code** | Copie dans le codebase (`components/ui/`) | Copie dans le codebase (`src/components/ui/`) | ✅ **Identique & Maîtrisé** |
| **Primitives Headless** | Radix UI (accessible, WAI-ARIA, keyboard navigation, focus trap) | Implémentations maison par composant (`tabs`, `accordion`, `modal`...) | ⚠️ **Écart majeur** : Manque d'une primitive headless unifiée mobile |
| **Moteur de Styling** | Tailwind CSS v4 + `cva` + `cn()` (CSS Variables dynamiques) | `StyleSheet.create` + `useTheme()` + Primitives `LiquidSurface` | ⚠️ **Écart** : Style impératif JS vs classes utilitaires déclaratives (NativeWind) |
| **Gestion du thème** | CSS Variables (`--background`, `--primary`, `--ring`) modifiables à chaud | Contexte React `useTheme()` avec tokens typés JS | ✅ **Solide en mobile**, mais non composable avec Tailwind |
| **Typologie du Registre** | Types riches (`ui`, `block`, `hook`, `lib`, `theme`) | Typage plat (`components/`, `templates/`) | ⚠️ **Écart** : Pas encore de standardisation universelle des hooks/libs |
| **CLI & Installation** | `shadcn add <name>` avec résolution AST et multi-registres | `rs-ui add <name>` et `rs-ui add --template` avec lockfile SHA-256 | ✅ **Très proche**, manque la manipulation AST |
| **Audit & Diagnostic** | `shadcn diff`, `shadcn migrate` | `rs-ui doctor`, `rs-ui diff`, `rs-ui backup/restore`, `rs-ui why` | ✅ **Excellente avance** sur le diagnostic mobile |
| **Skills IA intégrés** | Support MCP (Model Context Protocol) naissant | 61 fichiers `SKILL.md` dédiés + skill global pour assistants IA | 🌟 **Point fort unique de Rashwright** |

---

## 4. Ce qui manque dans Rashwright UI pour le standard shadcn Mobile

### 4.1 Absence d'une couche "Headless Primitive" mobile unifiée
En Web, shadcn s'appuie sur `@radix-ui/react-*` qui gère l'état, l'accessibilité WAI-ARIA et les interactions complexes.  
Côté React Native, Rashwright a réécrit de nombreux états à la main. Cela génère des incohérences de comportement (comme le bug historique de `Tabs` où l'état contrôlé/non-contrôlé était asymétrique).  
**Ce qu'il faut** : Adopter ou standardiser une couche de primitives headless mobiles (type Radix pour React Native, ou hooks réutilisables `useControllableState`, `usePressableState`, `useDisclosure`).

### 4.2 Support de NativeWind v4 (Tailwind pour React Native) et `cva`
La plupart des développeurs React Native modernes utilisant Expo attendent une expérience identique à Tailwind Web via **NativeWind v4** :
```tsx
// Expérience cible type shadcn mobile
<TabsTrigger className="data-[state=active]:bg-primary rounded-full px-4 py-2" />
```
Actuellement, Rashwright repose exclusivement sur `StyleSheet.create` et `useTheme()`.  
**Ce qu'il faut** : Proposer une double architecture :
1. Mode **Standard StyleSheet + Theme Context** (zéro dépendance externe).
2. Mode **Tailwind / NativeWind v4** optionnel, aligné sur `components.json`.

### 4.3 Standardisation du schéma de registre type shadcn v4
Notre format `registry/components/<name>.json` actuel est efficace mais propriétaire.  
**Ce qu'il faut** : Étendre notre schéma pour s'aligner sur la spécification RFC des registres shadcn (`registry:ui`, `registry:hook`, `registry:lib`, `registry:block`), permettant d'importer des blocs directement ou d'ouvrir notre CLI à des registres tiers décentralisés.

### 4.4 Moteur de Transformers AST dans le CLI
Actuellement, le CLI copie les composants et applique quelques remplacements de chaînes.  
**Ce qu'il faut** : Un moteur de codemods AST léger (ts-morph ou babel generator) capable de :
- Récrire automatiquement les imports d'alias `@/components/ui`, `@/contexts`, etc., selon la configuration réelle du projet (`tsconfig.json`).
- Supprimer les imports inutilisés ou adapter les primitives selon la version d'Expo détectée.
