---
name: rs-ui/otp-input
description: Champ OTP avec cases individuelles, focus automatique et support Glass.
version: 0.3.0
componentVersion: 0.3.0
category: Forms
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - none
supportsGlass: true
---

# OtpInput — Rashwright UI Mobile

Champ OTP avec cases individuelles, focus automatique et support Glass.

## Installation

```bash
rs-ui add otp-input
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OtpInput } from '@/components/ui/otp-input';
import { useTheme } from '@/contexts/theme-context';

export function ExampleOtpInput() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <OtpInput />
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
| `length` | `number` | Propriété `length` du composant |
| `variant` | `'default' \| 'outline' \| 'glass'` | Propriété `variant` du composant |
| `error` | `boolean` | Propriété `error` du composant |
| `onComplete` | `function` | Propriété `onComplete` du composant |


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
3. **Import alias** : Toujours importer depuis `@/components/ui/otp-input` ou `@/components/ui`.
