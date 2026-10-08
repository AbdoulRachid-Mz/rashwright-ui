---
name: rs-ui/select
description: Menu déroulant natif avec options, placeholder et valeur contrôlée.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - modal
supportsGlass: false
---

# Select — Rashwright UI Mobile

Menu déroulant natif avec options, placeholder et valeur contrôlée.

## Installation

```bash
rs-ui add select
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Select } from '@/components/ui/select';
import { useTheme } from '@/contexts/theme-context';

export function ExampleSelect() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Select />
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
- **Dépendances Expo** : @expo/vector-icons
- **Composants requis** : modal
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/select` ou `@/components/ui`.
