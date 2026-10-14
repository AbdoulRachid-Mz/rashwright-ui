# RASHWRIGHT UI MOBILE — RAPPORT DE CORRECTION ET REFONTE DU COMPOSANT TABS

> **Statut** : ✅ **CORRIGÉ ET VALIDÉ** (155 tests Vitest passés, 32 suites, 0 erreur TypeScript strict)  
> **Composant** : `packages/ui-mobile/components/ui/tabs.tsx`  
> **Skill IA associé** : `packages/ui-mobile/skills/tabs/SKILL.md`  
> **Définition Registre** : `packages/ui-mobile/registry/components/tabs.json`  
> **Suite de test** : `packages/cli/tests/tabs-component.test.ts`

---

## 1. Causes racines identifiées lors de l'audit

L'analyse minutieuse de l'ancienne implémentation a révélé 5 anomalies structurelles majeures :

1. **`zIndex: -1` sur la capsule active (`activeCapsule`)** :
   - *Impact visuel direct* : Sur iOS et particulièrement sous Android, attribuer un `zIndex` négatif à un élément enfant positionné en absolu le repousse derrière le contexte d'empilement du conteneur parent (`LiquidSurface`). L'indicateur passait derrière le fond ou provoquait un clipping visuel complet du premier onglet actif.
2. **`flex: 1` codé en dur sur le conteneur racine `<Tabs>`** :
   - *Impact layout* : `style={[{ flex: 1 }, style]}` forçait le composant racine à s'étirer indûment sur tout l'écran, déformant le layout lorsqu'il était intégré dans des Cards, Modales ou ScrollViews.
3. **Gestion asymétrique du mode contrôlé / non contrôlé** :
   - *Bug fonctionnel* : Le handler `setActiveTab` n'appelait que `onValueChange(newValue)` si ce dernier était fourni, sans mettre à jour `internalTab`. Résultat : un composant utilisé en mode non contrôlé avec un simple écouteur d'événement (`onValueChange`) ne mettait jamais à jour l'onglet actif au clic.
4. **Enregistrement redondant des onglets (`registerTab` / state `tabs`)** :
   - *Impact performance* : Chaque `TabsTrigger` exécutait un `useEffect` au montage appelant `registerTab(value)`, entraînant des re-renders en cascade du composant racine `Tabs` sans que ce tableau d'onglets ne soit jamais utilisé.
5. **Absence d'accessibilité native (WAI-ARIA Mobile)** :
   - *Conformité* : Aucun `accessibilityRole="tab"`, ni `accessibilityState={{ selected, disabled }}` n'était déclaré, empêchant les lecteurs d'écran (TalkBack, VoiceOver) d'identifier la nature et l'état des déclencheurs.

---

## 2. Modifications apportées

### Dans `packages/ui-mobile/components/ui/tabs.tsx`
- **Suppression du `zIndex: -1`** : Utilisation d'un positionnement absolu normalisé (`StyleSheet.absoluteFillObject`) avec `pointerEvents="none"` et élévation/ombrage doux sans clipping. Le contenu du trigger est isolé dans un sous-conteneur `triggerContent` à zIndex supérieur.
- **Suppression de `LiquidHighlight` superflu** : Élimination de la surcouche de brillance qui déformait la capsule active.
- **Layout racine flexible** : Remplacement de `flex: 1` par `width: "100%"` (`styles.tabsRoot`), respectant ainsi les contraintes du conteneur hôte.
- **Support Scrollable natif** : Ajout de la prop optionnelle `scrollable?: boolean` sur `<TabsList>` enveloppant le contenu dans une `ScrollView` horizontale lorsque les onglets dépassent la largeur disponible.
- **Gestion canonique contrôlé / non-contrôlé** :
  ```tsx
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalTab;

  const setActiveTab = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalTab(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );
  ```
- **Accessibilité complète** :
  - `TabsTrigger` : `accessibilityRole="tab"`, `accessibilityState={{ selected: isActive, disabled }}`, `accessibilityLabel`.
  - `TabsContent` : `accessibilityRole="summary"`.
- **Typage TypeScript strict** : `StyleProp<ViewStyle>` strict, zéro `any`.

---

## 3. Synchronisation du Skill IA et du Registre

1. **`packages/ui-mobile/skills/tabs/SKILL.md`** :
   - Correction de l'exemple d'utilisation (fourniture de code fonctionnel avec `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).
   - Documentation du mode non contrôlé, du mode contrôlé et du mode `scrollable`.
   - Correction de `supportsGlass: true` et ajout des bonnes pratiques de layout.
2. **`packages/ui-mobile/registry/components/tabs.json`** :
   - Correction de `supportsGlass` de `false` à `true`.
   - Ajout de la dépendance de composant interne `"text"`.

---

## 4. Validation et Tests

- **Test unitaire dédié** : `packages/cli/tests/tabs-component.test.ts` (6 tests unitaires validant l'absence de `flex: 1`, l'absence de `zIndex: -1`, la présence des rôles ARIA et la validité du registre).
- **Suite globale** : 32 fichiers de tests Vitest, **155 tests passés avec succès (100%)**.
- **Typecheck** : 0 erreur TypeScript (`@rashwright/cli` et `@rashwright/ui-mobile`).
