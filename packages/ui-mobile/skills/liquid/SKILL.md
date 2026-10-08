---
name: rs-ui/liquid
description: Guide complet du moteur Liquid Glass UI, primitives et tokens dans Rashwright UI Mobile
version: 0.3.0
componentVersion: 0.3.0
category: core
dependencies:
  - react-native-reanimated
expoDependencies:
  - expo-blur
  - expo-linear-gradient
  - expo-haptics
supportsGlass: true
---

# Liquid Glass UI — Architecture & Primitives (v0.3.0)

Le moteur **Liquid Glass** de Rashwright UI offre un rendu physique moderne combinant réfraction lumineuse, dégradés spéculaires et animations haptiques amorties.

---

## 1. Primitives Fondamentales

Les primitives se trouvent dans `@/components/ui/liquid/` :

### `LiquidSurface`
Conteneur physique avec réfraction optique.
- Utilise `expo-blur` (`BlurView`) lorsque disponible avec fallback fluide sur Android ou Web.
- Gère automatiquement la teinte d'overlay adaptée au mode sombre (`dark` / `light`).
- Props : `intensity` (0-100, défaut: 50), `tint` (`light` | `dark` | `default`), `glassTheme`, `style`, `children`.

### `LiquidBorder`
Contour spéculaire avec micro-dégradé simulant un reflet d'arête biseautée.
- Utilise `expo-linear-gradient`.
- Rehausse le contraste sur les fonds sombres ou contrastés.
- Props : `borderWidth`, `borderRadius`, `colors`, `style`.

### `LiquidHighlight`
Arc ou liseré supérieur lumineux simulant l'incidence d'une source lumineuse en zénith.
- Apporte une sensation de profondeur 3D tridimensionnelle.

### `LiquidGlow`
Halo diffus et dynamique projeté sous ou autour des éléments actifs (boutons pressés, cartes sélectionnées, switchers).
- Utilise l'animation Reanimated pour pulser délicatement au tap.

### `LiquidPressable`
Primitive tactile avec physique de ressort élastique (`withSpring`) et haptique (`expo-haptics`).
- Équivalent d'un `Pressable` natif mais avec micro-scale tactile réactif (scale down à 0.97 puis retour avec rebond fluide).

---

## 2. Exemple d'Utilisation

```tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { GlassCard, Button } from '@/components/ui';
import { useTheme } from '@/contexts/theme-context';

export function LiquidCardExample() {
  const { theme } = useTheme();

  return (
    <GlassCard intensity={70} style={styles.card}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Expérience Liquid Glass</Text>
      <Text style={[styles.desc, { color: theme.colors.muted }]}>
        Surface translucide biseautée avec interactions physiques.
      </Text>
      <Button variant="glass" onPress={() => console.log('Action')}>
        Interagir
      </Button>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 24,
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    marginBottom: 16,
  },
});
```

---

## 3. Bonnes Pratiques & Recommandations

1. **Ne pas surcharger les écrans** : Utilisez 2 à 3 éléments Glass principaux par écran pour préserver 60/120 FPS sur terminaux mobiles d'entrée de gamme.
2. **Support Android** : Veillez à ce que `experimentalBlurMethod` soit configuré si vous ciblez Android natif sans hardware acceleration complète.
3. **Contraste de texte** : Vérifiez toujours que le texte placé sur une `LiquidSurface` reste lisible en mode clair comme en mode sombre.
