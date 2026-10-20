---
name: rs-ui/like-button
description: Bouton J'aime interactif avec animation fluide Reanimated, compteur, gestion d'état contrôlé/non-contrôlé et support Liquid Glass.
version: 1.0.0
componentVersion: 1.0.0
category: Basic
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - none
supportsGlass: true
---

# LikeButton — Rashwright UI Mobile

Le composant `LikeButton` offre une interaction engageante pour les favoris, likes et réactions (réseaux sociaux, e-commerce, commentaires), avec animations de ressort élastique et particules.

## Installation

```bash
rs-ui add like-button
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { LikeButton } from '@/components/ui/like-button';

export default function MyScreen() {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(142);

  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      {/* Non contrôlé avec compteur */}
      <LikeButton
        defaultLiked={false}
        count={24}
        showCount
        onLike={() => console.log('Aimé !')}
      />

      {/* Contrôlé avec variante Glass */}
      <LikeButton
        liked={liked}
        count={likesCount}
        showCount
        variant="glass"
        size="lg"
        onValueChange={(nextLiked) => {
          setLiked(nextLiked);
          setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));
        }}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `liked` | `boolean` | `undefined` | État actif contrôlé. |
| `defaultLiked` | `boolean` | `false` | État initial en mode non contrôlé. |
| `count` | `number` | `undefined` | Valeur du compteur de likes. |
| `showCount` | `boolean` | `false` | Affiche ou masque le compteur numérique. |
| `variant` | `'default' \| 'filled' \| 'outline' \| 'glass' \| 'subtle'` | `'default'` | Style visuel du conteneur. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du bouton, icône et texte. |
| `activeColor` | `string` | `'#EF4444'` | Couleur de l'icône et du texte en état liké. |
| `loading` | `boolean` | `false` | Affiche un indicateur de chargement asynchrone. |
| `disabled` | `boolean` | `false` | Désactive l'interaction. |
| `onValueChange` | `(liked: boolean) => void` | `undefined` | Déclenché à chaque basculement. |
| `onLike` | `() => void` | `undefined` | Déclenché uniquement lors du like. |
| `onUnlike` | `() => void` | `undefined` | Déclenché uniquement lors du retrait du like. |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style additionnel du conteneur. |

## Accessibilité

- Rôle `accessibilityRole="button"`.
- État `accessibilityState={{ selected: isLiked }}`.
- Annonce vocale dynamique contextualisée.
