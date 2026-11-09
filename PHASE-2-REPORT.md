# PHASE 2 — Rapport des fondations de premier ordre

**Date :** 2026-11-08
**Statut :** terminé — quality gate vert, **11/11 scénarios E2E réels verts**.
**Périmètre :** `packages/cli` (moteur d'installation), `registry/foundations/*`,
documentation du registre. Aucun composant publié, aucune version bumpée.

---

## 1. Objectif

Rendre installables les fichiers socle dont dépendent la quasi-totalité des
composants, sans casser les projets existants :

- décrire les fondations par des **manifestes versionnés** plutôt que par une
  liste codée en dur ;
- les intégrer au **graphe de résolution** (`foundation:` / `core:`) ;
- copier réellement leurs fichiers, leurs **assets** et leurs dépendances
  npm/Expo ;
- détecter les états `missing` / `partial` / `modified` et ne réparer que sur
  demande explicite (`--repair` / `--force`) ;
- vérifier le résultat **sur disque**, pas seulement via le lockfile.

---

## 2. Fichiers ajoutés / réécrits

| Fichier | Rôle |
|---|---|
| `packages/ui-mobile/registry/foundations/{theme,glass,core-ui,liquid,responsive,upload,tab-bar}.json` | 7 manifestes source de vérité : `files`, deps réelles, fondations requises, assets |
| `packages/cli/src/core/foundations-manager.ts` | **Nouveau** : `planFoundation(s)`, `applyFoundationPlan(s)`, états, routage, assets, `needsRepair` |
| `packages/cli/src/core/dependency-resolver.ts` | Graphe `component:`/`foundation:`, BFS + tri topologique, cycles, diagnostics, `optionalExpoDependencies`, normalisation npm |
| `packages/cli/src/core/file-manager.ts` | Destinations, `copyArtefactFiles`, copie d'assets, réécriture des `require()` d'assets |
| `packages/cli/src/core/lock-manager.ts` | `LockedFoundation`, `recordLockedFoundation`, `checkFoundationIntegrity` |
| `packages/cli/src/core/remote-registry.ts` | `ensureFoundationDownloaded` (manifeste + fichiers + assets) |
| `packages/cli/src/core/starter-generator.ts` | `generateUiIndex` conditionnel, `setupFoundations` non destructif |
| `packages/cli/src/core/templates-registry.ts` / `widgets-registry.ts` | `requiresFoundations`, `assets` |
| `packages/cli/src/commands/add.ts` | Réécrit : `--repair`, plan complet avant écriture, remote, assets, lockfile réel, échecs explicites |
| `packages/cli/src/commands/doctor.ts` | Fichier déclaré manquant = `error` + code de sortie non nul (y compris `--json`) |
| `packages/cli/src/commands/init.ts` | `--dry-run` n'écrit plus `rashwright-ui.json` |
| `packages/cli/src/core/transformers/import-transformer.ts` | Préserve le segment `ui` quand l'alias pointe le dossier parent |
| `scripts/cli-lint-require.mjs` | Lint ESM conscient des commentaires/chaînes, analyse des `${...}` |
| `packages/cli/tests/foundations-manager.test.ts` | **Nouveau** : 8 tests plan/apply/états/assets |
| `packages/cli/tests/e2e/install.e2e.ts` | 11 scénarios réels sur fixtures temporaires |

---

## 3. Décisions techniques appliquées

1. **Manifestes = source de vérité.** `sync-registry` recalcule les dépendances
   depuis les imports réels ; `validate-registry` refuse tout écart entre
   manifeste, fichiers et imports.
2. **Graphe unifié.** Un composant qui importe `@/contexts/theme-context` tire
   `foundation:theme` ; `./liquid/*` tire `foundation:liquid` ; `text`/`view`
   tirent `foundation:core-ui`. Les cycles et dépendances manquantes sont des
   **diagnostics bloquants**, jamais ignorés.
3. **Assets de composants.** Les assets déclarés sont copiés vers `assets/`, et
   les `require()` relatifs sont réécrits vers le chemin installé
   (cas vérifié : `rashwright-logo`).
4. **Dépendances Expo optionnelles réellement installées.** `expo-haptics` est
   importé statiquement par `liquid-pressable.tsx` : il est donc traité comme
   requis, pas comme un fallback silencieux.
5. **Routage des fondations.** `components/ui/*` → `componentsPath` ;
   `assets/*` → `assets/` racine ; le reste → `src/` si le projet utilise
   `src/`, sinon racine.
6. **Non destructif par défaut.** Un fichier de fondation modifié n'est pas
   écrasé sans `--repair`/`--force` ; il n'est pas enregistré comme intact dans
   le lockfile.
7. **Registre distant.** En mode remote, `add` télécharge manifestes, fichiers,
   assets et matrices **avant** de résoudre, puis échoue explicitement si le
   plan reste incomplet.
8. **Normalisation npm.** `zustand/middleware` → `zustand`,
   `@scope/pkg/sub` → `@scope/pkg`, dans l'analyse du registre comme dans le
   résolveur.

---

## 4. Bugs réels révélés par les E2E (et corrigés)

Les scénarios Phase 0 ont d'abord échoué pour quatre raisons distinctes, toutes
corrigées à la racine :

| # | Symptôme | Cause | Correction |
|---|---|---|---|
| 1 | `add -t minimal` : imports `@/components/{button,card,rashwright-logo}` non résolus | Le transformeur retirait `ui` (`components/ui/x` → `@/components/x`) alors que l'alias désigne le dossier parent | `ui` préservé sauf si l'alias cible déjà `/ui` |
| 2 | `add -w metric` : imports `@/components/{card,badge,skeleton,text}` non résolus | Même cause que #1, via le widget | Même correction + test dédié |
| 3 | `doctor` : exit 0 malgré un composant déclaré absent | Intégrité manquante classée `warn` | `error` + `process.exitCode = 1`, y compris en JSON |
| 4 | `init --dry-run` : `rashwright-ui.json` écrit | Écriture de config inconditionnelle | Écriture sautée en dry-run |

---

## 5. Résultats réels

### 5.1 Quality gate

`bun run quality` → **exit 0**.

| Étape | Résultat |
|---|---|
| `validate-registry` | 79 composants, **7 fondations**, 10 templates, 6 widgets, 5 hooks, 2 libs — **0 erreur, 0 avertissement** |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **53 fichiers / 268 tests** |
| `build:cli` | exit 0 |
| `smoke:all` | version 1.6.0, ESM strict, shebang, dépendance workspace OK |

`bun run sync-registry` → `0 fichier(s) modifié(s), 110 inchangé(s)` (103
artefacts existants + 7 fondations), donc **idempotent**.

### 5.2 E2E d'installation réels — 11/11

Commande : `bun run test:install-e2e` → **1 fichier / 11 tests passés**.

| Scénario | Vérification réelle |
|---|---|
| `add button` (projet vierge) | `button.tsx`, fondations, deps ; **0 import non résolu** |
| `add button` (projet existant sans `src/`) | Installation à la racine, **0 import non résolu** |
| `add button` (alias `~/*`) | Imports réécrits vers l'alias, cibles présentes |
| `add -t minimal` | Template + composants + fondations + `safe-area-context` |
| `add -w metric` | Widget + composants + fondations + `@expo/vector-icons` |
| `add --dry-run` | **Snapshot identique** : aucun fichier créé/modifié |
| Conflit composant modifié | Sans `--force` : exit non nul + fichier intact ; avec `--force` : restauré |
| Fondation modifiée | Sans `--repair` : non écrasée + avertissement ; avec `--repair` : restaurée |
| `doctor` (fichier manquant) | `error`, exit non nul, JSON valide |
| `init --dry-run` | Aucun fichier modifié |
| Registre distant index-only | Manifeste + fichiers téléchargés **avant** résolution |

Le harnais vérifie le disque et l'analyse d'imports (relatifs, alias tsconfig,
packages externes), indépendamment du lockfile. Les fixtures sont créées sous
`%TEMP%`, jamais dans `test-project/`.

---

## 6. Contenu des fondations

| Fondation | Fichiers | Dépendances |
|---|---|---|
| `theme` | `constants/theme.ts`, `stores/theme-store.ts`, `contexts/theme-context.tsx`, 9 presets (`default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`) | `zustand` |
| `glass` | `constants/glass-theme.ts`, `theme/themes/glass.ts` | `theme` |
| `core-ui` | `components/ui/text.tsx`, `view.tsx` | `react-native-reanimated` ; `responsive`, `theme` |
| `liquid` | 8 fichiers `liquid/*` | `expo-blur`, `expo-linear-gradient`, `react-native-reanimated`, `expo-haptics` ; `glass`, `theme` |
| `responsive` | `lib/responsive.ts`, `hooks/use-responsive.ts` | — |
| `upload` | 9 fichiers `lib/upload/*` | — |
| `tab-bar` | `contexts/tab-bar-context.tsx` | `react-native-reanimated` |

`theme/index.ts` et `theme/tokens/*` sont volontairement exclus de `theme`
(cycle avec `glass`) ; `glass` porte `theme/themes/glass.ts` et `theme` les 9
autres presets.

---

## 7. Limites assumées / reportées

- **Installation npm réelle non exécutée dans les E2E** : les fixtures utilisent
  des shims `npm`/`npx` déterministes (aucun réseau) et le typecheck est
  explicitement `skipped` quand `node_modules` est absent. La validation sur un
  **vrai projet Expo** reste suspendue tant que `test-project/` n'est pas
  entièrement supprimé.
- **Matrices Expo distantes** : `ensureCompatibilityMatrixDownloaded` peut encore
  ignorer une erreur de téléchargement ; `add` s'appuie alors sur
  `unversionedExpoDeps` pour avertir sans inventer de version. Le durcissement
  complet appartient à la Phase 5.
- **Registre distant partiel** : `ensureComponentDownloaded` renvoie `null` en
  cas d'échec de manifeste ; `add` vérifie ce cas et échoue, mais certains
  échecs de fichiers sont encore signalés en aval.
- **`--repair` restaure les fondations modifiées** : c'est une réparation
  explicite demandée par l'utilisateur, pas un écrasement silencieux. Sans
  `--repair`/`--force`, le fichier reste intact.
- **Aucun commit, push, tag, publication npm ou bump de version.**

---

## 8. Critères de sortie de la Phase 2

- [x] `rs-ui add button` dans un projet vierge installe `button.tsx` **et** toutes
      les fondations requises.
- [x] Aucun import `@/contexts/theme-context`, `@/constants/glass-theme`,
      `./text`, `./view`, `./liquid/*` n'est non résolu après installation.
- [x] Les fondations ne sont copiées qu'une fois (idempotence vérifiée).
- [x] Un projet `init` existant n'est pas cassé si les fondations ont été
      personnalisées (non destructif par défaut).
- [x] Sans `--repair`, une configuration désynchronisée produit un diagnostic
      explicite, jamais un faux succès.
- [x] Avec `--repair`, les fichiers manquants sont restaurés et les fichiers
      modifiés ne sont écrasés que sur demande explicite.
- [x] `bun run quality` et `bun run test:install-e2e` sont verts.
- [x] `sync-registry` est idempotent.

---

## 9. Prochaine étape

Revue **R3**. Après validation seulement : Phase 3 — moteur de résolution de
dépendances (graphe complet, plan inspectable, aucun fallback silencieux,
téléchargement avant résolution).
