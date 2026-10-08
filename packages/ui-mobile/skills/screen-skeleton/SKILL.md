---
name: rs-ui/screen-skeleton
description: Skeleton complet d'un écran pendant le chargement (header + liste de cards).
version: 0.3.0
componentVersion: 0.3.0
category: States
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - safe-area-view
  - skeleton
supportsGlass: false
---

# ScreenSkeleton — Rashwright UI Mobile

Skeleton complet d'un écran pendant le chargement (header + liste de cards).

## Installation

```bash
rs-ui add screen-skeleton
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenSkeleton } from '@/components/ui/screen-skeleton';
import { useTheme } from '@/contexts/theme-context';

export function ExampleScreenSkeleton() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ScreenSkeleton />
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
- **Composants requis** : safe-area-view, skeleton
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/screen-skeleton` ou `@/components/ui`.
