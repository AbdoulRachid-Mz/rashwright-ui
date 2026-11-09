# Tests E2E d'installation — `@rashwright/cli`

Ces tests exécutent le **vrai CLI** dans des projets Expo temporaires et vérifient
le résultat sur disque, indépendamment du lockfile.

> **Statut : volontairement rouges avant les corrections.**
> Ils ne font pas partie de `bun run test`. Ne les rendez pas verts en modifiant
> les attentes : corrigez le produit, puis vérifiez que la raison de l'échec a
> réellement disparu.

---

## Commande

Depuis la racine du dépôt :

```bash
bun run test:install-e2e
```

Ou directement dans `packages/cli` :

```bash
bun run test:install-e2e
```

Résultat attendu en Phase 0 : **8 tests / 8 échecs**, chacun prouvant un défaut
produit documenté dans `PHASE-0-REPORT.md`.

---

## Ce que fait un scénario

1. Crée une fixture sous `%TEMP%` (`rs-ui-e2e-<nom>-<timestamp>`).
2. Écrit `package.json`, `tsconfig.json`, `rashwright-ui.json` et le dossier composants.
3. Prépare un `PATH` contenant des shims `npm`/`npx` déterministes.
4. Isole `HOME`/`USERPROFILE` pour ne pas polluer le cache du registre distant.
5. Exécute le CLI avec un `cwd` contrôlé.
6. Analyse les fichiers copiés :
   - imports relatifs ;
   - alias lus dans `tsconfig.compilerOptions.paths` ;
   - packages externes comparés à `package.json`.
7. Exécute `tsc --noEmit` **uniquement** si `node_modules/typescript` existe.
8. Affiche un rapport : exit code, fichiers analysés, imports non résolus, TypeScript.
9. Nettoie la fixture (sauf si `RS_UI_E2E_KEEP=1`).

Aucune fixture ne dépend de `test-project/` ni d'un état manuel du dépôt.

---

## Variables d'environnement

| Variable | Effet |
|---|---|
| `RS_UI_E2E_KEEP=1` | Conserve les fixtures et le dossier `meta` pour inspection manuelle. |
| `RS_UI_E2E_PM_FAIL=<texte>` | Fait échouer toute commande package manager contenant `<texte>` (tests d'échec). |
| `RS_UI_E2E_BUN=<chemin>` | Force le binaire Bun utilisé pour lancer le CLI. |

Exemple d'inspection :

```powershell
$env:RS_UI_E2E_KEEP = "1"
bun run test:install-e2e
```

Les chemins des fixtures sont affichés dans la sortie (`[e2e] cwd: ...`).
Ils contiennent aussi :

- `pm-commands.log` : commandes npm/npx interceptées ;
- `bin/fake-pm.mjs` : shim utilisé ;
- `home/` : HOME isolé.

---

## Limites

- Les installations npm/Expo sont **simulées** : aucun réseau, aucun `node_modules` réel.
- `tsc --noEmit` est donc généralement `skipped`, avec une raison affichée.
  L'analyse d'imports indépendante est la source de vérité de ces tests.
- Les tests sur un vrai projet Expo vierge/existant seront ajoutés après suppression
  complète de `test-project/`.

---

## Ajouter un scénario

1. Utiliser `createFixture({ name, withSrc, componentsPath, tsconfigPaths, aliases, dependencies })`.
2. Lancer `runCli` (ou `runCliAsync` si un serveur local tourne dans le même processus).
3. Vérifier les fichiers avec `fixtureExists`/`findFixtureFile`.
4. Vérifier les imports avec `analyzeImports`.
5. Toujours afficher un rapport lisible via le helper `report`.
6. Ne jamais assouplir une assertion pour faire passer un défaut produit.
