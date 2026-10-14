---
name: rs-ui/button
description: Bouton interactif universel pour React Native avec variants, tailles, états et support Glass.
version: 0.3.0
componentVersion: 0.3.0
category: Basic
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - none
supportsGlass: true
---

# Button — Rashwright UI Mobile

Bouton interactif universel supportant variants de style, tailles, icônes et feedback haptique.

## Installation

```bash
rs-ui add button
```

## Usage de base

```tsx
import { Button } from '@/components/ui/button';

// Bouton primaire
<Button title="Enregistrer" onPress={() => {}} />

// Bouton avec variante
<Button title="Annuler" variant="ghost" onPress={() => {}} />

// Bouton avec icône
<Button
  title="Partager"
  leftIcon={{ name: "share-outline", library: "Ionicons" }}
  onPress={() => {}}
/>

// Bouton désactivé
<Button title="En cours..." loading onPress={() => {}} />
```

## Props API

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | requis | Texte du bouton |
| `onPress` | `() => void` | requis | Callback au clic |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Style du bouton |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du bouton |
| `leftIcon` | `IconProps` | - | Icône à gauche |
| `rightIcon` | `IconProps` | - | Icône à droite |
| `loading` | `boolean` | `false` | Affiche spinner, désactive le clic |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `fullWidth` | `boolean` | `false` | Étend sur toute la largeur |
| `haptic` | `boolean` | `true` | Active le retour haptique (iOS) |
| `style` | `ViewStyle` | - | Style supplémentaire |

## Variants

```tsx
<Button title="Primary" variant="primary" />     // Fond coloré (couleur primaire)
<Button title="Secondary" variant="secondary" /> // Fond secondaire
<Button title="Outline" variant="outline" />     // Bordure, fond transparent
<Button title="Ghost" variant="ghost" />         // Aucune bordure ni fond
<Button title="Danger" variant="danger" />       // Rouge pour actions destructives
```

## Avec ThemeProvider (requis)

Le `Button` lit les couleurs depuis `useTheme()`. Enveloppez votre app avec `ThemeProvider` :

```tsx
import { ThemeProvider } from '@/contexts/theme-context';

export default function App() {
  return (
    <ThemeProvider>
      <Button title="Bonjour" onPress={() => {}} />
    </ThemeProvider>
  );
}
```

## Support Glass

Activez le mode Glass via `ThemeProvider` :

```tsx
<ThemeProvider initialMode="light" glassEnabled>
  <Button title="Glass Button" variant="primary" onPress={() => {}} />
</ThemeProvider>
```

## Accessibilité

- `accessibilityRole="button"` automatique
- `accessibilityState={{ disabled, busy: loading }}` géré
- Labels lisibles par VoiceOver/TalkBack
