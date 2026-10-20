---
name: finance-widget
description: Bloc portefeuille financier avec solde, confidentialité masquable, flux revenus/dépenses, raccourcis et Liquid Glass.
version: 1.0.0
category: Finance
requiresComponents:
  - card
  - badge
  - button
  - skeleton
expoDependencies:
  - "@expo/vector-icons"
  - "expo-haptics"
supportsGlass: true
---

# FinanceWidget — Rashwright UI Mobile

Le composant `FinanceWidget` est le bloc d'affichage financier par excellence pour les applications de gestion budgétaire, fintech et portefeuilles mobiles (ex: Ajiya ta). Il intègre la gestion de la confidentialité (masquage en un clic), le suivi des flux et des raccourcis d'opérations.

## 1. Installation

```bash
rs-ui add -w finance
# ou
rs-ui widget add finance
```

Composants requis automatiquement résolus et copiés :
- `@/components/ui/card`
- `@/components/ui/badge`
- `@/components/ui/button`
- `@/components/ui/skeleton`

## 2. Imports

```tsx
import { FinanceWidget } from "@/components/widgets/finance";
import type { FinanceWidgetProps, FinanceActionShortcut } from "@/components/widgets/finance";
```

## 3. Spécification des Props (TypeScript)

| Prop | Type | Obligatoire | Valeur par défaut | Description |
| :--- | :--- | :--- | :--- | :--- |
| `balance` | `number \| string` | **Oui** | - | Solde principal actuel |
| `title` | `string` | Non | `"Solde disponible"` | Libellé d'en-tête |
| `currency` | `string` | Non | `"€"` | Devise associée |
| `income` | `number \| string` | Non | `undefined` | Total des revenus |
| `expense` | `number \| string` | Non | `undefined` | Total des dépenses |
| `periodLabel` | `string` | Non | `"Ce mois"` | Période observée |
| `allowPrivacyMasking` | `boolean` | Non | `true` | Bouton œil pour masquer le solde |
| `defaultMasked` | `boolean` | Non | `false` | Masque le solde au premier rendu |
| `shortcuts` | `FinanceActionShortcut[]` | Non | `[]` | Raccourcis d'actions rapides |
| `loading` | `boolean` | Non | `false` | Squelettes de chargement |
| `variant` | `'default' \| 'bordered' \| 'glass'` | Non | `'glass'` | Variante visuelle |

## 4. Exemples d'utilisation

```tsx
import React from "react";
import { FinanceWidget } from "@/components/widgets/finance";

export function WalletOverviewExample() {
  const shortcuts = [
    {
      id: "transfer",
      label: "Envoyer",
      icon: "send",
      onPress: () => console.log("Ouvrir virement"),
    },
    {
      id: "deposit",
      label: "Recharger",
      icon: "add-circle",
      onPress: () => console.log("Recharger le solde"),
    },
    {
      id: "history",
      label: "Historique",
      icon: "time",
      onPress: () => console.log("Historique complet"),
    },
  ];

  return (
    <FinanceWidget
      title="Compte Courant"
      balance={3420.50}
      currency="€"
      income={4100.00}
      expense={679.50}
      periodLabel="Octobre 2026"
      allowPrivacyMasking
      shortcuts={shortcuts}
      variant="glass"
    />
  );
}
```
