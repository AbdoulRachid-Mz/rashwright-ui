# PHASE 0 — Rapport du harnais de tests d'installation réels

**Date :** 2026-11-08
**Statut :** terminé — 8 tests rouges, tous justifiés par des défauts produit réels.
**Code produit modifié :** aucun.

---

## 1. Objectif

Construire un filet de sécurité qui reproduit les installations cassées **sans modifier le comportement du CLI**, afin que chaque correction des phases suivantes puisse être prouvée par un test qui passe.

Le harnais n'utilise jamais `test-project/`. Il crée des fixtures sous `%TEMP%`, isole `HOME`/`USERPROFILE` et exécute réellement le CLI dans un processus enfant.

---

## 2. Fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `packages/cli/tests/e2e/install-harness.ts` | Fixtures, shims npm/npx, snapshots, analyse d'imports, `tsc` optionnel |
| `packages/cli/tests/e2e/install.e2e.ts` | 8 scénarios d'installation réels |
| `packages/cli/vitest.e2e.config.ts` | Configuration dédiée, hors `bun run test` |
| `packages/cli/tests/e2e/README.md` | Mode d'emploi et limites du harnais |
| `PHASE-0-REPORT.md` | Ce rapport |
| `packages/cli/package.json`, `package.json` | Script `test:install-e2e` |

---

## 3. Fonctionnement du harnais

1. **Fixture** : `package.json`, `tsconfig.json` (alias `@/*` ou personnalisé), `rashwright-ui.json`, dossier composants. Option `src/` ou non.
2. **Isolation** : `HOME` et `USERPROFILE` pointent vers un dossier temporaire, donc le cache du registre distant ne pollue pas la machine.
3. **Shims package manager** : `npm`/`npx` sont remplacés par un script déterministe qui :
   - enregistre chaque commande dans `pm-commands.log` ;
   - applique ses effets sur le `package.json` de la fixture ;
   - ne fait aucun appel réseau.
4. **Exécution** : le vrai CLI est lancé avec `bun <cli>/src/index.ts`, `cwd` = fixture.
5. **Analyse indépendante** : les imports relatifs, les alias `tsconfig.paths` et les packages externes sont vérifiés sur disque. Le lockfile n'est jamais utilisé comme preuve.
6. **Snapshot** : avant/après pour prouver l'absence d'écriture (`init --dry-run`).
7. **TypeScript** : `tsc --noEmit` est exécuté seulement si la fixture possède réellement `node_modules/typescript`. Sinon le skip est affiché explicitement.

### Correctifs apportés au harnais pendant la Phase 0

- `PATH` était construit avec `path.sep` (`\`) au lieu de `path.delimiter` (`;`) sous Windows : les shims n'étaient donc jamais trouvés et le vrai `npx` téléchargeait Expo. Corrigé.
- Le scénario « registre distant » utilisait `spawnSync` alors que le serveur HTTP tournait dans le même processus : la boucle d'événements était bloquée. Remplacé par `runCliAsync` (`spawn`).
- `doctor --no-interactive` n'existe pas : option retirée du test.

Ces trois points étaient des défauts **du harnais**, pas du produit.

---

## 4. Résultats réels

Commande : `bun run test:install-e2e`
Résultat : **8 tests / 8 échecs**, durée ~8,5 s.

| # | Scénario | Exit CLI | Fichiers analysés | Imports non résolus | Constat réel |
|---|---|---|---|---|---|
| 1 | `add button` avec `src/` | 0 | 2 | 18 | Seuls `button.tsx` et `index.ts` sont copiés ; aucune fondation. |
| 2 | `add button` sans `src/` | 0 | 2 | 18 | Même défaut, chemins sans `src/`. |
| 3 | `add button` avec alias `~/*` | 0 | 2 | 18 | Les imports restent en `@/...` ; alias projet non respectés. |
| 4 | `add -t minimal` | 0 | 7 | 30 | Template + 4 composants copiés, aucune fondation ; `react-native-safe-area-context` absent de `package.json`. |
| 5 | `add -w metric` | 0 | 7 | 24 | Widget + 3 composants copiés, aucune fondation ; `@expo/vector-icons` absent de `package.json`. |
| 6 | `doctor` sur composant absent | 0 | 0 | 0 | Fichier manquant classé `warn` (« Intégrité Lockfile »), pas `error` ; code de sortie 0. |
| 7 | `init --dry-run` | 0 | 0 | 0 | `rashwright-ui.json` est écrit malgré `--dry-run`. |
| 8 | Registre distant index-only | 0 | 0 | 0 | Aucun manifeste téléchargé avant résolution ; le CLI affiche faussement « tous les composants sont déjà installés ». |

### Détail des imports non résolus (scénario 1)

Dans `src/components/ui/button.tsx` :

- `@/contexts/theme-context`
- `@/constants/glass-theme`
- `./text`
- `./liquid/liquid-pressable`
- `./liquid/liquid-highlight`
- `./liquid/liquid-border`
- `./liquid/liquid-types`

Dans `src/components/ui/index.ts` généré :

- les 8 exports `./liquid/*`
- `./view`
- `./text`
- `@/constants/glass-theme`

Soit **18 imports non résolus** alors que le CLI affiche `✔ Installation terminée`.

### Détail minimal / widget

- `add -t minimal` installe bien `minimal-template.tsx`, `card`, `button`, `badge`, `rashwright-logo`, mais oublie les fondations (`theme-context`, `glass-theme`, `text`, `view`, primitives liquid).
- `add -w metric` installe bien `metric-widget.tsx`, `card`, `badge`, `skeleton`, mais oublie les mêmes fondations et `@expo/vector-icons`.
- La commande `npx expo install react-native-reanimated` est bien interceptée et journalisée : la partie package manager fonctionne côté harnais.

---

## 5. Ce que ces échecs prouvent

1. Le succès affiché (`✔ Installation terminée`) ne correspond pas à l'état du disque.
2. Les fondations ne sont pas installées par `add` ; elles ne le sont que par `init`.
3. Les dépendances des templates/widgets ne sont pas intégrées au plan d'installation.
4. Les alias personnalisés ne sont pas appliqués aux fichiers copiés.
5. `doctor` ne retourne pas de code non nul sur une installation cassée.
6. `init --dry-run` écrit la configuration.
7. Le registre distant index-only est inutilisable : la résolution utilise le cache avant tout téléchargement.

---

## 6. Critères de sortie de la Phase 0

- [x] `bun run test:install-e2e` exécute les scénarios réels et échoue en démontrant les défauts actuels.
- [x] Chaque scénario produit un rapport lisible : fichiers, imports non résolus, TypeScript, exit code.
- [x] Aucun test ne dépend de `test-project/` ni d'un état manuel du dépôt.
- [x] `bun run test` reste vert : **51 fichiers / 245 tests**.
- [x] `bun run check-types` reste vert (CLI + UI).
- [x] Les échecs observés sont consignés dans ce rapport.

---

## 7. Limites assumées de la Phase 0

- Les installations npm/Expo sont **simulées** par des shims : aucun réseau, aucun `node_modules` réel. C'est volontaire pour rendre les tests rapides et déterministes.
- En conséquence, `tsc --noEmit` est **skipped explicitement** sur ces fixtures. L'analyse d'imports indépendante fait foi.
- Les tests finaux sur un vrai projet Expo vierge et un vrai projet existant restent suspendus tant que `test-project/` n'est pas entièrement supprimé.
- Les tests restent hors de `bun run test` jusqu'à ce qu'ils passent (Phase 8).

---

## 8. Prochaine étape

Revue **R1** : examiner le harnais, les 8 échecs ci-dessus et l'absence de modification du code produit.
La Phase 1 (registre) ne doit pas démarrer avant validation de cette revue.
