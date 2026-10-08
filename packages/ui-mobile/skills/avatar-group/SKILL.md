---
name: rs-ui/avatar-group
description: Groupe d'avatars empilés avec compteur de dépassement.
version: 0.3.0
componentVersion: 0.3.0
category: Basic
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - avatar
supportsGlass: false
---

# AvatarGroup — Rashwright UI Mobile

Groupe d'avatars empilés avec compteur de dépassement.

## Installation

```bash
rs-ui add avatar-group
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { useTheme } from '@/contexts/theme-context';

export function ExampleAvatarGroup() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <AvatarGroup />
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
- **Composants requis** : avatar
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/avatar-group` ou `@/components/ui`.
