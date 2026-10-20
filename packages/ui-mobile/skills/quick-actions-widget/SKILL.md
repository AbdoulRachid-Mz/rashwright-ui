---
name: quick-actions-widget
description: Grille d'actions rapides configurable avec icônes, libellés, badges et support Liquid Glass.
version: 1.0.0
category: Interactions
requiresComponents:
  - card
  - badge
  - skeleton
expoDependencies:
  - "@expo/vector-icons"
  - "expo-haptics"
supportsGlass: true
---

# QuickActionsWidget — Rashwright UI Mobile

Le composant `QuickActionsWidget` permet d'agencer un groupe d'actions récurrentes sous forme de grille harmonieuse (2, 3 ou 4 colonnes), avec retour haptique et badges d'alerte.

## 1. Installation

```bash
rs-ui add -w quick-actions
# ou
rs-ui widget add quick-actions
```

Composants requis automatiquement résolus et copiés :
- `@/components/ui/card`
- `@/components/ui/badge`
- `@/components/ui/skeleton`

## 2. Imports

```tsx
import { QuickActionsWidget } from "@/components/widgets/quick-actions";
import type { QuickActionsWidgetProps, QuickActionItem } from "@/components/widgets/quick-actions";
```

## 3. Spécification des Props (TypeScript)

### `QuickActionItem`
| Champ | Type | Obligatoire | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Oui** | Identifiant unique de l'action |
| `label` | `string` | **Oui** | Libellé sous l'icône |
| `icon` | `string` | **Oui** | Nom de glyphe Ionicons (ex: `"send"`, `"qr-code"`) |
| `customIcon` | `ReactNode` | Non | Composant ReactNode pour icône personnalisée |
| `color` | `string` | Non | Couleur d'accentuation de l'icône |
| `badge` | `string \| number` | Non | Badge de notification flottant |
| `disabled` | `boolean` | Non | Désactive l'action |
| `onPress` | `() => void` | **Oui** | Callback exécuté au tap |

### `QuickActionsWidgetProps`
| Prop | Type | Obligatoire | Valeur par défaut | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | Non | `undefined` | Titre au-dessus de la grille |
| `actions` | `QuickActionItem[]` | **Oui** | - | Liste des actions |
| `columns` | `2 \| 3 \| 4` | Non | `4` | Nombre de colonnes par rangée |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Non | `'glass'` | Variante visuelle du conteneur |
| `loading` | `boolean` | Non | `false` | Affiche des squelettes d'actions |
| `style` | `StyleProp<ViewStyle>` | Non | `undefined` | Style racine |

## 4. Exemples d'utilisation

```tsx
import React from "react";
import { QuickActionsWidget } from "@/components/widgets/quick-actions";

export function WalletQuickActionsExample() {
  const actions = [
    {
      id: "send",
      label: "Envoyer",
      icon: "paper-plane",
      onPress: () => console.log("Action: Envoyer"),
    },
    {
      id: "receive",
      label: "Recevoir",
      icon: "download",
      onPress: () => console.log("Action: Recevoir"),
    },
    {
      id: "scan",
      label: "Scanner",
      icon: "qr-code",
      badge: "PROMO",
      onPress: () => console.log("Action: Scanner"),
    },
    {
      id: "cards",
      label: "Cartes",
      icon: "card",
      onPress: () => console.log("Action: Cartes"),
    },
  ];

  return <QuickActionsWidget title="Raccourcis" actions={actions} columns={4} variant="glass" />;
}
```
