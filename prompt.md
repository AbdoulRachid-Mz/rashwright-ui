# PROMPT COMPLÉMENTAIRE — RASHWRIGHT UI
## AUDIT, ENRICHISSEMENT ET TRANSFORMATION DES TEMPLATES EN VÉRITABLES MODULES MULTI-SCREENS DE PRODUCTION

**Projet :** Rashwright UI Mobile  
**Packages concernés :** `@rashwright/ui-mobile` et `@rashwright/cli`  
**Version de référence :** `1.6.0`  
**Dépendance :** chantier complémentaire au `IMPLEMENTATION-PLAN.md` et à la remise en état du moteur d'installation `rs-ui`.

---

# 1. CONTEXTE ET OBJECTIF

Nous souhaitons faire évoluer profondément le système de templates de Rashwright UI.

Actuellement, les templates ne doivent plus être considérés comme de simples exemples, des démonstrations de composants ou des écrans isolés.

Nous voulons proposer de véritables **templates applicatifs complets, multi-écrans, fonctionnels, esthétiques et extensibles**, que les développeurs peuvent installer dans leurs projets React Native / Expo et utiliser comme fondation pour construire leurs propres applications.

Un template d'authentification, par exemple, ne doit pas uniquement fournir un formulaire de connexion.

Il doit fournir l'ensemble des écrans, composants, hooks, contextes, services, validations, types, configurations et logiques nécessaires à un véritable parcours d'authentification.

Même exigence pour les autres templates.

**Objectif : transformer chaque template Rashwright en un module de démarrage applicatif de qualité professionnelle, et non en une simple démonstration technique.**

# 2. RÈGLES ABSOLUES

1. Auditer tous les templates existants avant toute modification.
2. Ne supprimer aucun template existant.
3. Ne pas casser les API publiques ni la compatibilité avec les projets existants.
4. Utiliser prioritairement les composants officiels de `@rashwright/ui-mobile`.
5. Ne pas réimplémenter inutilement des composants déjà disponibles dans Rashwright UI.
6. Identifier et ajouter automatiquement toutes les dépendances nécessaires.
7. Ne jamais générer des écrans fictifs qui ne possèdent aucune logique fonctionnelle.
8. Ne pas créer des boutons, liens ou formulaires décoratifs sans comportement réel.
9. Respecter l'architecture et les conventions du projet cible.
10. Respecter Expo, React Native, TypeScript et les versions compatibles.
11. Ne pas imposer une architecture de navigation si le projet en utilise déjà une.
12. Ne pas écraser les fichiers existants sans stratégie explicite de protection.
13. Ne pas utiliser de données sensibles ou de véritables identifiants dans les exemples.
14. Ne pas introduire de dépendances inutiles.
15. Ne pas modifier la version des packages, publier sur npm ou créer une release.
16. Ne pas commencer les modifications avant d'avoir terminé l'audit et présenté les résultats.

# 3. PHASE 1 — AUDIT COMPLET DES TEMPLATES EXISTANTS

Inspecter individuellement tous les templates présents dans :

`packages/ui-mobile/templates/`

Pour chacun, analyser :

- Son objectif fonctionnel.
- Les écrans réellement fournis.
- Les écrans manquants.
- Les composants Rashwright utilisés.
- Les composants recréés inutilement.
- Les dépendances internes.
- Les dépendances npm et Expo.
- Les hooks, contextes, stores et services.
- Les types TypeScript.
- Les formulaires et validations.
- Les interactions et états de chargement.
- Les états vides et les erreurs.
- Les possibilités de personnalisation.
- La qualité du design.
- La cohérence de navigation.
- La qualité du responsive et des interactions tactiles.

Créer une matrice :

| Template | Écrans existants | Écrans manquants | Composants rs-ui | Logiques manquantes | Niveau de maturité |
|---|---|---|---|---|---|

Attribuer à chaque template un niveau :

- `demo` : démonstration simple.
- `starter` : base fonctionnelle mais incomplète.
- `production-ready` : module complet, cohérent et suffisamment robuste pour servir de base à une application réelle.

Ne pas attribuer le statut `production-ready` uniquement parce que les fichiers compilent.

# 4. PHASE 2 — CONCEVOIR DE VÉRITABLES TEMPLATES MULTI-SCREENS

Chaque template doit être conçu comme un ensemble organisé d'écrans indépendants.

Les écrans doivent être séparés dans des fichiers distincts, avec une architecture claire.

Exemple d'organisation possible :

```text
templates/
  auth/
    template.json
    README.md
    screens/
      login-screen.tsx
      register-screen.tsx
      forgot-password-screen.tsx
      reset-password-screen.tsx
      verify-email-screen.tsx
      verify-otp-screen.tsx
      onboarding-screen.tsx
    components/
      auth-header.tsx
      social-auth-buttons.tsx
      password-input.tsx
    hooks/
      use-auth.ts
    services/
      auth-service.ts
    schemas/
      auth-schema.ts
    types/
      auth.types.ts
    constants/
      auth.constants.ts
    navigation/
      auth-routes.ts
    index.ts
```

Cette structure est indicative et doit être adaptée aux conventions existantes de Rashwright UI.

Ne pas imposer systématiquement tous ces dossiers si certains ne sont pas nécessaires.

Chaque écran doit être directement exploitable, testable et personnalisable.

Les templates doivent également pouvoir être installés dans des projets utilisant Expo Router ou React Navigation, lorsque cela est pertinent.

Si une intégration de navigation est nécessaire, prévoir une adaptation propre à la structure détectée du projet, sans remplacer automatiquement sa navigation existante.

# 5. PHASE 3 — EXEMPLE DE RÉFÉRENCE : AUTH TEMPLATE

Le template `auth` doit devenir un véritable parcours d'authentification multi-écrans.

Écrans à étudier et à implémenter selon les fonctionnalités retenues :

### Écrans principaux

- Login.
- Register.
- Forgot Password.
- Reset Password.
- Email Verification.
- OTP Verification.
- Onboarding ou Welcome.

### Fonctionnalités complémentaires

- Affichage et masquage du mot de passe.
- Validation des formulaires.
- Vérification des champs obligatoires.
- Validation des formats email et téléphone.
- Gestion des erreurs serveur.
- Gestion des états de chargement.
- Prévention des soumissions multiples.
- Bouton de retour et navigation cohérente.
- États de succès et confirmation.
- Gestion des demandes de renvoi de code.
- Gestion du délai avant un nouvel envoi.
- Connexion sociale lorsque configurée.
- Persistance de session lorsque le backend le permet.
- Déconnexion si le template inclut un parcours authentifié.

### Architecture logique

Séparer clairement :

- Les écrans.
- Les composants partagés.
- Les schémas de validation.
- Les types.
- Les services d'authentification.
- Les hooks.
- Les interfaces de communication avec le backend.
- Les configurations et options.

Ne pas imposer un fournisseur d'authentification spécifique.

Créer une interface de service configurable permettant d'intégrer différents backends.

Prévoir au minimum :

- Un mode mock explicitement identifié pour la démonstration et les tests.
- Une interface permettant de brancher un backend réel.
- Des erreurs typées.
- Des réponses normalisées.
- Une gestion explicite des sessions.

Ne jamais prétendre qu'un utilisateur est authentifié lorsque le mode mock est utilisé.

Les intégrations OAuth, Firebase, Better Auth ou autres fournisseurs doivent être facultatives et clairement documentées.

# 6. PHASE 4 — UTILISER PRIORITAIREMENT LES COMPOSANTS RASHWRIGHT UI

C'est une exigence fondamentale.

Les templates doivent démontrer la richesse réelle de la bibliothèque Rashwright UI.

Pour chaque écran :

1. Identifier les composants disponibles dans `packages/ui-mobile/components/ui/`.
2. Identifier les hooks, contextes, thèmes, utilitaires et primitives disponibles.
3. Vérifier les API et exports réels des composants.
4. Sélectionner les composants adaptés.
5. Ajouter leurs dépendances internes et externes.
6. Utiliser les composants Rashwright plutôt que créer des équivalents locaux.

Exemples :

- Inputs et formulaires : composants de saisie Rashwright.
- Boutons : Button.
- Dialogues et confirmations : composants Dialog/Modal disponibles.
- Alertes : composants Alert.
- Chargement : Skeleton, Spinner ou composants disponibles.
- Sélection : Select, Checkbox, Radio et autres primitives existantes.
- Navigation : composants compatibles avec la navigation du projet.
- Feedback : Toast, Snackbar et notifications disponibles.
- Design : Card, Badge, Avatar, Separator, etc.

Cette liste n'est pas une affirmation de disponibilité : vérifier les exports et les API réels avant utilisation.

### Interdictions

- Ne pas recréer un Button local si le composant Rashwright existe.
- Ne pas créer un Input local sans vérifier les composants existants.
- Ne pas copier manuellement les fondations si le registre sait les résoudre.
- Ne pas utiliser des imports fictifs.
- Ne pas importer des composants qui ne sont pas exportés.
- Ne pas contourner le moteur de dépendances.

Si un composant indispensable n'existe pas dans Rashwright UI, le signaler et proposer son ajout à la bibliothèque dans un lot distinct, sans bloquer artificiellement le développement du template.

# 7. PHASE 5 — AUDIT ET ENRICHISSEMENT DES AUTRES TEMPLATES

Appliquer la même démarche à tous les templates existants.

Ne pas se limiter au template auth.

Pour chaque template, déterminer ce qu'un développeur attend réellement d'un module de démarrage professionnel.

Exemples de critères selon le domaine :

### Dashboard / Admin

- Vue d'ensemble.
- Statistiques.
- Activités récentes.
- Navigation.
- États de chargement.
- États vides.
- Filtres.
- Détails et actions contextuelles.

### E-commerce

- Catalogue.
- Détails produit.
- Recherche.
- Filtres.
- Panier.
- Gestion des quantités.
- Favoris si pertinent.
- Checkout.
- Confirmation de commande.
- Historique des commandes.
- États de paiement.

### Profile / Account

- Profil.
- Modification des informations.
- Avatar.
- Préférences.
- Paramètres.
- Sécurité.
- Déconnexion.

### Chat / Messaging

- Liste des conversations.
- Conversation individuelle.
- Bulles de messages.
- Composer.
- Pièces jointes si prises en charge.
- États d'envoi et d'échec.
- Gestion des messages non lus.

### Onboarding

- Plusieurs étapes.
- Progression.
- Navigation avant/arrière.
- Validation.
- Persistance du progrès si nécessaire.
- Écran de fin.

Ces exemples ne doivent pas conduire à inventer des templates qui n'existent pas.

Ils servent à enrichir les templates correspondants lorsqu'ils sont présents dans le dépôt.

Pour chaque template, produire une liste d'écrans et de fonctionnalités justifiée par son objectif réel.

Ne pas surcharger artificiellement un template avec des écrans sans rapport avec son domaine.

# 8. PHASE 6 — QUALITÉ UX/UI ET DESIGN PROFESSIONNEL

Le design doit être une priorité, au même titre que la logique fonctionnelle.

Les templates doivent être visuellement aboutis, fluides et cohérents.

### Exigences visuelles

- Hiérarchie visuelle claire.
- Espacements cohérents.
- Typographie lisible.
- Couleurs équilibrées.
- Composants bien structurés.
- Cartes et surfaces soignées.
- États visuels cohérents.
- Contrastes accessibles.
- Respect des zones de sécurité.
- Adaptation aux petits et grands écrans.
- Prise en charge du clavier.
- Gestion des débordements.
- Animations utiles et discrètes.
- Transitions fluides.
- Feedback tactile et visuel lorsque pertinent.

### Design system

Utiliser le système de thème Rashwright UI.

Respecter :

- Les couleurs sémantiques.
- Les modes clair et sombre.
- Les tokens d'espacement.
- Les rayons.
- Les typographies.
- Les variantes de composants.
- Les possibilités de personnalisation du projet cible.

Éviter les valeurs arbitraires répétées dans les écrans.

Ne pas imposer un thème spécifique si le projet possède déjà un thème.

### Qualité des interactions

Chaque action doit produire un résultat compréhensible :

- Les boutons doivent fonctionner.
- Les formulaires doivent valider.
- Les chargements doivent être visibles.
- Les erreurs doivent être explicites.
- Les confirmations doivent être accessibles.
- Les transitions doivent préserver le contexte.

Éviter les animations excessives, les écrans surchargés et les effets qui nuisent aux performances.

# 9. PHASE 7 — MANIFESTES ET INSTALLATION DES TEMPLATES

Les templates enrichis doivent être intégrés proprement au registre Rashwright.

Chaque manifeste doit déclarer de manière exhaustive :

- Les fichiers à installer.
- Les composants Rashwright requis.
- Les fondations requises.
- Les hooks requis.
- Les bibliothèques internes requises.
- Les packages npm.
- Les packages Expo.
- Les dépendances de configuration.
- Les prérequis de navigation.
- Les compatibilités Expo/RN.
- Les éventuelles étapes de configuration.

Le moteur doit résoudre récursivement ces dépendances.

L'installation d'un template ne doit pas se limiter à copier son dossier.

Elle doit également installer tous les composants et fondations nécessaires, en évitant les doublons.

Exemple conceptuel :

```text
auth-template
  ├── screens/*
  ├── components/*
  ├── services/*
  ├── schemas/*
  ├── Rashwright components
  │    ├── button
  │    ├── input
  │    ├── card
  │    └── alert
  ├── foundations
  │    └── theme-context
  └── npm / Expo dependencies
```

Le CLI doit pouvoir présenter un aperçu avant installation :

- Nombre de fichiers.
- Écrans.
- Composants Rashwright.
- Fondations.
- Packages à installer.
- Modifications de configuration.
- Conflits éventuels.

L'installation doit respecter le moteur transactionnel et le vérificateur définis dans le plan principal.

# 10. PHASE 8 — TESTS ET VALIDATION

Chaque template doit disposer de tests adaptés.

### Tests fonctionnels

- Affichage de chaque écran.
- Navigation entre les écrans.
- Validation des formulaires.
- Gestion des erreurs.
- États de chargement.
- Actions utilisateur.
- Services mockés.
- Comportements conditionnels.

### Tests d'intégration

Installer chaque template dans un projet Expo vierge.

Vérifier :

- Tous les fichiers sont présents.
- Tous les imports sont résolus.
- Tous les composants utilisés existent.
- Toutes les dépendances sont installées.
- La navigation est cohérente.
- Les types sont corrects.
- `tsc --noEmit` passe lorsque le projet dispose de la configuration nécessaire.

Réaliser également les tests dans des projets existants avec :

- `src/` et sans `src/`.
- Alias personnalisés.
- Thème déjà existant.
- Navigation déjà configurée.
- Composants Rashwright déjà installés.

### Validation visuelle

Vérifier les écrans sur différentes dimensions d'écran et dans les modes clair et sombre.

Une compilation réussie ne suffit pas à valider le design.

### Critère final

Aucun template ne doit être déclaré `production-ready` si :

- Il contient des écrans incomplets.
- Des interactions essentielles ne fonctionnent pas.
- Des imports sont cassés.
- Des composants Rashwright disponibles sont inutilement réimplémentés.
- Des dépendances sont absentes.
- Le design présente des problèmes majeurs d'utilisation.

# 11. PHASE 9 — DOCUMENTATION ET EXPÉRIENCE D'UTILISATION

Chaque template doit posséder une documentation propre.

Le README doit expliquer :

- Son objectif.
- Les écrans fournis.
- Les fonctionnalités disponibles.
- Les composants Rashwright utilisés.
- Les dépendances.
- Les prérequis.
- L'installation.
- La structure générée.
- La configuration.
- Le branchement du backend.
- Les possibilités de personnalisation.
- Les limitations éventuelles.

Le CLI doit également permettre de consulter ces informations.

Exemples souhaités :

```bash
rs-ui template list
rs-ui template info auth
rs-ui template add auth
```

Adapter ces commandes à l'architecture réelle existante.

# 12. LIVRABLES ATTENDUS

Avant toute modification, produire :

- `TEMPLATE-AUDIT.md` : audit individuel des templates.
- `TEMPLATE-ROADMAP.md` : ordre d'amélioration.
- `TEMPLATE-SCREEN-MATRIX.md` : écrans, composants et fonctionnalités.
- `TEMPLATE-DEPENDENCIES.md` : graphe des dépendances.
- `TEMPLATE-DESIGN-STANDARDS.md` : exigences UX/UI communes.

Après validation, procéder template par template.

Pour chaque template amélioré, fournir :

- La liste des fichiers ajoutés/modifiés.
- Les écrans créés.
- Les composants Rashwright réutilisés.
- Les dépendances ajoutées.
- Les fonctionnalités implémentées.
- Les tests réalisés.
- Les résultats de validation.
- Les éventuelles limitations restantes.

# 13. ORDRE D'EXÉCUTION ET CONTRÔLE

Ce chantier doit s'enchaîner avec la remise en état du moteur d'installation.

Il ne doit pas créer un moteur d'installation parallèle.

Ordre recommandé :

1. Terminer les phases 0 à 4 du plan principal.
2. Vérifier que le registre et le résolveur savent installer les dépendances internes et externes.
3. Réaliser l'audit des templates.
4. Valider la matrice des écrans et fonctionnalités.
5. Enrichir les templates individuellement.
6. Valider les manifestes et les dépendances.
7. Exécuter les installations réelles.
8. Vérifier les comportements, la compilation et le design.
9. Mettre à jour les documentations et le quality gate.

**Ne pas commencer tous les templates en même temps.**

Commencer par un template de référence, idéalement `auth`, pour définir une architecture et un niveau de qualité reproductibles.

Une fois ce template validé, appliquer les mêmes standards aux autres templates.

Ne pas considérer le template auth comme une raison de réécrire tous les autres templates avec la même architecture : chaque domaine doit conserver ses besoins propres.

# 14. CONSIGNE FINALE

Nous ne cherchons pas à augmenter artificiellement le nombre de fichiers, d'écrans ou de composants.

Nous voulons améliorer la qualité réelle des templates Rashwright.

Chaque template doit être :

- Complet dans son domaine.
- Multi-écrans lorsque le parcours le nécessite.
- Fonctionnel.
- Modulaire.
- Personnalisable.
- Cohérent avec Rashwright UI.
- Bien conçu visuellement.
- Facile à installer.
- Facile à comprendre.
- Facile à étendre.
- Compatible avec les projets Expo existants.

**Rashwright UI doit fournir des fondations applicatives professionnelles, pas seulement des composants isolés et des exemples d'utilisation.**

Commencer par l'audit et les livrables de la phase 1. Ne modifier aucun code avant présentation des résultats et validation explicite.