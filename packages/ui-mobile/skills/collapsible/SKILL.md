---
name: rs-ui/collapsible
description: Section dépliable animée, version single-item de l'Accordion.
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

# Collapsible — Rashwright UI Mobile

Section dépliable animée, version single-item de l'Accordion.

## Installation

```bash
rs-ui add collapsible
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Collapsible } from '@/components/ui/collapsible';
import { useTheme } from '@/contexts/theme-context';

export function ExampleCollapsible() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Collapsible />
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
| `defaultOpen` | `boolean` | Propriété `defaultOpen` du composant |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Propriété `variant` du composant |
| `onToggle` | `function` | Propriété `onToggle` du composant |


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
3. **Import alias** : Toujours importer depuis `@/components/ui/collapsible` ou `@/components/ui`.
