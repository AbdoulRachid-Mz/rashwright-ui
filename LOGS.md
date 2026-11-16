PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui init .


██████╗ ███████╗
██╔══██╗██╔════╝
██████╔╝███████╗
██╔══██╗╚════██║
██║  ██║███████║
╚═╝  ╚═╝╚══════╝

  Rashwright UI Mobile — rs-ui init
  Component distribution system for React Native / Expo

√ Choisir le gestionnaire de paquets : bun
  ℹ Aucun projet React Native / Expo détecté dans le répertoire courant.

√ Créer un nouveau projet Expo avec Rashwright UI configuré ? Yes
√ Choisir la version Expo SDK : SDK 56

  Création du projet Expo dans le dossier (.) SDK 56 via bun...
- Exécution de bunx create-expo-app@latest . --template blank-typescript@56 --no-install --no-agents-md...  🔍 ResolvingCreating rs-test using the blank-typescript@56 template.
√ Downloaded and extracted project files.

✅ Your project is ready!

To run your project, run one of the following bun commands.

- bun run android
- bun run ios # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac
- bun run web

⚠️  Before running your app, make sure you have modules installed:

  cd .\
  bun install

√ Projet Expo créé dans le dossier . avec succès
√ Template Expo par défaut nettoyé et architecture /src en place
√ babel.config.js + tsconfig.json configurés
√ Choisir le Starter Template à initialiser : Authentication Suite (Écrans Connexion, Inscription, OTP & formulaires)
√ Choisir le style UI : Glass (Recommandé — Liquid Glass, expo-blur, expo-linear-gradient)
√ Choisir le thème de base : Forest Green (Vert Naturel)
√ Choisir le mode d'apparence initial (thème) : System (Recommandé — synchronisé avec le système d'exploitation)
√ Chemin d'installation des composants UI : src/components/ui
√ Configurer NativeWind (Tailwind CSS) pour ce projet ? Yes
√ Choisir la version de NativeWind : v5 (Next-Gen — Tailwind v4 CSS-first, sans tailwind.config.js)

  Configuration appliquée :
  • Gestionnaire    : bun
  • Dossier composants : src/components/ui
  • Thème           : green (Mode: system)
  • Style           : Liquid Glass
  • NativeWind      : Activé (v5)
  • Dépendances Expo : expo-router, react-native-screens, expo-constants, expo-linking, react-dom, react-native-web, expo-system-ui, react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, @expo/vector-icons, expo-haptics, expo-image, @react-native-async-storage/async-storage, expo-image-picker, expo-image-manipulator, expo-application, expo-device, expo-blur, expo-linear-gradient, react-native-worklets
  • Dépendances NPM  : zustand, nativewind@5.0.0-rc.0, react-native-css@3.1.0-rc.0, tailwindcss@4.1.12, @tailwindcss/postcss@4.1.12, postcss, lightningcss@1.30.1

√ Fondations du thème, store & primitives UI installées
√ NativeWind v5 configuré (global.css, tailwind.config, metro & types)
√ Assets Rashwright installés dans assets/
√ 9 composants configurés (Authentication Suite)
√ Skills IA installés dans skills/rs-ui/ (Skill Global & starters)
√ Écran starter configuré (\src\app\index.tsx)
  ℹ Écrans locaux générés (hors registre) : auth-screen
file:///C:/Users/user/.bun/install/global/node_modules/@rashwright/cli/dist/index.js:7305
          throw new Error(`Manifeste de fondation introuvable ou invalide : ${foundationName}`);
                ^

Error: Manifeste de fondation introuvable ou invalide : theme
    at Command.<anonymous> (file:///C:/Users/user/.bun/install/global/node_modules/@rashwright/cli/dist/index.js:7305:17)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)

Node.js v26.2.0
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bun install
bun install v1.4.3 (c6da4a4d3)

+ @types/react@19.2.18 (v19.3.0 available)
+ typescript@6.0.3 (v7.0.2 available)
+ expo@56.0.24 (v58.0.23 available)
+ expo-status-bar@56.0.4 (v58.0.4 available)
+ react@19.2.3
+ react-native@0.85.3

455 packages installed [581.50s]
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui doctor

  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 56
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: src/components/ui
  ✔ rashwright-ui.lock — 9 artefact(s) verrouillé(s)
  ✔ Artefacts installés: 9
  ✔ Intégrité: 9 artefact(s) intacts
  ✔ Skill IA Global (skills/rs-ui/SKILL.md)
  ✔ Skills IA Composants: 8/8 synchronisés
  ✖ Dépendances requises: 8 manquante(s) — @expo/vector-icons, expo-blur, expo-haptics, expo-linear-gradient, react-native-gesture-handler, react-native-reanimated, react-native-reanimated, react-native-safe-area-context — exécutez: rs-ui add --repair ou installez-les
  ✖ Imports: 6 problème(s) sur 84 import(s) — Package "react-native-reanimated" importé par src/components/ui/card.tsx mais absent de package.json. | Package "react-native-reanimated" importé par src/components/ui/checkbox.tsx mais absent de package.json. | Package "@expo/vector-icons" importé par src/components/ui/checkbox.tsx mais absent de package.json. | Package "react-native-reanimated" importé par src/components/ui/otp-input.tsx mais absent de package.json. | Package "expo-haptics" importé par src/components/ui/otp-input.tsx mais absent de package.json. | Package "react-native-safe-area-context" importé par src/components/templates/auth/auth-template.tsx mais absent de package.json.

  2 erreur(s) à corriger.

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui fix
› Installing 5 SDK 56.0.0 compatible native modules using bun
> bun add react-native-reanimated@4.3.1 react-native-gesture-handler@~2.31.1 react-native-safe-area-context@~5.7.0 expo-blur@~56.0.4 expo-linear-gradient@~56.0.4
bun add v1.4.3 (c6da4a4d3)

installed react-native-reanimated@4.3.1
installed react-native-gesture-handler@2.31.2
installed react-native-safe-area-context@5.7.0
installed expo-blur@56.0.4
installed expo-linear-gradient@56.0.4

47 packages installed [80.14s]
Skipping config plugin check: Failed to resolve plugin for module "expo-system-ui" relative to "C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test". Do you have node modules installed?

  Rashwright UI Mobile — rs-ui fix

  ✔ Installation des modules natifs Expo manquants (react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, expo-blur, expo-linear-gradient) [corrigé]
     Synchronisation des dépendances requises via bun

  1/1 problème(s) corrigé(s) avec succès !

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui doctor

  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 56
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: src/components/ui
  ✔ rashwright-ui.lock — 9 artefact(s) verrouillé(s)
  ✔ Artefacts installés: 9
  ✔ Intégrité: 9 artefact(s) intacts
  ✔ Skill IA Global (skills/rs-ui/SKILL.md)
  ✔ Skills IA Composants: 8/8 synchronisés
  ✖ Dépendances requises: 2 manquante(s) — @expo/vector-icons, expo-haptics — exécutez: rs-ui add --repair ou installez-les
  ⚠ Versions natives: 1 écart(s) avec la matrice SDK — react-native-gesture-handler: ~2.31.1 (attendu ~2.31.2)
  ✖ Imports: 2 problème(s) sur 84 import(s) — Package "@expo/vector-icons" importé par src/components/ui/checkbox.tsx mais absent de package.json. | Package "expo-haptics" importé par src/components/ui/otp-input.tsx mais absent de package.json.

  2 erreur(s) à corriger.
  1 avertissement(s).

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add --repair

  Rashwright UI Mobile — rs-ui add

? Sélectionnez les composants à installer (↑/↓ naviguer, Espace = cocher, a = tout, Entrée = valider, taper = filtrer)
 ( ) icon-button               Bouton icône rond avec variants de style et retour haptique optionnel. [🥽 glass]
 - rashwright-logo           Logo officiel Rashwright (RS) en PNG avec fallback SVG textuel, taille configurable. déjà i
nstallé (utilisez --force pour réinstaller)
>- ── Data ── (disabled)
 ( ) data-table                Tableau de données avec tri par colonnes, recherche et support Glass. [🥽 glass]
 ( ) flat-list                 FlatList thémée avec pull-to-refresh, skeleton de chargement et état vide intégré.
 ( ) section-list              SectionList thémée avec headers de section sticky et état vide.

↑↓ navigate • space select • a all • i invert • ⏎ submit
  Annulé.
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui fix

  Rashwright UI Mobile — rs-ui fix

  ✔ Aucun problème détecté. Votre projet est parfaitement configuré !

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx expo start
Starting project at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test
PluginError: Failed to resolve plugin for module "expo-system-ui" relative to "C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test". Do you have node modules installed?
PluginError: Failed to resolve plugin for module "expo-system-ui" relative to "C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test". Do you have node modules installed?
    at resolvePluginForModule (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\utils\plugin-resolver.js:84:9)
    at resolveConfigPluginFunctionWithInfo (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\utils\plugin-resolver.js:133:7)
    at resolveConfigPluginFunction (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\utils\plugin-resolver.js:124:7)
    at withStaticPlugin (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\plugins\withStaticPlugin.js:83:70)
    at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\plugins\withPlugins.js:28:84
    at Array.reduce (<anonymous>)
    at withPlugins (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\plugins\withPlugins.js:28:18)
    at withConfigPlugins (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config\build\plugins\withConfigPlugins.js:33:47)
    at fillAndReturnConfig (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config\build\Config.js:247:78)
    at getConfig (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config\build\Config.js:304:10)
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui fix

  Rashwright UI Mobile — rs-ui fix

  ✔ Aucun problème détecté. Votre projet est parfaitement configuré !

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui doctor

  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 56
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: src/components/ui
  ✔ rashwright-ui.lock — 9 artefact(s) verrouillé(s)
  ✔ Artefacts installés: 9
  ✔ Intégrité: 9 artefact(s) intacts
  ✔ Skill IA Global (skills/rs-ui/SKILL.md)
  ✔ Skills IA Composants: 8/8 synchronisés
  ✖ Dépendances requises: 2 manquante(s) — @expo/vector-icons, expo-haptics — exécutez: rs-ui add --repair ou installez-les
  ⚠ Versions natives: 1 écart(s) avec la matrice SDK — react-native-gesture-handler: ~2.31.1 (attendu ~2.31.2)
  ✖ Imports: 2 problème(s) sur 84 import(s) — Package "@expo/vector-icons" importé par src/components/ui/checkbox.tsx mais absent de package.json. | Package "expo-haptics" importé par src/components/ui/otp-input.tsx mais absent de package.json.

  2 erreur(s) à corriger.
  1 avertissement(s).

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx expo install @expo/vector-icons expo-haptics
› Installing 2 SDK 56.0.0 compatible native modules using bun
> bun add @expo/vector-icons@^15.0.2 expo-haptics@~56.0.3
bun add v1.4.3 (c6da4a4d3)

installed @expo/vector-icons@15.1.1
installed expo-haptics@56.0.3

2 packages installed [31.46s]
Skipping config plugin check: Failed to resolve plugin for module "expo-system-ui" relative to "C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test". Do you have node modules installed?
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx expo start
Starting project at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test
PluginError: Failed to resolve plugin for module "expo-system-ui" relative to "C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test". Do you have node modules installed?
PluginError: Failed to resolve plugin for module "expo-system-ui" relative to "C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test". Do you have node modules installed?
    at resolvePluginForModule (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\utils\plugin-resolver.js:84:9)
    at resolveConfigPluginFunctionWithInfo (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\utils\plugin-resolver.js:133:7)
    at resolveConfigPluginFunction (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\utils\plugin-resolver.js:124:7)
    at withStaticPlugin (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\plugins\withStaticPlugin.js:83:70)
    at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\plugins\withPlugins.js:28:84
    at Array.reduce (<anonymous>)
    at withPlugins (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config-plugins\build\plugins\withPlugins.js:28:18)
    at withConfigPlugins (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config\build\plugins\withConfigPlugins.js:33:47)
    at fillAndReturnConfig (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config\build\Config.js:247:78)
    at getConfig (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\config\build\Config.js:304:10)
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test>