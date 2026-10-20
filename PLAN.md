# PLAN STRATÉGIQUE & ROADMAP D'ÉVOLUTION — Rashwright UI Mobile (v1.1.0 → v1.6.0)

> **Document de référence stratégique et technique.**  
> Dernière mise à jour : 2026-10-20  
> Statut : **v1.5.0 Validée & Prête pour Publication** — 79 composants (dont 11 nouveaux utilitaires mobiles), 10 templates autonomes (Auth, Commerce, Onboarding, Dashboard, Settings, Showcase, Minimal, Chat, Finance, Social), WCAG 2.1 AA accessibilité, fix NativeWind v5 `--legacy-peer-deps`, architecture.md formalisée, Phase 7 specs écrans Expo, 227 tests Vitest réussis (Quality Gate 100% vert). Jalon suivant : **v1.6.0 — Moteur de Widgets Modulaires**.

---

## 0. Bilan de l'Écosystème & Diagnostic des Manques Actuels

L'architecture actuelle de Rashwright UI Mobile a atteint une robustesse de niveau production :
- Le modèle **shadcn/ui adapté à React Native / Expo** est totalement fonctionnel.
- Le **Component-Detector** garantit qu'aucune dépendance (interne ou externe) n'est oubliée lors de l'ajout d'un composant ou template.
- Les **7 templates autonomes** offrent une base UI haut de gamme et personnalisable.
- Le **Serveur MCP** connecte directement les IDEs IA au registre.

Cependant, l'analyse approfondie de l'écosystème met en lumière **5 axes majeurs où des manques subsistent** pour rivaliser avec les plus grands design systems du marché :

```text
┌────────────────────────────────────────────────────────────────────────┐
│             BILAN DES BESOINS & FONCTIONNALITÉS MANQUANTES             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Composants Mobiles Clés Inexistants                                │
│    - DatePicker / Calendar (réservations, formulaires, planning)      │
│    - SwipeableRow (gestes swipe to action : delete, archive, pin)     │
│    - SegmentedControl (sélecteur d'onglets pill fluide universel)      │
│    - Tooltip / Popover (positionnement contextuel flottant)           │
│    - Shimmer / Skeleton automatique pour toutes les cartes et listes  │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Templates Métiers Spécialisés Manquants                            │
│    - Template "Chat & Messaging" (messagerie instantanée, bulles)     │
│    - Template "Finance & Crypto" (portefeuille, graphiques, transferts)│
│    - Template "Social & Community" (fil d'actualité, likes, stories)  │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Gestionnaire de Cycle de Vie CLI (Mise à jour & Synchronisation)    │
│    - Commande `rs-ui upgrade` / `rs-ui update` (détection de version)  │
│    - 3-Way Merge ou protection différentielle des personnalisations   │
│    - Réécriture chirurgicale des alias (AST Transformers ts-morph)    │
│    - Commandes `rs-ui template list` et `rs-ui template info <id>`    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Intelligence Artificielle & Serveur MCP Avancé                     │
│    - Outil MCP `generate_screen` (composition d'écran assistée par IA)│
│    - Outil MCP `audit_accessibility` (audit automatique ARIA TalkBack) │
│    - Outil MCP `convert_styling` (conversion StyleSheet ↔ NativeWind) │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Visualisation Interactive & Tests E2E Mobile                       │
│    - Documentation interactive Storybook Mobile / Expo Web Showcase    │
│    - Tests end-to-end automatisés Maestro / simulateurs               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. AXE 1 : COMPOSANTS MOBILES ESSENTIELS MANQUANTS (Roadmap v1.1.0)

### 1.1 `Calendar` & `DatePicker` Mobiles
- **Problème** : Aucun composant de sélection de date ou plage de dates n'existe dans le catalogue. Les formulaires de réservation (commerce, hôtel, transport, analytics) doivent recourir à des dépendances tierces non unifiées.
- **Spécifications** :
  - `Calendar` : Vue calendrier mensuelle fluide avec sélection de date unique ou plage (`mode="single" | "range" | "multiple"`).
  - `DatePicker` : Modal bottom-sheet ou inline avec roue ou grille calendaire, support de la localisation (français par défaut), dates minimales/maximales, dates désactivées.
  - Support natif du thème actif et variante Liquid Glass.

### 1.2 `SwipeableRow` (Actions Tactiles de Balayage)
- **Problème** : Le geste de swipe latéral (glisser pour supprimer, archiver, marquer lu) est une convention incontournable du mobile iOS et Android.
- **Spécifications** :
  - Basé sur `react-native-gesture-handler` et `react-native-reanimated`.
  - Props `renderLeftActions` et `renderRightActions`.
  - Déclenchement automatique de retour haptique (`expo-haptics`) lors du dépassement du seuil de swipe.
  - Fermeture automatique au tap extérieur ou lors du défilement de la liste parente.

### 1.3 `SegmentedControl` Universel
- **Problème** : Les sélecteurs à segments sont actuellement codés ad-hoc dans certains templates (Settings, Dashboard).
- **Spécifications** :
  - Capsule animée par ressort (`withSpring`) qui glisse derrière le segment sélectionné.
  - Support de 2 à 5 options, avec icônes optionnelles et badges de notification.
  - Support de l'accessibilité WAI-ARIA (`accessibilityRole="tablist"` et `tab`).

### 1.4 `Tooltip` & `Popover` Contextuels
- **Problème** : Pas de mécanisme pour afficher une infobulle d'aide ou un menu contextuel ancré à un bouton ou une icône.
- **Spécifications** :
  - Mesure automatique des coordonnées dans la fenêtre (`measureInWindow`).
  - Détection automatique du débordement d'écran (flip haut/bas, gauche/droite).
  - Fond Liquid Glass avec flèche d'ancrage.

### 1.5 `ShimmerSkeleton` Automatique
- **Problème** : Les états de chargement sont souvent statiques ou nécessitent un codage manuel.
- **Spécifications** :
  - Balayage lumineux continu avec `LinearGradient` et `react-native-reanimated`.
  - Presets prêts à l'emploi : `Skeleton.Card`, `Skeleton.Avatar`, `Skeleton.Text`, `Skeleton.Row`.

---

## 2. AXE 2 : NOUVEAUX TEMPLATES MÉTIERS SPÉCIALISÉS (Roadmap v1.2.0)

### 2.1 Template `chat` (Messagerie Instantanée)
- **Contenu** :
  - Écran de conversation avec liste de messages inversée (`inverted`), bulles utilisateur / interlocuteur stylées en Liquid Glass.
  - Barre de saisie avec attachement de fichiers/photos (intégré à `lib/upload/`), bouton d'envoi et emoji picker.
  - En-tête avec avatar, statut en ligne et actions d'appel/paramètres.

### 2.2 Template `finance` (Portefeuille & Banque Mobile)
- **Contenu** :
  - Solde global avec switch de visibilité (œil masquer/afficher).
  - Graphique linéaire de performance interactif.
  - Liste des transactions récentes avec catégories colorées et montants formatés.
  - Raccourcis d'actions : Virement, Recharger, Convertir, Carte virtuelle.

### 2.3 Template `social` (Fil d'Actualité & Communauté)
- **Contenu** :
  - Feed défilant avec stories en haut (cercles avec bordure dégradée).
  - Cartes de publications avec carrousel médias, bouton de like animé, commentaires et partage.
  - Barre d'onglets de navigation persistante avec badge de notifications.

---

## 3. AXE 3 : GESTION DU CYCLE DE VIE CLI & AST TRANSFORMERS (Roadmap v1.3.0)

### 3.1 Commande `rs-ui upgrade` / `rs-ui update`
- **Fonctionnalités** :
  - Analyse du fichier `rashwright-ui.lock` pour comparer les versions des composants installés avec la dernière version du registre.
  - Affichage d'un tableau synthétique des mises à jour disponibles.
  - Mode interactif pour choisir les composants à actualiser.
  - Intégration de la commande `rs-ui diff` avant validation pour prévisualiser les changements.
  - Sauvegarde automatique de secours dans `.rashwright/backups/` avant toute mise à jour.

### 3.2 AST Transformers (Réécriture d'Alias Intelligente)
- **Fonctionnalités** :
  - Si le projet cible utilise `~/components` au lieu de `@/components`, ou `src/ui/` au lieu de `src/components/ui/`, le CLI réécrit automatiquement les imports dans le code copié grâce à l'AST TypeScript.
  - Zéro rupture d'import quel que soit le setup du projet cible.

### 3.3 Commandes Template Dédiées
- `rs-ui template list` : Liste visuelle complète des 7+ templates disponibles avec description, captures d'écran terminal et composants requis.
- `rs-ui template help` : Guide interactif pour démarrer rapidement avec les templates.
- `rs-ui template remove <id>` : Nettoyage propre d'un template installé sans supprimer les primitives partagées.

---

## 4. AXE 4 : INTELLIGENCE ARTIFICIELLE & SERVEUR MCP AVANCÉ (Roadmap v1.4.0)

### 4.1 Outil MCP `generate_screen`
- **Objectif** : Permettre à Cursor, Claude Desktop et VS Code de générer des écrans mobiles complets répondant exactement aux besoins exprimés en langage naturel.
- **Comportement** :
  - L'agent IA invoque `generate_screen({ prompt, templateContext, styleEngine })`.
  - Le serveur MCP assemble les composants Rashwright appropriés, applique les tokens de thème actifs, et garantit la réactivité aux breakpoints mobiles.

### 4.2 Outil MCP `audit_accessibility`
- **Objectif** : Analyser le code source d'un écran ou composant et signaler toutes les anomalies d'accessibilité mobile (manque d'`accessibilityLabel`, contraste insuffisant, zones de frappe inférieures à 44x44 points).

### 4.3 Outil MCP `convert_styling`
- **Objectif** : Traduction automatique bidirectionnelle entre `StyleSheet.create` et classes NativeWind Tailwind.

---

## 5. AXE 5 : STORYBOOK MOBILE & TESTS E2E MAESTRO (Roadmap v1.5.0)

### 5.1 Showcase Interactif Web / Mobile (Storybook)
- Environnement dédié permettant de manipuler tous les composants, de tester leurs variantes (Default, Bordered, Glass), leurs états (Loading, Disabled, Error) et de prévisualiser les 9 thèmes en temps réel.

### 5.2 Tests End-to-End Automatisés (Maestro)
- Scénarios d'automatisation sur émulateurs Android et iOS :
  - Test du flow d'authentification (connexion, Google Auth, saisie OTP).
  - Test du catalogue commerce (recherche, filtres, ajout panier, détail produit).
  - Test du changement de mode d'apparence (Système → Clair → Sombre) et persistance dans le store.

---

## 6. Calendrier des Jalons
 
| Version | Objectifs Clés | Statut |
|---|---|:---:|
| **v1.0.1** | SDK 58, Dark Mode NativeWind fix, Templates Premium, ThemedView autonome | ✅ **Publiée** |
| **v1.1.0** | Nouveaux Composants Mobiles (`calendar`, `swipeable-row`, `segmented-control`, `tooltip`) | ✅ **Publiée** |
| **v1.2.0** | Nouveaux Templates Métiers (`chat`, `finance`, `social`) + Cycle de vie (`rs-ui upgrade`, 3-way merge) | ✅ **Publiée** |
| **v1.3.0** | Showcase interactif Storybook (`rs-ui showcase`) et tests E2E Maestro (6 flows) | ✅ **Publiée** |
| **v1.4.0** | Commande `rs-ui fix` (auto-remédiation), 68 composants (`command`, `color-picker`, `navigation-menu`), code preview | ✅ **Publiée** |
| **v1.5.0** | 79 composants (11 nouveaux utilitaires), WCAG 2.1 AA accessibilité, fix NativeWind v5 npm, architecture.md formalisée, specs Phase 7 écrans Expo, 227 tests | ✅ **Prête pour npm** |
| **v1.6.0** | Architecture et Moteur de Widgets Modulaires (`rs-ui add --widget`), premier catalogue (Metric, Progress, QuickActions, Chart, ActivityFeed, Finance), skills et dashboards | ⏳ **En cours (Phase 0 Audit & Plan)** |
