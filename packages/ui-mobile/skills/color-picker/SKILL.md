---
name: color-picker
description: Sélecteur de couleur tactile avec nuancier de palettes rapides, saisie hexadécimale, retour haptique et variante Liquid Glass.
version: 1.0.0
category: Forms
supportsGlass: true
---

# ColorPicker — Sélecteur de couleur tactile

Le composant `ColorPicker` permet à l'utilisateur de choisir une couleur parmi un nuancier de presets rapides ou de saisir directement un code hexadécimal `#RRGGBB`.

## Exemple d'utilisation

```tsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import { ColorPicker } from "@/components/ui/color-picker";

export function ThemeCustomizer() {
  const [accent, setAccent] = useState("#3B82F6");

  return (
    <View style={{ padding: 20 }}>
      <ColorPicker
        label="Couleur d'accentuation"
        value={accent}
        onChange={setAccent}
        variant="glass"
      />

      <View
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          backgroundColor: accent,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Aperçu dynamique ({accent})
        </Text>
      </View>
    </View>
  );
}
```
