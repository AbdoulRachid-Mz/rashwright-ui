---
name: rs-ui/theme
description: Guide du système de thème, tokens, presets (9 presets + custom engine) et hook useTheme dans Rashwright UI Mobile
version: 0.3.0
componentVersion: 0.3.0
category: core
dependencies:
  - zustand
expoDependencies:
  - "@react-native-async-storage/async-storage"
---

# Theme Engine & Design Tokens (v0.3.0)

Le moteur de thème de **Rashwright UI Mobile** offre un système complet et extensible basé sur des tokens de design, un stockage persistant (`zustand` + `AsyncStorage`), 9 presets graphiques prêts à l'emploi et un moteur de thème personnalisé.

---

## 1. Palette des Presets Disponibles

| Preset | Ambiance | Teinte Light | Teinte Dark |
|---|---|---|---|
| `default` | Rashwright Blue | `#2563EB` | `#3B82F6` |
| `emerald` | Emerald Mint | `#059669` | `#10B981` |
| `violet` | Violet Tech | `#7C3AED` | `#8B5CF6` |
| `amber` | Amber Luxury | `#D97706` | `#F59E0B` |
| `rose` | Rose Vibrant | `#E11D48` | `#F43F5E` |
| `slate` | Slate Monochrome | `#475569` | `#64748B` |
| `green` | Forest Green | `#16A34A` | `#22C55E` |
| `red` | Crimson Red | `#DC2626` | `#EF4444` |
| `cyan` | Cyber Cyan | `#0891B2` | `#00D9FF` |
| `custom` | Thème personnalisé | Défini via CLI ou wizard | Défini via CLI ou wizard |

---

## 2. Utilisation dans vos Composants

Le hook `@/contexts/theme-context` expose le thème actif, l'état sombre, et les setters :

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

export function ThemeSwitcher() {
  const { theme, isDark, toggleDark, themePreset, setThemePreset } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={{ color: theme.colors.text }}>
        Thème actuel : {themePreset} ({isDark ? 'Dark' : 'Light'})
      </Text>
      
      <TouchableOpacity
        onPress={toggleDark}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={{ color: '#FFFFFF' }}>Basculer Mode Sombre</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setThemePreset('cyan')}
        style={[styles.button, { backgroundColor: theme.colors.secondary }]}
      >
        <Text style={{ color: theme.colors.text }}>Passer en Cyber Cyan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
```

---

## 3. Moteur de Thème Personnalisé (Custom Engine)

Lors de l'initialisation du projet :
```bash
rs-ui init --theme custom --primary "#00D9FF" --dark-primary "#38BDF8" --secondary "#1E293B" --dark-secondary "#0F172A"
```

Le CLI génère automatiquement `theme/themes/custom.ts` avec la palette complète `customLight` et `customDark` respectant scrupuleusement le contrat de type `Theme`.

---

## 4. Bonnes Pratiques

1. **Tokens obligatoires** : Toujours utiliser `theme.colors.<token>` (`primary`, `background`, `card`, `text`, `border`, `muted`, `destructive`) plutôt que des valeurs hexadécimales en dur.
2. **Support des deux modes** : Testez systématiquement l'affichage de vos écrans en mode clair et en mode sombre.
3. **Persistance** : Le choix de thème de l'utilisateur est automatiquement mémorisé via `AsyncStorage` sans code additionnel requis.
