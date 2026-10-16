3. La solution que je te conseille
Étape 1 — Vérifie les versions installées
Dans le terminal PowerShell, à la racine de ton projet, exécute :


powershell
bun pm ls | findstr "lru-cache yallist"
Puis :


powershell
bun pm ls | findstr "nativewind react-native-css expo"
Cela permettra de voir si tes dépendances sont cohérentes. NativeWind v5 RC0 demande notamment nativewind@5.0.0-rc.0 et react-native-css@3.1.0-rc.0. 

nativewind.dev
+1

Étape 2 — Réinstalle proprement les dépendances
Commence par cette solution, qui conserve ton fichier de verrouillage :

Arrête Expo avec Ctrl + C.

Supprime le dossier node_modules.

Réinstalle les dépendances avec Bun.

Exécute ces commandes dans PowerShell :


powershell
Remove-Item -Recurse -Force node_modules
bun install --force
bunx expo start --clear
Si l'erreur persiste, il faudra examiner les versions réellement résolues et éventuellement corriger le verrouillage des dépendances, plutôt que de forcer arbitrairement une version de yallist.

Étape 3 — Vérifie ta configuration NativeWind v5
Tes fichiers Metro et Babel sont globalement proches de ce qu'attend NativeWind v5.

metro.config.js

Ta configuration actuelle peut rester telle quelle :


js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
C'est bien la configuration indiquée dans la documentation officielle. 

nativewind.dev
+1

babel.config.js

Pour l'instant, conserve ta configuration actuelle pendant le diagnostic. L'erreur Yallist se produit dans les dépendances de Babel avant la transformation de ton application : changer les plugins Babel sans vérifier les versions ne constitue donc pas une correction fiable.