# PHASE 7 — Rapport du cycle de vie des artefacts

**Date :** 2026-11-09
**Statut :** terminé — quality gate vert, **323 tests unitaires**, **24/24 scénarios
E2E**, cycle de vie multi-types vérifié sur disque.
**Périmètre :** `update`, `remove`, `doctor`, `info`, `why`, fondations/hooks/libs/
templates/widgets, dépendances inverses, cohérence config ↔ lockfile ↔ disque.
Aucun commit, tag, publication ou bump de version.

---

## 1. Objectif

Les commandes de cycle de vie ne connaissaient que les composants et faisaient
confiance au lockfile. Elles pouvaient :

- supprimer un fichier local en ignorant qu'un template installé en dépendait ;
- afficher « Intact » alors qu'un import local était cassé ;
- considérer comme OK un artefact `untracked` (présent sur disque, absent du
  lockfile) ;
- comparer `update` à la seule `version` du manifeste, en oubliant
  `registryVersion` ;
- échouer silencieusement lors d'une installation `expo install` ratée.

La Phase 7 fait du **lockfile la source de vérité**, étend le cycle de vie à tous
les types d'artefacts et vérifie l'installation réelle, pas seulement les hashes.

---

## 2. Modèle unifié : types et manifestes

Nouveau module central `packages/cli/src/core/artefacts.ts` :

| Fonction | Rôle |
|---|---|
| `parseArtefactRef` | préfixes `foundation:`/`core:`, `component:`/`ui:`, `hook:`, `lib:`, `template:`, `widget:` |
| `loadArtefact` / `loadAllArtefacts` | lecture unifiée des manifestes, sans invention |
| `getInstalledArtefacts` | état réel depuis le lockfile (composants, fondations, hooks, libs, templates, widgets) |
| `checkArtefactIntegrity` | `clean` / `modified` / `missing` / `untracked` par artefact |
| `buildArtefactGraph` | graphe direct + inverse, sans doublon |
| `findReverseDependents` | dépendants directs et transitifs |
| `findExpoDependents` | artefacts déclarant un paquet Expo |
| `computeArtefactInstallPath` | chemins réels des templates/widgets |
| `artefactKey` | clé stable `type:id` |

**Résolution du type réel.** Un hook/lib est stocké dans `lock.components`. Son
type est lu depuis son manifeste ; s'il est absent, l'entrée reste un composant
verrouillé — aucune requalification silencieuse.

**Cibles sans manifeste.** `text` et `view` sont fournis par la fondation
`core-ui` et n'ont pas de manifeste autonome. Le graphe inverse les référence
quand même : `why text` et `remove text` les traitent correctement.

---

## 3. Fichiers ajoutés / modifiés

| Fichier | Changement |
|---|---|
| `packages/cli/src/core/artefacts.ts` | **Nouveau.** Modèle multi-types, graphe, intégrité, dépendances inverses, dépendants Expo |
| `packages/cli/src/core/config-manager.ts` | `ComponentLockInfo.registryVersion?`, `markComponentInstalled(..., registryVersion?)`, `getInstalledRegistryVersion` |
| `packages/cli/src/core/lock-manager.ts` | `registryVersion?` sur les 4 types de records, propagé dans `recordLocked*` |
| `packages/cli/src/core/templates-registry.ts` | `registryVersion` dans l'interface et la lecture JSON |
| `packages/cli/src/core/widgets-registry.ts` | `registryVersion` dans l'interface et la lecture JSON |
| `packages/cli/src/core/post-install-verifier.ts` | Helpers exportés + `checkImports(projectRoot, files)` |
| `packages/cli/src/core/skills-manager.ts` | `removeWidgetSkill` (symétrie de `copyWidgetSkill`) |
| `packages/cli/src/commands/remove.ts` | `removeArtefact` multi-types, dépendants, modifications, backup, prune, lock/config/index/skills |
| `packages/cli/src/commands/update.ts` | Smart Update multi-types, `registryVersion`, diff, réparation, npm/Expo, exit non nul |
| `packages/cli/src/commands/doctor.ts` | Lockfile source de vérité, intégrité tous types, `untracked` = erreur, imports, deps Expo/npm, matrice SDK |
| `packages/cli/src/commands/info.ts` | Inspecteur 360° multi-types, intégrité + imports, JSON enrichi |
| `packages/cli/src/commands/why.ts` | Graphe inverse direct + transitif, paquets Expo, cibles sans manifeste |
| `packages/cli/src/commands/template.ts` / `widget.ts` | Sous-commande `remove` déléguée à `removeArtefact` |
| `packages/cli/src/commands/add.ts` | `registryVersion` propagé dans les 4 records et `markComponentInstalled` |
| `packages/cli/src/commands/init.ts` | Versions starter lues depuis les manifestes ; écrans proxy locaux non verrouillés ; `registryVersion` propagé |
| `packages/cli/tests/artefacts.test.ts` | **Nouveau.** 18 tests multi-types / graphe / chemins |
| `packages/cli/tests/e2e/install.e2e.ts` | **24 scénarios** dont 10 Phase 7 |
| `packages/cli/tests/info.test.ts` | Argument `component` conservé, description « 360° » |

Aucun composant, template, widget, hook, lib ou fondation n'a été modifié.

---

## 4. Corrections réelles

| # | Problème | Correction |
|---|---|---|
| 1 | `remove` ne connaissait que les composants | Types `foundation`, `hook`, `lib`, `template`, `widget` supportés |
| 2 | Suppression possible d'un composant requis par un template | Dépendants inverses calculés ; refus sans `--force` |
| 3 | `remove text` renvoyait « non installé » alors que le template en dépend | Contrôle des dépendants **avant** le contrôle d'installation |
| 4 | Suppression d'un fichier modifié sans confirmation | Refus explicite sauf `--force`, avec liste des fichiers |
| 5 | Chemins de suppression codés en dur | `config.componentsPath`, `installPath` du lockfile, sinon manifeste |
| 6 | `template remove` / `widget remove` ne synchronisaient pas le lock | Délégation à `removeArtefact` (lock + config + index + skills) |
| 7 | `update` ignorait `registryVersion` | Version d'artefact **et** version de registre comparées |
| 8 | `update` ne distinguait pas hash et installation fonctionnelle | Intégrité + fichiers manquants + réparation (`missing`/`untracked`) |
| 9 | Échec `expo install` / `npm install` masqué | Exit non nul et message explicite |
| 10 | `doctor` comptait `untracked` comme OK | `untracked` = erreur, code de sortie non nul |
| 11 | `doctor` ne vérifiait que les hashes | Vérifie aussi l'existence des fichiers, les imports et les dépendances requises |
| 12 | `info` affichait « Intact » avec un import cassé | Affiche « Hash intact, mais N import(s) non résolu(s) » |
| 13 | `why` ne parcourait que les composants | Graphe direct + inverse multi-types, transitivité, paquets Expo |
| 14 | `init` inventait `"1.0.0"` / `"0.3.0"` | Versions lues depuis les manifestes ; écrans proxy locaux non enregistrés |
| 15 | `init` ne propageait pas `registryVersion` | Propagé dans config, lock et template |

---

## 5. Comportements vérifiés sur la vraie CLI

Scénarios E2E exécutés dans des fixtures isolées (`HOME`/`USERPROFILE` dédiés,
shims npm/npx déterministes, sans réseau réel) :

| Scénario | Résultat réel |
|---|---|
| `remove button` après `add button` | exit 0 — fichier, lock et config retirés |
| `remove card` avec `template:minimal` installé | **exit ≠ 0** — « card est requis par template:minimal » |
| `remove card --force` | exit 0 — suppression malgré le dépendant |
| `remove button` après modification locale | **exit ≠ 0** — `--force` requis |
| `remove button --force` (modifié) | exit 0 — fichier supprimé |
| `remove text` avec `template:minimal` | **exit ≠ 0** — « text est requis par template:minimal », fichier conservé |
| `update button --check` (registre 1.5.0 dans le lock) | exit 0 — affiche `registre 1.5.0 → 1.6.0` |
| `update button --yes` | exit 0 — lock et config repassent à `registryVersion: 1.6.0` |
| `info template:minimal --json` | exit 0 — `type: "template"`, `registryVersion: "1.6.0"`, `integrityStatus: "clean"`, 0 issue d'import |
| `info button` avec import cassé et hash aligné | n'affiche **pas** « Intact », affiche l'import non résolu |
| `doctor --json` avec fichier manquant | **exit ≠ 0**, contrôle d'intégrité en `error` |
| `doctor --json` avec import cassé | **exit ≠ 0**, contrôle `Imports:` en `error` |
| `why card` | exit 0 — dépendants directs + état installé |
| `why text` | exit 0 — dépendants directs et transitifs, dont `template:minimal` |
| `why expo-blur` | exit 0 — paquet Expo requis par `button` |
| `remove` puis `add` du même composant | exit 0 — contenu, hash, version et `registryVersion` identiques |

---

## 6. Tests et qualité

### 6.1 Tests unitaires

`bun run --filter @rashwright/cli test`
→ **58 fichiers / 323 tests verts** (307 → 323).

`tests/artefacts.test.ts` couvre : parsing des préfixes, chargement des six
types, absence de manifeste, graphe direct/inverse, transitivité, dépendants
Expo, chemins templates/widgets.

### 6.2 Scénarios E2E

`bun run --filter @rashwright/cli test:install-e2e`
→ **24/24 verts** (14 → 24). Les 10 scénarios ajoutés couvrent `remove`
(composant, dépendant, modifié, `text`), `update` (`registryVersion`),
`info`, `why`, `doctor` (import cassé) et le round-trip suppression/réinstallation.

### 6.3 Quality gate

`bun run quality` → **exit 0**.

| Étape | Résultat |
|---|---|
| `validate-registry` | 79 composants, 7 fondations, 10 templates, 6 widgets, 5 hooks, 2 libs — 0 erreur, 0 avertissement |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **58 fichiers / 323 tests** |
| `build:cli` | 97 modules, exit 0 |
| `smoke:all` | exit 0 (version, `require`, shebang, dépendance UI) |

### 6.4 Vérifications complémentaires

| Commande | Résultat |
|---|---|
| `bun run sync-registry` | `0 fichier(s) modifié(s), 110 inchangé(s)` |
| `bun install --frozen-lockfile` | `Checked 860 installs across 884 packages (no changes)` |

---

## 7. Limites assumées

- **`remove` d'une cible sans manifeste ni lockfile** (ex. `text` seul) ne peut
  supprimer un fichier autonome : la commande refuse quand un dépendant
  installé l'utilise, et signale explicitement l'absence de fichier suivi.
- **`why` sur un paquet Expo** dépend des manifestes du registre local ; un
  paquet installé manuellement mais non déclaré n'apparaît pas.
- **`update` ne réinstalle pas les dépendants** : il met à jour l'artefact ciblé
  et ses dépendances npm/Expo. Les dépendants restent compatibles tant que les
  manifestes ne changent pas de contrat.
- **Les hooks/libs restent dans `lock.components`** pour la rétrocompatibilité ;
  leur type réel est résolu via le manifeste.
- **La validation finale sur un vrai projet Expo vierge + existant reste
  suspendue** : `test-project/` est encore suivi par git (119 fichiers). Ne pas
  y toucher.
- **`bun run dry-run` (publication) reste hors gate** : il échoue à cause de la
  version déjà publiée, indépendamment de la Phase 7.

---

## 8. Critères de sortie de la Phase 7

- [x] `doctor` échoue sur un projet aux imports cassés
      (scénario `doctor-broken-import`).
- [x] `info button` n'affiche plus « Intact » si un import est absent
      (hash aligné, import non résolu → message explicite).
- [x] `init --dry-run` ne modifie aucun fichier (snapshot E2E, dossiers inclus).
- [x] `remove text` refuse si `minimal-template` en dépend
      (scénario `remove-text-dependent`).
- [x] Suppression puis réinstallation → état identique
      (scénario `roundtrip-remove-add` : contenu, hash, version,
      `registryVersion`).
- [x] `why <composant>` explique les dépendances directes et inverses
      (scénario `why-graph`, `text` inclus).

---

## 9. Prochaine étape

Revue **R8**. Après validation seulement : Phase 8 — documentation et quality
gate de sortie (`smoke:all` d'installation réel, `test:install-e2e` bloquant,
`--dry-run` local prouvé, docs alignées sur le code).
