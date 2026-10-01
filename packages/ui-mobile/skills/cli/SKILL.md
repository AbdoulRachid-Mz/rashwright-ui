---
name: cli
description: Manuel complet des commandes du CLI rs-ui de Rashwright UI Mobile.
---

# CLI rs-ui — Documentation Complète

## Commandes disponibles

### `rs-ui init`
Initialise Rashwright UI dans le projet React Native courant, ou crée automatiquement un nouveau projet Expo si aucun n'existe.
```bash
# Vérifie le projet courant ou en crée un nouveau avec les réglages par défaut :
rs-ui init

# Créer directement un nouveau projet Expo SDK latest avec Rashwright UI :
rs-ui init my-new-app --sdk latest --glass

# Mode non-interactif :
rs-ui init --yes --glass
```

### `rs-ui add`
Ajoute un ou plusieurs composants avec leurs dépendances natives et packages associés :
```bash
rs-ui add button
rs-ui add drawer dialog bottom-sheet
rs-ui add --all
```

### `rs-ui list`
Liste tous les composants du catalogue groupés par catégorie :
```bash
rs-ui list
rs-ui list --json
```

### `rs-ui info`
Affiche les métadonnées et prérequis natifs d'un composant :
```bash
rs-ui info drawer
```

### `rs-ui doctor`
Diagnostique la compatibilité du SDK Expo, les dépendances natives et la configuration :
```bash
rs-ui doctor
```

### `rs-ui update`
Met à jour les composants tout en protégeant les modifications locales de l'utilisateur :
```bash
rs-ui update
```

### `rs-ui remove`
Retire un composant en vérifiant qu'aucun autre composant actif n'en dépend :
```bash
rs-ui remove button
```
