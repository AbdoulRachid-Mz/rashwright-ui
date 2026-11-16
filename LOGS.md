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
√ Choisir la version Expo SDK : Latest (SDK 58) - Recommandé

  Création du projet Expo dans le dossier (.) SDK 58 via bun...
- Exécution de bunx create-expo-app@latest . --template blank-typescript@58 --no-install --no-agents-md...  �Creating rs-test using the blank-typescript@58 template.
√ Downloaded and extracted project files.

✅ Your project is ready!

To run your project, run one of the following bun commands.

- bun run android
- bun run ios # you need to use macOS to build the iOS project - use the Expo app if you need to do iOS development without a Mac
- bun run web

⚠️  Before running your app, make sure you have modules installed:

  cd .\
  bun install


A new version of `create-expo` is available
You can update by running: npm install -g create-expo

√ Projet Expo créé dans le dossier . avec succès
√ Template Expo par défaut nettoyé et architecture /src en place
√ babel.config.js + tsconfig.json configurés
√ Choisir le Starter Template à initialiser : E-Commerce & Store (Boutique, recherche, filtres catégories, av
is & panier)
√ Choisir le style UI : Glass (Recommandé — Liquid Glass, expo-blur, expo-linear-gradient)
√ Choisir le thème de base : Forest Green (Vert Naturel)
√ Choisir le mode d'apparence initial (thème) : System (Recommandé — synchronisé avec le système d'exploitati
on)
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
√ 11 composants configurés (E-Commerce & Store)
√ Skills IA installés dans skills/rs-ui/ (Skill Global & starters)
√ Écran starter configuré (\src\app\index.tsx)
  ℹ Écrans locaux générés (hors registre) : commerce-screen
- Installation des dépendances de base via bun (expo, react-native…)…bun install v1.4.3 (c6da4a4d3)

+ @types/react@19.3.0
+ typescript@6.0.3 (v7.0.2 available)
+ expo@58.0.25
+ expo-status-bar@58.0.5
+ react@19.3.0
+ react-native@0.88.1

449 packages installed [123.55s]
√ Dépendances de base installées (expo disponible)
- Installation des dépendances Expo natives via bun expo install…› Installing 21 SDK 58.0.0 compatible native modules using bun
> bun add expo-router@~58.0.31 react-native-screens@~4.30.1 expo-constants@~58.0.16 expo-linking@~58.0.17 react-dom@19.3.0 react-native-web@^0.21.4 expo-system-ui@~58.0.7 react-native-reanimated@4.7.1 react-native-gesture-handler@~3.3.0 react-native-safe-area-context@~5.11.1 @expo/vector-icons@^15.0.2 expo-haptics@~58.0.8 expo-image@~58.0.18 @react-native-async-storage/async-storage@2.2.0 expo-image-picker@~58.0.10 expo-image-manipulator@~58.0.16 expo-application@~58.1.2 expo-device@~58.0.5 expo-blur@~58.0.6 expo-linear-gradient@~58.0.4 react-native-worklets@0.13.0
bun add v1.4.3 (c6da4a4d3)

installed expo-router@58.0.31
installed react-native-screens@4.30.1
installed expo-constants@58.0.16
installed expo-linking@58.0.17
installed react-dom@19.3.0
installed react-native-web@0.21.4
installed expo-system-ui@58.0.7
installed react-native-reanimated@4.7.1
installed react-native-gesture-handler@3.3.0
installed react-native-safe-area-context@5.11.1
installed @expo/vector-icons@15.1.1
installed expo-haptics@58.0.8
installed expo-image@58.0.18
installed @react-native-async-storage/async-storage@2.2.0
installed expo-image-picker@58.0.10
installed expo-image-manipulator@58.0.16
installed expo-application@58.1.2
installed expo-device@58.0.5
installed expo-blur@58.0.6
installed expo-linear-gradient@58.0.4
installed react-native-worklets@0.13.0

103 packages installed [198.52s]
› Added config plugins: expo-router, expo-image
√ Dépendances Expo installées (21 paquets)
- Installation des dépendances NPM (zustand, nativewind@5.0.0-rc.0, react-native-css@3.1.0-rc.0, tailwindcss@4.1.12, @tailwindcss/postcss@4.1.12, postcss, lightningcss@1.30.1)…bun add v1.4.3 (c6da4a4d3)

installed zustand@5.1.0
installed nativewind@5.0.0-rc.0
installed react-native-css@3.1.0-rc.0
installed tailwindcss@4.1.12
installed @tailwindcss/postcss@4.1.12
installed postcss@8.5.33
installed lightningcss@1.30.1

29 packages installed [20.86s]

√ Dépendances NPM installées (zustand, nativewind@5.0.0-rc.0, react-native-css@3.1.0-rc.0, tailwindcss@4.1.12, @tailwindcss/postcss@4.1.12, postcss, lightningcss@1.30.1)

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

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx expo start
Starting project at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test
Using src/app as the root directory for Expo Router.
Starting Metro Bundler

Failed to construct transformer:  TypeError: Yallist is not a constructor
    at LRUCache.reset (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\helper-compilation-targets\node_modules\lru-cache\index.js:136:22)
    at new LRUCache (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\helper-compilation-targets\node_modules\lru-cache\index.js:49:10)
    at Object.<anonymous> (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\helper-compilation-targets\lib\index.js:143:22)
    at Module._compile (node:internal/modules/cjs/loader:1873:14)
    at Object..js (node:internal/modules/cjs/loader:2013:10)
    at Module.load (node:internal/modules/cjs/loader:1596:32)
    at Module._load (node:internal/modules/cjs/loader:1398:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1619:12)
    at require (node:internal/modules/helpers:191:16)
    at _helperCompilationTargets (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\core\lib\config\resolve-targets.js:16:16)
    at resolveTargets (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\core\lib\config\resolve-targets.js:52:14)
    at loadPrivatePartialConfig (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\core\lib\config\partial.js:81:49)
    at loadPrivatePartialConfig.next (<anonymous>)
    at loadPartialConfig (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\core\lib\config\partial.js:115:25)
    at loadPartialConfig.next (<anonymous>)
    at evaluateSync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\gensync\index.js:251:28)
    at sync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\gensync\index.js:89:14)
    at stopHiding - secret - don't use this - v1 (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\core\lib\errors\rewrite-stack-trace.js:47:12)
    at loadPartialConfigSync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@babel\core\lib\config\index.js:37:84)
    at Object.getCacheKey (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\metro-config\build\babel-transformer.js:308:64)
    at Object.getCacheKey (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\metro-config\build\transform-worker\metro-transform-worker.js:916:86)
    at getTransformCacheKey (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\getTransformCacheKey.js:17:19)
    at new Transformer (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\Transformer.js:41:43)
    at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Bundler.js:25:29
    at runNextTicks (node:internal/process/task_queues:65:5)
    at process.processTimers (node:internal/timers:538:9)
    at async Bundler.ready (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Bundler.js:62:5)
    at async IncrementalBundler.ready (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\IncrementalBundler.js:310:5)
    at async Server.ready (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Server.js:1465:5)
    at async runMetro (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\index.flow.js:150:5)
    at async createConnectMiddleware (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\index.flow.js:155:23)
    at async runServer (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\metro\runServer-fork.js:75:46)
    at async replaceMetroFileMap (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\metro\createFileMap-fork.js:193:20)
    at async instantiateMetroAsync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\metro\instantiateMetro.js:426:51)
    at async MetroBundlerDevServer.startImplementationAsync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\metro\MetroBundlerDevServer.js:971:82)
    at async MetroBundlerDevServer.startAsync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\BundlerDevServer.js:138:24)
    at async DevServerManager.startAsync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\DevServerManager.js:198:13)
    at async startAsync (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\startAsync.js:175:5)
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
Web Bundling failed 404ms node_modules\expo-router\entry.js (1 module)
 ERROR  TypeError: Cannot read properties of undefined (reading 'transformFile')
    at Bundler.transformFile (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Bundler.js:55:30)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async patchedBundler.transformFile (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\@expo\cli\build\src\start\server\metro\withMetroCacheVary.js:93:22)
    at async Object.transform (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\lib\transformHelpers.js:139:12)
    at async transform (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\Graph.js:176:26)
    at async visit (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\buildSubgraph.js:80:29)
    at async Promise.all (index 0)
    at async buildSubgraph (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\buildSubgraph.js:105:3)
    at async Graph._buildDelta (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\Graph.js:163:22)
    at async Graph.initialTraverseDependencies (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\Graph.js:146:19)
    at async DeltaCalculator._getChangedDependencies (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\DeltaCalculator.js:165:25)
    at async DeltaCalculator.getDelta (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler\DeltaCalculator.js:75:16)
    at async DeltaBundler.buildGraph (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\DeltaBundler.js:42:5)
    at async IncrementalBundler.buildGraphForEntries (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\IncrementalBundler.js:94:19)
    at async IncrementalBundler.buildGraph (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\IncrementalBundler.js:178:19)
    at async C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\IncrementalBundler.js:216:34
    at async IncrementalBundler.initializeGraph (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\IncrementalBundler.js:233:24)
    at async build (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Server.js:893:35)
    at async Server.requestProcessor [as _processBundleRequest] (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Server.js:774:18)
    at async Server._processRequest (C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test\node_modules\metro\src\Server.js:531:7)