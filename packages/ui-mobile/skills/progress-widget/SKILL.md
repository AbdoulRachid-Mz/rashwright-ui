---
name: progress-widget
description: Indicateur de progression vers un objectif avec pourcentage calculé, barre animée, état complété et Liquid Glass.
version: 1.0.0
category: Analytics
requiresComponents:
  - card
  - progress
  - badge
  - skeleton
expoDependencies:
  - "@expo/vector-icons"
supportsGlass: true
---

# ProgressWidget — Rashwright UI Mobile

Le composant `ProgressWidget` permet d'afficher l'avancement d'un utilisateur, d'un projet ou d'un budget vers une cible déterminée, avec calcul dynamique du pourcentage et jauge animée.

## 1. Installation

```bash
rs-ui add -w progress
# ou
rs-ui widget add progress
```

Composants requis automatiquement résolus et copiés :
- `@/components/ui/card`
- `@/components/ui/progress`
- `@/components/ui/badge`
- `@/components/ui/skeleton`

## 2. Imports

```tsx
import { ProgressWidget } from "@/components/widgets/progress";
import type { ProgressWidgetProps } from "@/components/widgets/progress";
```

## 3. Spécification des Props (TypeScript)

| Prop | Type | Obligatoire | Valeur par défaut | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | **Oui** | - | Titre de l'objectif (ex: "Épargne vacance") |
| `current` | `number` | **Oui** | - | Valeur atteinte |
| `target` | `number` | Non | `100` | Valeur cible à atteindre |
| `unit` | `string` | Non | `""` | Devise ou unité de mesure (ex: "€", "%") |
| `description` | `string` | Non | `undefined` | Message contextuel d'accompagnement |
| `completedLabel` | `string` | Non | `"Objectif atteint !"` | Message de félicitations à 100% |
| `showPercentage` | `boolean` | Non | `true` | Badge avec le pourcentage calculé |
| `barHeight` | `number` | Non | `8` | Hauteur de la barre de progression |
| `icon` | `ReactNode` | Non | `undefined` | Icône d'en-tête |
| `loading` | `boolean` | Non | `false` | Squelettes de chargement |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Non | `'glass'` | Variante visuelle de la carte |
| `onPress` | `() => void` | Non | `undefined` | Action au tap sur le widget |
| `style` | `StyleProp<ViewStyle>` | Non | `undefined` | Style racine personnalisé |

## 4. Exemples d'utilisation

### Exemple minimal
```tsx
import React from "react";
import { ProgressWidget } from "@/components/widgets/progress";

export function SimpleProgressExample() {
  return (
    <ProgressWidget
      title="Objectif d'épargne"
      current={750}
      target={1000}
      unit="€"
      description="Reste 250 € avant le départ"
    />
  );
}
```

### Exemple complété avec variante Glass
```tsx
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ProgressWidget } from "@/components/widgets/progress";

export function CompletedProgressExample() {
  return (
    <ProgressWidget
      title="Parcours Onboarding"
      current={5}
      target={5}
      icon={<Ionicons name="trophy" size={18} color="#F59E0B" />}
      completedLabel="Toutes les étapes validées !"
      variant="glass"
      onPress={() => console.log("Ouvrir récapitulatif")}
    />
  );
}
```
