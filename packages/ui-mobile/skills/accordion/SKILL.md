---
name: rs-ui/accordion
description: Sections dépliables animées avec support multi-ouverture et variantes Glass.
version: 0.3.0
componentVersion: 0.3.0
category: Layout
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - none
supportsGlass: true
---

# Accordion — Rashwright UI Mobile

Sections dépliables animées avec support multi-ouverture et variantes Glass.

## Installation

```bash
rs-ui add accordion
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Accordion } from '@/components/ui/accordion';
import { useTheme } from '@/contexts/theme-context';

export function ExampleAccordion() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Accordion />
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
| `multiple` | `boolean` | Propriété `multiple` du composant |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Propriété `variant` du composant |


### Support Liquid Glass
Ce composant supporte le variant `glass` ou le style translucide Liquid Glass avec réfraction et bordure spéculaire.

## Dépendances & Prérequis

- **Dépendances npm** : Aucune
- **Dépendances Expo** : expo-haptics
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/accordion` ou `@/components/ui`.
