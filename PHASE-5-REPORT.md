# PHASE 5 — Rapport du détecteur de composants exhaustif

**Date :** 2026-11-08
**Statut :** terminé — quality gate vert, **300 tests unitaires**, **14/14 scénarios
E2E**, **0 import interne non résolu** sur les sources réelles.
**Périmètre :** refonte du détecteur de dépendances internes (composants,
templates, widgets), suppression des mappings statiques, diagnostics explicites.
Aucun commit, tag, publication ou bump de version.

---

## 1. Objectif

Le détecteur historique reposait sur une liste `KNOWN_INTERNAL_MAPPINGS` codée
en dur, incomplète, et sur deux implémentations dupliquées pour les templates et
les widgets. Des imports réels (`@/contexts/theme-context`, `@/constants/theme`,
`@/stores/theme-store`, `@/theme/*`, `./liquid/*`) n'étaient ni résolus ni
signalés : une dépendance interne pouvait donc être **invisible**.

La Phase 5 remplace cette liste par une résolution réelle des imports, pilotée
par les manifestes installables, avec un diagnostic pour tout ce qui ne peut pas
être résolu.

---

## 2. Fichiers ajoutés / modifiés

| Fichier | Changement |
|---|---|
| `packages/cli/src/core/component-detector.ts` | **Réécrit.** Suppression de `KNOWN_INTERNAL_MAPPINGS` ; index dérivé des manifestes ; résolution relative + alias ; collecteur unique ; `analyzeSourceImports` ; `unresolvedImports` |
| `packages/cli/tests/component-detector.test.ts` | **Nouveau.** 9 tests d'exhaustivité (79 sources, fondations, hooks/libs, templates, widgets, mappings réels, alias, imports non résolus, whitelist) |
| `packages/cli/tests/e2e-widget-install.test.ts` | Inchangé fonctionnellement, revalidé contre la nouvelle API |

Aucun manifeste, aucune source de composant, aucun template et aucun widget n'a
été modifié.

---

## 3. Décisions techniques appliquées

1. **Une seule source de vérité : les manifestes.**
   L'index du détecteur est construit à partir de :
   - `registry/foundations/*.json` → fichiers, dépendances Expo/npm, fondations requises ;
   - `registry/components|hooks|lib/*.json` → fichiers, dépendances, composants et fondations requis.
   Il n'existe plus de seconde liste à maintenir en parallèle des manifestes.

2. **Résolution réelle des imports.**
   - imports relatifs (`./`, `../`) résolus depuis le fichier importateur ;
   - alias `@/...` résolu depuis la racine des sources ;
   - extensions `.tsx`, `.ts`, `.d.ts` et fichiers `index.*` essayés dans l'ordre ;
   - un chemin qui sort de la racine du paquet est refusé et signalé ;
   - les imports `.js` écrits dans le code TypeScript sont ramenés à leur source réelle.

3. **Classification des packages.**
   - les dépendances déclarées dans les manifestes imposent leur nature (`npm` ou `expo`) ;
   - à défaut, les préfixes `expo`, `expo-*`, `react-native-*`, `@expo/*`,
     `@react-native*` sont classés Expo, le reste en npm ;
   - les sous-chemins sont normalisés (`zustand/middleware` → `zustand`,
     `@scope/pkg/sub` → `@scope/pkg`) ;
   - `react` et `react-native` restent des **pairs implicites** : jamais déclarés,
     jamais signalés ;
   - les modules Node intégrés sont ignorés.

4. **Un collecteur unique pour composants, templates et widgets.**
   `RequirementCollector` parcourt le graphe transitif (composants requis,
   fondations requises, imports réels) avec des ensembles `visited` : aucun
   doublon, aucune boucle infinie. `detectMissingTemplateRequirements` et
   `detectMissingWidgetRequirements` partagent désormais exactement le même
   moteur que les composants.

5. **Diagnostics au lieu d'un silence.**
   Tout import interne qui ne correspond à aucun fichier installable produit une
   entrée `unresolvedImports` avec le fichier, le spécificateur et la raison :
   - fichier introuvable pour un import relatif ;
   - alias interne invalide ;
   - fichier résolu mais non déclaré par un manifeste ;
   - fichier source déclaré introuvable ;
   - manifeste de fondation ou d'artefact introuvable.

6. **Whitelist vide et justifiée.**
   `WHITELISTED_INTERNAL_IMPORTS` est vide. Le test refuse toute entrée sans
   justification non vide : une exception future devra être documentée, pas
   ajoutée silencieusement.

7. **Compatibilité de l'API historique.**
   `text` et `view` ne sont pas des manifestes de composants mais restent
   visitables via `plan.components`, car ils sont déclarés par la fondation
   `core-ui`. Les signatures publiques (`detectMissingComponentRequirements`,
   `detectMissingTemplateRequirements`, `detectMissingWidgetRequirements`,
   `copyMissingInternalFiles`, `extractImportTargets`) sont conservées.

8. **Analyse de fichiers arbitraires.**
   `analyzeSourceImports({ files, localFiles })` permet d'analyser un artefact
   multi-fichiers sans faux positif : les imports entre fichiers d'un même
   artefact (template, widget, `lib/primitives`) sont locaux, pas des
   dépendances non déclarées.

---

## 4. Problèmes réels corrigés

| # | Problème | Correction |
|---|---|---|
| 1 | `@/contexts/theme-context`, `@/stores/theme-store`, `@/constants/theme`, `@/theme/*` n'étaient pas mappés | Résolution réelle + index dérivé des manifestes |
| 2 | `@/constants/glass-theme` n'était pas mappé vers la fondation `glass` | Fichier déclaré par `glass.json`, résolu automatiquement |
| 3 | Les imports `./liquid/*` étaient explicitement exclus | Exclusion supprimée ; fondation `liquid` détectée par ses fichiers |
| 4 | Deux implémentations dupliquées pour templates et widgets | Collecteur unique partagé |
| 5 | Les mappings statiques divergeaient des manifestes | Index construit depuis les manifestes |
| 6 | Un import interne non résolu était ignoré silencieusement | `unresolvedImports` explicite et testé |
| 7 | Les imports de sous-chemins (`zustand/middleware`) n'étaient pas normalisés | Normalisation du package racine |
| 8 | Un artefact multi-fichiers produisait de faux imports non déclarés | `localFiles` explicite, pas de whitelist de complaisance |

---

## 5. Résultats réels

### 5.1 Diagnostic sur les sources du dépôt

| Périmètre | Résultat |
|---|---|
| 79 composants / 79 fichiers | **0 import interne non résolu** |
| 7 fondations | **0 import interne non résolu** |
| 10 templates | **0 import interne non résolu** |
| 6 widgets | **0 import interne non résolu** |
| Hook `useScrollAwareTabBar` | fondation `tab-bar` détectée |
| `lib/primitives` (4 fichiers) | **0 non résolu** avec `localFiles`, conformément à sa nature multi-fichiers |

Fondations détectées sur l'ensemble composants + fondations : `core-ui`,
`glass`, `liquid`, `responsive`, `theme`, `upload` ; `tab-bar` apparaît dès que
les hooks sont analysés. Les imports `react` / `react-native` ne sont jamais
signalés.

### 5.2 Tests

`bunx vitest run tests/component-detector.test.ts` → **9/9 verts** :

1. parcourt les 79 sources du registre sans aucun import interne non résolu ;
2. résout les fondations, hooks et libs déclarés par leurs manifestes ;
3. résout tous les imports internes des templates et widgets ;
4. détecte les mêmes besoins pour un template/widget que pour ses composants ;
5. mappe les imports réels vers les bonnes fondations (`button`, `upload-image`,
   `useScrollAwareTabBar`) ;
6. résout les alias de thème, de store et de contexte vers la bonne fondation ;
7. signale un alias introuvable et un fichier non déclaré au lieu de les ignorer ;
8. n'accepte une whitelist que si elle est justifiée ;
9. extrait les imports statiques, les ré-exports et les side-effects.

### 5.3 Quality gate

`bun run quality` → **exit 0**.

| Étape | Résultat |
|---|---|
| `validate-registry` | 79 composants, 7 fondations, 10 templates, 6 widgets, 5 hooks, 2 libs — 0 erreur, 0 avertissement |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **56 fichiers / 300 tests** (291 → 300) |
| `build:cli` | exit 0 |
| `smoke:all` | exit 0 |

Vérifications complémentaires :

- `bun run test:install-e2e` → **14/14** ;
- `bun run sync-registry` → `0 fichier(s) modifié(s), 110 inchangé(s)` ;
- `bun install --frozen-lockfile` → `Checked 860 installs across 884 packages (no changes)`.

---

## 6. Limites assumées

- **Analyse statique, pas compilateur TypeScript.** Les imports construits
  dynamiquement à l'exécution ne sont pas détectés. Les imports de types sont
  traités comme des imports de valeur (au pire une dépendance en trop, jamais une
  dépendance manquante silencieuse).
- **Alias `@/` uniquement dans le détecteur.** Les alias personnalisés du projet
  cible relèvent de la transformation d'imports et du vérificateur
  post-installation (Phase 4), qui lit réellement `tsconfig.paths`.
- **Le détecteur n'est pas le chemin d'installation de `add`.** L'installation
  réelle utilise `dependency-resolver.ts` + les manifestes de fondations
  (Phases 2–4). La Phase 5 aligne le détecteur sur cette même source de vérité
  et le rend fiable pour ses appelants/tests ; elle ne remplace pas le résolveur.
- **`text` / `view`** restent des pseudo-entrées de composants pour préserver
  l'API historique, alors que leurs fichiers appartiennent à la fondation
  `core-ui`.
- **Cache d'index par racine.** Deux registres montés au même chemin après
  modification en cours de processus ne sont pas rechargés ; les commandes CLI
  sont mono-processus et recréent leur registre à chaque exécution.
- **Validation sur vrai projet Expo** toujours suspendue : `test-project/` est
  encore suivi par git (119 fichiers). Les fixtures restent isolées sous
  `%TEMP%`.

---

## 7. Critères de sortie de la Phase 5

- [x] Un test parcourt les 79 sources et vérifie que **chaque** import interne est
      soit résolu, soit explicitement whitelisté avec justification.
- [x] Les scénarios template/widget détectent les mêmes besoins que le scénario
      composant.
- [x] Plus aucune dépendance interne n'est « invisible » pour le détecteur.
- [x] `bun run quality` et `bun run test:install-e2e` sont verts.

---

## 8. Prochaine étape

Revue **R6**. Après validation seulement : Phase 6 — gestionnaire de versions et
matrices Expo (source unique des SDK, matrices complètes, plus aucun `latest`
silencieux).
