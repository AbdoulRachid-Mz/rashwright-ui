---
name: rs-ui/password-strength
description: Évaluateur local de robustesse de mot de passe avec barre segmentée et critères de validation temps réel.
version: 1.0.0
componentVersion: 1.0.0
category: Forms
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - text
supportsGlass: false
---

# PasswordStrength — Rashwright UI Mobile

Le composant `PasswordStrength` évalue localement et sans aucune requête réseau la complexité et la conformité d'un mot de passe saisi.

## Installation

```bash
rs-ui add password-strength
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from '@/components/ui/text-input';
import { PasswordStrength } from '@/components/ui/password-strength';

export default function RegisterScreen() {
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        label="Créer un mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <PasswordStrength
        password={password}
        minLength={8}
        requireUppercase
        requireLowercase
        requireNumber
        requireSpecialChar
        onScoreChange={(res) => setIsValid(res.isValid)}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `password` | `string` | `''` | Valeur du mot de passe à tester. |
| `minLength` | `number` | `8` | Longueur minimale requise. |
| `requireUppercase` | `boolean` | `true` | Exige au moins une majuscule. |
| `requireLowercase` | `boolean` | `true` | Exige au moins une minuscule. |
| `requireNumber` | `boolean` | `true` | Exige au moins un chiffre. |
| `requireSpecialChar` | `boolean` | `true` | Exige au moins un symbole. |
| `showRequirements` | `boolean` | `true` | Affiche la liste des règles sous la jauge. |
| `showLevelLabel` | `boolean` | `true` | Affiche l'intitulé textuel (Faible, Fort...). |
| `onScoreChange` | `(res: PasswordStrengthResult) => void` | `undefined` | Callback fournissant le score, le niveau et l'état de validation. |

## Sécurité et confidentialité

- Calcul 100% exécuté localement en mémoire éphémère.
- Aucun stockage, aucune télémétrie, aucun log de console.
