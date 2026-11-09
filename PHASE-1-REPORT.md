# PHASE 1 — Rapport du registre et des manifestes

**Date :** 2026-11-08
**Statut :** terminé — quality gate vert, E2E Phase 0 toujours rouges comme prévu.
**Code produit modifié :** `packages/cli/src/core/{schema,registry,dependency-resolver}.ts` (types uniquement), aucun comportement d'installation.

---

## 1. Objectif

Faire du registre une source de vérité fiable avant de toucher au moteur
d'installation :

- les manifestes doivent décrire **exactement** les imports réels ;
- `sync-registry` doit être idempotent et échouer sur toute ambiguïté ;
- `validate-registry` doit refuser un manifeste qui ment ;
- les types CLI doivent accepter `type`, `registryVersion`, `assets` et
  `requiresFoundations` sans casser l'existant.

Aucune fondation n'est encore installable et aucun asset n'est encore copié :
ces deux points appartiennent aux phases 2 à 4.

---

## 2. Fichiers ajoutés / réécrits

| Fichier | Rôle |
|---|---|
| `scripts/registry-utils.ts` | Analyse des imports, classification, assets, fondations, ordre canonique des manifestes |
| `scripts/sync-registry.ts` | Réécrit : génération complète et idempotente des manifestes |
| `scripts/validate-registry.ts` | Réécrit : 7 contrôles bloquants, code de sortie non nul |
| `packages/cli/tests/registry-manifests.test.ts` | 6 tests : imports déclarés, fantômes, versions, contrôle négatif, sources ↔ manifestes |
| `packages/ui-mobile/registry/README.md` | Politique de versioning, schéma, règles de classification |
| `packages/cli/src/core/schema.ts` | `registryVersion`, `assets`, `requiresFoundations` + normalisation |
| `packages/cli/src/core/dependency-resolver.ts` | `ComponentRegistryEntry` étendu, defaults sûrs |
| `packages/cli/src/core/registry.ts` | `RegistryIndex` accepte `totalComponents` et `sdkVersions` |

---

## 3. Bugs corrigés

1. **Imports relatifs et alias classés `npm` avant analyse interne.**
   `./text`, `./liquid/*`, `@/contexts/*` partaient dans `dependencies` au lieu
   de `requiresComponents` / `requiresFoundations`. Corrigé : l'analyse interne
   passe avant la classification externe.
2. **`react` et `react-native` tombaient dans `unknown`.**
   Ils sont désormais reconnus comme pairs implicites (`isPeerPackage`) et ne
   sont jamais déclarés ni signalés.
3. **Assets assimilés à des dépendances npm.**
   `rashwright-logo` déclarait `@/assets/primary.png` et
   `../../../assets/primary.png` dans `dependencies`. Désormais :
   `assets: ["assets/primary.png"]`, et les chemins post-installation
   (`../../../assets/...`) sont résolus vers l'asset source du paquet.
4. **Manifestes partiellement générés.**
   Anciens `requiresComponents` de templates/widgets obsolètes, `expo-image-manipulator`
   déclaré par `upload` sans import réel, `index.json` sans SDK 59.

Chaque import impossible à classer est une **erreur bloquante** de
`sync-registry` : plus aucune dépendance ignorée silencieusement.

---

## 4. Résultats réels

### 4.1 `bun run sync-registry`

```
✅ sync-registry terminé : 0 fichier(s) modifié(s), 103 inchangé(s).
```

103 = 79 composants + 5 hooks + 2 libs + 10 templates + 6 widgets + `index.json`.
Une seconde exécution immédiate produit **0 modification** : le générateur est
idempotent.

### 4.2 `bun run validate-registry`

```
Manifestes : 79 composants, 10 templates, 6 widgets, 5 hooks, 2 libs.
index.json : version 1.6.0, 79 composants, SDK 54, 55, 56, 57, 58, 59.
✅ validate-registry : 0 erreur, 0 avertissement.
```

Contrôles effectués : structure, `type`, `version`/`registryVersion`, fichiers
et assets existants, imports déclarés == imports réels, composants fantômes,
cycles, index ↔ manifestes ↔ matrices, primitives Core hors index.

### 4.3 `bun run quality`

| Étape | Résultat |
|---|---|
| `validate-registry` | 0 erreur, 0 avertissement |
| `validate-maestro` | 6 flows valides |
| `check-types` CLI + UI | 0 erreur |
| `test` | **52 fichiers / 251 tests** |
| `build:cli` | 93 modules, `dist/index.js` 0.40 MB |
| `smoke:all` | version 1.6.0, ESM strict, shebang, dépendance workspace OK |

`bun run tsc:root` échoue uniquement sur
`scripts/test-phase1-validation.ts` (TS5097, imports `.ts`), fichier
**préexistant** (commit `b6f5585`, hors quality gate). Aucune erreur introduite
par la Phase 1.

---

## 5. Corrections de métadonnées constatées, pas inventées

- **Templates / widgets** : `requiredComponents` recalculé depuis les imports
  réels. Exemples vérifiés dans les sources :
  - `commerce` ne référence ni `search-input`, ni `text-input`, ni `icon-button`,
    ni `icon` → retirés ;
  - `finance` utilise `TouchableOpacity`, pas le composant `button` → retiré ;
  - `finance` n'utilise pas `divider` ni `avatar` → retirés ;
  - `dashboard` importe `divider` → ajouté.
- **`lib/upload`** : `expo-image-manipulator` retiré, aucun fichier du dossier
  ne l'importe.
- **`index.json`** : `sdkVersions` inclut 59, `minimumExpoSdk: 54`,
  `totalComponents: 79`.
- **`rashwright-logo`** : `dependencies` vidé de ses chemins d'assets,
  `assets: ["assets/primary.png"]`.
- **Tests obsolètes corrigés** : `e2e-widget-install.test.ts` et
  `widgets-registry.test.ts` exigeaient `button` pour `finance` ; l'assertion
  reflète désormais le code réel (`TouchableOpacity`).

Répartition des fondations référencées (76 items sur 86) :
`theme` 75, `glass` 50, `liquid` 38, `responsive` 2, `upload` 2, `tab-bar` 1.
`core-ui` est un identifiant connu mais non référencé : `text`/`view` restent
volontairement dans `requiresComponents`.

---

## 6. E2E Phase 0 : toujours 8/8 rouges, volontairement

Commande : `bun run test:install-e2e` → **1 fichier / 8 tests en échec**.

| Scénario | Constat inchangé |
|---|---|
| `add button` (3 variantes) | 18 imports non résolus, seulement 2 fichiers copiés |
| `add -t minimal` | 30 imports non résolus, `react-native-safe-area-context` absent |
| `add -w metric` | 24 imports non résolus, `@expo/vector-icons` absent |
| `doctor` | exit 0 malgré un composant déclaré absent |
| `init --dry-run` | écrit `rashwright-ui.json` |
| registre distant index-only | aucun manifeste téléchargé, faux « déjà installé » |

C'est le comportement attendu : la Phase 1 fiabilise les **données**, pas encore
l'**installation**. Ces tests restent hors de `bun run test` jusqu'à la Phase 8.

---

## 7. Limites assumées / reportées

- **Assets** : déclarés et validés, mais pas encore copiés dans le projet cible
  (phases 3–4).
- **Fondations** : référencées par identifiant, mais `registry/foundations/*.json`
  n'existe pas encore (Phase 2).
- **Matrices SDK** : 54 → 59 présentes, complétude des packages critiques reportée
  en Phase 5.
- **Registre distant** : téléchargement avant résolution non implémenté (Phase 3).
- **Projet réel** : validation finale sur projet Expo vierge/existant suspendue
  tant que `test-project/` n'est pas entièrement supprimé.
- `registryVersion` est une métadonnée de cohérence ; aucune publication, aucun
  bump de version, aucun tag n'a été effectué.

---

## 8. Critères de sortie de la Phase 1

- [x] `sync-registry` génère tous les manifestes et est idempotent.
- [x] `validate-registry` échoue sur toute divergence et passe à 0 erreur.
- [x] Les imports npm / Expo / optionnels / internes / assets sont classés sans
      silence.
- [x] Les types CLI acceptent les nouveaux champs sans régression.
- [x] `bun run quality` est entièrement vert.
- [x] `bun run test` reste vert : 52 fichiers / 251 tests.
- [x] Les E2E Phase 0 restent rouges pour les raisons déjà documentées.

---

## 9. Prochaine étape

Revue **R2**. Après validation seulement : Phase 2 — fondations de premier
ordre (`registry/foundations/*.json` pour `theme`, `glass`, `core-ui`, `liquid`,
`responsive`, `upload`, `tab-bar`) et résolution `foundation:` dans
`loadComponentEntry`.
