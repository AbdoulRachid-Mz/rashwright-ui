---
name: rs-ui/number-input
description: Champ de saisie numérique avec boutons d'incrémentation/décrémentation tactiles, bornes et formatage.
version: 1.0.0
componentVersion: 1.0.0
category: Forms
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - text
supportsGlass: true
---

# NumberInput — Rashwright UI Mobile

Le composant `NumberInput` offre un contrôle précis pour la quantité (panier e-commerce, formulaires, réglages) avec boutons tactiles `+` et `-`.

## Installation

```bash
rs-ui add number-input
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { NumberInput } from '@/components/ui/number-input';

export default function CartItem() {
  const [quantity, setQuantity] = useState(1);

  return (
    <View style={{ gap: 16 }}>
      <NumberInput
        label="Quantité"
        value={quantity}
        onChange={setQuantity}
        min={1}
        max={10}
        step={1}
      />

      <NumberInput
        label="Montant du pourboire"
        defaultValue={5}
        min={0}
        max={50}
        step={2.5}
        precision={1}
        formatValue={(val) => `${val} €`}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | `undefined` | Valeur contrôlée. |
| `defaultValue` | `number` | `0` | Valeur initiale non contrôlée. |
| `min` | `number` | `-Infinity` | Borne minimale. |
| `max` | `number` | `Infinity` | Borne maximale. |
| `step` | `number` | `1` | Pas d'incrémentation. |
| `precision` | `number` | `0` | Nombre de décimales conservées. |
| `onChange` | `(val: number) => void` | `undefined` | Callback lors du changement de valeur. |
| `formatValue` | `(val: number) => string` | `undefined` | Fonction de mise en forme (ex: devises). |
| `disabled` | `boolean` | `false` | Désactive les contrôles. |
