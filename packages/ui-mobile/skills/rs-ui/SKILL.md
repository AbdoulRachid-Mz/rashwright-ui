---
name: rs-ui
description: Skill IA global pour Rashwright UI Mobile — Architecture, tokens, Liquid Glass, composants et CLI
version: 0.3.0
componentVersion: 0.3.0
category: core
dependencies:
  - react-native-reanimated
  - react-native-gesture-handler
  - react-native-safe-area-context
expoDependencies:
  - expo-blur
  - expo-linear-gradient
  - expo-haptics
---

# Rashwright UI Mobile — Global AI Skill (v0.3.0)

Bienvenue dans l'écosystème **Rashwright UI Mobile**, le système de composants React Native / Expo moderne inspiré du principe de **Code Ownership** (comme shadcn/ui) avec support natif du style **Liquid Glass**.

---

## 1. Philosophie & Principes Fondamentaux

1. **Code Ownership & Transparence** : Les composants ne sont pas enfermés dans une boîte noire `node_modules`. Ils sont copiés directement dans le répertoire du projet consommateur (`components/ui/` ou `src/components/ui/`). Vous possédez le code et pouvez le modifier librement.
2. **TypeScript Strict & Zéro `any`** : Chaque composant et utilitaire est strictement typé. L'usage de `any` est proscrit.
3. **Architecture des chemins d'importation** : Tous les imports internes utilisent impérativement l'alias `@/` configuré dans `tsconfig.json` (ex: `@/components/ui/button`, `@/contexts/theme-context`, `@/constants/glass-theme`).
4. **Pas de logique métier** : Les composants Rashwright UI sont agnostiques et purement UI/UX.

---

## 2. Système de Thème & Design Tokens

Rashwright UI embarque un moteur de thème complet supportant 9 presets intégrés ainsi qu'un moteur de thème personnalisé dynamique.

### Presets disponibles
- `default` : Rashwright Blue (`#2563EB` / `#3B82F6`)
- `emerald` : Emerald Mint (`#059669` / `#10B981`)
- `violet` : Violet Tech (`#7C3AED` / `#8B5CF6`)
- `amber` : Amber Luxury (`#D97706` / `#F59E0B`)
- `rose` : Rose Vibrant (`#E11D48` / `#F43F5E`)
- `slate` : Slate Monochrome (`#475569` / `#64748B`)
- `green` : Forest Green (`#16A34A` / `#22C55E`)
- `red` : Crimson Red (`#DC2626` / `#EF4444`)
- `cyan` : Cyber Cyan (`#0891B2` / `#00D9FF`)
- `custom` : Personnalisé avec palette générée dynamiquement

### Utilisation dans un composant
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

export function MonComposant() {
  const { theme, isDark, themePreset, setThemePreset } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.text }}>Mode sombre : {isDark ? 'Oui' : 'Non'}</Text>
      <Text style={{ color: theme.colors.primary }}>Thème : {themePreset}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
});
```

---

## 3. Primitives Liquid Glass

Le style **Liquid Glass** combine réfraction optique, contours spéculaires et animations haptiques physiques.

### Primitives disponibles
- `LiquidSurface` : Conteneur en verre dépoli avec flou optique (`expo-blur` avec fallback réactif).
- `LiquidBorder` : Liseré dégradé subtil avec lumière rasante (`expo-linear-gradient`).
- `LiquidHighlight` : Reflet spéculaire courbé en bordure supérieure.
- `LiquidGlow` : Halo d'illumination colorée autour des contrôles interactifs.
- `LiquidPressable` : Interaction tactile avec ressort physique Reanimated (`withSpring`) et feedback haptique.

### Exemple Glass Card
```tsx
import React from 'react';
import { Text } from 'react-native';
import { GlassCard, Button } from '@/components/ui';

export function CarteVerre() {
  return (
    <GlassCard intensity={60} style={{ padding: 20, borderRadius: 24 }}>
      <Text style={{ fontWeight: 'bold' }}>Titre en Verre Liquide</Text>
      <Button variant="glass" onPress={() => console.log('Pressé')}>Action</Button>
    </GlassCard>
  );
}
```

---

## 4. Catalogue des 61 Composants

Rashwright UI Mobile contient 61 composants organisés par catégorie :

- **Basic** (7) : `badge`, `avatar`, `avatar-group`, `dot`, `icon`, `icon-button`, `rashwright-logo`
- **Layout** (9) : `accordion`, `card`, `collapsible`, `divider`, `keyboard-avoiding-view`, `safe-area-view`, `scroll-view`, `spacer`, `stat-card`
- **Forms** (13) : `checkbox`, `chip`, `form`, `otp-input`, `radio`, `rating`, `search-input`, `segmented-control`, `select`, `slider`, `switch`, `text-input`, `time-picker`
- **Navigation** (8) : `actions-grid`, `bottom-sheet`, `carousel`, `drawer`, `dropdown-menu`, `fab-menu`, `floating-action-button`, `tabs`
- **Feedback** (6) : `alert`, `confirm`, `modal`, `popup`, `progress`, `tooltip`
- **States** (7) : `activity-indicator`, `empty-state`, `error-state`, `loading-state`, `screen-skeleton`, `shimmer`, `skeleton`
- **Data** (3) : `data-table`, `flat-list`, `section-list`
- **Media** (4) : `image`, `upload-image`, `upload-video`, `video`
- **Glass** (2) : `glass-card`, `particles`
- **Starter** (2) : `button`, `showcase-screen`

---

## 5. Commandes CLI `rs-ui`

| Commande | Rôle |
|---|---|
| `rs-ui init` | Configure un projet Expo existant ou initialise un nouveau starter standardisé |
| `rs-ui init --theme <preset>` | Initialise avec un des 9 presets |
| `rs-ui init --theme custom --primary #...` | Initialise avec couleurs personnalisées |
| `rs-ui add <composant>` | Ajoute le composant, ses dépendances et son `SKILL.md` |
| `rs-ui add --all` | Installe l'intégralité du catalogue |
| `rs-ui add --no-skills` | Ajoute le composant sans installer le fichier de skill IA |
| `rs-ui list` | Liste tous les composants disponibles par catégorie |
| `rs-ui info <composant>` | Inspecte la fiche technique et les dépendances natives |
| `rs-ui doctor` | Analyse la santé du projet, le SDK Expo, les dépendances et les skills |
| `rs-ui update` | Met à jour les composants tout en protégeant le code modifié |
| `rs-ui remove <composant>` | Retire proprement un composant en vérifiant les dépendances |
| `rs-ui reset` | Archive (`rs-ui-example/`) ou supprime (`--delete`) le showcase de démo |

---

## 6. Bonnes Pratiques & Conventions pour Agents IA

1. **Ne jamais utiliser d'import relatif long** : Privilégier `@/components/ui/<nom>` ou `@/contexts/theme-context`.
2. **Ne jamais hardcoder les couleurs système** : Utiliser systématiquement `theme.colors.<token>` (ex: `primary`, `background`, `card`, `text`, `border`, `muted`).
3. **Animations** : Utiliser `react-native-reanimated` avec des configurations `withTiming` (durée 200-300ms) ou `withSpring` amorties.
4. **Accessibilité** : Fournir systématiquement `accessibilityRole` et `accessibilityLabel` sur les éléments interactifs.
5. **Gestion SafeArea** : Utiliser `react-native-safe-area-context` (`useSafeAreaInsets` ou `SafeAreaView` issu de ce package) et non le composant natif déprécié de React Native.
