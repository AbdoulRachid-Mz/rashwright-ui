# Registre Rashwright UI Mobile

Ce dossier est la source de vérité de l'installation. Les manifestes sont
**générés depuis les sources** par `bun run sync-registry`, puis **vérifiés**
par `bun run validate-registry`. Aucun manifeste ne doit être édité à la main
pour les champs recalculés.

## Commandes

```bash
bun run sync-registry      # met à jour les manifestes depuis les imports réels
bun run validate-registry  # échoue si un manifeste diverge des sources
```

`sync-registry` est idempotent : une seconde exécution ne doit produire aucun
diff. Les deux commandes retournent un code de sortie non nul en cas d'erreur.

## Politique de versioning

Deux versions coexistent et ne doivent jamais être confondues :

| Champ | Portée | Source |
|---|---|---|
| `registryVersion` | version du registre qui a produit le manifeste | `registry/index.json#version` |
| `version` | version propre de l'artefact (composant, hook, lib, template, widget) | manifeste |

- Un composant peut évoluer indépendamment du registre : ses changements
  incrémentent son `version`, pas `registryVersion`.
- Toute modification du schéma, des fondations ou des règles de résolution
  incrémente `registry/index.json#version` ; `sync-registry` propage alors la
  nouvelle valeur dans tous les manifestes.
- `registryVersion` ne remplace jamais la version publiée d'un package npm.

## Structure d'un manifeste

### Composant (`registry/components/*.json`)

Champs **recalculés** depuis les imports réels :

- `dependencies` — packages npm non-Expo ;
- `expoDependencies` — `expo-*`, `@expo/*`, `react-native-*`, `@react-native*` ;
- `optionalExpoDependencies` — dépendances Expo optionnelles (`expo-haptics`) ;
- `requiresComponents` — composants internes et primitives `text` / `view` ;
- `requiresFoundations` — fondations (`theme`, `glass`, `core-ui`, `liquid`,
  `responsive`, `upload`, `tab-bar`) ;
- `assets` — images/polices/vidéos embarquées, chemins relatifs à
  `packages/ui-mobile` ;
- `supportsGlass`, `nativeRebuildRequired`.

Champs **préservés** (édition manuelle autorisée) : `name`, `version`,
`description`, `category`, `files`, `providers`, `platforms`, `props`, `notes`.

### Hooks et libs (`registry/hooks/*.json`, `registry/lib/*.json`)

Mêmes règles de dépendances, avec `type` = `registry:hook` ou `registry:lib`.

### Templates et widgets (`templates/*/template.json`, `widgets/*/widget.json`)

- `type` = `registry:block` ;
- `requiredComponents` est recalculé depuis les imports ;
- `expoDependencies` regroupe les dépendances Expo obligatoires et optionnelles ;
- `files` est relatif au dossier de l'artefact ;
- le manifeste peut se lister lui-même dans `files` (convention existante).

## Règles de classification des imports

| Import | Classification |
|---|---|
| `react`, `react/*`, `react-native`, `react-native/*` | pairs implicites, jamais déclarés |
| `expo-*`, `expo/*`, `@expo/*`, `react-native-*`, `@react-native*` | `expoDependencies` |
| `expo-haptics` | `optionalExpoDependencies` |
| autre package | `dependencies` |
| `./text`, `./view` | `requiresComponents` |
| `./liquid/*` | fondation `liquid` + propagation de ses dépendances |
| `@/contexts/theme-context`, `@/constants/theme`, `@/stores/theme-store`, `@/theme/*` | fondation `theme` |
| `@/constants/glass-theme` | fondation `glass` |
| `@/hooks/use-responsive`, `@/lib/responsive` | fondation `responsive` |
| `@/lib/upload`, `@/lib/upload/*` | fondation `upload` |
| `@/contexts/tab-bar-context` | fondation `tab-bar` |
| image, police, vidéo (`.png`, `.jpg`, `.svg`, `.ttf`, `.mp4`...) | `assets` |

Tout import qui ne peut pas être classé est une **erreur bloquante** : aucune
dépendance n'est ignorée silencieusement.

## Matrices SDK

`registry/versions/expo-<sdk>.json` contient les versions épinglées par SDK.
`registry/index.json#sdkVersions` doit lister exactement les matrices présentes,
et `minimumExpoSdk` doit correspondre à la plus petite d'entre elles.

## Fondations

Les identifiants de fondation sont stables et validés :

`theme`, `glass`, `core-ui`, `liquid`, `responsive`, `upload`, `tab-bar`.

Les manifestes vivent dans `registry/foundations/*.json`. Ce sont des
manifestes de premier ordre :

- `type` = `registry:foundation` ;
- `files` et `assets` sont relatifs à `packages/ui-mobile` ;
- les dépendances npm/Expo, `requiresComponents` et `requiresFoundations` sont
  recalculés par `sync-registry` depuis les imports réels ;
- `KNOWN_FOUNDATIONS`, les manifestes et les fichiers déclarés doivent
  correspondre exactement (aucun manifeste orphelin, aucun fichier revendiqué
  par deux fondations) ;
- le graphe composants + fondations est vérifié : aucun cycle, aucune référence
  fantôme.

Routage à l'installation :

| Fichier de fondation | Destination |
|---|---|
| `components/ui/*` | `<componentsPath>/*` |
| `assets/*` | `<racine projet>/assets/*` |
| autre (`constants`, `theme`, `hooks`, `lib`, `contexts`...) | `<racine projet>[/src]/<chemin>` |

L'installation est non destructive : un fichier de fondation modifié localement
n'est jamais écrasé sans `--force` ou `--repair`. Une fondation dont un fichier
reste modifié n'est pas enregistrée comme intacte dans `rashwright-ui.lock`.
Les assets référencés par `require()` sont copiés et leurs chemins sont
réécrits vers l'emplacement réellement installé.

## Installation côté CLI

`rs-ui add <composant>` et `rs-ui add -t/-w ...` :

1. résolvent récursivement composants **et** fondations (graphe complet, tri
   topologique, diagnostics bloquants en cas de dépendance manquante ou de
   cycle) ;
2. en mode distant, téléchargent d'abord les manifestes, fichiers et assets
   manquants puis re-résolvent ; un téléchargement incomplet échoue
   explicitement ;
3. installent les fondations avant les composants, copient les assets et
   réécrivent les `require()` ;
4. n'écrasent un fichier existant modifié que sur `--force` / `--repair`, et
   ne l'enregistrent jamais comme intact dans le lockfile sans cela.

Un composant ou une fondation introuvable, un cycle, un fichier source absent
ou un échec npm/Expo interrompt la commande avec un code de sortie non nul.

