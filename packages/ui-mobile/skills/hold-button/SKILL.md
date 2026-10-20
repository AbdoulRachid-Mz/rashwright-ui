---
name: rs-ui/hold-button
description: Bouton interactif avec maintien prolongé (hold to confirm) pour actions destructives ou critiques.
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

# HoldButton — Rashwright UI Mobile

Le composant `HoldButton` prévient les erreurs accidentelles lors d'actions sensibles (suppression de compte, purge de base de données, virement irréversible) en exigeant un appui continu.

## Installation

```bash
rs-ui add hold-button
```

## Usage de base

```tsx
import React from 'react';
import { View, Alert } from 'react-native';
import { HoldButton } from '@/components/ui/hold-button';

export default function DangerZoneScreen() {
  return (
    <View style={{ gap: 16 }}>
      <HoldButton
        title="Supprimer mon compte"
        holdingTitle="Maintenez pour confirmer..."
        completedTitle="Compte supprimé"
        variant="destructive"
        holdDuration={2000}
        onHoldComplete={() => {
          Alert.alert("Succès", "Votre compte a été supprimé.");
        }}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | *requis* | Texte principal au repos. |
| `holdingTitle` | `string` | `undefined` | Texte affiché pendant le maintien du doigt. |
| `completedTitle` | `string` | `'Validé !'` | Texte une fois la durée complétée. |
| `holdDuration` | `number` | `1500` | Durée minimale de maintien en millisecondes. |
| `variant` | `'destructive' \| 'default' \| 'glass'` | `'destructive'` | Style visuel. |
| `icon` | `keyof typeof Ionicons.glyphMap` | `undefined` | Icône optionnelle. |
| `onHoldComplete` | `() => void` | *requis* | Déclenché uniquement lorsque la durée est atteinte. |
| `disabled` | `boolean` | `false` | Désactive le bouton. |
