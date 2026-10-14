---
name: rs-ui/tabs
description: Navigation par onglets fluide et animée avec surface Glass, capsule Reanimated et support contrôlé/non-contrôlé.
version: 0.7.3
componentVersion: 0.7.3
category: Navigation
dependencies: []
expoDependencies:
  - react-native-reanimated
requiresComponents: []
supportsGlass: true
---

# Tabs — Rashwright UI Mobile

Navigation par onglets modulaire, fluide et accessible avec indicateur capsule Glass animé via React Native Reanimated.

## Installation

```bash
rs-ui add tabs
```

> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.

## Usage

### 1. Mode non contrôlé (simple)

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ThemedText from '@/components/ui/text';

export function ExampleTabs() {
  return (
    <View style={styles.container}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue générale</TabsTrigger>
          <TabsTrigger value="analytics">Statistiques</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ThemedText>Contenu de la vue générale</ThemedText>
        </TabsContent>
        <TabsContent value="analytics">
          <ThemedText>Graphiques et métriques</ThemedText>
        </TabsContent>
        <TabsContent value="settings">
          <ThemedText>Préférences et configuration</ThemedText>
        </TabsContent>
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
});
```

### 2. Mode contrôlé (avec state parent)

```tsx
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function ControlledTabs() {
  const [tab, setTab] = useState('first');

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="first">Premier</TabsTrigger>
        <TabsTrigger value="second">Deuxième</TabsTrigger>
      </TabsList>
      <TabsContent value="first">{/* ... */}</TabsContent>
      <TabsContent value="second">{/* ... */}</TabsContent>
    </Tabs>
  );
}
```

### 3. Liste longue avec défilement (`scrollable`)

```tsx
<Tabs defaultValue="tab1">
  <TabsList scrollable>
    <TabsTrigger value="tab1">Tous</TabsTrigger>
    <TabsTrigger value="tab2">En cours</TabsTrigger>
    <TabsTrigger value="tab3">Terminés</TabsTrigger>
    <TabsTrigger value="tab4">Archivés</TabsTrigger>
    <TabsTrigger value="tab5">Corbeille</TabsTrigger>
  </TabsList>
  {/* TabsContent ... */}
</Tabs>
```

## Props API

### `<Tabs>` (Root)
| Prop | Type | Défaut | Description |
|---|---|---|---|
| `defaultValue` | `string` | `""` | Onglet actif initial (mode non contrôlé) |
| `value` | `string` | `undefined` | Onglet actif (mode contrôlé) |
| `onValueChange` | `(value: string) => void` | `undefined` | Callback au changement d'onglet |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style appliqué au conteneur racine |
| `children` | `ReactNode` | — | Doit contenir `<TabsList>` et `<TabsContent>` |

### `<TabsList>`
| Prop | Type | Défaut | Description |
|---|---|---|---|
| `scrollable` | `boolean` | `false` | Active le défilement horizontal ScrollView si les triggers dépassent |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style additionnel sur la surface Glass |

### `<TabsTrigger>`
| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string` | **Requis** | Identifiant unique de l'onglet |
| `disabled` | `boolean` | `false` | Désactive l'interaction |
| `accessibilityLabel` | `string` | `undefined` | Libellé vocal (recommandé pour icônes seules) |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style du trigger |

### `<TabsContent>`
| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `string` | **Requis** | Valeur correspondant au trigger |
| `style` | `StyleProp<ViewStyle>` | `undefined` | Style du panneau |

## Dépendances & Prérequis

- **Dépendances Expo** : `react-native-reanimated`
- **Composants requis** : `text`, primitives `liquid/*`
- **Providers requis** : `ThemeProvider`
- **Support Glass** : Oui (`supportsGlass: true`)

## Bonnes Pratiques & Erreurs Fréquentes

1. **Ne pas forcer `flex: 1` sur Tabs** : Le composant s'adapte à la largeur du parent (`width: 100%`) et prend la hauteur de son contenu.
2. **Accessibilité** : Chaque trigger expose `accessibilityRole="tab"` et `accessibilityState={{ selected, disabled }}`.
3. **Valeurs uniques** : Chaque `<TabsTrigger>` et `<TabsContent>` doit posséder une valeur distincte.
4. **Contrôlé vs non-contrôlé** : Si `value` est fourni, l'état est piloté par le parent via `onValueChange`. Si seul `defaultValue` est fourni, le composant gère son état interne.
