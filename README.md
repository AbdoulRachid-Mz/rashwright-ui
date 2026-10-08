<p align="center">
  <img src="https://github.com/AbdoulRachid-Mz/rashwright-ui/raw/main/packages/ui-mobile/assets/primary.png" alt="Rashwright UI Mobile Logo" width="200" />
</p>

# Rashwright UI Mobile (`rs-ui`)

> Système moderne de composants **distribuables** pour **React Native** & **Expo** avec moteur **Liquid Glass UI**, inspiré de la philosophie *shadcn/ui* : **vous copiez les composants dans votre codebase, vous en êtes propriétaire**.

**Statut v0.4.0** : ✅ Version v0.4.0 — `@rashwright/cli@0.4.0` · `@rashwright/ui-mobile@0.4.0`  
**Composants** : 61 composants UI + 8 primitives Liquid Glass · **Skills IA** : 61 skills composants + 4 modules + 1 global · **Fiabilité** : Lockfile SHA-256 (`rashwright-ui.lock`), Moteur Backup/Restore (`rs-ui backup/restore`), Smart Update chirurgical, Inspecteur 360° et Graphe de dépendances (`rs-ui info/deps/why`) · **SDK Expo** : SDK 54 à 59 · **Tests** : 90 tests unitaires Vitest · **Typing strict** : Zéro `any`.

<p align="center">
  <a href="https://www.npmjs.com/package/@rashwright/cli"><img src="https://img.shields.io/badge/@rashwright/cli-v0.4.0-cb3837?logo=npm" alt="npm - @rashwright/cli" /></a>
  <a href="https://www.npmjs.com/package/@rashwright/ui-mobile"><img src="https://img.shields.io/badge/@rashwright/ui--mobile-v0.4.0-cb3837?logo=npm" alt="npm - @rashwright/ui-mobile" /></a>
  <a href="https://github.com/AbdoulRachid-Mz/rashwright-ui"><img src="https://img.shields.io/badge/GitHub-rashwright--ui-181717?logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Expo%20SDK-SDK%2054%20→%2059-000000.svg?logo=expo" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/Bun-1.4%2B-fbf0df.svg?logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/TypeScript-5.5%2B-3178c6.svg?logo=typescript" alt="TypeScript" />
</p>

---

## ⚡ Quick Start — Prêt en **30 secondes**

```bash
# 1. Installer le CLI (point d'entrée unique pour les développeurs utilisateurs)
bun add -g @rashwright/cli
# ou : npm install -g @rashwright/cli

# 2. Initialiser Rashwright UI Mobile dans un projet Expo existant (ou nouveau)
rs-ui init --glass --theme cyan --yes

# 3. Ajouter des composants (avec leurs Skills IA automatiquement associés)
rs-ui add button drawer
rs-ui add card accordion form otp-input

# 4. Nettoyer les fichiers de démo quand vous êtes prêt
rs-ui reset
```

> 💡 **Rien à comprendre du monorepo.** `@rashwright/cli` est **votre unique point d'entrée** : il va chercher les composants dans le Registry `@rashwright/ui-mobile` (localement ou via CDN distant avec cache de 24h), résout les versions natives compatibles avec votre SDK Expo et copie le code source directement dans votre projet avec sa documentation IA contextuelle (`skills/rs-ui/`). Pas de `node_modules` opaque.

---

## 📑 Sommaire — Guide utilisateur

1. [Pourquoi Rashwright ?](#-pourquoi-rashwright-)
2. [Nouveautés de la version v0.3.0](#-nouveautés-de-la-version-v030)
3. [Système de Skills IA](#-système-de-skills-ia)
4. [Prérequis](#-prérequis)
5. [Installation du CLI `rs-ui`](#-installation-du-cli-rs-ui)
6. [Initialiser un projet (`rs-ui init`)](#-initialiser-un-projet-rs-ui-init)
7. [Ajouter des composants (`rs-ui add / list / info`)](#-ajouter-des-composants-rs-ui-add--list--info)
8. [Réinitialiser le projet starter (`rs-ui reset`)](#-réinitialiser-le-projet-starter-rs-ui-reset)
9. [Les 9 thèmes prédéfinis & Moteur Custom](#-les-9-thèmes-prédéfinis--moteur-custom)
10. [Composants d'upload et providers](#-composants-dupload-et-providers)
11. [Diagnostic (`rs-ui doctor`)](#-diagnostic-rs-ui-doctor)
12. [Matrice de compatibilité Expo SDK](#-matrice-de-compatibilité-expo-sdk)
13. [Architecture & Dépôt `rashwright-ui`](#-architecture--dépôt-rashwright-ui)

> 🛠️ **Vous voulez contribuer ?** → Consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)** et **[Quick-Start.md](./Quick-Start.md)**.

---

## ❓ Pourquoi Rashwright ?

Rashwright UI Mobile n'est **pas une dépendance npm opaque dans `node_modules/`**. C'est un **système de distribution de code source directe** à la *shadcn/ui* enrichi d'un **système de Skills IA** :

- ✅ **Propriété totale du code** : Chaque composant installé via `rs-ui add` est **copié** dans ton projet (`components/ui/`). Tu peux l'éditer, l'adapter, le personnaliser sans contrainte.
- ✅ **Support IA natif** : Chaque composant s'accompagne de son `SKILL.md` (`skills/rs-ui/<component>/`) pour donner le contexte parfait à Antigravity, Cursor, Gemini CLI, Claude Code et Copilot.
- ✅ **Résolution automatique Expo SDK** : Le CLI détecte ta version d'Expo (**SDK 54 à 59**) et installe les versions natives **testées** pour `react-native-reanimated`, `expo-blur`, `expo-linear-gradient`, etc.
- ✅ **Moteur Liquid Glass intégré** : Effets de flou dynamique, reflets physiques, bordures translucides, rebonds tactiles haptiques — activable via `--glass` dans `rs-ui init`.
- ✅ **9 thèmes + Custom Engine** : `default`, `emerald`, `violet`, `amber`, `rose`, `slate`, `green`, `red`, `cyan`, et création de thème custom.
- ✅ **Commande `rs-ui reset`** : Archivage ou suppression en une commande des fichiers de démonstration du starter.
- ✅ **61 composants** au catalogue avec typage strict TypeScript et zéro `any`.

---

## 🆕 Nouveautés de la version v0.3.0

- 🤖 **Système de Skills IA pour agents de code** :
  - **Skill Global** (`skills/rs-ui/SKILL.md`) installé automatiquement par `rs-ui init`.
  - **61 Skills de composants** (`skills/rs-ui/<component>/SKILL.md`) installés automatiquement par `rs-ui add`.
  - Options CLI `--skills` (activé par défaut) et `--no-skills`.
  - 4 skills modules core : `liquid`, `upload`, `theme`, `cli`.
- 🎨 **Moteur de Thèmes Élargi & Custom Engine** :
  - 3 nouveaux presets : `green` (Forest Green), `red` (Crimson Red), `cyan` (Cyber Cyan).
  - Flags CLI `--primary`, `--dark-primary`, `--secondary`, etc. pour injecter vos couleurs en ligne de commande.
  - Assistant interactif à 2 étapes (couleurs obligatoires puis facultatives avec valeurs par défaut).
- 🔄 **Commande `rs-ui reset` & alias `rs-ui-reset`** :
  - Archivage réversible par défaut vers `rs-ui-example/`.
  - Option de suppression définitive `--delete` / `--hard`.
  - Écran minimal d'accueil propre généré avec `useTheme()`.
- 🩺 **Diagnostic enrichi `rs-ui doctor`** :
  - Contrôle automatique de la présence et de la synchronisation des versions des Skills IA.
- 🛠️ **Correctifs & TypeScript** :
  - Correction de l'option `ignoreDeprecations: "5.0"` supportée par TypeScript 5.x.
  - Remplacement de `SafeAreaView` déprécié par `react-native-safe-area-context` dans le starter.
  - Chemin d'asset du logo normalisé vers `@/assets/primary.png`.

---

## 🤖 Système de Skills IA

Rashwright UI Mobile équipe les agents IA d'un contexte de développement exhaustif :

```text
mon-projet-expo/
├── skills/
│   └── rs-ui/
│       ├── SKILL.md            # Skill Global (architecture, tokens, Glass UI)
│       ├── button/
│       │   └── SKILL.md        # Skill Button (props, types, Reanimated)
│       └── drawer/
│           └── SKILL.md        # Skill Drawer (props, gesture handler)
```

Chaque skill contient :
1. Un **frontmatter YAML** exploitable par les outils IA.
2. Une **documentation Markdown** détaillée (props, types, pièges fréquents, exemples d'utilisation).

---

## 💻 Prérequis

| Outil | Version minimale | Rôle |
|---|---|---|
| **Bun** (recommandé) | `>= 1.2.0` | Package manager & runtime (utilisé par défaut par `rs-ui`) |
| **Node.js** | `>= 20.11.0` | Runtime JS (obligatoire pour Expo) |
| **Git** | Récent | Gestion de version |

---

## 📦 Installation du CLI `rs-ui`

### Option A : Installation globale (recommandée)
```bash
bun add -g @rashwright/cli
# ou avec npm :
npm install -g @rashwright/cli
```

### Option B : Exécution ponctuelle
```bash
bunx @rashwright/cli <commande>
# ou :
npx @rashwright/cli <commande>
```

Vérifier l'installation :
```bash
rs-ui --version
# Affiche 0.3.0
```

---

## 🚀 Initialiser un projet (`rs-ui init`)

```bash
# Mode interactif avec choix de thème et assistant custom
rs-ui init

# Mode automatique complet avec thème Cyber Cyan & Liquid Glass
rs-ui init --glass --theme cyan --sdk 58 --yes

# Thème personnalisé en ligne de commande
rs-ui init --theme custom --primary "#00D9FF" --secondary "#1E293B" --dark-primary "#38BDF8"
```

---

## 🧩 Ajouter des composants (`rs-ui add` / `list` / `info`)

```bash
# Ajouter un composant et son skill IA
rs-ui add drawer

# Ajouter sans installer le skill IA
rs-ui add drawer --no-skills

# Ajouter plusieurs composants
rs-ui add button card modal accordion form

# Prévisualiser les modifications avant écrasement
rs-ui add button --diff

# Ajouter tous les composants disponibles (61)
rs-ui add --all
```

---

## 🔄 Réinitialiser le projet starter (`rs-ui reset`)

Une fois le starter pris en main, supprimez ou archivez le showcase démo en une commande :

```bash
# Mode interactif sûr (archivage par défaut dans rs-ui-example/)
rs-ui reset

# Suppression définitive explicite
rs-ui reset --delete
```

---

## 🎨 Les 9 thèmes prédéfinis & Moteur Custom

| Thème | Couleur primaire | Usage recommandé |
|---|---|---|
| `default` | Bleu tech (`#2563EB` / `#3B82F6`) | Applications corporate, SaaS, productivité |
| `emerald` | Vert émeraude (`#059669` / `#10B981`) | Immobilier, fintech, écologie |
| `violet` | Violet profond (`#7C3AED` / `#8B5CF6`) | Créativité, design, IA |
| `amber` | Ambre chaud (`#D97706` / `#F59E0B`) | Alimentation, logistique, alertes |
| `rose` | Rose vif (`#E11D48` / `#F43F5E`) | Lifestyle, beauté, e-commerce |
| `slate` | Ardoise neutre (`#475569` / `#64748B`) | Minimalisme, luxe sobre, utilitaires |
| `green` | Vert forêt (`#16A34A` / `#22C55E`) | Nature, santé, développement durable |
| `red` | Rouge rubis (`#DC2626` / `#EF4444`) | Urgences, sport, fintech |
| `cyan` | Cyber cyan (`#0891B2` / `#00D9FF`) | Tech, IA, signature Rashwright |
| `custom` | Personnalisé | Votre propre charte graphique générée dynamiquement |

---

## 🛠 Diagnostic (`rs-ui doctor`)

Lance un diagnostic complet de l'environnement, des versions natives et des Skills IA :

```bash
rs-ui doctor
```

```text
  Rashwright UI Mobile — rs-ui doctor

  ✔ package.json
  ✔ Expo SDK 58
  ✔ Package manager: bun
  ✔ TypeScript
  ✔ rashwright-ui.json
  ✔ Dossier composants: src/components/ui
  ✔ Composants installés: 12 (tous à jour)
  ✔ Skill IA Global (skills/rs-ui/SKILL.md)
  ✔ Skills IA Composants: 12/12 synchronisés
  ✔ react-native-reanimated — v~4.3.2
  ✔ react-native-gesture-handler — v~2.31.2
  ✔ react-native-safe-area-context — v~5.7.0
  ✔ expo-blur — v~56.0.5
  ✔ expo-linear-gradient — v~56.0.0

  Tout est en ordre!
```

---

## 📊 Matrice de compatibilité Expo SDK

| Expo SDK | Statut |
|---|---|
| SDK 54 | 🟢 Tested |
| SDK 55 | 🟢 Tested |
| SDK 56 | 🟢 Tested |
| SDK 57 | 🟢 Tested |
| SDK 58 | 🟢 Tested |
| SDK 59 | 🟡 Experimental (Matrice prête) |

---

## 🏗 Architecture & Monorepo

```text
Dépôt GitHub rashwright-ui             npm registry (public)
           │                                  │
           ├── packages/cli/       ──────▶   @rashwright/cli@0.3.0
           │    └── commandes: rs-ui / rs-ui-reset
           │
           └── packages/ui-mobile/ ──────▶   @rashwright/ui-mobile@0.3.0
                ├── components/ui/              (61 composants sources)
                ├── skills/                     (61 skills + modules core)
                ├── registry/                   (métadonnées & matrices SDK 54 à 59)
                ├── liquid/ primitives          (moteur Liquid Glass)
                └── lib/upload/                 (moteur d'upload inliné)
```

Pour la documentation dédiée aux contributeurs, consulter **[CONTRIBUTOR.md](./CONTRIBUTOR.md)**.

---

## 📄 Licence

Licence MIT · Rashwright office. Tous droits réservés.
