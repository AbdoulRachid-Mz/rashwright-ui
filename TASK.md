# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI (v0.5.0)

> **Fichier de suivi dynamique (`TASK.md`)**
>
> Dernière mise à jour : 2026-10-08  
> Statut général : **v0.4.0 Validée & Prête pour Release — Préparation Roadmap v0.5.0 (Migrations, Project Extensibility & Multi-Version)**

---

## 📊 Tableau de bord d'avancement (Roadmap v0.5.0)

| Phase | Intitulé | Statut | Progression |
|---|---|---|:---:|
| **v0.4.0** | Project State & Reliability Engine (Lockfile, Backup, Smart Update, Inspector) | ✅ Prêt Release | 20 / 20 tâches |
| **Phase 1 (v0.5.0)** | Moteur de Migrations Système (`rs-ui migrate` & runner séquentiel) | ✅ Terminé | 4 / 4 tâches |
| **Phase 2 (v0.5.0)** | Générateur de Composants Projet & Skills (`rs-ui create component`) | ✅ Terminé | 4 / 4 tâches |
| **Phase 3 (v0.5.0)** | Registry Multi-Versions (`rs-ui add <nom>@<ver>`) | ✅ Terminé | 4 / 4 tâches |
| **Phase 4 (v0.5.0)** | Gestion Décorrélée des Skills IA (`rs-ui skill list / update`) | ✅ Terminé | 4 / 4 tâches |
| **Phase 5 (v0.5.0)** | Workspace & Monorepo Awareness (`detectWorkspace`, auto-target) | ✅ Terminé | 4 / 4 tâches |

---

## 📝 Détail des tâches par Phase (v0.5.0)

### Phase 1 : Moteur de Migrations Système (`rs-ui migrate`)

* [x] **TASK-5.1.1** : Créer le module core `packages/cli/src/core/migration-runner.ts` pour détecter la version du schéma du projet et appliquer les scripts ordonnés.
* [x] **TASK-5.1.2** : Créer les scripts de migration `migrations/0.3.0-to-0.4.0.ts` (génération rétroactive du lockfile et formatage starter).
* [x] **TASK-5.1.3** : Développer la commande `packages/cli/src/commands/migrate.ts` avec options `--check`, `--dry-run` et sauvegarde automatique de précaution.
* [x] **TASK-5.1.4** : Écrire les tests unitaires Vitest dans `packages/cli/tests/migration-runner.test.ts`.

---

### Phase 2 : Composants Projet Custom & Créateur (`rs-ui create component`)

* [x] **TASK-5.2.1** : Développer le générateur de template composant respectant les tokens de thème et le typage strict (`packages/cli/src/core/component-scaffolder.ts`).
* [x] **TASK-5.2.2** : Générer automatiquement le fichier `skills/rs-ui/<nom>/SKILL.md` pour le nouveau composant créé.
* [x] **TASK-5.2.3** : Implémenter la commande `packages/cli/src/commands/create.ts` (`rs-ui create component <nom>`).
* [x] **TASK-5.2.4** : Écrire les tests unitaires Vitest dans `packages/cli/tests/create-component.test.ts`.

---

### Phase 3 : Registry Multi-Versions (`rs-ui add <name>@<version>`)

* [x] **TASK-5.3.1** : Adapter le parseur d'arguments dans `add.ts` pour extraire la version spécifiée (`button@0.3.0` ou `button@latest`).
* [x] **TASK-5.3.2** : Mettre à jour `remote-registry.ts` pour télécharger l'archive tarball spécifique depuis unpkg/npm lors d'une version ciblée.
* [x] **TASK-5.3.3** : Ajouter l'option `--versions <composant>` dans la commande `rs-ui list`.
* [x] **TASK-5.3.4** : Écrire les tests unitaires Vitest dans `packages/cli/tests/multi-version.test.ts`.

---

### Phase 4 : Gestion des Skills Décorrélée (`rs-ui skill`)

* [x] **TASK-5.4.1** : Développer le sous-groupe de commandes `rs-ui skill` dans `packages/cli/src/commands/skill.ts`.
* [x] **TASK-5.4.2** : Implémenter `rs-ui skill list` et `rs-ui skill update [nom] [--all]`.
* [x] **TASK-5.4.3** : Écrire les tests unitaires dans `packages/cli/tests/skill-command.test.ts`.

---

### Phase 5 : Workspace & Monorepo Awareness

* [x] **TASK-5.5.1** : Enrichir `project-detector.ts` pour identifier les monorepos (Bun workspaces, Turborepo, pnpm workspaces).
* [x] **TASK-5.5.2** : Déterminer automatiquement le dossier applicatif cible si exécuté depuis la racine d'un monorepo.
* [x] **TASK-5.5.3** : Valider avec des tests d'intégration dans `packages/cli/tests/monorepo.test.ts`.
* [x] **TASK-5.5.4** : Valider l'intégralité du Quality Gate (107 tests Vitest réussis) et la simulation npm `dry-run`.

---

## 📌 Journal des actions effectuées

### 2026-10-08
* Réalisation et validation complète de la **v0.4.0** :
  - Intégration du Lockfile cryptographique `rashwright-ui.lock` (SHA-256).
  - Implémentation du moteur de sauvegarde/restauration `.rashwright/backups/` (`rs-ui backup` / `rs-ui restore`).
  - Refonte Smart Update (`rs-ui update --check`, `-i`, `--diff`).
  - Implémentation de l'inspecteur 360° et du graphe de dépendances (`rs-ui info`, `deps`, `why`).
  - Validation du Quality Gate à 100% (90 tests Vitest, build ESM, dry-run npm réussi).
* Analyse approfondie des besoins restants de `errors.md` et mise en place de la roadmap **v0.5.0** dans `PLAN.md` et `TASK.md`.
