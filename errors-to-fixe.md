# 🚀 RASHWRIGHT UI MOBILE — PROMPT MAÎTRE D’AUDIT ET DE CORRECTION

Tu travailles sur le projet **Rashwright UI Mobile**, un système de distribution de composants React Native / Expo inspiré de la philosophie shadcn/ui.

Le projet contient notamment :

* `@rashwright/ui-mobile`
* `@rashwright/cli`
* commande CLI `rs-ui`
* registry de composants
* installation de composants dans les projets consommateurs
* thèmes
* Liquid Glass
* Skills IA
* starter project
* lockfile
* doctor
* reset
* tests Vitest
* support Expo SDK multiples
* support npm / pnpm / yarn / Bun

## ⚠️ RÈGLE PRINCIPALE

Ne fais **pas** une simple modification locale pour faire disparaître les erreurs.

Tu dois faire un **audit cohérent de l'architecture**, corriger les causes racines et vérifier que les corrections n'introduisent pas de régression.

Le code doit rester :

* TypeScript strict
* sans `any`
* compatible Windows
* compatible macOS/Linux
* idempotent
* testable
* maintenable
* cohérent avec l'architecture existante
* compatible avec la philosophie shadcn : le code des composants est copié dans le projet utilisateur
* compatible avec Expo
* compatible avec npm / pnpm / yarn / Bun

**Ne réécris pas inutilement l'architecture existante.**
Réutilise les fonctions/modules déjà présents lorsqu'ils sont corrects.

---

# 1. OBJECTIF GLOBAL DE CETTE CORRECTION

Le comportement actuel de :

```bash
rs-ui init
```

doit être profondément amélioré.

Actuellement, le processus peut :

1. lancer `create-expo-app`
2. laisser Expo afficher son propre prompt SDK
3. installer une première fois des dépendances
4. faire ensuite un reset/nettoyage
5. installer à nouveau les dépendances Rashwright
6. générer le projet final

Ce comportement doit disparaître.

## Nouveau principe

`rs-ui` doit être **le seul orchestrateur interactif**.

Le processus attendu est :

```text
rs-ui init
        ↓
Banner Rashwright
        ↓
Toutes les questions rs-ui
        ↓
Résumé de configuration
        ↓
Confirmation
        ↓
Création minimale du squelette Expo
        ↓
AUCUNE installation pendant le bootstrap
        ↓
Génération complète Rashwright
        ↓
Configuration
        ↓
Composants
        ↓
Themes
        ↓
Skills
        ↓
Showcase
        ↓
Config
        ↓
Lockfile
        ↓
UNE SEULE phase d'installation
        ↓
Vérification finale
```

Il ne doit plus y avoir de double installation.

---

# 2. COMMENCER PAR UN AUDIT DU REPOSITORY

Avant de modifier le code :

1. inspecte toute l'architecture du CLI
2. identifie les fichiers concernés par `init`
3. inspecte :

   * `init.ts`
   * `package-manager.ts`
   * `expo-detector.ts`
   * `project-detector.ts`
   * `starter-generator.ts`
   * `config-manager.ts`
   * `lock-manager.ts`
   * `file-manager.ts`
   * `skills-manager.ts`
   * `templates-manager.ts`
   * composants Rating
   * Skills Rating
   * tests
4. recherche globalement :

   * `baseUrl`
   * `ignoreDeprecations`
   * `"5.0"`
   * `"6.0"`
   * `create-expo-app`
   * `--template`
   * `npx`
   * `bunx`
   * `pnpm dlx`
   * `yarn dlx`
   * `resetExpoProject`
   * `SUPPORTED_SDK_VERSIONS`
   * `rating`
5. comprends les relations entre les modules avant de modifier.

Ne crée pas de doublons fonctionnels.

---

# 3. NOUVEAU FLOW `rs-ui init`

## 3.1 Banner

Au lancement de :

```bash
rs-ui init
```

afficher un banner Rashwright.

Créer si nécessaire un module commun :

```text
src/cli/banner.ts
```

ou emplacement équivalent cohérent avec l'architecture existante.

Exemple :

```ts
import chalk from "chalk";

const LOGO = `
██████╗ ███████╗
██╔══██╗██╔════╝
██████╔╝███████╗
██╔══██╗╚════██║
██║  ██║███████║
╚═╝  ╚═╝╚══════╝
`;

export function printBanner(command?: string): void {
  console.log();
  console.log(chalk.bold.cyan(LOGO));
  console.log(
    chalk.bold("  Rashwright UI Mobile") +
      chalk.dim(command ? ` — ${command}` : ""),
  );
  console.log(
    chalk.dim(
      "  Component distribution system for React Native / Expo",
    ),
  );
  console.log();
}
```

Utiliser :

```ts
printBanner("rs-ui init");
```

Le banner doit pouvoir être réutilisé par :

```bash
rs-ui init
rs-ui add
rs-ui create
rs-ui doctor
rs-ui reset
```

Ne duplique pas le banner dans chaque commande.

---

# 4. LE CLI DOIT GÉRER LUI-MÊME LE CHOIX DU SDK

Expo ne doit plus afficher son propre menu interactif pendant `rs-ui init`.

Le CLI doit demander explicitement :

```text
Choisir la version Expo SDK :

> Latest (SDK 57) - Recommandé
  SDK 56
  SDK 55
  SDK 54
```

Adapte la liste aux versions réellement supportées par le repository.

Ne prétends pas supporter un SDK simplement parce qu'une version apparaît dans un ancien tableau.

Les versions doivent être centralisées.

Exemple :

```ts
export const SUPPORTED_SDK_VERSIONS = [54, 55, 56, 57] as const;

export const MINIMUM_SDK_VERSION = 54;

export const LATEST_SUPPORTED_SDK = 57;
```

Si le repository démontre réellement que d'autres SDK sont supportés et testés, conserve-les.

---

# 5. `--sdk`

Le CLI doit accepter :

```bash
rs-ui init --sdk 57
```

Dans ce cas :

* ne pas afficher le prompt SDK
* utiliser directement SDK 57

Et :

```bash
rs-ui init --sdk latest
```

doit être résolu par le CLI vers :

```text
LATEST_SUPPORTED_SDK
```

Ne transmet jamais `"latest"` directement comme version du template.

Le template doit recevoir une version explicite :

```text
blank-typescript@57
```

---

# 6. NE PLUS UTILISER LE DEFAULT TEMPLATE EXPO

Le bootstrap actuel utilise quelque chose de proche de :

```bash
create-expo-app ... --template default
```

Cela doit être supprimé du flow `rs-ui init`.

Utiliser le squelette Expo minimal TypeScript :

```text
blank-typescript@<SDK>
```

avec :

```bash
--no-install
```

et :

```bash
--no-agents-md
```

Exemple :

```bash
bunx create-expo-app@latest my-app \
  --template blank-typescript@57 \
  --no-install \
  --no-agents-md
```

Pour npm :

```bash
npx create-expo-app@latest my-app \
  --template blank-typescript@57 \
  --no-install \
  --no-agents-md
```

Pour pnpm :

```bash
pnpm dlx create-expo-app@latest my-app \
  --template blank-typescript@57 \
  --no-install \
  --no-agents-md
```

Pour yarn :

```bash
yarn dlx create-expo-app@latest my-app \
  --template blank-typescript@57 \
  --no-install \
  --no-agents-md
```

### Important

Le but n'est pas de conserver le contenu du template Expo.

Le template sert uniquement de **bootstrap officiel minimal**.

Rashwright doit ensuite prendre entièrement le contrôle du projet.

---

# 7. AUCUNE INSTALLATION PENDANT LE BOOTSTRAP

Le premier appel à `create-expo-app` doit obligatoirement utiliser :

```bash
--no-install
```

Cela signifie :

```text
create-expo-app
      ↓
création fichiers
      ↓
pas de node_modules
      ↓
pas de première installation
```

Ensuite Rashwright génère :

* package.json final
* configuration Expo
* Babel
* tsconfig
* composants
* thèmes
* skills
* assets
* showcase
* config
* lockfile

Puis seulement à la fin :

```text
INSTALLATION
```

---

# 8. CENTRALISER LA CONSTRUCTION DES COMMANDES

Dans `package-manager.ts`, ajouter une fonction dédiée :

```ts
export function buildCreateExpoAppCommand(
  pm: PackageManager,
  projectName: string,
  sdkVersion: number,
): string {
  const template = `blank-typescript@${sdkVersion}`;

  switch (pm) {
    case "bun":
      return `bunx create-expo-app@latest ${projectName} --template ${template} --no-install --no-agents-md`;

    case "pnpm":
      return `pnpm dlx create-expo-app@latest ${projectName} --template ${template} --no-install --no-agents-md`;

    case "yarn":
      return `yarn dlx create-expo-app@latest ${projectName} --template ${template} --no-install --no-agents-md`;

    case "npm":
    default:
      return `npx create-expo-app@latest ${projectName} --template ${template} --no-install --no-agents-md`;
  }
}
```

Ne garde pas cette logique directement dans `init.ts`.

---

# 9. NE PLUS UTILISER CETTE LOGIQUE

Supprimer le pattern :

```ts
const runner = selectedPm === "bun" ? "bunx" : "npx";
```

Il est incorrect car il ignore :

* pnpm
* yarn

La construction des commandes doit être centralisée dans `package-manager.ts`.

---

# 10. ORDRE EXACT DU NOUVEAU `init`

Le flow doit ressembler à :

```text
rs-ui init

↓ Banner

↓ Detect current project

↓ Package manager

↓ New project / existing project

↓ Project name/path

↓ Expo SDK

↓ Starter template Rashwright

↓ Default / Glass

↓ Theme

↓ Custom theme si nécessaire

↓ Components path

↓ Skills

↓ Showcase

↓ autres options nécessaires

↓ Résumé complet

↓ Confirmation

===========================
BOOTSTRAP
===========================

create-expo-app
--template blank-typescript@SDK
--no-install
--no-agents-md

===========================
RASHWRIGHT GENERATION
===========================

reset/preparation
babel
tsconfig
foundations
assets
starter components
theme
skills
showcase
config
lockfile

===========================
INSTALLATION
===========================

Expo dependencies
Generic dependencies

===========================
VERIFICATION
===========================

doctor/checks
TypeScript
configuration
```

---

# 11. `resetExpoProject`

Le système actuel semble utiliser `resetExpoProject()` pour nettoyer le template Expo.

Avec le nouveau flow, ce comportement doit être réévalué.

Puisque nous utilisons déjà :

```text
blank-typescript
+
--no-install
```

il ne faut plus faire :

```text
create default Expo project
→ installer
→ reset
→ reconstruire
```

Le nouveau comportement doit plutôt être :

```text
minimal Expo scaffold
→ prepare for Rashwright
```

Si `resetExpoProject()` est encore nécessaire pour les projets existants ou certaines situations, conserve-le uniquement là où il est réellement nécessaire.

Ne supprime pas aveuglément la fonction.

Rends son comportement idempotent.

---

# 12. INSTALLATION FINALE UNIQUE

Toutes les dépendances doivent être collectées avant l'installation.

Séparer :

### Expo dependencies

```ts
const CORE_EXPO_DEPS = [
  "react-native-reanimated",
  "react-native-gesture-handler",
  "react-native-safe-area-context",
  "@expo/vector-icons",
  "expo-haptics",
  "expo-image",
  "@react-native-async-storage/async-storage",
  "expo-image-picker",
  "expo-image-manipulator",
  "expo-application",
  "expo-blur",
  "expo-linear-gradient",
];
```

### Generic dependencies

```ts
const CORE_NPM_DEPS = [
  "zustand",
];
```

Utiliser :

```text
expo install
```

pour les dépendances Expo/React Native compatibles avec le SDK.

Utiliser le package manager choisi pour les packages génériques.

---

# 13. `--yes`

Vérifier que :

```bash
rs-ui init --yes
```

est réellement non interactif.

Il doit utiliser des valeurs par défaut cohérentes pour :

* package manager
* SDK
* starter
* thème
* components path
* skills
* showcase
* glass
* etc.

Aucune question Inquirer ne doit apparaître avec `--yes`.

---

# 14. `--dry-run`

Vérifier que :

```bash
rs-ui init --dry-run
```

ne crée rien et n'installe rien.

Mais il doit afficher le plan réel :

```text
[DRY RUN]

Package manager: bun
Expo SDK: 57
Template: blank-typescript
Theme: cyan
Glass: false
Skills: true
Showcase: true

Bootstrap:
bunx create-expo-app@latest ...

Installation:
bunx expo install ...
bun add ...
```

Le dry-run doit refléter le nouveau pipeline.

---

# 15. CORRECTION `tsconfig.json`

Le générateur actuel ajoute :

```json
"baseUrl": ".",
"ignoreDeprecations": "5.0"
```

Cela provoque actuellement une erreur avec TypeScript moderne.

Ne génère plus ces propriétés.

La fonction `updateTsconfig()` doit :

```ts
cfg.compilerOptions.jsx = "react-native";
```

puis garantir :

```json
"paths": {
  "@/*": [
    "./src/*",
    "./*"
  ]
}
```

et supprimer les anciennes propriétés :

```ts
delete cfg.compilerOptions.baseUrl;
delete cfg.compilerOptions.ignoreDeprecations;
```

La fonction doit donc être migratrice :

```text
ancien tsconfig
    ↓
suppression baseUrl
suppression ignoreDeprecations
    ↓
nouveau tsconfig propre
```

Conserver les autres options utilisateur.

Ne pas écraser arbitrairement les configurations existantes.

---

# 16. TSConfig attendu

Un projet généré devrait pouvoir avoir quelque chose comme :

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "paths": {
      "@/*": [
        "./src/*",
        "./*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

Ne rajoute pas :

```json
"baseUrl": "."
```

ni :

```json
"ignoreDeprecations": "5.0"
```

---

# 17. AUDIT GLOBAL DES ANCIENNES OPTIONS TS

Faire une recherche globale dans le repository :

```text
baseUrl
ignoreDeprecations
"5.0"
"6.0"
```

Vérifier :

* source CLI
* starter generator
* templates
* fixtures
* tests
* snapshots
* generated examples
* documentation si nécessaire

Aucune génération de projet ne doit continuer à introduire l'ancienne configuration.

---

# 18. CORRECTION DU COMPOSANT `Rating`

Le composant Rating doit évoluer sans casser l'API existante.

Ajouter :

```ts
step?: number;
```

Comportement :

```text
step non fourni + allowHalf=true
→ step = 0.5

step non fourni + allowHalf=false
→ step = 1

step={0.25}
→ quart d'étoile

step={0.1}
→ dixième d'étoile

step={0.01}
→ centième
```

Le système doit supporter des fractions arbitraires raisonnables.

---

# 19. ALGORITHME DE RATING

Ne plus hardcoder :

```text
50%
```

pour les valeurs partielles.

Pour chaque étoile :

```text
fillPercentage =
  clamp(value - starIndex, 0, 1) * 100
```

Exemples :

```text
rating = 0
→ 0%

rating = 0.25
→ 25%

rating = 0.5
→ 50%

rating = 0.75
→ 75%

rating = 1
→ 100%
```

Pour :

```text
rating = 2.25
```

on doit avoir :

```text
★ ★ 25% ☆ ☆ ☆
```

selon `max`.

---

# 20. INTERACTION DU RATING

Le clic/tap doit calculer la position réelle dans l'étoile.

Conceptuellement :

```ts
const ratio = locationX / starWidth;
const rawValue = starIndex + ratio;
```

Puis :

```ts
const steppedValue =
  Math.round(rawValue / step) * step;
```

Puis :

```ts
const value = clamp(
  steppedValue,
  0,
  max,
);
```

Tenir compte de :

* `allowHalf`
* `step`
* `max`
* largeur réelle
* RTL si le composant le supporte
* accessibilité

---

# 21. COMPATIBILITÉ `allowHalf`

L'ancienne API :

```tsx
<Rating allowHalf />
```

doit continuer à fonctionner.

Donc :

```ts
const effectiveStep =
  step ??
  (allowHalf ? 0.5 : 1);
```

Si `step` est fourni explicitement :

```tsx
<Rating
  allowHalf
  step={0.25}
/>
```

alors :

```text
step = 0.25
```

doit avoir priorité.

---

# 22. VALIDATION DU `step`

Le composant doit gérer proprement les valeurs invalides :

```text
step <= 0
NaN
Infinity
```

Ne jamais provoquer :

* division par zéro
* boucle infinie
* valeur `NaN`
* rendu cassé

Choisir une stratégie cohérente :

* fallback
* warning en développement
* ou erreur contrôlée

selon les conventions du projet.

---

# 23. PRECISION NUMERIQUE

Éviter les artefacts du genre :

```text
0.30000000000000004
```

Normaliser les valeurs après calcul.

Créer éventuellement une petite fonction interne :

```ts
roundToStepPrecision(...)
```

ou utiliser une stratégie équivalente.

Ne pas ajouter une dépendance juste pour cela.

---

# 24. `variant` DU RATING

Inspecter le composant actuel.

Si :

```ts
variant
```

est déclaré mais jamais utilisé, corriger.

Ne documente pas une fonctionnalité qui n'existe pas.

Le Skill actuel indique :

```yaml
supportsGlass: false
```

mais mentionne une variante Glass.

Ces informations sont incohérentes.

Il faut soit :

1. implémenter réellement `variant="glass"`

ou

2. supprimer la mention Glass du Skill.

Ne jamais documenter une fonctionnalité inexistante.

---

# 25. SKILL DU RATING

Mettre à jour le Skill pour documenter :

```yaml
name: rs-ui/rating
description: Notation par étoiles interactive avec valeurs fractionnaires configurables.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - none
supportsGlass: false
```

Puis documenter précisément :

* `value`
* `defaultValue`
* `max`
* `step`
* `allowHalf`
* `onChange`
* `disabled`
* `size`
* `variant` uniquement si réellement supporté
* accessibilité
* comportement interactif

Ajouter des exemples :

```tsx
<Rating value={3} />
```

```tsx
<Rating value={3.5} allowHalf />
```

```tsx
<Rating value={3.25} step={0.25} />
```

```tsx
<Rating value={4.75} step={0.25} />
```

Expliquer :

```text
allowHalf
```

reste une API de compatibilité historique.

---

# 26. TESTS DU RATING

Ajouter/mettre à jour les tests.

Minimum :

```text
0
0.25
0.5
0.75
1
2.25
3.5
4.75
max
```

Tester :

```text
step=1
step=0.5
step=0.25
step=0.1
```

Tester aussi :

```text
step invalide
value < 0
value > max
```

Tester la génération du pourcentage de remplissage.

Tester la compatibilité :

```tsx
allowHalf
```

sans `step`.

---

# 27. CORRECTION `file-manager.ts`

Le code actuel contient une expression de normalisation de chemin suspecte :

```ts
file.replace(/^components**\\/**ui**\\/**/, "")
```

Ne conserve pas cette regex.

Utiliser une normalisation robuste :

```ts
const normalizedFile = file.replace(/\\/g, "/");

const relativeComponentsPath = normalizedFile.replace(
  /^(?:components\/ui|src\/components\/ui)\//,
  "",
);
```

Adapter au format réel du registry.

Objectif :

```text
Windows path
→ /
→ chemin relatif stable
```

---

# 28. CORRECTION `lock-manager.ts`

Inspecter les normalisations de chemins.

Toute normalisation doit utiliser :

```ts
rel.replace(/\\/g, "/")
```

afin d'obtenir des chemins indépendants de l'OS.

Le lockfile doit produire le même résultat sur :

* Windows
* Linux
* macOS

---

# 29. LOCKFILE

Vérifier que :

```text
rashwright-ui.lock
```

reste cohérent après :

```bash
rs-ui init
rs-ui add
rs-ui create component
rs-ui reset
```

Les chemins doivent être normalisés.

Les hashes doivent être reproductibles.

Ne pas introduire de chemins absolus.

---

# 30. CONFIGURATION `rashwright-ui.json`

Vérifier que le nouveau flow génère une configuration cohérente avec :

* SDK
* package manager
* theme
* glass
* components path
* skills
* starter
* components installés

Le nouveau flow ne doit pas produire une configuration représentant un ancien template Expo alors que Rashwright a remplacé le projet.

---

# 31. IDÉE IMPORTANTE : SÉPARER LES RESPONSABILITÉS

Si nécessaire, créer :

```text
core/
├── expo-scaffolder.ts
├── package-manager.ts
├── starter-generator.ts
├── project-detector.ts
└── ...
```

`expo-scaffolder.ts` doit uniquement être responsable de :

```text
Créer le squelette Expo minimal
```

`starter-generator.ts` doit être responsable de :

```text
Transformer le squelette en projet Rashwright
```

`package-manager.ts` :

```text
Commandes d'installation/bootstrap
```

`init.ts` :

```text
Orchestration + interaction utilisateur
```

Évite un `init.ts` qui contient toute la logique métier.

---

# 32. IDEMPOTENCE

Tester plusieurs fois :

```bash
rs-ui init
```

sur un projet existant.

Le CLI doit détecter correctement :

```text
projet Expo existant
projet Rashwright existant
projet non compatible
```

Il ne doit pas détruire arbitrairement le travail utilisateur.

---

# 33. PROTECTION DU PROJET UTILISATEUR

Avant une opération destructive :

```text
reset
overwrite
delete
```

conserver les protections existantes.

Ne pas introduire de suppression silencieuse.

Le nouveau bootstrap d'un projet neuf peut être automatisé.

Un projet existant doit rester protégé.

---

# 34. TESTS `INIT`

Ajouter/mettre à jour les tests pour vérifier au minimum :

### New project

```text
rs-ui init
```

### SDK

```text
--sdk 57
```

### Latest

```text
--sdk latest
```

### Package managers

```text
npm
pnpm
yarn
bun
```

### Dry run

```text
--dry-run
```

### Yes

```text
--yes
```

### Theme

```text
--theme cyan
```

### Custom theme

```text
--theme custom
```

### Glass

```text
--glass
```

### Skills

```text
--skills
--no-skills
```

### Showcase

```text
--showcase
--no-showcase
```

---

# 35. TEST CRITIQUE : AUCUNE DOUBLE INSTALLATION

Ajouter une vérification qui garantit que le nouveau flow ne fait pas :

```text
create-expo-app
→ install
```

avant :

```text
final installation
```

Le bootstrap doit impérativement contenir :

```text
--no-install
```

et l'installation doit apparaître uniquement dans la phase finale.

---

# 36. TEST GÉNÉRÉ RÉEL

Créer au moins un test d'intégration/fixture qui :

1. crée un projet temporaire
2. lance le bootstrap
3. vérifie `package.json`
4. vérifie `tsconfig.json`
5. vérifie `rashwright-ui.json`
6. vérifie les composants
7. vérifie les Skills
8. vérifie le lockfile
9. vérifie qu'aucun ancien `baseUrl` n'est généré
10. vérifie que `ignoreDeprecations` n'est pas généré.

Si possible, exécuter ensuite :

```bash
bun x tsc --noEmit
```

ou l'équivalent avec le package manager sélectionné.

---

# 37. COMPATIBILITÉ WINDOWS

Le projet doit fonctionner correctement dans PowerShell.

Vérifier particulièrement :

```text
paths
shell commands
quotes
backslashes
directories
npm/bun/pnpm/yarn commands
```

Ne pas construire de chemins avec `\` manuellement.

Utiliser :

```ts
join(...)
```

pour les chemins filesystem.

Utiliser :

```ts
/ 
```

uniquement pour les chemins logiques/lockfiles.

---

# 38. SÉCURITÉ DES COMMANDES

Inspecter les commandes shell construites à partir de :

```text
projectName
directory
package names
```

Si possible, préférer :

```ts
execFileSync
```

avec arguments séparés plutôt qu'une longue chaîne shell.

Si l'architecture actuelle utilise des chaînes, au minimum :

* valider les noms de projet
* éviter l'injection shell
* gérer les espaces dans les chemins
* gérer Windows correctement.

Ne fais pas une refonte inutile si cela casse l'architecture existante, mais corrige les risques réels.

---

# 39. DOCUMENTATION

Mettre à jour les docs concernant :

```bash
rs-ui init
```

pour refléter :

* sélection SDK par Rashwright
* bootstrap sans installation
* template minimal
* installation finale unique
* themes
* custom theme
* skills
* showcase
* package managers

Ne pas documenter l'ancien comportement.

---

# 40. QUALITY GATE FINAL

À la fin, exécuter les vérifications disponibles dans le repository :

```bash
bun test
```

ou la commande équivalente.

Puis :

```bash
tsc --noEmit
```

ou le typecheck officiel.

Puis :

```bash
bun run build
```

si disponible.

Puis les tests spécifiques CLI.

Puis les tests générés.

---

# 41. RÈGLE ANTI-RÉGRESSION

Avant de terminer, vérifier que ces commandes continuent à fonctionner :

```bash
rs-ui init
rs-ui init --sdk 57
rs-ui init --theme cyan
rs-ui init --theme custom
rs-ui init --glass
rs-ui init --all
rs-ui add button
rs-ui add drawer
rs-ui add drawer --no-skills
rs-ui doctor
rs-ui reset
rs-ui reset --delete
rs-ui create component MyComponent
```

Ne modifie pas une fonctionnalité existante simplement pour simplifier le code si cela casse sa compatibilité.

---

# 42. LIVRABLE FINAL

À la fin de ton travail, donne-moi un rapport structuré :

## A. Corrections effectuées

Liste exacte des fichiers modifiés.

## B. Architecture

Explique brièvement les responsabilités après correction.

## C. `rs-ui init`

Décris le nouveau flow.

## D. Installation

Confirme explicitement :

```text
Bootstrap Expo : --no-install
Installation finale : une seule fois
```

## E. Expo SDK

Indique les SDK réellement supportés.

## F. TypeScript

Confirme que :

```text
baseUrl
ignoreDeprecations
```

ne sont plus générés.

## G. Rating

Décris le support :

```text
1
0.5
0.25
fractions arbitraires
```

## H. Tests

Donne les commandes exécutées et leurs résultats.

## I. Points restant éventuellement à traiter

Ne cache aucune limitation.

---

# 43. IMPORTANT — NE PAS FAIRE

Ne fais pas :

* une réécriture complète du CLI
* une migration inutile de package manager
* une suppression arbitraire de fonctionnalités
* une nouvelle abstraction sans nécessité
* une dépendance npm uniquement pour résoudre un petit calcul
* un changement massif de structure sans raison
* un downgrade de TypeScript
* un retour à `baseUrl`
* `ignoreDeprecations: "5.0"`
* deux installations Expo
* un `create-expo-app` interactif imbriqué
* le template Expo `default`
* une documentation qui prétend supporter une fonctionnalité inexistante

---

# 44. ORDRE D'EXÉCUTION DU TRAVAIL

Travaille dans cet ordre :

```text
1. Audit repository
2. Comprendre init actuel
3. Corriger package-manager
4. Ajouter expo-scaffolder si nécessaire
5. Corriger SDK handling
6. Corriger init flow
7. Supprimer double installation
8. Corriger tsconfig
9. Corriger file paths Windows
10. Corriger lock paths
11. Corriger Rating
12. Corriger Rating Skill
13. Ajouter/mettre à jour tests
14. Mettre à jour documentation
15. Typecheck
16. Tests
17. Build
18. Tests d'intégration
19. Rapport final
```

---

# 45. PHILOSOPHIE DU PROJET

Garde constamment cette règle en tête :

> **Le métier appartient au projet. La technologie répétitive et générique appartient à Rashwright.**

Et pour Rashwright UI Mobile :

> **Rashwright ne doit pas simplement fournir des composants. Il doit fournir une expérience fiable d'installation, de configuration, de dépendances, de compatibilité et de personnalisation.**

Le résultat final doit donner l'impression d'un outil mature et cohérent, pas d'un ensemble de scripts assemblés.

Commence maintenant par l'audit du repository, puis implémente les corrections de manière progressive et vérifiable.
