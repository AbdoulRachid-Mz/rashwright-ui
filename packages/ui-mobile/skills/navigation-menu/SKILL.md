---
name: navigation-menu
description: Menu de navigation hiérarchique avec sections dépliables, indicateurs d'état actif, badges et support Liquid Glass.
version: 1.0.0
category: Navigation
supportsGlass: true
---

# NavigationMenu — Menu hiérarchique mobile

Le composant `NavigationMenu` structure la navigation complexe sous forme de sections accordéon avec icônes, badges, sous-éléments et gestion d'état actif.

## Exemple d'utilisation

```tsx
import React, { useState } from "react";
import { View } from "react-native";
import { NavigationMenu } from "@/components/ui/navigation-menu";

export function AppNavigation() {
  const [activeItem, setActiveItem] = useState("dashboard");

  const sections = [
    {
      id: "main",
      title: "Espace de travail",
      icon: "📁",
      items: [
        {
          id: "dashboard",
          title: "Tableau de bord",
          description: "Vue d'ensemble et métriques",
          onPress: () => setActiveItem("dashboard"),
        },
        {
          id: "projects",
          title: "Projets actifs",
          badge: "3",
          onPress: () => setActiveItem("projects"),
        },
      ],
    },
    {
      id: "settings",
      title: "Configuration",
      icon: "⚙️",
      badge: "Nouveau",
      items: [
        {
          id: "general",
          title: "Général",
          onPress: () => setActiveItem("general"),
        },
        {
          id: "billing",
          title: "Facturation & Plans",
          onPress: () => setActiveItem("billing"),
        },
      ],
    },
  ];

  return (
    <View style={{ padding: 20 }}>
      <NavigationMenu
        sections={sections}
        activeId={activeItem}
        defaultExpanded={["main"]}
        variant="glass"
      />
    </View>
  );
}
```
