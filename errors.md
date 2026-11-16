PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add

  Rashwright UI Mobile — rs-ui add

? Sélectionnez les composants à installer (↑/↓ naviguer, Espace = cocher, a = tout, Entrée = va
lider, taper = filtrer)
 --force pour réinstaller)
 - icon-button               Bouton icône rond avec variants de style et retour haptique option
nel. [🥽 glass]  déjà installé (utilisez --force pour réinstaller)
>( ) like-button               Bouton J'aime interactif avec pulsation de rebond, halo de parti
cules, compteur dynamique, retour haptique et variantes Glass. [🥽 glass]
 - rashwright-logo           Logo officiel Rashwright (RS) en PNG avec fallback SVG textuel, ta
ille configurable. déjà installé (utilisez --force pour réinstaller)

like-button@1.0.0 · ios,android,web
↑↓ navigate • space select • a all • i invert • ⏎ submit



==============================================tsc errors===========================
PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> rs-ui add

  Rashwright UI Mobile — rs-ui add

√ Sélectionnez les composants à installer (↑/↓ naviguer, Espace = cocher, a = tout, Entrée = va
lider, taper = filtrer) like-button               Bouton J'aime interactif avec pulsation de re
bond, halo de particules, compteur dynamique, retour haptique et variantes Glass. [🥽 glass]
  → 1 composant(s) sélectionné(s)
  Plan d'installation:

  Fondations internes:
    + theme déjà installée [12 fichier(s)]
    + glass déjà installée [2 fichier(s)]
    + liquid déjà installée [8 fichier(s)]

  Composants demandés:
    + like-button@1.0.0 [1 fichier(s)]

  Intégrations système (providers React):
    • ThemeProvider

√ Continuer? Yes
√ Fondations traitées (3)
√ ✔ like-button@1.0.0 ajouté

  Vérification post-installation (indépendante du lockfile) :
    23 fichier(s) et 82 import(s) analysés
    ✖ TypeScript : tsc a retourné 2
    ⚠ TypeScript signale des erreurs hors des fichiers installés :
src/components/ui/text-input.tsx(13,3): error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?
src/components/ui/text-input.tsx(89,9): error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

  ✔ Installation terminée
    ✔ index.ts synchronisé avec 15 composants

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test> bunx tsc --noEmit
src/components/ui/text-input.tsx:13:3 - error TS2724: '"react-native"' has no exported member named 'TextInputFocusEventData'. Did you mean 'TextInputFocusEvent'?

13   TextInputFocusEventData,
     ~~~~~~~~~~~~~~~~~~~~~~~

src/components/ui/text-input.tsx:89:9 - error TS2322: Type '{ outlineStyle?: "none" | undefined; outlineWidth?: number | undefined; borderWidth?: number | undefined; flex: number; color: string; fontSize: number; paddingVertical: number; }' is not assignable to type 'Partial<Readonly<Omit<Readonly<Omit<TextStyle, "resizeMode" | "objectFit" | "tintColor" | "overlayColor"> & { resizeMode?: ImageResizeMode | undefined; objectFit?: "fill" | ... 4 more ... | undefined; tintColor?: ____ColorValue_Internal | undefined; overlayColor?: ____ColorValue_Internal | undefined; }>, never> & Om...'.
  Types of property 'outlineStyle' are incompatible.
    Type '"none" | undefined' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.
      Type '"none"' is not assignable to type '"solid" | "dotted" | "dashed" | undefined'.

89         input: {
           ~~~~~

  node_modules/react-native/types_generated/Libraries/StyleSheet/StyleSheetTypes.d.ts:870:3
    870   readonly [key: string]: Partial<____DangerouslyImpreciseStyle_Internal>;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from this index signature.


Found 2 errors in the same file, starting at: src/components/ui/text-input.tsx:13

PS C:\Users\user\Desktop\abdoul\dev\rashwright-office\rs-test>