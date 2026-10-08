---
name: rs-ui/time-picker
description: Sélecteur d'heure avec rouleaux natifs iOS/Android.
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

# TimePicker — Rashwright UI Mobile

Sélecteur d'heure avec rouleaux natifs iOS/Android.

## Installation

```bash
rs-ui add time-picker
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TimePicker } from '@/components/ui/time-picker';
import { useTheme } from '@/contexts/theme-context';

export function ExampleTimePicker() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TimePicker />
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
- **Dépendances Expo** : Aucune
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/time-picker` ou `@/components/ui`.
