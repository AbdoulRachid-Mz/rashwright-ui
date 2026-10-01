---
name: rs-ui/text-input
description: Champ de saisie thémé avec label flottant, validation et icônes
---

# TextInput — Rashwright UI Mobile

Champ de saisie avancé avec label animé, messages d'erreur, icônes et support multi-lignes.

## Installation

```bash
rs-ui add text-input
```

## Usage de base

```tsx
import { TextInput } from '@/components/ui/text-input';
import { useState } from 'react';

const [value, setValue] = useState('');

// Champ simple
<TextInput
  label="Email"
  value={value}
  onChangeText={setValue}
  placeholder="votre@email.com"
/>

// Avec validation
<TextInput
  label="Email"
  value={value}
  onChangeText={setValue}
  error="Email invalide"
  keyboardType="email-address"
/>

// Mot de passe avec toggle visibilité
<TextInput
  label="Mot de passe"
  value={value}
  onChangeText={setValue}
  secureTextEntry
  showPasswordToggle
/>

// Multi-lignes
<TextInput
  label="Description"
  value={value}
  onChangeText={setValue}
  multiline
  numberOfLines={4}
/>
```

## Props API

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | - | Label flottant animé |
| `value` | `string` | requis | Valeur contrôlée |
| `onChangeText` | `(text: string) => void` | requis | Callback de changement |
| `placeholder` | `string` | - | Placeholder (visible quand vide) |
| `error` | `string` | - | Message d'erreur (rouge) |
| `hint` | `string` | - | Texte d'aide sous le champ |
| `leftIcon` | `IconProps` | - | Icône à gauche |
| `rightIcon` | `IconProps` | - | Icône à droite |
| `secureTextEntry` | `boolean` | `false` | Masque le texte |
| `showPasswordToggle` | `boolean` | `false` | Bouton œil pour afficher/masquer |
| `multiline` | `boolean` | `false` | Champ multi-lignes |
| `numberOfLines` | `number` | `1` | Nombre de lignes (multiline) |
| `disabled` | `boolean` | `false` | Désactive la saisie |
| `variant` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Style du champ |

## Accessibilité

- `accessibilityLabel` = valeur de `label` automatiquement
- `accessibilityHint` = valeur de `hint` si fourni
- Erreurs annoncées via `accessibilityLiveRegion`
