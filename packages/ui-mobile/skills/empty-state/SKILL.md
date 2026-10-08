---
name: rs-ui/empty-state
description: Composant d'état vide générique avec icône, titre, description et action optionnelle.
version: 0.3.0
componentVersion: 0.3.0
category: States
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - none
supportsGlass: false
---

# EmptyState — Rashwright UI Mobile

Composant d'état vide générique avec icône, titre, description et action optionnelle.

## Installation

```bash
rs-ui add empty-state
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EmptyState } from '@/components/ui/empty-state';
import { useTheme } from '@/contexts/theme-context';

export function ExampleEmptyState() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <EmptyState />
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
3. **Import alias** : Toujours importer depuis `@/components/ui/empty-state` ou `@/components/ui`.
