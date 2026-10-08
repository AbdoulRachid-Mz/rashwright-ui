---
name: rs-ui/carousel
description: Carrousel d'éléments swipeable avec pagination et défilement automatique optionnel.
version: 0.3.0
componentVersion: 0.3.0
category: Navigation
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Carousel — Rashwright UI Mobile

Carrousel d'éléments swipeable avec pagination et défilement automatique optionnel.

## Installation

```bash
rs-ui add carousel
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Carousel } from '@/components/ui/carousel';
import { useTheme } from '@/contexts/theme-context';

export function ExampleCarousel() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Carousel />
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
- **Dépendances Expo** : @expo/vector-icons, react-native-reanimated
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/carousel` ou `@/components/ui`.
