---
name: rs-ui/view
description: View responsive enrichie avec grille multi-colonnes adaptative, tri d'éléments et insertion native de carrousels.
version: 1.0.0
componentVersion: 1.0.0
category: Layout
dependencies:
  - none
expoDependencies:
  - react-native-reanimated
requiresComponents:
  - carousel
supportsGlass: true
---

# View — Rashwright UI Mobile

Composant de conteneur et mise en page fondamental étendu avec un puissant moteur de grille responsive, tri d'éléments et intégration transparente de carrousels horizontaux.

## Installation

```bash
rs-ui add view
```

## Caractéristiques

- **Grille responsive fluide** : Spécification des colonnes par breakpoints standard (`sm`, `md`, `lg`, `xl`, `2xl`) via `{ sm: 1, md: 2, lg: 3 }`.
- **Props de tri intégrées** : `sortBy`, `sortOrder` ("asc" | "desc"), et `sortKey` pour ordonner dynamiquement les enfants ou `gridElements`.
- **Intégration de carrousels (`carousels`)** : Insertion native de carrousels pleine largeur à n'importe quel index de la grille sans casser le flux flexbox.
- **Thématisation & Liquid Glass** : Support des fonds de surface thémés (`background="card"`, `"muted"`, etc.).
- **Compatibilité Tailwind / NativeWind** : Prise en charge native de la prop `className`.

## Usage

### 1. Grille Responsive Standard

```tsx
import React from 'react';
import { ThemedView } from '@/components/ui/view';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function ResponsiveGridExample() {
  return (
    <ThemedView
      grid
      columns={{ sm: 1, md: 2, lg: 3 }}
      gap={16}
      style={{ padding: 16 }}
    >
      <Card><CardHeader><CardTitle>Item 1</CardTitle></CardHeader></Card>
      <Card><CardHeader><CardTitle>Item 2</CardTitle></CardHeader></Card>
      <Card><CardHeader><CardTitle>Item 3</CardTitle></CardHeader></Card>
    </ThemedView>
  );
}
```

### 2. Grille avec Tri et Carrousel Intégré

```tsx
import React from 'react';
import ThemedView from '@/components/ui/view';
import { Card, CardTitle } from '@/components/ui/card';

const products = [
  { id: '1', title: 'Produit B', price: 20 },
  { id: '2', title: 'Produit A', price: 10 },
];

const featuredBanners = [
  { id: 'b1', title: 'Offre Spéciale ÉTÉ' },
  { id: 'b2', title: 'Nouveautés 2026' },
];

export function GridWithCarouselExample() {
  return (
    <ThemedView
      grid
      columns={{ sm: 1, md: 2, lg: 3 }}
      sortBy="asc"
      sortKey={(item) => (React.isValidElement(item) ? item.key : '')}
      carousels={{
        index: 0, // Au tout début de la grille
        title: 'À la une',
        data: featuredBanners,
        renderItem: (banner) => (
          <Card style={{ height: 120, justifyContent: 'center' }}>
            <CardTitle>{banner.title}</CardTitle>
          </Card>
        ),
        itemsPerView: { sm: 1, md: 2 },
      }}
    >
      {products.map((p) => (
        <Card key={p.id}>
          <CardTitle>{p.title}</CardTitle>
        </Card>
      ))}
    </ThemedView>
  );
}
```

## Props API

| Prop | Type | Description |
|---|---|---|
| `grid` | `boolean` | Active la mise en page en grille flex multi-colonnes |
| `gridElements` | `React.ReactNode[]` | Liste d'éléments additionnels à injecter dans la grille |
| `columns` | `ResponsiveValue<number>` | Nombre de colonnes (ex: `2` ou `{ sm: 1, md: 2, lg: 3 }`) |
| `gap` | `ResponsiveValue<number>` | Espacement horizontal et vertical entre cellules |
| `rowGap` | `ResponsiveValue<number>` | Espacement vertical entre rangées |
| `columnGap` | `ResponsiveValue<number>` | Espacement horizontal entre colonnes |
| `sortBy` | `((a, b) => number) \| "asc" \| "desc"` | Fonction ou direction de tri |
| `sortOrder` | `"asc" \| "desc"` | Ordre du tri (défaut: "asc") |
| `sortKey` | `(child, idx) => string \| number` | Extraction de la clé de tri |
| `carousels` | `CarouselSlot[] \| CarouselSlot` | Carrousels insérés à des index spécifiques |
| `background` | `"background" \| "card" \| "secondary" \| ...` | Arrière-plan sémantique thémé |
| `className` | `string` | Classes Tailwind / NativeWind |
