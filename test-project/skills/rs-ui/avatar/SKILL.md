---
name: rs-ui/avatar
description: Avatar utilisateur avec image, initiales fallback et indicateur de présence.
version: 0.3.0
componentVersion: 0.3.0
category: Basic
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
  - expo-image
requiresComponents:
  - none
supportsGlass: false
---

# Avatar — Rashwright UI Mobile

Avatar utilisateur avec image, initiales fallback et indicateur de présence.

## Installation

```bash
rs-ui add avatar
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/theme-context';

export function ExampleAvatar() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Avatar />
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
- **Dépendances Expo** : @expo/vector-icons, expo-image
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/avatar` ou `@/components/ui`.
