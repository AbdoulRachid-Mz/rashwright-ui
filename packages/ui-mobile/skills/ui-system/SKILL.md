---
name: ui-system
description: Guide d'architecture du système Rashwright UI Mobile pour React Native et Expo.
---

# Rashwright UI Mobile — Architecture du Système

## Vue d'ensemble

Rashwright UI Mobile est un système distribuable de composants React Native / Expo avec support natif du style Liquid Glass.
Inspiré de shadcn/ui, il repose sur le principe du **code ownership** : les composants sont copiés dans le projet consommateur avec leurs dépendances natives et JavaScript résolues automatiquement via le CLI `rs-ui`.

## Principes clés

1. **Install Complete** : Tout composant ajouté via `rs-ui add` est accompagné de ses hooks, styles, providers, et dépendances Expo compatibles avec le SDK courant.
2. **Project Ownership** : Le code appartient au développeur consommateur, sans abstraction opaque.
3. **Glass UI Primitives** : Moteur Liquid Glass unifié (`expo-blur`, `expo-linear-gradient`, `react-native-reanimated`) configurable via design tokens.
4. **Pas de logique métier** : Les composants sont strictement génériques (Bouton, Card, Drawer, Input, etc.). Aucun composant applicatif métier n'y réside.

## Structure standard dans un projet consommateur

```text
my-expo-app/
├── assets/
│   ├── primary.png
│   └── svg/primary.svg
├── components/ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── glass-card.tsx
│   ├── rashwright-logo.tsx
│   └── showcase-screen.tsx
├── theme/
│   ├── tokens/
│   ├── themes/
│   └── index.ts
├── contexts/
│   └── theme-context.tsx
├── stores/
│   └── theme-store.ts
└── rashwright-ui.json
```
