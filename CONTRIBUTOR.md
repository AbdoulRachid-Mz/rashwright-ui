# CONTRIBUTOR.md — Guide développeur-contributeur Rashwright UI Mobile (v1.6.0+)

> **Public cible** : développeur·se qui souhaite :
> - cloner le dépôt source ;
> - corriger un bug ou optimiser les performances ;
> - ajouter un nouveau composant atomique, un widget modulaire ou un template complet ;
> - faire évoluer le moteur Liquid Glass ou les primitives headless ;
> - exécuter la suite de tests unitaires Vitest (245 tests, 51 suites) ;
> - publier une version sur npm.
>
> **Guide utilisateur** (intégrer Rashwright dans une application Expo) → [README.md](./README.md).

---

## 1. Monorepo Bun Workspaces

Le dépôt GitHub (`AbdoulRachid-Mz/rashwright-ui`) gère **2 packages npm complémentaires** :

| Package npm | But | Installé par l'utilisateur final ? |
|---|---|---|
| `@rashwright/ui-mobile` | Registry central + code source des 79 composants + 6 widgets modulaires + 2 showcases + 10 templates autonomes + 8 primitives Liquid + moteur d'upload | Jamais directement → `@rashwright/cli` l'utilise comme source de distribution de code. |
| `@rashwright/cli` | Commande `rs-ui` : `init`, `add`, `widget`, `template`, `list`, `info`, `doctor`, `fix`, `showcase`, `diff`, `remove`, `update`, `upgrade`, `reset`, `mcp` | OUI, globalement (`bun add -g`) ou ponctuellement via `npx`/`bunx`. |

⚠️ **Règle impérative de publication : on publie TOUJOURS `@rashwright/ui-mobile` EN PREMIER, puis `@rashwright/cli` après propagation CDN.**

---

## 2. Démarrage rapide en 3 commandes

```bash
git clone https://github.com/AbdoulRachid-Mz/rashwright-ui.git
cd rashwright-ui
bun install
```

---

## 3. Structure détaillée du monorepo

### 3.1 `packages/ui-mobile/` (Registry, Composants & Widgets)
```text
components/ui/        → 79 composants tsx + liquid/ (8 primitives Liquid Glass)
  ├── button.tsx · card.tsx · modal.tsx · tabs.tsx · ...
  ├── like-button.tsx · password-strength.tsx · copy-button.tsx · ...
  └── liquid/         → surface, pressable, highlight, border, glow, blob, shadow, types
widgets/              → 🆕 6 Widgets Modulaires Autonomes
  ├── metric/         ├── progress/        ├── quick-actions/
  ├── chart/          ├── activity-feed/   ├── finance/
  └── index.ts        (chacun avec widget.json, types.ts, <id>-widget.tsx, index.ts)
showcases/            → 🆕 2 Tableaux de bord d'intégration
  ├── finance-dashboard-showcase.tsx
  └── analytics-dashboard-showcase.tsx
templates/            → 10 templates autonomes complets
  ├── minimal/        ├── auth/            ├── onboarding/
  ├── dashboard/      ├── commerce/        ├── settings/
  ├── showcase/       ├── chat/            ├── finance/
  └── social/         (chacun avec template.json, composant principal, types.ts, components/)
constants/            → theme.ts + glass-theme.ts
contexts/             → ThemeProvider + TabBarProvider
hooks/                → use-device + useBackHandler + useScrollAwareTabBar
stores/               → theme-store (zustand v5)
theme/                → tokens & presets (default, emerald, violet, amber, rose, slate, green, red, cyan, glass)
types/                → ambient.d.ts (ZÉRO any)
registry/
  ├── index.json      → 79 composants, 10 catégories, SDK 54 à 58
  ├── components/*.json (79 JSON individuels)
  └── versions/expo-{54,55,56,57,58}.json
lib/upload/           → Moteur upload inliné (Cloudinary, Firebase, Vercel Blob, Local, Mock)
skills/               → 79 skills composants + 6 skills widgets + skills core (liquid, upload, theme, cli)
assets/               → primary.png · svg/primary.svg (logo officiel)
```

### 3.2 `packages/cli/` (CLI `rs-ui`)
```text
src/index.ts          → Commander program (shebang unique #!/usr/bin/env node)
src/commands/
  ├── init.ts         → rs-ui init (installation ordonnée A→B→C, expo-router, web deps)
  ├── add.ts          → rs-ui add (composants, templates via -t, widgets via -w)
  ├── widget.ts       → rs-ui widget (list, info, add, remove)
  ├── template.ts     → rs-ui template (list, info, add, remove)
  ├── fix.ts          → rs-ui fix (auto-remédiation de l'environnement)
  ├── showcase.ts     → rs-ui showcase (storybook mobile et web)
  ├── upgrade.ts      → rs-ui upgrade (3-Way Merge différentiel)
  ├── mcp.ts          → rs-ui mcp (serveur stdio IA Model Context Protocol)
  ├── list.ts, info.ts, doctor.ts, remove.ts, update.ts, reset.ts, diff.ts, search.ts
src/core/
  ├── widgets-registry.ts    → Registre et découverte des widgets modulaires
  ├── templates-manager.ts   → Orchestration des templates modulaires
  ├── templates-registry.ts  → Découverte et validation des templates
  ├── lock-manager.ts        → rashwright.lock avec SHA-256 (components, widgets, templates)
  ├── package-manager.ts     → Exécution bun, npm (--legacy-peer-deps), yarn, pnpm
  ├── nativewind-manager.ts  → Gestionnaire NativeWind v4 et v5
  ├── expo-detector.ts       → Support SDK 54 à 58
  └── file-manager.ts, registry.ts, diff.ts, backup-manager.ts
tests/                → 51 suites de tests Vitest (245 tests unitaires)
dist/index.js         → ESM bundle autonome (~0.40 MB)
```

---

## 4. Commandes de développement & Quality Gate

```bash
# 🧪 Lancer la suite de tests unitaires Vitest (CLI)
bun run test

# 📊 Lancer les tests avec rapport de couverture de code
bun run test:coverage

# 🔎 Vérification des types TypeScript stricts (CLI + UI-Mobile)
bun run check-types

# 🔄 Synchroniser le registry avec les fichiers sources
bun run sync-registry

# ✅ Valider l'intégrité du registre (0 erreur requis)
bun run validate-registry

# 📱 Valider les 6 flows E2E Maestro
bun run validate-maestro

# 🏗️ Compiler le bundle CLI autonome
bun run build:cli

# 🚀 Exécuter l'ensemble du Quality Gate
bun run quality
```

---

## 5. Règle absolue de typage : Zéro `any`

Tout le code source TypeScript de Rashwright UI Mobile doit respecter la règle stricte : **aucun mot-clé `any` toléré**.
- Utiliser `unknown` combiné avec des type guards pour les payloads arbitraires.
- Typer les références avec `React.ElementRef<typeof Component>`.
- Typer les styles via `StyleProp<ViewStyle>` ou `StyleProp<TextStyle>`.

---

## 6. Procédure de publication (v1.6.0+)

```bash
# 1. Valider le Quality Gate complet
bun run quality

# 2. Publier @rashwright/ui-mobile
cd packages/ui-mobile
npm publish --access public

# 3. Publier @rashwright/cli (après propagation)
cd ../cli
npm publish --access public

# 4. Tag et release GitHub
git add -A
git commit -m "chore(release): v1.6.0"
git tag -a v1.6.0 -m "Release v1.6.0"
git push origin main --follow-tags
```

---

**Licence MIT · Rashwright office.**
