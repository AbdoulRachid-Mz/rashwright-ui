---

name: rs-ui/rating

description: Composant de notation par étoiles pour React Native / Expo avec affichage fractionnaire, demi-étoiles interactives, personnalisation des couleurs et animation.

version: 0.3.0

componentVersion: 0.3.0

category: Forms

dependencies:

* react-native-reanimated

expoDependencies:

* expo-haptics

requiresComponents:

* none

## supportsGlass: false

# Rating — Rashwright UI Mobile

Composant de notation par étoiles pour React Native / Expo.

`Rating` permet :

* l'affichage de notes entières ;
* l'affichage de valeurs fractionnaires ;
* l'affichage des demi-étoiles ;
* l'affichage de fractions arbitraires comme `3.25`, `3.5` ou `3.75` ;
* la sélection interactive par incréments de `0.5` avec `allowHalf` ;
* un mode lecture seule ;
* différentes tailles ;
* la personnalisation des couleurs ;
* une animation lors de la sélection ;
* un retour haptique avec Expo Haptics ;
* l'intégration avec le système de thème Rashwright.

## Installation

```bash
rs-ui add rating
```

Le CLI installe automatiquement les dépendances nécessaires.

## Usage

### Rating simple

```tsx
import { Rating } from "@/components/ui/rating";

export function ExampleRating() {
  return <Rating />;
}
```

### Rating avec valeur entière

```tsx
<Rating
  value={3}
  max={5}
  readonly
/>
```

Affichage :

```text
★★★☆☆
```

### Affichage d'une demi-étoile

```tsx
<Rating
  value={3.5}
  max={5}
  allowHalf
  readonly
/>
```

Affichage :

```text
★★★½☆
```

### Valeurs fractionnaires

Le composant prend en charge l'affichage de valeurs fractionnaires, même lorsqu'elles ne sont pas des demi-étoiles.

```tsx
<Rating
  value={3.25}
  max={5}
  allowHalf
  readonly
/>
```

```tsx
<Rating
  value={3.75}
  max={5}
  allowHalf
  readonly
/>
```

Le remplissage de chaque étoile est calculé proportionnellement à la valeur réelle.

Exemples :

```text
3.00 → ★★★☆☆
3.25 → ★★★¼☆
3.50 → ★★★½☆
3.75 → ★★★¾☆
4.00 → ★★★★☆
```

> `allowHalf` contrôle principalement l'interaction utilisateur. Il n'empêche pas le composant d'afficher des valeurs fractionnaires arbitraires.

## Interaction

Pour permettre à l'utilisateur de modifier la note :

```tsx
import { useState } from "react";
import { Rating } from "@/components/ui/rating";

export function ExampleRating() {
  const [rating, setRating] = useState(3.5);

  return (
    <Rating
      value={rating}
      max={5}
      allowHalf
      onChange={setRating}
    />
  );
}
```

Avec :

```tsx
allowHalf
```

les interactions sont effectuées par incréments de `0.5`.

Exemple :

```text
1 → 1.5 → 2 → 2.5 → 3 → 3.5 → 4 → 4.5 → 5
```

Sans `allowHalf`, la sélection interactive utilise uniquement les étoiles entières.

## Props API

| Prop                 | Type                      | Défaut      | Description                                                  |
| -------------------- | ------------------------- | ----------- | ------------------------------------------------------------ |
| `value`              | `number`                  | `0`         | Valeur actuelle de la notation. Peut être fractionnaire.     |
| `max`                | `number`                  | `5`         | Nombre maximum d'étoiles.                                    |
| `onChange`           | `(value: number) => void` | `undefined` | Callback appelé lorsqu'une nouvelle valeur est sélectionnée. |
| `readonly`           | `boolean`                 | `false`     | Empêche toute interaction utilisateur.                       |
| `size`               | `"sm" \| "md" \| "lg"`    | `"md"`      | Taille des étoiles.                                          |
| `variant`            | `"default" \| "glass"`    | `"default"` | Variante visuelle du composant.                              |
| `allowHalf`          | `boolean`                 | `false`     | Active la sélection interactive par incréments de `0.5`.     |
| `emptyColor`         | `string`                  | thème       | Couleur des étoiles non remplies.                            |
| `fillColor`          | `string`                  | `#F59E0B`   | Couleur des étoiles remplies.                                |
| `style`              | `StyleProp<ViewStyle>`    | `undefined` | Style du conteneur principal.                                |
| `accessibilityLabel` | `string`                  | automatique | Label d'accessibilité personnalisé.                          |

## Valeurs fractionnaires

Le composant calcule indépendamment le remplissage de chaque étoile.

Pour une note `3.75` :

```text
Étoile 1 → 100 %
Étoile 2 → 100 %
Étoile 3 → 100 %
Étoile 4 → 75 %
Étoile 5 → 0 %
```

Pour une note `2.25` :

```text
Étoile 1 → 100 %
Étoile 2 → 100 %
Étoile 3 → 25 %
Étoile 4 → 0 %
Étoile 5 → 0 %
```

Cela permet d'afficher correctement des notes provenant d'une API ou d'une base de données qui utilise des valeurs décimales.

## Mode lecture seule

Pour afficher une note provenant d'une API, d'une base de données ou d'une statistique :

```tsx
<Rating
  value={4.25}
  max={5}
  allowHalf
  readonly
/>
```

Le composant n'est alors pas interactif.

Le mode `readonly` est recommandé pour les notes calculées automatiquement.

## Taille

Trois tailles sont disponibles :

```tsx
<Rating size="sm" />
<Rating size="md" />
<Rating size="lg" />
```

Correspondance interne :

```text
sm → 20
md → 28
lg → 36
```

## Couleurs

Les couleurs peuvent être personnalisées :

```tsx
<Rating
  value={4}
  fillColor="#F59E0B"
  emptyColor="#D1D5DB"
  readonly
/>
```

Lorsque `emptyColor` n'est pas fourni, le composant utilise le token `theme.colors.mutedForeground`.

## Thème Rashwright

Le composant utilise :

```tsx
const { theme } = useTheme();
```

et doit être utilisé à l'intérieur du :

```tsx
<ThemeProvider>
  ...
</ThemeProvider>
```

Le composant ne doit pas recréer son propre système de thème.

## Dépendances & prérequis

### Dépendances npm

```text
react-native-reanimated
```

### Dépendances Expo

```text
expo-haptics
```

### Composants requis

```text
Aucun
```

### Providers requis

```text
ThemeProvider
```

## Animation

Lorsqu'une étoile est sélectionnée, le composant utilise React Native Reanimated pour effectuer une légère animation d'échelle.

Le composant ne doit pas remplacer Reanimated par une implémentation d'animation maison.

## Feedback haptique

Une vibration légère est déclenchée lors d'une sélection interactive via :

```tsx
expo-haptics
```

Le feedback haptique n'est pas déclenché en mode `readonly`.

## Accessibilité

Le conteneur principal utilise :

```text
accessibilityRole="adjustable"
```

et expose :

```text
min
max
now
```

La valeur accessible correspond à la note actuelle.

Chaque étoile interactive possède également un label permettant de comprendre son rôle.

## Bonnes pratiques

### 1. Utiliser `readonly` pour les notes calculées

Pour une note provenant d'une API :

```tsx
<Rating
  value={product.rating}
  max={5}
  allowHalf
  readonly
/>
```

### 2. Ne pas arrondir inutilement les valeurs provenant de l'API

Éviter :

```tsx
<Rating value={Math.round(rating)} />
```

si l'application souhaite conserver une précision fractionnaire.

Préférer :

```tsx
<Rating
  value={rating}
  allowHalf
  readonly
/>
```

### 3. Utiliser `allowHalf` pour les interfaces interactives

```tsx
<Rating
  value={rating}
  allowHalf
  onChange={setRating}
/>
```

permet une sélection par incréments de `0.5`.

### 4. Respecter le système de thème

Ne pas remplacer systématiquement les tokens du thème par des couleurs codées en dur.

Utiliser les props `fillColor` et `emptyColor` uniquement lorsque le design du projet le nécessite.

### 5. Ne pas caster les props vers `any`

Utiliser les types exportés par le composant :

```tsx
RatingProps
RatingSize
RatingVariant
```

## Erreurs fréquentes

### La demi-étoile ne s'affiche pas

Vérifier que la valeur est bien fractionnaire :

```tsx
value={3.5}
```

et que le composant est configuré avec :

```tsx
allowHalf
```

### La note semble arrondie

Ne pas arrondir la valeur avant de la transmettre :

```tsx
// À éviter
value={Math.round(rating)}
```

Utiliser directement la valeur numérique :

```tsx
value={rating}
```

### `onChange` ne fonctionne pas

Vérifier que `onChange` est fourni :

```tsx
<Rating
  value={rating}
  onChange={setRating}
/>
```

Si `onChange` n'est pas fourni, le composant se comporte automatiquement comme un composant non interactif.

### Erreur liée au thème

Vérifier que le composant est rendu sous un :

```tsx
<ThemeProvider>
```

## Import recommandé

Utiliser l'alias Rashwright :

```tsx
import { Rating } from "@/components/ui/rating";
```

ou :

```tsx
import { Rating } from "@/components/ui";
```

Éviter les imports relatifs fragiles comme :

```tsx
import { Rating } from "../../../components/ui/rating";
```

## Résumé pour les agents IA

Lorsqu'un agent IA utilise `Rating` :

1. `value` peut être une valeur décimale.
2. Le composant peut afficher des fractions arbitraires comme `3.25`, `3.5` ou `3.75`.
3. `allowHalf` active la sélection interactive par incréments de `0.5`.
4. `readonly` est recommandé pour les notes provenant d'une API ou d'une base de données.
5. Ne pas arrondir `value` avant de le transmettre.
6. `ThemeProvider` doit être disponible.
7. `expo-haptics` est utilisé pour le feedback interactif.
8. `react-native-reanimated` est utilisé pour l'animation.
9. Ne pas remplacer le système de thème Rashwright par un système local.
10. Ne pas utiliser `any` pour contourner le typage.
