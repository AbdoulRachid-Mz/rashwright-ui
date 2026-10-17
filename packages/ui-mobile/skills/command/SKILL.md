---
name: command
description: Palette de commande mobile et recherche rapide avec filtres par sections, raccourcis, état vide et modale dialog Liquid Glass.
version: 1.0.0
category: Navigation
supportsGlass: true
---

# Command — Palette de commande mobile

Le composant `Command` offre une interface de recherche rapide et d'exécution d'actions contextuelles (menu d'actions rapides, navigation, recherche globale), inspirée des palettes de commandes type `cmd+k` adaptées au mobile.

## Exemple d'utilisation

```tsx
import React, { useState } from "react";
import { View, Button } from "react-native";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

export function QuickActionsDemo() {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ padding: 20 }}>
      <Button title="Ouvrir la palette" onPress={() => setOpen(true)} />

      <CommandDialog visible={open} onClose={() => setOpen(false)} variant="glass">
        <CommandGroup heading="Navigation">
          <CommandItem
            id="home"
            label="Accueil"
            sublabel="Retour au tableau de bord"
            icon="🏠"
            shortcut="⌘H"
            onSelect={() => {
              console.log("Naviguer vers Accueil");
              setOpen(false);
            }}
          />
          <CommandItem
            id="profile"
            label="Profil & Paramètres"
            icon="👤"
            onSelect={() => {
              console.log("Naviguer vers Profil");
              setOpen(false);
            }}
          />
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem
            id="new-project"
            label="Nouveau projet"
            sublabel="Créer une application Expo"
            icon="✨"
            onSelect={() => {
              console.log("Créer un projet");
              setOpen(false);
            }}
          />
        </CommandGroup>

        <CommandEmpty>Aucune commande correspondante.</CommandEmpty>
      </CommandDialog>
    </View>
  );
}
```
