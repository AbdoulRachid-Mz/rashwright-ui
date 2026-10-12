# RASHWRIGHT UI MOBILE — REFONTE DU GÉNÉRATEUR DE TEMPLATES

## 1. Contexte et mission

Tu interviens sur le repository **Rashwright UI Mobile**, un système open source de distribution de composants et de templates React Native / Expo, piloté par le CLI `rs-ui`.

Le projet dispose déjà de plusieurs templates :

* `minimal`
* `showcase`
* `auth`
* `onboarding`
* `dashboard`
* `commerce`
* `settings`

Le fichier actuel `templates-manager.ts` centralise le catalogue, les métadonnées, le code source de plusieurs écrans sous forme de chaînes de caractères, les composants requis et la logique de copie.

Cette architecture fonctionne partiellement, mais elle limite l'évolution du projet : les templates sont difficiles à maintenir, à tester, à enrichir et à faire évoluer indépendamment.

### Mission

Analyser l'architecture actuelle puis refondre le système afin que :

1. Chaque template soit un véritable composant React Native autonome.
2. Chaque template possède son propre dossier et ses propres fichiers.
3. Les templates puissent contenir leurs composants internes, hooks, types, styles, assets et logiques auxiliaires.
4. Le CLI puisse installer un template avec `rs-ui add --template ou --t <nom>`.
5. L'installation résolve automatiquement les composants Rashwright et les dépendances nécessaires.
6. Tous les fichiers installés dans le projet utilisateur restent modifiables.
7. L'architecture permette de créer ultérieurement des templates beaucoup plus complets sans transformer le générateur en fichier monolithique.

Ne commence pas par réécrire le code. Commence par comprendre l'architecture actuelle, puis implémente une solution cohérente avec les modules déjà présents.

---

## 2. Règles architecturales

Respecte les principes suivants :

* TypeScript strict, sans `any`.
* Noms de fichiers en kebab-case.
* Composants React en PascalCase.
* Alias `@/` dans le projet utilisateur.
* Compatibilité Windows, macOS et Linux.
* Compatibilité avec les package managers déjà supportés : npm, pnpm, yarn et Bun.
* Réutilisation du registry, du résolveur de dépendances, du gestionnaire de fichiers, du lockfile et des Skills existants lorsque cela est pertinent.
* Aucune réinstallation inutile des dépendances déjà présentes.
* Aucune suppression silencieuse de fichiers utilisateur.
* Aucune génération de code source TSX à partir de grandes chaînes de caractères lorsque le template peut être fourni comme un véritable fichier.
* Pas de réécriture complète du CLI sans justification.

Respecte cette règle fondamentale :

**Un template doit être un composant composable et distribuable, pas une chaîne de code stockée dans un générateur.**

---

## 3. Phase A — Audit du système existant

Avant toute modification, inspecte les fichiers réellement présents dans le repository.

Examine notamment :

* `templates-manager.ts`
* `init.ts`
* la commande `add`
* `component-scaffolder.ts`
* `file-manager.ts`
* `package-manager.ts`
* `config-manager.ts`
* `lock-manager.ts`
* le registry des composants
* le système de résolution des dépendances
* le système de Skills
* le générateur d'index
* les tests des commandes
* les tests d'intégration
* la documentation

Identifie comment sont actuellement gérés :

1. Les métadonnées des templates.
2. Les fichiers source des templates.
3. Les composants requis.
4. Les dépendances transitives.
5. Les dépendances Expo.
6. Les chemins d'installation.
7. Les exports TypeScript.
8. La configuration Rashwright.
9. Le lockfile.
10. Les mises à jour et suppressions éventuelles.

Recherche aussi toutes les références à :

* `TemplateType`
* `TemplateMetadata`
* `AVAILABLE_TEMPLATES`
* `generateTemplateScreenCode`
* `setupStarterTemplate`
* `getTemplate`
* `getTemplateComponents`
* `--template`
* `screenFile`
* `screenComponentName`

Avant de supprimer ou de renommer une fonction publique, vérifie tous ses usages.

Présente brièvement les problèmes constatés, puis implémente les corrections. Ne t'arrête pas à un simple rapport d'analyse.

---

## 4. Phase B — Séparer les templates en modules autonomes

Créer une architecture modulaire cohérente avec le repository.

Structure cible indicative côté package :

```text
packages/ui-mobile/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── templates/
│   ├── registry.ts
│   ├── types.ts
│   ├── minimal/
│   │   ├── template.json
│   │   ├── minimal-template.tsx
│   │   └── index.ts
│   ├── auth/
│   │   ├── template.json
│   │   ├── auth-template.tsx
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── hooks/
│   │   ├── components/
│   │   └── assets/
│   ├── onboarding/
│   ├── dashboard/
│   ├── commerce/
│   ├── settings/
│   └── showcase/
└── ...
```

Cette structure est indicative : adapte-la au système de registry, au packaging npm et au processus de build réellement présents.

### Exigences

* Un template possède son propre répertoire.
* Son composant principal est un véritable fichier `.tsx`.
* Les sous-composants sont séparés lorsque cela améliore la lisibilité et la réutilisabilité.
* Les hooks métier ou de présentation sont isolés lorsque nécessaire.
* Les types propres au template sont séparés si le volume le justifie.
* Les styles restent proches des composants qui les utilisent.
* Les assets sont organisés dans le dossier du template.
* Les imports sont explicites et cohérents.
* Le composant principal est exporté de façon prévisible.

Ne crée pas artificiellement des dizaines de petits fichiers pour des éléments qui peuvent rester simples. La modularité doit faciliter la maintenance, pas la compliquer.

---

## 5. Phase C — Métadonnées et registry des templates

Créer un système de métadonnées typé.

Chaque template doit pouvoir déclarer, au minimum :

* `id`
* `name`
* `description`
* `version`
* `componentName`
* `files`
* `requiredComponents`
* `dependencies`
* `expoDependencies`
* `skills`
* `assets`
* `configuration`
* `entrypoint`
* `supportsGlass`, si pertinent
* les éventuels prérequis

Les champs doivent être facultatifs lorsqu'ils ne sont pas nécessaires.

Exemple conceptuel :

```json
{
  "id": "auth",
  "name": "Authentication Suite",
  "description": "Écrans d'authentification configurables",
  "version": "1.0.0",
  "componentName": "AuthTemplate",
  "entrypoint": "auth-template.tsx",
  "files": [
    "auth-template.tsx",
    "index.ts",
    "types.ts"
  ],
  "requiredComponents": [
    "button",
    "card",
    "text-input",
    "checkbox",
    "otp-input"
  ],
  "dependencies": [],
  "expoDependencies": [],
  "skills": [],
  "supportsGlass": false
}
```

Cet exemple sert de contrat initial. Ajuste les champs après l'audit des besoins réels.

Le registry doit permettre :

* de lister les templates ;
* de retrouver un template par identifiant ;
* de valider ses métadonnées ;
* de récupérer les fichiers associés ;
* de calculer ses dépendances ;
* de connaître son point d'entrée.

Évite de maintenir deux catalogues contradictoires.

Si le package utilise un registry central, celui-ci doit référencer les templates modulaires plutôt que contenir leurs écrans.

---

## 6. Phase D — Installer les templates dans le projet utilisateur

Tous les templates installés doivent être placés par défaut dans :

```text
src/components/templates/
```

Ce dossier doit correspondre à l'alias :

```text
@/components/templates
```

Exemple après installation :

```text
src/components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── templates/
    ├── auth/
    │   ├── index.ts
    │   ├── auth-template.tsx
    │   ├── types.ts
    │   ├── hooks/
    │   └── components/
    └── dashboard/
        ├── index.ts
        └── dashboard-template.tsx
```

Vérifie comment l'alias `@/` est configuré dans les projets générés. Ne suppose pas qu'il existe toujours dans un projet non initialisé.

### Exigences

* Le template conserve une structure lisible après installation.
* Les imports relatifs internes continuent de fonctionner.
* Les imports vers les composants partagés utilisent les conventions de Rashwright.
* Les fichiers associés sont copiés au bon emplacement.
* Les fichiers nécessaires ne sont pas oubliés.
* Les exports sont cohérents.
* Le code installé peut être modifié sans dépendre d'un runtime propriétaire du CLI.

Prévois un paramètre de configuration du chemin des templates si cela s'intègre proprement à la configuration existante. Le chemin par défaut reste `src/components/templates`.

Ne réutilise pas automatiquement `componentsPath`, qui représente actuellement le chemin des composants UI, sans vérifier l'impact sur les projets existants.

---

## 7. Phase E — Nouvelle commande `rs-ui add --template`

Ajouter la possibilité d'installer un template depuis la commande existante `add`.

Syntaxe principale :

```bash
rs-ui add --template auth
rs-ui add --template onboarding
rs-ui add --template dashboard
rs-ui add --template commerce
rs-ui add --template settings
```

Cette évolution ne doit pas casser les commandes existantes :

```bash
rs-ui add button
rs-ui add drawer
rs-ui add button drawer
rs-ui add drawer --no-skills
```

Si l'architecture Commander le permet, prendre en charge :

```bash
rs-ui add --template auth --no-skills
rs-ui add --template dashboard --dry-run
```

Respecter les options réellement disponibles et leur sémantique existante.

### Comportement de la commande

Lorsqu'un template est demandé :

1. Détecter le projet cible.
2. Vérifier que Rashwright est initialisé si cette condition est nécessaire.
3. Résoudre le template.
4. Afficher une erreur utile si le template n'existe pas.
5. Vérifier ses prérequis.
6. Calculer les fichiers à installer.
7. Résoudre les composants Rashwright requis.
8. Résoudre leurs dépendances transitives.
9. Collecter les dépendances npm et Expo.
10. Détecter les dépendances déjà installées.
11. Présenter un plan d'installation clair.
12. Copier les fichiers dans `src/components/templates/<nom>/`.
13. Installer les dépendances manquantes selon les conventions existantes.
14. Mettre à jour la configuration et le lockfile.
15. Afficher un récapitulatif avec l'import principal.

La commande ne doit pas remplacer l'écran principal de l'application de façon implicite. Elle installe un composant que le développeur choisit ensuite d'importer dans son écran.

Si un template nécessite une intégration particulière, afficher les instructions nécessaires plutôt que modifier silencieusement les fichiers d'entrée du projet.

---

## 8. Phase F — Résolution des dépendances

La résolution doit être un élément central du moteur de templates.

Un template peut dépendre :

* de composants UI ;
* de composants qui dépendent eux-mêmes d'autres composants ;
* de packages npm ;
* de packages Expo ;
* de modules natifs ;
* de fichiers auxiliaires ;
* de Skills ;
* de configurations spécifiques.

Réutilise le résolveur existant si ses capacités le permettent.

### Exemple

Le template `auth` déclare :

```text
button
card
text-input
checkbox
otp-input
```

Le CLI doit ensuite :

1. identifier les composants manquants ;
2. calculer leurs dépendances transitives ;
3. dédupliquer les composants ;
4. dédupliquer les packages ;
5. vérifier la compatibilité Expo ;
6. installer seulement ce qui manque ;
7. copier les fichiers du template ;
8. enregistrer les éléments installés.

Ne réimplémente pas une deuxième logique de résolution dans `templates-manager.ts`.

### Dépendances natives

Si un template utilise une bibliothèque nécessitant une configuration native, le CLI doit le signaler clairement.

Ne prétends pas qu'une dépendance native est opérationnelle uniquement parce que son package a été ajouté.

Lorsque cela est nécessaire, indique si un rebuild natif est requis et réutilise le mécanisme de diagnostic déjà disponible.

---

## 9. Phase G — Conception des templates complets

L'architecture doit permettre de créer des templates riches sans mettre toute leur logique dans un seul fichier.

### Exemple : Auth

Le template peut inclure :

* écran de connexion ;
* écran d'inscription ;
* formulaire de réinitialisation de mot de passe ;
* saisie OTP ;
* validation locale ;
* états de chargement ;
* affichage des erreurs ;
* callbacks configurables ;
* types de données ;
* composants internes ;
* hook de gestion de formulaire si nécessaire.

Il doit rester indépendant d'un fournisseur d'identité particulier, sauf si un futur template spécialisé le déclare explicitement.

### Exemple : Dashboard

Le template peut inclure :

* header ;
* résumé de statistiques ;
* cartes de métriques ;
* liste d'activité ;
* graphiques si les dépendances sont déclarées ;
* filtres ;
* états vide, erreur et chargement ;
* composants internes réutilisables.

### Exemple : Commerce

Le template peut inclure :

* recherche ;
* filtres ;
* liste de produits ;
* cartes de produits ;
* notation ;
* état du panier ;
* callbacks d'ajout au panier.

Les données d'exemple doivent être clairement identifiées comme des données de démonstration.

### Règle

Un template peut fournir une interface fonctionnelle et une logique locale, mais ne doit pas prétendre fournir un backend, un paiement ou une authentification réelle sans intégration correspondante.

Les interactions importantes doivent utiliser des callbacks et des types explicites afin que le développeur puisse brancher sa propre logique métier.

---

## 10. Phase H — Refactoriser les templates existants

Migrer les templates existants sans perdre les fonctionnalités déjà disponibles :

* `minimal`
* `showcase`
* `auth`
* `onboarding`
* `dashboard`
* `commerce`
* `settings`

Pour chacun :

1. créer son propre module ;
2. déplacer le JSX dans un véritable fichier TSX ;
3. conserver ses styles ;
4. vérifier tous ses imports ;
5. déclarer ses composants requis ;
6. déclarer ses dépendances ;
7. déclarer son point d'entrée ;
8. conserver ses fonctionnalités existantes lorsqu'elles sont correctes ;
9. corriger les problèmes découverts ;
10. ajouter les tests correspondants.

Ne te contente pas de déplacer le même écran monolithique dans un dossier : sépare les sous-composants et les hooks lorsque leur taille et leur responsabilité le justifient.

Le template `showcase` mérite un traitement particulier : détermine si son écran existe déjà dans le package, puis adapte son installation au nouveau modèle sans copier deux fois le même fichier.

---

## 11. Phase I — Compatibilité avec `rs-ui init`

Les templates utilisés pendant l'initialisation doivent réutiliser le même système de registry et les mêmes métadonnées que la commande `add`.

Évite deux implémentations différentes du même template.

Le système doit permettre :

* de choisir un starter lors de `rs-ui init` ;
* de générer le squelette initial ;
* d'installer ultérieurement d'autres templates avec `rs-ui add --template <nom>`.

Le choix d'un starter pendant `init` peut configurer l'écran initial selon les règles déjà existantes.

En revanche, l'installation ultérieure d'un template ne doit pas remplacer silencieusement l'écran principal.

Distingue clairement :

* **starter** : choix initial de structure ou d'écran ;
* **template installable** : composant d'interface réutilisable ajouté à un projet existant.

Les deux peuvent partager le même code source, mais leur comportement d'installation peut différer.

---

## 12. Phase J — Configuration et lockfile

Inspecter la structure actuelle de `rashwright-ui.json` et `rashwright-ui.lock`.

Le système doit pouvoir enregistrer les templates installés avec :

* identifiant ;
* version ;
* date d'installation si le projet utilise déjà ce type de métadonnée ;
* liste des fichiers gérés ;
* hashes des fichiers si le lockfile utilise déjà des hashes ;
* composants requis installés ;
* dépendances associées.

Évite de considérer automatiquement chaque template comme un composant UI classique si leurs cycles de vie sont différents.

Propose un modèle de données cohérent avec le lockfile existant.

Si une nouvelle section `templates` est nécessaire, ajoute-la de manière rétrocompatible.

Les anciennes configurations sans cette section doivent continuer à être lues.

N'écrase pas les métadonnées des composants déjà installés.

Les chemins enregistrés dans le lockfile doivent être normalisés et indépendants de l'OS.

---

## 13. Phase K — Gestion des conflits et sécurité

Si le répertoire du template existe déjà :

* ne pas écraser silencieusement ses fichiers ;
* détecter les fichiers existants ;
* distinguer les fichiers inchangés des fichiers modifiés par l'utilisateur ;
* proposer un comportement explicite conforme aux options existantes ;
* préserver le travail utilisateur.

Si un template est déjà installé :

* détecter sa présence ;
* éviter les copies inutiles ;
* indiquer si une mise à jour est disponible lorsque cette information existe ;
* ne pas réinstaller inutilement les mêmes dépendances.

Respecter `--dry-run`.

Le dry-run doit afficher les fichiers, composants et dépendances qui seraient installés sans écrire ni modifier de fichiers et sans installer de packages.

Ne présente jamais une installation comme réussie avant d'avoir vérifié les opérations correspondantes.

---

## 14. Phase L — Listing et découverte des templates

Étudier la commande `list` actuelle.

Si cela s'intègre proprement, permettre de découvrir les templates avec une syntaxe explicite telle que :

```bash
rs-ui list --templates
```

et de consulter les métadonnées d'un template.

La commande doit présenter :

* le nom ;
* l'identifiant ;
* la description ;
* la version ;
* les composants requis ;
* les dépendances particulières ;
* la commande d'installation.

Évite les options ambiguës ou les conflits avec le listing des composants.

La découverte doit être basée sur le registry réel, pas sur une liste dupliquée dans la commande.

---

## 15. Phase M — Skills IA

Réutiliser le système de Skills existant.

Un template peut déclarer un Skill propre, par exemple :

```text
skills/templates/auth/SKILL.md
```

Le Skill doit expliquer :

* la structure du template ;
* ses composants ;
* ses props ;
* ses callbacks ;
* ses dépendances ;
* ses limites ;
* les règles à suivre pour le modifier ;
* les conventions d'intégration dans un projet utilisateur.

Ne génère pas systématiquement un Skill si aucun n'est nécessaire.

Respecte les options existantes :

```bash
rs-ui add --template auth
rs-ui add --template auth --no-skills
```

Le comportement par défaut doit rester cohérent avec la politique globale des Skills du CLI.

---

## 16. Phase N — Tests obligatoires

Ajouter ou adapter les tests unitaires et d'intégration.

### Registry

* liste complète des templates ;
* récupération par identifiant ;
* identifiant inconnu ;
* métadonnées invalides ;
* point d'entrée absent.

### Installation

* installation d'un template ;
* copie de tous ses fichiers ;
* présence du composant principal ;
* présence des sous-composants ;
* imports cohérents ;
* chemin de destination correct ;
* composants requis résolus ;
* dépendances dédupliquées ;
* packages déjà installés non réinstallés inutilement.

### CLI

Tester au minimum :

```bash
rs-ui add --template auth
rs-ui add --template dashboard
rs-ui add --template commerce
rs-ui add --template onboarding
rs-ui add --template unknown
rs-ui add --template auth --dry-run
rs-ui add --template auth --no-skills
```

Vérifier que les commandes classiques restent opérationnelles :

```bash
rs-ui add button
rs-ui add drawer
rs-ui add button drawer
```

### Fichiers et conflits

* template déjà installé ;
* fichier existant ;
* fichier modifié manuellement ;
* configuration existante ;
* lockfile existant ;
* réinstallation ;
* dry-run ;
* chemins Windows ;
* chemins contenant des espaces.

### Intégration

Générer un projet de test et vérifier que :

1. le template est placé sous `src/components/templates/<nom>/` ;
2. le composant principal est importable ;
3. tous les fichiers nécessaires existent ;
4. les imports vers les composants UI fonctionnent ;
5. les métadonnées sont enregistrées ;
6. le lockfile est cohérent ;
7. TypeScript compile.

---

## 17. Phase O — Qualité du code et documentation

Éliminer les anciennes branches de génération qui ne sont plus utilisées, notamment `generateTemplateScreenCode`, après avoir migré tous ses usages.

Ne supprime aucune fonction avant d'avoir recherché ses références.

Mettre à jour :

* documentation des templates ;
* exemples de commandes ;
* README ;
* documentation du registry ;
* Skills concernés ;
* tests ;
* exemples générés.

Expliquer comment créer un nouveau template dans le repository.

Un futur contributeur doit pouvoir ajouter un template en créant son dossier, ses fichiers et ses métadonnées, sans modifier un immense `switch` central.

---

## 18. Critères d'acceptation

La refonte est considérée comme terminée lorsque :

* chaque template possède un vrai fichier TSX ;
* les templates sont organisés par dossier ;
* `rs-ui add --template auth` fonctionne ;
* les templates sont installés sous `src/components/templates/` par défaut ;
* les imports sont corrects ;
* les composants Rashwright requis sont résolus ;
* les dépendances transitives sont dédupliquées ;
* les dépendances Expo restent compatibles avec le SDK ;
* les Skills sont gérés selon les options existantes ;
* le lockfile et la configuration restent cohérents ;
* le dry-run n'effectue aucune écriture ;
* les fichiers modifiés par l'utilisateur sont protégés ;
* les commandes `rs-ui add button` et `rs-ui add drawer` continuent de fonctionner ;
* `rs-ui init` réutilise le même catalogue ;
* les tests, le typecheck et le build passent.

---

## 19. Ordre de travail

Procède dans cet ordre :

1. Auditer l'architecture existante.
2. Identifier le contrat réel du registry et des dépendances.
3. Définir les types et métadonnées des templates.
4. Créer les modules autonomes.
5. Migrer les templates existants.
6. Créer ou adapter le résolveur d'installation.
7. Ajouter `rs-ui add --template`.
8. Ajouter l'enregistrement dans la configuration et le lockfile.
9. Adapter `rs-ui init` pour partager le registry.
10. Ajouter les tests.
11. Mettre à jour la documentation.
12. Exécuter les tests, le typecheck et le build.
13. Corriger les régressions avant de conclure.

Ne t'arrête pas après avoir proposé une architecture : implémente les modifications dans le repository.

---

## 20. Rapport final exigé

À la fin, fournis :

### A. Audit

Les problèmes identifiés dans l'architecture initiale.

### B. Fichiers

La liste des fichiers créés, modifiés et supprimés.

### C. Architecture

La structure finale des templates côté package et côté projet utilisateur.

### D. CLI

Les commandes prises en charge et leurs comportements.

### E. Dépendances

Comment sont résolus les composants requis, les dépendances transitives et les modules Expo.

### F. Configuration

Les modifications de `rashwright-ui.json` et du lockfile.

### G. Tests

Les commandes réellement exécutées et leurs résultats.

### H. Limitations

Tout élément non terminé ou nécessitant une décision supplémentaire.

Ne prétends pas qu'un test a réussi s'il n'a pas été exécuté.

**Objectif final : transformer les templates Rashwright en modules d'interface complets, autonomes, composables, installables et extensibles, avec un moteur d'installation aussi fiable que celui des composants UI.**
