# Rashwright UI Mobile — Refonte P0 + Split + Registry

**Date de démarrage** : 2026-10-01
**Basé sur** : PLAN.md + ANALYSIS.md
**Mode d'exécution** : Tâche par tâche, GO utilisateur entre chaque (sauf "mode auto")

---

## Progression globale

- [x] **ÉTAPE 1** — Analyse approfondie → [ANALYSIS.md](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/ANALYSIS.md)
- [x] **ÉTAPE 2** — Plan détaillé → [PLAN.md](file:///c:/Users/user/Desktop/abdoul/dev/rashwright-office/rashwright-ui/PLAN.md)
- [ ] **ÉTAPE 3** — Exécution progressive (17 tâches)
  - [x] **GROUPE 1 — CLI P0/P1**
    - [x] P1-1 : cli/commands/add.ts — remplacer `require("fs")` par import ESM (+ doctor.ts + theme-store.ts même pattern)
    - [x] P0-1 : cli/core/file-manager.ts — préserve structure sous-dossiers (liquid/* OK via relativeComponentsPath)
    - [x] P0-2 : cli/core/starter-generator.ts — setupFoundations + setupCoreUi text/view+liquid/* corrigé (init.ts appel paramétré OK)
  - [x] **GROUPE 2 — COMPOSANTS P0/P1 (anticipés car bloquants bun install)**
    - [x] P0-6 : components/ui/index.ts — retirer exports View/Text (collision RN)
    - [x] P1-5 (étendu) : components/ui/ + liquid/* — 57 fichiers, 70 imports @/ absolus convertis en imports relatifs (script fix-imports.mjs)
    - [x] P0-5 : Inliner @rashwright/upload (lib/upload/ + retirer workspace:*)
  - [x] **GROUPE 3 — REGISTRY SYNC + VALIDATE**
    - [x] REG-1 : Créer scripts/sync-registry.ts (5 champs dynamiques mis à jour)
    - [x] REG-2 : Exécuter sync-registry.ts — 41 JSON mis à jour, 0 anomalie résiduelle
    - [x] REG-3 : Créer scripts/validate-registry.ts (F-1/F-2/R-1/R-2/I-1/I-2/C-1) — 0 erreur; cleanup text/view.json hors registry
  - [ ] **GROUPE 4 — SPLIT EN 2 PACKAGES**
    - [ ] SPLIT-1 : Créer packages/ + package.json workspace racine + packages/{cli,ui-mobile}/package.json
    - [ ] SPLIT-2 : Déplacer composants/constants/contexts/... → packages/ui-mobile/
    - [ ] SPLIT-3 : Déplacer CLI → packages/cli/src/ + créer paths.ts + update tous les CLI
    - [ ] SPLIT-4 : Mettre à jour scripts/ (sync+validate) vers nouveaux paths
    - [ ] SPLIT-5 : tsconfigs + tsconfig.base.json composite references
    - [ ] P0-7 : Build CLI (packages/cli) — shebang + dist correct
  - [ ] **GROUPE 5 — CI + FINAL**
    - [ ] CI-1 : Créer .github/workflows/publish.yml
    - [ ] FINAL-1 : Mettre à jour README + fichiers publiés
- [ ] **ÉTAPE 4** — Validation finale → VALIDATION.md

---

## Journal

- 2026-10-01 : [ANALYSIS.md] produit (7 P0 confirmés, 6 P1, 8 P2)
- 2026-10-01 : [PLAN.md] produit (17 tâches ordonnées, stratégie test + rollback)
- 2026-10-01 : P1-1 TERMINÉ — require() ESM (add.ts L72, doctor.ts L89, stores/theme-store.ts L51) — TS 0 erreur
- 2026-10-01 : P0-5 TERMINÉ (anticipé pour bun install) — suppression @rashwright/upload workspace:*, création lib/upload/index.ts stub, mise à jour upload-image/upload-video.tsx + JSON registry, P1-6 upload-video nativeRebuildRequired=false
- 2026-10-01 : tsconfig.json mis à jour (types:["node"]) — TypeScript 0 erreur
- 2026-10-01 : P0-6 TERMINÉ — barrel components/ui/index.ts n'exporte plus View/Text (uniquement ThemedView/ThemedText) pour éviter collision RN
- 2026-10-01 : P1-5 TERMINÉ (étendu) — script scripts/fix-imports.mjs : 57 fichiers, 70 imports @/contexts/theme-context, @/constants/glass-theme, @/components/ui/text, @/components/ui/view convertis en imports relatifs. Corrections manuelles card.tsx & time-picker.tsx (3 imports). TS 0 erreur
- 2026-10-01 : init.ts — corrections majeures : (a) bug setupFoundations appel (3e/4e param : componentsPath, dryRun corrects — primitives liquid/text/view copiées) ; (b) helpers isDirectoryEmpty/suggestUniqueProjectName ; (c) vérif dossier courant non vide → propose sous-dossier ou confirmation d'écrasement ; (d) nom unique par défaut si dossier cible existe ; (e) mode --yes nom incrémenté auto. TS 0 erreur
- 2026-10-01 : P0-1 VÉRIFIÉ OK — copyComponentFiles L31 préserve liquid/* sous-dossiers
- 2026-10-01 : P0-2 VÉRIFIÉ + CORRIGÉ (init.ts) — setupFoundations + setupCoreUi bien appelés avec componentsPath correct
- 2026-10-01 : REG-1 OK — scripts/sync-registry.ts : 5 champs dynamiques, champs statiques préservés. package.json scripts sync-registry + validate-registry
- 2026-10-01 : REG-2 OK — 41 JSON mis à jour. Upload-video.nativeRebuildRequired=false, liquid/* auto-ajoute reanimated/linear-gradient/blur. CORE_FILES inclut index barrel → faux positif éliminé
- 2026-10-01 : REG-3 OK — scripts/validate-registry.ts (8 contrôles). Suppression registry/components/{text,view}.json (primitives Core → setupCoreUi). index.json nettoyé (text/view hors components/categories, totalComponents=55). validate-registry 0 erreur, tsc 0 erreur
