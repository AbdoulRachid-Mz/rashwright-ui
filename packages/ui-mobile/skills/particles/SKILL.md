---
name: rs-ui/particles
description: Système de particules animées pour arrière-plans décoratifs.
version: 0.3.0
componentVersion: 0.3.0
category: Glass
dependencies:
  - none
expoDependencies:
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Particles — Rashwright UI Mobile

Système de particules animées pour arrière-plans décoratifs.

## Installation

```bash
rs-ui add particles
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Particles } from '@/components/ui/particles';
import { useTheme } from '@/contexts/theme-context';

export function ExampleParticles() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Particles />
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
- **Dépendances Expo** : react-native-reanimated
- **Composants requis** : Aucun
- **Providers requis** : 

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/particles` ou `@/components/ui`.
