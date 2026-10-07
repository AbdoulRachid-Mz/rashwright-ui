<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile CLI" width="180" />
</p>

# @rashwright/cli — v0.2.0 · Commande `rs-ui`

> CLI officiel **Rashwright UI Mobile** pour React Native / Expo.
> Inspiré de la philosophie shadcn/ui : **tu installes un composant, tu possèdes son code source.**
>
> Plus de `node_modules` opaque. Plus de surprise quant à la compatibilité Expo SDK.

[![npm](https://img.shields.io/badge/npm-%40rashwright%2Fcli-cb3837?logo=npm)](https://www.npmjs.com/package/@rashwright/cli)
[![version](https://img.shields.io/badge/version-0.2.0-blue)](#)
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

# Nouveau projet Expo complet (SDK 58, Liquid Glass, thème émeraude) :
rs-ui init --glass --theme emerald --sdk 58 --yes
```

### 3) Ajouter des composants

```bash
# Ajout direct
rs-ui add button card accordion form

# Prévisualiser les modifications avant d'écraser un composant personnalisé
rs-ui add button --diff

# Mode interactif avec cases à cocher :
rs-ui add

# Ajouter l'ensemble du catalogue (61 composants) :
rs-ui add --all
```

---

## 📋 Commandes disponibles

```bash
rs-ui --help
```

| Commande | Description |
|---|---|
| `rs-ui init [name]` | Configure Rashwright dans un projet existant ou initialise un nouveau projet Expo. |
| `rs-ui add [components...]` | Ajoute un ou plusieurs composants en résolvant l'arbre de dépendances et les modules natifs Expo. |
| `rs-ui list` | Liste les composants du catalogue avec statut d'installation. Supporte `-i` / `--interactive`. |
| `rs-ui info <component>` | Affiche la fiche technique détaillée d'un composant (versions, dépendances, plateformes, etc.). |
| `rs-ui doctor` | Évalue l'environnement (SDK, gestionnaire de paquets, types) et signale les composants obsolètes. |
| `rs-ui remove <component>` | Supprime un composant et avertit si d'autres composants installés en dépendent. |
| `rs-ui update [components...]` | Met à jour les composants à partir du Registry avec analyse de diff par hash SHA-256. |

---

## 🔧 Options détaillées

### Options globales
- `--registry <url>` : URL d'un registre distant personnalisé.
- `--fresh` : Contourne le cache local de 24h (`~/.rs-ui/cache`) pour forcer un rafraîchissement réseau.

### Options pour `rs-ui add`
- `--diff` : Affiche un diff textuel (LCS) avant de remplacer un composant existant modifié localement.
- `--all` : Installe l'intégralité des 61 composants disponibles.
- `--force` : Réinstalle les composants même s'ils sont déjà présents, sans confirmation.
- `--dry-run` : Affiche le plan d'installation détaillé sans écrire sur le disque.
- `-i, --interactive` : Ouvre la sélection interactive à cases à cocher.

### Options pour `rs-ui list`
- `-i, --interactive` : Navigation interactive par catégorie dans le terminal.
- `--json` : Sortie structurée au format JSON pour outils d'automatisation.

### Options pour `rs-ui init`
- `--sdk <version>` : Version cible du SDK Expo (`54`, `55`, `56`, `57`, `58`, `59`).
- `--theme <preset>` : Preset de couleurs initial (`default`, `emerald`, `violet`, `amber`, `rose`, `slate`).
- `--glass` : Active le moteur Liquid Glass (installe `expo-blur` et `expo-linear-gradient`).
- `--no-reset` : Conserve les fichiers existants sans réinitialiser le template Expo.
- `--dry-run` : Simule l'initialisation sans modifier le projet.

---

## 🔒 Lockfile `rashwright-ui.json` versionné

Depuis la version v0.2.0, le fichier de configuration enregistre la version et la date de chaque composant installé :

```json
{
  "sdkVersion": 58,
  "packageManager": "bun",
  "liquidGlass": true,
  "theme": "emerald",
  "components": {
    "button": {
      "version": "0.2.0",
      "installedAt": "2026-10-07T13:45:00.000Z"
    },
    "accordion": {
      "version": "0.2.0",
      "installedAt": "2026-10-07T13:46:12.000Z"
    }
  }
}
```
*La rétrocompatibilité avec les versions antérieures (tableau simple de chaînes) est totalement assurée.*

---

## 🆕 Nouveautés v0.2.0

- **Prévisualisation de modifications (`--diff`)** : Moteur de comparaison LCS intégré signalant les suppressions et ajouts avant écrasement.
- **Remote Registry & CDN Cache** : Téléchargement dynamique des composants depuis un CDN distant (`https://unpkg.com/@rashwright/ui-mobile@latest`) avec cache local persistant (`~/.rs-ui/cache`).
- **Compatibilité Expo SDK 59** : Détection et support des versions natives pour React Native 0.77+.
- **Catalogue enrichi à 61 composants** : Ajout de `accordion`, `collapsible`, `data-table`, `form`, `otp-input` et `rating`.
- **Mode interactif pour `rs-ui list`** : Navigation fluide par catégories directement dans le terminal.
- **Diagnostic enrichi (`rs-ui doctor`)** : Détection automatique des composants locaux obsolètes par rapport au registre.
- **Fiabilisation des mises à jour** : Utilisation d'un hash normalisé SHA-256 et réinstallation automatique des modules natifs avec `expo install`.

---

## 🆘 Support & Liens

- **Bugs et suggestions** : [GitHub Issues](https://github.com/AbdoulRachid-Mz/rashwright-ui/issues)
- **Documentation contributeur** : [CONTRIBUTOR.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/CONTRIBUTOR.md)
- **Guide de démarrage rapide** : [Quick-Start.md](https://github.com/AbdoulRachid-Mz/rashwright-ui/blob/main/Quick-Start.md)

---

**Licence MIT · Rashwright office.**
