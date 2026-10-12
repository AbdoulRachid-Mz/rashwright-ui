# RASHWRIGHT UI MOBILE v0.7.0 — CATALOGUE INITIAL DE TEMPLATES PROFESSIONNELS

## 1. Contexte et continuité du travail

Nous préparons la version `0.7.0` de `@rashwright/ui-mobile`, avec un moteur de templates modulaire.

Ce travail complète directement la tâche précédente portant sur la refonte du générateur de templates, le registre des templates, leur distribution en fichiers indépendants et la commande :

```bash
rs-ui add --template <nom>
```
ou 

```bash
rs-ui add --t <nom>
```


Avant de coder, analyse le projet existant, les composants disponibles, les conventions de code, le système de thème, le gestionnaire de dépendances, le moteur de copie des fichiers et les templates déjà présents.

Ne remplace pas aveuglément l'architecture existante. Réutilise ce qui fonctionne et propose les changements nécessaires en préservant la compatibilité avec les fonctionnalités existantes.

## 2. Objectif général

Construire un catalogue initial de templates mobiles professionnels, élégants, fluides et suffisamment génériques pour être utilisés dans différents projets React Native et Expo.

Les templates doivent être de véritables composants réutilisables, et non des maquettes statiques ou de grands blocs de code générés dans un seul fichier.

Chaque template doit :

* être installé individuellement via le CLI ;
* être copié dans `src/components/templates/<nom>/` ;
* être avoir un skill associé comme avec les composants;
* être importable directement dans le projet utilisateur ;
* utiliser les composants UI Rashwright disponibles ;
* embarquer ses propres sous-composants, hooks, types et ressources nécessaires ;
* déclarer explicitement ses dépendances ;
* être personnalisable sans modifier le moteur CLI ;
* fonctionner sans backend imposé ;
* présenter des états réalistes de chargement, d'erreur, de données vides et de succès lorsque cela s'applique ;
* respecter le système de thème du projet et rester compatible avec les principes d'accessibilité.

Les templates doivent être des bases d'interface prêtes à adapter, et non des applications complètes prétendant gérer automatiquement l'authentification, les paiements ou la synchronisation des données.

## 3. Catalogue initial à implémenter

Implémente en priorité les huit templates suivants. Les deux extensions suivantes peuvent être réalisées dans la même version si le moteur et les tests sont suffisamment stables.

### P0 — Templates fondamentaux

#### A. `auth`

Identifiant : `auth`

Nom affiché : `Authentication`

Prévoir des composants et variantes adaptés aux écrans suivants :

* connexion ;
* inscription ;
* récupération du mot de passe ;
* vérification par code OTP ;
* réinitialisation du mot de passe.

Exigences :

* champs de formulaire accessibles et correctement typés ;
* validation des champs et affichage des erreurs ;
* affichage/masquage du mot de passe ;
* indicateur de soumission ;
* callbacks configurables pour les actions ;
* prise en charge facultative d'un logo, d'un nom d'application et de fournisseurs OAuth visuels ;
* séparation claire entre interface et logique métier.

Ne simule pas une authentification réussie et ne déclare pas de fournisseur externe obligatoire.

#### B. `onboarding`

Identifiant : `onboarding`

Nom affiché : `Onboarding`

Prévoir :

* plusieurs étapes configurables ;
* titres, descriptions et illustrations facultatives ;
* indicateur de progression ;
* actions précédent, suivant, ignorer et terminer ;
* callbacks pour la navigation ;
* prise en charge d'une étape finale personnalisée.

Le composant doit s'adapter au nombre d'étapes et ne pas imposer un parcours fixe de trois écrans.

#### C. `dashboard`

Identifiant : `dashboard`

Nom affiché : `Dashboard`

Prévoir :

* en-tête personnalisable ;
* message de bienvenue ;
* cartes de statistiques ;
* raccourcis d'actions ;
* sections de contenu ;
* activité récente ;
* sections facultatives configurables.

Les données doivent provenir de props ou de sources fournies par l'application. Ne pas créer de dépendance à une API, à un système analytique ou à une base de données particulière.

Le template doit être assez générique pour des applications de gestion, de finance, de commerce, de services ou de productivité.

#### D. `profile`

Identifiant : `profile`

Nom affiché : `User Profile`

Prévoir :

* avatar et informations principales ;
* informations personnelles ;
* sections personnalisables ;
* actions du compte ;
* mode consultation ;
* mode édition facultatif ;
* gestion visuelle d'un avatar absent ;
* callbacks pour l'édition, l'enregistrement et les actions.

Ne pas imposer de fournisseur d'upload ou de stockage d'images.

#### E. `settings`

Identifiant : `settings`

Nom affiché : `Settings`

Prévoir des sections configurables :

* compte ;
* apparence ;
* préférences ;
* langue ;
* notifications ;
* confidentialité ;
* assistance ;
* informations sur l'application ;
* déconnexion.

Utiliser les mécanismes de thème déjà présents dans Rashwright lorsque cela est possible.

Les options doivent être configurables par props ou callbacks. Une option de réglage ne doit pas prétendre modifier une préférence système si aucune logique correspondante n'est fournie.

#### F. `list-detail`

Identifiant : `list-detail`

Nom affiché : `List & Detail`

Ce template doit être particulièrement soigné, car il pourra servir dans de nombreux projets.

Prévoir :

* une liste d'éléments typés ;
* une recherche configurable ;
* des filtres facultatifs ;
* des éléments personnalisables ;
* un écran ou panneau de détail ;
* des actions créer, modifier et supprimer, si activées ;
* pagination ou chargement progressif configurable ;
* états de chargement, erreur, liste vide et résultats absents ;
* callbacks pour les opérations métier.

Ne pas imposer de modèle de données universel. Définir une API de composants typée qui reste flexible.

#### G. `commerce`

Identifiant : `commerce`

Nom affiché : `Commerce`

Prévoir une base de commerce réutilisable :

* catalogue de produits ;
* recherche et catégories ;
* cartes de produits ;
* détail d'un produit ;
* sélection de variantes si nécessaire ;
* panier ;
* récapitulatif de commande ;
* états vide et chargement ;
* callbacks pour les actions commerciales.

Les données et opérations doivent rester contrôlées par l'application.

Ne pas intégrer un véritable système de paiement dans cette version. Prévoir un point d'intégration clair pour une future connexion à un fournisseur de paiement.

Ne pas imposer de backend ni de gestionnaire d'état global si le projet n'en possède pas.

#### H. `chat`

Identifiant : `chat`

Nom affiché : `Messaging`

Prévoir :

* liste des conversations ;
* avatar, aperçu du dernier message et horodatage ;
* vue d'une conversation ;
* bulles de messages ;
* zone de saisie ;
* indicateurs visuels facultatifs ;
* état vide ;
* callbacks d'envoi et d'interaction ;
* gestion visuelle des pièces jointes lorsque cette option est activée.

Ne pas imposer de WebSocket, de service de messagerie ou de backend. Les messages et leur envoi doivent être contrôlés par l'application hôte.

### P1 — Extensions du catalogue

#### I. `notifications`

Prévoir :

* liste de notifications ;
* regroupement par date ou catégorie ;
* indicateurs lu/non lu ;
* actions de marquage comme lu ;
* état vide ;
* callbacks pour les interactions.

Le template ne doit pas installer automatiquement une infrastructure de notifications push.

#### J. `booking`

Prévoir :

* sélection d'une date ;
* choix de créneaux ;
* résumé d'une réservation ;
* formulaire complémentaire facultatif ;
* état de confirmation ;
* callbacks de validation et de navigation.

Ne pas prétendre vérifier les disponibilités réelles sans source de données fournie par l'application.

## 4. Exigences de design communes

Tous les templates doivent partager une qualité visuelle cohérente, sans avoir exactement la même apparence.

### Direction artistique

Adopter une esthétique mobile moderne, professionnelle et sobre :

* hiérarchie visuelle évidente ;
* typographie lisible ;
* espaces réguliers ;
* alignements précis ;
* rayons et bordures cohérents ;
* contrastes accessibles ;
* interactions discrètes et fluides ;
* icônes cohérentes ;
* composants correctement dimensionnés ;
* utilisation raisonnée des ombres et des couleurs.

Éviter les interfaces surchargées, les gradients décoratifs systématiques, les cartes inutiles, les animations excessives et les effets visuels qui ralentissent l'interface.

Ne pas produire des templates qui ressemblent tous à une succession de cartes identiques. Choisir une composition adaptée au rôle de chaque écran.

### Système de thème

Respecter le système de thème Rashwright existant.

Prévoir au minimum :

* thème clair ;
* thème sombre ;
* couleurs sémantiques ;
* états de succès, avertissement et erreur ;
* couleurs de texte et de surface ;
* bordures et séparateurs cohérents.

Ne pas créer un second système de thème concurrent. Ne pas coder en dur les couleurs principales dans chaque composant lorsque des tokens de thème sont disponibles.

### Fluidité et adaptation

Les templates doivent :

* fonctionner sur différentes tailles d'écran ;
* gérer correctement les zones de sécurité ;
* éviter les débordements horizontaux ;
* respecter le clavier sur les formulaires ;
* permettre le défilement lorsque nécessaire ;
* éviter les changements de disposition brusques ;
* limiter les rendus inutiles ;
* utiliser les primitives de liste appropriées pour les collections longues ;
* respecter les préférences d'accessibilité disponibles.

N'ajoute pas d'animations complexes par défaut. Si une animation nécessite une dépendance native, celle-ci doit être déclarée dans les métadonnées et installée via le moteur de dépendances existant.

## 5. Architecture modulaire

Respecter l'architecture établie dans la tâche précédente.

Dans le package Rashwright, chaque template doit posséder un dossier indépendant comprenant ses métadonnées, son point d'entrée, ses composants et les ressources dont il a besoin.

Exemple indicatif :

```text
packages/ui-mobile/templates/
├── registry.ts
├── types.ts
├── auth/
│   ├── template.json
│   ├── index.ts
│   ├── auth-template.tsx
│   ├── components/
│   ├── hooks/
│   └── types.ts
├── dashboard/
├── onboarding/
├── profile/
├── settings/
├── list-detail/
├── commerce/
├── chat/
├── notifications/
└── booking/
```

Dans le projet utilisateur, les templates doivent être installés séparément :

```text
src/components/templates/
├── auth/
├── dashboard/
├── onboarding/
├── profile/
├── settings/
├── list-detail/
├── commerce/
├── chat/
├── notifications/
└── booking/
```

Cette structure est indicative : adapte les chemins à l'organisation réelle du dépôt, sans créer une seconde architecture redondante.

Chaque template doit exposer une API publique claire à partir de son `index.ts`.

Exemple d'utilisation attendue :

```tsx
import { AuthTemplate } from "@/components/templates/auth";

<AuthTemplate
  onSubmit={handleLogin}
  onForgotPassword={handleForgotPassword}
/>;
```

L'exemple illustre l'API recherchée. Les noms définitifs doivent correspondre aux exports réellement implémentés.

Un template doit pouvoir être importé sans importer automatiquement tous les autres templates.

## 6. Intégration au moteur CLI

Les templates doivent être enregistrés dans le registre central du moteur.

La commande attendue est :

```bash
rs-ui add --template auth
rs-ui add --template dashboard
rs-ui add --template commerce
```

Le moteur doit :

1. valider le nom du template ;
2. afficher des informations utiles avant l'installation ;
3. résoudre les composants Rashwright requis ;
4. résoudre les dépendances npm et Expo nécessaires ;
5. vérifier la compatibilité avec le projet ;
6. copier les fichiers du template ;
7. appliquer les modifications de configuration nécessaires ;
8. mettre à jour le registre local ou le lockfile selon l'architecture existante ;
9. afficher les prochaines étapes d'utilisation.

L'installation d'un template ne doit pas remplacer silencieusement l'écran principal de l'application.

Le comportement de `rs-ui init`, la génération des projets et l'ajout individuel de composants doivent rester compatibles avec le fonctionnement défini précédemment.

Si un composant requis est déjà installé, le moteur doit le détecter et éviter les doublons.

Si une dépendance existe déjà, vérifier sa compatibilité avant de proposer une modification.

Les conflits de fichiers doivent être détectés et traités explicitement. Aucun fichier utilisateur ne doit être écrasé silencieusement.

## 7. Dépendances et autonomie

Chaque template doit déclarer ses dépendances et ses composants requis.

Privilégier les composants Rashwright et les bibliothèques déjà utilisées par le projet.

Ne pas installer une nouvelle bibliothèque simplement pour un détail visuel qui peut être réalisé proprement avec les primitives existantes.

Inversement, ne réimplémente pas une fonctionnalité complexe lorsqu'une bibliothèque mature et compatible existe déjà dans l'écosystème Rashwright.

Le moteur doit distinguer clairement :

* les dépendances obligatoires ;
* les dépendances facultatives ;
* les composants Rashwright requis ;
* les ressources nécessaires ;
* les éventuelles contraintes de version Expo ;
* les étapes de reconstruction native, lorsqu'elles sont réellement nécessaires.

Ne pas déclarer une compatibilité SDK sans vérification.

## 8. Personnalisation et extensibilité

Concevoir les API des templates pour qu'un développeur puisse personnaliser :

* les données ;
* les libellés ;
* les couleurs sémantiques via le thème ;
* les actions ;
* les sections visibles ;
* les états ;
* les variantes utiles ;
* les éléments optionnels.

Éviter de créer une API excessivement complexe. Les props doivent être typées, documentées et cohérentes.

Lorsqu'une personnalisation importante est nécessaire, préférer la composition de sous-composants plutôt que l'accumulation de dizaines de props booléennes.

Les fichiers copiés doivent rester modifiables par le développeur. Rashwright ne doit pas imposer un runtime propriétaire pour afficher les templates.

## 9. Tests obligatoires

Ajouter des tests couvrant, selon l'infrastructure existante :

* l'enregistrement de tous les templates ;
* la validation des métadonnées ;
* les exports publics ;
* les fichiers requis ;
* les dépendances déclarées ;
* l'installation individuelle ;
* la détection des composants déjà présents ;
* les conflits de fichiers ;
* la compatibilité des chemins Windows et Unix ;
* les états essentiels des composants ;
* le typage des props ;
* la compatibilité avec les tests et le typecheck du package.

Vérifier également que l'installation d'un template ne copie pas les fichiers des autres templates.

Ne pas déclarer les tests réussis sans les avoir exécutés.

## 10. Documentation

Mettre à jour la documentation du CLI et du package avec :

* la liste des templates disponibles ;
* leur objectif ;
* leur commande d'installation ;
* leurs dépendances ;
* leur API publique ;
* un exemple d'utilisation ;
* les possibilités de personnalisation ;
* les limites fonctionnelles ;
* les instructions de reconstruction native si nécessaire.

Ajouter une commande de découverte des templates si elle s'intègre proprement au CLI existant. Ne pas introduire une commande concurrente inutile.

## 11. Organisation du travail

Procède dans cet ordre :

1. Auditer le moteur existant et les composants disponibles.
2. Identifier les templates existants pouvant être réutilisés.
3. Finaliser le registre et le contrat de métadonnées.
4. Implémenter les templates fondamentaux en respectant le système de design.
5. Ajouter les extensions si le socle est stable.
6. Intégrer chaque template à `rs-ui add --template`.
7. Tester l'installation dans un véritable projet Expo de test.
8. Vérifier les dépendances, les thèmes, les exports et les chemins.
9. Mettre à jour la documentation.
10. Exécuter les vérifications disponibles et corriger les régressions.

Si le périmètre est trop important pour être livré proprement en une seule passe, termine d'abord les huit templates P0 et le moteur qui les distribue. Ne livre pas dix templates incomplets simplement pour respecter le nombre prévu.

## 12. Critères d'acceptation

La tâche est considérée comme terminée lorsque :

* les templates sont des modules indépendants ;
* chaque template peut être ajouté individuellement ;
* les imports fonctionnent dans un projet Expo réel ;
* les composants requis sont installés ou détectés correctement ;
* les thèmes clair et sombre fonctionnent avec l'architecture existante ;
* les interfaces sont professionnelles, fluides et adaptées aux écrans mobiles ;
* les principaux états d'interface sont pris en charge ;
* aucune intégration métier fictive n'est présentée comme fonctionnelle ;
* aucun fichier utilisateur n'est écrasé silencieusement ;
* les fonctionnalités existantes du CLI restent opérationnelles ;
* les tests et le typecheck sont exécutés et leurs résultats rapportés.

À la fin, fournis un rapport indiquant les fichiers modifiés, les templates réellement terminés, les dépendances ajoutées, les tests exécutés, les problèmes connus et les éventuelles étapes restantes.

Ne modifie pas la version publiée ni ne déclenche de publication npm avant validation explicite du travail.

Le résultat attendu est un catalogue Rashwright cohérent, extensible et réellement utile, capable de fournir des interfaces de qualité professionnelle tout en laissant au développeur le contrôle total du code généré.
