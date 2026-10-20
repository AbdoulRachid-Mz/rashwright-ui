---
name: chart-widget
description: Graphiques de données en barres animées et sparklines avec infobulle interactive et Liquid Glass.
version: 1.0.0
category: Analytics
requiresComponents:
  - card
  - badge
  - skeleton
expoDependencies:
  - "expo-haptics"
supportsGlass: true
---

# ChartWidget — Rashwright UI Mobile

Le composant `ChartWidget` fournit une visualisation claire et réactive des données chiffrées sous forme d'histogrammes verticaux ou horizontaux, sans imposer de dépendances externes lourdes.

## 1. Installation

```bash
rs-ui add -w chart
# ou
rs-ui widget add chart
```

Composants requis automatiquement résolus et copiés :
- `@/components/ui/card`
- `@/components/ui/badge`
- `@/components/ui/skeleton`

## 2. Imports

```tsx
import { ChartWidget } from "@/components/widgets/chart";
import type { ChartWidgetProps, ChartDataPoint, ChartType } from "@/components/widgets/chart";
```

## 3. Spécification des Props (TypeScript)

### `ChartDataPoint`
| Champ | Type | Obligatoire | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | **Oui** | Étiquette sous la barre (ex: "Lun", "Jan") |
| `value` | `number` | **Oui** | Valeur numérique |
| `secondaryValue` | `number` | Non | Valeur comparée (deuxième barre côte-à-côte) |
| `color` | `string` | Non | Couleur spécifique pour cette barre |

### `ChartWidgetProps`
| Prop | Type | Obligatoire | Valeur par défaut | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | **Oui** | - | Titre principal du graphique |
| `subtitle` | `string` | Non | `undefined` | Période ou description |
| `data` | `ChartDataPoint[]` | **Oui** | - | Jeu de données |
| `type` | `'bar' \| 'horizontal-bar'` | Non | `'bar'` | Type d'affichage |
| `height` | `number` | Non | `160` | Hauteur de la zone graphique |
| `unit` | `string` | Non | `""` | Unité (ex: "€", "h", "k") |
| `color` | `string` | Non | `theme.colors.primary` | Couleur des barres |
| `emptyText` | `string` | Non | `"Aucune donnée disponible"` | Message si data est vide |
| `loading` | `boolean` | Non | `false` | Squelettes animés |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Non | `'glass'` | Variante de la carte |
| `onSelectPoint` | `(pt, index) => void` | Non | `undefined` | Callback lors de la sélection |

## 4. Exemples d'utilisation

```tsx
import React from "react";
import { ChartWidget } from "@/components/widgets/chart";

export function WeeklySalesChartExample() {
  const weeklyData = [
    { label: "Lun", value: 340 },
    { label: "Mar", value: 520 },
    { label: "Mer", value: 410 },
    { label: "Jeu", value: 680 },
    { label: "Ven", value: 950 },
    { label: "Sam", value: 820 },
    { label: "Dim", value: 290 },
  ];

  return (
    <ChartWidget
      title="Ventes de la semaine"
      subtitle="Total : 4 010 €"
      data={weeklyData}
      unit="€"
      type="bar"
      variant="glass"
      onSelectPoint={(point) => console.log("Jour sélectionné :", point)}
    />
  );
}
```
