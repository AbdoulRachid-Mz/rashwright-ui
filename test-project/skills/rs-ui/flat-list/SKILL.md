---
name: rs-ui/flat-list
description: FlatList virtualisée haute performance avec grille responsive adaptative, tri dynamique et carrousels insérés.
version: 1.0.0
componentVersion: 1.0.0
category: Data
dependencies:
  - none
expoDependencies:
  - react-native-reanimated
requiresComponents:
  - carousel
supportsGlass: false
---

# FlatList — Rashwright UI Mobile

Composant de liste virtualisée ultra-optimisé (60 fps garanti) enrichi avec un moteur de grille responsive, tri d'éléments à la volée, et insertion native de carrousels pleine largeur sans casser la virtualisation.

## Installation

```bash
rs-ui add flat-list
```

## Caractéristiques

- **Virtualisation haute performance (60 fps)** : Gestion du rendu par rangées virtuelles préservant le recyclage mémoire natif de FlatList sans à-coups.
- **Grille multi-colonnes responsive** : Spécification des colonnes via breakpoints standard (`sm`, `md`, `lg`, `xl`, `2xl`), par exemple `columns={{ sm: 1, md: 2, lg: 3 }}`.
- **Moteur de tri intégré** : Props `sortBy` (`"asc"` | `"desc"`), `sortKey` et `sortFn` pour réordonner vos collections sans modifier l'état source.
- **Insertion de Carrousels (`carousels`)** : Intègre des bannières ou carrousels swipeables pleine largeur (`CarouselSlot`) à des positions spécifiques de la liste.
- **États intégrés** : Support de `loading` (avec skeleton personnalisable), `emptyState` (texte ou composant vide), et `pull-to-refresh` thémé.
- **Compatibilité NativeWind** : Prise en charge native de la prop `className`.

## Usage

### 1. Grille Responsive Virtualisée avec Tri

```tsx
import React, { useState } from 'react';
import { ThemedFlatList } from '@/components/ui/flat-list';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Text } from 'react-native';

interface ProductItem {
  id: string;
  name: string;
  price: number;
}

const products: ProductItem[] = [
  { id: '1', name: 'Chaise Ergonomique', price: 180 },
  { id: '2', name: 'Bureau Assis-Debout', price: 420 },
  { id: '3', name: 'Lampe LED', price: 45 },
  { id: '4', name: 'Support Écran', price: 60 },
];

export function ProductGridScreen() {
  const [refreshing, setRefreshing] = useState(false);

  return (
    <ThemedFlatList<ProductItem>
      data={products}
      keyExtractor={(item) => item.id}
      grid
      columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
      gap={16}
      sortBy="asc"
      sortKey={(item) => item.price}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1200);
      }}
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

### 2. Grille avec Insertion de Carrousels Pleine Largeur

```tsx
import React from 'react';
import ThemedFlatList from '@/components/ui/flat-list';
import { Card, CardTitle } from '@/components/ui/card';
import { Text, View } from 'react-native';

const promotions = [
  { id: 'promo-1', label: 'Soldes Flash -50%' },
  { id: 'promo-2', label: 'Livraison Offerte dès 50€' },
];

export function CatalogWithBanners({ catalogData }: { catalogData: any[] }) {
  return (
    <ThemedFlatList
      data={catalogData}
      keyExtractor={(item) => item.id}
      grid
      columns={{ sm: 1, md: 2, lg: 3 }}
      gap={12}
      carousels={[
        {
          index: 0, // En haut de la grille
          title: 'Offres Spéciales',
          data: promotions,
          renderItem: (promo) => (
            <Card style={{ height: 140, justifyContent: 'center', alignItems: 'center' }}>
              <CardTitle>{promo.label}</CardTitle>
            </Card>
          ),
          itemsPerView: { sm: 1, md: 2 },
          autoPlay: true,
          autoPlayInterval: 4000,
        },
      ]}
      renderItem={({ item }) => (
        <Card>
          <CardTitle>{item.name}</CardTitle>
        </Card>
      )}
    />
  );
}
```

## Props API

| Prop | Type | Description |
|---|---|---|
| `data` | `T[]` | Données source à virtualiser |
| `renderItem` | `ListRenderItem<T>` | Fonction de rendu pour chaque élément |
| `grid` | `boolean` | Active la mise en page en grille adaptative |
| `columns` | `number \| ResponsiveValue<number>` | Nombre de colonnes par breakpoint (`sm`, `md`, `lg`, etc.) |
| `gap` | `number` | Espacement uniforme entre cellules |
| `rowGap` | `number` | Espacement vertical entre rangées |
| `columnGap` | `number` | Espacement horizontal entre colonnes |
| `sortBy` | `'asc' \| 'desc'` | Ordre de tri |
| `sortKey` | `(item: T) => any` | Fonction de projection de clé pour le tri |
| `sortFn` | `(a: T, b: T) => number` | Comparateur personnalisé |
| `carousels` | `CarouselSlot<any>[] \| CarouselSlot<any>` | Carrousels pleine largeur à insérer dans le flux |
| `loading` | `boolean` | Affiche le skeleton de chargement |
| `emptyState` | `React.ReactNode` | Vue affichée lorsque la liste est vide |
| `className` | `string` | Classes Tailwind / NativeWind |

## Bonnes Pratiques & Performance

1. **Stabilité des `keyExtractor`** : Toujours fournir un identifiant unique stable afin de permettre à React Native d'optimiser le recyclage des cellules virtuelles.
2. **Ne pas imbriquer dans une ScrollView verticale** : `ThemedFlatList` possède son propre défilement virtualisé.
3. **Usage avec Breakpoints** : Pour une expérience optimale multi-écrans (téléphone, tablette, desktop web), utilisez la notation d'objet `{ sm: 1, md: 2, lg: 3 }`.
