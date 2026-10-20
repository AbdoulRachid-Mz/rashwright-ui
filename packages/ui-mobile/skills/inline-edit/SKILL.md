---
name: rs-ui/inline-edit
description: Édition de texte en place (inline editing) avec bascule instantanée, boutons valider/annuler et haptique.
version: 1.0.0
componentVersion: 1.0.0
category: Forms
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - text
supportsGlass: false
---

# InlineEdit — Rashwright UI Mobile

Le composant `InlineEdit` permet d'afficher une valeur textuelle et de la modifier immédiatement sur place sans ouvrir de modale ou changer d'écran.

## Installation

```bash
rs-ui add inline-edit
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { InlineEdit } from '@/components/ui/inline-edit';

export default function ProfileScreen() {
  const [username, setUsername] = useState('Alex Dupont');

  return (
    <View style={{ gap: 16 }}>
      <InlineEdit
        value={username}
        onSave={setUsername}
        validate={(text) => (text.length >= 3 ? true : 'Au moins 3 caractères requis')}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string` | `undefined` | Valeur contrôlée. |
| `defaultValue` | `string` | `''` | Valeur initiale non contrôlée. |
| `onSave` | `(val: string) => void` | `undefined` | Callback lors de la validation. |
| `onCancel` | `() => void` | `undefined` | Callback lors de l'annulation. |
| `placeholder` | `string` | `'Appuyez pour modifier...'` | Placeholder si texte vide. |
| `validate` | `(text: string) => boolean \| string` | `undefined` | Règle de validation. |
| `disabled` | `boolean` | `false` | Désactive la modification. |
