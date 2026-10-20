# Diagnostic & Résolution des Erreurs — NativeWind Dark Mode

## Statut : ✅ RÉSOLU (v1.0.1 / v1.2.0)

### Erreur initiale
```text
Web ERROR [Error: Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')]

Code: color-scheme.js
  44 | set(value) {
  45 | if (darkMode === "media") {
> 46 | throw new Error("Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')");
     | ^
  47 | }
  48 | if (!globalThis.window) {
  49 | throw new Error("Cannot manually set color scheme while not in a browser environment.");
Call Stack
  exports.colorScheme.set (node_modules\react-native-css-interop\dist\runtime\web\color-scheme.js:46:19)
  MutationObserver$argument_0 (node_modules\react-native-css-interop\dist\runtime\web\color-scheme.js:36:29)
```

### Cause racine
Sur le Web avec `react-native-css-interop` / NativeWind, lorsque le mode sombre n'est pas explicitement configuré en mode classe (`class`), il utilise par défaut la media query système (`media`). Tenter de basculer manuellement le thème via `colorScheme.set(...)` lève alors cette exception bloquante.

### Correctifs appliqués dans le générateur CLI (`nativewind-manager.ts`)
1. **Configuration Tailwind** : `tailwind.config.js` généré inclut systématiquement :
   ```javascript
   darkMode: "class",
   ```
2. **Initialisation CSS Interop** : Configuration automatique du flag d'interopérabilité pour le runtime Web :
   ```javascript
   import { StyleSheet } from "react-native";
   // Autorise le basculement manuel de thème sans exception
   ```
3. **Résultat** : Basculement transparent du mode sombre / clair sur Web, iOS et Android sans conflit d'API.

---

## v1.5.0 — Correctifs NativeWind v5 npm & Tests Windows

### ✅ RÉSOLU — `npm install --force` bloque indéfiniment avec NativeWind v5

**Cause racine** : `nativewind@5.0.0-rc.0` requiert `react-native-css@3.1.0-rc.0` qui lui-même requiert `react>=19`, `react-native>=0.81`, `lightningcss>=1.27.0`. La commande `npm install --force` entre dans un état de résolution infinie de conflits de peer-deps.

**Solution** : `npm install --legacy-peer-deps` — ignore les conflits de peer-deps sans bloquer. Appliqué dans :
- `buildProjectInstallCommand('npm')` → `"npm install --legacy-peer-deps"`
- `buildInstallCommand('npm', [...])` → `"npm install --legacy-peer-deps <packages>"`

**Fichiers modifiés** :
- `packages/cli/src/core/package-manager.ts`
- `packages/cli/src/commands/init.ts` (message d'erreur)
- `packages/cli/src/commands/fix.ts` (détection et avertissement npm)

### ✅ RÉSOLU — Tests flaky Windows (`afterEach` timeout 20s)

**Cause** : `rmSync({ recursive: true, force: true })` sur Windows prend parfois >20s sur des répertoires de tests volumineux. Le timeout par défaut de Vitest pour les hooks `afterEach` est 20s.

**Solution** : Ajout de `60_000ms` en 2ème argument de `afterEach` dans :
- `tests/monorepo.test.ts`
- `tests/nativewind-manager.test.ts`
- `tests/create-component.test.ts`
- `tests/backup-manager.test.ts`