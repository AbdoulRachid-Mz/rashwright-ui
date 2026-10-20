---
name: rs-ui/floating-label-input
description: Champ de saisie moderne avec label flottant animé, gestion des états focus/erreur, icônes et support Liquid Glass.
version: 1.0.0
componentVersion: 1.0.0
category: Forms
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - text
supportsGlass: true
---

# FloatingLabelInput — Rashwright UI Mobile

Le composant `FloatingLabelInput` fournit un champ de saisie ergonomique où l'étiquette s'élève au-dessus du texte lors du focus ou lorsque du contenu est présent.

## Installation

```bash
rs-ui add floating-label-input
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';

export default function MyForm() {
  const [email, setEmail] = useState('');

  return (
    <View style={{ gap: 16 }}>
      <FloatingLabelInput
        label="Adresse email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FloatingLabelInput
        label="Mot de passe"
        secureTextEntry
        variant="glass"
        hint="Au moins 8 caractères"
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | *requis* | Texte de l'étiquette flottante. |
| `error` | `boolean \| string` | `false` | Booléen ou message textuel d'erreur. |
| `hint` | `string` | `undefined` | Message d'aide affiché sous le champ. |
| `variant` | `'default' \| 'outline' \| 'glass'` | `'default'` | Style visuel du conteneur. |
| `leftIcon` | `React.ReactNode` | `undefined` | Élément inséré à gauche. |
| `rightIcon` | `React.ReactNode` | `undefined` | Élément inséré à droite. |
| `value` | `string` | `undefined` | Valeur contrôlée. |
| `onChangeText` | `(text: string) => void` | `undefined` | Callback lors de la saisie. |
| `containerStyle` | `StyleProp<ViewStyle>` | `undefined` | Style du conteneur externe. |
| `inputStyle` | `StyleProp<TextStyle>` | `undefined` | Style de l'input texte natif. |
