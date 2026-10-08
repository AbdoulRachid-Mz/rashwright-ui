---
name: rs-ui/rating
description: Notation par étoiles interactive avec support demi-étoiles et variante Glass.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - none
supportsGlass: false
---

# Rating — Rashwright UI Mobile

Notation par étoiles interactive avec support demi-étoiles et variante Glass.

## Installation

```bash
rs-ui add rating
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Rating } from '@/components/ui/rating';
import { useTheme } from '@/contexts/theme-context';

export function ExampleRating() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Rating />
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
| `value` | `number` | Propriété `value` du composant |
| `max` | `number` | Propriété `max` du composant |
| `readonly` | `boolean` | Propriété `readonly` du composant |
| `allowHalf` | `boolean` | Propriété `allowHalf` du composant |
| `onChange` | `function` | Propriété `onChange` du composant |


## Dépendances & Prérequis

- **Dépendances npm** : Aucune
- **Dépendances Expo** : expo-haptics
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/rating` ou `@/components/ui`.
