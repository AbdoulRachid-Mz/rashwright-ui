---
name: rs-ui/tag-input
description: Champ de saisie interactif de tags/mots-clés avec gestion clavier mobile et validation personnalisée.
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

# TagInput — Rashwright UI Mobile

Le composant `TagInput` permet la saisie, l'affichage et la suppression ergonomique d'une liste de tags (compétences, filtres, destinataires, catégories).

## Installation

```bash
rs-ui add tag-input
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { TagInput } from '@/components/ui/tag-input';

export default function MyScreen() {
  const [skills, setSkills] = useState(['React Native', 'TypeScript']);

  return (
    <View style={{ gap: 16 }}>
      <TagInput
        label="Compétences"
        tags={skills}
        onTagsChange={setSkills}
        placeholder="Tapez et validez..."
        maxTags={5}
        hint="Jusqu'à 5 tags maximum"
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `tags` | `string[]` | `undefined` | Liste des tags contrôlée. |
| `defaultTags` | `string[]` | `[]` | Liste initiale en mode non contrôlé. |
| `onTagsChange` | `(tags: string[]) => void` | `undefined` | Callback lors de l'ajout ou de la suppression. |
| `placeholder` | `string` | `'Ajouter un tag...'` | Placeholder de la zone de saisie. |
| `maxTags` | `number` | `undefined` | Limite maximale de tags. |
| `maxTagLength` | `number` | `undefined` | Nombre max de caractères par tag. |
| `allowDuplicates` | `boolean` | `false` | Autorise ou non les doublons. |
| `separators` | `string[]` | `[',', 'Enter']` | Déclencheurs de création d'un tag. |
| `backspaceDeletesLastTag` | `boolean` | `true` | Supprime le dernier tag si l'input est vide. |
| `validateTag` | `(tag: string) => boolean \| string` | `undefined` | Règle de validation custom. |
| `disabled` | `boolean` | `false` | Désactive la saisie. |
