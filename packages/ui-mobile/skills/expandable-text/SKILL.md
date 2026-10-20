---
name: rs-ui/expandable-text
description: Composant de texte à déploiement progressif pour descriptions longues, avis et articles avec animation fluide.
version: 1.0.0
componentVersion: 1.0.0
category: Basic
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - text
supportsGlass: false
---

# ExpandableText — Rashwright UI Mobile

Le composant `ExpandableText` permet d'afficher des paragraphes longs en limitant leur hauteur initiale à un nombre défini de lignes, avec un bouton « Voir plus / Voir moins » animé.

## Installation

```bash
rs-ui add expandable-text
```

## Usage de base

```tsx
import React from 'react';
import { View } from 'react-native';
import { ExpandableText } from '@/components/ui/expandable-text';

export default function ProductDescription() {
  return (
    <View style={{ padding: 16 }}>
      <ExpandableText maxLines={3} expandText="Lire la suite" collapseText="Réduire">
        Rashwright UI Mobile est une bibliothèque complète de composants distribuables pour React Native et Expo. Elle combine la philosophie de shadcn/ui avec un moteur de design Liquid Glass pour offrir une expérience native d'exception sur iOS, Android et Web.
      </ExpandableText>
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `string` | *requis* | Texte source à afficher. |
| `maxLines` | `number` | `3` | Nombre maximum de lignes visibles avant tronquage. |
| `expandText` | `string` | `'Voir plus'` | Texte du bouton pour déplier. |
| `collapseText` | `string` | `'Voir moins'` | Texte du bouton pour replier. |
| `variant` | `'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl'` | `'base'` | Taille typographique du texte. |
| `color` | `TextColor` | `'foreground'` | Couleur thématique du texte. |
| `actionColor` | `string` | `undefined` | Couleur personnalisée pour le lien d'action. |
| `allowCollapse` | `boolean` | `true` | Autorise ou interdit de replier le texte une fois déplié. |
| `defaultExpanded` | `boolean` | `false` | Démarre dans l'état déplié. |
| `onExpandChange` | `(expanded: boolean) => void` | `undefined` | Callback lors du changement d'état. |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style additionnel du conteneur. |
