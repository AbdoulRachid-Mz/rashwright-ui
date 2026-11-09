# PHASE 4 — Rapport du moteur d'installation et de la vérification

**Date :** 2026-11-08
**Statut :** terminé — quality gate vert, **14/14 scénarios E2E réels verts**.
**Périmètre :** installation transactionnelle de `add`, vérificateur indépendant
du lockfile, cohérence config/lockfile/disque, messages finaux conditionnels.
Aucun commit, tag, publication ou bump de version.

---

## 1. Objectif

Garantir que le succès affiché par `rs-ui add` correspond réellement au disque :

- prendre un instantané des destinations **avant** la première écriture ;
- restaurer l'état local en cas d'échec au milieu de l'installation ;
- vérifier l'installation par autre chose que le lockfile (fichiers, assets,
  imports relatifs et alias, packages, config, hashes) ;
- ne jamais afficher « Installation terminée » si la vérification échoue ;
- distinguer explicitement ce qui est annulable localement de ce qui ne l'est
  pas (npm / Expo).

---

## 2. Fichiers ajoutés / modifiés

| Fichier | Changement |
|---|---|
| `packages/cli/src/core/installation-transaction.ts` | **Nouveau.** Instantanés, `track`/`trackAll`, `recordExternal`, `rollback` inverse, rapport `restored`/`removed`/`failed` |
| `packages/cli/src/core/post-install-verifier.ts` | **Nouveau.** `verifyInstallation`, `deriveAliasPrefixes`, rapport structuré `ok`/`issues`/`typescript` |
| `packages/cli/src/commands/add.ts` | Création de la transaction avant écriture, suivi de **toutes** les destinations, rollback sur chaque échec post-écriture, vérification finale, messages conditionnels, dry-run explicite |
| `packages/cli/src/core/starter-generator.ts` | `updateTsconfig(..., aliasPrefixes)` ajoute les `paths` réellement utilisés par la transformation d'imports |
| `packages/cli/tests/installation-transaction.test.ts` | **Nouveau.** 5 tests (restauration, suppression, idempotence, opérations externes, dossier refusé) |
| `packages/cli/tests/post-install-verifier.test.ts` | **Nouveau.** 12 tests (fichier/asset absent, import relatif/alias, package manquant, pairs implicites, lockfile illisible, chemin de hook, config désynchronisée, TypeScript ignoré sans `node_modules`) |
| `packages/cli/tests/e2e/install.e2e.ts` | +1 scénario de rollback réel via un composant distant `broken-import` ; assertions lockfile du hook et dry-run renforcées |

---

## 3. Décisions techniques appliquées

1. **Transaction locale, pas globale.** Le CLI ne prétend pas annuler npm/Expo.
   `InstallationTransaction` restaure les fichiers, assets, skills, routes,
   `rashwright-ui.json`, `rashwright-ui.lock`, `tsconfig.json` et `index.ts`
   qu'il a suivis ; les installations npm/Expo sont enregistrées via
   `recordExternal` et listées comme **non annulables**.
2. **Instantané avant écriture.** `track` est idempotent (le premier instantané
   gagne) et refuse un chemin qui existe en tant que dossier : aucune ambiguïté
   silencieuse.
3. **Rollback inverse et non silencieux.** Chaque anomalie est rapportée avec
   `restored`, `removed` ou `failed` + raison. Un échec de rollback est affiché
   en rouge et le CLI conserve un exit code non nul.
4. **Aucun `process.exit(1)` après la première écriture.** Les seuls
   `process.exit(1)` restants dans `add.ts` sont les validations **avant**
   transaction (projet, options, résolution, manifestes, sources, deps natives).
   Tous les échecs post-écriture passent par `rollbackAndFail`.
5. **Vérification indépendante du lockfile.** `verifyInstallation` contrôle :
   - existence des fichiers et assets de chaque cible ;
   - résolution des imports relatifs, des alias projet et de `tsconfig.paths` ;
   - présence des packages importés dans `package.json` (`react` et
     `react-native` restent des pairs implicites, jamais exigés) ;
   - alias déclarés dans `rashwright-ui.json` ;
   - composants/fondations/templates/widgets déclarés mais absents ;
   - chemins de hooks/libs (pas de `components/ui/hooks/...`) ;
   - hashes du lockfile quand il existe ;
   - compilation TypeScript du projet cible **si** `tsc` et `node_modules` sont
     réellement disponibles ; sinon `skipped` avec raison explicite.
6. **Lockfile illisible ≠ lockfile absent.** Le vérificateur distingue les deux
   via `existsSync(getLockfilePath())` et émet `lockfile-invalid`.
7. **Message final conditionnel.** `✔ Installation terminée` n'est affiché
   qu'après vérification `ok`. Un conflit demandé produit
   `✖ Installation incomplète` + exit 1, sans rollback des fichiers déjà
   installés (les modifications locales de l'utilisateur sont préservées).
8. **Chemins « déjà installé » vérifiés aussi.** Quand il n'y a rien à écrire,
   le CLI vérifie le disque avant d'annoncer « déjà installé » ; une
   incohérence produit exit 1 et renvoie vers `doctor`.
9. **Dry-run réellement sans écriture.** Aucune transaction n'est créée, aucun
   fichier/lock/config n'est écrit, aucun hook n'est exécuté ; le message est
   `Simulation terminée (dry-run)` et ne contient jamais « Installation
   terminée ».
10. **Hook `post-add` après vérification.** Il ne s'exécute plus avant la
    vérification ; son exécution ne peut donc pas masquer un disque incohérent.

---

## 4. Problèmes réels corrigés

| # | Problème | Correction |
|---|---|---|
| 1 | Un échec au milieu des copies laissait un projet à moitié installé | Transaction + rollback inverse des destinations suivies |
| 2 | Un composant pouvait être marqué installé malgré un fichier en échec | Le marquage n'intervient qu'après copies réussies ; vérification finale |
| 3 | Le succès reposait sur le lockfile, pas sur le disque | Vérificateur indépendant, hashes et existence réels |
| 4 | Un import non résolu pouvait coexister avec « Installation terminée » | `verification.ok === false` → rollback + exit 1 |
| 5 | Les opérations npm/Expo étaient implicitement présentées comme annulées | `recordExternal` + liste explicite des opérations non annulables |
| 6 | Un lockfile de hook pointait sous `components/ui/hooks` | Chemins de hooks/libs vérifiés (`lockfile-bad-path`) |
| 7 | `add` sur un état déjà installé pouvait annoncer un faux succès | Vérification du disque dans le chemin « déjà installé » |
| 8 | Un conflit demandé sortait avec un message de réussite | `✖ Installation incomplète` + exit 1 |
| 9 | `--alias` n'était pas reflété dans `tsconfig.paths` | `deriveAliasPrefixes` + `updateTsconfig(..., aliasPrefixes)` |
| 10 | Le hook `post-add` s'exécutait avant la vérification | Déplacé après vérification réussie |

---

## 5. Résultats réels

### 5.1 Quality gate

`bun run quality` → **exit 0**.

| Étape | Résultat |
|---|---|
| `validate-registry` | 79 composants, 7 fondations, 10 templates, 6 widgets, 5 hooks, 2 libs — 0 erreur, 0 avertissement |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **55 fichiers / 291 tests** (274 → 291) |
| `build:cli` | exit 0 |
| `smoke:all` | exit 0 |

Vérifications complémentaires :

- `bun run sync-registry` → `0 fichier(s) modifié(s), 110 inchangé(s)` ;
- `bun install --frozen-lockfile` → `Checked 860 installs across 884 packages (no changes)`.

### 5.2 E2E d'installation — 14/14

| Scénario | Vérification |
|---|---|
| `add button` vierge | fondations + composant, 0 import non résolu |
| `add button` sans `src/` | destinations réelles |
| `add button` alias `~/*` | alias respecté partout |
| `add -t minimal` | template, composants, fondations, `safe-area-context` |
| `add -w metric` | widget, composants, fondations, deps Expo |
| `add --dry-run` | snapshot identique, message dry-run, pas de « Installation terminée » |
| conflit composant | `--force` explicite |
| fondation modifiée | `--repair` explicite |
| `doctor` fichier manquant | `error` + exit non nul |
| `init --dry-run` | aucun fichier |
| registre distant index-only | manifeste + fichiers téléchargés avant résolution |
| registre distant fichier manquant | exit ≠ 0, nom du fichier, rien d'installé |
| registre distant matrice absente | avertissement + blocage natif critique |
| **vérification en échec (`broken-import`)** | **exit ≠ 0, message « Vérification post-installation échouée », rollback complet (fichier supprimé, lockfile absent, config non marquée, arbre identique à l'état initial)** |

### 5.3 Publication

`bun run dry-run` reste **rouge volontairement / non bloquant** : `npm publish
--dry-run` de `@rashwright/ui-mobile@1.6.0` refuse de republier une version
déjà publiée. Aucune publication, aucun tag, aucun bump n'a été effectué. Ce
contrôle reste hors quality gate comme décidé.

---

## 6. Limites assumées

- **Rollback local uniquement.** `package.json`, `node_modules` et les lockfiles
  du package manager sont modifiés par npm/Expo et ne sont pas restaurés : un
  `package.json` restauré sans `node_modules` cohérent serait plus trompeur.
  Ces opérations sont listées comme non annulables.
- **TypeScript plein projet filtré.** La vérification TypeScript n'est lancée
  que si `tsc` et `node_modules` sont réellement présents ; sinon elle est
  `skipped` avec raison, jamais présentée comme un succès.
- **Conflits demandés.** Ils produisent un exit 1 sans rollback des fichiers
  déjà installés : les modifications locales de l'utilisateur ne sont pas
  écrasées et les autres installations restent cohérentes.
- **Validation sur vrai projet Expo** toujours suspendue : `test-project/` est
  encore suivi par git (119 fichiers). Les fixtures E2E restent isolées sous
  `%TEMP%`.
- **`add --repair` de fondation** conserve un exit 0 avec avertissement lorsque
  la réparation demandée est partielle : l'avertissement est explicite et la
  fondation n'est pas enregistrée comme intacte.

---

## 7. Critères de sortie de la Phase 4

- [x] `add button` dans un projet vierge : exit 0 **et** vérificateur OK.
- [x] Simulation d'un fichier source manquant : exit 1, message explicite,
      rollback des écritures locales.
- [x] Simulation d'une config désynchronisée : diagnostic ou réparation
      explicite, jamais faux succès.
- [x] Le lockfile d'un hook pointe vers `src/hooks/...`, pas
      `src/components/ui/hooks/...`.
- [x] `add` ne peut plus afficher « Installation terminée » si un import est non
      résolu.
- [x] Toute opération externe non annulée est listée dans le rapport d'échec.
- [x] `bun run quality` et `bun run test:install-e2e` sont verts.

> Précision : lorsqu'un fichier déclaré est absent, `validatePlanSources` bloque
> **avant** la transaction. Aucune écriture locale n'a donc lieu et il n'y a rien
> à restaurer. Le rollback est prouvé séparément par le scénario
> `broken-import`, où l'écriture a eu lieu avant l'échec de vérification.

---

## 8. Prochaine étape

Revue **R5**. Après validation seulement : Phase 5 — détecteur de composants
exhaustif (mappings internes, unification templates/widgets, couverture des 79
sources).
