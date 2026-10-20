---
name: rs-ui/reorderable-list
description: Liste réordonnable fluide avec contrôles accessibles et animations de transition de disposition.
version: 1.0.0
componentVersion: 1.0.0
category: Data
dependencies:
  - none
expoDependencies:
  - expo-haptics
requiresComponents:
  - none
supportsGlass: false
---

# ReorderableList — Rashwright UI Mobile

Le composant `ReorderableList` permet de réorganiser les éléments d'une liste de manière fluide et entièrement accessible grâce aux boutons fléchés dédiés et au retour haptique.

## Installation

```bash
rs-ui add reorderable-list
```

## Usage de base

```tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { ReorderableList } from '@/components/ui/reorderable-list';

interface Task {
  id: string;
  title: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Faire les courses' },
    { id: '2', title: 'Rédiger le rapport' },
    { id: '3', title: 'Appeler le client' },
  ]);

  return (
    <View style={{ padding: 16 }}>
      <ReorderableList
        items={tasks}
        onReorder={setTasks}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
        )}
      />
    </View>
  );
}
```

## Props API

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `T[]` | `undefined` | Tableau des éléments contrôlés. |
| `defaultItems` | `T[]` | `[]` | Tableau initial en mode non contrôlé. |
| `keyExtractor` | `(item: T, index: number) => string` | *requis* | Clé unique par élément. |
| `renderItem` | `(item: T, helpers: ReorderItemHelpers) => React.ReactNode` | *requis* | Fonction de rendu pour chaque élément. |
| `showControls` | `boolean` | `true` | Affiche les flèches monter/descendre accessibles. |
| `onReorder` | `(newItems: T[]) => void` | `undefined` | Callback transmettant la nouvelle liste ordonnée. |

## Accessibilité

- Boutons fléchés avec `accessibilityRole="button"` et libellés explicites "Monter cet élément", "Descendre cet élément".
- Conforme aux exigences WCAG 2.1 AA pour la réorganisation sans dépendre exclusivement de gestes complexes.
