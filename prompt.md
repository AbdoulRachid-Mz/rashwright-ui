# Prompt maître — Construire Rashwright UI Mobile

## 0. Mission

Construire un système complet de distribution et d'installation de composants UI React Native / Expo nommé :

```text
Rashwright UI Mobile
```

Nom CLI :

```text
rs-ui
```

Le système doit être un projet autonome, maintenu dans un repository GitHub séparé des projets métier.

L'objectif n'est **pas** de créer simplement un package :

```text
@rashwright/ui
```

qui oblige chaque application à installer manuellement une longue liste de dépendances.

L'objectif est de créer un **système de composants distribuables**, inspiré dans son fonctionnement général de shadcn/ui, mais entièrement personnalisé pour Rashwright Mobile.

Le principe central est :

> **Le composant doit être installable avec tout ce dont il a réellement besoin pour fonctionner.**

Cela comprend :

* le code du composant ;
* les hooks nécessaires ;
* les utilitaires nécessaires ;
* les styles ;
* les animations ;
* les dépendances natives ;
* les dépendances JavaScript ;
* les configurations ;
* les providers nécessaires ;
* les assets éventuels ;
* les versions compatibles avec l'Expo SDK du projet.

---

# 1. Philosophie

Rashwright UI Mobile doit résoudre un problème récurrent :

Aujourd'hui, lorsqu'on installe un composant UI externe, on récupère parfois seulement :

```text
button.tsx
```

alors que son fonctionnement réel nécessite :

```text
react-native-reanimated
@expo/vector-icons
expo-linear-gradient
expo-blur
expo-haptics
react-native-gesture-handler
react-native-safe-area-context
```

avec parfois des versions précises dépendantes de l'Expo SDK.

Résultat :

```text
Installation du composant
        ↓
Erreur de module manquant
        ↓
Installation manuelle
        ↓
Version incompatible
        ↓
Erreur native
        ↓
Configuration supplémentaire
        ↓
Nouvelle erreur
```

Rashwright UI doit éliminer autant que possible ce problème.

---

# 2. Concept fondamental

Le système doit fonctionner selon cette logique :

```text
                 rs-ui
                  │
          ┌───────┴────────┐
          │                │
       init               add
          │                │
          ↓                ↓
   projet UI complet   composant précis
          │                │
          └───────┬────────┘
                  ↓
        analyse du projet
                  ↓
      détection Expo / RN
                  ↓
      résolution dépendances
                  ↓
       installation compatible
                  ↓
       copie / génération code
                  ↓
        configuration requise
                  ↓
          projet fonctionnel
```

---

# 3. Repository indépendant

Le système UI Mobile doit être un repository GitHub indépendant.

Exemple :

```text
rashwright-ui-mobile/
```

Il ne doit pas être placé dans :

```text
immo360/
kokowa-tv/
zone-fi/
ajiya-ta/
h3-infinity-gaming/
```

Chaque application consomme Rashwright UI Mobile.

Architecture conceptuelle :

```text
GitHub
│
├── rashwright
│
├── rashwright-ui-mobile
│
├── immo360
├── kokowa-tv
├── zone-fi
├── ajiya-ta
└── h3-infinity-gaming
```

---

# 4. Pourquoi un repository séparé

Le système UI Mobile possède son propre cycle de vie.

Il doit pouvoir :

* ajouter des composants ;
* modifier des composants ;
* gérer des versions ;
* gérer la compatibilité Expo ;
* gérer des dépendances ;
* publier le CLI ;
* documenter les composants ;
* tester les composants ;
* fournir des templates ;
* maintenir plusieurs versions.

Il s'agit donc d'un produit technique à part entière.

---

# 5. Architecture générale du repository

Créer une structure proche de :

```text
rashwright-ui-mobile/
├── cli/
├── components/
├── components-registry/
├── templates/
├── presets/
├── dependencies/
├── themes/
├── configs/
├── packages/
├── docs/
├── examples/
├── tests/
├── skills/
├── scripts/
├── package.json
├── tsconfig.json
└── README.md
```

Cette structure peut être adaptée si une meilleure organisation technique est identifiée.

---

# 6. CLI

Le CLI principal doit être :

```text
rs-ui
```

Exemples :

```bash
rs-ui init
rs-ui add button
rs-ui add drawer
rs-ui add input
rs-ui add --all
```

Le CLI doit être utilisable dans un projet Expo existant.

---

# 7. Commande `init`

Commande :

```bash
rs-ui init
```

Elle initialise Rashwright UI Mobile dans le projet courant.

Elle doit :

1. détecter le projet ;
2. vérifier qu'il s'agit d'un projet compatible ;
3. détecter Expo ;
4. détecter la version Expo SDK ;
5. détecter React ;
6. détecter React Native ;
7. détecter Expo Router si présent ;
8. analyser les dépendances existantes ;
9. demander les préférences nécessaires ;
10. créer la configuration Rashwright UI ;
11. installer uniquement les dépendances nécessaires ;
12. créer les fichiers fondamentaux ;
13. créer le système de thème ;
14. créer le système de tokens ;
15. préparer les composants ;
16. afficher un résumé de l'installation.

---

# 8. Exemple de `rs-ui init`

Le CLI peut demander :

```text
? Initialize Rashwright UI Mobile? Yes

? Choose UI style:
❯ Default
  Glass
  Minimal
```

ou :

```text
? Enable Glass UI? Yes
```

Puis :

```text
? Install all components? Yes
```

---

# 9. Options non interactives

Le CLI doit également supporter les flags.

Exemples :

```bash
rs-ui init --glass
```

```bash
rs-ui init --all
```

```bash
rs-ui init --glass --all
```

Donc la commande demandée :

```bash
rs-ui init -glass -all
```

doit également être acceptée si possible.

Cependant, préférer la convention CLI longue :

```bash
rs-ui init --glass --all
```

tout en permettant les alias courts.

---

# 10. `rs-ui add`

Commande :

```bash
rs-ui add button
```

Elle installe uniquement le composant demandé.

Exemples :

```bash
rs-ui add button
rs-ui add card
rs-ui add drawer
rs-ui add dialog
rs-ui add input
rs-ui add select
```

---

# 11. Plusieurs composants

Supporter :

```bash
rs-ui add button card input
```

et :

```bash
rs-ui add button drawer dialog
```

Le CLI doit analyser toutes les dépendances avant l'installation afin d'éviter les installations répétitives.

---

# 12. Tous les composants

Supporter :

```bash
rs-ui add --all
```

Cela doit installer tous les composants disponibles et nécessaires au preset courant.

Ne pas simplement copier tous les fichiers.

Le système doit résoudre :

```text
composants
+
dépendances
+
sous-dépendances
+
configuration
+
providers
+
theme
```

---

# 13. Mode Glass

Le système doit proposer un mode :

```text
Glass UI
```

Le mode Glass ne doit pas être une collection totalement différente de composants.

Il doit être un **preset visuel**.

Architecture :

```text
Button
  │
  ├── Default variant
  ├── Glass variant
  └── Custom theme
```

Même logique pour :

```text
Card
Drawer
Dialog
Input
Tabs
Sheet
```

etc.

---

# 14. `init --glass`

Commande :

```bash
rs-ui init --glass
```

doit :

1. initialiser Rashwright UI ;
2. activer le thème Glass ;
3. installer les dépendances nécessaires au Glass ;
4. configurer les tokens ;
5. préparer les composants pour utiliser Glass par défaut.

Avec :

```bash
rs-ui init --glass --all
```

le système doit initialiser :

```text
Rashwright UI
+
Glass Theme
+
tous les composants
+
toutes les dépendances nécessaires
```

---

# 15. Important : le Glass n'est pas une dépendance cachée

Le système doit explicitement savoir que certains composants Glass nécessitent par exemple :

```text
expo-blur
expo-linear-gradient
react-native-reanimated
```

Il doit donc pouvoir déclarer :

```text
Button
→ aucune dépendance native supplémentaire

GlassCard
→ expo-blur
→ expo-linear-gradient

Drawer
→ react-native-gesture-handler
→ react-native-reanimated
```

---

# 16. Registry

Créer un véritable registry de composants.

Exemple conceptuel :

```text
components-registry/
├── button.json
├── card.json
├── drawer.json
├── dialog.json
├── input.json
├── select.json
└── ...
```

Chaque entrée doit décrire le composant.

Exemple :

```json
{
  "name": "drawer",
  "type": "component",
  "version": "1.0.0",
  "files": [
    "components/ui/drawer.tsx"
  ],
  "dependencies": [],
  "peerDependencies": [],
  "expoDependencies": [
    "react-native-reanimated",
    "react-native-gesture-handler"
  ],
  "config": [],
  "providers": [],
  "requires": [],
  "theme": true
}
```

La structure exacte peut être améliorée.

---

# 17. Dépendances Expo

C'est une partie critique du système.

Ne jamais hardcoder naïvement :

```bash
npm install react-native-reanimated@latest
```

dans un projet Expo.

Le système doit connaître les compatibilités.

Il doit privilégier les outils Expo pour déterminer les versions compatibles lorsque cela est possible.

Conceptuellement :

```text
Expo SDK
   ↓
compatibility matrix
   ↓
package versions
   ↓
installation
```

---

# 18. Compatibility Matrix

Créer un système de compatibilité.

Exemple :

```text
Expo SDK
│
├── SDK 54
├── SDK 55
├── SDK 56
└── future SDK
```

Pour chaque SDK :

```text
react-native-reanimated
react-native-gesture-handler
expo-blur
expo-linear-gradient
expo-haptics
@expo/vector-icons
```

avec les versions compatibles.

Le système doit éviter de faire fonctionner un composant avec une combinaison connue comme incompatible.

---

# 19. Ne pas dupliquer inutilement les versions Expo

Le registry doit pouvoir exprimer :

```text
provider: expo
package: expo-blur
versionStrategy: sdk-compatible
```

plutôt que :

```text
expo-blur: "17.0.0"
```

partout.

Lorsque possible, utiliser :

```bash
npx expo install <package>
```

ou l'équivalent programmatique approprié.

Expo reste la source de vérité pour les packages Expo/RN lorsqu'elle fournit une information de compatibilité.

---

# 20. Dépendances déjà présentes

Avant d'installer une dépendance :

```text
rs-ui
   ↓
detect package.json
   ↓
package already installed?
   ├── yes → verify compatibility
   └── no  → install
```

Le CLI doit éviter :

```text
installation double
```

et détecter :

```text
package installé
mais version incompatible
```

---

# 21. Dépendances natives

Les composants utilisant des modules natifs doivent être identifiés.

Exemples :

```text
expo-blur
expo-haptics
expo-linear-gradient
react-native-reanimated
react-native-gesture-handler
react-native-safe-area-context
```

Le CLI doit savoir qu'une dépendance native peut nécessiter :

* installation ;
* configuration ;
* rebuild ;
* prebuild ;
* modification de configuration Expo ;
* plugin Expo.

---

# 22. Important : ne pas promettre un fonctionnement sans rebuild

Lorsqu'un composant ajoute une dépendance native qui n'est pas présente dans l'application native déjà buildée, le CLI doit expliquer clairement :

```text
Native dependency added.

A new development build / native rebuild may be required.
```

Il ne doit jamais prétendre que :

```text
npm install
```

suffit dans tous les cas.

---

# 23. Expo Config Plugins

Si un composant nécessite une configuration native, utiliser un Expo Config Plugin lorsque cela est approprié.

Architecture :

```text
Component
    ↓
Dependency
    ↓
Config Plugin
    ↓
Expo configuration
```

Ne pas demander manuellement à chaque projet de modifier plusieurs fichiers natifs lorsque cela peut être automatisé proprement.

---

# 24. Copie du code

Le système doit privilégier une logique de type :

```text
rs-ui add button
```

→ copie/génère le code dans :

```text
src/components/ui/button.tsx
```

ou le chemin configuré par l'utilisateur.

L'application doit donc **posséder le code du composant**.

---

# 25. Pourquoi copier le code

Le but est d'éviter :

```text
Application
   ↓
gros package UI opaque
   ↓
composant impossible à modifier
```

Rashwright doit plutôt permettre :

```text
Application
   ↓
components/ui/button.tsx
   ↓
modifiable par le développeur
```

Le CLI fournit une base standardisée, mais le projet conserve le contrôle.

---

# 26. Configuration du chemin

Lors de :

```bash
rs-ui init
```

permettre de configurer :

```text
components path
```

Par défaut :

```text
src/components/ui
```

Mais accepter :

```text
components/ui
```

si le projet utilise cette convention.

La configuration doit être stockée dans un fichier dédié.

Exemple :

```text
rashwright-ui.json
```

---

# 27. Configuration

Exemple conceptuel :

```json
{
  "version": 1,
  "componentsPath": "src/components/ui",
  "theme": "glass",
  "typescript": true,
  "aliases": {
    "components": "@/components",
    "lib": "@/lib"
  }
}
```

La configuration réelle doit être adaptée au projet détecté.

---

# 28. Logique partagée

Un composant peut nécessiter plusieurs fichiers.

Exemple :

```text
drawer.tsx
drawer-context.tsx
use-drawer.ts
drawer-utils.ts
```

Le registry doit permettre de déclarer ces dépendances.

Exemple :

```text
drawer
├── drawer.tsx
├── drawer-context.tsx
├── use-drawer.ts
└── drawer-utils.ts
```

---

# 29. Dépendances entre composants

Un composant peut dépendre d'un autre composant Rashwright.

Exemple :

```text
PropertyCard
   ↓
Card
   ↓
Text
   ↓
Icon
```

Le registry doit exprimer :

```json
{
  "requires": [
    "card",
    "text",
    "icon"
  ]
}
```

Le CLI doit automatiquement ajouter les composants manquants.

---

# 30. Installation intelligente

Si l'utilisateur exécute :

```bash
rs-ui add drawer
```

et que Drawer nécessite :

```text
card
icon
```

le CLI doit détecter :

```text
Drawer requires:
- card
- icon
```

puis proposer :

```text
? Install required components? Yes
```

ou installer automatiquement lorsque le mode non interactif est activé.

---

# 31. Haptics

Les composants peuvent déclarer :

```text
expo-haptics
```

comme dépendance optionnelle ou obligatoire.

Exemple :

```text
Button
├── core
└── optional:
    └── expo-haptics
```

Le composant doit pouvoir fonctionner sans Haptics lorsqu'elle est désactivée, si cela est techniquement pertinent.

---

# 32. Icônes

Le système doit avoir une stratégie claire pour les icônes.

Par défaut, considérer :

```text
@expo/vector-icons
```

si elle est adaptée.

Ne pas créer un moteur d'icônes propriétaire.

Les composants doivent pouvoir recevoir une icône :

```tsx
<Button
  icon={<Icon ... />}
/>
```

plutôt que d'imposer une collection d'icônes particulière partout.

---

# 33. Animations

Pour les animations avancées :

```text
react-native-reanimated
```

doit être utilisé lorsqu'il apporte une vraie valeur.

Ne pas ajouter Reanimated à tous les composants par défaut.

Exemple :

```text
Button
→ pas nécessairement

Drawer
→ nécessaire

BottomSheet
→ nécessaire

AnimatedTabs
→ nécessaire
```

---

# 34. Blur / Glass

Pour Glass :

```text
expo-blur
```

peut être utilisé.

Pour les gradients :

```text
expo-linear-gradient
```

peut être utilisé.

Pour les animations :

```text
react-native-reanimated
```

peut être utilisé.

Mais chaque dépendance doit être justifiée par le composant.

---

# 35. Theme Engine

Le système doit fournir un moteur de thème léger.

Il doit gérer au minimum :

```text
colors
spacing
radius
typography
shadows
opacity
animations
```

Et pour Glass :

```text
glass background
glass border
blur intensity
glass opacity
glass elevation
```

---

# 36. Design Tokens

Les tokens doivent être centralisés.

Exemple :

```text
theme/
├── colors.ts
├── spacing.ts
├── radius.ts
├── typography.ts
├── shadows.ts
├── glass.ts
└── index.ts
```

ou une architecture équivalente.

---

# 37. Dark / Light / Glass

Le système doit pouvoir supporter :

```text
light
dark
glass
```

Glass ne doit pas nécessairement être considéré comme un troisième mode de couleur.

Il peut être un preset combiné avec :

```text
light + glass
dark + glass
```

Exemple :

```text
theme = dark
appearance = glass
```

---

# 38. `rs-ui theme`

Prévoir ultérieurement :

```bash
rs-ui theme
```

avec éventuellement :

```bash
rs-ui theme set glass
rs-ui theme set default
rs-ui theme set dark
```

Cette fonctionnalité peut rester hors du MVP si nécessaire.

---

# 39. Components catalog

Prévoir un catalogue officiel.

Catégories :

```text
Basic
├── button
├── text
├── icon
├── badge
├── avatar

Forms
├── input
├── textarea
├── checkbox
├── radio
├── switch
├── select

Layout
├── card
├── stack
├── separator
├── container

Navigation
├── tabs
├── drawer
├── bottom-tabs

Feedback
├── alert
├── toast
├── dialog
├── loading
├── skeleton

Overlay
├── modal
├── sheet
├── bottom-sheet
├── popover

Data
├── list
├── empty-state
├── error-state

Media
├── image
├── image-viewer
├── video
```

La liste réelle doit être définie progressivement.

---

# 40. Ne pas tout créer immédiatement

Le système ne doit pas essayer de créer 100 composants dès la première version.

Commencer avec un noyau réellement utile.

MVP possible :

```text
button
text
icon
card
input
textarea
switch
checkbox
radio
badge
avatar
separator
dialog
drawer
sheet
toast
loading
skeleton
tabs
```

Puis évoluer.

---

# 41. Variants

Les composants doivent utiliser une API cohérente.

Exemple :

```tsx
<Button variant="primary" size="md" />
```

ou :

```tsx
<Button
  variant="glass"
  size="lg"
/>
```

Les variants doivent être standardisés.

---

# 42. API des composants

Éviter que chaque composant possède une API complètement différente.

Par exemple :

```text
size
variant
disabled
loading
className/style
onPress
```

lorsque cela a du sens.

Sur React Native, respecter les conventions natives.

Ne pas forcer artificiellement une API Web.

---

# 43. Accessibilité

Tous les composants doivent prendre en compte :

```text
accessibilityLabel
accessibilityRole
accessibilityState
accessibilityHint
```

lorsqu'ils sont pertinents.

L'accessibilité doit faire partie du composant et non être ajoutée plus tard.

---

# 44. Platform-specific

Un composant peut posséder :

```text
button.tsx
button.native.tsx
button.ios.tsx
button.android.tsx
```

si une différence plateforme est réellement nécessaire.

Ne pas créer artificiellement des variantes natives.

---

# 45. Compatibilité React Native

Le système doit détecter :

```text
React
React Native
Expo SDK
```

et refuser ou avertir lorsque l'environnement est incompatible.

Exemple :

```text
Rashwright UI Mobile requires Expo SDK >= 54.
Detected: Expo SDK 52.

Please upgrade Expo or use a compatible Rashwright UI version.
```

---

# 46. Package manager

Le CLI doit fonctionner avec :

```text
npm
pnpm
yarn
bun
```

lorsque possible.

Il doit détecter automatiquement le package manager :

```text
pnpm-lock.yaml → pnpm
bun.lock / bun.lockb → bun
yarn.lock → yarn
package-lock.json → npm
```

Ne jamais supposer npm si le projet utilise Bun ou pnpm.

---

# 47. Installation des dépendances

Le CLI doit centraliser la logique d'installation.

Conceptuellement :

```text
Dependency Resolver
        ↓
Package Manager Adapter
        ↓
npm / pnpm / yarn / bun
```

Les commandes exactes doivent être générées selon le package manager détecté.

---

# 48. Commande `doctor`

Créer :

```bash
rs-ui doctor
```

Elle analyse :

```text
Expo
React
React Native
package manager
Rashwright UI
native dependencies
theme
configuration
components
```

et retourne :

```text
✓ Expo SDK compatible
✓ Reanimated compatible
✓ Gesture Handler installed
⚠ expo-blur missing
✓ Theme configured
```

---

# 49. Commande `list`

Créer :

```bash
rs-ui list
```

Elle affiche les composants disponibles.

Exemple :

```text
Rashwright UI Components

Basic
✓ button
✓ text
✓ card

Forms
✓ input
✓ switch
○ select

Overlay
✓ dialog
○ drawer
```

---

# 50. Commande `info`

Créer :

```bash
rs-ui info drawer
```

Elle doit afficher :

```text
Component: drawer
Version: 1.0.0

Dependencies:
- react-native-reanimated
- react-native-gesture-handler

Required components:
- overlay

Theme:
✓ supported

Glass:
✓ supported
```

---

# 51. Commande `remove`

Prévoir :

```bash
rs-ui remove button
```

Mais cette commande doit être prudente.

Avant suppression :

```text
button is required by:
- card
- dialog
```

Afficher un avertissement et demander confirmation.

Ne jamais supprimer automatiquement une dépendance utilisée ailleurs.

---

# 52. Commande `update`

Prévoir :

```bash
rs-ui update
```

Elle doit pouvoir :

* détecter les composants Rashwright installés ;
* comparer les versions ;
* proposer les mises à jour ;
* afficher les changements ;
* éviter d'écraser silencieusement les modifications utilisateur.

---

# 53. Protection des modifications utilisateur

C'est une règle fondamentale.

Si :

```text
src/components/ui/button.tsx
```

a été modifié par le développeur, `rs-ui update` ne doit pas simplement écraser le fichier.

Il doit pouvoir signaler :

```text
Local changes detected.

button.tsx has been modified.

Choose:
❯ Keep local version
  Replace
  Show diff
```

---

# 54. Ownership du code

Après :

```bash
rs-ui add button
```

le code appartient au projet.

Rashwright fournit :

```text
source
template
metadata
dependencies
```

mais le projet reste libre de modifier :

```text
button.tsx
```

---

# 55. Registry distant

Le CLI doit pouvoir utiliser un registry distant.

Exemple conceptuel :

```text
https://ui.rashwright.dev/registry
```

Mais l'URL exacte ne doit pas être imposée maintenant.

Le registry peut initialement être :

```text
GitHub repository
```

puis évoluer vers :

```text
Rashwright Registry
```

---

# 56. Pas de dépendance obligatoire à un serveur

Le MVP doit pouvoir fonctionner à partir du repository/registry disponible sans nécessiter un backend complexe.

Éviter de créer immédiatement :

```text
database
API
authentication
dashboard
```

si le registry Git suffit.

Construire d'abord le système de distribution.

---

# 57. Architecture du registry

Exemple :

```text
registry/
├── components/
│   ├── button.json
│   ├── card.json
│   └── drawer.json
├── themes/
│   ├── default.json
│   └── glass.json
├── versions/
│   ├── expo-54.json
│   ├── expo-55.json
│   └── expo-56.json
└── index.json
```

Le format exact peut évoluer.

---

# 58. Local-first registry

Le CLI doit idéalement embarquer un registry minimal local afin que :

```bash
rs-ui add button
```

puisse fonctionner même si le registry distant est temporairement indisponible.

Architecture :

```text
Local Registry
      ↓
Remote Registry
      ↓
Fallback
```

---

# 59. Offline

Le système doit pouvoir utiliser un cache local des composants déjà récupérés.

Exemple :

```text
~/.rashwright-ui/
```

avec :

```text
cache/
registry/
components/
```

L'emplacement exact doit être adapté aux conventions de l'OS.

---

# 60. Templates

Les composants ne doivent pas être uniquement stockés comme fichiers arbitraires.

Prévoir un système de templates.

Exemple :

```text
templates/
├── button/
├── drawer/
├── card/
└── dialog/
```

Chaque template peut contenir :

```text
component
styles
hooks
utils
tests
metadata
```

---

# 61. Tests des composants

Chaque composant important doit avoir des tests.

Tester notamment :

```text
render
interaction
disabled
loading
variants
accessibility
theme
glass
platform behavior
```

---

# 62. Exemple de composant

Pour :

```text
button
```

le registry peut contenir :

```text
button/
├── button.tsx
├── button.types.ts
├── button.styles.ts
├── button.test.tsx
└── metadata.json
```

Mais ne pas imposer cette granularité lorsque le composant reste simple.

---

# 63. Composants simples

Un composant simple peut rester :

```text
button.tsx
```

Il ne faut pas créer :

```text
button/
├── button.tsx
├── button.types.ts
├── button.styles.ts
├── button.constants.ts
├── button.helpers.ts
├── button-utils.ts
├── button-provider.tsx
└── ...
```

sans nécessité.

Rashwright doit rester pragmatique.

---

# 64. Architecture interne du CLI

Le CLI doit être modulaire.

Exemple :

```text
cli/
├── commands/
│   ├── init.ts
│   ├── add.ts
│   ├── remove.ts
│   ├── update.ts
│   ├── list.ts
│   ├── info.ts
│   └── doctor.ts
├── core/
│   ├── project-detector.ts
│   ├── expo-detector.ts
│   ├── dependency-resolver.ts
│   ├── package-manager.ts
│   ├── registry.ts
│   ├── installer.ts
│   ├── file-manager.ts
│   └── config-manager.ts
└── index.ts
```

---

# 65. Project Detector

Le CLI doit détecter :

```text
package.json
Expo
React Native
Expo Router
TypeScript
package manager
src/
components/
existing Rashwright configuration
```

---

# 66. Dependency Resolver

Responsabilité :

```text
Component
    ↓
component dependencies
    ↓
native dependencies
    ↓
peer dependencies
    ↓
Expo compatibility
    ↓
resolved dependency graph
```

Il doit éviter les doublons.

---

# 67. Dependency Graph

Exemple :

```text
drawer
│
├── overlay
│   └── portal
│
├── reanimated
├── gesture-handler
└── safe-area-context
```

Le resolver doit produire un graphe avant l'installation.

---

# 68. Installation transactionnelle

Si possible, l'installation doit éviter de laisser le projet dans un état partiellement configuré.

Conceptuellement :

```text
Analyse
 ↓
Plan
 ↓
Confirmation
 ↓
Installation
 ↓
Copie fichiers
 ↓
Configuration
 ↓
Validation
```

En cas d'échec :

```text
Installation failed.

Changes made:
...

Changes that could not be completed:
...
```

---

# 69. Dry Run

Prévoir :

```bash
rs-ui add drawer --dry-run
```

Résultat :

```text
Would install:
- react-native-reanimated
- react-native-gesture-handler

Would add:
- drawer.tsx
- drawer-context.tsx

Would modify:
- rashwright-ui.json

No files were changed.
```

---

# 70. Non-interactive mode

Pour CI/agents IA :

```bash
rs-ui add drawer --yes
```

ou :

```bash
rs-ui init --glass --all --yes
```

Le comportement doit être déterministe.

---

# 71. JSON output

Prévoir :

```bash
rs-ui doctor --json
```

et éventuellement :

```bash
rs-ui list --json
```

afin que les agents IA et scripts puissent exploiter les résultats.

---

# 72. Agent-friendly

Le CLI doit être conçu pour être utilisé par :

```text
développeur humain
Claude
Gemini
Codex
ChatGPT
Cursor
Trae
Antigravity
scripts CI
```

Les commandes doivent produire des sorties compréhensibles par une machine.

---

# 73. Messages d'erreur

Les erreurs doivent être :

```text
claires
courtes
actionnables
```

Éviter :

```text
Something went wrong.
```

Préférer :

```text
Cannot install drawer.

Reason:
react-native-reanimated is incompatible with the detected Expo SDK.

Detected:
Expo SDK 56

Required:
compatible Reanimated version for Expo SDK 56.

Run:
rs-ui doctor
```

---

# 74. `rs-ui init` doit créer un système cohérent

Après :

```bash
rs-ui init --glass
```

un nouveau projet doit posséder au minimum :

```text
src/
├── components/
│   └── ui/
├── theme/
├── lib/
│   └── rashwright-ui/
└── ...
```

avec :

```text
rashwright-ui.json
```

et les dépendances nécessaires.

La structure exacte doit respecter la structure Rashwright du projet.

---

# 75. Intégration avec Rashwright Architecture

Rashwright UI Mobile doit respecter :

```text
components/
├── ui/
├── shared/
├── pages/
└── layouts/
```

Les composants installés par `rs-ui` doivent par défaut aller dans :

```text
components/ui/
```

Ils peuvent être déplacés ou configurés selon le projet.

---

# 76. UI vs Shared

Important :

`rs-ui` fournit principalement :

```text
components/ui/
```

Il ne doit pas transformer tous les composants applicatifs en composants UI.

Par exemple :

```text
PropertyCard
PropertyFilter
PropertyMap
PropertyUploader
```

appartiennent au projet.

Ils ne doivent pas faire partie du catalogue générique Rashwright UI.

---

# 77. Limite du système

Rashwright UI ne doit pas devenir :

```text
Rashwright Application Framework
```

Il doit rester :

```text
UI primitives
+
components
+
theme
+
animation
+
interaction
+
distribution
```

La logique métier reste dans l'application.

---

# 78. Composants métier interdits

Ne pas créer dans Rashwright UI :

```text
PropertyCard
ProductCard
UserProfileCard
RealEstateFilter
FootballMatchCard
HotelBookingCard
TransactionCard
```

Ces composants appartiennent aux projets.

Créer plutôt :

```text
Card
List
Tabs
Filter
Input
Sheet
Dialog
```

et laisser les applications composer leurs propres composants métier.

---

# 79. Shared components

Certains composants plus riches peuvent éventuellement être dans :

```text
components/shared/
```

mais ils ne doivent être intégrés au système UI que s'ils sont suffisamment génériques.

Exemples possibles :

```text
ImageViewer
VideoViewer
ImageUploader
FilePicker
```

Ces composants peuvent éventuellement devenir des packages Rashwright séparés.

---

# 80. UI Components vs Rashwright Packages

Ne pas tout mélanger.

```text
rs-ui
→ composants visuels distribuables

@rashwright/storage
→ abstraction de stockage

@rashwright/upload
→ logique upload

@rashwright/api
→ logique API

@rashwright/utils
→ utilitaires
```

Un composant UI peut utiliser :

```text
@rashwright/storage
@rashwright/upload
```

mais ne doit pas fusionner toutes ces responsabilités dans son propre code.

---

# 81. Exemple complet

Commande :

```bash
rs-ui add drawer
```

Processus :

```text
1. Detect project
2. Detect Expo SDK
3. Read Rashwright config
4. Read drawer registry entry
5. Resolve required components
6. Resolve native dependencies
7. Resolve Expo-compatible versions
8. Check installed packages
9. Build installation plan
10. Ask confirmation
11. Install dependencies
12. Copy component files
13. Update config if needed
14. Validate installation
15. Print summary
```

---

# 82. Résultat attendu

Après :

```bash
rs-ui add drawer
```

l'utilisateur doit obtenir quelque chose comme :

```text
✓ Drawer component added

Files:
  ✓ components/ui/drawer.tsx
  ✓ components/ui/drawer-context.tsx

Dependencies:
  ✓ react-native-reanimated
  ✓ react-native-gesture-handler

Configuration:
  ✓ Rashwright UI config

Native:
  ⚠ A development build may be required.

Done.
```

---

# 83. `--all`

Commande :

```bash
rs-ui add --all
```

doit produire un plan global.

Exemple :

```text
Components:
18

New dependencies:
7

Already installed:
5

Native dependencies:
3

Files to add:
34

Continue? Yes
```

Puis installation groupée.

---

# 84. Versioning des composants

Chaque composant doit posséder une version.

Exemple :

```text
button@1.0.0
drawer@1.2.0
dialog@1.1.0
```

Le projet doit pouvoir connaître la version installée.

Exemple :

```json
{
  "components": {
    "button": "1.0.0",
    "drawer": "1.2.0"
  }
}
```

---

# 85. Mise à jour des composants

Lorsque :

```bash
rs-ui update
```

est exécuté :

```text
registry version
        ↓
installed version
        ↓
diff
```

Le système doit identifier :

```text
new files
modified files
deleted files
dependency changes
theme changes
```

avant d'écraser quoi que ce soit.

---

# 86. Migration

Pour les changements importants :

```text
button 1.x
    ↓
button 2.x
```

prévoir éventuellement :

```text
migration script
```

ou :

```text
migration notes
```

Ne pas introduire un système de migration extrêmement complexe dès le MVP.

---

# 87. Documentation

Chaque composant doit disposer d'une documentation minimale :

```text
Name
Description
Installation
Dependencies
Usage
Props
Variants
Theme support
Glass support
Platform support
Known limitations
```

---

# 88. Exemple de documentation Button

```text
Button

Description:
Generic interactive button for React Native.

Dependencies:
None.

Optional:
expo-haptics.

Supports:
✓ Light
✓ Dark
✓ Glass
✓ Android
✓ iOS

Usage:
<Button>Continue</Button>
```

---

# 89. Skills

Le repository doit également contenir des skills.

Exemple :

```text
skills/
├── ui-system/
├── ui-component/
├── theme/
├── glass/
├── expo-compatibility/
├── dependencies/
├── cli/
└── accessibility/
```

Le skill `ui-component` doit expliquer comment créer un nouveau composant compatible avec le registry.

---

# 90. Skill Expo Compatibility

Ce skill doit expliquer :

* comment détecter Expo SDK ;
* comment choisir les versions ;
* quand utiliser `expo install` ;
* comment gérer les modules natifs ;
* quand un rebuild est nécessaire ;
* comment tester plusieurs SDK.

---

# 91. Skill Component

Le skill doit définir :

```text
naming
props
variants
accessibility
theme
dependencies
platforms
tests
documentation
registry
```

---

# 92. Skill CLI

Documenter :

```text
rs-ui init
rs-ui add
rs-ui remove
rs-ui update
rs-ui list
rs-ui info
rs-ui doctor
```

ainsi que :

```text
--all
--glass
--yes
--dry-run
--json
```

---

# 93. Tests du système

Tester le CLI dans plusieurs projets de démonstration.

Créer par exemple :

```text
examples/
├── expo-basic/
├── expo-router/
├── expo-glass/
└── expo-minimal/
```

Tester :

```text
init
add
add --all
doctor
update
dependency resolution
Expo compatibility
```

---

# 94. Tests de compatibilité

Le projet doit progressivement tester plusieurs versions Expo.

Exemple conceptuel :

```text
Expo SDK 54
Expo SDK 55
Expo SDK 56
```

Le support exact dépendra des versions réellement maintenues.

Le système ne doit jamais annoncer une compatibilité qui n'a pas été testée ou vérifiée.

---

# 95. MVP

Le MVP doit se concentrer sur :

```text
CLI
Registry
init
add
--all
--glass
dependency resolver
Expo detection
package manager detection
theme
basic components
doctor
documentation
```

Ne pas construire immédiatement :

```text
dashboard
cloud registry complexe
authentication
analytics
marketplace
```

---

# 96. Première liste de composants

Commencer avec :

```text
button
text
icon
card
badge
avatar

input
textarea
checkbox
radio
switch

separator
stack

dialog
drawer
sheet
bottom-sheet

tabs
toast
alert

spinner
loading
skeleton
empty-state
error-state
```

La liste peut être réduite pour le premier prototype si nécessaire.

---

# 97. Première implémentation Glass

Le preset Glass doit au minimum démontrer :

```text
GlassCard
GlassButton
GlassInput
GlassDialog
GlassDrawer
GlassSheet
```

avec une architecture de tokens commune.

Ne pas créer deux systèmes UI indépendants.

---

# 98. Principe de compatibilité

La compatibilité doit être considérée sur trois niveaux :

```text
Project compatibility
        ↓
Expo compatibility
        ↓
Component compatibility
```

Exemple :

```text
Expo SDK 56
      ↓
Reanimated compatible
      ↓
Drawer compatible
```

---

# 99. Principe "Install Complete"

La règle principale du système :

> **Si un composant est annoncé comme installable, Rashwright doit connaître et traiter ses dépendances nécessaires.**

Il ne doit pas simplement copier un fichier et laisser le développeur découvrir ensuite les dépendances manquantes.

---

# 100. Principe "Don't Hide Native Requirements"

Les dépendances natives ne doivent jamais être cachées.

Le CLI doit clairement indiquer :

```text
JavaScript dependency
Native dependency
Expo config requirement
Rebuild required
```

lorsque pertinent.

---

# 101. Principe "Project Ownership"

Le projet consommateur possède le code copié.

Rashwright fournit :

```text
source
registry metadata
dependencies
templates
updates
documentation
```

mais ne verrouille pas le code.

---

# 102. Principe "No Vendor Lock-in"

Un projet doit pouvoir supprimer Rashwright UI après avoir installé les composants sans perdre la capacité de comprendre ou modifier son application.

Les composants doivent rester du code React Native normal.

---

# 103. Principe "No Magic"

Le CLI peut automatiser beaucoup de choses, mais doit rester transparent.

Exemple :

```text
rs-ui add drawer
```

doit pouvoir afficher :

```text
Files
Dependencies
Native requirements
Configuration changes
```

L'utilisateur doit comprendre ce qui va changer.

---

# 104. Architecture finale

Le système global doit ressembler à :

```text
                    RASHWRIGHT UI MOBILE
                             │
                    ┌────────┴────────┐
                    │                 │
                   CLI              Registry
                    │                 │
          ┌─────────┼─────────┐       │
          │         │         │       │
         init      add      doctor   metadata
          │         │
          └────┬────┘
               ↓
        Project Detection
               ↓
        Expo Detection
               ↓
     Dependency Resolution
               ↓
      Package Manager Adapter
               ↓
       Component Installer
               ↓
      Theme / Config System
               ↓
         Project Components
               │
               ↓
        React Native / Expo
```

---

# 105. Architecture du composant

```text
                  Component Registry
                         │
                ┌────────┼────────┐
                │        │        │
              Source   Metadata  Tests
                │        │
                ↓        ↓
          Component    Dependencies
                │        │
                └────┬───┘
                     ↓
                rs-ui add
                     ↓
             Project component
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
     Theme        Utilities      Native
       │             │             │
       └─────────────┼─────────────┘
                     ↓
               React Native
```

---

# 106. Commandes officielles v1

Le système doit viser au minimum :

```bash
rs-ui init

rs-ui init --glass

rs-ui init --all

rs-ui init --glass --all

rs-ui add button

rs-ui add button card input

rs-ui add --all

rs-ui list

rs-ui info drawer

rs-ui doctor

rs-ui remove button

rs-ui update
```

Options transversales :

```bash
--yes
--dry-run
--json
```

---

# 107. Résultat recherché

À terme, la philosophie d'utilisation doit être aussi simple que :

```bash
npx create-expo-app my-app

cd my-app

rs-ui init --glass

rs-ui add button drawer dialog
```

et Rashwright doit s'occuper du reste :

```text
✓ configuration
✓ thème
✓ composants
✓ dépendances
✓ versions Expo compatibles
✓ logique associée
✓ configuration native
✓ documentation
✓ tests
```

sans cacher les opérations importantes.

---

# 108. Relation avec Rashwright Architecture

Rashwright devient alors organisé en plusieurs produits techniques indépendants :

```text
Rashwright
│
├── Rashwright Architecture
│
├── Rashwright UI Mobile
│
├── Rashwright UI Web
│
└── autres outils futurs
```

Le système UI Mobile possède donc sa propre identité et son propre cycle de développement.

---

# 109. UI Web

Ne pas implémenter Rashwright UI Web maintenant.

Le système Web sera traité séparément.

Il pourra éventuellement suivre des principes similaires :

```text
rs-ui-web
```

mais il ne faut pas forcer les architectures Web et Mobile à être identiques.

Le système Mobile doit d'abord être stabilisé.

---

# 110. Règle finale

Rashwright UI Mobile doit être :

```text
Simple à installer
Transparent
Modulaire
Compatible Expo
Compatible React Native
Personnalisable
Extensible
Testable
Maintenable
```

et surtout :

> **Un composant installé doit être accompagné de tout ce qui est nécessaire à son fonctionnement, sans transformer le projet en boîte noire.**

La commande :

```bash
rs-ui add drawer
```

ne signifie donc pas :

> « copie ce fichier ».

Elle signifie :

> **« prépare correctement ce composant dans mon projet, avec son code, ses dépendances, ses sous-composants, son thème, sa configuration et ses exigences natives compatibles avec mon environnement Expo ».**

C'est cette propriété qui doit distinguer Rashwright UI Mobile d'une simple collection de composants React Native.
