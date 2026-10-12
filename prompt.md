Analyse et corrige le CLI Expo/RN du dépôt `AbdoulRachid-Mz/rashwright-ui`, sans réécrire l’architecture inutilement.

Objectif principal : corriger `init` et `create` afin qu’ils détectent correctement :
1. un nouveau projet Expo vide ou inexistant ;
2. un projet Expo déjà existant ;
3. un projet React Native/Expo partiellement configuré ;
4. un projet non compatible ou invalide.

Contraintes :
- Respecter les SDK Expo supportés 54, 55, 56, 57 et 58.
- Utiliser la structure et les conventions recommandées par Expo pour chaque SDK.
- Ne jamais écraser les fichiers utilisateur sans confirmation explicite.
- Ne jamais lancer une initialisation Expo dans un projet déjà valide.
- Ajouter uniquement les fichiers manquants et leurs dépendances associées.
- Préserver les configurations existantes compatibles.
- Gérer correctement `package.json`, `app.json`/`app.config.*`, `tsconfig`, Babel, Metro, entrypoints et dossiers source.
- Garantir que l’ordre des opérations est sûr : détection, sauvegarde éventuelle, génération/ajout, installation des dépendances, validation finale.
- Corriger le problème actuel rencontré avec `rs-ui` lors de l’initialisation d’un nouveau projet.
- Éviter les faux positifs dans la détection d’un projet Expo.
- Rendre les opérations idempotentes : relancer la commande ne doit pas dupliquer ou casser les fichiers.

Inspecte d’abord les fichiers concernés dans `packages/cli/src`, notamment :
- `commands/init.ts`
- `commands/create.ts`
- `commands/reset.ts`
- `commands/deps.ts`
- `core/project-detector.ts`
- `core/expo-detector.ts`
- `core/starter-generator.ts`
- `core/package-manager.ts`
- `core/paths.ts`

Ajoute ou mets à jour les tests Vitest couvrant :
- nouveau projet Expo ;
- projet Expo existant ;
- projet partiellement configuré ;
- projet invalide ;
- SDK Expo 54 à 58 ;
- fichiers déjà présents ;
- dépendances manquantes ;
- relance idempotente de `init` ;
- échec et restauration après erreur.

Après les corrections, exécute les tests CLI, le typecheck et le build. Signale clairement les tests échoués qui sont préexistants et ne les masque pas. Ne modifie que les fichiers nécessaires et fournis un résumé des changements ainsi que des validations effectuées.