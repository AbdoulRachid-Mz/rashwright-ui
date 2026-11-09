# IMPLEMENTATION-PLAN — Remise en état du moteur d'installation `rs-ui`

**Projet :** Rashwright UI Mobile / `@rashwright/cli` v1.6.0
**Document de référence :** `AUDIT-REPORT.md`
**Statut :** **APPROUVÉ SOUS RÉSERVE** — décisions et renforcements verrouillés le 2026-11-08.
La Phase 0 peut démarrer. Chaque phase suivante nécessite une revue explicite avant passage à la suivante.
**Contraintes absolues :**
- Aucun bump de version.
- Aucune publication npm / release GitHub.
- Aucune suppression de fonctionnalité ni de compatibilité avec les projets existants.
- Aucun fallback silencieux, `catch` vide, `--force` systématique ou validation supprimée.
- Aucun succès affiché sans vérification réelle du résultat.

---

## 1. Objectif de sortie

À la fin du plan, les trois parcours suivants doivent produire des modules **pleinement fonctionnels, dépendances comprises**, dans un projet Expo vierge **et** dans un projet existant :

```bash
rs-ui add button
rs-ui add -t minimal
rs-ui add -w metric
```

« Pleinement fonctionnel » signifie :

1. tous les fichiers nécessaires sont présents sur disque ;
2. tous les imports internes et externes sont résolus ;
3. toutes les dépendances npm/Expo déclarées sont installées ;
4. `tsc --noEmit` passe sur le projet cible ;
5. le lockfile et `rashwright-ui.json` reflètent exactement l'état du disque ;
6. `rs-ui doctor` et `rs-ui info` confirment l'intégrité sans faux positif ;
7. une suppression puis réinstallation redonne le même résultat.

---

## 2. Principes de correction

1. **Une seule source de vérité par artefact.**
   Les manifestes du registre décrivent l'installation ; `sync-registry` les produit depuis les sources ; `validate-registry` les vérifie ; le CLI les consomme.
2. **Fail-fast, jamais fail-silent.**
   Toute dépendance introuvable, tout fichier manquant, tout échec de copie ou d'installation doit produire une erreur explicite et un exit code non nul (sauf `--dry-run`).
3. **Fondations de premier ordre.**
   Les fondations (`theme-context`, `glass-theme`, `theme-store`, `constants/theme`, `theme/**`, primitives `text`/`view`, `liquid/*`) deviennent des artefacts du registre, résolubles comme n'importe quelle dépendance.
4. **Le succès se prouve.**
   L'installation se termine par une passe de vérification (fichiers + imports + dépendances) ; le message final dépend de cette passe.
5. **Compatibilité ascendante.**
   Les anciens `rashwright-ui.json` (composants en `string` ou en objet) et les anciens lockfiles doivent rester lisibles ; les migrations sont documentées et idempotentes.
6. **Pas de double implémentation.**
   On corrige les modules existants ; on ne crée pas un second moteur parallèle.

### 2.1 Graphe de dépendances complet (renforcement A)

Le résolveur ne doit jamais se limiter aux imports directs. Il construit un graphe orienté acyclique avant toute écriture :

```
button
 ├── text
 │    └── theme-context
 │         └── theme-store
 ├── liquid
 │    ├── glass-theme
 │    └── expo-linear-gradient
 └── constants/theme
```

- **Dépendances internes** : composants, fondations, hooks, librairies.
- **Dépendances externes** : packages npm et Expo.
- **Dépendances système** : configuration Babel, Metro, Tailwind/NativeWind, providers, aliases TypeScript.
- Le graphe est **transitif**, **dédupliqué**, **anti-cycle** et produit un **plan complet inspectable avant la première écriture**.
- Les trois familles restent séparées dans le plan ; elles ne sont jamais fusionnées en une seule liste de packages.

### 2.2 Installation transactionnelle avec rollback documenté (renforcement B)

Le processus d'installation suit un ordre strict :

1. construire et valider le plan complet ;
2. vérifier les conflits avec le projet existant ;
3. préparer les fichiers et les modifications de configuration ;
4. exécuter les installations externes nécessaires ;
5. vérifier le résultat ;
6. enregistrer l'état dans `rashwright-ui.json` et le lockfile ;
7. en cas d'échec, restaurer les fichiers et configurations modifiés lorsque c'est possible, puis signaler explicitement toute opération externe non annulable.

**Limite assumée :** une installation npm/Expo n'est pas toujours parfaitement réversible. Le plan ne promet pas une atomicité impossible ; il garantit un rollback local documenté et un rapport clair des opérations externes non annulées.

### 2.3 Vérification indépendante du lockfile (renforcement C)

Le lockfile n'est jamais une preuve de présence. Une même représentation fiable de l'état alimente `doctor`, `info`, `why` et `update` :

| Élément | Vérification |
|---|---|
| Fichiers | existence réelle sur disque |
| Imports locaux | résolution effective (relatifs, alias, `tsconfig.paths`) |
| Packages | présence dans `package.json` et, si disponible, dans `node_modules` |
| Fondations | présence de toutes les dépendances internes |
| Configurations | alias et chemins cohérents |
| Lockfile | correspondance avec l'installation réelle |
| TypeScript | compilation du projet cible (quand `node_modules` et `tsconfig` le permettent) |

### 2.4 Dépendances inverses pour `remove` et `update` (renforcement D)

Un composant peut être utilisé par un template, un widget ou un autre composant. Avant toute suppression ou mise à jour :

- calculer les **dépendances inverses** ;
- expliquer les conséquences ;
- demander confirmation ou refuser ;
- ne jamais supprimer aveuglément une fondation encore utilisée.

### 2.5 Compatibilité avec les projets existants

Le CLI ne suppose jamais une structure unique. Il doit détecter et respecter :

- présence ou absence de `src/` ;
- aliases `@/*` ou personnalisés ;
- `componentsPath` personnalisé ;
- Expo Router ou navigation classique ;
- NativeWind v4 ou v5 ;
- providers et contextes déjà présents ;
- versions React Native, Expo et TypeScript ;
- dépendances déjà installées et leurs versions.

Le moteur adapte l'installation au projet ; il ne force pas le projet à adopter sa structure.

### 2.6 Alignement sur `prompt.md`

Les recommandations de `prompt.md` sont intégrées au fil des phases :

- registre structuré et validé (Phase 1) ;
- dépendances récursives (Phases 3 et 5) ;
- configuration projet avec aliases personnalisés (Phases 4 et 5) ;
- namespaces de registres (Phase 7) ;
- résolution avant installation (Phase 3) ;
- commandes cohérentes pour tous les types (Phase 7) ;
- skills ciblés (Phase 8) ;
- détection des versions et modifications locales (Phases 6 et 7).

---

## 3. Architecture cible (résumé)

```
registry/
  index.json                     # version, totalComponents, sdkVersions 54..58
  components/*.json              # 79 items, type + versions + deps complètes
  foundations/**/*.json          # NOUVEAU : items de fondation (theme, glass, text, view, liquid)
  hooks/*.json                   # hooks
  lib/*.json                     # libs
  versions/expo-*.json           # matrices complètes
templates/*/template.json        # deps + safe-area + fondations
widgets/*/widget.json            # deps + fondations

cli core:
  registry.ts                    # chargement + items de fondation
  dependency-resolver.ts         # résolution complète, fail-fast, avant tout téléchargement
  component-detector.ts          # mappings exhaustifs (theme, glass, liquid, stores, constants)
  installer.ts (ou add.ts refactoré) # plan -> copie -> deps -> vérification -> succès
  verifier.ts (nouveau)          # vérification post-installation (fichiers + imports)
  remote-registry.ts             # téléchargement complet AVANT résolution
  version-manager (package-manager + matrices) # versions SDK cohérentes 54..58
```

> Le découpage exact des fichiers peut être ajusté, mais les responsabilités ci-dessus doivent être séparées et testables.

---

## 4. Phases

Chaque phase est autonome, testable et réversible. L'ordre est impératif : les phases 1–3 conditionnent tout le reste.

---

### Phase 0 — Harnais de tests d'installation réels (bloquant)

**Objectif :** disposer d'un filet de sécurité qui **échoue aujourd'hui** et passera après corrections, sans modifier le comportement produit.

**Décisions appliquées**
- Les tests E2E sont exécutés par un script dédié `bun run test:install-e2e`, **pas** par `bun run test` tant qu'ils sont rouges.
- Les fixtures sont créées sous `%TEMP%` et nettoyées ; `test-project/` n'est jamais utilisé.
- Le CLI est exécuté **réellement** dans un processus enfant, avec un `cwd` contrôlé.
- Les commandes npm/Expo sont interceptées par des shims déterministes qui enregistrent les appels et appliquent leurs effets sur `package.json` (aucun réseau, aucun résultat inventé).
- `tsc --noEmit` est exécuté quand la fixture possède les types nécessaires ; sinon l'analyse d'imports indépendante fait foi et le skip est explicite.
- Les tests sont volontairement rouges avant correction ; le rapport de Phase 0 consigne les échecs réels observés.

**Travaux**
- Créer un utilitaire de test qui :
  1. génère une fixture Expo avec `package.json`, `tsconfig.json`, alias et `rashwright-ui.json` ;
  2. prépare des shims `npm`/`npx` dans un dossier `PATH` temporaire ;
  3. exécute le CLI (`init`, `add`, `doctor`) avec un `cwd` et un `HOME`/`USERPROFILE` isolés ;
  4. snapshot l'arborescence avant/après ;
  5. analyse les imports (relatifs, alias, `tsconfig.paths`, packages externes) ;
  6. exécute `tsc --noEmit` si possible ;
  7. produit un rapport lisible : fichiers copiés, imports non résolus, dépendances absentes, exit code.
- Couvrir les scénarios suivants :
  - `add button` dans un projet sans fondations ;
  - `add button` dans un projet existant sans `src/` ;
  - `add -t minimal` ;
  - `add -w metric` ;
  - config désynchronisée (`missing` / `partial` / `modified`) détectée par `doctor` ;
  - `init --dry-run` sans aucune écriture ;
  - registre distant avec cache index-only (serveur HTTP local) ;
  - alias personnalisés de projet existant.

**Critères de sortie**
- [ ] `bun run test:install-e2e` exécute les scénarios réels et échoue en démontrant les défauts actuels.
- [ ] Chaque scénario produit un rapport lisible (fichiers copiés, imports non résolus, exit code).
- [ ] Aucun test ne dépend de `test-project/` ni d'un état manuel du dépôt.
- [ ] `bun run test` reste vert : les tests rouges ne sont pas intégrés au gate avant la Phase 8.
- [ ] Les échecs observés sont consignés dans `PHASE-0-REPORT.md`.

**Risque :** temps d'exécution. Mitigation : fixtures minimales, shims package manager, `tsc` optionnel, processus enfants parallélisables plus tard.

---

### Phase 1 — Normalisation du registre et de `sync-registry` / `validate-registry`

**Objectif :** rendre les manifestes fiables et auto-vérifiés.

**Travaux**
1. **Réintégrer la dérive connue** :
   - soit appliquer `%TEMP%/opencode/sync-registry-drift.patch` après revue ;
   - soit relancer `sync-registry` après l'avoir corrigé (recommandé).
2. **Corriger `scripts/sync-registry.ts`** :
   - whitelist `EXPO_PKGS` complète (dont `expo-video`, `expo-document-picker`, `expo-file-system`, `expo-constants`, `expo-linking`, `expo-system-ui`, `expo-application`, `expo-device`, `expo-router`) ;
   - calcul `usesLiquid` après analyse des imports réels, sans filtrage préalable ;
   - propager les dépendances des primitives `liquid/*` vers les manifestes qui les utilisent ;
   - détecter les imports internes (`./text`, `./view`, `./liquid/*`, `@/contexts/*`, `@/constants/*`, `@/stores/*`) et les refléter dans `requiresComponents` / `dependencies`.
3. **Compléter les 79 manifestes** :
   - ajouter `"type": "registry:ui"` (ou `registry:hook`/`registry:lib`) ;
   - introduire deux champs distincts : `registryVersion` (version du registre, `1.6.0`) et `version` (version propre de l'artefact) ;
   - aligner `registryVersion` sur `index.version` sans confondre avec la version de l'artefact ;
   - documenter la politique de versioning (un composant peut évoluer indépendamment du registre) ;
   - déclarer les 22 dépendances directes manquantes ;
   - déclarer `expo-linear-gradient`, `expo-blur`, `react-native-reanimated` pour les composants liquid ;
   - corriger `requiresComponents` (au minimum `text`, `view` quand importés).
4. **Compléter les manifestes templates/widgets** :
   - ajouter `react-native-safe-area-context` aux 5 templates concernés ;
   - déclarer `@/contexts/theme-context` comme fondation requise ;
   - vérifier `expoDependencies` de chaque widget.
5. **Étendre `scripts/validate-registry.ts`** :
   - utiliser réellement `REQUIRED` ;
   - appeler `validateRegistryItem` sur chaque item ;
   - valider hooks, libs, templates, widgets ;
   - vérifier `index.version` ↔ manifestes ↔ `sdkVersions` ;
   - vérifier que chaque dépendance importée est déclarée ;
   - vérifier les cycles et les `requiresComponents` fantômes ;
   - produire un code de sortie non nul à la moindre erreur.

**Critères de sortie**
- [ ] `bun run sync-registry` est idempotent (deux exécutions → aucun diff).
- [ ] `bun run validate-registry` : 0 erreur, 0 warning de dépendance, 79 composants + 10 templates + 6 widgets + 5 hooks + 2 libs validés.
- [ ] Les 79 manifestes ont un `type` et des dépendances conformes aux imports.
- [ ] Un test dédié échoue si un import externe n'est pas déclaré.

**Risque :** faux positifs sur des packages optionnels. Mitigation : distinguer `dependencies` / `optionalExpoDependencies` et documenter la règle.

---

### Phase 2 — Fondations comme artefacts de premier ordre

**Objectif :** que `add` sache installer les fichiers socle dont dépendent 75/79 composants.

**Décisions appliquées**
- Les fondations sont décrites par des manifestes `registry/foundations/*.json`, découvrables, validables et versionnables (pas de liste TypeScript codée en dur).
- La réparation d'une configuration désynchronisée est explicite : détection automatique des états `missing`, `partial`, `modified`, puis réparation avec `--repair`.
- Sans `--repair`, le CLI explique le problème et ne prétend jamais que le composant est intact.

**Travaux**
1. Créer des manifestes de fondation (ex. `registry/foundations/theme.json`, `glass.json`, `core-ui.json`, `liquid.json`, `responsive.json`) avec :
   - `files` (chemins source réels) ;
   - `dependencies` / `expoDependencies` ;
   - `requiresComponents` (utile pour `liquid` → `theme-context`).
2. Ajouter `foundation:` (ou `core:`) comme préfixe reconnu par `loadComponentEntry` et `parseScopedComponentName`.
3. Inclure les fondations dans le graphe de résolution :
   - un composant qui importe `@/contexts/theme-context` tire `foundation:theme` ;
   - un composant qui importe `./liquid/*` tire `foundation:liquid` ;
   - `text`/`view` tirent `foundation:core-ui`.
4. Réutiliser `CORE_UI_FILES` et `setupFoundations()` comme implémentation, mais les appeler depuis le moteur d'installation, pas seulement depuis `init`.
5. Rendre les fondations **idempotentes** : ne pas écraser un fichier personnalisé sans `--force` explicite ; en cas de conflit, comparer et avertir.
6. Ajouter `--repair` aux commandes concernées et un état explicite `missing` / `partial` / `modified` / `installed` / `incompatible`.

**Critères de sortie**
- [ ] `rs-ui add button` dans un projet vierge installe `button.tsx` **et** toutes les fondations requises.
- [ ] Aucun import `@/contexts/theme-context`, `@/constants/glass-theme`, `./text`, `./view`, `./liquid/*` n'est non résolu après l'installation.
- [ ] Les fondations ne sont copiées qu'une fois (idempotence).
- [ ] Un projet `init` existant n'est pas cassé si les fondations ont été personnalisées.
- [ ] Sans `--repair`, une config désynchronisée produit un diagnostic explicite, jamais un faux succès.
- [ ] Avec `--repair`, les fichiers manquants sont restaurés et les fichiers modifiés ne sont pas écrasés sans confirmation.

---

### Phase 3 — Moteur de résolution de dépendances

**Objectif :** produire un plan complet, ou échouer explicitement.

**Travaux**
1. **Téléchargement avant résolution** (registre distant) :
   - télécharger l'index **et** les manifestes nécessaires ;
   - résoudre ensuite ;
   - ne jamais retourner un plan partiel à cause d'un manifeste absent.
2. **Supprimer les `continue` silencieux** :
   - si un nom demandé ou requis n'a pas de manifeste → erreur `Dépendance introuvable: <nom> (requis par <parent>)` ;
   - si un fichier déclaré n'existe pas dans la source → erreur.
3. **Résolution récursive complète** :
   - `requiresComponents` + fondations + hooks/libs ;
   - protection anti-cycle avec rapport ;
   - déduplication.
4. **Versions** :
   - ne plus utiliser `"latest"` comme fallback silencieux ;
   - dépendance avec version compatible connue → installation normale ;
   - dépendance Expo avec version compatible inconnue → avertissement explicite + demande de validation ;
   - dépendance critique ou native non résolue → **blocage** ;
   - ne jamais masquer l'incertitude.
5. **Exposer un plan inspectable** :
   - composants, fondations, fichiers, deps npm, deps Expo, deps système, conflits, avertissements ;
   - `--dry-run` doit afficher ce plan sans rien écrire.
6. **Dépendances système** :
   - traiter séparément Babel, Metro, Tailwind/NativeWind, providers et aliases ;
   - ne pas les mélanger avec les packages npm/Expo.

**Critères de sortie**
- [ ] Aucun `continue` / `return null` silencieux dans le chemin de résolution.
- [ ] Un plan vide n'est plus jamais un succès : si des composants sont demandés et que le plan est vide → erreur.
- [ ] Les cycles sont détectés et rapportés.
- [ ] `--dry-run` n'écrit aucun fichier ni lock/config.

**Risque :** rigidité excessive sur des registres partiels. Mitigation : option explicite `--allow-partial` documentée, jamais par défaut.

---

### Phase 4 — Moteur d'installation et vérification post-installation

**Objectif :** garantir que le succès affiché correspond au disque, avec rollback documenté.

**Décisions appliquées**
- Installation transactionnelle : plan complet → conflits → préparation → installations externes → vérification → enregistrement config/lockfile → rollback local en cas d'échec.
- Le rollback restaure les fichiers et configurations locaux modifiés ; il signale explicitement les opérations npm/Expo externes non annulables.
- La vérification est indépendante du lockfile et alimente `doctor`, `info`, `why` et `update`.

**Travaux**
1. **Copie transactionnelle par étape** :
   - agréger les résultats de `copyComponentFiles` ;
   - si un fichier échoue → rollback des fichiers déjà écrits, erreur finale et exit code non nul ;
   - ne pas marquer un composant installé si un de ses fichiers a échoué.
2. **Installation des dépendances templates/widgets** :
   - intégrer `templateDef.expoDependencies` / `widgetDef.expoDependencies` au plan ;
   - installer avant la copie finale ;
   - échec = échec de la commande.
3. **Cohérence config / lockfile / disque** :
   - `config.components` ne contient que les composants réellement installés ;
   - lockfile : chemins corrects pour hooks/libs (pas de préfixe `componentsPath`) ;
   - après copie, recalculer les hashes sur les fichiers réellement écrits.
4. **Vérificateur post-installation** (nouveau module), indépendant du lockfile :
   - existence de tous les fichiers du plan ;
   - résolution effective des imports locaux (relatifs, alias, `tsconfig.paths`) ;
   - présence des packages importés dans `package.json` (et `node_modules` si disponible) ;
   - présence de toutes les fondations ;
   - cohérence des alias et chemins ;
   - cohérence du lockfile avec l'installation réelle ;
   - compilation TypeScript du projet cible quand c'est possible ;
   - rapport `OK` / `ERREUR` structuré, réutilisable par les autres commandes.
5. **Message final conditionnel** :
   - si le vérificateur échoue → `✖ Installation incomplète`, lister les manques, exit 1 ;
   - sinon → `✔ Installation terminée`.
6. **Idempotence et réparation** :
   - `add` sur un composant déjà installé et intact → message « déjà installé », exit 0 ;
   - `add --repair` sur un composant `missing` / `partial` → restauration ;
   - `add` sans `--repair` sur un composant `modified` → diagnostic explicite, pas d'écrasement silencieux.

**Critères de sortie**
- [x] `add button` dans un projet vierge : exit 0 **et** vérificateur OK.
- [x] Simulation d'un fichier source manquant : exit 1, message explicite, rollback des écritures locales.
- [x] Simulation d'une config désynchronisée : diagnostic ou réparation explicite, jamais faux succès.
- [x] Le lockfile d'un hook pointe vers `src/hooks/...`, pas `src/components/ui/hooks/...`.
- [x] `add` ne peut plus afficher « Installation terminée » si un import est non résolu.
- [x] Toute opération externe non annulée est listée dans le rapport d'échec.

**Risque :** la vérification d'imports est sensible aux alias TS. Mitigation : lire `tsconfig.json` (`paths`) et les aliases projet, puis vérifier la résolution réelle fichier par fichier.

---

### Phase 5 — Détecteur de composants exhaustif

**Objectif :** que la détection automatique soit alignée sur la réalité des sources.

**Travaux**
1. Compléter `KNOWN_INTERNAL_MAPPINGS` :
   - `@/contexts/theme-context` → fondation `theme` ;
   - `@/constants/glass-theme` → fondation `glass` ;
   - `@/constants/theme` → fondation `theme` ;
   - `@/stores/theme-store` → fondation `theme` ;
   - `@/theme/*` → fondation `theme` ;
   - `./text`, `./view`, `./liquid/*` → fondations `core-ui` / `liquid` ;
   - `@/hooks/*`, `@/lib/*` existants.
2. Supprimer l'exclusion des imports `liquid` à la ligne 227.
3. Unifier la détection templates/widgets (aujourd'hui dupliquée) dans une fonction commune.
4. Rendre les mappings pilotés par les manifestes de fondation quand c'est possible (éviter deux listes à maintenir).
5. Couvrir les imports `@/components/ui/<autre>` (déjà partiellement fait) et les imports relatifs `../ui/...`.

**Critères de sortie**
- [x] Un test parcourt les 79 sources et vérifie que **chaque** import interne est soit résolu, soit explicitement whitelisté avec justification.
- [x] Les scénarios template/widget détectent les mêmes besoins que le scénario composant.
- [x] Plus aucune dépendance interne n'est « invisible » pour le détecteur.

---

### Phase 6 — Gestionnaire de versions et matrices Expo

**Objectif :** un seul support SDK cohérent, **limité aux SDK réellement publiés par Expo (54 à 58)**. Décision de revue : Expo n'a jamais publié `expo@59` (dernier publié : `58.0.23` à la date de la Phase 6) ; le support 59 et `expo-59.json` sont retirés. Ajouter un SDK futur = une entrée dans la source unique **et** une matrice régénérée depuis les données officielles.

**Travaux**
1. Unifier `SUPPORTED_SDK_VERSIONS` dans une source unique (`sdk-versions.ts`), réexportée par `expo-detector.ts` et `package-manager.ts`.
2. Aligner `registry/index.json#sdkVersions` sur cette liste via `sync-registry`.
3. Régénérer les matrices `expo-54..58` depuis les `bundledNativeModules.json` officiels d'Expo et les templates `expo-template-blank-typescript` (React / React Native réels), avec tous les packages Expo utilisés.
4. `resolveSdkVersion` : ne plus retomber en silence ; `"latest"`/absent → 58 (choix explicite), toute autre valeur inconnue → `UnsupportedSdkVersionError`.
5. `dependency-resolver` :
   - version compatible connue → installation normale ;
   - package Expo absent de la matrice → avertissement explicite + validation ;
   - dépendance critique/native absente → blocage ;
   - jamais de `"latest"` silencieux.
6. `init --sdk <sdk>` : pinner réellement le SDK demandé ; `--sdk 59` / `--sdk 42` échouent explicitement **avant** tout prompt ou création de fichier.
7. Documenter la politique de version (`registryVersion` vs `version` de l'artefact).

**Critères de sortie**
- [x] `rs-ui init --sdk 58` cible réellement le SDK 58 (template pinné `@58`), et `--sdk 59` échoue explicitement car Expo n'a jamais publié ce SDK.
- [x] `rs-ui init --sdk 42` échoue avec un message clair.
- [x] Chaque matrice contient les packages utilisés par au moins un composant/template/widget.
- [x] Plus aucun `"latest"` silencieux dans un plan d'installation réel.

---

### Phase 7 — Cycle de vie : `update`, `remove`, `doctor`, `info`

**Objectif :** que l'état affiché soit l'état réel, et que les suppressions/mises à jour respectent les dépendances inverses.

**Renforcements appliqués**
- Calcul des dépendances inverses avant `remove` et `update`.
- Refus ou confirmation explicite pour supprimer une fondation encore utilisée.
- Namespaces de registres et commandes cohérentes pour tous les types (`component`, `foundation`, `hook`, `lib`, `template`, `widget`).

**Travaux**
1. **`update`** :
   - comparer à `registryVersion` / version de l'index, pas seulement au manifeste ;
   - diff sur l'ensemble des fichiers du composant ;
   - détecter les modifications locales avant écrasement ;
   - échec `expo install` → échec de la commande ;
   - message final conditionnel.
2. **`remove`** :
   - supporter `hook:` / `lib:` / `foundation:` ;
   - utiliser `config.componentsPath` et les chemins du lockfile ;
   - mettre à jour config + lock + index ;
   - `template remove` met à jour le lock ; `widget remove` met à jour le lock et l'état ;
   - calculer les dépendances inverses et demander confirmation ou refuser.
3. **`doctor`** :
   - vérifier les dépendances **réellement requises** par les composants installés ;
   - vérifier l'existence des fichiers locaux (pas seulement les hashes lockfile) ;
   - vérifier les imports locaux ;
   - ne plus compter `untracked` comme OK ;
   - code de sortie non nul en cas de problème.
4. **`info` / `why`** :
   - distinguer « hash identique » de « installation fonctionnelle » ;
   - afficher les imports non résolus et les dépendances manquantes ;
   - `why` s'appuie sur le graphe de dépendances (directes et inverses).
5. **`init`** :
   - `--dry-run` n'écrit rien (config incluse) ;
   - aligner la version du lockfile starter avec la config ;
   - ne pas écraser les fondations personnalisées sans confirmation.
6. **Namespaces** :
   - supporter plusieurs registres sans ambiguïté ;
   - documenter la résolution de conflit de noms.

**Critères de sortie**
- [x] `doctor` échoue sur un projet aux imports cassés.
- [x] `info button` n'affiche plus « Intact » si un import est absent.
- [x] `init --dry-run` ne modifie aucun fichier (vérifié par snapshot).
- [x] `remove text` refuse ou demande confirmation si `minimal-template` en dépend.
- [x] Suppression puis réinstallation → état identique.
- [x] `why <composant>` explique les dépendances directes et inverses.

---

### Phase 8 — Documentation et quality gate de sortie

**Objectif :** aligner les docs sur les faits et empêcher toute régression.

**Travaux**
1. Mettre à jour `ANALYSIS.md` (v1.6.0, 79 composants, 245 tests, état réel).
2. Mettre à jour `TASK.md` (ne plus revendiquer une validation non prouvée ; cocher les tâches réellement faites).
3. Mettre à jour `VALIDATION.md` pour refléter ce que `validate-registry` vérifie réellement.
4. Aligner `architecture.md`/`ARCHITECTURE.md` sur les fondations, les manifestes et le flux d'installation.
5. Ajouter `AUDIT-REPORT.md` et `IMPLEMENTATION-PLAN.md` comme documents de référence.
6. Compléter `smoke:all` avec un vrai smoke d'installation (`add button` dans une fixture) et rendre les smoke bloquants (supprimer les `catch` qui transforment un échec en `WARN`).
7. Ajouter au quality gate :
   - `validate-registry` renforcé ;
   - `test:install-e2e` (une fois vert) ;
   - vérification des imports ;
   - `sync-registry` idempotent en CI.
8. Ajouter un vrai test local de `--dry-run` : snapshot avant/après, aucun fichier modifié.
9. Vérifier la cohérence des Skills IA (`skills/rs-ui/**`) avec les artefacts installables.

**Critères de sortie**
- [ ] `bun run quality` échoue si un import d'un composant installé est non résolu.
- [ ] `bun run quality` échoue si un manifeste est désynchronisé.
- [ ] `bun run quality` inclut `test:install-e2e` et reste vert.
- [ ] `bun run smoke:all` exécute réellement `add button` et vérifie le résultat.
- [ ] Un test `--dry-run` prouve qu'aucun fichier n'est modifié.
- [ ] Les docs ne contiennent plus d'affirmation contredite par le code.

> `bun run dry-run` (publication npm) reste rouge tant que la version 1.6.0 est publiée. **Ne pas le corriger par un bump.** Décision : cette vérification reste **hors du quality gate bloquant** ; le vrai test local `--dry-run` (sans publication) devient, lui, bloquant.

---

## 5. Ordre, dépendances et jalons

| Jalon | Phases | Résultat attendu |
|---|---|---|
| **M0 — Filet** | 0 | Les scénarios réels sont reproductibles et échouent proprement |
| **M1 — Registre fiable** | 1 + 2 | `sync-registry` idempotent, `validate-registry` strict, fondations installables |
| **M2 — Résolution fiable** | 3 | Plan complet ou erreur explicite ; plus de plan vide silencieux |
| **M3 — Installation prouvée** | 4 + 5 | `add` produit un résultat vérifié ; détecteur exhaustif |
| **M4 — Versions** | 6 | SDK 54–58 cohérent (SDK réellement publiés) |
| **M5 — Cycle de vie** | 7 | `update`/`remove`/`doctor`/`info` fiables |
| **M6 — Verrouillage** | 8 | Docs alignées, gate bloquant, E2E réels |

**Dépendances**
- Phase 0 avant toute correction.
- Phase 2 dépend des décisions de Phase 1 (format des manifestes de fondation).
- Phase 4 dépend de Phase 3 (plan complet) et Phase 2 (fondations).
- Phase 7 dépend de Phase 4 (état fiable).
- Phase 8 en dernier.

---

## 6. Compatibilité et migrations

| Élément | Risque | Stratégie |
|---|---|---|
| `rashwright-ui.json` composants en `string` | Faible | `getInstalledVersion` gère déjà les deux formats ; conserver |
| Ancien lockfile (`0.3.0`) | Moyen | Migration idempotente : recalculer les hashes, corriger les chemins hooks/libs, journaliser |
| Projets initialisés avant fondations | Élevé | `add` répare les fondations manquantes ; ne pas écraser les fichiers modifiés |
| `componentsPath` personnalisé | Moyen | Supprimer les chemins hardcodés ; utiliser la config partout |
| Templates/widgets déjà installés | Moyen | Réinstallation idempotente ; lockfile recalculé |
| Anciens manifestes sans `type` | Faible | Le résolveur injecte déjà le type ; le validateur exigera le champ après migration |
| Version `1.0.0` des composants | Moyen | Ne pas bumper les packages ; ajouter `registryVersion` et conserver `version` comme version propre de l'artefact |
| Projet sans `src/` | Élevé | Détecter la structure réelle et adapter `componentsPath`, fondations et lockfile |
| Aliases personnalisés (`~/*`, `@app/*`) | Élevé | Lire `tsconfig.paths` + config projet ; réécrire les imports sans casser les fichiers existants |

> Aucune migration ne doit supprimer un fichier utilisateur sans confirmation. Les migrations doivent être testées sur une fixture « ancien projet ».

---

## 7. Tests et critères d'acceptation globaux

### 7.1 Matrice de tests de sortie

| Scénario | Projet vierge | Projet existant | Critère |
|---|---|---|---|
| `rs-ui init` | ✅ | ✅ | `tsc --noEmit` OK, fondations présentes |
| `rs-ui add button` | ✅ | ✅ | 0 import non résolu |
| `rs-ui add card badge` | ✅ | ✅ | 0 import non résolu |
| `rs-ui add -t minimal` | ✅ | ✅ | template + composants + fondations + safe-area |
| `rs-ui add -w metric` | ✅ | ✅ | widget + composants + fondations |
| `rs-ui add -t auth` | ✅ | ✅ | `expo-haptics` + `safe-area-context` installés |
| `rs-ui remove` puis réinstallation | ✅ | ✅ | état identique |
| `rs-ui doctor` sur installation cassée | ✅ | ✅ | exit non nul |
| `rs-ui update` | ✅ | ✅ | détecte la version du registre |
| `rs-ui info button` | ✅ | ✅ | ne dit pas « Intact » si cassé |
| `--dry-run` | ✅ | ✅ | aucun fichier écrit |

### 7.2 Commandes du quality gate cible

```bash
bun install
bun run sync-registry          # idempotent
bun run validate-registry      # 0 erreur, tous artefacts
bun run check-types            # 0 erreur
bun run test                   # unitaires + intégration
bun run test:install-e2e       # E2E installation réels (actif en Phase 8)
bun run build:cli
bun run smoke:all              # inclut un vrai add
bun run quality
```

`bun run dry-run` (publication npm) reste hors du gate local. Le test local `--dry-run` (aucune écriture) est intégré à `test:install-e2e`.

### 7.3 Definition of Done

- [ ] Aucun `catch {}` vide dans le chemin d'installation.
- [ ] Aucun `continue` / `return null` silencieux sur une dépendance manquante.
- [ ] Aucun succès affiché sans vérificateur post-installation.
- [ ] Tous les fichiers déclarés existent.
- [ ] Toutes les dépendances importées sont déclarées.
- [ ] Tous les imports internes sont résolus après installation.
- [ ] Tous les scénarios de la matrice 7.1 passent.
- [ ] `doctor` et `info` détectent une installation cassée.
- [ ] Les docs sont alignées sur le code.
- [ ] Aucun bump de version, aucune publication.

---

## 8. Risques projet et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Correction partielle qui laisse des faux succès | Critique | Vérificateur post-installation obligatoire dès la Phase 4 |
| Régression sur les 79 composants | Élevé | Tests de résolution sur les 79 sources (Phase 5) + fixtures |
| Écrasement de personnalisations | Élevé | Détection de hash, `--force` explicite, dry-run |
| Explosion du temps de test | Moyen | Fixtures minimales, mocks package manager, tests ciblés |
| Dépendances natives non testables en CI | Moyen | Vérification statique + tests locaux documentés |
| `test-project/` non supprimé | Bloquant E2E | Attendre la suppression complète par l'utilisateur |
| `dry-run` rouge | Moyen | Décision explicite : ne pas bumper ; documenter l'exception |
| Registre distant non testé | Moyen | Test avec serveur mock/local + cache partiel |

---

## 9. Ce qui n'est **pas** dans ce plan

- Publier sur npm ou créer une release GitHub.
- Bumper `1.6.0` → `1.7.0` (ou toute autre version).
- Réécrire l'UI ou changer le design des composants.
- Supprimer des composants/templates/widgets existants.
- Remplacer le CLI par une nouvelle architecture.
- Modifier `test-project/` sans instruction utilisateur.

---

## 10. Décisions verrouillées

| # | Sujet | Décision appliquée |
|---|---|---|
| 1 | Version des manifestes | `registryVersion` (registre, `1.6.0`) distinct de `version` (artefact) ; pas de confusion, pas de bump produit. |
| 2 | Fondations | Manifestes `registry/foundations/*.json`, découvrables, validables et versionnables. |
| 3 | Config désynchronisée | Détection automatique `missing` / `partial` / `modified` ; réparation explicite avec `--repair` ; sans `--repair`, diagnostic clair et aucun faux succès. |
| 4 | Matrices Expo | Version connue → installation normale ; Expo inconnu → avertissement + validation ; critique/natif non résolu → blocage ; jamais de `latest` silencieux. |
| 5 | `dry-run` de publication | Hors quality gate bloquant (1.6.0 déjà publié) ; ajout d'un vrai test local `--dry-run` prouvant qu'aucun fichier n'est modifié. |
| 6 | Ordre d'exécution | Phase 0 + Phase 1, revue, puis point de contrôle après chaque phase majeure. |

Les renforcements A (graphe complet), B (installation transactionnelle), C (vérification indépendante du lockfile) et D (dépendances inverses) sont intégrés aux sections 2.1–2.4 et aux phases 3, 4 et 7.

---

## 11. Phasage et points de contrôle

| Revue | Après phase | Livrable à examiner |
|---|---|---|
| R0 | Plan validé | Ce document |
| R1 | Phase 0 | Harnais E2E, échecs réels consignés, `bun run test` toujours vert |
| R2 | Phase 1 | Diff registre, `sync-registry` idempotent, `validate-registry` strict |
| R3 | Phase 2 | Fondations installables, `--repair`, compatibilité projets existants |
| R4 | Phase 3 | Graphe complet, plan inspectable, aucun fallback silencieux |
| R5 | Phase 4 | Installation transactionnelle, vérificateur indépendant, rollback documenté |
| R6 | Phase 5 | Détecteur exhaustif, alias personnalisés |
| R7 | Phase 6 | SDK 54–58 cohérent, matrices réelles complètes |
| R8 | Phase 7 | `update` / `remove` / `doctor` / `info` / `why` fiables, dépendances inverses |
| R9 | Phase 8 | Docs alignées, quality gate final, E2E verts |

**Règle de progression :** aucune phase suivante ne démarre sans revue explicite de la phase précédente.

**Prochaine action attendue :** exécution de la Phase 0 uniquement, puis revue (R1) avant toute correction fonctionnelle.
