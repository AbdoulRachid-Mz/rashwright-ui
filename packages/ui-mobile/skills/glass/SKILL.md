---
name: glass
description: Guide du système Liquid Glass UI, tokens et composants glass dans Rashwright UI.
---

# Liquid Glass UI — Guide Technique

## Concept

Liquid Glass est un preset d'apparence haut de gamme combinant :
- Matériau translucide avec flou d'arrière-plan (`expo-blur` avec `BlurView`)
- Liserés et bordures lumineuses (`expo-linear-gradient`)
- Micro-interactions et ombres physiques réactives (`react-native-reanimated`)

## Primitives Liquid Glass

1. `LiquidSurface` : Conteneur physique avec réfraction et flou
2. `LiquidBorder` : Contour lumineux avec dégradé subtil
3. `LiquidHighlight` : Reflet spéculaire supérieur simulant la lumière naturelle
4. `LiquidGlow` : Halo d'illumination colorée autour des contrôles actifs
5. `LiquidPressable` : Interaction tactile avec scale physics et spring

## Utilisation des composants Glass

```tsx
import { GlassCard, Button } from "@/components/ui";

export function HeroCard() {
  return (
    <GlassCard style={{ padding: 24, borderRadius: 24 }}>
      <Button variant="glass">Action Glass</Button>
    </GlassCard>
  );
}
```
