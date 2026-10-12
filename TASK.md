# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI (v0.7.0)

> **Fichier de suivi dynamique (`TASK.md`)**
>
> Dernière mise à jour : 2026-10-09  
> Statut général : **v0.7.0 Validée & Prête pour Release (143 tests Vitest réussis, 31 suites, Quality Gate 100% vert)**

---

## 📊 Tableau de bord d'avancement (Roadmap v0.7.0)

| Phase | Intitulé | Statut | Progression |
|---|---|---|:---:|
| **v0.6.0** | Hooks CLI, Multi-Registres Scoped & Pipeline Init Unique | ✅ Validé (133 tests) | 16 / 16 tâches |
| **Phase 1 (v0.7.0)** | Création des Modules de Templates Autonomes (`templates/`) | ✅ Validé | 4 / 4 tâches |
| **Phase 2 (v0.7.0)** | Registry des Templates & Découverte (`rs-ui list --templates`) | ✅ Validé | 4 / 4 tâches |
| **Phase 3 (v0.7.0)** | Installation des Templates via `rs-ui add --template` (`-t`) | ✅ Validé | 4 / 4 tâches |
| **Phase 4 (v0.7.0)** | Intégration `rs-ui init`, Lockfile & Nettoyage Code Mort | ✅ Validé | 4 / 4 tâches |
| **Phase 5 (v0.7.0)** | Tests Vitest, Documentation, Quality Gate & Release v0.7.0 | ✅ Validé (143 tests) | 4 / 4 tâches |

---

## 📝 Détail des tâches par Phase (v0.7.0)

### Phase 1 : Création des Modules de Templates Autonomes (`packages/ui-mobile/templates/`)

* [x] **TASK-7.1.1** : Créer l'arborescence des templates dans `packages/ui-mobile/templates/` (`minimal`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`, `showcase`).
* [x] **TASK-7.1.2** : Écrire le composant autonome principal `.tsx`, les types `.ts`, et les sous-composants (`components/`) pour chacun des 7 templates sans aucune chaîne de template multiline.
* [x] **TASK-7.1.3** : Définir le fichier de manifeste `template.json` standardisé pour chaque template (`id`, `name`, `description`, `version`, `entrypoint`, `files`, `requiredComponents`, `dependencies`, `expoDependencies`, `supportsGlass`).
* [x] **TASK-7.1.4** : Configurer `files: ["templates/**"]` dans `packages/ui-mobile/package.json`.

---

### Phase 2 : Registry des Templates & Découverte (`rs-ui list --templates`)

* [x] **TASK-7.2.1** : Créer le module core `packages/cli/src/core/templates-registry.ts` pour charger, inspecter et valider les `template.json`.
* [x] **TASK-7.2.2** : Définir les types stricts TypeScript (`TemplateDefinition`, `getTemplateDefinition`, `loadTemplatesRegistry`, `listTemplateIds`).
* [x] **TASK-7.2.3** : Étendre la commande `packages/cli/src/commands/list.ts` avec l'option `-t, --templates` (ou `rs-ui list --templates`) pour afficher le catalogue détaillé des templates installables.
* [x] **TASK-7.2.4** : Écrire les tests unitaires Vitest pour `templates-registry.ts` dans `packages/cli/tests/templates-registry.test.ts`.

---

### Phase 3 : Installation des Templates via `rs-ui add --template` (`-t`)

* [x] **TASK-7.3.1** : Étendre `packages/cli/src/commands/add.ts` pour supporter le flag `-t, --template <name>` en conservant le support des composants unitaires `rs-ui add <name...>`.
* [x] **TASK-7.3.2** : Connecter le résolveur de dépendances existant (`resolveDependencies()`) pour installer automatiquement tous les composants `rs-ui` requis par le template dans `src/components/ui/`.
* [x] **TASK-7.3.3** : Implémenter la copie de l'arborescence complète du template dans `src/components/templates/<nom>/`.
* [x] **TASK-7.3.4** : Écrire les tests unitaires pour l'installation de templates et lockfile dans `packages/cli/tests/add-template.test.ts`.

---

### Phase 4 : Intégration `rs-ui init`, Lockfile & Nettoyage Code Mort

* [x] **TASK-7.4.1** : Adapter `rs-ui init --template` pour installer le template sélectionné depuis les sources de `templates/` au lieu de générer des chaînes de code TSX.
* [x] **TASK-7.4.2** : Étendre `lock-manager.ts` (`rashwright-ui.lock`) avec `templates: Record<string, LockedTemplate>` et vérification d'intégrité SHA-256 (`checkTemplateIntegrity`).
* [x] **TASK-7.4.3** : Remplacer l'ancienne fonction monolithique `generateTemplateScreenCode()` (640 lignes de TSX en dur éliminées) par un wrapper proxy léger et modulaire.
* [x] **TASK-7.4.4** : Valider les tests d'intégration dans `packages/cli/tests/templates-manager.test.ts`.

---

### Phase 5 : Tests Vitest, Documentation, Quality Gate & Release v0.7.0

* [x] **TASK-7.5.1** : Bump des versions vers `0.7.0` dans `packages/cli/package.json`, `packages/ui-mobile/package.json` et `packages/ui-mobile/registry/index.json`.
* [x] **TASK-7.5.2** : Valider le Quality Gate `bun run quality` (validate-registry + check-types + tests Vitest + build:cli + smoke:all) : 100% vert, exit code 0.
* [x] **TASK-7.5.3** : Mettre à jour les documentations (`README.md`, `packages/cli/README.md`, `packages/ui-mobile/README.md`, `PLAN.md`).
* [x] **TASK-7.5.4** : Préparer la validation finale et la livraison pour l'utilisateur.

---

## 📌 Journal des actions effectuées

### 2026-10-09
* **Clôture de la v0.6.0** :
  - Pipeline d'initialisation unique, résolution Expo SDK 54-57, banner, normalisation chemins.
  - 133 tests Vitest passés.
* **Réalisation intégrale de la v0.7.0** :
  - Création des 7 templates modulaires autonomes dans `packages/ui-mobile/templates/` (`minimal`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`, `showcase`).
  - Chaque template contient : `template.json`, composant principal `.tsx`, `types.ts`, `components/` dédiés et `index.ts`.
  - Création du module CLI `packages/cli/src/core/templates-registry.ts`.
  - Implémentation de `rs-ui list --templates` (ou `-t`).
  - Implémentation de `rs-ui add --template <nom>` (ou `-t <nom>`).
  - Extension du lockfile `rashwright-ui.lock` avec la section `templates:` et calcul SHA-256.
  - Élimination de plus de 640 lignes de chaînes TSX en dur dans `templates-manager.ts`.
  - 143 tests Vitest passés (31 suites de tests), Quality Gate 100% exit 0.
