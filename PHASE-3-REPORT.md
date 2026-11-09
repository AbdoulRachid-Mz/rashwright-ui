# PHASE 3 — Rapport du moteur de résolution

**Date :** 2026-11-08
**Statut :** terminé — quality gate vert, **13/13 scénarios E2E réels verts**.
**Périmètre :** résolveur, registre distant, commandes consommatrices
(`add`, `info`, `deps`, `update`, `doctor`). Aucun commit, tag, publication ou
bump de version.

---

## 1. Objectif

Produire un **plan complet ou échouer explicitement** :

- télécharger les manifestes/fichiers avant de figer le plan ;
- ne plus jamais avaler une erreur de téléchargement, un manifeste invalide ou
  un fichier déclaré absent ;
- exposer les diagnostics (manquants, cycles, invalides, versions) au lieu de
  retourner un plan partiel ;
- bloquer les dépendances natives critiques sans version compatible connue ;
- séparer composants, fondations, npm, Expo et intégrations système.

---

## 2. Fichiers modifiés

| Fichier | Changement |
|---|---|
| `packages/cli/src/core/dependency-resolver.ts` | Diagnostics `invalidManifests`, `unversionedCriticalExpoDeps` ; `validatePlanSources` ; `allProviders` ; `isCriticalNativePackage` ; lecture détaillée des manifestes |
| `packages/cli/src/core/remote-registry.ts` | `ensureComponentDownloaded` strict (throw explicite, assets inclus) ; `ensureFoundationDownloaded` valide le manifeste ; matrice retourne un booléen ; `stale` signalé |
| `packages/cli/src/commands/add.ts` | Blocage manifestes invalides, plan vide, fichiers sources manquants, deps natives critiques ; matrice indisponible signalée ; providers séparés ; tailles de fichiers dans le plan |
| `packages/cli/src/commands/info.ts` / `deps.ts` / `update.ts` | Gestion explicite des erreurs de téléchargement (plus de `null` ambigu) |
| `packages/cli/src/commands/doctor.ts` | Matrice indisponible = avertissement visible |
| `packages/cli/tests/dependency-resolver.test.ts` | +6 tests (manifeste invalide, cycle, sources absentes, critique, providers) |
| `packages/cli/tests/e2e/install.e2e.ts` | +2 scénarios réels (fichier distant manquant, matrice SDK absente) |

---

## 3. Décisions techniques appliquées

1. **Téléchargement strict.** Un manifeste absent/illisible, un tableau `files`
   vide ou un fichier non téléchargeable lève une erreur nommant l’artefact et
   le fichier. Aucun `catch` vide ne subsiste dans ce chemin.
2. **Le cache corrompu est réparé mais signalé.** Un manifeste en cache
   illisible est retéléchargé et un avertissement explicite est affiché.
3. **Manifeste invalide ≠ dépendance absente.** Le résolveur produit
   `invalidManifests` et l’installation s’arrête avec la raison exacte.
4. **Vérification des sources avant écriture.** `validatePlanSources` compare
   chaque `files`/`assets` du plan au disque ; le moindre manque bloque avant
   la première écriture.
5. **Dépendances natives critiques.** `expo-*` et `react-native-*` sans version
   dans la matrice SDK sont bloqués ; `@expo/vector-icons` est exclu (pas de
   module natif propre). Aucune version `latest` n’est inventée.
6. **Matrice indisponible.** Le téléchargement retourne `false`, `add` avertit,
   puis la résolution bloque si des modules critiques en dépendent.
7. **Cache distant expiré.** Le fallback sur cache est marqué `stale` et affiché
   en avertissement ; il n’est plus silencieux.
8. **Plan vide = échec.** Une demande sans artefact résolu ne peut plus se
   terminer avec succès.
9. **Séparation des familles.** `allProviders` est distinct de `allNpmDeps` et
   `allExpoDeps` ; le plan affiche les providers séparément.

---

## 4. Problèmes réels corrigés

| # | Problème | Correction |
|---|---|---|
| 1 | Échec de téléchargement d’un fichier de composant ignoré (`catch {}`) | Erreur explicite `Téléchargement incomplet du composant …` |
| 2 | Manifeste distant introuvable → `null` traité comme « non installé » | Throw explicite avec URL et détail |
| 3 | Matrice Expo non téléchargeable → `catch {}` puis versions vides | Booléen retourné, avertissement, blocage des modules critiques |
| 4 | Manifeste JSON corrompu confondu avec un composant absent | `invalidManifests` + raison |
| 5 | Fichier déclaré absent découvert seulement à la copie | `validatePlanSources` bloque avant toute écriture |
| 6 | Registre distant injoignable → cache expiré utilisé silencieusement | `stale: true` affiché |
| 7 | Plan vide pouvait sortir en succès | Erreur explicite |
| 8 | Providers potentiellement confondus avec des packages | `allProviders` séparé |

---

## 5. Résultats réels

### 5.1 Quality gate

`bun run quality` → **exit 0**.

| Étape | Résultat |
|---|---|
| `validate-registry` | 79 composants, 7 fondations, 10 templates, 6 widgets, 5 hooks, 2 libs — 0 erreur, 0 avertissement |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **53 fichiers / 274 tests** (268 → 274) |
| `build:cli` | exit 0 |
| `smoke:all` | exit 0 |

`bun run sync-registry` → `0 fichier(s) modifié(s), 110 inchangé(s)`.

### 5.2 E2E d’installation — 13/13

| Scénario | Vérification |
|---|---|
| `add button` vierge / sans `src/` / alias `~/*` / distant index-only | 0 import non résolu |
| `add -t minimal` / `add -w metric` | composants, fondations, assets, deps Expo |
| `add --dry-run` | snapshot identique |
| conflit composant / fondation modifiée | `--force` / `--repair` explicites |
| `doctor` fichier manquant | `error` + exit non nul |
| `init --dry-run` | aucun fichier |
| **fichier distant manquant** | exit ≠ 0, nom du fichier, aucun fichier projet, pas de « Installation terminée » |
| **matrice SDK absente** | avertissement + blocage natif critique, exit ≠ 0, aucun fichier projet |

Les deux nouveaux scénarios prouvent que le plan partiel n’atteint jamais
l’écriture.

---

## 6. Limites assumées / reportées

- **Validation sur vrai projet Expo** toujours suspendue : `test-project/` est
  encore suivi par git (119 fichiers) malgré le message « vide ». Aucune
  installation réelle n’a été lancée dedans ; les fixtures restent sous
  `%TEMP%`.
- **`--allow-partial` non implémenté volontairement.** Cette option
  réintroduirait un plan partiel contraire au critère « plan complet ou échec
  explicite ». Les cas non critiques restent des avertissements ; les cas
  critiques bloquent. Décision à valider en R4.
- **Téléchargement avant résolution** : le CLI résout une première fois depuis
  l’index, télécharge les manquants, puis re-résout. Le plan intermédiaire n’est
  jamais utilisé pour écrire ; seul le plan final validé l’est.
- **Hooks/libs** déjà résolus via `loadComponentEntry` ; la détection exhaustive
  des mappings internes appartient à la Phase 5.
- **Matrices Expo** : complétude et versions de référence appartiennent à la
  Phase 6.
- **`deps`/`why`/`remove`/`update`** : dépendances inverses et vérification
  indépendante du lockfile appartiennent aux Phases 4 et 7.

---

## 7. Critères de sortie de la Phase 3

- [x] Aucun `continue` / `return null` silencieux dans le chemin de résolution.
- [x] Un plan vide n’est plus un succès.
- [x] Les cycles sont détectés, rapportés et bloquants.
- [x] `--dry-run` n’écrit aucun fichier projet ni lock/config.
- [x] Un fichier déclaré absent ou non téléchargeable bloque avant écriture.
- [x] Les manifestes invalides sont distingués des absences.
- [x] Les deps natives critiques sans matrice sont bloquées, sans `latest`.
- [x] Le plan expose composants, fondations, npm, Expo, providers, conflits et
      avertissements, avec le nombre de fichiers par artefact.
- [x] `bun run quality` et `bun run test:install-e2e` sont verts.

---

## 8. Prochaine étape

Revue **R4**. Après validation seulement : Phase 4 — installation
transactionnelle, vérificateur indépendant du lockfile, rollback local
documenté et message final conditionnel.
