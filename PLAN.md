# PLAN STRATÉGIQUE & ROADMAP D'ÉVOLUTION — Rashwright UI Mobile (v1.6.0 → v2.0.0)

> **Document de référence stratégique et technique.**  
> Dernière mise à jour : 2026-10-21  
> Statut : **v1.6.0 Validée & Prête pour Publication** — Moteur de Widgets Modulaires & Distribuables, 6 widgets officiels (`MetricWidget`, `ProgressWidget`, `QuickActionsWidget`, `ChartWidget`, `ActivityFeedWidget`, `FinanceWidget`), 2 Showcases d'intégration (`FinanceDashboardShowcase`, `AnalyticsDashboardShowcase`), commandes CLI dédiées (`rs-ui widget`, `rs-ui add -w`), 79 composants atomiques, 10 templates autonomes, WCAG 2.1 AA accessibilité, 245 tests Vitest réussis (51 suites, 100% vert), Quality Gate complet.

---

## 0. Bilan de l'Écosystème & Fondations v1.6.0

L'architecture de distribution de code source de Rashwright UI Mobile a atteint une maturité exceptionnelle :
- Le modèle **shadcn/ui appliqué à React Native & Expo** garantit la pleine propriété du code par le développeur.
- Le **Component-Detector** résout de façon récursive et transparente toutes les dépendances transitives (internes, natives Expo, utilitaires).
- Les **79 composants atomiques** couvrent l'intégralité des besoins standards de formulaires, navigation, mise en page et feedbacks.
- Les **10 templates autonomes** fournissent des squelettes d'applications clés en main (`auth`, `commerce`, `dashboard`, `settings`, `chat`, `finance`, `social`...).
- Les **6 widgets modulaires** permettent d'assembler des briques métiers riches sans alourdir la codebase.
- Le **Serveur MCP IA** et les **Skills IA contextuels** connectent nativement les assistants de code (Cursor, Claude, Antigravity, VS Code) à l'écosystème.

```text
┌────────────────────────────────────────────────────────────────────────┐
│             NOUVELLE VISION STRATÉGIQUE DU MOTEUR DISTRIBUTEUR         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Écrans Systèmes Expo Prêts à l'Emploi (v1.7.0)                     │
│    - Écrans d'intégration matérielle & permissions natives             │
│    - Biométrie, QR Scanner, Permissions, Téléchargement, MapView       │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Moteur de Widgets V2 & Tableaux de Bord Composables (v1.8.0)        │
│    - WidgetGrid adaptatif avec Drag & Drop et réordonnancement tactile │
│    - 6 nouveaux widgets (Calendar, Weather, AudioPlayer, DeviceStatus) │
│    - Persistance locale d'état et disposition (useWidgetStorage)       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Registres Distants Privés & Partage Communautaire (v1.9.0)          │
│    - Registres d'équipe / entreprise sécurisés (Git / S3 / HTTP)       │
│    - Commandes `rs-ui package` et `rs-ui export` pour créateurs tiers  │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Rashwright Studio & Expo SDK 59 (v2.0.0)                            │
│    - Interface Web locale (Studio GUI) pour prévisualisation et config │
│    - Constructeur visuel d'écrans par drag & drop                      │
│    - Support officiel Expo SDK 59 et React 19                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. AXE 1 : MOTEUR D'ÉCRANS SYSTÈMES & INTÉGRATIONS EXPO (Roadmap v1.7.0)

Les applications modernes nécessitent fréquemment des écrans systèmes complexes interagissant directement avec le matériel ou les permissions natives. Au lieu de laisser le développeur réinventer ces flux, le moteur distributeur proposera des écrans complets distribuables via `rs-ui add screen:<id>` ou `rs-ui screen add <id>`.

### 1.1 Écrans Matériels & Sécurité
- **`BiometricAuthScreen`** :
  - Authentification biométrique (Face ID, Touch ID, capteur d'empreintes) via `expo-local-authentication`.
  - Fallback automatique par code PIN / mot de passe, états d'erreur sécurisés, vibrations haptiques et interface Liquid Glass.
- **`PermissionGateScreen`** :
  - Écran d'onboarding de permissions unifié (Caméra, Micro, Géolocalisation, Notifications, Photothèque).
  - Gestion de l'état refusé avec guidage vers les paramètres système de l'OS (`expo-linking`).
- **`QRScannerScreen`** :
  - Scanner de codes QR et codes-barres fluide avec `expo-camera`.
  - Réticule de visée animé, bascule de lampe torche, sélection d'image depuis la galerie et retour haptique immédiat à la détection.

### 1.2 Écrans de Données & Média
- **`FileDownloaderScreen`** :
  - Gestionnaire de téléchargement basé sur `expo-file-system`.
  - Jauge de progression en pourcentage, reprise sur interruption, mise en cache locale et partage via `expo-sharing`.
- **`DocumentPickerScreen`** :
  - Sélecteur et gestionnaire de pièces jointes (PDF, DOCX, images) via `expo-document-picker`.
  - Prévisualisation locale et validation de taille/format avant envoi.
- **`MapViewScreen`** :
  - Carte interactive avec `react-native-maps`, géolocalisation en temps réel (`expo-location`), points d'intérêt personnalisés et cartes d'info Liquid Glass.

---

## 2. AXE 2 : MOTEUR DE WIDGETS V2 & TABLEAUX DE BORD COMPOSABLES (Roadmap v1.8.0)

La version 1.6.0 a posé les fondations des widgets modulaires autonomes. La v1.8.0 transformera ces widgets en un système de tableau de bord entièrement interactif et composable.

### 2.1 Conteneur `WidgetGrid` & Réordonnancement Tactile
- **Grille Adaptative Multi-Colonnes** :
  - Calcul dynamique de colonnes selon le breakpoint de l'appareil (1 col sur smartphone, 2-3 col sur tablette).
  - Gestion des largeurs de widgets : demi-largeur (`span: 1`) ou pleine largeur (`span: 2`).
- **Mode Réordonnancement (Drag & Drop)** :
  - Appui long pour entrer en mode édition (wiggle effect subtil).
  - Réorganisation fluide animée par Reanimated avec retour haptique.
- **Persistance d'état locale (`useWidgetStorage`)** :
  - Sauvegarde de l'ordre personnalisé des widgets et de leurs options dans `@react-native-async-storage/async-storage`.

### 2.2 Catalogue de 6 Nouveaux Widgets Métiers
1. **`CalendarWidget`** (`widgets/calendar`) :
   - Calendrier compact hebdomadaire ou mensuel avec indicateurs d'événements, sélection tactile et rappel du prochain rendez-vous.
2. **`WeatherWidget`** (`widgets/weather`) :
   - Météo locale en temps réel (température, météo ressentie, vent, humidité) avec icônes animées et arrière-plan Liquid Glass adaptatif au climat.
3. **`AudioPlayerWidget`** (`widgets/audio-player`) :
   - Mini-lecteur audio/podcast avec pochette, titre défilant, boutons play/pause/skip et spectre sonore animé.
4. **`DeviceStatusWidget`** (`widgets/device-status`) :
   - Diagnostic condensé de l'appareil : niveau de batterie (`expo-battery`), statut de connexion Wi-Fi/Cellulaire (`expo-network`) et mémoire disponible.
5. **`TimerStopwatchWidget`** (`widgets/timer`) :
   - Minuteur et chronomètre tactile avec tours (laps) et déclencheur d'alerte.
6. **`NotificationCenterWidget`** (`widgets/notifications`) :
   - Centre de notifications in-app condensé avec regroupement par catégories et geste de balayage pour acquitter.

---

## 3. AXE 3 : REGISTRES DISTANTS PRIVÉS & PARTAGE D'ÉQUIPE (Roadmap v1.9.0)

Pour les entreprises et les équipes multi-projets, Rashwright doit permettre de distribuer des bibliothèques de composants et widgets internes sans passer par npm public.

### 3.1 Multi-Registres Distants Sécurisés
- Configuration de registres privés dans `rashwright-ui.json` :
  ```json
  {
    "registries": {
      "internal": {
        "url": "https://raw.githubusercontent.com/my-org/my-ui-registry/main",
        "auth": "BEARER_TOKEN"
      }
    }
  }
  ```
- Installation transparente avec préfixe de namespace :
  ```bash
  rs-ui add @internal/payment-card
  rs-ui widget add @internal/kyc-status
  ```

### 3.2 Commandes de Packaging et d'Export
- **`rs-ui package <component|widget>`** :
  - Valide automatiquement la conformité du composant/widget (zéro any, présence du skill, props typées) et génère son fichier de métadonnées JSON prêt pour un registre.
- **`rs-ui export`** :
  - Compile un ensemble de composants locaux vers un sous-dossier ou une archive distribuable.

---

## 4. AXE 4 : RASHWRIGHT STUDIO & EXPO SDK 59 (Roadmap v2.0.0)

### 4.1 Rashwright Studio (`rs-ui studio`)
- Serveur de développement web local autonome déclenché par une simple commande :
  ```bash
  rs-ui studio --port 4200
  ```
- **Fonctionnalités du Studio** :
  - **Galerie Interactive** : Visualisation en direct des 79 composants, des widgets et des templates avec simulateur de tailles d'écrans (iPhone, Pixel, iPad).
  - **Theme Customizer Visuel** : Éditeur de palette de couleurs, curseurs de flou et transparence Liquid Glass, avec injection en temps réel dans `theme/tokens.ts`.
  - **Générateur d'Écrans Visuel** : Assemblage d'écrans par glisser-déposer de widgets et de composants, avec génération instantanée du code TSX propre copié dans `src/app/`.

### 4.2 Support Expo SDK 59 & React 19 Strict Mode
- Validation complète et matrices de dépendances pour Expo SDK 59.
- Alignement avec les nouveautés de React 19 (Server Actions sur mobile, transitions asynchrones).

---

## 5. Calendrier des Jalons

| Version | Objectifs Clés | Statut |
|---|---|:---:|
| **v1.0.1** | SDK 58, Dark Mode NativeWind fix, Templates Premium, ThemedView autonome | ✅ **Publiée** |
| **v1.1.0** | Nouveaux Composants Mobiles (`calendar`, `swipeable-row`, `segmented-control`, `tooltip`) | ✅ **Publiée** |
| **v1.2.0** | Nouveaux Templates Métiers (`chat`, `finance`, `social`) + Cycle de vie (`rs-ui upgrade`, 3-way merge) | ✅ **Publiée** |
| **v1.3.0** | Showcase interactif Storybook (`rs-ui showcase`) et tests E2E Maestro (6 flows) | ✅ **Publiée** |
| **v1.4.0** | Commande `rs-ui fix` (auto-remédiation), 68 composants (`command`, `color-picker`, `navigation-menu`), code preview | ✅ **Publiée** |
| **v1.5.0** | 79 composants (11 nouveaux utilitaires mobiles), WCAG 2.1 AA accessibilité, fix NativeWind v5 npm, architecture.md formalisée, specs Phase 7, 227 tests | ✅ **Publiée** |
| **v1.6.0** | Moteur de Widgets Modulaires (`rs-ui widget`, `rs-ui add -w`), 6 widgets officiels, 2 Showcases, lockfile SHA-256, 245 tests | ✅ **Publiée & Tagguée** |
| **v1.7.0** | Moteur d'Écrans Systèmes Expo (`rs-ui add screen:<id>`), Biométrie, Permissions, QR Scanner, Download, MapView | 📋 **Planifiée** |
| **v1.8.0** | Moteur de Widgets V2 : WidgetGrid adaptatif avec Drag & Drop tactile, 6 nouveaux widgets, persistance locale | 📋 **Planifiée** |
| **v1.9.0** | Registres Distants Privés (`rs-ui registry add`), Packaging & Export (`rs-ui package`), Cloud Sync | 📋 **Planifiée** |
| **v2.0.0** | Rashwright Studio GUI (`rs-ui studio`), Constructeur visuel d'écrans, Support Expo SDK 59 & React 19 | 📋 **Planifiée** |
