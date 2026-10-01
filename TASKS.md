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
    - [ ] P0-1 : cli/core/file-manager.ts — préserver structure relative sous-dossiers
    - [ ] P0-2 : cli/core/starter-generator.ts — setupFoundations copie core UI files (text, view, liquid/*)
  - [x] **GROUPE 2 — COMPOSANTS P0/P1 (anticipés car bloquants bun install)**
    - [ ] P0-6 : components/ui/index.ts — retirer exports View/Text (collision RN)
    - [ ] P1-5 : components/ui/card.tsx — remplacer `@/components/ui/text` par import relatif
    - [x] P0-5 : Inliner @rashwright/upload (lib/upload/ + retirer workspace:*)
  - [ ] **GROUPE 3 — REGISTRY SYNC + VALIDATE**
    - [ ] REG-1 : Créer scripts/sync-registry.ts
    - [ ] REG-2 : Exécuter sync-registry.ts + corriger anomalies
    - [ ] REG-3 : Créer scripts/validate-registry.ts
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
