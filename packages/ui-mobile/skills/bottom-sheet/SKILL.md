---
name: rs-ui/bottom-sheet
description: Feuille de fond animée avec gestes drag-to-dismiss. Nécessite react-native-reanimated et react-native-gesture-handler.
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

# BottomSheet — Rashwright UI Mobile

Panneau inférieur draggable avec points d'ancrage configurables, backdrop et gestion clavier.

## Installation

```bash
rs-ui add bottom-sheet
```

> ⚠️ Nécessite un rebuild natif — utilise `react-native-reanimated` et `react-native-gesture-handler`

## Usage de base

```tsx
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useRef } from 'react';

const sheetRef = useRef(null);

// Bottom sheet avec snap points
<BottomSheet
  ref={sheetRef}
  snapPoints={['25%', '50%', '90%']}
  initialSnapIndex={0}
>
  <View style={{ padding: 16 }}>
    <Text>Contenu du sheet</Text>
  </View>
</BottomSheet>

// Ouvrir/fermer programmatiquement
<Button title="Ouvrir" onPress={() => sheetRef.current?.expand()} />
<Button title="Fermer" onPress={() => sheetRef.current?.close()} />
```

## Props API

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `snapPoints` | `(string \| number)[]` | `['50%']` | Points d'ancrage |
| `initialSnapIndex` | `number` | `0` | Index snap initial |
| `onClose` | `() => void` | - | Callback de fermeture |
| `enableDragDownToClose` | `boolean` | `true` | Drag vers le bas pour fermer |
| `showHandle` | `boolean` | `true` | Affiche la poignée de drag |
| `children` | `ReactNode` | requis | Contenu |

## Méthodes ref

```tsx
sheetRef.current?.expand()     // Ouvre au dernier snap point
sheetRef.current?.collapse()   // Retourne au premier snap point
sheetRef.current?.close()      // Ferme complètement
sheetRef.current?.snapToIndex(1) // Va au snap point d'index 1
```
