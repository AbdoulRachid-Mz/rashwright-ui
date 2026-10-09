# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI (v0.6.0)

> **Fichier de suivi dynamique (`TASK.md`)**
>
> Dernière mise à jour : 2026-10-08  
> Statut général : **v0.5.0 Validée & Prête pour Release — Préparation Roadmap v0.6.0 (CLI Hooks, Multi-Registry & Templates Engine)**

---

## 📊 Tableau de bord d'avancement (Roadmap v0.6.0)

| Phase | Intitulé | Statut | Progression |
|---|---|---|:---:|
| **v0.5.0** | Migrations, Composants Custom, Multi-Version & Monorepo | ✅ Validé (107 tests) | 20 / 20 tâches |
| **Phase 1 (v0.6.0)** | Système de Hooks CLI (`hooks-manager.ts` & config `hooks`) | ✅ Terminé | 4 / 4 tâches |
| **Phase 2 (v0.6.0)** | Multi-Registres & Registres d'Organisation (`rs-ui registry`) | ✅ Terminé | 4 / 4 tâches |
| **Phase 3 (v0.6.0)** | Moteur de Templates Init (`--template minimal/auth/dashboard...`) | ✅ Terminé | 4 / 4 tâches |
| **Phase 4 (v0.6.0)** | Validation, Quality Gate & Release v0.6.0 | ✅ Terminé | 4 / 4 tâches |

---

## 📝 Détail des tâches par Phase (v0.6.0)

### Phase 1 : Système de Hooks CLI (`hooks-manager.ts`)

* [x] **TASK-6.1.1** : Créer le module core `packages/cli/src/core/hooks-manager.ts` pour parser et déclencher les hooks configurés (`pre-add`, `post-add`, `pre-update`, `post-update`).
* [x] **TASK-6.1.2** : Intégrer les triggers de hooks dans les flux `addCommand` et `updateCommand`.
* [x] **TASK-6.1.3** : Mettre à jour `RashwrightConfig` pour supporter le champ optionnel `hooks: Record<string, string>`.
* [x] **TASK-6.1.4** : Écrire les tests unitaires Vitest dans `packages/cli/tests/hooks-manager.test.ts`.

---

### Phase 2 : Multi-Registres & Registres d'Organisation (`rs-ui registry`)

* [x] **TASK-6.2.1** : Créer le module core `packages/cli/src/core/scoped-registry.ts` pour gérer le stockage des registres tiers dans `rashwright-ui.json` ou la config globale utilisateur.
* [x] **TASK-6.2.2** : Implémenter la commande `packages/cli/src/commands/registry.ts` (`rs-ui registry add <alias> <url>`, `list`, `remove`).
* [x] **TASK-6.2.3** : Permettre l'installation préfixée par scope : `rs-ui add @scope/composant`.
* [x] **TASK-6.2.4** : Écrire les tests unitaires Vitest dans `packages/cli/tests/scoped-registry.test.ts`.

---

### Phase 3 : Moteur de Templates Starters Élargi (`--template`)

* [x] **TASK-6.3.1** : Créer le module `packages/cli/src/core/templates-manager.ts` avec le catalogue des templates basés exclusivement sur les composants `rs-ui` : `minimal`, `showcase`, `auth` (login/signup), `onboarding` (carrousel & étapes), `dashboard` (stats/tables), `commerce` (cards/filtres) et `settings` (profil/toggles).
* [x] **TASK-6.3.2** : Connecter le flag `--template <type>` dans `packages/cli/src/commands/init.ts` et dans l'assistant interactif Inquirer (avec descriptions claires de chaque starter).
* [x] **TASK-6.3.3** : Adapter le générateur de starter (`setupStarterTemplate` / `generateShowcaseScreen`) pour copier automatiquement les composants `rs-ui` requis par le template sélectionné et générer l'écran correspondant.
* [x] **TASK-6.3.4** : Écrire les tests unitaires Vitest dans `packages/cli/tests/starter-generator.test.ts` et `templates-manager.test.ts`.

---

### Phase 4 : Validation, Documentation & Release v0.6.0

* [x] **TASK-6.4.1** : Exécuter la suite complète Vitest et valider le Quality Gate `bun run quality` (100% vert, 0 erreur, 133 tests).
* [x] **TASK-6.4.2** : Mettre à jour les documentations utilisateur (`README.md`, `packages/cli/README.md`, `packages/ui-mobile/README.md`).
* [x] **TASK-6.4.3** : Documenter les résultats techniques dans `ANALYSIS.md`.
* [x] **TASK-6.4.4** : Validation des corrections `errors-to-fixe.md` (aucun double install, `--no-install`, banner, normalisation cross-OS, tsconfig moderne sans `baseUrl`).

---

## 📌 Journal des actions effectuées

### 2026-10-09
* Implémentation des corrections issues de `errors-to-fixe.md` :
  - **Banner unifié** : `packages/cli/src/core/banner.ts` (`printBanner`) partagé.
  - **Gestion SDK Expo & Bootstrap Expo** : `buildCreateExpoAppCommand()` centralisé dans `package-manager.ts` avec `--no-install`, `--no-agents-md` et `blank-typescript@<SDK>`. Résolution stricte de `latest` vers SDK 57 (`LATEST_SUPPORTED_SDK`).
  - **Élimination de la double installation** : `init.ts` réorganisé pour générer les fichiers en amont et exécuter une seule phase d'installation finale.
  - **Chemins Windows & cross-plateforme** : normalisation regex robuste dans `file-manager.ts` et `lock-manager.ts`.
  - **TypeScript moderne** : suppression confirmée de `baseUrl` et `ignoreDeprecations` dans `starter-generator.ts`.
  - **Tests et Quality Gate** : 133 tests Vitest passants (28 test suites, 100% exit 0), typechecks strict CLI + UI-mobile passants, validate-registry 61 composants sans erreur.
* Clôture de la version **v0.6.0** prête pour publication et tag GitHub.

### 2026-10-08
* Réalisation et validation de la **v0.5.0** (107 tests Vitest réussis, 23 suites de test).
* Nettoyage et synthèse de `errors.md` : alignement des fonctionnalités implémentées (Update intelligent, Lockfile, Backup/Restore, Migrations, Custom components, Multi-version, Skills décorrélés, Monorepo).
* Structuration de la roadmap **v0.6.0** (Hooks CLI, Multi-Registres privés, Templates d'initialisation).
