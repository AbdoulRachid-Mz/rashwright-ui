# CONTRIBUTOR.md — Guide développeur-contributeur Rashwright UI Mobile (v0.7.3+)

> **Public cible** : développeur·se qui souhaite :
> - cloner le dépôt source ;
> - corriger un bug ou optimiser les performances ;
> - ajouter un nouveau composant, un template ou faire évoluer le moteur Liquid Glass ;
> - exécuter la suite de tests unitaires Vitest (155 tests, 32 suites) ;
> - publier une version sur npm.
>
> **Guide utilisateur** (intégrer Rashwright dans une application Expo) → [README.md](./README.md).

---

## 1. Monorepo Bun Workspaces

Le dépôt GitHub (`AbdoulRachid-Mz/rashwright-ui`) gère **2 packages npm complémentaires** :

| Package npm | But | Installé par l'utilisateur final ? |
|---|---|---|
| `@rashwright/ui-mobile` | Registry central + code source des 61 composants + 7 templates autonomes + 8 primitives Liquid + moteur d'upload | Jamais directement → `@rashwright/cli` l'utilise comme source de distribution de code. |
| `@rashwright/cli` | Commande `rs-ui` : `init`, `add`, `list`, `info`, `doctor`, `backup`, `restore`, `diff`, `remove`, `update`, `reset`, `create` | OUI, globalement (`bun add -g`) ou ponctuellement via `npx`/`bunx`. |

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

### 3.1 `packages/ui-mobile/` (Registry & Composants)
```
components/ui/        → 61 composants tsx + liquid/ (8 primitives Liquid Glass)
  ├── accordion.tsx   ├── collapsible.tsx  ├── data-table.tsx
  ├── form.tsx        ├── otp-input.tsx    ├── rating.tsx
  ├── tabs.tsx        → Navigation par onglets (layout maîtrisé, ARIA, scrollable)
  └── liquid/         → surface, pressable, highlight, border, glow, blob, shadow, types
templates/            → 7 templates autonomes complets
  ├── minimal/        ├── auth/            ├── onboarding/
  ├── dashboard/      ├── commerce/        ├── settings/
  └── showcase/       (chacun avec template.json, composant principal, types.ts, components/)
constants/            → theme.ts + glass-theme.ts
contexts/             → ThemeProvider + TabBarProvider
hooks/                → use-device + useBackHandler + useScrollAwareTabBar
stores/               → theme-store (zustand v5)
theme/                → tokens & presets (default, emerald, violet, amber, rose, slate, green, red, cyan, glass)
types/                → ambient.d.ts (ZÉRO any)
registry/
  ├── index.json      → 61 composants, 10 catégories, SDK 54 à 59
  ├── components/*.json (61 JSON individuels)
  └── versions/expo-{54,55,56,57,58,59}.json
lib/upload/           → Moteur upload inliné (Cloudinary, Firebase, Vercel Blob, Local, Mock)
skills/               → 61 guides IA par composant + skills/rs-ui/SKILL.md (Skill Global)
assets/               → primary.png · svg/primary.svg (logo officiel)
```

### 3.2 `packages/cli/` (CLI `rs-ui`)
```
src/index.ts          → Commander program (shebang unique #!/usr/bin/env node)
src/commands/
  ├── init.ts         → rs-ui init (installation ordonnée A→B→C, expo-router, web deps)
  ├── add.ts          → rs-ui add (composants et templates via -t / --template)
  ├── list.ts         → rs-ui list (-i interactif, --templates)
  ├── info.ts, doctor.ts, remove.ts, update.ts, reset.ts, backup.ts, restore.ts, create.ts
src/core/
  ├── templates-manager.ts   → Orchestration des templates modulaires
  ├── templates-registry.ts  → Découverte et validation des templates
  ├── lock-manager.ts        → rashwright-ui.lock avec SHA-256 (components & templates)
  ├── package-manager.ts     → Exécution bun, npm, yarn, pnpm et installation ordonnée
  ├── expo-detector.ts       → Support SDK 54 à 59
  └── file-manager.ts, registry.ts, diff.ts, backup-manager.ts
tests/                → 32 suites de tests Vitest (155 tests unitaires)
dist/index.js         → ESM bundle autonome
```

---

## 4. Commandes de développement & Quality Gate

```bash
# 🧪 Lancer la suite de tests unitaires Vitest (CLI)
bun run test

# 📊 Lancer les tests avec rapport de couverture de code
bun run test:coverage

# 🔎 Vérification des types TypeScript (CLI + UI-Mobile)
bun run check-types

# 🔄 Synchroniser le registry avec les fichiers sources
bun run sync-registry

# ✅ Valider l'intégrité du registry (61 composants)
bun run validate-registry

# 📦 Compiler le CLI vers packages/cli/dist/index.js
bun run build:cli

# 🚀 Quality Gate complet (exécuté avant toute publication)
bun run quality
```

La commande `bun run quality` exécute successivement :
1. `validate-registry` (0 anomalie sur les 61 composants)
2. `check-types` (0 erreur TypeScript strict)
3. `test` (155 tests Vitest passés)
4. `build:cli` (bundle ESM autonome)
5. `smoke:all` (vérification version, ESM strict, shebang unique, semver réelle)

---

## 5. Règle absolue : tolérance zéro pour le type `any`

Tout contributeur doit respecter un typage TypeScript strict :

| Cas rencontré | Solution appliquée |
|---|---|
| `forwardRef<any, Props>` | `React.ElementRef<typeof X>` ou `unknown` ciblé |
| `(e: any) => void` | `(e: unknown) => ...` avec narrowing explicite |
| `cloneElement(child as any, ...)` | `ReactElement<{ color?: string; size?: number }>` |
| `style?: any` | `StyleProp<ViewStyle>` ou `StyleProp<TextStyle>` |
| `catch (err: any)` | `catch (err: unknown)` suivi de `if (err instanceof Error)` |
| `onValueChange` | Handler optionnel `(value: string) => void` avec support du mode non contrôlé |

---

## 6. Procédure pour ajouter un nouveau composant

1. **Créer le fichier TSX** dans `packages/ui-mobile/components/ui/<nom>.tsx` en respectant l'accessibilité vocale (`accessibilityRole`, `accessibilityState`).
2. **Créer la définition JSON** dans `packages/ui-mobile/registry/components/<nom>.json`.
3. **Ajouter le composant** dans la catégorie appropriée de `packages/ui-mobile/registry/index.json`.
4. **Exporter le composant** dans `packages/ui-mobile/components/ui/index.ts` et dans `COMPONENT_EXPORTS_MAP` (`starter-generator.ts`).
5. **Créer le fichier SKILL.md** dans `packages/ui-mobile/skills/<nom>/SKILL.md` avec un exemple complet et fonctionnel.
6. **Lancer la synchronisation et la validation** :
   ```bash
   bun run sync-registry
   bun run validate-registry
   ```
7. **Ajouter un test unitaire** dans `packages/cli/tests/`.
8. **Vérifier le Quality Gate** :
   ```bash
   bun run quality
   ```

---

## 7. Procédure de publication sur npm

1. **Vérifier le Quality Gate** : `bun run quality` (100% vert, exit code 0).
2. **Tester le dry-run** : `bun run dry-run`.
3. **Publier `@rashwright/ui-mobile`** avec OTP :
   ```bash
   cd packages/ui-mobile
   npm publish --access public --otp=XXXXXX
   ```
4. **Attendre 2 à 5 minutes la réplication CDN.**
5. **Publier `@rashwright/cli`** avec OTP :
   ```bash
   cd ../../packages/cli
   npm publish --access public --otp=XXXXXX
   ```
6. **Créer le tag git et pusher** :
   ```bash
   git tag -a v0.7.3 -m "Release v0.7.3"
   git push origin main --follow-tags
   ```
