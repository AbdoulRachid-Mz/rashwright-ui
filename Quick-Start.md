# Quick-Start — Rashwright UI Mobile Workspace (Contributeur v1.6.0+)

> **⚠️ Pour le guide utilisateur (intégrer Rashwright dans une application Expo), consulter le [README.md](./README.md) principal ou le README de `@rashwright/cli`.**
>
> Ce Quick-Start est destiné aux contributeurs et développeurs qui souhaitent faire évoluer le moteur, ajouter des composants, des widgets ou des templates, lancer les tests unitaires et publier des releases.

---

## 1. Prérequis du workspace

| Outil | Version minimale | Rôle |
|---|---|---|
| **Bun** | `>= 1.2.0` | Package manager du monorepo & exécution rapide |
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
bun run test                   # Lance les 245 tests unitaires Vitest du CLI (51 suites)
bun run test:coverage          # Rapport de couverture de code (V8)
bun run check-types            # Vérifie les types TypeScript stricts (CLI + UI-Mobile)

# --- Registry, Widgets & Templates ---
bun run sync-registry          # Synchronise les métadonnées dynamiques (requiresComponents, expoDeps, etc.)
bun run validate-registry      # Exécute les contrôles d'intégrité (doit afficher 0 erreur — 79 composants)
bun run validate-maestro       # Valide les 6 flows E2E déclaratifs Maestro

# --- CLI & Compilation ---
bun run build:cli              # Compile packages/cli/dist/index.js (ESM Node, ~0.40 MB)
bun run dev:cli                # Mode watch pour le développement CLI
bun run cli --help             # Exécute le CLI directement depuis les sources
bun run cli list               # Affiche les 79 composants disponibles
bun run cli list --templates   # Affiche les 10 templates modulaires disponibles
bun run cli widget list        # Affiche les 6 widgets modulaires disponibles

# --- Quality Gate complet ---
bun run quality                # Chaîne complète : registry + maestro + types + tests + build + smoke tests
bun run dry-run                # Simule la publication npm de ui-mobile et cli
```

---

## 4. Architecture TypeScript

Pour garantir des vérifications indépendantes et sans effets de bord :
- `tsconfig.base.json` : Base commune stricte (`strict: true`, `noImplicitAny: true`, `jsx: react-native`).
- `packages/cli/tsconfig.json` : Typage strict du CLI Node.js.
- `packages/ui-mobile/tsconfig.json` : Typage des 79 composants React Native, 6 widgets, 2 showcases, 10 templates et 8 primitives Liquid Glass.
- `packages/cli/vitest.config.ts` : Configuration de l'environnement de test Vitest (51 suites).

---

## 5. Ajouter un nouveau composant ou widget

### 5.1 Ajouter un composant atomique UI
1. **Créer le fichier TSX** : `packages/ui-mobile/components/ui/<nom>.tsx`
   - Utiliser `useTheme()` pour le support dynamique clair/sombre.
   - Ne jamais imposer `flex: 1` sur le conteneur racine sans justification.
   - Appliquer la règle de priorité des styles : `style={[styles.base, internalStyle, style]}` (prop utilisateur en dernier).
   - Exposer les attributs d'accessibilité WCAG 2.1 AA : `accessibilityRole`, `accessibilityState`, `accessibilityLabel`.
2. **Créer la fiche Registry** : `packages/ui-mobile/registry/components/<nom>.json`
3. **Créer la documentation IA** : `packages/ui-mobile/skills/<nom>/SKILL.md` avec frontmatter YAML complet et exemple TSX fonctionnel.
4. **Mettre à jour `registry/index.json`** et exporter dans `packages/ui-mobile/components/ui/index.ts`.
5. **Valider** : `bun run validate-registry && bun run check-types`.

### 5.2 Ajouter un widget modulaire
1. **Créer le dossier du widget** : `packages/ui-mobile/widgets/<id>/`
   - `widget.json` : identifiant, nom, version, dépendances atomiques (`requiresComponents`), description.
   - `types.ts` : typage complet et strict des données et props.
   - `<id>-widget.tsx` : implémentation autonome avec support thème et Liquid Glass.
   - `index.ts` : barrel export.
2. **Créer le Skill IA** : `packages/ui-mobile/skills/<id>-widget/SKILL.md`.
3. **Ré-exporter dans** `packages/ui-mobile/widgets/index.ts`.
4. **Tester** : `bun run test`.

---

## 6. Règle absolue de typage : Zéro `any`

Tout le code doit être rigoureusement typé :
- Privilégier les génériques (`<T>`) pour les signatures dynamiques.
- Utiliser `unknown` avec type narrowing pour les données de source externe.
- Utiliser `React.ElementRef<typeof Component>` plutôt que `any` dans les `forwardRef`.
- Utiliser `StyleProp<ViewStyle>` ou `StyleProp<TextStyle>` pour les styles.

---

## 7. Procédure de publication (v1.6.0+)

L'ordre de publication sur npm doit être scrupuleusement respecté :

### Phase A : Vérification pré-publication
```bash
bun run quality   # Doit terminer avec un exit code 0 (245 tests passés)
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
cd ../cli
npm publish --access public
```

### Phase D : Tag Git & Release GitHub
```bash
git add -A
git commit -m "chore(release): v1.6.0"
git tag -a v1.6.0 -m "Release v1.6.0"
git push origin main --follow-tags
```
