<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile CLI" width="180" />
</p>

# @rashwright/cli — v0.4.0 · Commande `rs-ui` & `rs-ui-reset`

> CLI officiel **Rashwright UI Mobile** pour React Native / Expo.
> Inspiré de la philosophie shadcn/ui : **tu installes un composant, tu possèdes son code source.**
>
> Plus de `node_modules` opaque. Plus de surprise quant à la compatibilité Expo SDK.

[![npm](https://img.shields.io/badge/npm-%40rashwright%2Fcli-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/cli)
[![version](https://img.shields.io/badge/version-0.4.0-blue)](#)
[![GitHub](https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github)](https://github.com/AbdoulRachid-Mz/rashwright-ui)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2059-000020?logo=expo)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](#)

---

## ⚡ Prise en main en 30 secondes

### 1) Installer le CLI

```bash
# Option A — Global (recommandé)
bun add -g @rashwright/cli
# ou avec npm :
npm install -g @rashwright/cli

# Option B — Exécution directe sans installation
bunx @rashwright/cli <commande>
# ou :
npx @rashwright/cli <commande>
```

### 2) Initialiser Rashwright dans un projet Expo

```bash
# Dans un projet Expo existant :
cd mon-app-expo/
rs-ui init --yes

# Nouveau projet Expo avec thème Cyber Cyan & Liquid Glass :
rs-ui init --glass --theme cyan --sdk 58 --yes

# Initialiser avec un thème personnalisé en ligne de commande :
rs-ui init --theme custom --primary "#00D9FF" --secondary "#1E293B" --dark-primary "#38BDF8"
```

### 3) Ajouter des composants & Skills IA

```bash
# Ajoute le composant ET son skill IA (skills/rs-ui/drawer/SKILL.md)
rs-ui add drawer

# Ajouter sans installer le skill IA
rs-ui add drawer --no-skills

# Ajout multiple
rs-ui add button card accordion form

# Prévisualiser les modifications avant d'écraser un composant personnalisé
rs-ui add button --diff

# Mode interactif avec cases à cocher :
rs-ui add

# Ajouter l'ensemble du catalogue (61 composants) :
rs-ui add --all
```

### 4) Réinitialiser le projet starter (reset)

```bash
# Mode interactif sécurisé (archive par défaut dans rs-ui-example/) :
rs-ui reset
# ou via l'alias binaire :
rs-ui-reset

# Suppression définitive explicite :
rs-ui reset --delete
```

---

## 📋 Commandes disponibles

```bash
rs-ui --help
```

| Commande | Description |
|---|---|
| `rs-ui init [name]` | Configure Rashwright dans un projet existant ou initialise un nouveau projet Expo avec skill IA global. |
| `rs-ui add [components...]` | Ajoute un ou plusieurs composants avec leurs dépendances natives et Skills IA associés (`--skills`). |
| `rs-ui reset` / `rs-ui-reset` | Nettoie les fichiers de démo et showcase du starter (archivage dans `rs-ui-example/` ou suppression `--delete`). |
| `rs-ui list` | Liste les 61 composants du catalogue avec statut d'installation. Supporte `-i` / `--interactive`. |
| `rs-ui info <component>` | Affiche la fiche technique détaillée d'un composant (versions, dépendances, plateformes, etc.). |
| `rs-ui doctor` | Évalue l'environnement (SDK, dépendances, types) et diagnostique la présence et validité des Skills IA. |
| `rs-ui remove <component>` | Supprime un composant, retire son Skill IA associé et vérifie les dépendances. |
| `rs-ui update [components...]` | Met à jour les composants à partir du Registry avec analyse de diff par hash SHA-256. |

---

## 🔧 Options détaillées

### Options pour `rs-ui init`
- `--theme <preset>` : Preset de couleurs (`default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`, `custom`).
- `--primary <hex>` / `--dark-primary <hex>` : Couleur primaire light / dark personnalisée.
- `--secondary <hex>` / `--dark-secondary <hex>` : Couleur secondaire light / dark personnalisée.
- `--accent <hex>` / `--dark-accent <hex>` : Couleur d'accent light / dark personnalisée.
- `--skills` : Installe le Skill IA Global et les starters (`skills/rs-ui/`) (activé par défaut).
- `--no-skills` : Désactive l'installation des Skills IA.
- `--glass` : Active le moteur Liquid Glass (`expo-blur` et `expo-linear-gradient`).
- `--sdk <version>` : Version cible du SDK Expo (`54` à `59`).

### Options pour `rs-ui add`
- `--skills` : Installe automatiquement `skills/rs-ui/<component>/SKILL.md` (activé par défaut).
- `--no-skills` : Ignore la copie des Skills IA.
- `--diff` : Affiche un diff textuel (LCS) avant d'écraser un composant existant.
- `--all` : Installe l'intégralité des 61 composants disponibles.
- `--force` : Réinstalle les composants même s'ils sont déjà présents.
- `--dry-run` : Simule l'installation sans écriture sur disque.

### Options pour `rs-ui reset`
- `--delete` / `--hard` : Supprime définitivement les fichiers démo au lieu de les archiver.
- `--yes` : Confirme l'opération sans confirmation interactive.
- `--dry-run` : Simule la réinitialisation.

---

## 🤖 Système de Skills IA

Rashwright UI Mobile intègre un système complet de documentation et de contexte destiné aux agents de développement IA (Antigravity, Cursor, Gemini CLI, Claude Code, GitHub Copilot) :

```text
mon-projet-expo/
├── skills/
│   └── rs-ui/
│       ├── SKILL.md            # Skill Global (architecture, tokens, Glass UI, règles)
│       ├── button/
│       │   └── SKILL.md        # Skill Button (props, types, code ownership)
│       └── drawer/
│           └── SKILL.md        # Skill Drawer (props, Reanimated, gesture handler)
```

Chaque `SKILL.md` contient :
- Frontmatter YAML standardisé (`name`, `description`, `version`, `category`, `dependencies`, `supportsGlass`).
- Exemples d'utilisation, Props API typée, pièges fréquents et intégration de thème.
- Diagnostiqué automatiquement via `rs-ui doctor`.

---

## 🔒 Configuration & Lockfile `rashwright-ui.json`

Le fichier de configuration trace l'état complet du starter, des thèmes et des composants :

```json
{
  "version": 1,
  "componentsPath": "src/components/ui",
  "theme": "default",
  "themePreset": "cyan",
  "glass": true,
  "typescript": true,
  "packageManager": "bun",
  "starter": {
    "installed": true,
    "reset": true,
    "archived": true,
    "resetAt": "2026-10-08T10:45:00.000Z"
  },
  "components": {
    "button": "1.0.0",
    "drawer": "1.0.0"
  }
}
```

---

## 🆕 Nouveautés v0.3.0

- **Système de Skills IA** : Distribution de 61 skills composants, 4 skills modules core et 1 skill global avec gestion `--skills` / `--no-skills`.
- **Commande `rs-ui reset` & alias `rs-ui-reset`** : Archivage sécurisé dans `rs-ui-example/` ou suppression définitive `--delete`, génération d'un écran d'accueil minimal avec `useTheme()`.
- **Thèmes élargis** : Ajout de 3 nouveaux presets (`green`, `red`, `cyan`) portant le total à 9 presets.
- **Moteur de Thème Personnalisé (Custom Engine)** : Assistant interactif à 2 étapes (couleurs obligatoires puis facultatives) et options CLI directes (`--primary`, `--secondary`, etc.).
- **Diagnostic enrichi (`rs-ui doctor`)** : Audit complet de la présence et de la cohérence des Skills IA.
- **Résolution TypeScript TS5101** : Fix du flag `ignoreDeprecations: "5.0"` supporté en TypeScript 5.x.

---

## 🆘 Support & Liens

- **Bugs et suggestions** : [GitHub Issues](https://github.com/AbdoulRachid-Mz/rashwright-ui/issues)
- **Documentation contributeur** : [CONTRIBUTOR.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md)
- **Guide de démarrage rapide** : [Quick-Start.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/Quick-Start.md)

---

**Licence MIT · Rashwright office.**
