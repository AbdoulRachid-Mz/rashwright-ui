# CONTRIBUTOR.md — Guide développeur-contributeur Rashwright UI Mobile

> **Public cible** : développeur·se qui souhaite :
> - cloner le dépôt source ;
> - corriger un bug ;
> - ajouter un composant ;
> - publier une mise à jour.
>
> **Guide utilisateur** (intégrer Rashwright dans ton app) → [README.md](./README.md).

---

## 1. Monorepo Bun Workspaces

1 dépôt GitHub (`AbdoulRachid-Mz/rashwright-ui`) = **2 packages npm publiés** :

| Package npm | But | Installé par user ? |
|---|---|---|
| `@rashwright/ui-mobile` | Registry + code source composants + Liquid primitives + upload inline | Jamais directement → le CLI dépend de ce package, l'utilise comme fournisseur de code. |
| `@rashwright/cli` | Commande `rs-ui` : init, add, list, info, doctor, remove, update | OUI, globalement ou par projet. |

Règle impérative : **on publie TOUJOURS ui-mobile PUIS cli.**

---

## 2. Démarrer en 3 commandes

```bash
git clone https://github.com/AbdoulRachid-Mz/rashwright-ui.git
cd rashwright-ui
bun install
```

Quick-Start détaillé (scripts, ajouter composant, publication manuelle + CI, règle zero-any) → **[Quick-Start.md](./Quick-Start.md)**.

---

## 3. Structure des 2 packages

### 3.1 `packages/ui-mobile/` (Registry + Code composants)
```
components/ui/        → 55 composants tsx + liquid/ (8 primitives Liquid Glass)
constants/            → theme.ts + glass-theme.ts
contexts/             → ThemeProvider + TabBarProvider
hooks/                → use-device + useBackHandler + useScrollAwareTabBar
stores/               → theme-store (zustand)
theme/                → tokens colors, radius, spacing, shadow, glass, typography · presets (default emerald violet amber rose slate glass)
types/
  └── ambient.d.ts    → 🚩 ZÉRO `any`. Mock peerDeps pour ts strict (profile utilisateur).
registry/
  ├── index.json      → 55 composants, 10 catégories, 5 SDK
  ├── components/*.json (55)
  └── versions/expo-{54,55,56,57,58}.json
lib/upload/           → @rashwright/upload INLINÉ (8 fichiers, 5 providers : Cloudinary, Firebase Storage, Vercel Blob, Local, Mock + stub upload-manager)
skills/               → 10 SKILL.md composants
assets/               → primary.png · svg/primary.svg (logo Rashwright)
index.ts              → barrel theme/contexts/stores/hooks/ui barrel
README.md             → README npm dédié (utilisateur final)
package.json          → files[]: components/**, constants/**, ..., lib/**, index.ts, README.md
```

### 3.2 `packages/cli/` (Commande `rs-ui`)

```
src/index.ts              → Commander program, shebang L1 : #!/usr/bin/env node
src/commands/
  ├── init.ts             → rs-ui init (resetExpoProject + writeBabelConfig + updateTsconfig + writeExpoRouterLayout + setupFoundations + setupStarterComponents
  ├── add.ts              → rs-ui add (checkbox interactif @inquirer · Objectif B + D)
  ├── list.ts info.ts doctor.ts remove.ts update.ts
src/core/
  ├── paths.ts            → 🧭 Central : PROD require.resolve("@rashwright/ui-mobile/package.json") + fallback DEV workspace bun
  ├── registry.ts         → load registry entries (export RegistryEntry + ResolvedComponent — CLI TS strict)
  ├── file-manager.ts     → P0-1: préserve liquid/ sous-dossier
  ├── starter-generator.ts→ setupFoundations + setupCoreUi + walkCopy upload/inline
  ├── dependency-resolver.ts · expo-detector.ts · project-detector.ts · package-manager.ts · config-manager.ts
dist/index.js             → ESM bundle bun build 50 modules 137 KB · prepublishOnly build + check-types
README.md                 → README npm CLI (guide utilisateur)
package.json              → "@rashwright/ui-mobile": "^0.1.1" (PAS workspace:*)
```

---

## 4. Workflow typique d'une modification

1. **Modifications code**.
2. `bun run sync-registry` **si tu as changé des imports dans composant .tsx** (met à jour requiresComponents + expoDependencies + supportsGlass + nativeRebuildRequired sur les 55 JSON).
3. `bun run validate-registry` — doit sortir `0 erreur`.
4. `bun run check-types` — doit sortir `exit 0`.
5. `bun run build:cli` — smoke test : `node packages/cli/dist/index.js --help`.

---

## 5. Règle d'or : interdiction catégorique du type `any`

Profil utilisateur catégorique. **Pas d'exception** :

| Cas | Bon remplacement |
|---|---|
| `forwardRef<any, Props>` | `forwardRef<unknown, Props>` |
| `(e: any) => ...` | `(e: unknown) => (e as TargetType).xxx` |
| `export const X: (cfg: any) => any` | Generics : `export const X: <T>(cfg: T) => SomeReturnType<T>` OU `(cfg: unknown) => unknown` avec signatures précises. |
| `icon.props as any` | `(icon as React.ReactElement<{ size?: number; color?: string }>).props.color ?? iconColor` + type guards. |
| Ambient peerDeps mockés (pas installés localement) | Helper `PermissiveComponentProps = { children?: unknown; style?: unknown; ref?: unknown; [k: string]: unknown }` — appliqué sur Animated.View / BlurView / VideoView / GestureHandlerRootView. |

Fichiers critiques où `any` est impossible à la moindre régression :
- `packages/ui-mobile/types/ambient.d.ts` → grep doit toujours renvoyer 0.
- `packages/cli/src/**/*.ts` → `require(` doit toujours renvoyer 0 (ESM strict).
- Tout fichier `.ts/.tsx` touché dans la PR/correction courante.

---

## 6. Comment ajouter un composant au catalogue (7 étapes)

Détaillé dans [Quick-Start.md §5](./Quick-Start.md#5-ajouter-un-composant-au-registry-nouveau-composant) :
1. Code le composant .tsx → imports relatifs, jamais @/.
2. Crée JSON → `registry/components/my-component.json` (version 1.0.0, category, files, expoDeps, requires, supportsGlass...).
3. Màj `registry/index.json` → ajoute composant dans catégorie.
4. Crée SKILL.md.
5. `bun run sync-registry` + `bun run validate-registry`.
6. Rebuild CLI : `bun run build:cli` + `bun run cli info my-component`.
7. `bun run check-types` → commit.

---

## 7. Debug / diagnostic erreurs TS fréquentes après changement ambient

### Erreurs fréquentes (histoire connue)
| Erreur TS | Cause | Fix |
|---|---|---|
| "This expression is not callable. Type '{}' has no call signatures." sur `props.onLoad(e)` | L'index signature `[k: string]: unknown` d'`ImageProps` masque le type callback. | Soit retirer l'index signature de l'interface et list explicitement toutes les props (plus lourd), soit cast côté consommateur : `(props.onLoad as ((e: unknown) => void) | undefined)?.(e)`. |
| "Referenced directly or indirectly in its own type annotation" sur typeof player dans forwardRef/computed | TypeScript inférence circulaire. | Remplace `typeof player` par `ReturnType<typeof useVideoPlayer>` — force la résolution avant inférence du paramètre casté. |
| animated.style array VS StyleProp<X> | AnimatedStyle + static style fusion array dans JSX → TS refuse union `AnimatedStyle & {opacity: SharedValue<number>}`. | Cast intermédiaire : `const combinedStyle = [a, b, c] as unknown;` → puis `style={combinedStyle as StyleProp<ImageStyle>}`. Permet de respecter zero-any. |
| "`unknown` is not assignable to `boolean`" dans setup player.loop | `loop` optionnel vient de prop boolean|undefined → `VideoPlayer.loop = boolean` strict. | Enrober : `videoPlayer.loop = Boolean(loop)`. |
| Build CLI bun ne trouve pas require.resolve("@rashwright/ui-mobile/package") en mode workspace (DEV) | PROD pas activé : `createRequire.resolve` échoue quand package pas installé local. | `core/paths.ts` : `try/catch` → fallback `join(PACKAGE_ROOT, "..", "ui-mobile")` (monorepo bun). Toujours tester `node dist/index.js list --json` après build. |

---

## 8. Procédure de publication (release)

**Voir** :
- [Quick-Start.md §7](./Quick-Start.md#7-procédure-de-publication-manuelle-recommandée-v0x) (manuel / CI)
- [VALIDATION.md §5](./VALIDATION.md#5-dry-run-npm-publish-vérification-pre-publish) (dry-run pre-publish)

**Règle ordre** :
1. Publier `@rashwright/ui-mobile` sur npm **D'ABORD**.
2. Attendre **2-5 min** le CDN npm.
3. Puis publier `@rashwright/cli`.

CI/CD disponible : `.github/workflows/publish.yml` (trigger : `git push origin main --follow-tags` avec tag `vX.Y.Z`).

---

**FIN CONTRIBUTOR.md.**
