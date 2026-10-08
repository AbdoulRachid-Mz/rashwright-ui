---
name: rs-ui/dropdown-menu
description: Menu déroulant avec items, sous-menus et icônes, ancré à un déclencheur.
version: 0.3.0
componentVersion: 0.3.0
category: Navigation
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# DropdownMenu — Rashwright UI Mobile

Menu déroulant avec items, sous-menus et icônes, ancré à un déclencheur.

## Installation

```bash
rs-ui add dropdown-menu
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/theme-context';

export function ExampleDropdownMenu() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <DropdownMenu />
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
- **Dépendances Expo** : @expo/vector-icons, react-native-reanimated
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/dropdown-menu` ou `@/components/ui`.
