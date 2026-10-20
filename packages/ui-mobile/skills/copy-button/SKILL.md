---
name: rs-ui/copy-button
description: Bouton interactif de copie dans le presse-papiers avec feedback animé, gestion d'erreurs et support Liquid Glass.
version: 1.0.0
componentVersion: 1.0.0
category: Basic
dependencies:
  - none
expoDependencies:
  - none
optionalExpoDependencies:
  - expo-clipboard
  - expo-haptics
requiresComponents:
  - none
supportsGlass: true
---

# CopyButton — Rashwright UI Mobile

Le composant `CopyButton` permet de copier du texte (statique ou résolu de façon asynchrone) dans le presse-papiers de manière fluide, avec retour tactile et visuel instantané.

## Installation

```bash
rs-ui add copy-button
```

## Usage de base

```tsx
import React from 'react';
import { View } from 'react-native';
import { CopyButton } from '@/components/ui/copy-button';

export default function MyScreen() {
  return (
    <View style={{ gap: 12 }}>
      {/* Copie simple */}
      <CopyButton value="https://rashwright.dev" />

      {/* Variante icône seule */}
      <CopyButton value="TOKEN_12345" variant="icon-only" size="sm" />

      {/* Variante Glass */}
      <CopyButton
        value="0x71C...392b"
        variant="glass"
        label="Copier l'adresse"
        copiedLabel="Adresse copiée !"
        onCopySuccess={(val) => console.log('Copié :', val)}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string \| (() => string \| Promise<string>)` | *requis* | Texte ou promesse de texte à copier. |
| `variant` | `'default' \| 'icon-only' \| 'compact' \| 'full' \| 'glass' \| 'outline'` | `'compact'` | Style visuel du bouton. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dimensions du bouton et de l'icône. |
| `label` | `string` | `'Copier'` | Libellé normal. |
| `copiedLabel` | `string` | `'Copié !'` | Libellé temporaire après copie réussie. |
| `errorLabel` | `string` | `'Échec'` | Libellé en cas d'erreur de presse-papiers. |
| `timeout` | `number` | `2000` | Durée en ms d'affichage de l'état de succès. |
| `disabled` | `boolean` | `false` | Désactive le bouton. |
| `onCopySuccess` | `(value: string) => void` | `undefined` | Callback après succès. |
| `onCopyError` | `(err: Error) => void` | `undefined` | Callback en cas d'erreur. |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style additionnel du conteneur. |

## Accessibilité & Plateformes

- Rôle `accessibilityRole="button"`.
- Annonce vocale dynamique de confirmation lors de la copie.
- Fonctionne sur iOS, Android et Web.
