# CONTRIBUTOR.md — Guide développeur-contributeur Rashwright UI Mobile (v0.2.0)

> **Public cible** : développeur·se qui souhaite :
> - cloner le dépôt source ;
> - corriger un bug ou optimiser les performances ;
> - ajouter un nouveau composant ou faire évoluer le moteur Liquid Glass ;
> - exécuter la suite de tests unitaires Vitest ;
> - publier une version sur npm.
>
> **Guide utilisateur** (intégrer Rashwright dans une application Expo) → [README.md](./README.md).

---

## 1. Monorepo Bun Workspaces

Le dépôt GitHub (`AbdoulRachid-Mz/rashwright-ui`) gère **2 packages npm complémentaires** :

| Package npm | But | Installé par l'utilisateur final ? |
|---|---|---|
| `@rashwright/ui-mobile` | Registry central + code source des 61 composants + 8 primitives Liquid + moteur d'upload | Jamais directement → `@rashwright/cli` l'utilise comme source de distribution de code. |
| `@rashwright/cli` | Commande `rs-ui` : `init`, `add`, `list`, `info`, `doctor`, `remove`, `update` | OUI, globalement (`bun add -g`) ou ponctuellement via `npx`/`bunx`. |

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
  ├── accordion.tsx   → 🆕 v0.2.0
  ├── collapsible.tsx → 🆕 v0.2.0
  ├── data-table.tsx  → 🆕 v0.2.0
  ├── form.tsx        → 🆕 v0.2.0
  ├── otp-input.tsx   → 🆕 v0.2.0
  ├── rating.tsx      → 🆕 v0.2.0
  └── liquid/         → surface, pressable, highlight, border, glow, blob, shadow, types
constants/            → theme.ts + glass-theme.ts
contexts/             → ThemeProvider + TabBarProvider
hooks/                → use-device + useBackHandler + useScrollAwareTabBar
stores/               → theme-store (zustand v5)
theme/                → tokens & presets (default, emerald, violet, amber, rose, slate, glass)
types/
  └── ambient.d.ts    → 🚩 ZÉRO `any`. Mock peerDeps strict pour TS.
registry/
  ├── index.json      → 61 composants, 10 catégories, SDK 54 à 59
  ├── components/*.json (61 JSON individuels)
  └── versions/expo-{54,55,56,57,58,59}.json
lib/upload/           → Moteur upload inliné (Cloudinary, Firebase, Vercel Blob, Local, Mock)
skills/               → Guides IA par composant
assets/               → primary.png · svg/primary.svg (logo officiel)
index.ts              → Barrel principal
package.json          → version 0.2.0, peerDependencies & peerDependenciesMeta
```

### 3.2 `packages/cli/` (CLI `rs-ui`)
```
src/index.ts          → Commander program (shebang unique #!/usr/bin/env node)
src/commands/
  ├── init.ts         → rs-ui init (reset Expo complet, tsconfig baseUrl, foundations, template)
  ├── add.ts          → rs-ui add (mode interactif, support --diff, résolution transitive)
  ├── list.ts         → rs-ui list (affichage enrichi par catégorie, mode interactif -i)
  ├── info.ts         → Détails techniques du composant
  ├── doctor.ts       → Diagnostic environnement + détection des composants obsolètes
  ├── remove.ts       → Désinstallation sécurisée
  └── update.ts       → Diff hash SHA-256 + réinstallation automatique expoDependencies
src/core/
  ├── diff.ts         → 🆕 Algorithme de diff LCS sans dépendance externe
  ├── remote-registry.ts → 🆕 Cache local 24h (~/.rs-ui/cache) + fallback CDN unpkg
  ├── paths.ts        → Résolution PROD require.resolve vs DEV workspace fallback
  ├── registry.ts     → Chargement et validation du registry
  ├── starter-generator.ts → Nettoyage template, setupFoundations, validation SDK post-create
  ├── dependency-resolver.ts → Détection conflits versions Expo
  ├── expo-detector.ts → Prise en charge des SDK 54, 55, 56, 57, 58, 59
  ├── config-manager.ts → Lockfile { version, installedAt } avec rétrocompatibilité
  ├── file-manager.ts → Préservation arborescence sous-dossiers liquid/
  └── package-manager.ts → Exécution bun, npm, yarn, pnpm
tests/                → 🆕 10 suites de tests Vitest (55 tests unitaires)
dist/index.js         → ESM bundle autonome
package.json          → version 0.2.0, dépendance "@rashwright/ui-mobile": "^0.2.0"
```

---

## 4. Commandes de développement & Quality Gate

Le monorepo intègre une chaîne de validation complète accessible à la racine :

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
1. `validate-registry`
2. `check-types`
3. `test` (Vitest)
4. `build:cli`
5. `smoke:all` (vérification version 0.2.0, ESM strict, shebang unique, semver réelle)

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
| Peer dependencies mockées | `PermissiveComponentProps` avec indexation typée |

---

## 6. Procédure pour ajouter un nouveau composant

1. **Créer le fichier TSX** dans `packages/ui-mobile/components/ui/<nom>.tsx` en utilisant `useTheme()` et des imports relatifs.
2. **Créer la définition JSON** dans `packages/ui-mobile/registry/components/<nom>.json`.
3. **Ajouter le composant** dans la catégorie appropriée de `packages/ui-mobile/registry/index.json`.
4. **Exporter le composant** dans `packages/ui-mobile/components/ui/index.ts` et dans `COMPONENT_EXPORTS_MAP` (`starter-generator.ts`).
5. **Créer le fichier SKILL.md** dans `packages/ui-mobile/skills/<nom>/SKILL.md`.
6. **Lancer la synchronisation et la validation** :
   ```bash
   bun run sync-registry
   bun run validate-registry
   ```
7. **Ajouter un test unitaire** dans `packages/cli/tests/` si le composant introduit une nouvelle logique de résolution.
8. **Vérifier le Quality Gate** :
   ```bash
   bun run quality
   ```

---

## 7. Procédure de publication (Release v0.2.0)

1. **Vérifier le Quality Gate** :
   ```bash
   bun run quality   # Doit terminer avec le code 0
   ```
2. **Tester le dry-run npm** :
   ```bash
   bun run dry-run   # Simule la publication de ui-mobile puis cli
   ```
3. **Publier sur npm** :
   - Publier `@rashwright/ui-mobile` :
     ```bash
     cd packages/ui-mobile
     npm publish --access public
     ```
   - Attendre 2 à 5 minutes la réplication CDN.
   - Publier `@rashwright/cli` :
     ```bash
     cd ../../packages/cli
     npm publish --access public
     ```
4. **Créer le tag git et pusher** :
   ```bash
   git tag -a v0.2.0 -m "Release v0.2.0: 61 components, SDK 59, Vitest suite, Remote Registry"
   git push origin main --follow-tags
   ```

---

**Licence MIT · Rashwright office.**
