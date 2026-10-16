PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rashwright-ui\test-project> rs-ui init .


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
- Exécution de bunx create-expo-app@latest . --template blank-typescript@56 --no-install --no-agents-md...  🔍 ResolvingCreating test-project using the blank-typescript@56 template.

√ Downloaded and extracted project files.

✅ Your project is ready!

To run your project, run one of the following bun commands.

- bun run android
- bun run ios # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac
- bun run web

⚠️  Before running your app, make sure you have modules installed:

  cd .\
  bun install

? You are creating a project inside of an existing Git repository. Skip initializing a new git repository? » (Y/n)n
√ You are creating a project inside of an existing Git repository. Skip initializing a new git repository? ... yes

A new version of `create-expo` is available
You can update by running: npm install -g create-expo

√ Projet Expo créé dans le dossier . avec succès
√ Template Expo par défaut nettoyé et architecture /src en place
√ babel.config.js + tsconfig.json configurés
√ Choisir le Starter Template à initialiser : Showcase (Complet — Thèmes, Glass UI, upload media & démo)
√ Choisir le style UI : Glass (Recommandé — Liquid Glass, expo-blur, expo-linear-gradient)
√ Choisir le thème de base : Rashwright Blue (Default)
√ Choisir le mode d'apparence initial (thème) : Dark (Mode sombre forcé par défaut)
√ Chemin d'installation des composants UI : src/components/ui
√ Configurer NativeWind (Tailwind CSS) pour ce projet ? Yes
√ Choisir la version de NativeWind : v4 (Recommandé / Stable — Tailwind v3.4, configuration JS classique)

  Configuration appliquée :
  • Gestionnaire    : bun
  • Dossier composants : src/components/ui
  • Thème           : default (Mode: dark)
  • Style           : Liquid Glass
  • NativeWind      : Activé (v4)
  • Dépendances Expo : expo-router, react-native-screens, expo-constants, expo-linking, react-dom, react-native-web, expo-system-ui, react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, @expo/vector-icons, expo-haptics, expo-image, @react-native-async-storage/async-storage, expo-image-picker, expo-image-manipulator, expo-application, expo-blur, expo-linear-gradient
  • Dépendances NPM  : zustand, nativewind@4.2.7, tailwindcss@^3.4.17

√ Fondations du thème, store & primitives UI installées
√ NativeWind v4 configuré (global.css, tailwind.config, metro & types)
√ Assets Rashwright installés dans assets/
√ 9 composants configurés (Showcase Complet)
√ Skills IA installés dans skills/rs-ui/ (Skill Global & starters)
√ Écran starter configuré (\src\app\index.tsx)
- Installation des dépendances de base via bun (expo, react-native…)…bun install v1.4.3 (c6da4a4d3)

+ @types/react@19.2.18 (v19.3.0 available)
+ typescript@6.0.3 (v7.0.2 available)
+ expo@56.0.23 (v58.0.12 available)
+ expo-status-bar@56.0.4 (v58.0.3 available)
+ react@19.2.3
+ react-native@0.85.3

456 packages installed [20.90s]
√ Dépendances de base installées (expo disponible)
- Installation des dépendances Expo natives via bun expo install…› Installing 19 SDK 56.0.0 compatible native modules using bun
> bun add expo-router@~56.2.21 react-native-screens@~4.26.0 expo-constants@~56.0.27 expo-linking@~56.0.18 react-dom@19.2.3 react-native-web@^0.21.2 expo-system-ui@~56.0.5 react-native-reanimated@4.3.1 react-native-gesture-handler@~2.31.1 react-native-safe-area-context@~5.7.0 @expo/vector-icons@^15.0.2 expo-haptics@~56.0.3 expo-image@~56.0.13 @react-native-async-storage/async-storage@2.2.0 expo-image-picker@~56.0.25 expo-image-manipulator@~56.0.26 expo-application@~56.0.3 expo-blur@~56.0.4 expo-linear-gradient@~56.0.4
bun add v1.4.3 (c6da4a4d3)

installed expo-router@56.2.21
installed react-native-screens@4.26.2
installed expo-constants@56.0.27
installed expo-linking@56.0.18
installed react-dom@19.2.3
installed react-native-web@0.21.4
installed expo-system-ui@56.0.5
installed react-native-reanimated@4.3.1
installed react-native-gesture-handler@2.31.2
installed react-native-safe-area-context@5.7.0
installed @expo/vector-icons@15.1.1
installed expo-haptics@56.0.3
installed expo-image@56.0.13
installed @react-native-async-storage/async-storage@2.2.0
installed expo-image-picker@56.0.25
installed expo-image-manipulator@56.0.26
installed expo-application@56.0.3
installed expo-blur@56.0.4
installed expo-linear-gradient@56.0.4

158 packages installed [26.64s]
› Added config plugins: expo-router, expo-image
√ Dépendances Expo installées (19 paquets)
- Installation des dépendances NPM (zustand, nativewind@4.2.7, tailwindcss@^3.4.17)…bun add v1.4.3 (c6da4a4d3)

installed zustand@5.0.15
installed nativewind@4.2.7
installed tailwindcss@3.4.17 with binaries:
 - tailwind
 - tailwindcss

54 packages installed [12.43s]
√ Dépendances NPM installées (zustand, nativewind@4.2.7, tailwindcss@^3.4.17)

  ✔ Rashwright UI Mobile est opérationnel !

  Éléments prêts :
    ✔ src/components/ui/ (Bouton, Card, GlassCard, Badge, Input, Logo RS)
    ✔ index.ts exportant les composants configurés
    ✔ rashwright-ui.lock (Signatures SHA-256 et état réel)
    ✔ Gest. de paquets : bun
    ✔ theme/ (Tokens, presets Light/Dark/Glass)
    ✔ contexts/theme-context.tsx & stores/theme-store.ts
    ✔ assets/svg/primary.svg & assets/primary.png
    ✔ skills/rs-ui/ (Skill IA Global & documentation composants)
    ✔ Écran de démo actif avec logo RS et contrôles interactifs

  Commandes utiles :
    rs-ui add drawer
    rs-ui add tabs modal
    rs-ui list
    rs-ui doctor

  ⚠  Note Native :
     Le mode Glass utilise expo-blur et des animations natives.
     Pour un rendu optimal, lancez un development build :
     npx expo run:ios  ou  npx expo run:android

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rashwright-ui\test-project> bunx expo start -c
Starting project at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rashwright-ui\test-project
Using src/app as the root directory for Expo Router.
NativeWind made the following changes to your project to support TypeScript:
  - Updated ./tsconfig.json to include the nativewind-env.d.ts file
Starting Metro Bundler

warning: Bundler cache is empty, rebuilding (this may take a minute)
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ██▀▀▄█▄▀█ ▄▄▄▄▄ █
█ █   █ █  ▀█ ▀█ ▄█ █   █ █
█ █▄▄▄█ █▀  █▄▄▀▄██ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█ ▀▄█ █▄█▄▄▄▄▄▄▄█
█▄ ▀█ ▄▄███▄█▄█▄ ███ ▀▄▄ ▄█
█▄▀  ▄▄▄▄  ▄█▀▄█ ▄▀ █▄  ▀██
█ ▀██▀█▄▀▀▀▀▄▀█▄▀▄▀▄▀▀▄ ▀██
███ ▄ ▄▄▀    ▄██ ▄▄▀ ▄ ▀███
█▄▄██▄▄▄▄ ▀██▄▀▄▀ ▄▄▄ ▀ ▄▄█
█ ▄▄▄▄▄ █▀█▀█▀██▀ █▄█ ▀▀▀██
█ █   █ █▄ ▄▄ █▄█ ▄ ▄▄▀ ▀▀█
█ █▄▄▄█ █▀██ ▄██▀█▀▄▀█▀▀ ██
█▄▄▄▄▄▄▄█▄█▄███▄██▄▄▄▄▄▄▄▄█

› Scan the QR code above to open in Expo Go.
› Metro: exp://172.31.44.163:8081
› Web: http://localhost:8081

› Using Expo Go
› Press s │ switch to development build

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› shift+m │ more tools
› Press o │ open project code in your editor

› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.
TypeScript: The tsconfig.json#include property has been updated
› Open in the web browser...
› Press ? │ show all commands
Web Bundled 88626ms node_modules\expo-router\entry.js (1234 modules)
Web  LOG  Running application "main" with appParams:
 {"hydrate": undefined, "rootTag": "#root"}
Development-level warnings: ON.
Performance optimizations: OFF.
Web  ERROR  [Error: Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')]

Code: color-scheme.js
  44 |     set(value) {
  45 |         if (darkMode === "media") {
> 46 |             throw new Error("Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')");
     |                   ^
  47 |         }
  48 |         if (!globalThis.window) {
  49 |             throw new Error("Cannot manually set color scheme while not in a browser environment.");
Call Stack
  exports.colorScheme.set (node_modules\react-native-css-interop\dist\runtime\web\color-scheme.js:46:19)
  MutationObserver$argument_0 (node_modules\react-native-css-interop\dist\runtime\web\color-scheme.js:36:29)