---
name: activity-feed-widget
description: Flux chronologique d'activités récentes avec avatars, icônes, statuts, montants et Liquid Glass.
version: 1.0.0
category: Feed
requiresComponents:
  - card
  - avatar
  - badge
  - divider
  - skeleton
expoDependencies:
  - "@expo/vector-icons"
supportsGlass: true
---

# ActivityFeedWidget — Rashwright UI Mobile

Le composant `ActivityFeedWidget` offre une présentation claire et structurée des dernières interactions, opérations financières ou événements au sein d'une application.

## 1. Installation

```bash
rs-ui add -w activity-feed
# ou
rs-ui widget add activity-feed
```

Composants requis automatiquement résolus et copiés :
- `@/components/ui/card`
- `@/components/ui/avatar`
- `@/components/ui/badge`
- `@/components/ui/divider`
- `@/components/ui/skeleton`

## 2. Imports

```tsx
import { ActivityFeedWidget } from "@/components/widgets/activity-feed";
import type {
  ActivityFeedWidgetProps,
  ActivityFeedItem,
  ActivityStatus,
  ActivityAmountType,
} from "@/components/widgets/activity-feed";
```

## 3. Spécification des Props (TypeScript)

### `ActivityFeedItem`
| Champ | Type | Obligatoire | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Oui** | Identifiant de l'activité |
| `title` | `string` | **Oui** | Titre de l'événement |
| `timestamp` | `string` | **Oui** | Libellé temporel (ex: "Il y a 10 min") |
| `description` | `string` | Non | Détail complémentaire |
| `icon` | `string` | Non | Nom d'icône Ionicons |
| `avatarUrl` | `string` | Non | URL d'image pour l'avatar |
| `avatarInitials` | `string` | Non | Initiales alternatives |
| `amount` | `string` | Non | Montant (ex: "+ 250,00 €") |
| `amountType` | `'positive' \| 'negative' \| 'neutral'` | Non | Couleur du montant |
| `status` | `'completed' \| 'pending' \| 'failed'` | Non | Badge de statut |
| `onPress` | `() => void` | Non | Action au tap sur la ligne |

## 4. Exemples d'utilisation

```tsx
import React from "react";
import { ActivityFeedWidget } from "@/components/widgets/activity-feed";

export function RecentTransactionsExample() {
  const transactions = [
    {
      id: "tx-1",
      title: "Paiement Spotify",
      description: "Abonnement mensuel",
      timestamp: "Aujourd'hui, 09:15",
      icon: "musical-notes",
      amount: "- 9,99 €",
      amountType: "negative" as const,
      status: "completed" as const,
    },
    {
      id: "tx-2",
      title: "Virement de Marie L.",
      description: "Remboursement restaurant",
      timestamp: "Hier, 19:40",
      avatarInitials: "ML",
      amount: "+ 42,50 €",
      amountType: "positive" as const,
      status: "completed" as const,
    },
  ];

  return (
    <ActivityFeedWidget
      title="Dernières transactions"
      items={transactions}
      maxItems={5}
      onViewAll={() => console.log("Ouvrir historique complet")}
      variant="glass"
    />
  );
}
```
