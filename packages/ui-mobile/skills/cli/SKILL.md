---
name: rs-ui/cli
description: Manuel complet des commandes du CLI rs-ui de Rashwright UI Mobile (v0.3.0)
version: 0.3.0
componentVersion: 0.3.0
category: core
dependencies: []
expoDependencies: []
---

# CLI rs-ui — Manuel de Référence (v0.3.0)

Le CLI `@rashwright/cli` (`rs-ui`) automatise l'installation, la configuration, la maintenance et le nettoyage des composants et des Skills IA dans vos projets React Native et Expo.

---

## Commandes Disponibles

### `rs-ui init`
Initialise Rashwright UI dans le projet React Native courant, ou crée automatiquement un nouveau projet Expo si aucun n'existe.
```bash
# Initialisation standard interactive :
rs-ui init

# Avec preset de thème et mode Glass :
rs-ui init --theme cyan --glass

# Avec thème personnalisé en CLI :
rs-ui init --theme custom --primary "#00D9FF" --secondary "#1E293B"

# Mode non-interactif CI :
rs-ui init --yes
```

### `rs-ui add`
Ajoute un ou plusieurs composants avec leurs dépendances natives, packages associés et Skills IA :
```bash
# Ajouter un composant et son skill IA (skills/rs-ui/drawer/SKILL.md) :
rs-ui add drawer

# Ajouter sans installer le skill IA :
rs-ui add drawer --no-skills

# Ajouter plusieurs composants :
rs-ui add button card modal bottom-sheet

# Ajouter tous les composants du catalogue :
rs-ui add --all
```

### `rs-ui reset` / `rs-ui-reset`
Nettoie les artefacts de démonstration et le showcase starter une fois le projet pris en main :
```bash
# Mode sûr interactif (archivage recommandé dans rs-ui-example/) :
rs-ui reset

# Suppression définitive explicite :
rs-ui reset --delete
# ou alias
rs-ui reset --hard
```

### `rs-ui list`
Liste tous les composants du catalogue groupés par catégorie :
```bash
rs-ui list
rs-ui list --json
```

### `rs-ui info`
Affiche les métadonnées détaillées, les dépendances natives et les props d'un composant :
```bash
rs-ui info drawer
```

### `rs-ui doctor`
Diagnostique la santé du projet, la compatibilité du SDK Expo, les dépendances natives et la validité des Skills IA :
```bash
rs-ui doctor
```

### `rs-ui update`
Met à jour les composants tout en protégeant les modifications locales de l'utilisateur :
```bash
rs-ui update
```

### `rs-ui remove`
Retire un composant en vérifiant qu'aucun autre composant actif n'en dépend, et nettoie son skill associé géré :
```bash
rs-ui remove drawer
```
