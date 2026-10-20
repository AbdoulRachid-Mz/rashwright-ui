---
name: rs-ui/swipe-action-button
description: Bouton de confirmation par glissement tactile (Slide to action / Slide to confirm) sécurisé avec retour haptique.
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

# SwipeActionButton — Rashwright UI Mobile

Le composant `SwipeActionButton` offre une validation tactile par glissement (slide to confirm) particulièrement adaptée aux opérations de paiement, déverrouillage ou validation de commande.

## Installation

```bash
rs-ui add swipe-action-button
```

## Usage de base

```tsx
import React from 'react';
import { View, Alert } from 'react-native';
import { SwipeActionButton } from '@/components/ui/swipe-action-button';

export default function CheckoutScreen() {
  return (
    <View style={{ gap: 16 }}>
      <SwipeActionButton
        title="Glisser pour payer 49,99 €"
        completedTitle="Paiement validé !"
        onActionComplete={() => {
          Alert.alert("Commande confirmée", "Votre paiement a été traité.");
        }}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | *requis* | Texte d'invitation affiché au repos. |
| `completedTitle` | `string` | `'Confirmé !'` | Texte après validation de la course. |
| `onActionComplete` | `() => void` | *requis* | Callback déclenché au franchissement du seuil. |
| `thumbIcon` | `keyof typeof Ionicons.glyphMap` | `'chevron-forward'` | Icône du curseur mobile. |
| `height` | `number` | `56` | Hauteur totale du rail. |
| `thresholdRatio` | `number` | `0.85` | Ratio d'achèvement minimal requis (0.5 à 1.0). |
| `variant` | `'default' \| 'glass'` | `'default'` | Style visuel du rail. |
| `disabled` | `boolean` | `false` | Désactive le glissement. |
