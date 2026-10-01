---
name: ui-component
description: Guide et standards pour développer un nouveau composant dans Rashwright UI Mobile.
---

# Standards des Composants Rashwright UI

## Règle de nommage & conventions

- Nom de fichier : kebab-case (ex: `bottom-sheet.tsx`, `text-input.tsx`).
- Composant exporté : PascalCase (ex: `BottomSheet`, `TextInput`).
- Props standardisées :
  - `variant`: `primary | secondary | outline | ghost | destructive | glass`
  - `size`: `sm | md | lg`
  - `disabled`: `boolean`
  - `loading`: `boolean`
  - `accessibilityLabel`, `accessibilityRole`, `accessibilityState`

## Enregistrement dans le Registry

Chaque composant doit posséder son entrée `registry/components/<name>.json` :

```json
{
  "name": "my-component",
  "version": "1.0.0",
  "description": "Description du composant",
  "category": "Basic",
  "files": ["components/ui/my-component.tsx"],
  "dependencies": [],
  "expoDependencies": ["react-native-reanimated"],
  "requiresComponents": ["button"],
  "providers": ["ThemeProvider"],
  "supportsGlass": true,
  "platforms": ["ios", "android"],
  "nativeRebuildRequired": false
}
```
