---
name: rs-ui/chip
description: Chip/tag sélectionnable avec icône optionnelle et bouton de suppression.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - none
supportsGlass: true
---

# Chip — Rashwright UI Mobile

Chip/tag sélectionnable avec icône optionnelle et bouton de suppression.

## Installation

```bash
rs-ui add chip
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui/chip';
import { useTheme } from '@/contexts/theme-context';

export function ExampleChip() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Chip />
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


### Support Liquid Glass
Ce composant supporte le variant `glass` ou le style translucide Liquid Glass avec réfraction et bordure spéculaire.

## Dépendances & Prérequis

- **Dépendances npm** : Aucune
- **Dépendances Expo** : @expo/vector-icons
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/chip` ou `@/components/ui`.
