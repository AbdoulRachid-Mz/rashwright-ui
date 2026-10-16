---
name: rs-ui/search-input
description: Champ de recherche avec icône loupe, bouton d'effacement et debounce intégré.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - icon-button
  - text-input
supportsGlass: false
---

# SearchInput — Rashwright UI Mobile

Champ de recherche avec icône loupe, bouton d'effacement et debounce intégré.

## Installation

```bash
rs-ui add search-input
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SearchInput } from '@/components/ui/search-input';
import { useTheme } from '@/contexts/theme-context';

export function ExampleSearchInput() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <SearchInput />
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
- **Composants requis** : icon-button, text-input
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/search-input` ou `@/components/ui`.
