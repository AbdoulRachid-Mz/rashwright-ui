---
name: rs-ui/shimmer
description: Effet de scintillement skeleton avec dégradé animé de gauche à droite.
version: 0.3.0
componentVersion: 0.3.0
category: States
dependencies:
  - none
expoDependencies:
  - expo-linear-gradient
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Shimmer — Rashwright UI Mobile

Effet de scintillement skeleton avec dégradé animé de gauche à droite.

## Installation

```bash
rs-ui add shimmer
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shimmer } from '@/components/ui/shimmer';
import { useTheme } from '@/contexts/theme-context';

export function ExampleShimmer() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Shimmer />
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
- **Dépendances Expo** : expo-linear-gradient, react-native-reanimated
- **Composants requis** : Aucun
- **Providers requis** : 

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/shimmer` ou `@/components/ui`.
