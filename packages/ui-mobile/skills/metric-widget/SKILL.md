---
name: metric-widget
description: Widget statistique clé avec valeur, tendance périodique, icône, état loading et support Liquid Glass.
version: 1.0.0
category: Analytics
requiresComponents:
  - card
  - badge
  - skeleton
expoDependencies:
  - "@expo/vector-icons"
supportsGlass: true
---

# MetricWidget — Rashwright UI Mobile

Le composant `MetricWidget` est un bloc d'interface autonome conçu pour mettre en valeur un indicateur clé de performance (KPI), une statistique financière, opérationnelle ou analytique.

## 1. Installation

```bash
rs-ui add -w metric
# ou
rs-ui widget add metric
```

Composants requis automatiquement résolus et copiés :
- `@/components/ui/card`
- `@/components/ui/badge`
- `@/components/ui/skeleton`

## 2. Imports

```tsx
import { MetricWidget } from "@/components/widgets/metric";
import type { MetricWidgetProps, MetricTrend } from "@/components/widgets/metric";
```

## 3. Spécification des Props (TypeScript)

| Prop | Type | Obligatoire | Valeur par défaut | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | **Oui** | - | Titre ou libellé de l'indicateur |
| `value` | `string \| number` | **Oui** | - | Valeur affichée (brute ou formatée) |
| `description` | `string` | Non | `undefined` | Contexte ou sous-titre de la métrique |
| `change` | `string` | Non | `undefined` | Variation ou delta (ex: "+12.4%") |
| `trend` | `'up' \| 'down' \| 'neutral'` | Non | `'neutral'` | Direction pour l'icône et la couleur |
| `trendLabel` | `string` | Non | `undefined` | Libellé d'accessibilité pour la tendance |
| `icon` | `ReactNode` | Non | `undefined` | Icône personnalisée dans le header |
| `loading` | `boolean` | Non | `false` | Affiche les squelettes de chargement |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Non | `'glass'` | Variante visuelle du conteneur |
| `onPress` | `() => void` | Non | `undefined` | Callback de clic sur la carte |
| `style` | `StyleProp<ViewStyle>` | Non | `undefined` | Style appliqué au conteneur racine |
| `testID` | `string` | Non | `undefined` | Identifiant pour tests |

## 4. Exemples d'utilisation

### Exemple minimal
```tsx
import React from "react";
import { MetricWidget } from "@/components/widgets/metric";

export function SimpleMetricExample() {
  return (
    <MetricWidget
      title="Chiffre d'affaires"
      value="24 500 €"
      change="+14.2%"
      trend="up"
    />
  );
}
```

### Exemple complet avec interaction et état de chargement
```tsx
import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MetricWidget } from "@/components/widgets/metric";

export function FullMetricExample() {
  const [loading, setLoading] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <MetricWidget
        title="Utilisateurs actifs"
        value={18420}
        change="+8.5%"
        trend="up"
        description="vs mois dernier"
        icon={<Ionicons name="people" size={20} color="#3B82F6" />}
        variant="glass"
        onPress={() => console.log("Afficher le détail des utilisateurs")}
      />

      <MetricWidget
        title="Taux d'abandon"
        value="2.1%"
        change="-0.4%"
        trend="down"
        description="Amélioration continue"
        variant="bordered"
      />
    </View>
  );
}
```

## 5. Bonnes pratiques & Accessibilité

- Le widget génère automatiquement un `accessibilityLabel` complet combinant le titre, la valeur et la tendance.
- Si `onPress` est fourni, l'élément racine adopte le rôle `button`, sinon le rôle `summary`.
- En mode chargement (`loading={true}`), le rôle devient `progressbar` pour notifier les lecteurs d'écran.
