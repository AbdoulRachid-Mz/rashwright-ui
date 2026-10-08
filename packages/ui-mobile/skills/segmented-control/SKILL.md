---
name: rs-ui/segmented-control
description: Contrôle segmenté (type iOS) avec sélection animée.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# SegmentedControl — Rashwright UI Mobile

Contrôle segmenté (type iOS) avec sélection animée.

## Installation

```bash
rs-ui add segmented-control
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useTheme } from '@/contexts/theme-context';

export function ExampleSegmentedControl() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <SegmentedControl />
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
- **Dépendances Expo** : react-native-reanimated
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/segmented-control` ou `@/components/ui`.
