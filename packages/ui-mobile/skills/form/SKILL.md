---
name: rs-ui/form
description: Composants de formulaire (Field, Label, Message, Description) compatibles react-hook-form.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - none
supportsGlass: false
---

# Form — Rashwright UI Mobile

Composants de formulaire (Field, Label, Message, Description) compatibles react-hook-form.

## Installation

```bash
rs-ui add form
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Form } from '@/components/ui/form';
import { useTheme } from '@/contexts/theme-context';

export function ExampleForm() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Form />
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
| `label` | `string` | Propriété `label` du composant |
| `error` | `string` | Propriété `error` du composant |
| `required` | `boolean` | Propriété `required` du composant |
| `description` | `string` | Propriété `description` du composant |


## Dépendances & Prérequis

- **Dépendances npm** : Aucune
- **Dépendances Expo** : Aucune
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/form` ou `@/components/ui`.
