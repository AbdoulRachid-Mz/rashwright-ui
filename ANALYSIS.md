# RAPPORT D'ANALYSE — Rashwright UI Mobile v0.2.0 (POST-ROADMAP v0.2.0)

**Date** : 2026-10-07  
**Version préparée** : `@rashwright/ui-mobile@0.2.0` + `@rashwright/cli@0.2.0`  
**Statut** : ROADMAP v0.2.0 COMPLÈTE — MONOREPO STABLE · **Zéro `any` · 61 Composants · 55 Tests Vitest (100%) · Quality gate 100% exit 0**

---

## 0. Ce document en un coup d'œil

| Rubrique | Ce qu'il contient |
|---|---|
| §1 | Architecture monorepo effective (Bun Workspaces 2 packages) |
| §2 | Inventaire des fichiers et composants (61 composants, 8 primitives Liquid) |
| §3 | Graphe de dépendances internes et synchronisation du Registry |
| §4 | **Nouveautés majeures de la v0.2.0 (Phases 1 à 6 complétées)** |
| §5 | 7 P0 et 6 P1 historiques (tous résolus et éprouvés) |
| §6 | Bilan des dettes techniques P2 (P2-6 résolu en v0.2.0, Vitest intégré) |
| §7 | Matrice de tests et Quality Gate (Vitest, checks TypeScript, lint, smoke) |
| §8 | Risques résiduels et plan pour la Phase 7 (Publication npm) |

---

## 1. ARBORESCENCE MONOREPO EFFECTIVE (v0.2.0)

```
rashwright-ui/                                    ← RACINE (workspace Bun)
├── package.json                                  ← @rashwright/workspace-root v0.2.0 — workspaces: ["packages/*"]
├── tsconfig.base.json                            ← Options TS partagées (strict, noEmit, jsx: react-native)
├── tsconfig.json                                 ← scripts/ (validate-registry, sync-registry)
├── index.tsx / babel.config.js / app.json        ← TEMPLATE EXPO DEV (hors packages publiés)
├── README.md  ·  ANALYSIS.md  ·  PLAN.md        ← Documentation workspace
├── Quick-Start.md  ·  CONTRIBUTOR.md
├── scripts/
│   ├── sync-registry.ts                          ← Régénère métadonnées dynamiques sur les 61 JSON
│   ├── validate-registry.ts                      ← Contrôles intégrité (F-1, F-2, R-1, R-2, I-1, I-2, C-1)
│   ├── cli-lint-require.mjs                      ← Lint ESM strict
│   ├── cli-lint-shebang.mjs                      ← Lint Shebang unique
│   └── cli-smoke-dep-ui.mjs                      ← Smoke semver réelle CLI → UI
│
├── packages/
│   │
│   ├── ui-mobile/                                ← @rashwright/ui-mobile v0.2.0
│   │   ├── package.json                          ← version 0.2.0, peerDependencies & peerDependenciesMeta
│   │   ├── tsconfig.json                         ← hérite tsconfig.base, include: ["**/*"]
│   │   ├── README.md                             ← Guide utilisateur & catalogue
│   │   ├── index.ts                              ← Barrel theme, contexts, stores, hooks, UI
│   │   ├── components/ui/                        ← 69 fichiers (61 composants + 8 liquid primitives)
│   │   │   ├── liquid/                           ← Primitives Liquid Glass (surface, pressable, highlight...)
│   │   │   ├── accordion.tsx                     ← 🆕 v0.2.0 (Sections dépliables animées)
│   │   │   ├── collapsible.tsx                   ← 🆕 v0.2.0 (Section repliable Reanimated)
│   │   │   ├── data-table.tsx                    ← 🆕 v0.2.0 (FlatList triée, filtrée, styled)
│   │   │   ├── form.tsx                          ← 🆕 v0.2.0 (Suite formulaires Form/Field/Label/Message)
│   │   │   ├── otp-input.tsx                     ← 🆕 v0.2.0 (Champs OTP avec focus automatique)
│   │   │   ├── rating.tsx                        ← 🆕 v0.2.0 (Étoiles interactives, demi-étoiles)
│   │   │   ├── upload-image.tsx / upload-video.tsx
│   │   │   └── index.ts                          ← Barrel UI (ThemedView, ThemedText, 61 composants)
│   │   ├── constants/  contexts/  hooks/  stores/  theme/
│   │   ├── types/
│   │   │   └── ambient.d.ts                      ← ZÉRO any (typings Reanimated, Blur, Video, etc.)
│   │   ├── registry/                             ← Registry 100% synchronisé
│   │   │   ├── index.json                        ← 61 composants, 10 catégories, 6 SDK (54 à 59)
│   │   │   ├── components/*.json (61 JSON)
│   │   │   └── versions/expo-{54,55,56,57,58,59}.json ← 🆕 Support Expo SDK 59 inclus
│   │   ├── lib/upload/                           ← Moteur upload inliné avec 5 providers
│   │   ├── skills/                               ← Guides IA pour composants
│   │   └── assets/ (primary.png, svg/primary.svg)
│   │
│   └── cli/                                      ← @rashwright/cli v0.2.0
│       ├── package.json                          ← bin: {rs-ui: ./dist/index.js}, dep: ui-mobile ^0.2.0
│       ├── tsconfig.json
│       ├── vitest.config.ts                      ← 🆕 Configuration Vitest & v8 coverage
│       ├── tests/                                ← 🆕 10 suites de tests (55 tests unitaires)
│       ├── README.md                             ← Documentation CLI
│       ├── dist/index.js                         ← ESM bundle Node 20+
│       └── src/
│           ├── index.ts                          ← CLI Commander (`rs-ui`)
│           ├── commands/
│           │   ├── init.ts                       ← Reset exhaustif, tsconfig baseUrl, core liquid
│           │   ├── add.ts                        ← Options --diff, requestedSet, arbre transitif
│           │   ├── list.ts                       ← Mode interactif -i / --interactive, comptage par catégorie
│           │   ├── info.ts, doctor.ts, remove.ts
│           │   └── update.ts                     ← Diff hash SHA-256, réinstallation expoDependencies
│           └── core/
│               ├── diff.ts                       ← 🆕 Algorithme de diff LCS zéro-dépendance
│               ├── remote-registry.ts            ← 🆕 Cache 24h (~/.rs-ui/cache) + fallback CDN unpkg
│               ├── paths.ts                      ← PROD require.resolve vs DEV workspace fallback
│               ├── registry.ts                   ← Résolution locale & distante
│               ├── starter-generator.ts          ← Nettoyage template, setupFoundations, validation SDK
│               ├── dependency-resolver.ts        ← Détection conflits versions Expo
│               ├── expo-detector.ts              ← Support SDK 54 à 59
│               ├── config-manager.ts             ← Lockfile versionné { version, installedAt }
│               └── file-manager.ts, package-manager.ts
```

---

## 2. INVENTAIRE DES COMPOSANTS (v0.2.0)

| Catégorie | Nombre | Composants |
|---|---|---|
| **Basic** | 7 | `badge`, `avatar`, `avatar-group`, `dot`, `icon`, `icon-button`, `rashwright-logo` |
| **Layout** | 9 | `accordion` (🆕), `card`, `collapsible` (🆕), `divider`, `keyboard-avoiding-view`, `safe-area-view`, `scroll-view`, `spacer`, `stat-card` |
| **Forms** | 13 | `checkbox`, `chip`, `form` (🆕), `otp-input` (🆕), `radio`, `rating` (🆕), `search-input`, `segmented-control`, `select`, `slider`, `switch`, `text-input`, `time-picker` |
| **Navigation** | 8 | `actions-grid`, `bottom-sheet`, `carousel`, `drawer`, `dropdown-menu`, `fab-menu`, `floating-action-button`, `tabs` |
| **Feedback** | 6 | `alert`, `confirm`, `modal`, `popup`, `progress`, `tooltip` |
| **States** | 7 | `activity-indicator`, `empty-state`, `error-state`, `loading-state`, `screen-skeleton`, `shimmer`, `skeleton` |
| **Data** | 3 | `data-table` (🆕), `flat-list`, `section-list` |
| **Media** | 4 | `image`, `upload-image`, `upload-video`, `video` |
| **Glass** | 2 | `glass-card`, `particles` |
| **Starter** | 2 | `button`, `showcase-screen` |
| **Primitives Liquid Core** | 8 | `liquid-surface`, `liquid-pressable`, `liquid-highlight`, `liquid-border`, `liquid-glow`, `liquid-blob`, `liquid-shadow`, `liquid-types` |
| **TOTAL COMPOSANTS** | **61** | **+ 8 primitives liquid non répertoriées dans l'index distribuable** |

---

## 3. GRAPHES DE DÉPENDANCES ET REGISTRY SYNCHRO

Toutes les dépendances internes (`requiresComponents`), dépendances Expo natives (`expoDependencies`), drapeaux Glass (`supportsGlass`) et exigences de rebuild (`nativeRebuildRequired`) sont maintenus en synchronisation 1:1 via `scripts/sync-registry.ts` et validés par `scripts/validate-registry.ts` (0 erreur, 61 composants).

---

## 4. NOUVEAUTÉS MAJEURES DE LA v0.2.0 (PHASES 1 À 6)

### Phase 1 — Correctifs critiques & Template Reset
1. **Mise à jour fiabilisée (`C-1`)** : Utilisation d'un hash SHA-256 normalisé pour détecter sans ambiguïté les modifications locales et éviter les faux positifs causés par les fins de ligne Windows (`\r\n`).
2. **Gestion des conflits de versions (`C-2`)** : Le résolveur compare les packages natifs requis avec ceux du projet et prévient l'utilisateur avant installation en cas d'incohérence avec le SDK Expo.
3. **Contrôle post-création (`C-3`)** : Validation systématique de la santé du projet Expo généré.
4. **Réinstallation complète des dépendances natives (`C-4`)** : `rs-ui update` ré-applique `expo install` pour garantir que les modules natifs restent alignés avec le SDK.
5. **Reset exhaustif des templates Expo** : Élimination complète des composants template dans `src/components/`, des routes de démo (`explore.tsx`) et des hooks template. Ajout de `baseUrl: "."` et `ignoreDeprecations: "6.0"` dans `tsconfig.json`.

### Phase 2 — 6 Nouveaux composants (61 au catalogue)
- **`accordion`** : Sections repliables fluides, gestion multi-ouverture, styles Bordered et Glass.
- **`collapsible`** : Version single-item avec chevron animé.
- **`data-table`** : Tableau FlatList avec tri par colonnes, recherche intégrée et rendu flexible.
- **`form`** : Primitives de formulaire typées (`Form`, `FormField`, `FormLabel`, `FormMessage`, etc.).
- **`otp-input`** : Expérience OTP avec gestion du focus automatique, suppression et retour haptique.
- **`rating`** : Notation à étoiles avec gestion des demi-étoiles et animations Reanimated.

### Phase 3 — Remote Registry & Cache CDN
- Implémentation de `remote-registry.ts` avec téléchargement dynamique sur CDN unpkg (`https://unpkg.com/@rashwright/ui-mobile@latest`).
- Système de cache local sur disque (`~/.rs-ui/cache`) valide 24h avec options `--registry <url>` et `--fresh`.

### Phase 4 — Suite de tests unitaires Vitest
- 10 fichiers de tests unitaires dans `packages/cli/tests/`.
- 55 tests passants couvrant la détection de projets, le résolveur de dépendances, le gestionnaire de configurations, le diff LCS, le gestionnaire de paquets et le remote registry.

### Phase 5 — UX & Améliorations CLI
- **Prévisualisation par diff** : `rs-ui add <comp> --diff` permet d'inspecter visuellement les écarts ligne par ligne avant d'écraser un composant existant.
- **Lockfile versionné** : `rashwright-ui.json` enregistre désormais la version et la date d'installation de chaque composant (`{ version, installedAt }`), tout en conservant la rétrocompatibilité v0.1.
- **Navigation interactive** : `rs-ui list -i` permet de parcourir le catalogue de façon interactive par catégorie.

### Phase 6 — Matrice Expo SDK 59 & peerDependencies complètes
- Ajout de la matrice de compatibilité `registry/versions/expo-59.json`.
- Prise en charge officielle du SDK 59 dans le détecteur Expo.
- Exhaustivité des `peerDependencies` et `peerDependenciesMeta` dans `ui-mobile/package.json` avec flags `optional: true` pour toutes les bibliothèques Expo et communautaires (résolution définitive de P2-6).

---

## 5. RAPPEL DES CORRECTIFS P0 / P1 HISTORIQUES

| ID | Description | Statut |
|---|---|---|
| **P0-1** | `file-manager.ts` préserve l'arborescence des sous-dossiers (`liquid/`) | ✅ RÉSOLU |
| **P0-2** | Primitives `liquid/*` copiées automatiquement par `setupFoundations()` | ✅ RÉSOLU |
| **P0-3** | Déclaration complète et automatique de `requiresComponents` | ✅ RÉSOLU |
| **P0-4** | Détection automatique et injection d'`expoDependencies` (Liquid Glass) | ✅ RÉSOLU |
| **P0-5** | Inlining complet du moteur d'upload dans `lib/upload/` (plus de dépendance externe) | ✅ RÉSOLU |
| **P0-6** | Suppression du conflit `View`/`Text` dans le barrel UI (`ThemedView`/`ThemedText`) | ✅ RÉSOLU |
| **P0-7** | Résolution robuste des chemins (`paths.ts`) : mode PROD npm vs DEV workspace | ✅ RÉSOLU |
| **P1-1** | Suppression de tout appel `require()` en ESM dans le CLI | ✅ RÉSOLU |
| **P1-2** | Séparation claire entre primitives core et composants du starter | ✅ RÉSOLU |
| **P1-3** | Centralisation des chemins absolus du registry | ✅ RÉSOLU |
| **P1-4** | Élimination totale du type `any` dans `ambient.d.ts` et le code source | ✅ RÉSOLU |
| **P1-5** | Normalisation des imports relatifs internes | ✅ RÉSOLU |
| **P1-6** | Correction des drapeaux `nativeRebuildRequired` | ✅ RÉSOLU |

---

## 6. BILAN DES DETTES TECHNIQUES (P2)

| ID | Dette | Statut v0.2.0 |
|---|---|---|
| **P2-1** | Architecture Bun Workspaces à 2 packages | ✅ TERMINÉ |
| **P2-2** | Synchronisation automatique du Registry | ✅ TERMINÉ |
| **P2-3** | Pipeline CI/CD GitHub Actions | ✅ TERMINÉ |
| **P2-4** | Barrel racine et arbre de dépendances optimisé | ✅ MAINTENU (Tree-shakeable) |
| **P2-5** | Typings ambiants isolés | ✅ CONFORME (skipLibCheck compatible) |
| **P2-6** | Déclaration exhaustive de `peerDependenciesMeta` | ✅ **RÉSOLU v0.2.0** |
| **P2-7** | Vérification automatique des alias `tsconfig` | ✅ **RÉSOLU v0.2.0** (configuré à l'init) |
| **P2-8** | Unification des copies de fichiers foundations | ✅ STABLE |

---

## 7. MATRICE DE QUALITÉ & TESTS (QUALITY GATE)

La commande unique `bun run quality` orchestre la chaîne complète :
1. `validate-registry.ts` : 0 erreur sur les 61 composants.
2. `check-types` : TypeScript strict sans émission (`@rashwright/cli` et `@rashwright/ui-mobile`).
3. `test` : 55 tests unitaires Vitest avec rapport de couverture.
4. `build:cli` : Bundle ESM généré dans `dist/index.js` (174.96 KB).
5. `smoke:all` : Vérification de version dynamique (0.2.0), absence de `require()`, unicité du shebang et dépendance semver réelle.

**Résultat : 100% vert (exit code 0).**

---

## 8. RISQUES RÉSIDUELS & PRÉPARATION DE LA PUBLICATION
- **Ordre de publication npm** :
  1. Publier en premier `@rashwright/ui-mobile@0.3.0`.
  2. Patienter 2 à 5 minutes pour la propagation CDN de npm et unpkg.
  3. Publier `@rashwright/cli@0.3.0`.
- **Validation post-publication** :
  Tester `npx @rashwright/cli@0.3.0 init` dans un projet temporaire pour valider le téléchargement distant via CDN et la présence des skills.

---

## 9. RAPPORT TECHNIQUE DE LA VERSION v0.3.0

**Date** : 2026-10-08  
**Version** : `@rashwright/ui-mobile@0.3.0` & `@rashwright/cli@0.3.0`  
**Statut** : ✅ **100% Validé — 71 Tests Vitest (13 fichiers) — Quality Gate exit 0**

### 9.1 Synthèse des Réalisations v0.3.0

1. **Système de Skills IA Complet pour Agents de Code** :
   - Création de **61 fichiers `SKILL.md`** synchronisés pour l'intégralité des 61 composants du catalogue (`packages/ui-mobile/skills/<component>/SKILL.md`).
   - Format standardisé avec frontmatter YAML (`name`, `description`, `version: 0.3.0`, `componentVersion: 0.3.0`, `category`, `dependencies`, `supportsGlass`) et documentation Markdown (Purpose, Installation, Usage, Props API, Pièges fréquents).
   - Création du **Skill Global Rashwright UI** dans `skills/rs-ui/SKILL.md` (architecture, tokens, primitives Liquid Glass, règles de code ownership).
   - Création des **4 Skills modules core** : `liquid`, `upload`, `theme`, `cli`.
   - Intégration CLI dans `rs-ui init` : copie automatique de `skills/rs-ui/SKILL.md` et des starters.
   - Intégration CLI dans `rs-ui add <component>` : copie automatique de `skills/rs-ui/<component>/SKILL.md` avec support des flags `--skills` (activé par défaut) et `--no-skills`.
   - Intégration CLI dans `rs-ui remove` : nettoyage propre du Skill associé (`removeComponentSkill`).
   - Diagnostic dans `rs-ui doctor` : détection du skill global, décompte et synchronisation des versions des skills installés.

2. **Moteur de Thèmes Élargi & Custom Theme Engine** :
   - 3 nouveaux presets ajoutés :
     - `green` : Forest Green (`#16A34A` / `#22C55E`)
     - `red` : Crimson Red (`#DC2626` / `#EF4444`)
     - `cyan` : Cyber Cyan (`#0891B2` / `#00D9FF`)
   - Moteur de thème personnalisé dynamique dans `rs-ui init` :
     - Flags CLI : `--primary`, `--dark-primary`, `--secondary`, `--dark-secondary`, `--accent`, `--dark-accent`.
     - Assistant interactif à 2 étapes dans Inquirer : 4 couleurs obligatoires (light/dark pour primary et secondary), puis couleurs facultatives avec valeurs par défaut harmonisées.
     - Générateur dynamique `generateCustomTheme` créant `theme/themes/custom.ts`.
     - Enregistrement propre dans `rashwright-ui.json` (`themePreset: "custom"`, `customColors: { ... }`).

3. **Fonctionnalité `rs-ui reset` & alias `rs-ui-reset`** :
   - Commande dédiée `packages/cli/src/commands/reset.ts` avec options `--delete`, `--hard`, `--yes`, `--dry-run`.
   - Détection intelligente des artefacts de démo (`showcase-screen.tsx`, `rashwright-logo.tsx`, assets PNG/SVG, écrans d'entrée `app/index.tsx` ou `App.tsx`).
   - Mode sûr par défaut : archivage réversible dans `rs-ui-example/` préservant l'arborescence relative.
   - Suppression définitive explicite avec confirmation.
   - Génération automatique d'un écran d'accueil épuré exploitant `useTheme()`.
   - Mise à jour cohérente du lockfile `rashwright-ui.json` (`starter.reset = true`, `starter.archived = boolean`) sans perte d'historique.
   - Enregistrement du script npm `"reset-project": "rs-ui reset"` dans le `package.json` du projet.

4. **Correctifs & Résolution TypeScript TS5101** :
   - Correction de l'option `ignoreDeprecations: "5.0"` supportée par TypeScript 5.x (supprime l'avertissement de validation du compilateur).
   - Remplacement de `SafeAreaView` déprécié par `react-native-safe-area-context`.
   - Correction du chemin de chargement du logo vers `@/assets/primary.png`.

### 9.2 Métriques du Quality Gate v0.3.0

- **Tests Vitest** : 71 tests exécutés et réussis sur 13 fichiers de test (100% pass).
- **Validation Registre** : 61 composants vérifiés, 61 sources conformes, 0 erreur.
- **Vérification TypeScript** : 0 erreur sur `@rashwright/cli` et `@rashwright/ui-mobile`.
- **Bundle CLI** : 198.0 KB généré en 64ms (format ESM strict).
- **Vérifications fumée** : 4/4 réussies (`smoke:version`, `lint:require`, `lint:shebang`, `smoke:dep-ui`).
- **Dry-run npm** :
  - `@rashwright/ui-mobile@0.3.0` : 249 fichiers empaquetés (taille compressée : 821.6 kB).
  - `@rashwright/cli@0.3.0` : 3 fichiers empaquetés (taille compressée : 48.7 kB).

---

## 10. RAPPORT TECHNIQUE DE LA VERSION v0.4.0 (PROJECT STATE & RELIABILITY ENGINE)

**Date** : 2026-10-08  
**Version** : `@rashwright/ui-mobile@0.4.0` & `@rashwright/cli@0.4.0`  
**Statut** : ✅ **100% Validé — 90 Tests Vitest (18 fichiers) — Quality Gate exit 0**

### 10.1 Synthèse des Réalisations v0.4.0

1. **Lockfile d'État Réel (`rashwright-ui.lock`)** :
   - Schéma standardisé avec `lockfileVersion: 1`, horodatage ISO et cartographie détaillée de chaque composant installé.
   - Hash cryptographique SHA-256 normalisant les sauts de ligne CRLF/LF pour chaque fichier individuel.
   - Détection chirurgicale de l'intégrité : statuts `clean`, `modified`, `missing`, `untracked`.
   - Intégration automatique dans `rs-ui init`, `rs-ui add` (composants directs et dépendances transitives), `rs-ui remove` et audit en temps réel dans `rs-ui doctor`.

2. **Moteur de Backup & Restore (`rs-ui backup` / `restore`)** :
   - Module core `packages/cli/src/core/backup-manager.ts` opérant dans `.rashwright/backups/<timestamp>/`.
   - Snapshots horodatés complets contenant `rashwright-ui.json`, `rashwright-ui.lock`, les fichiers composants et un `meta.json`.
   - Commandes `rs-ui backup [label]` et `rs-ui restore [id] [--latest]`.
   - Déclenchement automatique de snapshots de sécurité avant toute opération destructive ou sensible (`rs-ui update`, `rs-ui remove`, `rs-ui reset --delete`).

3. **Smart Update Avancé (`rs-ui update`)** :
   - Mode audit non-destructif `rs-ui update --check` affichant l'état des composants vs registre sans altérer aucun fichier.
   - Mode interactif `rs-ui update -i / --interactive` avec sélection précise et volume de changements (+/- lignes).
   - Protection contre l'écrasement des fichiers modifiés localement par le développeur avec prompt de confirmation.
   - Option `--diff` affichant les lignes modifiées avant validation.
   - Réinstallation automatique synchronisée des dépendances natives Expo (`expoDependencies`).

4. **Inspecteur 360° & Graphe de Dépendances (`rs-ui info`, `deps`, `why`)** :
   - `rs-ui info <composant>` enrichi avec vision 360° : version installée vs registre, intégrité locale, présence du Skill IA et compatibilité Expo.
   - Commande `rs-ui deps <composant>` générant l'arbre arborescent ASCII des dépendances directes, transitives et Expo.
   - Commande `rs-ui why <target>` offrant l'analyse inverse pour identifier quel composant requiert un paquet ou sous-composant.

### 10.2 Métriques du Quality Gate v0.4.0

- **Tests Vitest** : 90 tests exécutés et réussis sur 18 fichiers de test (100% pass).
- **Validation Registre** : 61 composants vérifiés, 61 sources conformes, 0 erreur.
- **Vérification TypeScript** : 0 erreur sur `@rashwright/cli` et `@rashwright/ui-mobile`.
- **Bundle CLI** : 226.92 KB généré en 86ms (format ESM strict).
- **Vérifications fumée** : 4/4 réussies (`smoke:version`, `lint:require`, `lint:shebang`, `smoke:dep-ui`).
- **Dry-run npm** :
  - `@rashwright/ui-mobile@0.4.0` : 249 fichiers empaquetés (taille compressée : 821.8 kB).
  - `@rashwright/cli@0.4.0` : 3 fichiers empaquetés (taille compressée : 55.3 kB).

---

## 11. RAPPORT TECHNIQUE DE LA VERSION v0.5.0 (MIGRATIONS, EXTENSIBILITY & MULTI-VERSION)

**Date** : 2026-10-08  
**Version** : `@rashwright/ui-mobile@0.5.0` & `@rashwright/cli@0.5.0`  
**Statut** : ✅ **100% Validé — 107 Tests Vitest (23 fichiers) — Quality Gate exit 0**

### 11.1 Synthèse des Réalisations v0.5.0

1. **Moteur de Migrations Système (`rs-ui migrate`)** :
   - Module d'orchestration séquentiel `packages/cli/src/core/migration-runner.ts`.
   - Scripts de migration : `0.3.0-to-0.4.0` (création du lockfile rétroactif, structure starter) et `0.4.0-to-0.5.0` (support project components, skills metadata).
   - Commande CLI `rs-ui migrate` avec modes `--check`, `--dry-run` et snapshot de sécurité automatique avant exécution.

2. **Composants Projet Personnalisés (`rs-ui create component <nom>`)** :
   - Scaffolding automatisé de composants TSX conformes aux tokens et primitives Glass (`toPascalCase`, styles normalisés).
   - Génération instantanée et synchronisée du fichier de documentation IA `skills/rs-ui/<nom>/SKILL.md`.
   - Enregistrement sous `projectComponents` dans `rashwright-ui.json` et scellement dans `rashwright-ui.lock`.

3. **Registry Multi-Versions (`rs-ui add <nom>@<ver>`)** :
   - Support de la syntaxe de version explicite dans le CLI (`rs-ui add button@0.3.0`).
   - Flag `rs-ui list --versions <composant>` pour inspecter les versions disponibles et installées.

4. **Gestion Décorrélée des Compétences IA (`rs-ui skill`)** :
   - Commande `rs-ui skill list` avec diagnostic de synchronisation des skills.
   - Commande `rs-ui skill update [nom] [--all]` permettant de rafraîchir les fichiers `SKILL.md` sans modifier le code source du projet.

5. **Workspace & Monorepo Awareness** :
   - Détection fine des monorepos Bun (`bun.lock`), pnpm (`pnpm-workspace.yaml`), Yarn et npm dans `project-detector.ts`.

### 11.2 Métriques du Quality Gate v0.5.0

- **Tests Vitest** : 107 tests exécutés et réussis sur 23 fichiers de test (100% pass).
- **Validation Registre** : 61 composants vérifiés, 61 sources conformes, 0 erreur.
- **Vérification TypeScript** : 0 erreur sur `@rashwright/cli` et `@rashwright/ui-mobile`.
- **Bundle CLI** : 246.00 KB généré en 51ms (format ESM strict).
- **Vérifications fumée** : 4/4 réussies (`smoke:version`, `lint:require`, `lint:shebang`, `smoke:dep-ui`).
- **Dry-run npm** :
  - `@rashwright/ui-mobile@0.5.0` : 249 fichiers empaquetés (taille compressée : 821.8 kB).
  - `@rashwright/cli@0.5.0` : 3 fichiers empaquetés (taille compressée : 59.3 kB).

---

**Le projet Rashwright UI Mobile v0.5.0 est entièrement développé, validé et prêt pour publication.**

