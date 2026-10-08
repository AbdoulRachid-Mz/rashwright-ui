# PLAN DE DÉVELOPPEMENT — Rashwright UI Mobile (v0.3.0)

> **Document de référence stratégique et technique.**

> Ce plan intègre les correctifs TypeScript, le système de thèmes enrichi (nouveaux presets + custom theme engine), le système complet de Skills IA, la commande `rs-ui reset` sécurisée et les améliorations de diagnostic associées.

---

## 0. ARBITRAGE DU NUMÉRO DE VERSION & DIAGNOSTIC TYPESCRIPT

### 0.1 Numéro de version : `v0.3.0` (Recommandé)

Selon les règles strictes de SemVer (`MAJOR.MINOR.PATCH`) :

* **PATCH (`v0.2.1`)** : Réservé aux corrections de bugs rétrocompatibles (logo, `SafeAreaView`, `ignoreDeprecations`).

* **MINOR (`v0.3.0`)** : Requis dès l'introduction de nouvelles fonctionnalités majeures rétrocompatibles :

  1. **Nouveaux presets de thèmes** (`green`, `red`, `cyan`) + **Moteur de Thème Personnalisé** (`--primary`, `--secondary`, etc.).

  2. **Système de Skills IA** pour les 61 composants, modules core et skill global (`skills/rs-ui/`).

  3. **Commande `rs-ui reset`** avec archivage par défaut et suppression définitive explicite.

  4. Nouvelles options CLI (`--skills`, `--no-skills`, `--primary`, `--secondary`, `--dark-primary`...).

  5. Amélioration de `rs-ui doctor` pour diagnostiquer les thèmes, Skills et éventuels écarts de version.

### 0.2 Diagnostic de l'erreur TypeScript `--ignoreDeprecations`

Le compilateur TypeScript affiche :

```text
Invalid value for '--ignoreDeprecations'. This flag can be used to silence deprecation warnings about features that are slated for removal in a future release. For example, if you are using a feature that is deprecated in TypeScript 6.0 but you want to continue using it without seeing warnings until TypeScript 7.0, you can set ignoreDeprecations to 6.0.
```

#### Explication :

* Les versions actuelles de TypeScript en production sont dans la branche **5.x** (v5.5 à v5.9). La mention de TypeScript 6.0 et 7.0 dans le message est un texte d'exemple indicatif de la documentation TypeScript pour expliquer le fonctionnement du flag.

* Dans le compilateur TypeScript 5.x, la valeur `"6.0"` est refusée car TypeScript 6.0 n'existe pas encore dans le compilateur actuel. Seule la valeur **`"5.0"`** est reconnue.

* **Solution appliquée** : Remplacer `"ignoreDeprecations": "6.0"` par `"5.0"` dans `packages/cli/src/core/starter-generator.ts`.

* La configuration générée conserve également :

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "ignoreDeprecations": "5.0"
  }
}
```

* La validation doit porter sur le **tsconfig réellement généré par `rs-ui init`**, et pas uniquement sur le fichier source du générateur.

---

## 1. MOTEUR DE THÈMES ENRICHI : 3 NOUVEAUX PRESETS & SYSTÈME CUSTOM

### 1.1 Ajout de 3 nouveaux Presets de Thèmes

Enrichir la palette des 6 thèmes existants (`default`, `emerald`, `violet`, `amber`, `rose`, `slate`) avec 3 nouveaux thèmes :

| Thème       | Teinte primaire (Light / Dark) | Accent    | Ambiance & Cible                                       |
| ----------- | ------------------------------ | --------- | ------------------------------------------------------ |
| **`green`** | `#16A34A` / `#22C55E`          | `#15803D` | Vert Forêt Naturel (écologie, santé, bien-être)        |
| **`red`**   | `#DC2626` / `#EF4444`          | `#B91C1C` | Rouge Rubis Énergique (urgences, sport, fintech)       |
| **`cyan`**  | `#0891B2` / `#00D9FF`          | `#06B6D4` | Cyber Cyan Électrique (tech, IA, signature Rashwright) |

Fichiers à créer / mettre à jour :

* `packages/ui-mobile/theme/themes/green.ts`
* `packages/ui-mobile/theme/themes/red.ts`
* `packages/ui-mobile/theme/themes/cyan.ts`
* `packages/ui-mobile/theme/themes/default.ts` (enregistrement dans `THEME_PRESETS` et `ThemePresetName`)
* `packages/ui-mobile/theme/index.ts`
* `packages/ui-mobile/registry/index.json` (ajout dans `themes`)

Les nouveaux presets doivent respecter exactement la structure du type `Theme` existant et rester compatibles avec le système actuel de `ThemeProvider`, `useTheme()` et `theme-store.ts`.

### 1.2 Moteur de Thème Personnalisé Dynamique (Custom Theme Engine)

Permettre aux utilisateurs de définir leur propre charte graphique dès l'initialisation ou via CLI.

Le thème custom doit être considéré comme une **configuration propre au projet consommateur**, et non comme un preset Rashwright supplémentaire.

#### Options CLI dans `rs-ui init`

```bash
# Initialiser avec des couleurs personnalisées directement en ligne de commande

rs-ui init \
  --theme custom \
  --primary "#00d9ff" \
  --secondary "#1e293b" \
  --accent "#f59e0b" \
  --dark-primary "#38bdf8" \
  --yes
```

Les options light/dark doivent être clairement distinguées lorsqu'une couleur possède une variante pour chaque mode.

#### Mode interactif dans `rs-ui init`

Le menu de sélection propose l'option dédiée en bas de liste :

```text
? Choisissez un thème pour votre projet :

  ❯ default (Rashwright Blue)
    emerald (Emerald Mint)
    violet (Violet Tech)
    amber (Amber Luxury)
    rose (Rose Vibrant)
    slate (Slate Monochrome)
    green (Forest Green) [NOUVEAU]
    red (Crimson Red) [NOUVEAU]
    cyan (Cyber Cyan) [NOUVEAU]
    🎨 Custom (Personnalisé — définir vos propres couleurs) [NOUVEAU]
```

Si **Custom** est sélectionné, un assistant interactif pas-à-pas se lance.

#### Étape 1 : Couleurs obligatoires

Validation stricte du format `#RRGGBB` / `#RGB` :

* `Primary Color [Light mode]` (ex: `#2563EB`)
* `Primary Color [Dark mode]` (ex: `#3B82F6`)
* `Secondary Color [Light mode]` (ex: `#F1F5F9`)
* `Secondary Color [Dark mode]` (ex: `#1E293B`)

#### Étape 2 : Couleurs facultatives

Appuyer sur Entrée applique la valeur par défaut harmonisée :

* `Accent Color [Light mode]`
* `Accent Color [Dark mode]`
* `Background Color [Light mode]` (défaut : `#F8FAFC`)
* `Background Color [Dark mode]` (défaut : `#0F172A`)
* `Card / Surface Color [Light mode]` (défaut : `#FFFFFF`)
* `Card / Surface Color [Dark mode]` (défaut : `#1E293B`)

#### Étape 3 : Génération & Enregistrement

* Création du fichier `theme/themes/custom.ts`.
* Export de `customLight` et `customDark` basés sur le template/type `Theme`.
* Intégration dans `theme-store.ts`.
* Enregistrement dans `rashwright-ui.json` :

```json
{
  "theme": "custom",
  "customColors": {
    "primary": "...",
    "darkPrimary": "...",
    "secondary": "...",
    "darkSecondary": "...",
    "accent": "...",
    "darkAccent": "..."
  }
}
```

* Les données du thème custom doivent pouvoir être relues lors d'une opération ultérieure sans perdre la configuration du projet.

### 1.3 Cohérence et validation des thèmes

Tous les thèmes, y compris les thèmes custom, doivent être validés avant génération :

* format hexadécimal valide ;
* light/dark correctement définis ;
* structure compatible avec `Theme` ;
* tokens obligatoires présents ;
* absence de valeurs `undefined` dans le thème généré.

Les tests doivent vérifier au minimum :

* les 9 presets ;
* la sélection d'un preset ;
* la génération d'un thème custom ;
* la validation des couleurs ;
* la persistance dans `rashwright-ui.json` ;
* la réutilisation d'une configuration custom existante.

---

## 2. SYSTÈME DE SKILLS IA POUR RS-UI

### 2.1 Objectif

Fournir aux agents de développement IA (Antigravity, Cursor, Gemini CLI, Claude Code, GitHub Copilot) toute la documentation contextuelle, les types, les props, les dépendances natives et les règles de style de chaque composant et module du projet.

Le système de Skills doit transformer chaque composant distribué par Rashwright en une unité comprenant :

```text
Composant
├── Code source
└── Documentation contextuelle IA
    └── SKILL.md
```

### 2.2 Format des `SKILL.md`

Chaque `SKILL.md` utilise :

1. **Frontmatter YAML** pour les métadonnées destinées aux outils et agents.
2. **Markdown** pour la documentation détaillée destinée aux développeurs et agents IA.

Exemple :

```md
---
name: drawer
description: Bottom drawer component for React Native / Expo
version: 0.3.0
componentVersion: 0.3.0
category: navigation
dependencies:
  - react-native-reanimated
  - react-native-gesture-handler
---

# Drawer

## Purpose

...

## Usage

...

## Props

...

## Dependencies

...

## Common mistakes

...

## Examples

...
```

Le frontmatter doit rester simple, stable et extensible.

Le contenu Markdown doit fournir le contexte réellement utile à l'agent :

* rôle du composant ;
* API ;
* props ;
* exemples ;
* dépendances ;
* dépendances natives ;
* contraintes Expo ;
* intégration avec le thème ;
* patterns Rashwright ;
* erreurs fréquentes ;
* recommandations d'utilisation.

### 2.3 Versionnement des Skills

Chaque Skill doit être versionné avec le composant ou module auquel il appartient.

Exemple :

```yaml
version: 0.3.0
componentVersion: 0.3.0
```

Lorsqu'un composant change de comportement, d'API ou de dépendances, son `SKILL.md` doit être mis à jour simultanément.

Objectif :

```text
component v0.3.0
      ↕
skill v0.3.0
```

Le système doit pouvoir détecter ultérieurement un Skill obsolète par rapport au composant installé.

### 2.4 Règles de distribution

#### 1. À l'initialisation (`rs-ui init`)

* Crée le dossier `skills/rs-ui/` à la racine du projet.
* Copie le **Skill Global Rashwright UI** dans `skills/rs-ui/SKILL.md`.

Le Skill Global contient :

* architecture globale ;
* philosophie du code ownership ;
* système de thème ;
* tokens ;
* hook `useTheme()` ;
* primitives Liquid Glass ;
* gestion des animations Reanimated ;
* liste exhaustive des composants ;
* commandes `rs-ui` ;
* règles générales d'utilisation ;
* conventions importantes pour les agents IA.

#### 2. À l'ajout d'un composant (`rs-ui add <composant>`)

* Copie le composant `components/ui/<composant>.tsx` et ses dépendances.
* Copie automatiquement son Skill dans :

```text
skills/rs-ui/<composant>/SKILL.md
```

* `--skills` est activé par défaut.
* `--no-skills` permet de désactiver la copie du Skill.

Exemple :

```bash
rs-ui add drawer
```

produit :

```text
components/ui/drawer.tsx
skills/rs-ui/drawer/SKILL.md
```

#### 3. À la suppression (`rs-ui remove <composant>`)

* Supprime le composant si l'opération est autorisée par les règles existantes.
* Nettoie son Skill associé uniquement lorsqu'il est géré par Rashwright.
* Ne doit pas supprimer arbitrairement un fichier Skill créé ou modifié manuellement par l'utilisateur.

#### 4. Catalogue de Skills

Rédiger :

* **61 fichiers `SKILL.md`** pour l'ensemble des 61 composants du catalogue.
* **4 Skills pour les modules core** :

  * `liquid`
  * `upload`
  * `theme`
  * `cli`
* **1 Skill Global Rashwright UI**.

### 2.5 Intégration avec `rs-ui doctor`

`rs-ui doctor` doit pouvoir diagnostiquer :

* présence du Skill global ;
* nombre de Skills de composants installés ;
* Skills absents ;
* Skills dont la version ne correspond plus au composant ;
* validité du frontmatter ;
* cohérence du Skill avec la configuration Rashwright.

Exemple :

```text
✔ Global AI skill installed
✔ 12 component skills installed
✔ Skill versions are synchronized
✔ Theme skill is valid
```

En cas d'écart :

```text
⚠ drawer skill is outdated
  Installed component: 0.3.0
  Installed skill:     0.2.0
```

---

## 3. FONCTIONNALITÉ `rs-ui reset` (Projets RS-UI)

### 3.1 Objectif

Permettre de retirer en une commande les fichiers d'exemple du starter (Showcase screen, logo Rashwright, assets démo) une fois le projet pris en main, sur le modèle de `npm run reset-project` d'Expo.

La commande doit être **non destructive par défaut**.

### 3.2 Comportement interactif

La commande :

```bash
rs-ui reset
```

avec alias :

```bash
rs-ui-reset
```

doit :

1. Détecter la présence des fichiers showcase :

   * `components/ui/showcase-screen.tsx` (ou `src/components/ui/showcase-screen.tsx`)
   * `components/ui/rashwright-logo.tsx` (ou `src/components/ui/rashwright-logo.tsx`)
   * `app/index.tsx` (ou `App.tsx`)
   * `assets/primary.png`
   * `assets/svg/primary.svg`

2. Présenter un choix interactif :

   * **Option 1 : Archiver dans `rs-ui-example/` (Recommandé)**
     Déplace les fichiers vers `rs-ui-example/` pour référence future.

   * **Option 2 : Supprimer définitivement**
     Disponible uniquement comme opération explicitement destructive.

3. Générer un écran d'accueil minimal et épuré dans `app/index.tsx` (ou `App.tsx`) utilisant `useTheme()`.

4. Mettre à jour `rashwright-ui.json` sans supprimer aveuglément les informations historiques.

5. Ajouter le script :

```json
{
  "scripts": {
    "reset-project": "rs-ui reset"
  }
}
```

### 3.3 Mode destructif explicite

Le comportement par défaut doit rester sûr :

```bash
rs-ui reset
```

→ archivage recommandé.

La suppression définitive doit nécessiter une intention explicite :

```bash
rs-ui reset --delete
```

ou :

```bash
rs-ui reset --hard
```

L'option retenue devra être unique dans l'implémentation et documentée clairement.

En mode destructif, un avertissement explicite doit être affiché avant suppression.

### 3.4 Gestion de `rashwright-ui.json`

Le reset ne doit pas simplement retirer arbitrairement `showcase-screen` et `rashwright-logo` du fichier de configuration.

Le fichier doit conserver un état cohérent du starter et des éléments gérés.

Exemple conceptuel :

```json
{
  "starter": {
    "installed": true,
    "reset": true,
    "archived": true
  }
}
```

La structure exacte devra respecter le schéma actuel de `rashwright-ui.json`.

Objectif :

* conserver l'historique utile ;
* savoir que le starter a été initialisé ;
* savoir qu'il a été reset ;
* éviter qu'un futur `rs-ui update` tente de recréer automatiquement les fichiers supprimés ou archivés ;
* préserver les fichiers modifiés manuellement.

### 3.5 Protection des fichiers utilisateur

`rs-ui reset` ne doit jamais supprimer arbitrairement un fichier portant seulement un nom similaire à un fichier Rashwright.

La commande doit s'appuyer sur les mécanismes existants d'identification des fichiers gérés par Rashwright.

Si un fichier a été modifié par l'utilisateur et que le système peut détecter cette modification :

```text
⚠ Fichier modifié par l'utilisateur :
  components/ui/showcase-screen.tsx

Voulez-vous continuer ?
```

Aucune suppression silencieuse ne doit être effectuée.

---

## 4. DÉCOUPAGE EN PHASES D'EXÉCUTION (ROADMAP v0.3.0)

```text
PHASE 1 : Correctifs Immédiats & Fix Tsconfig
  ├── 1.1 Validation et intégration des correctifs rashwright-logo.tsx (@/assets/primary.png + props)
  ├── 1.2 Validation et intégration du remplacement SafeAreaView dans showcase-screen.tsx
  ├── 1.3 Correction de ignoreDeprecations: "5.0" dans starter-generator.ts et tests unitaires
  └── 1.4 Exécution du Quality Gate
  → STATUT : TERMINÉ

PHASE 2 : Moteur de Thèmes Élargi & Custom Theme Engine
  ├── 2.1 Création des presets green.ts, red.ts, cyan.ts
  ├── 2.2 Mise à jour de THEME_PRESETS, ThemePresetName et export index.ts
  ├── 2.3 Mise à jour de registry/index.json (themes: +green, +red, +cyan)
  ├── 2.4 Implémentation des flags CLI (--primary, --secondary, --accent, --dark-primary, --dark-secondary)
  ├── 2.5 Prompt interactif thème personnalisé dans rs-ui init
  ├── 2.6 Générateur de theme/themes/custom.ts pour les projets consommateurs
  ├── 2.7 Persistance et validation de la configuration custom dans rashwright-ui.json
  └── 2.8 Tests unitaires Vitest pour la gestion des thèmes

PHASE 3 : Moteur de Skills IA (Architecture & CLI)
  ├── 3.1 Définition du format SKILL.md : frontmatter YAML + Markdown
  ├── 3.2 Définition du versionnement Skill ↔ composant/module
  ├── 3.3 Rédaction du Skill Global Rashwright UI
  ├── 3.4 Rédaction des 61 SKILL.md de composants
  ├── 3.5 Rédaction des 4 SKILL.md modules core (liquid, upload, theme, cli)
  ├── 3.6 Mise à jour de rs-ui init (installation auto du skill global)
  ├── 3.7 Mise à jour de rs-ui add (installation auto du skill par composant avec --skills / --no-skills)
  ├── 3.8 Intégration du diagnostic Skills dans rs-ui doctor
  └── 3.9 Tests unitaires Vitest pour le gestionnaire de Skills

PHASE 4 : Commande rs-ui reset
  ├── 4.1 Création de la commande packages/cli/src/commands/reset.ts
  ├── 4.2 Détection des artefacts d'exemple et fichiers gérés
  ├── 4.3 Logique d'archivage par défaut dans rs-ui-example/
  ├── 4.4 Suppression définitive explicite via --delete / --hard
  ├── 4.5 Générateur de l'écran d'accueil minimal post-reset
  ├── 4.6 Mise à jour cohérente de rashwright-ui.json
  ├── 4.7 Alias binaire / commande rs-ui-reset
  └── 4.8 Tests unitaires Vitest pour rs-ui reset

PHASE 5 : Validation, Documentation & Publication v0.3.0
  ├── 5.1 Mise à jour des tests Vitest et Quality Gate 100% vert
  ├── 5.2 Tests d'intégration rs-ui init / add / reset / doctor
  ├── 5.3 Vérification du thème custom et des Skills générés
  ├── 5.4 Mise à jour des documentations (README racine, CLI, UI, ANALYSIS, TASK)
  ├── 5.5 Simulation dry-run de publication npm
  └── 5.6 Validation finale de compatibilité et rétrocompatibilité

PHASE 6 : Publication & Release npm v0.3.0
  ├── 6.1 Publication de @rashwright/ui-mobile@0.3.0
  ├── 6.2 Attente de réplication CDN puis publication de @rashwright/cli@0.3.0
  └── 6.3 Tag Git v0.3.0 + Release Notes GitHub
```
