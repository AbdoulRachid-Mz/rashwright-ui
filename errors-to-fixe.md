PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bun install --force
bun install v1.4.3 (c6da4a4d3)

+ @types/react@19.3.0
+ typescript@6.0.3 (v7.0.2 available)
+ @expo/vector-icons@15.1.1
+ @react-native-async-storage/async-storage@2.2.0
+ @tailwindcss/postcss@4.1.12
+ expo@58.0.25
+ expo-application@58.1.2
+ expo-blur@58.0.6
+ expo-constants@58.0.16
+ expo-device@58.0.5
+ expo-haptics@58.0.8
+ expo-image@58.0.18
+ expo-image-manipulator@58.0.16
+ expo-image-picker@58.0.10
+ expo-linear-gradient@58.0.4
+ expo-linking@58.0.17
+ expo-router@58.0.31
+ expo-status-bar@58.0.5
+ expo-system-ui@58.0.7
+ lightningcss@1.30.1
+ nativewind@5.0.0-rc.0
+ postcss@8.5.33
+ react@19.3.0
+ react-dom@19.3.0
+ react-native@0.88.1
+ react-native-css@3.1.0-rc.0
+ react-native-gesture-handler@3.3.0 (v3.5.0 available)
+ react-native-reanimated@4.7.1
+ react-native-safe-area-context@5.11.1
+ react-native-screens@4.30.1
+ react-native-web@0.21.4
+ react-native-worklets@0.13.0
+ tailwindcss@4.1.12
+ zustand@5.1.0

558 packages installed [514.21s]

Blocked 1 postinstall. Run `bun pm untrusted` for details.
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx expo start
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx expo start -c
Starting project at C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test
Using src/app as the root directory for Expo Router.
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
› Open in the web browser...
› Press ? │ show all commands
| (node:16996) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
| (Use `node --trace-deprecation ...` to show where the warning was created)
| (node:16996) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
| (Use `node --trace-deprecation ...` to show where the warning was created)
| (node:16996) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
| (Use `node --trace-deprecation ...` to show where the warning was created)
| (node:16996) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
| (Use `node --trace-deprecation ...` to show where the warning was created)
Web Bundled 29128ms node_modules\expo-router\entry.js (1278 modules)
Web  INFO  %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
Web  ERROR

Code: category-filter.tsx
  34 |         const isSelected = cat === selected;
  35 |         return (
> 36 |           <TouchableOpacity
     |           ^
  37 |             key={cat}
  38 |             activeOpacity={0.7}
  39 |             onPress={() => onSelect(cat)}
Call Stack
  allCategories.map$argument_0 (src\components\templates\commerce\components\category-filter.tsx:36:11)
  CategoryFilter (src\components\templates\commerce\components\category-filter.tsx:33:22)
  ProductsScreen (src\components\templates\commerce\products-screen.tsx:167:11)
  CommerceTemplate (src\components\templates\commerce\commerce-template.tsx:62:7)
  RashwrightCommerceScreen (src\components\ui\commerce-screen.tsx:12:7)
  Index (src\app\index.tsx:5:10)
  RootLayout (src\app\_layout.tsx:9:7)
› Stopped server
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui -t
error: unknown option '-t'
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui templates
Usage: rs-ui [options] [command]

Rashwright UI Mobile — Système de composants React Native / Expo

Options:
  -V, --version                     output the version number
  -h, --help                        display help for command

Commands:
  init [options] [project-name]     Initialiser Rashwright UI Mobile (configure un projet
                                    existant ou en crée un nouveau)
  add [options] [components...]     Ajouter un ou plusieurs composants Rashwright UI au projet
  list [options]                    Afficher les composants ou templates Rashwright UI
                                    disponibles
  info [options] <component>        Afficher les détails et l'état 360° d'un artefact (local +
                                    registre)
  doctor [options]                  Diagnostiquer l'état de Rashwright UI dans le projet
                                    courant
  remove [options] <artefact>       Retirer un artefact Rashwright UI (composant, fondation,
                                    hook, lib, template, widget)
  update [options] [artefacts...]   Mettre à jour intelligemment les artefacts Rashwright UI
                                    installés (Smart Update)
  reset [options]                   Nettoyer les fichiers de démo et showcase du starter
                                    (archive ou suppression)
  backup [options] [label]          Créer un instantané (snapshot) de sauvegarde du projet
                                    Rashwright UI
  restore [options] [id]            Restaurer un snapshot de sauvegarde du projet Rashwright
                                    UI
  deps [options] <component>        Afficher l'arbre des dépendances directes et transitives
                                    d'un composant
  why [options] <target>            Expliquer pourquoi un artefact ou un paquet Expo est
                                    nécessaire dans le projet
  migrate [options]                 Appliquer les migrations système de Rashwright UI sur le
                                    projet
  create                            Créer de nouveaux éléments dans le projet Rashwright UI
  skill                             Gérer les compétences IA (Skills) de Rashwright UI
  registry                          Gérer les registres de composants personnalisés ou
                                    d'organisation
  template [action] [name]          Gérer et inspecter les templates complets Rashwright UI
  widget [action] [name]            Gérer et inspecter les widgets modulaires Rashwright UI
  mcp                               Lancer le serveur Model Context Protocol (MCP) pour les
                                    assistants IA ou configurer votre éditeur
  search [options] <query>          Rechercher des composants, templates et fonctionnalités
                                    dans le catalogue Rashwright UI
  diff [options] [component]        Comparer un ou plusieurs composants locaux avec leur
                                    version du registre
  upgrade [options] [artefacts...]  Mettre à niveau les composants installés vers la dernière
                                    version du registre (3-Way Merge & AST Transformers)
  showcase|storybook [options]      Lancer l'environnement interactif de prévisualisation
                                    (Storybook Mobile & Expo Showcase)
  fix [options]                     Détecter et réparer automatiquement les problèmes
                                    d'environnement et de configuration
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui template

  Rashwright UI Mobile — Templates disponibles

  auth           Authentication Suite (v1.0.1)
    Suite complète d'authentification : écrans séparés SignIn et SignUp, bouton Google Auth et validation OTP sécurisée.
    Composants : badge, button, card, checkbox, otp-input, rashwright-logo, text-input
    ✦ Support Liquid Glass natif

  chat           Chat & Messaging (v1.0.0)
    Messagerie instantanée mobile : liste inversée de messages, bulles Liquid Glass, barre de saisie tactile et notifications visuelles.
    Composants : avatar, badge, button, card, text-input
    ✦ Support Liquid Glass natif

  commerce       Commerce Suite (v1.0.1)
    Boutique e-commerce premium avec catalogue de produits, écran de détail produit complet (productId), sélection de variantes et gestion du panier.
    Composants : badge, button, card, divider, rashwright-logo, rating
    ✦ Support Liquid Glass natif

  dashboard      Dashboard & Analytics (v1.0.1)
    Tableau de bord complet avec StatCards interactives, feed d'activités, filtres temporels et actions rapides.
    Composants : avatar, badge, button, card, divider, rashwright-logo, stat-card
    ✦ Support Liquid Glass natif

  finance        Finance & Wallet (v1.0.0)
    Portefeuille financier mobile : solde avec masquage de confidentialité, raccourcis d'actions, historique catégorisé et cartes bancaires Liquid Glass.
    Composants : badge, button, card
    ✦ Support Liquid Glass natif

  minimal        Minimal Starter (v1.0.0)
    Structure d'accueil épurée avec Logo Rashwright, Card, Badges et boutons d'action.
    Composants : badge, button, card, rashwright-logo

  onboarding     Onboarding Flow (v1.0.1)
    Flux d'onboarding immersif avec étapes illustrées, badges de fonctionnalité, pagination fluide et redirection vers HomeScreen d'accueil.
    Composants : badge, button, card, rashwright-logo, stat-card
    ✦ Support Liquid Glass natif

  settings       Settings (v1.0.1)
    Écran paramètres avec profil utilisateur, sélecteur d'apparence 3 modes (Système, Clair, Sombre) et contrôle Liquid Glass.
    Composants : avatar, badge, button, card, divider, rashwright-logo
    ✦ Support Liquid Glass natif

  showcase       Showcase (v1.0.1)
    Vitrine de tous les composants Rashwright UI avec onglets overview, composants et glass.
    Composants : badge, button, card, glass-card, rashwright-logo, text-input
    ✦ Support Liquid Glass natif

  social         Social Network (v1.0.0)
    Réseau social mobile moderne : carrousel horizontal de stories animées, fil d'actualités avec likes interactifs, partages et commentaires.
    Composants : avatar, button, card
    ✦ Support Liquid Glass natif

  Pour initialiser un projet avec un template :
    rs-ui init --template <id>
  Pour ajouter un template à un projet existant :
    rs-ui add -t <id>

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add -t chat

  Rashwright UI Mobile — rs-ui add

  📦 Template sélectionné : Chat & Messaging (chat)
     Messagerie instantanée mobile : liste inversée de messages, bulles Liquid Glass, barre de saisie tactile et notifications visuelles.
  Plan d'installation:

  Fondations internes:
    + theme déjà installée [12 fichier(s)]
    + glass déjà installée [2 fichier(s)]
    + liquid déjà installée [8 fichier(s)]
    + responsive déjà installée [2 fichier(s)]
    + core-ui déjà installée [2 fichier(s)]

  Composants demandés:
    + avatar@1.0.0 [1 fichier(s)]

  Déjà installés:
    ~ badge@1.0.0  (utiliser --force pour réinstaller)
    ~ button@1.0.0  (utiliser --force pour réinstaller)
    ~ card@1.0.0  (utiliser --force pour réinstaller)
    ~ text-input@1.0.0  (utiliser --force pour réinstaller)

  Template:
    + chat@1.0.0 → src/components/templates/chat

  Intégrations système (providers React):
    • ThemeProvider

√ Continuer? Yes
√ Fondations traitées (5)
√ ✔ avatar@1.0.0 ajouté
√ Template chat installé dans src/components/templates/chat
    ✔ Route écran créée : src/app/conversation.tsx (ConversationScreen)

  Vérification post-installation (indépendante du lockfile) :
    37 fichier(s) et 144 import(s) analysés
    ✖ TypeScript : tsc a retourné 2
    ✖ TypeScript signale une erreur dans un fichier installé :
src/components/ui/text-input.tsx(13,3): error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?
src/components/ui/text-input.tsx(89,9): error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

  ✖ Vérification post-installation échouée : l'installation n'est pas déclarée réussie.

  ⚠ Rollback de l'installation locale :
    ↺ restauré : rashwright-ui.lock
    ↺ restauré : rashwright-ui.json
    ↺ restauré : src/components/ui/index.ts
    − supprimé : src/app/conversation.tsx
    − supprimé : src/components/templates/chat/index.ts
    − supprimé : src/components/templates/chat/components/chat-input.tsx
    − supprimé : src/components/templates/chat/components/chat-bubble.tsx
    − supprimé : src/components/templates/chat/types.ts
    − supprimé : src/components/templates/chat/conversation-screen.tsx
    − supprimé : src/components/templates/chat/chat-template.tsx
    − supprimé : skills/rs-ui/avatar/SKILL.md
    − supprimé : src/components/ui/avatar.tsx
    → Aucun succès d'installation n'est affiché tant que l'état disque n'est pas cohérent.
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add -t chat

  Rashwright UI Mobile — rs-ui add

  📦 Template sélectionné : Chat & Messaging (chat)
     Messagerie instantanée mobile : liste inversée de messages, bulles Liquid Glass, barre de saisie tactile et notifications visuelles.
  Plan d'installation:

  Fondations internes:
    + theme déjà installée [12 fichier(s)]
    + glass déjà installée [2 fichier(s)]
    + liquid déjà installée [8 fichier(s)]
    + responsive déjà installée [2 fichier(s)]
    + core-ui déjà installée [2 fichier(s)]

  Composants demandés:
    + avatar@1.0.0 [1 fichier(s)]

  Déjà installés:
    ~ badge@1.0.0  (utiliser --force pour réinstaller)
    ~ button@1.0.0  (utiliser --force pour réinstaller)
    ~ card@1.0.0  (utiliser --force pour réinstaller)
    ~ text-input@1.0.0  (utiliser --force pour réinstaller)

  Template:
    + chat@1.0.0 → src/components/templates/chat

  Intégrations système (providers React):
    • ThemeProvider

√ Continuer? Yes
√ Fondations traitées (5)
√ ✔ avatar@1.0.0 ajouté
√ Template chat installé dans src/components/templates/chat
    ✔ Route écran créée : src/app/conversation.tsx (ConversationScreen)

  Vérification post-installation (indépendante du lockfile) :
    37 fichier(s) et 144 import(s) analysés
    ✖ TypeScript : tsc a retourné 2
    ✖ TypeScript signale une erreur dans un fichier installé :
src/components/ui/text-input.tsx(13,3): error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?
src/components/ui/text-input.tsx(89,9): error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

  ✖ Vérification post-installation échouée : l'installation n'est pas déclarée réussie.

  ⚠ Rollback de l'installation locale :
    ↺ restauré : rashwright-ui.lock
    ↺ restauré : rashwright-ui.json
    ↺ restauré : src/components/ui/index.ts
    − supprimé : src/app/conversation.tsx
    − supprimé : src/components/templates/chat/index.ts
    − supprimé : src/components/templates/chat/components/chat-input.tsx
    − supprimé : src/components/templates/chat/components/chat-bubble.tsx
    − supprimé : src/components/templates/chat/types.ts
    − supprimé : src/components/templates/chat/conversation-screen.tsx
    − supprimé : src/components/templates/chat/chat-template.tsx
    − supprimé : skills/rs-ui/avatar/SKILL.md
    − supprimé : src/components/ui/avatar.tsx
    → Aucun succès d'installation n'est affiché tant que l'état disque n'est pas cohérent.
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add -t settings

  Rashwright UI Mobile — rs-ui add

  📦 Template sélectionné : Settings (settings)
     Écran paramètres avec profil utilisateur, sélecteur d'apparence 3 modes (Système, Clair, Sombre) et contrôle Liquid Glass.
  Plan d'installation:

  Fondations internes:
    + theme déjà installée [12 fichier(s)]
    + glass déjà installée [2 fichier(s)]
    + liquid déjà installée [8 fichier(s)]
    + responsive déjà installée [2 fichier(s)]
    + core-ui déjà installée [2 fichier(s)]

  Composants demandés:
    + avatar@1.0.0 [1 fichier(s)]

  Déjà installés:
    ~ badge@1.0.0  (utiliser --force pour réinstaller)
    ~ button@1.0.0  (utiliser --force pour réinstaller)
    ~ card@1.0.0  (utiliser --force pour réinstaller)
    ~ divider@1.0.0  (utiliser --force pour réinstaller)
    ~ rashwright-logo@1.0.0  (utiliser --force pour réinstaller)

  Template:
    + settings@1.0.1 → src/components/templates/settings

  Intégrations système (providers React):
    • ThemeProvider

√ Continuer? Yes
√ Fondations traitées (5)
√ ✔ avatar@1.0.0 ajouté
√ Template settings installé dans src/components/templates/settings

  Vérification post-installation (indépendante du lockfile) :
    38 fichier(s) et 146 import(s) analysés
    ✖ TypeScript : tsc a retourné 2
    ⚠ TypeScript signale des erreurs hors des fichiers installés :
src/components/ui/text-input.tsx(13,3): error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?
src/components/ui/text-input.tsx(89,9): error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

  ✔ Installation terminée
    ✔ index.ts synchronisé avec 11 composants

  📦 Template "settings" prêt à l'emploi :
     Emplacement : src/components/templates/settings
     import { SettingsTemplate } from "@/components/templates/settings";

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui doctor

  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 58
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: src/components/ui
  ✔ rashwright-ui.lock — 20 artefact(s) verrouillé(s)
  ✔ Artefacts installés: 20
  ✔ Intégrité: 20 artefact(s) intacts
  ✔ Skill IA Global (skills/rs-ui/SKILL.md)
  ✔ Skills IA Composants: 11/11 synchronisés
  ✔ Dépendances requises: 10 présentes
  ✔ Imports: 238 import(s) résolus

  Tout est en ordre!

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add

  Rashwright UI Mobile — rs-ui add

√ Sélectionnez les composants à installer (↑/↓ naviguer, Espace = cocher, a = tout, Entrée = va
lider, taper = filtrer)
  Aucun composant sélectionné.
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add

  Rashwright UI Mobile — rs-ui add

√ Sélectionnez les composants à installer (↑/↓ naviguer, Espace = cocher, a = tout, Entrée = va
lider, taper = filtrer) hold-button               Bouton d'action sensible avec maintien prolon
gé obligatoire, progression animée, annulation et retour haptique. [🥽 glass]
  → 1 composant(s) sélectionné(s)
  Plan d'installation:

  Fondations internes:
    + theme déjà installée [12 fichier(s)]
    + glass déjà installée [2 fichier(s)]
    + liquid déjà installée [8 fichier(s)]

  Composants demandés:
    + hold-button@1.0.0 [1 fichier(s)]

  Intégrations système (providers React):
    • ThemeProvider

√ Continuer? Yes
√ Fondations traitées (3)
√ ✔ hold-button@1.0.0 ajouté

  Vérification post-installation (indépendante du lockfile) :
    23 fichier(s) et 81 import(s) analysés
    ✖ TypeScript : tsc a retourné 2
    ⚠ TypeScript signale des erreurs hors des fichiers installés :
src/components/ui/text-input.tsx(13,3): error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?
src/components/ui/text-input.tsx(89,9): error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

  ✔ Installation terminée
    ✔ index.ts synchronisé avec 12 composants

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui widget

  Rashwright UI Mobile — Widgets modulaires disponibles

  activity-feed    Activity Feed Widget (v1.0.0)
    Flux d'activité chronologique avec avatars/icônes, libellés temporels, statuts, interactions et Liquid Glass.
    Composants requis : avatar, badge, card, divider, skeleton, text
    ✦ Support Liquid Glass natif

  chart            Chart Widget (v1.0.0)
    Visualisation de données sous forme de graphiques en barres animées, répartition et sparklines avec infobulle interactive et Liquid Glass.
    Composants requis : badge, card, skeleton, text
    ✦ Support Liquid Glass natif

  finance          Finance Widget (v1.0.0)
    Bloc portefeuille complet avec solde principal, masquage de confidentialité, ratio revenus/dépenses, raccourcis et Liquid Glass.
    Composants requis : badge, card, skeleton, text
    ✦ Support Liquid Glass natif

  metric           Metric Widget (v1.0.0)
    Indicateur statistique clé avec tendance, comparaison périodique, icône, état de chargement et support Liquid Glass.
    Composants requis : badge, card, skeleton, text
    ✦ Support Liquid Glass natif

  progress         Progress Widget (v1.0.0)
    Indicateur de progression vers un objectif avec calcul de pourcentage, barre animée, état complété et support Liquid Glass.
    Composants requis : badge, card, progress, skeleton, text
    ✦ Support Liquid Glass natif

  quick-actions    Quick Actions Widget (v1.0.0)
    Grille d'actions rapides configurable avec icônes, libellés, badges et support Liquid Glass.
    Composants requis : badge, card, skeleton, text
    ✦ Support Liquid Glass natif

  Pour inspecter les détails d'un widget :
    rs-ui widget info <id>
  Pour installer un widget modulaire dans votre projet :
    rs-ui add -w <id>
  ou directement :
    rs-ui widget add <id>

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add  -w progress

  Rashwright UI Mobile — rs-ui add

  🧩 Widget sélectionné : Progress Widget (progress)
     Indicateur de progression vers un objectif avec calcul de pourcentage, barre animée, état complété et support Liquid Glass.
  Plan d'installation:

  Fondations internes:
    + theme déjà installée [12 fichier(s)]
    + glass déjà installée [2 fichier(s)]
    + liquid déjà installée [8 fichier(s)]
    + responsive déjà installée [2 fichier(s)]
    + core-ui déjà installée [2 fichier(s)]

  Composants demandés:
    + progress@1.0.0 [1 fichier(s)]
    + skeleton@1.0.0 [1 fichier(s)]

  Déjà installés:
    ~ badge@1.0.0  (utiliser --force pour réinstaller)
    ~ card@1.0.0  (utiliser --force pour réinstaller)

  Widget:
    + progress@1.0.0 → src/components/widgets/progress

  Intégrations système (providers React):
    • ThemeProvider

√ Continuer? Yes
√ Fondations traitées (5)
√ ✔ progress@1.0.0 ajouté
√ ✔ skeleton@1.0.0 ajouté
√ Widget progress installé dans src/components/widgets/progress

  Vérification post-installation (indépendante du lockfile) :
    34 fichier(s) et 124 import(s) analysés
    ✖ TypeScript : tsc a retourné 2
    ⚠ TypeScript signale des erreurs hors des fichiers installés :
src/components/ui/text-input.tsx(13,3): error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?
src/components/ui/text-input.tsx(89,9): error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

  ✔ Installation terminée
    ✔ index.ts synchronisé avec 14 composants

  🧩 Widget "progress" prêt à l'emploi :
     Emplacement : src/components/widgets/progress
     import { ProgressWidget } from "@/components/widgets/progress";
     Documentation & IA Skill : skills/rs-ui/widgets/progress/SKILL.md

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test>