---
name: rs-ui/stat-card
description: Carte de statistique avec valeur, label, icône et tendance (up/down).
version: 0.3.0
componentVersion: 0.3.0
category: Layout
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
requiresComponents:
  - none
supportsGlass: false
---

# StatCard — Rashwright UI Mobile

Carte de statistique avec valeur, label, icône et tendance (up/down).

## Installation

```bash
rs-ui add stat-card
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from '@/components/ui/stat-card';
import { useTheme } from '@/contexts/theme-context';

export function ExampleStatCard() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <StatCard />
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
- **Dépendances Expo** : @expo/vector-icons
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/stat-card` ou `@/components/ui`.
