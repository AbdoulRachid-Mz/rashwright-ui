# Quick-Start — Rashwright UI Mobile Workspace (Contributeur v0.2.0)

> **⚠️ Pour le guide utilisateur (intégrer Rashwright dans une application Expo), consulter le [README.md](./README.md) principal ou le README de `@rashwright/cli`.**
>
> Ce Quick-Start est destiné aux contributeurs et développeurs qui souhaitent faire évoluer le moteur, ajouter des composants, lancer les tests unitaires et publier des releases.

---

## 1. Prérequis du workspace

| Outil | Version minimale | Rôle |
|---|---|---|
| **Bun** | `>= 1.4.2` | Package manager du monorepo & exécution rapide |
| **Node.js** | `>= 20.11.0` | Runtime cible du bundle CLI ESM |
| **Git** | Récent | Gestion de version et tags |

---

## 2. Cloner et installer

```bash
git clone https://github.com/AbdoulRachid-Mz/rashwright-ui.git
cd rashwright-ui
bun install
```

---

## 3. Scripts disponibles (Workspace racine)

```bash
# --- Tests unitaires & Qualité ---
bun run test                   # Lance les 55 tests unitaires Vitest du CLI
bun run test:coverage          # Rapport de couverture de code (V8)
bun run check-types            # Vérifie les types TypeScript (CLI + UI-Mobile)

# --- Registry (61 composants) ---
bun run sync-registry          # Synchronise les métadonnées dynamiques (requiresComponents, expoDeps, etc.)
bun run validate-registry      # Exécute les 8 contrôles d'intégrité (doit afficher 0 erreur)

# --- CLI & Compilation ---
bun run build:cli              # Compile packages/cli/dist/index.js (ESM Node)
bun run dev:cli                # Mode watch pour le développement CLI
bun run cli --help             # Exécute le CLI directement depuis les sources
bun run cli list               # Affiche les 61 composants disponibles
bun run cli list -i            # Mode interactif d'exploration

# --- Quality Gate complet ---
bun run quality                # Chaîne complète : registry + types + tests + build + smoke tests
bun run dry-run                # Simule la publication npm de ui-mobile et cli
```

---

## 4. Architecture TypeScript

Pour garantir des vérifications indépendantes et sans effets de bord :
- `tsconfig.base.json` : Base commune stricte (`strict: true`, `noImplicitAny: true`, `jsx: react-native`).
- `packages/cli/tsconfig.json` : Typage du CLI Node.js.
- `packages/ui-mobile/tsconfig.json` : Typage des composants React Native et primitives Liquid Glass.
- `packages/cli/vitest.config.ts` : Configuration de l'environnement de test Vitest.

---

## 5. Ajouter un nouveau composant (Guide pas-à-pas)

1. **Créer le fichier TSX** : `packages/ui-mobile/components/ui/<nom>.tsx`
   - Utiliser `useTheme()` pour le support dynamique clair/sombre.
   - Utiliser des imports relatifs stricts pour les dépendances internes.
2. **Créer la fiche Registry** : `packages/ui-mobile/registry/components/<nom>.json`
   ```json
   {
     "name": "mon-composant",
     "version": "1.0.0",
     "description": "Description concise...",
     "category": "Basic",
     "files": ["components/ui/mon-composant.tsx"],
     "dependencies": [],
     "expoDependencies": [],
     "optionalExpoDependencies": [],
     "requiresComponents": [],
     "providers": ["ThemeProvider"],
     "supportsGlass": true,
     "platforms": ["ios", "android"],
     "nativeRebuildRequired": false
   }
   ```
3. **Mettre à jour `registry/index.json`** : inscrire le composant dans la catégorie ciblée.
4. **Exporter le composant** : dans `packages/ui-mobile/components/ui/index.ts` et `starter-generator.ts`.
5. **Synchroniser et valider** :
   ```bash
   bun run sync-registry
   bun run validate-registry
   ```
6. **Lancer les tests et le Quality Gate** :
   ```bash
   bun run quality
   ```

---

## 6. Règle absolue de typage : Zéro `any`

Tout le code doit être rigoureusement typé :
- Privilégier les génériques (`<T>`) pour les signatures dynamiques.
- Utiliser `unknown` avec type narrowing pour les données de source externe.
- Utiliser `React.ElementRef<typeof Component>` plutôt que `any` dans les `forwardRef`.

---

## 7. Procédure de publication (v0.2.0)

L'ordre de publication sur npm doit être scrupuleusement respecté :

### Phase A : Vérification pré-publication
```bash
bun run quality   # Doit terminer avec un exit code 0
bun run dry-run   # Vérifie la conformité des packages pour npm
```

### Phase B : Publication de `@rashwright/ui-mobile`
```bash
cd packages/ui-mobile
npm publish --access public
# ⏳ Patienter 2 à 5 minutes pour la propagation CDN de npm et unpkg
```

### Phase C : Publication de `@rashwright/cli`
```bash
cd ../../packages/cli
npm publish --access public
```

### Phase D : Tag Git & Release GitHub
```bash
git add -A
git commit -m "chore(release): v0.2.0"
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --follow-tags
```

---

**FIN Quick-Start.**
