---
name: rs-ui/drawer
description: Tiroir latéral animé avec gestes. Nécessite react-native-reanimated et react-native-gesture-handler.
version: 0.3.0
componentVersion: 0.3.0
category: Overlay
dependencies:
  - none
expoDependencies:
  - expo-blur
  - react-native-reanimated
requiresComponents:
  - none
supportsGlass: false
---

# Drawer — Rashwright UI Mobile

Panneau de navigation latéral (gauche/droite) ou inférieur, géré par geste swipe, avec overlay animé.

## Installation

```bash
rs-ui add drawer
```

> ⚠️ Nécessite un rebuild natif (`expo prebuild`) — utilise `react-native-reanimated` et `react-native-gesture-handler`

## Usage de base

```tsx
import { Drawer } from '@/components/ui/drawer';
import { useState } from 'react';

const [open, setOpen] = useState(false);

// Drawer gauche
<Drawer open={open} onClose={() => setOpen(false)} side="left">
  <Text>Menu de navigation</Text>
</Drawer>

// Drawer bas (bottom sheet style)
<Drawer open={open} onClose={() => setOpen(false)} side="bottom" snapPoints={['50%', '90%']}>
  <Text>Contenu</Text>
</Drawer>
```

## Props API

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `open` | `boolean` | requis | Contrôle l'ouverture |
| `onClose` | `() => void` | requis | Callback de fermeture |
| `side` | `'left' \| 'right' \| 'bottom'` | `'left'` | Côté d'apparition |
| `snapPoints` | `string[]` | `['80%']` | Points d'ancrage (bottom uniquement) |
| `width` | `number \| string` | `'75%'` | Largeur (left/right uniquement) |
| `children` | `ReactNode` | requis | Contenu |
| `closeOnBackdrop` | `boolean` | `true` | Ferme au clic du backdrop |

## Dépendances natives requises

```bash
bunx expo install react-native-reanimated react-native-gesture-handler
bunx expo prebuild
```
