---
name: rs-ui/modal
description: Modal générique avec animations d'entrée/sortie.
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

# Modal — Rashwright UI Mobile

Modal accessible avec animation d'entrée/sortie, backdrop cliquable et contenu scrollable.

## Installation

```bash
rs-ui add modal
```

## Usage de base

```tsx
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';

const [visible, setVisible] = useState(false);

// Modal simple
<Modal visible={visible} onClose={() => setVisible(false)}>
  <Text>Contenu du modal</Text>
</Modal>

// Modal avec titre
<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Confirmation"
>
  <Text>Voulez-vous continuer ?</Text>
  <Button title="Oui" onPress={() => setVisible(false)} />
</Modal>

// Modal bottom sheet style
<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  position="bottom"
>
  <Text>Contenu en bas</Text>
</Modal>
```

## Props API

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `visible` | `boolean` | requis | Contrôle la visibilité |
| `onClose` | `() => void` | requis | Callback de fermeture |
| `title` | `string` | - | Titre du modal |
| `position` | `'center' \| 'bottom'` | `'center'` | Position du modal |
| `closeOnBackdrop` | `boolean` | `true` | Ferme au clic du backdrop |
| `showCloseButton` | `boolean` | `true` | Affiche un bouton X |
| `children` | `ReactNode` | requis | Contenu |
| `style` | `ViewStyle` | - | Style du conteneur |

## Accessibilité

- `accessibilityViewIsModal={true}` pour VoiceOver
- Focus piégé dans le modal quand ouvert
- Fermeture avec le bouton retour Android
