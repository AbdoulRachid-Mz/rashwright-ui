---
name: rs-ui/alert
description: Alerte inline avec variants (success, warning, error, info) et bouton de fermeture.
version: 0.3.0
componentVersion: 0.3.0
category: Feedback
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - none
supportsGlass: false
---

# Alert — Rashwright UI Mobile

Alerte inline avec variants (success, warning, error, info) et bouton de fermeture.

## Installation

```bash
rs-ui add alert
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Alert } from '@/components/ui/alert';
import { useTheme } from '@/contexts/theme-context';

export function ExampleAlert() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Alert />
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
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/alert` ou `@/components/ui`.
