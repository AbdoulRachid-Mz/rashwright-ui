---
name: rs-ui/image
description: Composant image optimisé avec chargement progressif, placeholder et gestion d'erreur.
version: 0.3.0
componentVersion: 0.3.0
category: Media
dependencies:
  - none
expoDependencies:
  - expo-image
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Image — Rashwright UI Mobile

Composant image optimisé avec chargement progressif, placeholder et gestion d'erreur.

## Installation

```bash
rs-ui add image
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from '@/components/ui/image';
import { useTheme } from '@/contexts/theme-context';

export function ExampleImage() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Image />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## Props API

| Prop | Type | Description |
|---|---|---|
| `style` | `StyleProp<ViewStyle>` | Styles personnalisés additionnels |
| `children` | `React.ReactNode` | Contenu enfant |


## Dépendances & Prérequis

- **Dépendances npm** : Aucune
- **Dépendances Expo** : expo-image, react-native-reanimated
- **Composants requis** : Aucun
- **Providers requis** : 

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/image` ou `@/components/ui`.
