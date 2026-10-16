Salut ! Voici un "skill" (guide d'installation) pour configurer `expo-system-ui` afin que ton système suive le thème du système. Je n'ai pas d'information sur le contenu spécifique de la SDK 58 dans les sources, donc ce guide se base sur la documentation "latest". Vérifie la [doc SDK 58](https://docs.expo.dev/versions/v58.0.0/) pour d'éventuelles différences. De plus, les sources ne couvrent pas le format exact d'un "skill" (ex. pour Claude Code), je te donne donc des étapes à intégrer dans ton init.

## 1. Installation

```
npx expo install expo-system-ui
```

Sans cette installation, `userInterfaceStyle` est ignoré sur Android. [[Color themes](https://docs.expo.dev/develop/user-interface/color-themes/)]

Pour un projet React Native existant, il faut d'abord installer `expo`. [[SystemUI install](https://docs.expo.dev/versions/latest/sdk/system-ui/#installation)]

## 2. Configuration de l'app config

Utilise `automatic` pour suivre les réglages du système (sinon, la valeur par défaut est `light`). [[Color themes](https://docs.expo.dev/develop/user-interface/color-themes/)]

```
{
  "expo": {
    "userInterfaceStyle": "automatic",
    "plugins": ["expo-system-ui"]
  }
}
```

Tu peux aussi définir `android.userInterfaceStyle` ou `ios.userInterfaceStyle` par plateforme. [[Color themes](https://docs.expo.dev/develop/user-interface/color-themes/)]

Ces propriétés ne peuvent pas être modifiées à l'exécution : un nouveau build natif est nécessaire. [[SystemUI config](https://docs.expo.dev/versions/latest/sdk/system-ui/#installation)]

## 3. Vérifier la configuration

```
npx expo config --type introspect
```

Si `expo-system-ui` manque, ce warning apparaît : `» android: userInterfaceStyle: Install expo-system-ui in your project to enable this feature.` [[Color themes](https://docs.expo.dev/develop/user-interface/color-themes/)]

## 4. Détecter le thème dans le code

```
import { useColorScheme } from 'react-native';

function MyComponent() {
  let colorScheme = useColorScheme();

  if (colorScheme === 'dark') {
    // render some dark thing
  } else {
    // render some light thing
  }
}
```
[[Detect color scheme](https://docs.expo.dev/develop/user-interface/color-themes/#detect-the-color-scheme)]

Tu peux aussi utiliser `Appearance.getColorScheme()` et `Appearance.addChangeListener()`. [[Detect color scheme](https://docs.expo.dev/develop/user-interface/color-themes/#detect-the-color-scheme)]

## 5. Couleur de fond racine (optionnel)

Appelle ceci dans le fichier racine, en dehors de ton composant :

```
SystemUI.setBackgroundColorAsync("black");
```
avec `import * as SystemUI from 'expo-system-ui';`. [[SystemUI API](https://docs.expo.dev/versions/latest/sdk/system-ui/#installation)]

## 6. Projet sans CNG (React Native existant)

- **Android** : ajoute `expo_system_ui_user_interface_style` dans `strings.xml`, et le flag `uiMode` dans `configChanges` de `MainActivity` avec `onConfigurationChanged`.
- **iOS** : configure la clé `UIUserInterfaceStyle` dans `Info.plist` (`Automatic` pour supporter clair et sombre). [[Color themes](https://docs.expo.dev/develop/user-interface/color-themes/)]

## Remarques

- Pour le web, aucune configuration supplémentaire n'est requise. [[Color themes](https://docs.expo.dev/develop/user-interface/color-themes/)]
- Les sources ne détaillent pas le comportement desktop (PC/Mac) hors web ; seuls Android, iOS, tvOS et web sont mentionnés pour `expo-system-ui`.

Si tu me fournis ta documentation générale, je peux adapter ce guide à la structure de ton système.