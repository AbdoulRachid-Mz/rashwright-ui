---
name: rs-ui/error-state
description: État d'erreur avec illustration, message et bouton de réessai.
version: 0.3.0
componentVersion: 0.3.0
category: States
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - button
supportsGlass: false
---

# ErrorState — Rashwright UI Mobile

État d'erreur avec illustration, message et bouton de réessai.

## Installation

```bash
rs-ui add error-state
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ErrorState } from '@/components/ui/error-state';
import { useTheme } from '@/contexts/theme-context';

export function ExampleErrorState() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ErrorState />
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
- **Composants requis** : button
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/error-state` ou `@/components/ui`.
