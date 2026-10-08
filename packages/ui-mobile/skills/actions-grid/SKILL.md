---
name: rs-ui/actions-grid
description: Grille d'actions rapides avec icônes et labels, style app iOS.
version: 0.3.0
componentVersion: 0.3.0
category: Navigation
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - carousel
supportsGlass: false
---

# ActionsGrid — Rashwright UI Mobile

Grille d'actions rapides avec icônes et labels, style app iOS.

## Installation

```bash
rs-ui add actions-grid
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionsGrid } from '@/components/ui/actions-grid';
import { useTheme } from '@/contexts/theme-context';

export function ExampleActionsGrid() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ActionsGrid />
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
- **Composants requis** : carousel
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/actions-grid` ou `@/components/ui`.
