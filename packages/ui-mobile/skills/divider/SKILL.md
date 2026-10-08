---
name: rs-ui/divider
description: Séparateur horizontal ou vertical avec label optionnel.
version: 0.3.0
componentVersion: 0.3.0
category: Layout
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - none
supportsGlass: true
---

# Divider — Rashwright UI Mobile

Séparateur horizontal ou vertical avec label optionnel.

## Installation

```bash
rs-ui add divider
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider } from '@/components/ui/divider';
import { useTheme } from '@/contexts/theme-context';

export function ExampleDivider() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Divider />
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
- **Dépendances Expo** : Aucune
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/divider` ou `@/components/ui`.
