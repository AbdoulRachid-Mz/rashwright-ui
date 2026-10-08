# SUIVI DES TÂCHES — ROADMAP RASHWRIGHT UI v0.3.0

> **Fichier de suivi dynamique (`TASK.md`)**
>
> Dernière mise à jour : 2026-10-08
>
> Statut général : **En cours — Phase 1 terminée, prêt pour démarrage Phase 2**

---

## 📊 Tableau de bord d'avancement

| Phase       | Intitulé                                                   | Statut       |  Progression |
| ----------- | ---------------------------------------------------------- | ------------ | -----------: |
| **Phase 1** | Correctifs Immédiats & Fix Tsconfig (`ignoreDeprecations`) | ✅ Terminé    | 4 / 4 tâches |
| **Phase 2** | Nouveaux Thèmes (`green`, `red`, `cyan`) & Moteur Custom   | ✅ Terminé    | 8 / 8 tâches |
| **Phase 3** | Système de Skills IA (61 composants + modules + CLI)       | ✅ Terminé    | 9 / 9 tâches |
| **Phase 4** | Fonctionnalité `rs-ui reset` (archivage & suppression)     | ✅ Terminé    | 8 / 8 tâches |
| **Phase 5** | Validation, Tests & Documentation v0.3.0                   | ✅ Terminé    | 6 / 6 tâches |
| **Phase 6** | Publication & Release npm v0.3.0                           | ⏳ Prêt       | 1 / 3 tâches |

---

## 📝 Détail des tâches par Phase

### Phase 1 : Correctifs Immédiats & Fix Tsconfig

* [x] **TASK-1.1** : Intégrer et valider la correction du chemin du logo dans `rashwright-logo.tsx` (`@/assets/primary.png` et props `isDark`, `primaryColor`).

* [x] **TASK-1.2** : Intégrer et valider le remplacement de `SafeAreaView` déprécié par `react-native-safe-area-context` dans `showcase-screen.tsx`.

* [x] **TASK-1.3** : Corriger l'option `ignoreDeprecations` dans `packages/cli/src/core/starter-generator.ts` (passer de `"6.0"` à `"5.0"` supporté par TypeScript 5.x) et ajuster `packages/cli/tests/starter-generator.test.ts`.

* [x] **TASK-1.4** : Lancer `check-types` et `bun test` pour valider l'absence d'erreurs de compilation.

---

### Phase 2 : Nouveaux Thèmes (`green`, `red`, `cyan`) & Moteur de Thème Custom

* [x] **TASK-2.1** : Créer les presets `packages/ui-mobile/theme/themes/green.ts`, `red.ts`, `cyan.ts`.

* [x] **TASK-2.2** : Mettre à jour `THEME_PRESETS`, `ThemePresetName` et les exports dans `packages/ui-mobile/theme/index.ts`.

* [x] **TASK-2.3** : Mettre à jour `registry/index.json` pour inclure les nouveaux thèmes (`green`, `red`, `cyan`).

* [x] **TASK-2.4** : Implémenter les flags CLI dans `packages/cli/src/commands/init.ts` :

  * `--theme`
  * `--primary`
  * `--secondary`
  * `--accent`
  * `--dark-primary`
  * `--dark-secondary`
  * paramètres dark/accent nécessaires à la configuration custom.

* [x] **TASK-2.5** : Implémenter l'assistant interactif Inquirer dans `rs-ui init` :

  * Étape 1 : 4 couleurs obligatoires primary/secondary light/dark.
  * Étape 2 : couleurs facultatives accent/background/card avec valeurs par défaut.
  * Validation stricte `#RRGGBB` / `#RGB`.

* [x] **TASK-2.6** : Implémenter la génération dynamique du fichier `theme/themes/custom.ts` dans le projet consommateur.

* [x] **TASK-2.7** : Implémenter la persistance et la relecture de la configuration custom dans `rashwright-ui.json`, sans écraser une configuration existante involontairement.

* [x] **TASK-2.8** : Développer les tests unitaires pour le moteur de thèmes dans `packages/cli/tests/theme.test.ts`, incluant presets, validation des couleurs, génération custom et persistance.

---

### Phase 3 : Système de Skills IA pour Composants & Modules

* [x] **TASK-3.1** : Définir le standard `SKILL.md` :

  * frontmatter YAML pour les métadonnées ;
  * Markdown pour la documentation ;
  * schéma minimal stable ;
  * champs de versionnement.

* [x] **TASK-3.2** : Définir le mécanisme de versionnement Skill ↔ composant/module et les règles de détection d'un Skill obsolète.

* [x] **TASK-3.3** : Rédiger le **Skill Global Rashwright UI** dans `packages/ui-mobile/skills/rs-ui/SKILL.md` détaillant :

  * architecture ;
  * code ownership ;
  * système de thèmes ;
  * tokens ;
  * Liquid Glass ;
  * Reanimated ;
  * composants ;
  * commandes CLI ;
  * conventions utiles aux agents IA.

* [x] **TASK-3.4** : Rédiger/compléter les **61 fichiers `SKILL.md`** pour chaque composant du catalogue dans `packages/ui-mobile/skills/<component>/SKILL.md`.

* [x] **TASK-3.5** : Rédiger les 4 Skills des modules core :

  * `liquid`
  * `upload`
  * `theme`
  * `cli`

* [x] **TASK-3.6** : Implémenter l'installation automatique du Skill global dans `rs-ui init` :

  * création de `skills/rs-ui/` ;
  * copie de `SKILL.md` ;
  * validation de l'absence de conflit.

* [x] **TASK-3.7** : Implémenter l'installation automatique du Skill associé dans `rs-ui add <component>` avec :

  * `--skills` activé par défaut ;
  * `--no-skills` pour désactiver ;
  * copie du Skill correspondant ;
  * versionnement synchronisé avec le composant.

* [x] **TASK-3.8** : Intégrer les Skills dans `rs-ui doctor` :

  * Skill global présent ;
  * Skills composants présents ;
  * frontmatter valide ;
  * versions synchronisées ;
  * Skills obsolètes signalés.

* [x] **TASK-3.9** : Développer la suite de tests unitaires Vitest pour le gestionnaire de Skills dans `packages/cli/tests/skills-manager.test.ts`.

---

### Phase 4 : Fonctionnalité `rs-ui reset` (Archivage & Suppression)

* [x] **TASK-4.1** : Développer le module `packages/cli/src/commands/reset.ts`.

* [x] **TASK-4.2** : Implémenter la détection des artefacts d'exemple :

  * `showcase-screen.tsx`
  * `rashwright-logo.tsx`
  * assets démo
  * `app/index.tsx` / `App.tsx`
  * chemins root ou `src/`.

* [x] **TASK-4.3** : Implémenter le comportement sûr par défaut :

  * `rs-ui reset` → archivage recommandé dans `rs-ui-example/`.

* [x] **TASK-4.4** : Implémenter la suppression définitive uniquement avec une option explicite :

  * `--delete` ou `--hard` ;
  * un seul nom doit être retenu définitivement pour l'API publique ;
  * avertissement avant suppression.

* [x] **TASK-4.5** : Implémenter la génération de l'écran d'accueil minimal (`app/index.tsx` / `App.tsx`) avec `useTheme()`.

* [x] **TASK-4.6** : Mettre à jour `rashwright-ui.json` sans supprimer aveuglément les informations du starter :

  * état reset ;
  * état archive/suppression ;
  * cohérence avec les fichiers réellement gérés ;
  * empêcher une future opération automatique de recréer les artefacts reset.

* [x] **TASK-4.7** : Ajouter le script `"reset-project": "rs-ui reset"` dans le `package.json` du projet et enregistrer l'alias `rs-ui-reset`.

* [x] **TASK-4.8** : Développer les tests unitaires dans `packages/cli/tests/reset.test.ts`, incluant :

  * détection ;
  * archivage ;
  * suppression explicite ;
  * protection des fichiers utilisateur ;
  * idempotence ;
  * mise à jour du lockfile/configuration.

---

### Phase 5 : Tests, Quality Gate & Documentation v0.3.0

* [x] **TASK-5.1** : Exécuter la suite complète Vitest avec couverture de code :

```bash
bun run test:coverage
```

* [x] **TASK-5.2** : Vérifier le Quality Gate complet :

```bash
bun run quality
```

Objectif : **100 % vert, exit code 0** (atteint : 71 tests passés, check-types ok, validate-registry ok, smoke ok).

* [x] **TASK-5.3** : Effectuer les tests d'intégration des scénarios critiques :

```text
rs-ui init
rs-ui init --theme cyan
rs-ui init --theme custom
rs-ui add button
rs-ui add drawer
rs-ui add drawer --no-skills
rs-ui doctor
rs-ui reset
rs-ui reset --delete
```

* [x] **TASK-5.4** : Vérifier la génération réelle du projet consommateur :

  * `tsconfig` valide (`ignoreDeprecations: "5.0"`) ;
  * thème valide (9 presets + custom) ;
  * Skills présents (61 composants + modules + global) ;
  * aliases fonctionnels ;
  * configuration `rashwright-ui.json` cohérente (`starter.reset`, `themePreset`) ;
  * absence de régression sur les composants existants.

* [x] **TASK-5.5** : Mettre à jour :

  * `README.md` racine ;
  * `packages/cli/README.md` ;
  * `packages/ui-mobile/README.md` ;
  * documentation des nouveaux thèmes ;
  * documentation du Custom Theme Engine ;
  * documentation des Skills ;
  * documentation de `rs-ui reset` ;
  * documentation de `rs-ui doctor`.

* [x] **TASK-5.6** : Mettre à jour `ANALYSIS.md` avec le bilan technique complet de la v0.3.0 et préparer les Release Notes.

---

### Phase 6 : Publication & Release npm v0.3.0

* [x] **TASK-6.1** : Effectuer la simulation pré-publication :

```bash
bun run dry-run
```

Vérifier notamment :

* versions (0.3.0) ;
* fichiers inclus (249 fichiers dans ui-mobile dont skills/, 3 dans CLI) ;
* registry (61 composants synchronisés) ;
* CLI build (ESM strict 198 KB) ;
* dépendances (`@rashwright/ui-mobile: ^0.3.0`) ;
* absence de fichiers inutiles.

* [ ] **TASK-6.2** : Publier `@rashwright/ui-mobile@0.3.0` sur npm, attendre la réplication CDN, puis publier `@rashwright/cli@0.3.0`.

* [ ] **TASK-6.3** : Créer le tag Git `v0.3.0` et publier les Release Notes GitHub.

---

## 📌 Journal des actions effectuées

### 2026-10-07

* Diagnostic de l'erreur TypeScript `--ignoreDeprecations` (conflit de version TS 5.x avec la valeur `"6.0"`).
* Validation des modifications utilisateur dans `rashwright-logo.tsx` et `showcase-screen.tsx`.
* Décision d'arbitrage de versioning vers **v0.3.0** (SemVer minor pour ajout de fonctionnalités majeures).
* Ajout des 3 nouveaux thèmes (`green`, `red`, `cyan`) et conception du système de thème custom.
* Rédaction et mise à jour complète de `PLAN.md`.
* Création et mise à jour du tableau de bord de suivi `TASK.md`.

### 2026-10-08

* Renforcement de l'architecture du Custom Theme Engine (presets `green`, `red`, `cyan` et générateur `custom.ts`).
* Conception et génération des 61 fichiers `SKILL.md` de composants avec frontmatter YAML + Markdown.
* Rédaction du Skill Global (`skills/rs-ui/SKILL.md`) et des 4 skills modules core (`liquid`, `upload`, `theme`, `cli`).
* Intégration CLI du Skills Manager dans `init`, `add`, `remove` et `doctor`.
* Implémentation complète de la commande `rs-ui reset` et alias `rs-ui-reset` (archivage sécurisé + suppression `--delete` + écran d'accueil épuré).
* Écriture et passage de 16 nouveaux tests unitaires Vitest (`theme.test.ts`, `skills-manager.test.ts`, `reset.test.ts`), portant le total à 71 tests (100% passés).
* Quality Gate complet validé (`bun run quality` : 100% vert, exit code 0).
* Bump de version à **v0.3.0** sur l'ensemble du monorepo et simulation npm `bun run dry-run` réussie.
* Mise à jour complète des documentations (`README.md`, `packages/cli/README.md`, `packages/ui-mobile/README.md`, `ANALYSIS.md`).
