# VALIDATION.md — Checklist Release Rashwright UI Mobile v0.1.1

Version cible : **@rashwright/ui-mobile@0.1.1** · **@rashwright/cli@0.1.1**
Dernière validation : 2026-10-02 (v0.1.1 — Corrections bugs errors.md)

---

## 1. Checklist TypeScript strict (OBLIGATOIRE avant publication)

```bash
# Global (CLI + UI)
bun run check-types                       # attendu : exit code 0

# Ciblé, utile quand seul un package a changé :
cd packages/cli && bunx tsc --noEmit
cd packages/ui-mobile && bunx tsc --noEmit
```

Statut v0.1.1 (2026-10-02) : ✅ **PASS** (exit 0, 0 erreur)

### 1b. Zero `any` — `ambient.d.ts` & `require()` ESM

```bash
grep -c "any" packages/ui-mobile/types/ambient.d.ts   # attendu : 0
grep -r "require(" packages/cli/src                   # attendu : 0 match
```

Statut v0.1.1 : ✅ **PASS** (0 any dans ambient · 0 require dans CLI src ESM)

*Note : ~30 occurrences `any` existent encore dans 14 composants (badge, carousel, chip, drawer, button, icon, flat-list, actions-grid...) dans le code ORIGINAL. Ces any étaient hors scope de errors.md v0.1.x et font l'objet d'une release 0.2.0 planifiée.*

---

## 2. Registry (OBLIGATOIRE)

```bash
bun run validate-registry
# attendu : ✅ validate-registry : 0 erreur — 55 composants, 55 sources
```

Contrôles effectués (script `scripts/validate-registry.ts`, 8 checks) :

| Check | Description | Statut |
|---|---|---|
| I-1 | Nombre de composants = 55 + registry/index cohérent | ✅ |
| I-2 | index.categories couvre TOUS les composants (0 orphelin · 0 doublon) | ✅ |
| F-1 | Chaque `files[]` dans un JSON → fichier existe sur disque | ✅ |
| F-2 | Chaque composant .tsx (hors liquid · hors text/view) → JSON correspondant existe | ✅ |
| R-1 | Chaque `requiresComponents[]` → composant existe dans registry | ✅ |
| R-2 | requiresComponents transitifs → pas de cycle détecté | ✅ |
| C-1 | `expoDependencies[]` ne contient que des pkg autorisés (EXPO_PKGS, VECTOR, RN_PKGS) | ✅ |
| C-2 | Tous les JSON composants ont `"version": "1.0.0"` | ✅ |

Statut v0.1.0 : ✅ **PASS** (exit 0)

---

## 3. Build CLI + Smoke test (OBLIGATOIRE)

```bash
# Build :
bun run build:cli
# attendu :
# @rashwright/cli build: Bundled 50 modules in ~700ms
# @rashwright/cli build:   index.js  ~137 KB

# Contrôle 1 : Shebang UNIQUE
head -n 1 packages/cli/dist/index.js
# attendu : `#!/usr/bin/env node` (UNIQUE shebang, pas doublon)

# Contrôle 2 : --help
node packages/cli/dist/index.js --help
# attendu : exit 0 · 8 commandes : init, add, list, info, doctor, remove, update, help

# Contrôle 3 : --help init + add (pour les flags Objectifs A/B/D)
node packages/cli/dist/index.js init --help | Select-String "no-reset"    # attendu : 1 match (flag A.6 reset optionnel)
node packages/cli/dist/index.js add --help | Select-String "force"        # attendu : 1 match (B.4 --force)
node packages/cli/dist/index.js add --help | Select-String "non-interactive"   # attendu : 1 match (D alias)
```

Statut v0.1.0 : ✅ **PASS** (8 commandes · shebang · flags --no-reset, --force, --no-interactive/--non-interactive)

---

## 4. Objectifs errors.md (A/B/C/D) — Validation fonctionnelle

### A. Reset Expo dans init
- [x] `--no-reset` flag visible dans init --help
- [x] `resetExpoProject()` présent dans starter-generator
- [x] `writeBabelConfig()` avec reanimated plugin EN DERNIER (ordre = obligatoire métro)
- [x] `updateTsconfig()` écrit paths `@/*` + jsx `react-native`
- [x] `writeExpoRouterLayout()` produit `<ThemeProvider><Slot /></ThemeProvider>` (app/_layout.tsx)
- [x] index.tsx showcase + assets/primary.png copiés

### B. Filtrage add
- [x] `requestedComponents` vs `transitiveDeps` vs `missingTransitive` séparés
- [x] `--force` flag → overwrite forcément les fichiers déjà installés
- [x] transitifs vérifient `existsSync` FICHIER réel (pas config.components) — pas de faux positif

### C. Upload inliné
- [x] `packages/ui-mobile/lib/upload/` contient **8 fichiers** types, errors, upload-manager, providers (Cloudinary, Firebase, Vercel, Local, Mock) + barrel index
- [x] upload-image.tsx import `../../lib/upload` (plus @rashwright/upload)
- [x] upload-video.json `dependencies: []` (plus @rashwright/upload)
- [x] packages/ui-mobile/package.json `files[]: ["lib/**"]`
- [x] packages/cli/package.json dépend `@rashwright/ui-mobile: "^0.1.0"` → **PAS** `workspace:*`

### D. CLI add interactif checkbox @inquirer
- [x] `--no-interactive` flag pour CI
- [x] `--non-interactive` alias
- [x] Navigation ↑/↓ · Espace select · `a` toggle all · Entrée pour installer
- [x] Groupement par catégorie
- [x] Composants déjà installés dans `rashwright-ui.json` → checkbox disabled

Statut v0.1.1 : ✅ **A/B/C/D 100%**

---

## 5. Dry-run npm publish (Vérification pre-publish)

```bash
# @rashwright/ui-mobile PREMIER
cd packages/ui-mobile
npm publish --dry-run --access public 2>&1
# attendu : pas d'erreur · tarball ~100-200 KB · pas de fichier node_modules/ inclus

# Puis @rashwright/cli
cd ../../packages/cli
npm publish --dry-run --access public 2>&1
# attendu : idem · contient dist/index.js (137 KB)
```

Statut v0.1.1 : ✅ **PASS** (dry-run ui-mobile: 174 fichiers, cli: 3 fichiers, 0 warning).

---

## 6. Liste des `any` restants détectés (hors scope errors.md v0.1.0)

Ces items sont basculés en **TODO v0.2.0** :

| Fichier | Occurrences `any` |
|---|---|
| `packages/ui-mobile/components/ui/carousel.tsx` | 4 (data: any[], renderItem, onItemPress, autoPlayTimer) |
| `packages/ui-mobile/components/ui/badge.tsx` | 4 (cloneElement ReactElement<any>, icon.props as any, textStyle as any) |
| `packages/ui-mobile/components/ui/chip.tsx` | 3 (cloneElement · icon.props as any) |
| `packages/ui-mobile/components/ui/icon-button.tsx` | 4 (forwardRef<any>, cloneElement, icon.props as any size+color) |
| `packages/ui-mobile/components/ui/floating-action-button.tsx` | 3 |
| `packages/ui-mobile/components/ui/icon.tsx` | 3 (name as any) |
| `packages/ui-mobile/components/ui/drawer.tsx` | 2 (forwardRef<any>, style?: any) |
| `packages/ui-mobile/components/ui/actions-grid.tsx` | 1 (action.icon as any) |
| `packages/ui-mobile/components/ui/activity-indicator.tsx` | 1 (forwardRef<any>) |
| `packages/ui-mobile/components/ui/button.tsx` | 1 (forwardRef<any>) |
| `packages/ui-mobile/components/ui/dropdown-menu.tsx` | 1 |
| `packages/ui-mobile/components/ui/empty-state.tsx` | 1 |
| `packages/ui-mobile/components/ui/error-state.tsx` | 1 |
| `packages/ui-mobile/components/ui/flat-list.tsx` | 1 |
| `packages/ui-mobile/hooks/useScrollAwareTabBar.ts` | 3 (event: any callbacks onScroll onEndDrag onMomentumEnd) |

Total estimé : **~30 occurrences dans 14 fichiers tsx + 1 hook.**

Toutes sont mécaniques (remplacer par `forwardRef<unknown, Props>` + cast explicite `as unknown as TargetType`, ou generics `<T>`). À traiter en 0.2.0.

---

**FIN VALIDATION.md.**
