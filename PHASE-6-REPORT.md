# PHASE 6 — Rapport du gestionnaire de versions et des matrices Expo

**Date :** 2026-11-09
**Statut :** terminé — quality gate vert, **307 tests unitaires**, **14/14 scénarios
E2E**, matrices régénérées depuis les données officielles d'Expo.
**Périmètre :** source unique des SDK, matrices `expo-54..58`, `resolveSdkVersion`
strict, `init --sdk` réellement pinné, validation du registre.
Aucun commit, tag, publication ou bump de version.

---

## 1. Objectif

Le dépôt déclarait trois listes de SDK divergentes et des matrices fausses :

- `expo-detector.ts` → `[54, 55, 56, 57, 58, 59]` ;
- `package-manager.ts` → `[54, 55, 56, 57, 58]` ;
- `registry/index.json` → `[54, …, 59]`.

Les matrices ne correspondaient pas aux SDK annoncés : `expo-54.json` contenait
en réalité les versions du SDK 52, `expo-55.json` un mélange 52/53, les SDK
56–58 étaient périmés, et `expo-59.json` était entièrement spéculatif. Enfin,
`resolveSdkVersion` retombait **silencieusement** sur 58 pour toute valeur
invalide. Une installation pouvait donc afficher un succès avec des versions
incompatibles.

La Phase 6 remet une seule source de vérité, alignée sur les versions réellement
publiées par Expo.

---

## 2. Décision de périmètre (revue)

**Expo n'a jamais publié `expo@59`.** Au moment de la Phase 6, le dernier paquet
publié est `58.0.23` ; les dist-tags officiels s'arrêtent à `sdk-58`. Le support
59 et `registry/versions/expo-59.json` sont donc **retirés**. Le critère initial
« `init --sdk 59` produit un SDK 59 » est abandonné : il aurait obligé à inventer
une matrice et à produire une installation fausse.

Périmètre retenu : **SDK 54 à 58**, chacun avec une matrice réelle. Ajouter un
SDK futur demandera une entrée dans la source unique **et** une matrice
régénérée depuis les données officielles — pas une simple ligne déclarative.

---

## 3. Fichiers ajoutés / modifiés

| Fichier | Changement |
|---|---|
| `packages/cli/src/core/sdk-versions.ts` | **Nouveau.** Source unique : `SUPPORTED_SDK_VERSIONS`, `MINIMUM_SDK_VERSION`, `LATEST_SUPPORTED_SDK`, `isSupportedSdk`, `UnsupportedSdkVersionError`, `resolveSdkVersion` |
| `packages/cli/src/core/expo-detector.ts` | Réexporte la source unique ; `isSupported` exige un SDK **exactement** supporté (plus de `>= 54`) |
| `packages/cli/src/core/package-manager.ts` | Réexporte l'API SDK historique depuis la source unique |
| `packages/cli/src/commands/init.ts` | `--sdk` validé **avant prompts et écritures** ; choix générés depuis `SUPPORTED_SDK_VERSIONS` ; `init --dry-run` ne crée plus de dossier |
| `packages/cli/src/core/starter-generator.ts` | `isSupportedSdk`, plage de versions dynamique |
| `packages/cli/src/commands/doctor.ts` | Message de plage dynamique (`54–58`) |
| `packages/ui-mobile/registry/versions/expo-54.json` … `expo-58.json` | **Régénérées** depuis `bundledNativeModules.json` + templates officiels |
| `packages/ui-mobile/registry/versions/expo-59.json` | **Supprimé** (SDK jamais publié) |
| `packages/ui-mobile/registry/index.json` | `sdkVersions` = `[54..58]`, régénéré par `sync-registry` |
| `scripts/validate-registry.ts` | Vérifie index ↔ matrices et que **chaque dépendance Expo utilisée** est versionnée dans toutes les matrices |
| `packages/cli/tests/sdk-versions.test.ts` | **Nouveau.** Parité versions/matrices, React/RN réels, couverture des deps, aucune version vide/inventée |
| `packages/cli/tests/expo-detector.test.ts` | SDK 59 refusé ; matrices 54–58 uniquement |
| `packages/cli/tests/package-manager.test.ts` | `resolveSdkVersion` lève pour 59 / 42 / 99 / invalid |
| `packages/cli/tests/init.test.ts` | SDK 54–58 acceptés, 59 / 42 rejetés |
| `packages/cli/tests/dependency-resolver.test.ts` | Tests de conflit dérivés de la matrice réelle (plus de versions codées en dur) |
| `packages/cli/tests/e2e/install-harness.ts` | `snapshotTree` suit désormais aussi les **dossiers** |
| `packages/cli/tests/e2e/install.e2e.ts` | `init --dry-run` vérifie explicitement l'absence de dossiers (`components/ui`) |

Aucun composant, template, widget, hook ou lib n'a été modifié.

---

## 4. Corrections réelles

| # | Problème | Correction |
|---|---|---|
| 1 | Trois listes de SDK divergentes | `sdk-versions.ts` unique, réexportée partout |
| 2 | `expo-54`/`expo-55` contenaient les versions des SDK 52/53 | Matrices régénérées depuis les `bundledNativeModules.json` officiels |
| 3 | SDK 56–58 périmés (reanimated, safe-area, etc.) | Régénération depuis les paquets publiés |
| 4 | `expo-59.json` spéculatif | Fichier supprimé, SDK 59 refusé explicitement |
| 5 | `expo-application`, `expo-clipboard`, `expo-device`, `expo-router` absents des matrices | Présents dans toutes les matrices 54–58 |
| 6 | `resolveSdkVersion` retombait en silence sur 58 | `UnsupportedSdkVersionError` explicite |
| 7 | `init --sdk 59` produisait un faux projet | Échec avant prompts, exit 1 |
| 8 | `init --dry-run` créait `rashwright-expo-app/` et `components/ui/` | `mkdirSync` gardé par `options.dryRun` |
| 9 | Les snapshots E2E ignoraient les dossiers vides | `snapshotTree` suit les dossiers, diff et rollback inclus |

---

## 5. Données réelles utilisées

### 5.1 Paquets Expo (npm, à la date de la Phase 6)

Dist-tags officiels : `latest = 58.0.23`, `sdk-54 = 54.0.38`,
`sdk-55 = 55.0.32`, `sdk-56 = 56.0.24`, `sdk-57 = 57.0.32`,
`sdk-58 = 58.0.23`. Aucune version `59.x` n'existe.

### 5.2 Matrices régénérées

| SDK | Expo utilisé | React | React Native | Packages versionnés |
|---|---|---|---|---|
| 54 | 54.0.38 | 19.1.0 | 0.81.5 | 105 |
| 55 | 55.0.32 | 19.2.0 | 0.83.10 | 106 |
| 56 | 56.0.24 | 19.2.3 | 0.85.3 | 108 |
| 57 | 57.0.32 | 19.2.3 | 0.86.3 | 109 |
| 58 | 58.0.23 | 19.3.0 | 0.88.1 | 110 |

React / React Native proviennent de `expo-template-blank-typescript` ; les
versions de packages viennent de `expo@<version>/bundledNativeModules.json`.
Chaque matrice contient les packages Expo réellement utilisés par les manifestes
(`@expo/vector-icons`, `expo-application`, `expo-blur`, `expo-clipboard`,
`expo-device`, `expo-haptics`, `expo-image`, `expo-image-manipulator`,
`expo-image-picker`, `expo-linear-gradient`, `expo-router`, `expo-video`, etc.).

---

## 6. Comportements vérifiés sur la vraie CLI

Commande exécutée depuis un dossier temporaire vide, avec la CLI source
(`packages/cli/src/index.ts`) :

| Commande | Résultat réel |
|---|---|
| `init --sdk 59 --yes --dry-run` | **exit 1** — `SDK Expo "59" non supporté. Versions supportées : 54, 55, 56, 57, 58 (dernière : 58).` |
| `init --sdk 42 --yes --dry-run` | **exit 1** — même message explicite |
| `init --sdk 58 --yes --dry-run` | **exit 0** — commande `npx create-expo-app@latest rashwright-expo-app --template blank-typescript@58 --no-install --no-agents-md` |
| `init --sdk 58 --yes --dry-run` (contrôle disque) | **aucune entrée créée** (ni dossier, ni fichier) |

---

## 7. Tests et qualité

### 7.1 Tests ciblés

`bunx vitest run tests/sdk-versions.test.ts tests/expo-detector.test.ts tests/package-manager.test.ts tests/init.test.ts`
→ **4 fichiers / 35 tests verts**.

`bunx vitest run tests/dependency-resolver.test.ts` → **20/20 verts** après
dérivation des versions depuis la matrice réelle.

### 7.2 Quality gate

`bun run quality` → **exit 0**.

| Étape | Résultat |
|---|---|
| `validate-registry` | 79 composants, 7 fondations, 10 templates, 6 widgets, 5 hooks, 2 libs — 0 erreur, 0 avertissement |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **57 fichiers / 307 tests** (300 → 307) |
| `build:cli` | exit 0 |
| `smoke:all` | exit 0 |

### 7.3 Vérifications complémentaires

| Commande | Résultat |
|---|---|
| `bun run test:install-e2e` | **14/14** (dont `init --dry-run` renforcé) |
| `bun run sync-registry` | `0 fichier(s) modifié(s), 110 inchangé(s)` |
| `bun install --frozen-lockfile` | `Checked 860 installs across 884 packages (no changes)` |

---

## 8. Limites assumées

- **SDK 59 non supporté** parce qu'Expo ne l'a jamais publié. Ce n'est pas une
  régression : c'est l'alignement sur le réel. Le jour où `expo@59` sortira, il
  faudra ajouter une matrice régénérée, pas seulement la constante.
- **Matrices figées à la date de génération.** Elles ne se mettent pas à jour
  automatiquement lors d'une nouvelle publication patch d'Expo ; une
  régénération explicite est requise.
- **Les matrices listent les packages natifs d'Expo**, pas l'ensemble des
  dépendances npm arbitraires (`zustand`, `nativewind`, etc.) : ces dernières
  restent gérées par les manifestes et `expo install` / `npm install`.
- **La validation sur un vrai projet Expo vierge + existant reste suspendue** :
  `test-project/` est encore suivi par git (119 fichiers). Les fixtures E2E
  restent isolées sous `%TEMP%`.
- **`bun run dry-run` (publication) reste hors gate** : il échoue à cause de la
  version déjà publiée, indépendamment de la Phase 6.

---

## 9. Critères de sortie de la Phase 6

- [x] `rs-ui init --sdk 58` cible réellement le SDK 58 ; `--sdk 59` échoue
      explicitement car Expo n'a jamais publié ce SDK.
- [x] `rs-ui init --sdk 42` échoue avec un message clair.
- [x] Chaque matrice contient les packages utilisés par au moins un
      composant/template/widget.
- [x] Plus aucun `"latest"` silencieux dans un plan d'installation réel.
- [x] `init --dry-run` ne crée ni fichier ni dossier (vérifié par snapshot).

---

## 10. Prochaine étape

Revue **R7**. Après validation seulement : Phase 7 — cycle de vie (`update`,
`remove`, `doctor`, `info`, `why`), dépendances inverses et cohérence
config / lockfile / disque.
