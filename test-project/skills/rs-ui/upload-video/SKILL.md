---
name: rs-ui/upload-video
description: Sélecteur et uploader de vidéo avec preview, durée et multi-providers.
version: 0.3.0
componentVersion: 0.3.0
category: Media
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
  - expo-image-picker
requiresComponents:
  - none
supportsGlass: false
---

# UploadVideo — Rashwright UI Mobile

Sélecteur et uploader de vidéo avec preview, durée et multi-providers.

## Installation

```bash
rs-ui add upload-video
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.


## Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UploadVideo } from '@/components/ui/upload-video';
import { useTheme } from '@/contexts/theme-context';

export function ExampleUploadVideo() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <UploadVideo />
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
- **Dépendances Expo** : @expo/vector-icons, expo-image-picker
- **Composants requis** : Aucun
- **Providers requis** : ThemeProvider

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers `any`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens `theme.colors` injectés par le `ThemeProvider`.
3. **Import alias** : Toujours importer depuis `@/components/ui/upload-video` ou `@/components/ui`.
