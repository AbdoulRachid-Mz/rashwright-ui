---
name: rs-ui/card
description: Conteneur de carte générique avec support Glass, ombres et coins arrondis.
version: 0.3.0
componentVersion: 0.3.0
category: Layout
dependencies:
  - none
expoDependencies:
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Card — Rashwright UI Mobile

Carte de contenu flexible avec ombres, coins arrondis et support du mode Glass.

## Installation

```bash
rs-ui add card
```

## Usage de base

```tsx
import { Card } from '@/components/ui/card';

// Carte simple
<Card>
  <Text>Contenu de la carte</Text>
</Card>

// Carte avec padding personnalisé
<Card padding="lg" style={{ marginBottom: 12 }}>
  <Text>Contenu spacieux</Text>
</Card>

// Carte cliquable
<Card onPress={() => navigation.navigate('Details')}>
  <Text>Appuyez pour voir les détails</Text>
</Card>
```

## Props API

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | requis | Contenu de la carte |
| `onPress` | `() => void` | - | Rend la carte cliquable |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding interne |
| `variant` | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Style de la carte |
| `style` | `ViewStyle` | - | Style supplémentaire |
| `glass` | `boolean` | false | Active l'effet Glass (nécessite expo-blur) |

## Variants

```tsx
<Card variant="elevated">  {/* Ombre, fond card */}
<Card variant="outlined">  {/* Bordure, sans ombre */}
<Card variant="filled">    {/* Fond plein, sans ombre ni bordure */}
```

## Accessibilité

- Quand `onPress` est défini : `accessibilityRole="button"` automatique
- Supporte `accessibilityLabel` et `accessibilityHint`
