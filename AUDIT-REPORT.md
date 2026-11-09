# AUDIT-REPORT — Rashwright UI Mobile / `rs-ui`

**Version auditée :** `@rashwright/ui-mobile@1.6.0` + `@rashwright/cli@1.6.0`
**Commit de référence :** `b3e6e3b`
**Date de l'audit :** 2026-11-08
**État du dépôt pendant l'audit :** working tree propre, aucun code modifié, aucun commit, aucun bump de version.

---

## 1. Verdict exécutif

Le « quality gate vert » du dépôt **ne prouve pas** que le CLI produit des installations fonctionnelles.

Les commandes `rs-ui add`, `rs-ui add -t <template>` et `rs-ui add -w <widget>` **affichent un succès et un exit code 0 alors que les fichiers copiés contiennent des imports non résolus**. Sur un projet Expo vierge, `rs-ui add button` ne copie que 2 fichiers (`button.tsx`, `index.ts`) et laisse 12 spécifications d'import cassées (fondations de thème, primitives `text`/`liquid`, constantes glass). Les templates et widgets officiels échouent de la même manière.

**Cause racine principale :** le moteur d'installation ne sait pas résoudre les dépendances internes (fondations `contexts/theme-context`, `constants/glass-theme`, `stores/theme-store`, `constants/theme`, primitives `text`/`view` et `liquid/*`), et il ne possède pas de barrière de validation « installation réellement fonctionnelle ».

**Trois constats bloquants pour la promesse produit :**

1. **Aucun installateur ne copie les fondations** (`theme-context`, `glass-theme`, `theme-store`, `constants/theme`, `theme/**`) : `add` ne les connaît pas, et le détecteur ne les déclenche jamais.
2. **Les manifestes de composants sont incomplets** : 22 dépendances directes utilisées ne sont pas déclarées, et 38 composants qui utilisent `liquid/*` ne déclarent pas `expo-linear-gradient`.
3. **Le succès est inconditionnel** : `add` affiche `✔ Installation terminée` même quand des fichiers sont absents, que la config est désynchronisée ou qu'un plan de résolution est vide.

**Le dépôt ne peut pas être considéré comme release-ready en l'état.** Les tests passent parce qu'ils testent des unités isolées, pas le parcours réel d'installation.

---

## 2. Périmètre et méthodologie

### 2.1 Périmètre inspecté

| Zone | Éléments inspectés |
|---|---|
| Registry | `packages/ui-mobile/registry/index.json`, `components/*.json` (79), `hooks/*.json` (5), `lib/*.json` (2), `versions/expo-54..59.json` |
| Sources UI | `packages/ui-mobile/components/ui/**`, `contexts/**`, `constants/**`, `stores/**`, `theme/**`, `hooks/**`, `lib/**` |
| Templates / Widgets | `packages/ui-mobile/templates/*/template.json` (10), `widgets/*/widget.json` (6), fichiers TSX/T S associés |
| CLI cœur | `registry.ts`, `dependency-resolver.ts`, `component-detector.ts`, `remote-registry.ts`, `lock-manager.ts`, `file-manager.ts`, `config-manager.ts`, `package-manager.ts`, `expo-detector.ts`, `project-detector.ts`, `starter-generator.ts`, `schema.ts`, `scoped-registry.ts`, `nativewind-manager.ts` |
| CLI commandes | `init`, `add`, `template`, `widget`, `update`, `remove`, `doctor`, `info`, `deps`, `fix`, `list`, `create`, `why`, `mcp` |
| Outillage | `scripts/validate-registry.ts`, `scripts/sync-registry.ts`, `scripts/cli-smoke-*.mjs`, workflows |
| Tests | `packages/cli/tests/**` (51 fichiers, 245 tests) |
| Documentation | `README.md`, `Quick-Start.md`, `ARCHITECTURE`/`architecture.md`, `ANALYSIS.md`, `TASK.md`, `VALIDATION.md` |

### 2.2 Méthode

1. **Lecture du code réel**, sans se fier aux documents de validation.
2. **Baseline reproductible** : exécution des scripts du dépôt.
3. **Scripts d'audit statique** (hors dépôt, dans `%TEMP%/opencode/`) pour recouper sources, manifestes, imports et dépendances.
4. **Tests d'installation réels** dans des projets Expo vierges et des fixtures contrôlées, suivis d'une analyse des imports non résolus.
5. **Aucune correction conservée** : toute dérive générée par `sync-registry` a été sauvegardée puis annulée.

### 2.3 Fixtures utilisées

| Fixture | Rôle |
|---|---|
| `rs-virgin` | Projet Expo vierge sans `rashwright-ui.json` |
| `rs-audit-fixture` | Projet avec config minimale (sans fondations, toutes les deps déclarées) |
| `rs-audit-template` | Projet pour `rs-ui add -t minimal` |
| `rs-audit-widget` | Projet pour `rs-ui add -w metric` |
| `rs-audit-desync` | Projet avec config désynchronisée (composant marqué installé mais fichier absent) |

> `test-project/` n'a **pas** été utilisé : il est encore suivi par git (119 fichiers) et doit être supprimé par l'utilisateur avant les tests E2E de sortie.

---

## 3. Baseline reproductible

### 3.1 Commandes du dépôt

| Commande | Résultat observé | Interprétation |
|---|---|---|
| `bun install` | OK, 720 packages, Bun 1.4.3 ; warning peer `react@18.3.1` | Installation monorepo OK |
| `bun run validate-registry` | `✅ 0 erreur — 79 composants, 79 sources` | Vérifie l'existence des fichiers déclarés, **pas leur cohérence d'imports** |
| `bun run check-types` | OK CLI + UI | Le code compile en interne ; ne prouve pas l'installation |
| `bun run test` | 51 fichiers, 245 tests passés | Tests majoritairement unitaires |
| `bun run build:cli` | OK, `dist/index.js` (≈0,40 MB) | Build OK |
| `bun run validate-maestro` | OK, 6 flows | Validation de flows séparés |
| `bun run smoke:all` | OK | Exécute `smoke:version`, `lint:require`, `lint:shebang`, `smoke:dep-ui` ; **n'exécute ni `init` ni `add`** |
| `bun run quality` | OK (enchaînement des précédents) | Vert, mais ne couvre pas le parcours d'installation réel |
| `bun run dry-run` | **ÉCHEC** : `npm error You cannot publish over the previously published versions: 1.6.0` | Échec attendu sans bump ; interdit par le périmètre |

### 3.2 Tests d'installation réels

| Scénario | Résultat affiché | Fichiers réellement copiés | Imports non résolus |
|---|---|---|---|
| `rs-ui add button --yes --no-skills` (vierge) | `✔ Installation terminée` | `src/components/ui/button.tsx`, `src/components/ui/index.ts` | **12** (`./text`, `./liquid/*`, `@/contexts/theme-context`, `@/constants/glass-theme`) |
| `rs-ui add button` (fixture, deps déclarées) | Succès | 2 fichiers | **12** |
| `rs-ui add -t minimal --yes --no-skills` | `✔ Installation terminée` | 4 composants + template | **12** (dont `@/contexts/theme-context` dans le template et les composants, `./liquid/*`, `./text`, `./view`, `@/constants/glass-theme`) |
| `rs-ui add -w metric --yes --no-skills` | `✔ Installation terminée` | 3 composants + widget | **13** (dont `@/components/ui/text`, `@/contexts/theme-context`) |
| Config désynchronisée (`button` marqué installé, fichier absent) | Succès | `button` sauté | Template incomplet, aucun avertissement |

> Conclusion : **les commandes retournent 0 et affichent un succès alors que le résultat n'est pas fonctionnel.** C'est un défaut de conception du moteur d'installation, pas un cas limite.

---

## 4. Constats détaillés

La classification suit l'impact utilisateur :

- **P0** : l'installation est cassée ou annoncée à tort comme réussie.
- **P1** : le registre, le résolveur, les versions ou le cycle de vie produisent des résultats faux.
- **P2** : la validation, les tests et la documentation masquent les défauts.

---

### 4.1 P0 — Installation non fonctionnelle et succès trompeur

#### P0-01 — `add` ne copie jamais les fondations

**Preuve**
- `packages/cli/src/core/component-detector.ts:45-99` : `KNOWN_INTERNAL_MAPPINGS` ne contient **aucune** entrée pour `@/contexts/theme-context`, `@/constants/glass-theme`, `@/stores/theme-store`, `@/constants/theme`, `@/theme/*` ni `./liquid/*`.
- `packages/cli/src/core/component-detector.ts:227` : les imports relatifs `./liquid/...` sont explicitement exclus de la détection.
- `packages/cli/src/core/starter-generator.ts:777-850` : `setupFoundations()` existe et copie bien `constants/theme.ts`, `constants/glass-theme.ts`, `stores/theme-store.ts`, `contexts/theme-context.tsx`, les thèmes et les primitives core.
- `packages/cli/src/commands/init.ts:591` : `setupFoundations()` n'est appelé **que par `init`**.
- `packages/cli/src/commands/add.ts` : aucun appel à `setupFoundations()` ni `setupCoreUi()`.

**Impact**
Tout composant installé par `add` sur un projet qui n'a pas été initialisé par `rs-ui init` (ou dont les fondations ont été supprimées) casse immédiatement son import de thème. 75 des 79 composants sont concernés.

**Constat mesuré**
- `@/contexts/theme-context` : **75/79** composants.
- `@/constants/glass-theme` : **24/79**.
- `./liquid/*` : **38/79**.
- `./text` : **32/79**.
- `./view` : **1/79**.
- `@/hooks/use-responsive` / `@/lib/responsive` : **2/79**.

Seuls `keyboard-avoiding-view`, `particles`, `rashwright-logo` et `safe-area-view` n'ont aucun import interne non détecté.

---

#### P0-02 — Les primitives core (`text`, `view`, `liquid/*`) ne sont jamais copiées par `add`

**Preuve**
- `packages/ui-mobile/registry/components/text.json` et `view.json` : **inexistants**. Ce ne sont pas des composants du registre.
- `packages/cli/src/core/starter-generator.ts:857-868` : `CORE_UI_FILES` liste `components/ui/text.tsx`, `view.tsx`, `liquid/*` (10 fichiers).
- `packages/cli/src/core/starter-generator.ts:870-881` : `setupCoreUi()` copie ces fichiers, mais n'est appelé que par `setupFoundations()` (ligne 850), donc uniquement par `init`.
- `packages/cli/src/core/dependency-resolver.ts:87-88` : si un nom résolu n'a pas de manifeste (`text`, `view`), le résolveur fait `continue` **silencieusement**.
- `packages/ui-mobile/registry/components/button.json:12` : `"requiresComponents": []`, alors que `button.tsx:13` importe `./text` et `button.tsx:14-17` importe 3 primitives liquid.

**Impact**
`button`, `card`, `badge`, et 35 autres composants ne peuvent pas fonctionner après `add`. Le `index.ts` généré référence en plus des modules inexistants (`./liquid/*`, `./view`).

---

#### P0-03 — Les dépendances des templates et widgets ne sont jamais installées

**Preuve**
- `packages/cli/src/commands/add.ts:546-556` : `templateDef.dependencies` et `templateDef.expoDependencies` sont seulement passés à `recordLockedTemplate()`.
- `packages/cli/src/commands/add.ts:619-629` : idem pour `widgetDef.dependencies` / `widgetDef.expoDependencies` via `recordLockedWidget()`.
- `packages/cli/src/commands/add.ts:340-352` : les listes de packages à installer sont construites uniquement depuis `plan` et `componentRequirements`; elles n'intègrent jamais les manifestes template/widget.
- 5 des 10 templates déclarent `expo-haptics` (`auth`, `chat`, `finance`, `onboarding`, `social`), mais **5 templates importent `react-native-safe-area-context` sans le déclarer** : `auth`, `commerce`, `minimal`, `onboarding`, `showcase`.
- Les 6 widgets importent `@/contexts/theme-context` sans mécanisme de fondation.

**Impact**
`rs-ui template add` / `rs-ui widget add` installent des écrans qui ne compilent pas. Le lockfile enregistre pourtant des dépendances jamais installées, ce qui donne une fausse impression d'intégrité.

---

#### P0-04 — Les manifestes de composants sous-déclarent les dépendances

**Preuve**
Audit des imports réels vs `dependencies` + `expoDependencies` : **27 anomalies** (22 paires composant/dépendance + 5 templates).

| Composant | Package utilisé | Déclaré ? |
|---|---|---|
| `accordion` | `expo-haptics` | ❌ |
| `calendar` | `expo-haptics` | ❌ |
| `color-picker` | `expo-haptics` | ❌ |
| `command` | `expo-haptics` | ❌ |
| `copy-button` | `@expo/vector-icons` | ❌ |
| `copy-button` | `expo-haptics` | ❌ |
| `floating-label-input` | `react-native-reanimated` | ❌ |
| `hold-button` | `@expo/vector-icons` | ❌ |
| `hold-button` | `react-native-reanimated` | ❌ |
| `inline-edit` | `@expo/vector-icons` | ❌ |
| `like-button` | `@expo/vector-icons` | ❌ |
| `like-button` | `react-native-reanimated` | ❌ |
| `navigation-menu` | `expo-haptics` | ❌ |
| `number-input` | `@expo/vector-icons` | ❌ |
| `otp-input` | `expo-haptics` | ❌ |
| `password-strength` | `@expo/vector-icons` | ❌ |
| `rating` | `expo-haptics` | ❌ |
| `reorderable-list` | `@expo/vector-icons` | ❌ |
| `swipe-action-button` | `@expo/vector-icons` | ❌ |
| `swipeable-row` | `expo-haptics` | ❌ |
| `tag-input` | `@expo/vector-icons` | ❌ |
| `video` | `expo-video` | ❌ |
| `auth`, `commerce`, `minimal`, `onboarding`, `showcase` (templates) | `react-native-safe-area-context` | ❌ |

**Dépendances liquid non déclarées** (transitives, invisibles pour `dependency-resolver`) :

| Dépendance | Composants liquid concernés | Déclarée ? |
|---|---|---|
| `expo-linear-gradient` | **38/38** | ❌ partout |
| `expo-blur` | **34/38** | ❌ |
| `react-native-reanimated` | **22/38** | ❌ |

Exemple emblématique : `packages/ui-mobile/registry/components/button.json:9-10` déclare `dependencies: []` et `expoDependencies: []`, alors que `button.tsx:14-17` importe `liquid/*` et que `liquid/liquid-pressable.tsx:21-27` importe `react-native-reanimated` et `expo-haptics`.

**Impact**
Même si `add` copiait correctement les fichiers, l'application planterait à l'exécution (`Unable to resolve module`) ou au build natif.

---

#### P0-05 — Le résolveur ignore silencieusement les dépendances absentes

**Preuve**
- `packages/cli/src/core/dependency-resolver.ts:87-88` : `const entry = loadComponentEntry(...); if (!entry) continue;`.
- `packages/cli/src/core/dependency-resolver.ts:92-106` : une dépendance Expo absente de la matrice est résolue en `"latest"` (`compatMatrix?.[dep] ?? "latest"`), sans avertissement.
- `packages/cli/src/core/dependency-resolver.ts:112-114` : les `requiresComponents` sont ajoutés à la file, mais un nom sans manifeste (`text`, `view`) disparaît sans trace.

**Impact**
Un plan d'installation peut être **vide** tout en étant considéré comme valide. C'est le mécanisme qui transforme une erreur de registre en « succès » CLI.

---

#### P0-06 — Une config désynchronisée produit un faux succès et un template incomplet

**Preuve**
- `packages/cli/src/commands/add.ts:290-292` : un composant explicitement demandé est filtré si `isComponentInstalled(config, c.name)` est vrai ; **aucune vérification de l'existence des fichiers**.
- `packages/cli/src/commands/add.ts:383-392` : si le plan est vide, `add` affiche « Tous les composants sélectionnés sont déjà installés » et sort en succès.
- `packages/cli/src/commands/add.ts:650-651` : le résumé « Installation terminée » est imprimé sans agrégation des échecs.
- Test réel `rs-audit-desync` : `button` marqué installé, fichier absent → `add -t minimal` saute `button` et affiche un succès.

**Impact**
La désynchronisation `rashwright-ui.json` ↔ système de fichiers est auto-entretenue : plus l'utilisateur corrige manuellement, plus le CLI croit que tout va bien.

---

#### P0-07 — Registre distant : plan vide possible car l'index est téléchargé avant les composants

**Preuve**
- `packages/cli/src/core/remote-registry.ts:123-148` : `resolveRegistry()` ne télécharge que `registry/index.json`.
- `packages/cli/src/commands/add.ts:256` : `resolveDependencies()` lit les manifestes locaux dans `resolved.registryRoot`.
- `packages/cli/src/commands/add.ts:446-452` : `ensureComponentDownloaded()` n'est appelé **qu'après** la résolution, et seulement pour les composants déjà présents dans `plan.components`.
- `packages/cli/src/core/remote-registry.ts:194-196` : un échec de téléchargement de manifeste retourne `null` silencieusement.
- `packages/cli/src/core/remote-registry.ts:210-212` : un échec de téléchargement de fichier source est avalé par un `catch` vide.

**Impact**
Avec un cache ne contenant que `index.json` (premier lancement ou cache partiel), `add button` peut résoudre 0 composant et afficher un succès. C'est un cas de « succès trompeur » difficile à diagnostiquer.

---

### 4.2 P1 — Registry, résolveur, moteur de versions

#### P1-01 — Dérive systématique des versions entre manifestes et index

**Preuve**
- `packages/ui-mobile/registry/index.json:2` : `"version": "1.6.0"`, `totalComponents: 79`, `sdkVersions: [54,55,56,57,58]`.
- Les 79 manifestes `registry/components/*.json` portent `"version": "1.0.0"` (ex. `button.json:3`).
- Les 10 `template.json` sont en `1.0.0` (4) ou `1.0.1` (6), les 6 `widget.json` en `1.0.0`.
- `packages/cli/src/commands/update.ts:114` : `hasUpdate = entry.version !== installedVersion`; comme `entry.version` vaut `1.0.0`, `update` ne proposera **jamais** la version 1.6.0 à un utilisateur déjà en 1.0.0.
- `packages/ui-mobile/registry/index.json` déclare `sdkVersions` jusqu'à 58, alors que `expo-detector.ts:4` supporte 59 et que `versions/expo-59.json` existe.

**Impact**
Le versioning est décoratif. Les utilisateurs ne peuvent pas détecter les corrections apportées entre 1.0.0 et 1.6.0.

---

#### P1-02 — `sync-registry` dérive et sa whitelist est incomplète

**Preuve**
- Une exécution réelle de `bun run sync-registry` a modifié **10 manifestes** :
  `copy-button`, `floating-label-input`, `hold-button`, `inline-edit`, `like-button`, `number-input`, `password-strength`, `reorderable-list`, `swipe-action-button`, `tag-input`.
  → Preuve que les manifestes committés ne sont pas synchronisés avec les sources.
- `scripts/sync-registry.ts:46` : `EXPO_PKGS` est une whitelist manuelle.
- `expo-video` (utilisé par `video`) n'est pas reconnu, donc `sync-registry` ne corrige pas `video`.
- `scripts/sync-registry.ts:148` : `usesLiquid` est calculé sur les imports internes **après filtrage des imports `liquid/`** (ou de façon incohérente selon les branches), ce qui produit des manifestes `supportsGlass`/dépendances erronés.
- Le patch des 10 manifestes corrigés est sauvegardé dans `%TEMP%/opencode/sync-registry-drift.patch` et a été annulé pour laisser le tree propre.

**Impact**
`sync-registry` n'est pas une source de vérité fiable ; il faut le considérer comme un outil à réparer avant de l'utiliser en CI.

---

#### P1-03 — Matrices Expo incomplètes et fallback `"latest"`

**Preuve**
- `packages/ui-mobile/registry/versions/expo-54.json` … `expo-59.json` : aucune matrice ne contient `expo-router`, `expo-constants`, `expo-linking`, `expo-system-ui`, `expo-application`, `expo-device`, `expo-document-picker`, `expo-file-system` (selon SDK).
- `packages/cli/src/core/dependency-resolver.ts:93` : `compatMatrix?.[dep] ?? "latest"`.
- `packages/cli/src/core/package-manager.ts:13-19` : `SUPPORTED_SDK_VERSIONS = [54..58]`, `LATEST_SUPPORTED_SDK = 58`.
- `packages/cli/src/core/expo-detector.ts:4` : `[54..59]`.

**Impact**
`expo install` est appelé avec des versions `"latest"` ou des versions incohérentes, ce qui peut installer des packages incompatibles avec le SDK du projet. Le support SDK 59 est annoncé côté détecteur mais refusé côté `init`.

---

#### P1-04 — Le validateur de schéma n'est jamais utilisé par le CLI

**Preuve**
- `packages/cli/src/core/schema.ts:41` : `validateRegistryItem()` existe.
- Seuls `packages/cli/tests/headless-primitives.test.ts` l'importent. **Aucun code de production** ne l'appelle.
- `scripts/validate-registry.ts:163-177` : `REQUIRED` est déclaré mais jamais lu (aucune référence après la déclaration).
- `scripts/validate-registry.ts` ne référence **ni templates ni widgets** ; aucune validation des champs `type`, versions, matrices SDK.

**Impact**
Les manifestes invalides passent la CI. C'est exactement ce qui a permis à 79 manifestes sans `type` et à des dizaines de dépendances manquantes d'être publiés.

---

#### P1-05 — `readConfig` masque les JSON invalides

**Preuve**
- `packages/cli/src/core/config-manager.ts:75-81` : `readConfig()` retourne la config par défaut si le JSON est invalide, avec un `catch` silencieux.

**Impact**
Une config corrompue est interprétée comme « projet non initialisé » ; `add` repart sur des chemins par défaut et peut écrire au mauvais endroit sans alerter.

---

#### P1-06 — `resolveSdkVersion` retombe silencieusement sur 58

**Preuve**
- `packages/cli/src/core/package-manager.ts:25-38` : toute valeur non reconnue (y compris `59`) retourne `LATEST_SUPPORTED_SDK` (58).
- `packages/cli/src/commands/init.ts:235` : `resolvedSdk = resolveSdkVersion(options.sdk)`.

**Impact**
`rs-ui init --sdk 59` initialise en réalité un projet SDK 58 sans avertissement.

---

### 4.3 P1 — Cycle de vie, intégrité et suppression

#### P1-07 — `doctor` produit des faux positifs et des faux négatifs

**Preuve**
- `packages/cli/src/commands/doctor.ts:192-194` : vérifie en dur `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, indépendamment des composants installés.
- `packages/cli/src/commands/doctor.ts:142-158` : l'intégrité se limite aux fichiers du lockfile ; un composant `untracked` est compté comme OK.
- Aucune vérification des imports locaux (`@/contexts/theme-context`, `./liquid/*`, `./text`).
- Test réel : `doctor` signale des dépendances manquantes sur un projet vierge qui n'a aucun composant, et ne détecte pas les fichiers locaux manquants.

**Impact**
`doctor` ne peut pas servir de garde-fou avant release.

---

#### P1-08 — `info` déclare « Intact » un composant aux imports cassés

**Preuve**
- `packages/cli/src/commands/info.ts:63-68` : `checkComponentIntegrity()` se base uniquement sur les hashes du lockfile.
- `packages/cli/src/commands/info.ts:106-108` : `clean` → « Intact (identique à la source) ».
- Test réel : `info button` affiche « Intact » alors que `button.tsx` importe des fichiers absents.

**Impact**
L'utilisateur reçoit une confirmation fausse au moment où il diagnostique.

---

#### P1-09 — `update` est inopérant et masque les échecs

**Preuve**
- `packages/cli/src/commands/update.ts:114` : comparaison à `entry.version` (1.0.0), jamais à `index.version` (1.6.0).
- `packages/cli/src/commands/update.ts:307-315` : échec de `expo install` avalé avec un simple warning.
- `packages/cli/src/commands/update.ts:117-138` : le diff est calculé sur un seul fichier local, pas sur l'ensemble des fichiers du composant.
- `packages/cli/src/commands/update.ts:331` : « Smart Update terminé avec succès » est affiché même si des updates ont échoué.

**Impact**
`update` ne peut pas livrer de correctifs ; il donne l'illusion d'un cycle de mise à jour.

---

#### P1-10 — `init --dry-run` écrit quand même la config, et le lockfile est incohérent

**Preuve**
- `packages/cli/src/commands/init.ts:713` : `writeConfig(...)` n'est **pas** protégé par `!options.dryRun`.
- `packages/cli/src/commands/init.ts:686-689` : la config enregistre les composants starter en `"1.0.0"`.
- `packages/cli/src/commands/init.ts:716-726` : le lockfile les enregistre en `"0.3.0"`.
- `packages/cli/src/commands/init.ts:591` : `setupFoundations()` est appelé sans vérifier si des fondations personnalisées existent déjà (écrasement).

**Impact**
`--dry-run` n'est pas fiable ; l'écart `0.3.0` / `1.0.0` fausse `update` et `doctor` dès l'initialisation.

---

#### P1-11 — `remove` (template/widget/composant) laisse des états incohérents

**Preuve**
- `packages/cli/src/commands/template.ts:191-194` : chemins hardcodés `components/templates` et `src/components/templates`, ignorant `config.componentsPath`.
- `packages/cli/src/commands/template.ts:217-219` : suppression du dossier sans mise à jour du lockfile.
- `packages/cli/src/commands/widget.ts:201-204` : mêmes chemins hardcodés.
- `packages/cli/src/commands/widget.ts:227-230` : `removeLockedWidget()` est appelé, mais `config.components` n'est jamais concerné (les widgets n'y sont pas enregistrés).
- `packages/cli/src/commands/remove.ts:57` : `remove` cherche `componentsPath/${name}.tsx`, donc `remove hook:use-responsive` / `lib:upload` ne fonctionne pas.
- `packages/cli/src/commands/add.ts:494-497` : le lockfile préfixe **tous** les fichiers par `config.componentsPath`, y compris `hooks/...` et `lib/...` → chemins lockés faux.

**Impact**
Après suppression, `doctor`/`info` continuent de croire à l'installation ; les chemins lockés des hooks/libs sont immédiatement « missing ».

---

#### P1-12 — Routage des hooks/libs et layout personnalisé

**Preuve**
- `packages/cli/src/core/file-manager.ts:42-52` : les fichiers `hooks/` et `lib/` sont routés vers `projectRoot` (+`src`), tandis que les composants vont dans `componentsPath`. Cette logique est correcte à la copie, mais n'est pas reflétée dans le lockfile (voir P1-11).
- `packages/cli/src/core/file-manager.ts:48-52` : le layout custom (`componentsPath` != `src/components/ui`) est partiellement géré pour les composants, pas pour les hooks/libs.

**Impact**
Les hooks/libs installés sont mal suivis par l'intégrité et les commandes de suppression.

---

### 4.4 P2 — Validation, tests, documentation

#### P2-01 — `validate-registry` ne valide pas les nouveaux artefacts

**Preuve**
- `scripts/validate-registry.ts` ne contient aucune occurrence de `templates` ou `widgets`.
- `REQUIRED` (lignes 163-177) n'est jamais utilisé.
- Aucun contrôle : `type` des items, cohérence `index.version` ↔ manifestes, matrices SDK, dépendances réellement importées, cycles templates/widgets.
- `validateRegistryItem` n'est pas appelé (voir P1-04).

**Impact**
La CI est structurellement incapable de détecter les défauts P0/P1 de cet audit.

---

#### P2-02 — `smoke:all` n'exerce pas les parcours critiques

**Preuve**
- `packages/cli/package.json` : `"smoke:all": "bun run smoke:version && bun run lint:require && bun run lint:shebang && bun run smoke:dep-ui"`.
- `scripts/cli-smoke-commands.mjs` (qui exécute `info button`, `list`, etc.) n'est **pas** inclus dans `smoke:all`.
- Aucun smoke ne lance `init`, `add`, `template add` ou `widget add` dans un projet réel.
- Les deux smoke (`smoke:commands`, `smoke:dep-ui`) utilisent `execSync` avec un `catch` qui affiche `WARN/INFO` : un échec de commande n'échoue pas le script.

**Impact**
Les régressions d'installation ne peuvent pas être détectées par le quality gate actuel.

---

#### P2-03 — Les tests sont majoritairement unitaires

**Preuve**
- `packages/cli/tests/e2e-widget-install.test.ts` teste `detectMissing*` et le lockfile ; il **n'exécute jamais** `add` ni `widget add`.
- Aucun test n'installe un composant/template/widget dans un projet temporaire puis ne vérifie les imports (typecheck ou résolution de modules).
- `add-template.test.ts`, `add-widget.test.ts`, `template-command.test.ts`, `widget-command.test.ts` testent les détecteurs/registres, pas le résultat sur disque.

**Impact**
Les 245 tests verts donnent une fausse assurance. Le parcours utilisateur principal n'est pas couvert.

---

#### P2-04 — La documentation contredit le code

| Document | Affirmation | Réalité |
|---|---|---|
| `VALIDATION.md:39` | `C-1 : expoDependencies validées et autorisées` | Le validateur ne vérifie pas les templates/widgets et 27 dépendances manquent |
| `VALIDATION.md:40` | `C-2 : version uniforme 1.6.0` | Les manifestes sont en `1.0.0` |
| `VALIDATION.md:41` | `W-1 : 6 widgets valides` | `validate-registry` n'inspecte pas les widgets |
| `VALIDATION.md:42` | `T-1 : 10 manifestes template valides` | `validate-registry` n'inspecte pas les templates |
| `VALIDATION.md:69` | 245 tests « 100 % » | Vrai quantitativement, mais aucun E2E d'installation |
| `TASK.md:5` | `v1.6.0 Validée & Prête` | Non : `add` produit des installations cassées |
| `ANALYSIS.md:1-5` | `v0.7.3`, 61 composants, 155 tests | Obsolète (79 composants, 245 tests) |
| `architecture.md:126` | liste de dépendances Expo installées | Ne correspond ni aux matrices ni aux manifestes |

**Impact**
Un mainteneur qui se fie aux docs valide un produit non fonctionnel. C'est un risque de release majeur.

---

#### P2-05 — `COMPONENT_EXPORTS_MAP` est incomplet

**Preuve**
- `packages/cli/src/core/starter-generator.ts:451` : `COMPONENT_EXPORTS_MAP` contient 74 clés pour 79 composants.
- Manquants : `copy-button`, `expandable-text`, `floating-label-input`, `hold-button`, `inline-edit`, `like-button`, `number-input`, `password-strength`, `reorderable-list`, `swipe-action-button`, `tag-input`.

**Impact**
Le `index.ts` généré n'exporte pas ces composants, même quand leurs fichiers sont copiés. L'import `@/components/ui` est incomplet.

---

#### P2-06 — Hygiène des manifestes

**Preuve**
- Les 79 manifestes de composants n'ont **aucun champ `type`** ; `dependency-resolver.ts:175-177` leur injecte silencieusement `registry:ui`.
- `providers` (ex. `button.json:13-15`) est déclaré mais jamais installé automatiquement.
- `optionalExpoDependencies` est affiché par `info`/`deps` mais jamais installé.
- Aucun test ne vérifie que `index.json` et les manifestes sont cohérents.

**Impact**
Le schéma RFC v4 est partiellement implémenté ; les métadonnées ne sont pas exploitables par les installateurs.

---

## 5. Matrices de preuves consolidées

### 5.1 Couverture des imports internes par le détecteur

| Import interne | Composants concernés | Détecté par `ComponentDetector` ? |
|---|---:|---|
| `@/contexts/theme-context` | 75/79 | ❌ |
| `./liquid/*` | 38/79 | ❌ (exclu ligne 227) |
| `./text` | 32/79 | ❌ |
| `@/constants/glass-theme` | 24/79 | ❌ |
| `@/hooks/use-responsive` / `@/lib/responsive` | 2/79 | ✅ (mapping) |
| `./view` | 1/79 | ❌ |
| **Total avec au moins un import non couvert** | **75/79** | — |

### 5.2 Dépendances liquid

| Dépendance | Manquante dans | Total composants liquid |
|---|---:|---:|
| `expo-linear-gradient` | 38 | 38 |
| `expo-blur` | 34 | 38 |
| `react-native-reanimated` | 22 | 38 |

### 5.3 Matrices SDK

Présence des packages critiques par matrice :

| Package | 54 | 55 | 56 | 57 | 58 | 59 |
|---|---|---|---|---|---|---|
| `expo-router` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-constants` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-linking` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-system-ui` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-application` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-device` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-document-picker` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expo-file-system` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

> Le résolveur retombe alors sur `"latest"` (`dependency-resolver.ts:93`), ce qui rend la matrice décorative pour ces packages.

### 5.4 Fichiers nécessaires vs fichiers installés par `add`

| Catégorie | Installé par `init` | Installé par `add` | Conséquence |
|---|---|---|---|
| `components/ui/<comp>.tsx` | ✅ | ✅ | OK |
| `components/ui/text.tsx`, `view.tsx` | ✅ | ❌ | Imports cassés |
| `components/ui/liquid/*` | ✅ | ❌ | Imports cassés |
| `contexts/theme-context.tsx` | ✅ | ❌ | Imports cassés |
| `constants/theme.ts` | ✅ | ❌ | Imports cassés |
| `constants/glass-theme.ts` | ✅ | ❌ | Imports cassés |
| `stores/theme-store.ts` | ✅ | ❌ | Imports cassés |
| `theme/**` | ✅ | ❌ | Thèmes custom cassés |
| `templates/*` | ✅ | ✅ (copie brute) | Dépendances non installées |
| `widgets/*` | ✅ | ✅ (copie brute) | Dépendances non installées |

---

## 6. Risques et impact

| Risque | Probabilité | Impact | Constat lié |
|---|---|---|---|
| Un utilisateur installe un composant et obtient une app qui ne compile pas | Certaine | Critique | P0-01, P0-02 |
| Le CLI annonce un succès alors que rien n'a été installé | Certaine | Critique | P0-05, P0-06, P0-07 |
| Les templates/widgets officiels ne fonctionnent pas | Certaine | Critique | P0-03 |
| Crash runtime sur une dépendance native absente | Élevée | Critique | P0-04 |
| Impossible de corriger via `update` | Certaine | Majeur | P1-09 |
| `doctor`/`info` rassurent à tort | Certaine | Majeur | P1-07, P1-08 |
| CI incapable de détecter les régressions | Certaine | Majeur | P2-01, P2-02 |
| Confusion des mainteneurs via les docs | Élevée | Majeur | P2-04 |

---

## 7. Limites de cet audit

1. **Pas de test sur un vrai projet Expo créé via `create-expo-app`** : les fixtures reproduisent la structure et les dépendances, mais pas la totalité du runtime Expo. Les tests E2E de sortie restent à faire après suppression de `test-project/`.
2. **Pas de test de publication** : `dry-run` est rouge pour cause de version déjà publiée ; aucun bump n'est autorisé.
3. **Pas de test réseau réel** du registre distant (CDN/npm) : les défauts P0-07 sont établis par lecture de code, pas par un test réseau.
4. **Pas de test de build natif** (`expo run:ios/android`) : les dépendances natives manquantes sont détectées statiquement.
5. **Le patch `sync-registry-drift.patch` n'a pas été appliqué** : le tree est intentionnellement resté propre pour que l'audit soit non destructif.
6. **`test-project/` est encore présent et suivi par git** : il n'a pas été utilisé ni modifié.

---

## 8. Conclusion

Le dépôt possède une base technique réelle (79 composants, 10 templates, 6 widgets, un CLI riche, 245 tests, une architecture modulaire), mais **le moteur d'installation n'est pas fiable**. Les défauts P0 sont tous reproductibles et convergent vers un même problème de conception :

> **Le CLI ne modélise pas l'ensemble des fichiers nécessaires à un composant, et il n'a aucune validation post-installation.**

Le plan de correction est détaillé dans `IMPLEMENTATION-PLAN.md`. Aucune correction de code ne doit être lancée avant validation de ce plan.

---

## Annexe A — Commandes de reproduction

```bash
# Baseline
bun install
bun run validate-registry
bun run check-types
bun run test
bun run build:cli
bun run validate-maestro
bun run quality
bun run dry-run   # échoue : 1.6.0 déjà publié

# Installation réelle (fixture vierge)
# C:\Users\user\AppData\Local\Temp\opencode\rs-virgin
bun run packages/cli/src/index.ts add button --yes --no-skills
# Constat : 2 fichiers copiés, imports cassés, exit 0

# Template
bun run packages/cli/src/index.ts add -t minimal --yes --no-skills
# Constat : succès affiché, imports de thème non résolus

# Widget
bun run packages/cli/src/index.ts add -w metric --yes --no-skills
# Constat : succès affiché, `@/components/ui/text` et `@/contexts/theme-context` non résolus

# Dérive sync-registry (sauvegardée puis annulée)
bun run sync-registry
git checkout -- packages/ui-mobile/registry/components
```

## Annexe B — Inventaire

| Artefact | Nombre |
|---|---:|
| Composants UI (registre) | 79 |
| Sources composants déclarées | 79 |
| Hooks déclarés | 5 |
| Librairies déclarées | 2 |
| Templates autonomes | 10 |
| Widgets modulaires | 6 |
| Matrices SDK | 6 (`expo-54` … `expo-59`) |
| Fichiers de test | 51 |
| Tests | 245 |
| Manquements `requiresComponents` / imports internes | 75 composants sur 79 |
| Dépendances directes non déclarées | 22 (+5 templates) |
