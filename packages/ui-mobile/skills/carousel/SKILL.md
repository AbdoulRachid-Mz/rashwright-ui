---
name: rs-ui/carousel
description: Carrousel tactile fluide avec pagination, auto-défilement, configuration responsive et bouclage infini.
version: 1.0.0
componentVersion: 1.0.0
category: Layout
dependencies:
  - none
expoDependencies:
  - @expo/vector-icons
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Carousel — Rashwright UI Mobile

Composant carrousel interactif tactile et fluide, doté d'indicateurs de pagination animés, défilement automatique configurable, et dimensionnement adaptatif responsive (`itemsPerView`).

## Installation

```bash
rs-ui add carousel
```

## Caractéristiques

- **Responsive `itemsPerView`** : Support des valeurs numériques fixes ou adaptatives par breakpoint (`{ sm: 1, md: 2, lg: 3 }`).
- **Défilement automatique & Bouclage** : Props `autoPlay`, `autoPlayInterval`, et bouclage infini `loop`.
- **Indicateurs de pagination** : Pagination animée par points (`dots`) ou fractions (`fraction`), entièrement personnalisable.
- **Accélération matérielle** : Gestes et transitions pilotés par `react-native-reanimated` pour un défilement 60 fps sans accroc.
- **Compatibilité NativeWind** : Prop `className` supportée nativement.

## Usage

### 1. Carrousel avec Pagination et Auto-play

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Carousel } from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';

const banners = [
  { id: '1', title: 'Nouvelle Collection Printemps', color: '#6366F1' },
  { id: '2', title: 'Livraison Express Gratuite', color: '#10B981' },
  { id: '3', title: 'Garantie Satisfait ou Remboursé', color: '#F59E0B' },
];

export function PromoCarousel() {
  return (
    <Carousel
      data={banners}
      autoPlay
      autoPlayInterval={3500}
      showPagination
      paginationVariant="dots"
      renderItem={({ item }) => (
        <View style={[styles.slide, { backgroundColor: item.color }]}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
```

### 2. Carrousel Responsive Multi-Éléments

```tsx
import React from 'react';
import Carousel from '@/components/ui/carousel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Text } from 'react-native';

export function ProductShowcase({ items }: { items: any[] }) {
  return (
    <Carousel
      data={items}
      itemsPerView={{ sm: 1, md: 2, lg: 3 }}
      itemSpacing={12}
      renderItem={({ item }) => (
        <Card>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text>{item.price} €</Text>
          </CardContent>
        </Card>
      )}
    />
  );
}
```

## Props API

| Prop | Type | Description |
|---|---|---|
| `data` | `T[]` | Données de la collection à afficher |
| `renderItem` | `(info: { item: T; index: number }) => React.ReactElement` | Fonction de rendu pour chaque slide |
| `itemsPerView` | `number \| ResponsiveValue<number>` | Nombre d'éléments affichés simultanément selon le breakpoint |
| `itemSpacing` | `number` | Espacement entre deux slides |
| `autoPlay` | `boolean` | Active le défilement automatique |
| `autoPlayInterval` | `number` | Intervalle en millisecondes entre deux slides (défaut: 3000ms) |
| `loop` | `boolean` | Active la rotation en boucle infinie |
| `showPagination` | `boolean` | Affiche les indicateurs de pagination (défaut: true) |
| `paginationVariant` | `'dots' \| 'fraction' \| 'bars'` | Style des indicateurs |
| `onIndexChange` | `(index: number) => void` | Callback appelé à chaque changement de diapositive |
| `className` | `string` | Classes Tailwind / NativeWind |
