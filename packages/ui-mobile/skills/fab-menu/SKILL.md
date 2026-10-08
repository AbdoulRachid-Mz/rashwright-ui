---
name: rs-ui/fab-menu
description: FAB avec menu d'actions secondaires déployable en éventail.
version: 0.3.0
componentVersion: 0.3.0
category: Navigation
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
  - react-native-reanimated
  - react-native-safe-area-context
requiresComponents:
  - floating-action-button
supportsGlass: false
---

# FabMenu — Rashwright UI Mobile

FAB avec menu d'actions secondaires déployable en éventail.

## Installation

```bash
rs-ui add fab-menu
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FabMenu } from '@/components/ui/fab-menu';
import { useTheme } from '@/contexts/theme-context';

export function ExampleFabMenu() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <FabMenu />
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
- **Dépendances Expo** : @expo/vector-icons, react-native-reanimated, react-native-safe-area-context
- **Composants requis** : floating-action-button
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/fab-menu` ou `@/components/ui`.
