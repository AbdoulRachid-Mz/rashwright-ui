# RASHWRIGHT UI MOBILE — ARCHITECTURE ET IMPLÉMENTATION D'UN SYSTÈME DE WIDGETS MODULAIRES

## 1. Ton rôle et ta mission

Tu interviens comme **architecte logiciel senior spécialisé en React Native, Expo, TypeScript, CLI, systèmes de registry, architecture modulaire et distribution de code source**.

Tu travailles directement dans le dépôt existant de **Rashwright UI Mobile**, un système open source de distribution de composants React Native/Expo, avec son CLI `rs-ui`, son registry, ses mécanismes d'installation, ses skills et ses Templates.

Ta mission consiste à concevoir et implémenter une nouvelle couche officielle appelée **Widgets**, en l'intégrant proprement au système existant sans détériorer les fonctionnalités déjà opérationnelles.

Ce travail ne consiste pas simplement à créer quelques composants ressemblant à des cartes de tableau de bord. Il consiste à construire un véritable mécanisme de distribution de widgets réutilisables, comparable conceptuellement à celui utilisé pour les Templates, mais adapté aux besoins et aux contraintes des widgets.

**Règle absolue : commence par auditer le dépôt, puis propose un plan d'implémentation détaillé avec des tâches vérifiables. N'effectue aucune modification du code avant d'avoir présenté ce plan et obtenu mon accord.**

Ne suppose jamais que tu connais l'architecture actuelle sans l'avoir vérifiée dans les fichiers du projet.

---

# 2. Vision générale du système

Rashwright doit évoluer vers un système modulaire permettant aux développeurs d'ajouter uniquement les fonctionnalités dont leurs applications ont besoin.

Le principe directeur est le suivant :

**Un moteur indépendant dans le CLI → des composants de base → des widgets distribuables → des showcases et des Templates qui les illustrent.**

Chaque couche doit avoir une responsabilité claire et pouvoir évoluer sans imposer une dépendance inutile aux autres couches.

Nous voulons notamment éviter :
- un système de widgets couplé à une seule application ;
- une architecture qui oblige à installer tous les widgets pour en utiliser un seul ;
- la duplication de composants déjà disponibles ;
- l'installation de dépendances inutiles ;
- des modifications risquant de casser les Templates ou les installations de composants existantes ;
- des widgets qui ne fonctionnent que dans le dépôt de la bibliothèque, mais échouent dans un véritable projet consommateur ;
- un système difficile à étendre lorsqu'on voudra ajouter des dizaines de widgets.

Le résultat doit permettre à un développeur de sélectionner un widget, de l'installer dans son projet, de comprendre son fonctionnement grâce à son skill, puis de le personnaliser librement.

## 2.1. Comprendre ce qu'est un widget dans ce projet

Dans Rashwright, un widget est un **bloc d'interface fonctionnel, réutilisable et distribuable indépendamment**, composé éventuellement de plusieurs composants UI, d'une logique locale, de styles, de types et de dépendances externes.

Exemples :
- `MetricWidget` : indicateur avec valeur, tendance et description ;
- `ProgressWidget` : progression vers un objectif ;
- `QuickActionsWidget` : groupe d'actions rapides ;
- `FinanceWidget` : résumé financier ;
- `ChartWidget` : visualisation de données ;
- `ActivityFeedWidget` : activité récente.

Un widget n'est pas :
- une application autonome ;
- un widget natif Android ou iOS affiché sur l'écran d'accueil du téléphone ;
- un Template complet ;
- un simple alias d'un composant existant.

Le périmètre de ce chantier est exclusivement celui des **widgets intégrés dans les écrans d'une application React Native/Expo**.

Les widgets natifs du système d'exploitation ne font pas partie de cette implémentation.

---

# 3. Principe architectural fondamental : les widgets comme une couche indépendante

Nous voulons un système conceptuellement similaire à celui des Templates, mais qui possède ses propres règles et son propre catalogue.

Les composants, les widgets, les Templates et les showcases ne doivent pas être confondus.

### A. Composants

Ce sont les briques UI fondamentales : boutons, champs, cartes, textes, avatars, icônes, modales, indicateurs de progression, etc.

### B. Widgets

Ce sont des unités fonctionnelles de niveau supérieur, composées à partir des composants disponibles et, si nécessaire, de bibliothèques spécialisées.

### C. Templates

Ce sont des structures ou des écrans de départ distribuables, lorsque l'architecture actuelle de Rashwright le permet.

Ils pourront éventuellement réutiliser les widgets, mais ne doivent pas devenir obligatoirement dépendants de toute la bibliothèque de widgets.

### D. Showcases

Ce sont des démonstrations permettant de voir les widgets fonctionner dans de vrais écrans, avec des données d'exemple, des interactions et plusieurs états d'interface.

Ils servent à la documentation, à la validation visuelle et à la compréhension du système.

## 3.1. Schéma conceptuel cible

Le schéma suivant exprime l'intention architecturale, pas une obligation de modifier arbitrairement la structure actuelle des dossiers.

```text
Rashwright UI Mobile
│
├── CLI / Engine
│   ├── Components
│   ├── Widgets
│   ├── Templates
│   └── Skills / Documentation
│
├── Registry
│   ├── Component entries
│   ├── Widget entries
│   └── Template entries
│
├── Components
│   ├── Existing UI components
│   └── Additional reusable components
│
├── Widgets
│   ├── MetricWidget
│   ├── ProgressWidget
│   ├── QuickActionsWidget
│   ├── FinanceWidget
│   ├── ChartWidget
│   └── ActivityFeedWidget
│
├── Skills
│   ├── Individual widget skills
│   └── Widget development guidance
│
└── Showcases
    ├── Individual widget examples
    ├── Finance dashboard
    └── Analytics dashboard
```

Inspecte l'architecture existante avant de choisir la structure physique définitive. Réutilise les conventions existantes si elles sont pertinentes. Ne crée pas de nouveaux répertoires ou de nouvelles abstractions simplement pour reproduire ce schéma à l'identique.

---

# 4. Phase 0 — Audit obligatoire du dépôt

Avant toute implémentation, examine méthodiquement le projet.

## 4.1. Audit du CLI et des Templates

Étudie notamment :
- la structure des packages et du monorepo, s'il y en a un ;
- le package `@rashwright/cli` ;
- les commandes et sous-commandes de `rs-ui` ;
- le système de registry et ses métadonnées ;
- le fonctionnement de l'ajout d'un composant ;
- le fonctionnement de l'installation d'un Template ;
- la résolution des dépendances ;
- la gestion des fichiers et des chemins d'installation ;
- les différents gestionnaires de paquets pris en charge ;
- le traitement de la configuration du projet consommateur ;
- les mécanismes d'initialisation, de validation et de mise à jour ;
- la gestion des erreurs et des installations partielles ;
- les tests existants et les workflows CI.

Réponds notamment aux questions suivantes :
1. Comment le CLI sait-il qu'une ressource est un composant ou un Template ?
2. Comment les ressources sont-elles déclarées dans le registry ?
3. Comment les fichiers sont-ils récupérés et copiés dans le projet cible ?
4. Comment les dépendances sont-elles détectées et installées ?
5. Comment les conflits de fichiers sont-ils gérés ?
6. Comment les skills sont-ils associés aux ressources ?
7. Comment les Templates déclarent-ils leurs propres dépendances ou prérequis ?
8. Quelle est la manière la plus simple d'ajouter une catégorie Widgets sans casser les mécanismes existants ?

Ne te limite pas à lire le README. Suis les chemins de code réellement utilisés par les commandes du CLI.

## 4.2. Audit des composants existants

Inspecte les composants réellement présents dans le dépôt et dans le registry.

Recherche en particulier :
- les cartes et surfaces ;
- les composants de texte et d'icônes ;
- les boutons et actions ;
- les composants de progression ;
- les listes ;
- les séparateurs ;
- les composants de chargement et les skeletons ;
- les composants de graphiques éventuels ;
- les composants de formulaires ;
- les animations ;
- les primitives Liquid Glass ;
- les mécanismes de thème.

Le but est de déterminer ce qui peut être réutilisé directement, ce qui nécessite une amélioration et ce qui manque réellement.

Ne recrée pas un composant déjà disponible sous un autre nom sans justification technique.

## 4.3. Audit des skills, de la documentation et des exemples

Détermine :
- comment les skills sont organisés ;
- comment ils sont installés et mis à jour ;
- comment ils référencent les composants ou Templates ;
- où se trouvent les exemples et les showcases ;
- comment les nouvelles ressources sont documentées ;
- quelles conventions doivent être respectées pour qu'un skill soit réellement utile à une IA de développement.

## 4.4. Livrables de l'audit

Présente un rapport contenant :

1. L'architecture actuelle constatée.
2. Le parcours réel d'installation d'une ressource.
3. Les fichiers et mécanismes qui seront probablement modifiés.
4. Les éléments réutilisables.
5. Les lacunes qui doivent être corrigées.
6. Les risques de régression.
7. Les décisions architecturales recommandées.
8. Les points qui nécessitent mon arbitrage.
9. Une proposition de structure pour les widgets.
10. Une liste de tests nécessaires.

Pour chaque constat important, indique les chemins de fichiers concernés et explique leur rôle.

**À la fin de cette phase, arrête-toi. Présente ensuite le plan détaillé des tâches et attends mon accord avant de modifier le code.**

---

# 5. Phase 1 — Concevoir le moteur Widgets dans le CLI

C'est la priorité architecturale du projet.

Nous voulons d'abord établir comment le système reconnaît, décrit, valide, installe et documente un widget. Ce mécanisme doit être conçu avant de multiplier les widgets.

## 5.1. Créer un modèle de ressource Widgets

Définis le modèle de métadonnées le plus simple qui couvre les besoins réels.

Il doit pouvoir représenter, selon les conventions du dépôt :
- un identifiant unique ;
- un nom et une description ;
- une catégorie ou des tags ;
- la version ou le mécanisme de versionnement existant ;
- les fichiers nécessaires ;
- les composants Rashwright requis ;
- les dépendances externes ;
- les prérequis éventuels ;
- les instructions d'installation ;
- le skill associé ;
- la documentation et les exemples ;
- les contraintes de compatibilité pertinentes.

Ces champs sont des exigences conceptuelles. Leur représentation technique doit être décidée après l'audit.

Évite les métadonnées redondantes et les mécanismes de configuration inutiles.

Le système doit pouvoir évoluer pour accueillir de nouveaux widgets sans réécrire l'architecture.

## 5.2. Intégrer les widgets au CLI

Propose et implémente, après validation du plan, une commande cohérente avec les conventions actuelles.

Par exemple :

```bash
rs-ui add --widget metric
rs-ui add --widget progress
rs-ui add --widget quick-actions
rs-ui add --widget finance
rs-ui add --widget chart
rs-ui add --widget activity-feed
```

Ces commandes sont des exemples d'interface attendue. Vérifie d'abord la syntaxe réelle du CLI et adapte-les si nécessaire.

Le moteur doit :
- reconnaître la ressource comme un widget ;
- retrouver sa définition dans le registry ;
- récupérer les fichiers nécessaires ;
- résoudre les dépendances internes ;
- installer ou signaler les dépendances externes nécessaires ;
- gérer les gestionnaires de paquets pris en charge ;
- détecter les conflits et les erreurs ;
- afficher des messages utiles ;
- éviter de modifier inutilement le projet consommateur ;
- permettre d'installer un seul widget sans importer le catalogue complet.

Il doit être possible de distribuer un widget indépendamment des autres widgets.

## 5.3. Préserver les mécanismes existants

Le moteur Widgets doit s'intégrer au système existant plutôt que créer un deuxième CLI parallèle.

Ne duplique pas la logique de téléchargement, de résolution des dépendances, d'écriture des fichiers ou de validation si ces fonctions existent déjà et peuvent être réutilisées proprement.

Cependant, ne transforme pas toute l'architecture actuelle en système abstrait complexe dans le seul but d'éviter quelques lignes de code.

Privilégie :
- la réutilisation des mécanismes éprouvés ;
- des responsabilités clairement séparées ;
- une compatibilité avec les ressources actuelles ;
- des modifications minimales et faciles à maintenir.

Les composants, Widgets et Templates doivent rester distinguables dans les commandes, le registry et la documentation.

## 5.4. Dépendances entre widgets et composants

Un widget doit pouvoir déclarer ses dépendances envers des composants Rashwright.

Exemple conceptuel :

```text
FinanceWidget
├── Card
├── ThemedText
├── Button
└── Icon
```

Ce graphe est illustratif : les dépendances réelles doivent correspondre au code effectivement écrit.

Si le CLI sait déjà gérer les dépendances entre ressources, réutilise ce mécanisme.

Sinon, propose une extension minimale permettant de :
- détecter les composants internes requis ;
- identifier les dépendances déjà présentes ;
- installer les ressources manquantes de façon cohérente ;
- détecter les dépendances circulaires ;
- expliquer clairement les conflits ;
- éviter d'écraser silencieusement les modifications de l'utilisateur.

Ne réinstalle pas inutilement un composant déjà disponible.

Ne crée pas une dépendance artificielle entre tous les widgets.

## 5.5. Compatibilité et migration

Les anciennes commandes et les anciennes ressources doivent continuer à fonctionner.

Vérifie notamment :
- `rs-ui init` ;
- l'ajout de composants existants ;
- l'installation de Templates existants ;
- les mécanismes de skills existants ;
- les builds du CLI ;
- les validations du registry ;
- les workflows de publication existants.

N'impose pas une migration globale des ressources si elle n'est pas nécessaire.

---

# 6. Phase 2 — Compléter les composants de base nécessaires

Une fois le moteur Widgets défini et validé, identifie les composants UI manquants pour construire les premiers widgets.

Ne commence pas par développer tous les composants possibles.

Établis une matrice avec :
- le composant ;
- son existence actuelle ;
- sa qualité et ses éventuelles lacunes ;
- son utilité ;
- les widgets qui en dépendent ;
- les modifications nécessaires ;
- sa priorité.

Examine particulièrement :
- les cartes ;
- les variantes typographiques ;
- les badges et indicateurs de tendance ;
- les boutons et icônes ;
- les barres et indicateurs de progression ;
- les listes ;
- les états de chargement ;
- les états vides et les erreurs ;
- les éléments de visualisation des données ;
- les primitives nécessaires au thème et aux animations.

Améliore les composants existants lorsque c'est plus cohérent que d'en créer de nouveaux.

Toute modification doit préserver autant que possible :
- les API déjà utilisées ;
- les exports existants ;
- la compatibilité avec les projets consommateurs ;
- les conventions de thème ;
- l'accessibilité ;
- la compatibilité avec les versions d'Expo et React Native prises en charge.

Ne refactorise pas des parties sans rapport avec les widgets.

---

# 7. Phase 3 — Implémenter le premier catalogue de widgets

Après la validation du moteur et des composants nécessaires, implémente les widgets par lots.

Commence par les widgets simples, puis passe aux widgets plus spécialisés.

## Lot A — Widgets fondamentaux

### A1. MetricWidget

Widget de statistiques comprenant, selon les options :
- un titre ;
- une valeur ;
- une description ;
- une évolution positive, négative ou neutre ;
- un indicateur de tendance ;
- une icône facultative ;
- des variantes visuelles compatibles avec le thème.

Le widget doit accepter des valeurs numériques et textuelles appropriées, sans imposer un format métier unique.

L'évolution peut être absente. Une donnée indisponible ne doit pas être transformée arbitrairement en zéro.

### A2. ProgressWidget

Widget de progression comprenant :
- un titre ;
- une valeur actuelle ;
- une valeur cible facultative ;
- un pourcentage ou une progression calculée ;
- un libellé facultatif ;
- plusieurs variantes de présentation adaptées aux composants existants.

Gère correctement les valeurs limites et les entrées invalides.

### A3. QuickActionsWidget

Widget permettant d'afficher un groupe d'actions sous forme de grille ou de rangée.

Chaque action peut comprendre :
- une icône ;
- un libellé ;
- une action ou un callback ;
- un état désactivé ;
- une indication facultative.

Respecte les conventions d'accessibilité et les composants d'interaction existants.

Ces trois widgets doivent servir de preuve de concept complète du nouveau système de distribution.

## Lot B — Widgets d'analyse et d'activité

### B1. ChartWidget

Widget de visualisation de données.

Avant de le développer, décide après l'audit :
- si une bibliothèque de graphiques existe déjà ;
- si une dépendance externe est réellement nécessaire ;
- quelles formes de graphiques seront prises en charge dans le premier lot ;
- comment les données et les couleurs du thème seront configurées ;
- comment afficher les états vide et chargement.

Ne construis pas artificiellement un moteur graphique complet si une bibliothèque éprouvée répond au besoin.

Si une dépendance externe est retenue, justifie son poids, sa compatibilité Expo, sa maintenance et son coût d'intégration.

### B2. ActivityFeedWidget

Widget de liste d'activités récentes avec :
- une icône ou un indicateur ;
- un titre ;
- une description facultative ;
- une date ou un libellé temporel fourni ou formaté selon une stratégie explicite ;
- un callback facultatif ;
- un état vide ;
- une limite d'éléments affichés, si nécessaire.

Il ne doit pas imposer un backend, un service de notification ou un format métier spécifique.

## Lot C — Widget financier

### C1. FinanceWidget

Ce widget servira de démonstration d'un bloc métier générique, particulièrement pertinent pour les applications de gestion financière telles qu'Ajiya ta.

Il peut réunir :
- un solde ;
- des revenus ;
- des dépenses ;
- une tendance ou une période ;
- une action facultative ;
- des données ou sous-sections facultatives.

Le widget doit uniquement présenter les données qui lui sont fournies.

Il ne doit pas :
- calculer un véritable solde à partir de données inconnues ;
- effectuer de transaction ;
- se connecter à un backend particulier ;
- imposer une structure de base de données ;
- introduire des règles métier spécifiques à Ajiya ta.

Les calculs purement présentatifs doivent être documentés. Les calculs financiers réels restent sous la responsabilité de l'application.

**Ordre de priorité : Lot A, puis Lot B, puis Lot C.** Réévalue cet ordre uniquement si l'audit révèle une contrainte technique justifiée.

---

# 8. Phase 4 — Skills individuels et documentation

Chaque widget doit posséder son propre skill, intégré au mécanisme de skills existant.

Le skill doit aider un développeur ou un agent IA à comprendre comment utiliser le widget sans inventer des propriétés ni des dépendances.

Pour chaque widget, documente :

1. Le rôle du widget.
2. Les cas d'utilisation adaptés.
3. La commande d'installation réelle.
4. Les dépendances requises.
5. Les imports réels.
6. Les propriétés TypeScript exactes.
7. Les propriétés obligatoires et facultatives.
8. Un exemple minimal qui compile.
9. Un exemple plus complet.
10. Les variantes de style prises en charge.
11. La gestion du thème.
12. Les interactions et callbacks.
13. Les états de chargement, d'erreur et de données vides, lorsqu'ils sont pertinents.
14. Les contraintes d'accessibilité.
15. Les erreurs d'utilisation fréquentes.
16. Les bonnes pratiques de personnalisation.
17. Les limites connues du widget.

Les exemples doivent être générés ou vérifiés à partir de l'implémentation réelle.

Ne documente jamais une propriété qui n'existe pas.

Ne crée pas un skill générique unique qui remplacerait tous les skills individuels.

Un guide général de création de widgets peut compléter les skills, mais chaque widget doit disposer de sa propre documentation opérationnelle.

Vérifie également comment les skills sont distribués et installés dans le système actuel. Ne suppose pas que la simple présence d'un fichier suffit à le rendre accessible au développeur.

---

# 9. Phase 5 — Showcases et Templates de démonstration

Les widgets doivent pouvoir être observés en fonctionnement dans des écrans cohérents.

Il faut donc créer des showcases qui illustrent leur comportement réel, et non uniquement des captures statiques.

## 9.1. Showcase individuel

Pour chaque widget, fournis au minimum un exemple de référence avec :
- des données fictives clairement identifiées ;
- une utilisation réelle du widget ;
- une configuration représentative ;
- une interaction si le widget en propose ;
- un état vide ou de chargement lorsque cela est pertinent.

## 9.2. Finance Dashboard Showcase

Crée un écran de démonstration financière regroupant, selon les widgets réellement disponibles :
- `FinanceWidget` ;
- `MetricWidget` ;
- `ChartWidget` ;
- `ActivityFeedWidget` ;
- `QuickActionsWidget` ;
- éventuellement `ProgressWidget`.

Cet écran doit permettre de comprendre comment plusieurs widgets s'assemblent dans une application.

Les données seront fictives, locales et faciles à remplacer.

Les actions doivent être fonctionnelles dans la mesure du possible. Par exemple, une action peut modifier un état local ou ouvrir une démonstration appropriée, mais ne doit jamais simuler silencieusement une vraie transaction.

## 9.3. Analytics Dashboard Showcase

Prévois également un écran illustrant :
- plusieurs indicateurs ;
- des graphiques ;
- une liste d'activités ;
- une organisation cohérente de l'information ;
- les variantes de thème disponibles.

## 9.4. Organisation des showcases

Après l'audit, détermine le meilleur emplacement pour les showcases selon les conventions existantes.

Ils peuvent être des Templates de démonstration si le système actuel le permet proprement.

Cependant :
- un showcase ne doit pas devenir une dépendance obligatoire de chaque widget ;
- l'installation d'un widget ne doit pas installer automatiquement tous les showcases ;
- les exemples doivent être identifiés comme tels ;
- les ressources distribuées doivent pouvoir être utilisées indépendamment.

Le but est de montrer comment les widgets fonctionnent dans une application, pas de créer une application complète inutilement complexe.

---

# 10. Phase 6 — Thèmes, Liquid Glass et cohérence visuelle

Rashwright possède déjà ses propres composants, conventions visuelles et primitives Liquid Glass. Les nouveaux widgets doivent s'intégrer à cet environnement.

Inspecte les mécanismes réels de thème et de styles avant de décider de l'API visuelle.

Exigences :
- cohérence avec le système de thème existant ;
- respect du mode clair et du mode sombre ;
- couleurs configurables selon les conventions existantes ;
- prise en charge des composants Liquid Glass lorsque c'est pertinent ;
- absence de dépendance obligatoire à une bibliothèque de styles non utilisée par le projet ;
- absence de couleurs codées en dur lorsque le système de thème fournit déjà une solution adaptée ;
- gestion correcte des dimensions, des petits écrans et du contenu long ;
- prise en charge des textes et libellés dans différentes langues ;
- respect de l'accessibilité et des préférences de réduction des animations lorsqu'elles sont concernées.

N'impose pas un effet Liquid Glass à tous les widgets. Il doit s'agir d'une possibilité cohérente avec le design system, pas d'une obligation visuelle.

Ne modifie pas globalement le design system pour faciliter artificiellement l'implémentation des widgets.

---

# 11. Phase 7 — Architecture technique et qualité des widgets

## 11.1. Contrats TypeScript

Chaque widget doit posséder des types clairs et exportables conformément aux conventions du dépôt.

Évite :
- les types trop permissifs ;
- les propriétés impossibles à documenter ;
- les unions inutiles ;
- les dépendances à des modèles de données propres à une application ;
- les callbacks dont le comportement n'est pas défini ;
- les API excessivement complexes pour des besoins simples.

## 11.2. Responsabilités

Sépare correctement :
- la présentation ;
- les interactions ;
- les données fournies par l'application ;
- les éventuels calculs de présentation ;
- les intégrations externes.

Un widget ne doit pas importer directement un client API ou un contexte métier propre à un projet consommateur.

Il doit pouvoir être utilisé avec des données locales sans backend.

## 11.3. Performance

Évite les rendus et calculs inutiles, les animations excessives et les dépendances lourdes.

Ne rajoute pas de bibliothèque d'animation ou de gestes si les outils existants répondent déjà aux besoins.

N'optimise pas prématurément : privilégie une implémentation claire, mesurable et facile à maintenir.

## 11.4. Accessibilité

Vérifie notamment :
- les libellés accessibles ;
- les rôles et états des contrôles interactifs ;
- les tailles de zones tactiles ;
- le contraste ;
- la lisibilité des valeurs et des tendances ;
- les interactions clavier ou lecteur d'écran pertinentes ;
- les états désactivés ;
- l'absence de dépendance exclusive à la couleur pour transmettre une information.

## 11.5. Compatibilité

Vérifie les versions de React Native, Expo, TypeScript et les dépendances réellement prises en charge par le projet.

Ne mets pas arbitrairement à jour Expo, React Native ou les dépendances majeures pour faciliter le chantier.

Si une dépendance incompatible est découverte, documente le problème et propose une solution avant de modifier la matrice de compatibilité.

---

# 12. Phase 8 — Tests et validation du parcours de distribution

Les tests ne doivent pas se limiter au rendu des composants.

Le système doit être testé du point de vue du développeur qui installe les ressources dans une application externe.

## 12.1. Tests du moteur Widgets

Vérifie :
- la résolution d'un widget depuis le registry ;
- la validation de ses métadonnées ;
- la récupération de ses fichiers ;
- l'installation de ses dépendances ;
- la résolution de ses composants internes ;
- la gestion des fichiers déjà présents ;
- les conflits ;
- les dépendances manquantes ;
- les erreurs de téléchargement ou de configuration ;
- l'absence de dépendances circulaires ;
- la compatibilité avec les gestionnaires de paquets supportés.

## 12.2. Tests de non-régression

Vérifie que :
- l'initialisation fonctionne ;
- les composants existants s'installent toujours ;
- les Templates existants s'installent toujours ;
- les skills existants restent accessibles ;
- le registry continue de se valider ;
- les exports publics ne sont pas cassés ;
- le build et le typecheck fonctionnent ;
- les workflows CI existants restent compatibles.

## 12.3. Tests des widgets

Pour chaque widget, vérifie :
- le rendu minimal ;
- les propriétés facultatives ;
- les données manquantes ;
- les valeurs limites ;
- les interactions ;
- les états de chargement et les états vides, selon le widget ;
- le thème clair et sombre ;
- la compatibilité TypeScript ;
- les comportements accessibles.

## 12.4. Test de bout en bout

Crée ou utilise un projet de test conforme aux versions prises en charge.

Effectue un parcours réel :

1. Initialiser ou préparer le projet de test.
2. Installer un widget avec le CLI.
3. Vérifier les fichiers créés.
4. Vérifier les composants requis.
5. Vérifier les dépendances externes.
6. Utiliser le widget dans un écran.
7. Lancer le typecheck.
8. Lancer le build ou la validation adaptée.
9. Vérifier que le widget peut être personnalisé sans modifier le dépôt Rashwright.

Répète le parcours pour un widget simple, puis pour un widget comportant plusieurs dépendances.

Ne déclare jamais une installation fonctionnelle si elle n'a pas été réellement testée.

---

# 13. Organisation du travail en tâches

Après l'audit, construis un plan d'exécution structuré en phases et en tâches identifiables.

Chaque tâche doit préciser :
- son identifiant ;
- son objectif ;
- les fichiers ou modules concernés, lorsqu'ils sont connus ;
- ses prérequis ;
- les actions prévues ;
- les critères d'acceptation ;
- les tests associés ;
- les risques ;
- les dépendances avec les autres tâches ;
- le résultat attendu.

Le plan doit être assez détaillé pour suivre l'avancement et vérifier chaque étape.

Utilise une convention d'identifiants stable, par exemple :

```text
AUD-01  Audit du CLI et des Templates
AUD-02  Audit du registry
AUD-03  Audit des composants et des skills

ARC-01  Conception du modèle Widgets
ARC-02  Intégration au registry
CLI-01  Prise en charge des widgets par le CLI
CLI-02  Résolution des dépendances internes
CLI-03  Gestion des conflits et des erreurs

UI-01   Audit des composants nécessaires
UI-02   Améliorations des composants manquants

WGT-01  MetricWidget
WGT-02  ProgressWidget
WGT-03  QuickActionsWidget
WGT-04  ChartWidget
WGT-05  ActivityFeedWidget
WGT-06  FinanceWidget

SKL-01  Skills individuels
DOC-01  Documentation et exemples
SHW-01  Finance Dashboard Showcase
SHW-02  Analytics Dashboard Showcase

TST-01  Tests du moteur
TST-02  Tests des widgets
TST-03  Tests de non-régression
TST-04  Test d'installation externe
```

Cette liste est indicative. Adapte les tâches au dépôt après l'audit, ajoute les tâches nécessaires et supprime celles qui seraient redondantes.

Définis les dépendances entre tâches. Une tâche ne doit pas être marquée terminée sans satisfaire ses critères d'acceptation.

---

# 14. Règles de travail impératives

1. **Audit avant modification.** Ne modifie aucun fichier avant d'avoir présenté le rapport d'audit et le plan détaillé, puis obtenu mon accord.

2. **Plan avant code.** La première réponse attendue doit contenir les constatations, les décisions proposées, les tâches et les critères d'acceptation. Arrête-toi à ce stade.

3. **Pas d'architecture imaginaire.** Ne prétends pas qu'une fonctionnalité existe sans avoir vérifié son implémentation.

4. **Pas de doublons inutiles.** Réutilise les composants et mécanismes existants lorsqu'ils conviennent.

5. **Pas de refonte globale.** Limite les modifications au périmètre nécessaire, sauf si un problème structurel doit être signalé et approuvé.

6. **Pas de dépendances inutiles.** Toute nouvelle dépendance doit être justifiée et compatible avec l'environnement existant.

7. **Pas de dépendance à une application particulière.** Les widgets doivent être génériques et alimentés par les données de l'application consommatrice.

8. **Pas de modification destructive.** Ne supprime pas de ressources existantes, ne remplace pas silencieusement des fichiers et ne change pas les APIs publiques sans nécessité et justification.

9. **Tests réels.** Exécute les tests disponibles et ajoute ceux qui sont nécessaires. Signale honnêtement tout test impossible à exécuter.

10. **Pas de faux résultats.** Ne déclare pas un build, un test ou une installation réussi sans avoir obtenu le résultat correspondant.

11. **Pas de publication.** Ne publie aucun package npm, ne crée aucun tag Git, ne lance aucune release et ne déploie rien sans mon autorisation explicite.

12. **Pas de modifications non approuvées pendant l'audit.** Si un point nécessite une décision architecturale importante, présente les options et recommande la meilleure solution avant d'avancer.

13. **Documentation synchronisée.** Les README, skills, métadonnées du registry et exemples doivent correspondre au code réellement livré.

14. **Respect du dépôt.** Ne remplace pas les outils, conventions, gestionnaires de paquets ou workflows actuels sans raison démontrée.

---

# 15. Format de ta première réponse

Ta première réponse doit contenir exclusivement le travail de préparation nécessaire à la décision.

Présente les sections suivantes :

## A. État actuel du dépôt
Ce qui existe réellement, avec les chemins de fichiers importants et les mécanismes identifiés.

## B. Écart entre l'existant et l'objectif
Ce qui peut être réutilisé, ce qui manque et ce qui doit être adapté.

## C. Architecture proposée
Comment le moteur Widgets s'intégrera au CLI et au registry, et comment les composants, widgets, skills et showcases seront organisés.

## D. Plan de tâches détaillé
Liste ordonnée des tâches, dépendances, critères d'acceptation et tests.

## E. Risques et décisions
Les problèmes de compatibilité, les choix à valider et les solutions recommandées.

## F. Ordre d'implémentation
Les étapes concrètes, en commençant par le moteur du CLI, puis les composants nécessaires, ensuite les widgets de démonstration, les skills, les showcases et les tests.

## G. Validation attendue
Les commandes et scénarios qui permettront de démontrer que le système fonctionne réellement.

Termine en indiquant clairement que tu attends mon accord sur le plan avant de commencer l'implémentation.

**Ne commence pas le développement dans cette première étape.**

---

# 16. Critère final de réussite

Le chantier sera réussi lorsque Rashwright UI Mobile disposera d'un mécanisme de widgets propre, documenté, testé et compatible avec le système existant.

Un développeur devra pouvoir, par exemple :

```bash
rs-ui add metric-widget
```

Puis utiliser le widget dans son application en important les fichiers installés, sans dépendre du dépôt Rashwright au moment de l'exécution.

Il devra également pouvoir consulter le skill associé, comprendre l'API, personnaliser le widget et observer son utilisation dans un showcase.

Le système devra permettre d'ajouter ultérieurement d'autres widgets sans réécrire le moteur.

**La priorité n'est pas d'obtenir rapidement six cartes visuellement réussies. La priorité est de construire le moteur de distribution correctement, puis de prouver sa qualité avec des widgets représentatifs.**

Commence maintenant par l'audit du dépôt et la préparation du plan. Ne modifie aucun code avant mon approbation.