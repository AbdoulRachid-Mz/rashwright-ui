---
name: rs-ui/popup
description: Popup contextuel ancré à un élément avec contenu personnalisable.
version: 0.3.0
componentVersion: 0.3.0
category: Feedback
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - button
  - modal
supportsGlass: false
---

# Popup — Rashwright UI Mobile

Popup contextuel ancré à un élément avec contenu personnalisable.

## Installation

```bash
rs-ui add popup
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Popup } from '@/components/ui/popup';
import { useTheme } from '@/contexts/theme-context';

export function ExamplePopup() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Popup />
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
- **Composants requis** : button, modal
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/popup` ou `@/components/ui`.
