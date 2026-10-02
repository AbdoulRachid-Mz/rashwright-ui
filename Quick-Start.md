# Quick-Start — Rashwright UI Mobile Workspace (Contributeur)

**⚠️ Pour le guide utilisateur (intégrer Rashwright dans ton app Expo), lire le README npm de `@rashwright/cli`.**

**Ce Quick-Start est pour les développeurs qui veulent : modifier le code source du CLI ou des composants, ajouter un composant au Registry, publier une mise à jour.**

---

## 1. Prérequis workspace

| Outil | Version minimale |
|---|---|
| Bun | >= 1.4.2 (packageManager déclaré dans racine package.json) |
| Node.js | >= 20.11.0 (pour build CLI ESM cible Node) |
| Git | Récent |

## 2. Cloner + installer

```bash
git clone https://github.com/AbdoulRachid-Mz/rashwright-ui.git
cd rashwright-ui
bun install   # ← Installe les deps racine + packages/* via Bun workspaces
```

## 3. Scripts disponibles (workspace racine)

```bash
# --- Qualité / type checking ---

# 🔎 Vérifications TypeScript strict (CLI + UI)
bun run check-types            # exit 0 attendu (lance check-types:cli PUIS check-types:ui)

# --- Registry ---
bun run sync-registry          # Met à jour requiresComponents, expoDependencies, optionalExpoDependencies, supportsGlass, nativeRebuildRequired sur TOUS les JSON (code source -> JSON). Ne touche JAMAIS les autres champs (name, description, category, files, version, platforms).
bun run validate-registry      # 8 contrôles : F-1 F-2 R-1 R-2 I-1 I-2 C-1 + C-2 (55 JSON existent, 55 sources existent, index.categories couvrent tout, expoDeps autorisés, version fixe "1.0.0" dans JSON composants)

# --- CLI ---
bun run build:cli              # Compile CLI → packages/cli/dist/index.js (ESM, shebang #!/usr/bin/env node)
bun run dev:cli                # Watch mode (rebuild auto)
bun run cli --help             # Exécuter depuis source (bun run packages/cli/src/index.ts)
bun run cli list --json        # Nombre de composants à jour
bun run cli add button --dry-run  # Simulation (dry-run: aucun fichier touché)

# --- Par package (utile pour débogage ciblé) ---
cd packages/cli && bun run build
cd packages/cli && bun run check-types
cd packages/ui-mobile && bun run check-types
```

---

## 4. `tsconfig` — Mode composite SANS references

Pour éviter TS6304 / TS6306 ("Composite projects may not disable declaration emit" etc.) : **racine n'utilise PAS `references`.** Chaque package est indépendant.

- `tsconfig.base.json` → Options strictes partagées : `strict: true`, `noImplicitAny`, `skipLibCheck`, `jsx: react-native`, etc.
- `tsconfig.json` (racine) → `include: ["scripts/**"]` — utile pour éditer sync/validate registry.
- `packages/cli/tsconfig.json` → noEmit, `include: ["src/**/*"]`, hérite base.
- `packages/ui-mobile/tsconfig.json` → noEmit, `include: ["**/*"]` (components, registry, skills, types, lib, constants, contexts, hooks, stores, theme, assets, index.ts).

---

## 5. Ajouter un composant au Registry (nouveau composant)

Étape par étape (7 étapes) :

1. **Composant source** → `packages/ui-mobile/components/ui/my-component.tsx`
   - Toujours `useTheme()` pour les couleurs (jamais codé en dur).
   - Pour un import interne : toujours **relatifs** (PAS `@/`). Exemple: `import { useTheme } from "../../contexts/theme-context";`

2. **JSON registry** → `packages/ui-mobile/registry/components/my-component.json`.
   Modèle **Obligatoire** :
   ```json
   {
     "name": "my-component",
     "version": "1.0.0",
     "description": "Un composant qui...",
     "category": "Basic",
     "files": ["components/ui/my-component.tsx"],
     "dependencies": [],
     "expoDependencies": ["@expo/vector-icons"],
     "optionalExpoDependencies": ["expo-haptics"],
     "requiresComponents": ["text"],
     "providers": ["ThemeProvider"],
     "supportsGlass": true,
     "platforms": ["ios", "android", "web"],
     "nativeRebuildRequired": false
   }
   ```

3. **Mettre à jour index.json** → ajouter my-component dans la catégorie correspondante dans `registry/index.json`.

4. **Créer SKILL.md** → `packages/ui-mobile/skills/my-component/SKILL.md`

5. **Sync + Validate Registry** (OBLIGATOIRE avant commit). Les deux scripts ne modifient QUE les 5 champs spécifiés.
   ```bash
   bun run sync-registry
   bun run validate-registry    # attendu: exit 0, 0 erreur
   ```

6. **Recompiler CLI + smoke-test**:
   ```bash
   bun run build:cli
   bun run cli info my-component   # attendu: affiche les infos correctes (deps, requires, providers, rebuild)
   ```

7. **Check TS global (OBLIGATOIRE avant commit)**:
   ```bash
   bun run check-types   # exit 0
   ```

---

## 6. Règle absolue : refus catégorique de `any` (profil utilisateur)

Règle **parmi les plus importantes** du dépôt. Toute variable doit avoir un type TS précis : inférence OK si non ambiguë, sinon `unknown` (avec `as` cast explicite), sinon generics.

```ts
// ❌ INTERDIT :
const f = (e: any) => ...;
forwardRef<any, Props>(...);
export const useX: (handlers: any) => any;

// ✅ Correct :
forwardRef<unknown, Props>(...);
(e: unknown) => (e as NativeSyntheticEvent<...>).nativeEvent;
export const useX: <T>(handlers: T) => SomeReturnType<T>;
```

Avant **CHAQUE commit**, exécuter :
```bash
bun run check-types          # global
# + optionnel :
cd packages/ui-mobile && bunx tsc --noEmit
cd packages/cli && bunx tsc --noEmit
```

---

## 7. Procédure de publication MANUELLE (recommandée v0.x)

Le CLI dépend de `@rashwright/ui-mobile`. L'ordre de publication est **impératif** :

### Phase 0 — Pré-publish (dans workspace)
```bash
# (A) Qualité
bun run check-types
bun run validate-registry

# (B) Build CLI
bun run build:cli
node packages/cli/dist/index.js --help   # liste commandes

# (C) Vérification version + dep pas workspace:*
cd packages/ui-mobile ; grep version package.json   # attendu: "0.1.1"
cd ../../packages/cli ; grep -i "ui-mobile" package.json
# Doit afficher: "@rashwright/ui-mobile": "^0.1.1"   (PAS workspace:*)
```

### Phase 1 — Publier `@rashwright/ui-mobile` (PREMIER)
```bash
cd packages/ui-mobile
npm whoami      # doit retourner ton username (sinon npm login)
npm publish --dry-run --access public      # simulation
npm publish --access public                 # publication RÉELLE
# → Attendre 2 à 5 minutes que npm CDN propage le package avant phase 2.
```

### Phase 2 — Publier `@rashwright/cli`
```bash
cd ../../packages/cli
npm publish --dry-run --access public      # Vérifie en particulier que dep "@rashwright/ui-mobile": "^0.1.0" existe bien
npm publish --access public                # Réel (prepublishOnly: build + check-types auto exécutés par npm)
```

### Phase 3 (optionnelle) — Post-publish contrôle
```bash
# Vérifier versions npm
npm view @rashwright/ui-mobile version
npm view @rashwright/cli version

# Smoke test dans dossier NEUF
cd ~ ; mkdir test-install-rs ; cd test-install-rs ; npm init -y
npm install @rashwright/cli --save-dev
node node_modules/@rashwright/cli/dist/index.js --help
```

---

## 8. Publication AUTOMATIQUE via GitHub Actions (push de tag `vX.Y.Z`)

Workflow activé : `.github/workflows/publish.yml`.
Jobs (3 successifs, arrêt erreur si l'un échoue) :

| Job | Description |
|---|---|
| 1 `check` | Bun 1.4.2 + bun install. Exécute `tsc --noEmit` (racine + cli + ui) + `bun run validate-registry`. |
| 2 `publish-ui-mobile` | **Needs: `check`**. npm publish --access public (NPM_TOKEN fourni par secret). |
| 3 `publish-cli` | **Needs: `publish-ui-mobile`**. Rebuild CLI (prepublishOnly auto + script vérifie pas workspace:* dans dep @rashwright/ui-mobile avant publish). Puis npm publish --access public. |

### Une fois par repo : activer le workflow (NPM_TOKEN)
1. Sur npm : https://www.npmjs.com/settings/<TON_COMPTE>/access-tokens → Générer token **type Automation** (bypass 2FA publish) ⚠️ **sauvegarder le token (il ne s'affichera plus jamais)**
2. Sur GitHub : repo `AbdoulRachid-Mz/rashwright-ui` → Settings → Secrets and variables → Actions → New repository secret :
   - Name : `NPM_TOKEN`
   - Value : token npm automation
   - Add secret.

### Trigger workflow (ex: v0.1.2)
```bash
cd packages/ui-mobile ; npm version patch
cd ../../packages/cli ; npm version patch
cd ../..
git add -A
git commit -m "release v0.1.2: corrections TS, compatibilité SDK"
git tag -a v0.1.2 -m "Release v0.1.2"
git push origin main --follow-tags     # ← Déclenche workflow publish.yml
```

---

## 9. Commit conventionnel + Rollback atomique (PLAN.md §4)

Chaque tâche = **1 commit atomique**. Préfixes recommandés :
- `fix(P0-1): file-manager preserve subdirs`
- `feat(D): rs-ui add interactive checkbox`
- `docs(README): update CLI examples`
- `chore(registry): sync-registry apply post upload-inline`

Rollback rapide si une tâche seule se plante :
```bash
git log --oneline -n 15
git revert <SHA1_DU_COMMIT>
```

---

**FIN Quick-Start.**
