---
name: rs-ui/data-table
description: Tableau de données avec tri par colonnes, recherche et support Glass.
version: 0.3.0
componentVersion: 0.3.0
category: Data
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - search-input
supportsGlass: true
---

# DataTable — Rashwright UI Mobile

Tableau de données avec tri par colonnes, recherche et support Glass.

## Installation

```bash
rs-ui add data-table
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DataTable } from '@/components/ui/data-table';
import { useTheme } from '@/contexts/theme-context';

export function ExampleDataTable() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <DataTable />
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
| `searchable` | `boolean` | Propriété `searchable` du composant |
| `striped` | `boolean` | Propriété `striped` du composant |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Propriété `variant` du composant |
| `onRowPress` | `function` | Propriété `onRowPress` du composant |


### Support Liquid Glass
Ce composant supporte le variant `glass` ou le style translucide Liquid Glass avec réfraction et bordure spéculaire.

## Dépendances & Prérequis

- **Dépendances npm** : Aucune
- **Dépendances Expo** : Aucune
- **Composants requis** : search-input
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/data-table` ou `@/components/ui`.
